/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

class AudioManager {

    #spatialRelations;

    constructor (engine) {
        this.engine = engine;
        this.context = null;
        this.masterGain = null;
        this.initialized = false;
        this.#spatialRelations = new Map();
        this.pendingPlayRequests = new Map();

        // Audio Settings
        this.masterVolume = 1;
        this.categoryVolumes = new Map();
        this.muted = false;

        // Audio Instances
        /**
         * Map<string, Array<{
         *   source: AudioBufferSourceNode,
         *   gainNode: GainNode,
         *   panNode: StereoPannerNode|null,
         *   category: string,
         *   spatialPosition: [number, number],
         *   maxInstances: number,
         *   fadeInTime: number,
         *   fadeOutTime: number,
         *   playing: boolean,
         *   startTime: number,
         *   pausedAt: number|null,
         *   options: object
         * }>>
         */
        this.instances = new Map();

        // Categories
        this.categoryNodes = new Map();
        this.categories = ['master', 'music', 'sfx', 'voice'];

        this.#initialize();
    }

    async #initialize () {
        if (this.initialized) return true;
        try {
            if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
                this.engine.warn('Web Audio API is not supported in this environment');
                return false;
            }
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.context.destination);
            this.#initializeCategories();

            if (typeof document !== 'undefined') {
                await this.#waitForUserInteraction();
            }
            this.initialized = true;
            return true;
        } catch (error) {
            this.engine.error('Failed to initialize AudioManager:', error);
            return false;
        }
    }

    #initializeCategories () {
        this.categories.forEach(category => {
            const gainNode = this.context.createGain();
            gainNode.gain.value = 1;
            gainNode.connect(this.masterGain);
            this.categoryNodes.set(category, gainNode);
            this.categoryVolumes.set(category, 1);
        });
    }

    async #waitForUserInteraction () {
        return new Promise(resolve => {
            const resumeOnInteraction = async () => {
                await this.context.resume();
                ['click', 'touchstart', 'keydown'].forEach(event => {
                    document.removeEventListener(event, resumeOnInteraction);
                });
                resolve();
            };
            ['click', 'touchstart', 'keydown'].forEach(event => {
                document.addEventListener(event, resumeOnInteraction);
            });
        });
    }

    #createAudioInstance (assetBuffer, options = {}) {
        const source = this.context.createBufferSource();
        source.buffer = assetBuffer;
        source.loop = options.loop ?? false;
        source.playbackRate.value = options.playbackRate || 1;

        const gainNode = this.context.createGain();
        gainNode.gain.value = (options.volume !== undefined ? options.volume : 1);

        const panNode = this.context.createStereoPanner ? this.context.createStereoPanner() : null;
        if (panNode) {
            panNode.pan.value = 0;
            source.connect(gainNode);
            gainNode.connect(panNode);
        } else {
            source.connect(gainNode);
        }

        const category = options.category || 'master';
        const categoryNode = this.categoryNodes.get(category);
        if (panNode) {
            panNode.connect(categoryNode || this.masterGain);
        } else {
            gainNode.connect(categoryNode || this.masterGain);
        }

        return {
            source,
            gainNode,
            panNode,
            category,
            spatialPosition: options.position || [0, 0],
            maxInstances: options.maxInstances || 1,
            fadeInTime: options.fadeIn || 0,
            fadeOutTime: options.fadeOut || 0,
            playing: false,
            startTime: 0,
            pausedAt: null,
            options: {...options}
        };
    }

    _update () {
        this.#updateSpatialPositions();
    }

    async startPlayback () {
        if (!this.initialized) {
            const success = await this.#initialize();
            if (!success) return;
        }
        for (const [id, {options, asset}] of this.pendingPlayRequests) {
            await this.play(id, options);
        }
        this.pendingPlayRequests.clear();
    }

    /** ======== CONTROLS ======== */
    async play (id, options = {}) {
        const asset = this.engine.getAsset(id);
        if (!asset || asset.type !== 'audio') return null;

        if (!this.initialized) {
            this.pendingPlayRequests.set(id, {options, asset});
            return null;
        }

        // Check maxInstances logic: if exceeded, do not play new
        const instances = this.instances.get(id) || [];
        const maxInstances = options.maxInstances || asset.config?.maxInstances || 1;
        const playingCount = instances.filter(inst => inst.playing).length;
        if (playingCount >= maxInstances) {
            return null;
        }

        // Create instance
        const instance = this.#createAudioInstance(asset.asset, {...asset.config, ...options});

        // Fade-in support
        if (instance.fadeInTime > 0) {
            instance.gainNode.gain.setValueAtTime(0, this.context.currentTime);
            instance.gainNode.gain.linearRampToValueAtTime(
                options.volume || asset.config.volume || 1,
                this.context.currentTime + instance.fadeInTime / 1000
            );
        }

        instance.source.onended = () => {
            instance.playing = false;
        };

        // Start from beginning (or resume if previously paused)
        instance.source.start(0);
        instance.playing = true;
        instance.startTime = this.context.currentTime;
        instance.pausedAt = null;

        // Add to instances if not present
        instances.push(instance);
        this.instances.set(id, instances);

        return instance;
    }
    stop (id) {
        const instances = this.instances.get(id);
        if (!instances) return;
        instances.forEach(instance => {
            if (instance.playing) {
                if (instance.fadeOutTime > 0) {
                    instance.gainNode.gain.linearRampToValueAtTime(
                        0,
                        this.context.currentTime + instance.fadeOutTime / 1000
                    );
                    setTimeout(() => {
                        try {
                            instance.source.stop();
                        } catch {
                        }
                        instance.playing = false;
                        instance.pausedAt = null;
                    }, instance.fadeOutTime);
                } else {
                    try {
                        instance.source.stop();
                    } catch {
                    }
                    instance.playing = false;
                    instance.pausedAt = null;
                }
            }
        });
    }
    pause (id) {
        const instances = this.instances.get(id);
        if (!instances) return;
        instances.forEach(instance => {
            if (instance.playing) {
                try {
                    instance.source.stop();
                } catch {
                }
                instance.pausedAt = this.context.currentTime - instance.startTime;
                instance.playing = false;
            }
        });
    }
    resume (id) {
        const asset = this.engine.getAsset(id);
        const instances = this.instances.get(id);
        if (!asset || !instances) return;

        instances.forEach((instance, idx) => {
            if (!instance.playing && instance.pausedAt != null) {
                // Create new source node and resume from pausedAt
                const newInstance = this.#createAudioInstance(asset.asset, {
                    ...asset.config,
                    ...instance.options
                });
                newInstance.source.onended = () => {
                    newInstance.playing = false;
                };
                try {
                    newInstance.source.start(0, instance.pausedAt);
                } catch {
                }
                newInstance.playing = true;
                newInstance.startTime = this.context.currentTime - instance.pausedAt;
                newInstance.pausedAt = null;

                // Replace old instance with new one (preserve array order)
                instances[idx] = newInstance;
            }
        });
        this.instances.set(id, instances);
    }
    /** ======== END ======== */

    /** ======== VOLUME ======== */
    setVolume (id, volume) {
        if (volume > 1)
            return;

        const instances = this.instances.get(id);
        if (!instances) return;

        instances.forEach(instance => {
            instance.gainNode.gain.value = volume;
            instance.options.volume = volume;
        });
    }
    setMasterVolume (volume) {
        this.masterVolume = volume;
        this.masterGain.gain.value = volume;
    }
    setCategoryVolume (category, volume) {
        const node = this.categoryNodes.get(category);
        if (node) {
            this.categoryVolumes.set(category, volume);
            node.gain.value = volume;
        }
    }
    /** ======== END ======== */

    /** ======== SPATIAL ======== */
    setSpatialPosition (id, position) {
        const instances = this.instances.get(id);
        if (!instances) return;
        instances.forEach(instance => this.updateSpatialPosition(instance, position));
    }
    updateSpatialPosition (instance, [x, y]) {
        if (!instance.panNode) return;

        const screenWidth = this.engine.baseWidth;
        const screenHeight = this.engine.baseHeight;
        const normalizedX = (x / screenWidth) * 2 - 1;

        instance.panNode.pan.value = Math.max(-1, Math.min(1, normalizedX));

        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt((screenWidth / 2) ** 2 + (screenHeight / 2) ** 2);
        const volume = 1 - (distance / maxDistance);

        instance.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
    setSpatialRelation (id, entity1, entity2, options = {}) {
        if (!this.engine.isEntity(entity1) || !this.engine.isEntity(entity2))
            throw new Error('entity1 and entity2 must be instances of Entity');

        this.#spatialRelations.set(id, {
            entity1, entity2, options
        });
    }
    #updateSpatialPositions () {
        this.#spatialRelations.forEach((item, id) => {
            const {maxDistance = 400, curve} = item.options;
            const [x1, y1] = [item.entity1.absoluteX, item.entity1.absoluteY];
            const [x2, y2] = [item.entity2.absoluteX, item.entity2.absoluteY];

            // Calculating Euclidean distance
            const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

            // Calculating sound volume based on distance
            let volume;
            if (distance >= maxDistance) {
                volume = 0;
            } else {
                // If the user has a curved function
                if (typeof curve === "function") {
                    volume = curve(distance / maxDistance);
                } else {
                    // Default: 2nd degree curve
                    volume = 1 - (distance / maxDistance);
                    volume = volume * volume;
                }
            }

            // Setting spatial position and volume
            this.setSpatialPosition(id, [x2, y2]);
            this.setVolume(id, volume);
        });
    }
    /** ======== END ======== */

    /** ======== STATUS ======== */
    isPlaying (id) {
        const instances = this.instances.get(id);
        return instances?.some(instance => instance.playing) ?? false;
    }
    getDuration (id) {
        const asset = this.engine.getAsset(id);
        return asset?.asset.duration ?? 0;
    }
    getCurrentTime (id) {
        const instances = this.instances.get(id);
        if (!instances || !instances[0] || !instances[0].playing) return 0;
        return this.context.currentTime - instances[0].startTime;
    }
    getState () {
        return {
            initialized: this.initialized,
            contextState: this.context?.state || 'not created',
            masterVolume: this.masterVolume,
            muted: this.muted,
            activeInstances: Array.from(this.instances.entries()).map(([id, instances]) => ({
                id,
                count: instances.length,
                playing: instances.some(i => i.playing)
            }))
        };
    }
    /** ======== END ======== */

    /** ======== BATCH OPERATION ======== */
    muteAll () {
        this.muted = true;
        this.masterGain.gain.value = 0;
    }
    unmuteAll () {
        this.muted = false;
        this.masterGain.gain.value = this.masterVolume;
    }
    pauseAll () {
        for (const [id] of this.instances) {
            this.pause(id);
        }
    }
    resumeAll () {
        for (const [id] of this.instances) {
            this.resume(id);
        }
    }
    stopAll () {
        for (const [id] of this.instances) {
            this.stop(id);
        }
    }
    /** ======== END ======== */

    /** ======== CLEANUP ======== */
    cleanup () {
        this.instances.forEach(instances => {
            instances.forEach(instance => {
                try {
                    instance.source.stop();
                    instance.gainNode.disconnect();
                    if (instance.panNode) instance.panNode.disconnect();
                } catch {}
            });
        });

        this.instances.clear();
        this.categoryNodes.forEach(node => node.disconnect());
        this.categoryNodes.clear();
        this.#spatialRelations.clear();

        try {
            if (this.masterGain)
                this.masterGain.disconnect();

            if (this.context)
                this.context.close();
        } catch (e) {
            this.engine.error('Failed to cleanup', e.message);
        }
    }
    /** ======== END ======== */

}

export default AudioManager;