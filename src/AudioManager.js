/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */
class AudioManager {

    constructor (worker_id) {
        this.assets = new Map();
        this.workerID = worker_id;
        this.isWorker = typeof importScripts !== 'undefined' && typeof DedicatedWorkerGlobalScope !== 'undefined';
        this.instances = new Map();
        this.assetInstances = new Map(); // Track instances by asset ID for faster lookup
        this.listener = null;
        this.masterVolume = 1;
        this.nextInstanceId = 0;

        if (!this.isWorker) {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
                this.listener = this.context.listener;
                this._initSpatialAudio();
            } catch (e) {
                this.error(e)
            }
        }
    }

    async load (id, src, config) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_load', args: [id, src, config]});
            return;
        }

        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(src, {
                    mode: 'cors', ...(config.fetch || {})
                });
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

                const assetObject = {
                    id,
                    asset: audioBuffer,
                    config: {
                        ...config,
                        volume: config.volume || 1,
                        loop: config.loop || false,
                        autoplay: config.autoplay || false,
                        muted: config.muted || false
                    }
                };

                this.assets.set(id, assetObject);

                if (this.isWorker)
                    this._sendWorker({...assetObject, asset: null, type: 'pixalo_audio_loaded'});
                else if (this?.worker)
                    this.worker.postMessage({...assetObject, asset: null, type: 'pixalo_audio_loaded'});

                resolve({asset: audioBuffer, config: assetObject.config});
            } catch (e) {
                reject(new Error(`Failed to load audio: ${e.message}`));
            }
        });
    }

    /** ======== CONTROLS ======== */
    async play (id, options = {}) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_play', args: [id, options]});
            return;
        }

        return new Promise((resolve, reject) => {
            try {
                const assetObject = this.assets.get(id);
                if (!assetObject) {
                    reject(new Error(`Audio asset with id '${id}' not found`));
                    return;
                }

                if (this.context.state === 'suspended') {
                    this.context.resume();
                }

                const instanceId = this._generateInstanceId();
                const source = this.context.createBufferSource();
                const gainNode = this.context.createGain();

                source.buffer = assetObject.asset;
                const config = {...assetObject.config, ...options};
                gainNode.gain.value = config.muted ? 0 : (config.volume * this.masterVolume);
                source.loop = config.loop;

                const spatialNodes = this._setupAudioChain(source, gainNode, config.spatial);

                const instanceData = {
                    instanceId,
                    assetId: id,
                    source,
                    gainNode,
                    spatialNodes,
                    spatialConfig: config.spatial || null,
                    startTime: this.context.currentTime,
                    pauseTime: 0,
                    duration: assetObject.asset.duration,
                    isPlaying: true,
                    isPaused: false,
                    config
                };

                this.instances.set(instanceId, instanceData);

                // Track instance by asset ID for faster lookup
                if (!this.assetInstances.has(id)) {
                    this.assetInstances.set(id, new Set());
                }
                this.assetInstances.get(id).add(instanceId);

                source.onended = () => {
                    this.instances.delete(instanceId);
                    if (this.assetInstances.has(id)) {
                        this.assetInstances.get(id).delete(instanceId);
                        if (this.assetInstances.get(id).size === 0) {
                            this.assetInstances.delete(id);
                        }
                    }
                };

                source.start(0);

                resolve({instanceId, assetId: id, source, gainNode, spatialNodes});

            } catch (e) {
                this.error(`Failed to play audio '${id}':`, e.message);
                reject(new Error(`Failed to play audio: ${e.message}`));
            }
        });
    }
    pause (id) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_pause', args: [id]});
            return this;
        }

        // Check if it's an instanceId first
        let instance = this.instances.get(id);

        // If not found, check if it's an assetId and pause the first active instance
        if (!instance) {
            for (const [instanceId, instanceData] of this.instances) {
                if (instanceData.assetId === id && instanceData.isPlaying && !instanceData.isPaused) {
                    instance = instanceData;
                    id = instanceId; // Update id to instanceId for further processing
                    break;
                }
            }
        }

        if (instance && instance.isPlaying && !instance.isPaused) {
            const currentTime = this.getCurrentTime(id);

            instance.pauseTime = currentTime;
            instance.isPlaying = false;
            instance.isPaused = true;

            try {
                instance.source.onended = null;
                instance.source.stop();
            } catch (e) {
                this.warn('Source already stopped:', e.message);
            }
        } else {
            this.warn(`No active audio instance found for id '${id}' or already paused`);
        }

        return this;
    }
    resume (id) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_resume', args: [id]});
            return this;
        }

        let instance = this.instances.get(id);
        let instanceId = id;

        if (!instance) {
            const assetInstanceIds = this.assetInstances.get(id);
            if (assetInstanceIds) {
                for (const iId of assetInstanceIds) {
                    const instanceData = this.instances.get(iId);
                    if (instanceData && instanceData.isPaused) {
                        instance = instanceData;
                        instanceId = iId;
                        break;
                    }
                }
            }
        }

        if (instance && instance.isPaused) {
            const assetObject = this.assets.get(instance.assetId);
            if (!assetObject) {
                this.warn(`Asset not found for instance '${instanceId}'`);
                return this;
            }

            if (this.context.state === 'suspended')
                this.context.resume();

            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();

            source.buffer = assetObject.asset;
            source.loop = instance.config.loop;
            gainNode.gain.value = instance.config.volume * this.masterVolume;

            const spatialNodes = this._setupAudioChain(source, gainNode, instance.spatialConfig);

            instance.source = source;
            instance.gainNode = gainNode;
            instance.spatialNodes = spatialNodes;
            instance.startTime = this.context.currentTime - instance.pauseTime;
            instance.isPlaying = true;
            instance.isPaused = false;

            source.onended = () => {
                this.instances.delete(instanceId);
                if (this.assetInstances.has(instance.assetId)) {
                    this.assetInstances.get(instance.assetId).delete(instanceId);
                    if (this.assetInstances.get(instance.assetId).size === 0) {
                        this.assetInstances.delete(instance.assetId);
                    }
                }
            };

            const remainingDuration = assetObject.asset.duration - instance.pauseTime;
            if (remainingDuration > 0) {
                source.start(0, instance.pauseTime);
            } else {
                source.start(0, 0);
            }
        } else {
            this.warn(`No paused audio instance found for id '${id}'`);
        }

        return this;
    }
    stop (id) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_stop', args: [id]});
            return this;
        }

        // Check if it's an instanceId first
        let instance = this.instances.get(id);
        let instanceId = id;

        // If not found, check if it's an assetId and stop the first active instance
        if (!instance) {
            for (const [iId, instanceData] of this.instances) {
                if (instanceData.assetId === id) {
                    instance = instanceData;
                    instanceId = iId;
                    break;
                }
            }
        }

        instance = this.instances.get(instanceId);
        if (instance) {
            try {
                instance.source.onended = null;
                instance.source.stop();
            } catch (e) {
                this.warn('Error stopping source:', e.message);
            }
            this.instances.delete(instanceId);
            if (this.assetInstances.has(instance.assetId)) {
                this.assetInstances.get(instance.assetId).delete(instanceId);
                if (this.assetInstances.get(instance.assetId).size === 0) {
                    this.assetInstances.delete(instance.assetId);
                }
            }
        }

        return this;
    }
    stopAsset (assetId) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_stopAsset', args: [assetId]});
            return this;
        }

        const assetInstanceIds = this.assetInstances.get(assetId);
        if (assetInstanceIds) {
            const instancesToStop = Array.from(assetInstanceIds);
            instancesToStop.forEach(instanceId => this.stop(instanceId));
        }

        return this;
    }
    /** ======== END ======== */

    /** ======== VOLUME ======== */
    setVolume (id, volume) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_setVolume', args: [id, volume]});
            return this;
        }

        // Check if it's an instanceId first
        let instance = this.instances.get(id);

        if (instance) {
            // It's an instanceId
            instance.gainNode.gain.value = volume * this.masterVolume;
            instance.config.volume = volume;
        } else {
            // Check if it's an assetId and set volume for the first instance
            for (const instanceData of this.instances.values()) {
                if (instanceData.assetId === id) {
                    instanceData.gainNode.gain.value = volume * this.masterVolume;
                    instanceData.config.volume = volume;
                    break;
                }
            }
        }

        return this;
    }
    setAssetVolume (assetId, volume) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_setAssetVolume', args: [assetId, volume]});
            return this;
        }

        this.instances.forEach((instance) => {
            if (instance.assetId === assetId) {
                instance.gainNode.gain.value = volume * this.masterVolume;
                instance.config.volume = volume;
            }
        });

        const assetObject = this.assets.get(assetId);
        if (assetObject) {
            assetObject.config.volume = volume;
        }

        return this;
    }
    setMasterVolume (volume) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_setMasterVolume', args: [volume]});
            return this;
        }

        this.masterVolume = Math.max(0, Math.min(1, volume));

        this.instances.forEach((instance) => {
            if (!instance.config.muted) {
                instance.gainNode.gain.value = instance.config.volume * this.masterVolume;
            }
        });

        return this;
    }
    /** ======== END ======== */

    /** ======== SPATIAL ======== */
    setListenerPosition (x, y, z = 0) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_setListenerPosition', args: [x, y, z]});
            return this;
        }

        if (this.listener.positionX) {
            this.listener.positionX.value = x;
            this.listener.positionY.value = y;
            this.listener.positionZ.value = z;
        } else {
            this.listener.setPosition(x, y, z);
        }

        return this;
    }
    setListenerOrientation (forwardX, forwardY, forwardZ = 0, upX = 0, upY = 1, upZ = 0) {
        if (this.isWorker) {
            this._sendWorker({
                action: 'audio_setListenerOrientation',
                args: [forwardX, forwardY, forwardZ, upX, upY, upZ]
            });
            return this;
        }

        if (this.listener.forwardX) {
            this.listener.forwardX.value = forwardX;
            this.listener.forwardY.value = forwardY;
            this.listener.forwardZ.value = forwardZ;
            this.listener.upX.value = upX;
            this.listener.upY.value = upY;
            this.listener.upZ.value = upZ;
        } else {
            this.listener.setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
        }

        return this;
    }
    setSpatialPosition (id, x, y, z = 0) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_setSpatialPosition', args: [id, x, y, z]});
            return this;
        }

        // Check if it's an instanceId first
        let instance = this.instances.get(id);

        // If not found, check if it's an assetId and update the first spatial instance
        if (!instance) {
            for (const instanceData of this.instances.values()) {
                if (instanceData.assetId === id && instanceData.spatialNodes && instanceData.spatialNodes.panner) {
                    instance = instanceData;
                    break;
                }
            }
        }

        if (instance && instance.spatialNodes && instance.spatialNodes.panner) {
            if (instance.spatialNodes.panner.positionX) {
                instance.spatialNodes.panner.positionX.value = x;
                instance.spatialNodes.panner.positionY.value = y;
                instance.spatialNodes.panner.positionZ.value = z;
            } else {
                instance.spatialNodes.panner.setPosition(x, y, z);
            }
        } else {
            this.warn(`No spatial audio found for id '${id}'`);
        }

        return this;
    }
    setSpatialOrientation (id, x, y, z = 0) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_setSpatialOrientation', args: [id, x, y, z]});
            return this;
        }

        // Check if it's an instanceId first
        let instance = this.instances.get(id);

        // If not found, check if it's an assetId and update the first spatial instance
        if (!instance) {
            for (const instanceData of this.instances.values()) {
                if (instanceData.assetId === id && instanceData.spatialNodes && instanceData.spatialNodes.panner) {
                    instance = instanceData;
                    break;
                }
            }
        }

        if (instance && instance.spatialNodes && instance.spatialNodes.panner) {
            if (instance.spatialNodes.panner.orientationX) {
                instance.spatialNodes.panner.orientationX.value = x;
                instance.spatialNodes.panner.orientationY.value = y;
                instance.spatialNodes.panner.orientationZ.value = z;
            } else {
                instance.spatialNodes.panner.setOrientation(x, y, z);
            }
        } else {
            this.warn(`No spatial audio found for id '${id}'`);
        }

        return this;
    }
    playSpatial (assetId, x, y, z = 0, options = {}) {
        const spatialOptions = {
            ...options,
            spatial: {
                position: {x, y, z},
                panningModel: 'HRTF',
                distanceModel: 'inverse',
                refDistance: 1,
                maxDistance: 10000,
                rolloffFactor: 1,
                ...options.spatial
            }
        };
        return this.play(assetId, spatialOptions);
    }
    updateSpatial (id, config) {
        if (config.position)
            this.setSpatialPosition(id, config.position.x, config.position.y, config.position.z);

        if (config.orientation)
            this.setSpatialOrientation(id, config.orientation.x, config.orientation.y, config.orientation.z);

        if (config.volume !== undefined)
            this.setVolume(id, config.volume);

        return this;
    }
    /** ======== END ======== */

    /** ======== STATUS ======== */
    isPlaying (id) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_isPlaying', args: [id]});
            return false;
        }

        // Check if it's an instanceId first
        let instance = this.instances.get(id);

        // If not found, check if it's an assetId
        if (!instance) {
            for (const instanceData of this.instances.values()) {
                if (instanceData.assetId === id && instanceData.isPlaying) {
                    return true;
                }
            }
            return false;
        }

        return instance ? instance.isPlaying : false;
    }
    getAssetInstances (assetId) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_getAssetInstances', args: [assetId]});
            return [];
        }

        const instances = [];
        const assetInstanceIds = this.assetInstances.get(assetId);
        if (assetInstanceIds) {
            for (const instanceId of assetInstanceIds) {
                const instance = this.instances.get(instanceId);
                if (instance) {
                    instances.push({
                        instanceId,
                        isPlaying: instance.isPlaying,
                        isPaused: instance.isPaused,
                        currentTime: this.getCurrentTime(instanceId)
                    });
                }
            }
        }
        return instances;
    }
    getDuration (assetId) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_getDuration', args: [assetId]});
            return 0;
        }

        const assetObject = this.assets.get(assetId);
        return assetObject ? assetObject.asset.duration : 0;
    }
    getCurrentTime (id) {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_getCurrentTime', args: [id]});
            return 0;
        }

        // Check if it's an instanceId first
        let instance = this.instances.get(id);

        // If not found, check if it's an assetId and get the first instance
        if (!instance) {
            for (const instanceData of this.instances.values()) {
                if (instanceData.assetId === id) {
                    instance = instanceData;
                    break;
                }
            }
        }

        if (!instance) return 0;

        if (instance.isPaused) {
            return instance.pauseTime;
        } else if (instance.isPlaying) {
            const elapsed = this.context.currentTime - instance.startTime;
            return Math.min(elapsed, instance.duration);
        }

        return 0;
    }
    getDistance (id) {
        // Check if it's an instanceId first
        let instance = this.instances.get(id);

        // If not found, check if it's an assetId and get the first spatial instance
        if (!instance) {
            for (const instanceData of this.instances.values()) {
                if (instanceData.assetId === id && instanceData.spatialNodes && instanceData.spatialNodes.panner) {
                    instance = instanceData;
                    break;
                }
            }
        }

        if (!instance || !instance.spatialNodes || !instance.spatialNodes.panner) return null;

        const panner = instance.spatialNodes.panner;
        const listener = this.listener;

        let px, py, pz, lx, ly, lz;

        if (panner.positionX) {
            px = panner.positionX.value;
            py = panner.positionY.value;
            pz = panner.positionZ.value;
            lx = listener.positionX.value;
            ly = listener.positionY.value;
            lz = listener.positionZ.value;
        } else {
            return null;
        }

        return Math.sqrt(
            Math.pow(px - lx, 2) +
            Math.pow(py - ly, 2) +
            Math.pow(pz - lz, 2)
        );
    }
    /** ======== END ======== */

    /** ======== BATCH OPERATION ======== */
    muteAll () {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_muteAll', args: []});
            return this;
        }

        this.instances.forEach((instance) => {
            instance.gainNode.gain.value = 0;
        });
        return this;
    }
    unmuteAll () {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_unmuteAll', args: []});
            return this;
        }

        this.instances.forEach((instance) => {
            instance.gainNode.gain.value = instance.config.volume * this.masterVolume;
        });
        return this;
    }
    pauseAll () {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_pauseAll', args: []});
            return this;
        }

        const activeInstances = Array.from(this.instances.keys()).filter(instanceId => {
            const instance = this.instances.get(instanceId);
            return instance.isPlaying && !instance.isPaused;
        });
        activeInstances.forEach(instanceId => this.pause(instanceId));

        return this;
    }
    resumeAll () {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_resumeAll', args: []});
            return this;
        }

        const pausedInstances = Array.from(this.instances.keys()).filter(instanceId => {
            const instance = this.instances.get(instanceId);
            return instance.isPaused;
        });
        pausedInstances.forEach(instanceId => this.resume(instanceId));

        return this;
    }
    stopAll () {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_stopAll', args: []});
            return this;
        }

        this.instances.forEach((instance) => {
            try {
                instance.source.stop();
            } catch (e) {
                // Source might already be stopped
            }
        });

        this.instances.clear();
        this.assetInstances.clear();

        return this;
    }
    /** ======== END ======== */

    /** ======== CLEANUP ======== */
    cleanup () {
        if (this.isWorker) {
            this._sendWorker({action: 'audio_cleanup', args: []});
            return this;
        }

        this.stopAll();
        this.assets.clear();

        if (this.context && this.context.state !== 'closed')
            this.context.close();

        this.instances.clear();
        this.listener = null;
        this.masterVolume = 1;
        this.nextInstanceId = 0;

        return this;
    }
    /** ======== END ======== */

    /** ======== LOGS ======== */
    warn (...args) {
        console.warn('%c[AudioManager WARN]', 'color: #ff9800;', ...args);
        return this;
    }
    error (...args) {
        console.error('%c[AudioManager ERROR]', 'color: #f44336;', ...args);
        return this;
    }
    /** ======== END ======== */

    /** ======== PRIVATE METHODS ======== */
    _handleWorker (event) {
        let {data} = event;
        const action = data?.action ?? '';

        if (action.startsWith('audio_')) {
            const callback = action.replace('audio_', '');
            if (typeof this[callback] === 'function')
                this[callback](...data.args);
        }
    }
    _sendWorker (data) {
        postMessage({
            wid: this.workerID,
            ...data
        });
    }
    _initSpatialAudio () {
        if (this.listener.forwardX) {
            this.listener.forwardX.value = 0;
            this.listener.forwardY.value = 0;
            this.listener.forwardZ.value = -1;
            this.listener.upX.value = 0;
            this.listener.upY.value = 1;
            this.listener.upZ.value = 0;
            this.listener.positionX.value = 0;
            this.listener.positionY.value = 0;
            this.listener.positionZ.value = 0;
        } else {
            this.listener.setOrientation(0, 0, -1, 0, 1, 0);
            this.listener.setPosition(0, 0, 0);
        }
    }
    _generateInstanceId () {
        return `instance_${this.nextInstanceId++}_${performance.now().toString(36)}`;
    }
    _setupAudioChain (source, gainNode, spatialConfig) {
        if (spatialConfig) {
            const spatialNodes = this._createSpatialNodes(spatialConfig);
            source.connect(gainNode);
            gainNode.connect(spatialNodes.panner);
            spatialNodes.panner.connect(this.context.destination);
            return spatialNodes;
        } else {
            source.connect(gainNode);
            gainNode.connect(this.context.destination);
            return null;
        }
    }
    _createSpatialNodes (spatialConfig) {
        const panner = this.context.createPanner();

        panner.panningModel = spatialConfig.panningModel || 'HRTF';
        panner.distanceModel = spatialConfig.distanceModel || 'inverse';
        panner.refDistance = spatialConfig.refDistance || 1;
        panner.maxDistance = spatialConfig.maxDistance || 10000;
        panner.rolloffFactor = spatialConfig.rolloffFactor || 1;
        panner.coneInnerAngle = spatialConfig.coneInnerAngle || 360;
        panner.coneOuterAngle = spatialConfig.coneOuterAngle || 360;
        panner.coneOuterGain = spatialConfig.coneOuterGain || 0;

        const pos = spatialConfig.position || {x: 0, y: 0, z: 0};
        if (panner.positionX) {
            panner.positionX.value = pos.x;
            panner.positionY.value = pos.y;
            panner.positionZ.value = pos.z;
        } else {
            panner.setPosition(pos.x, pos.y, pos.z);
        }

        const orient = spatialConfig.orientation || {x: 1, y: 0, z: 0};
        if (panner.orientationX) {
            panner.orientationX.value = orient.x;
            panner.orientationY.value = orient.y;
            panner.orientationZ.value = orient.z;
        } else {
            panner.setOrientation(orient.x, orient.y, orient.z);
        }

        return {panner};
    }
    /** ======== END ======== */

}

export default AudioManager;