/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

import Utils from "./Utils.js";
import Bezier from "./Bezier.js";
import Ease from "./Ease.js";
import Camera from "./Camera.js";
import Background from './Background.js';
import Grid from "./Grid.js";
import Entity from "./Entity.js";
import Collision from "./Collision.js";
import Physics from "./Physics.js";
import TileMap from "./TileMap.js";
import Emitters from "./Emitters.js";
import AudioManager from "./AudioManager.js";

class Pixalo extends Utils {

    constructor (selector, config = {}) {
        super();

        if (typeof selector === 'string') {
            this.canvas = document.querySelector(selector);
        } else if (selector instanceof HTMLCanvasElement) {
            this.canvas = selector;
        } else {
            throw new Error('Invalid selector');
        }

        this.ctx = this.canvas.getContext('2d');
        this.assets = new Map();
        this.entities = new Map();
        this.config = {
            width: config.width || this.canvas.width,
            height: config.height || this.canvas.height,
            fps: config.fps || 60,
            grids: config.grids || false,
            quality: config.quality || 1,
            physics: config.physics || {},
            collision: config.collision || {},
            background: config.background || '#ffffff',
        };
        this.baseWidth = this.config.width;
        this.baseHeight = this.config.height;
        this.debugger = {
            active: false,
            level: 'advanced',
            fps: {
                target: this.config.fps,
                actual: this.config.fps,
                ratio: 100
            },
            lastFpsUpdate: performance.now(),
            frameCount: 0,
            targetFrameCount: 0
        };

        this.eventListeners = new Map();
        this.running = false;
        this.lastTime = 0;
        this.draggedEntity = null;
        this.draggedEntities = new Map();
        this.hoveredEntity = null;
        this.timers = new Map();

        this.background = new Background(this);

        this.camera = new Camera(this, config.camera);

        this.gridEnabled = Boolean(config.grids);
        this.grid = new Grid(this, config.grids || {});

        this.physicsEnabled = Boolean(config.physics);
        this.physics = new Physics(this, config.physics);

        this.collisionEnabled = Boolean(config.collision);
        this.collision = new Collision();

        this.activeTileMap = null;
        this.tileMap = new TileMap(this);

        this.emitters = new Emitters(this);

        this.audio = new AudioManager(this);

        this.animations = {};
        this.maxDeltaTime = 1000 / 30;

        this.init();
        this.setupEventListeners();
    }

    init () {
        this.canvas.tabIndex = 0;

        // Setting the physical size of the canvas
        this.canvas.width = this.config.width * this.config.quality;
        this.canvas.height = this.config.height * this.config.quality;

        // Setting the canvas display size
        this.canvas.style.width = this.config.width + 'px';
        this.canvas.style.height = this.config.height + 'px';

        // Setting the background color
        this.canvas.style.backgroundColor = this.config.background;

        // Improved rendering quality for pixel games
        this.canvas.style.imageRendering = this.config.imageRendering || this.canvas.style.imageRendering;
    }

    setupEventListeners () {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            this.warn('Browser environment is required. This feature is only available in browser context.');
            return;
        }

        // Start observing canvas size changes
        new ResizeObserver(this._handleResize.bind(this)).observe(this.canvas);

        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleRightClick.bind(this));
        this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.canvas.addEventListener('keyup', this.handleKeyUp.bind(this));

        document.addEventListener('visibilitychange', () => {
            if (document.hidden)
                return this.stop();

            this.start();
        });

        if (this.physicsEnabled)
            return;

        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
    }

    /** ======== QUALITY ======== */
    quality (value) {
        if (value === undefined)
            return this.config.quality;

        this.config.quality = value;
        this._applyQuality(value);

        return this;
    }
    _applyQuality (quality) {
        this.canvas.width = this.baseWidth * quality;
        this.canvas.height = this.baseHeight * quality;

        this.canvas.style.width = this.baseWidth + 'px';
        this.canvas.style.height = this.baseHeight + 'px';

        this.ctx.scale(quality, quality);
    }
    /** ======== END ======== */

    /** ======== EVENTS ======== */
    on (eventName, callback) {
        if (Array.isArray(eventName)) {
            eventName.forEach(event => {
                this.on(event, callback);
            })
            return this;
        }
        if (typeof eventName === 'object') {
            for (const key in eventName) {
                this.on(key, eventName[key]);
            }
            return this;
        }

        if (!this.eventListeners.has(eventName))
            this.eventListeners.set(eventName, new Set());
        this.eventListeners.get(eventName).add(callback);
        return this;
    }
    trigger (eventName, data) {
        if (Array.isArray(eventName)) {
            eventName.forEach(event => {
                this.trigger(event, data);
            })
            return this;
        }

        if (!this.eventListeners.has(eventName))
            return this;

        const listeners = this.eventListeners.get(eventName);
        for (const callback of listeners)
            callback.call(this, data);

        return this;
    }
    off (eventName, callback) {
        if (Array.isArray(eventName)) {
            eventName.forEach(event => {
                this.off(event, callback);
            });
            return this;
        }
        if (this.eventListeners.has(eventName))
            this.eventListeners.get(eventName).delete(callback);
        return this;
    }
    /** ======== END ======== */

    /** ======== TIMERS ======== */
    timer (callback, delay, repeat = true) {
        const timerId = Symbol();

        const timerConfig = {
            callback,
            delay,
            repeat,
            lastTime: performance.now(),
            accumulated: 0,
            isRunning: true
        };

        this.timers.set(timerId, timerConfig);
        return timerId;
    }
    timeout (callback, delay) {
        this.timer(callback, delay, false);
    }
    clearTimer (timerId) {
        return this.timers.delete(timerId);
    }
    updateTimers (timestamp) {
        this.timers.forEach((timer, id) => {
            if (!timer.isRunning) return;

            const deltaTime = timestamp - timer.lastTime;
            timer.accumulated += deltaTime;

            while (timer.accumulated >= timer.delay) {
                timer.callback();

                if (timer.repeat) {
                    timer.accumulated -= timer.delay; // We only reduce the delay by the amount.
                } else {
                    this.clearTimer(id);
                    break;
                }
            }

            timer.lastTime = timestamp;
        });
    }
    /** ======== END ======== */

    /** ======== BACKGROUNDS ======== */
    addBackground (source, config = {}) {
        this.background.add(source, config);
        return this;
    }
    removeBackground (layerId) {
        this.background.remove(layerId);
        return this;
    }
    updateBackground (layerId, config) {
        this.background.update(layerId, config);
        return this;
    }
    clearBackgrounds () {
        this.background.clear();
        return this;
    }
    getBackground (layerId) {
        this.background.get(layerId);
        return this;
    }
    setBackgroundOrder (layerId, zIndex) {
        this.background.setOrder(layerId, zIndex);
        return this;
    }
    setBackgroundVisible (layerId, visible) {
        this.background.setVisible(layerId, visible);
        return this;
    }
    /** ======== END ======== */

    /** ======== GRID ======== */
    enableGrid () {
        this.gridEnabled = true;
        return this;
    }
    disableGrid () {
        this.gridEnabled = false;
        return this;
    }
    toggleGrid () {
        this.gridEnabled = !this.gridEnabled;
        return this;
    }
    setGridSize (width, height = width) {
        this.grid.setSize(width, height);
        return this;
    }
    setGridColors (color, majorColor) {
        this.grid.setColors(color, majorColor);
        return this;
    }
    setGridLineWidth (lineWidth, majorLineWidth) {
        this.grid.setLineWidth(lineWidth, majorLineWidth);
        return this;
    }
    setMajorGrid (every, color, lineWidth) {
        this.grid.setMajorGrid(every, color, lineWidth);
        return this;
    }
    setGridBounds (bounds) {
        this.grid.setBounds(bounds);
        return this;
    }
    setGridOrigin (x, y) {
        this.grid.setOrigin(x, y);
        return this;
    }
    setGridVisibilityRange (minZoom, maxZoom) {
        this.grid.setVisibilityRange(minZoom, maxZoom);
        return this;
    }
    snapToGrid (x, y) {
        return this.grid.snapToGrid(x, y);
    }
    getGridCell (x, y) {
        return this.grid.getGridCell(x, y);
    }
    cellToWorld (cellX, cellY) {
        return this.grid.cellToWorld(cellX, cellY);
    }
    /** ======== END ======== */

    /** ======== CONTROLS ======== */
    startLoop () {
        this.running = true;
        requestAnimationFrame(this.loop.bind(this));
    }
    loop (timestamp) {
        if (!this.running) return;

        const frameInterval = 1000 / this.config.fps; // Time interval between each frame
        let deltaTime = timestamp - this.lastTime;
        deltaTime = Math.min(deltaTime, this.maxDeltaTime);

        // Update FPS counter for every frame
        if (this.debugger.active) {
            this.debugger.frameCount++;
            const now = timestamp;
            const timeSinceLastUpdate = now - this.debugger.lastFpsUpdate;

            if (timeSinceLastUpdate >= 1000) {
                const actualFPS = Math.round((this.debugger.frameCount * 1000) / timeSinceLastUpdate);
                const targetFPS = this.config.fps;

                // Limit FPS ratio to a maximum of 100%
                const ratio = Math.min(Math.round((actualFPS / targetFPS) * 100), 100);

                this.debugger.fps = {
                    target: targetFPS,
                    actual: Math.min(actualFPS, targetFPS), // Limiting actual FPS to maximum target FPS
                    ratio: ratio
                };

                this.debugger.frameCount = 0;
                this.debugger.lastFpsUpdate = now;
            }
        }

        // Execute frame only if enough time has passed
        if (deltaTime >= frameInterval) {
            this.clear();
            this.updateTimers(timestamp);
            this.update(deltaTime);
            this.render();
            this.lastTime = timestamp - (deltaTime % frameInterval); // Fine-tune the last frame time
        }

        requestAnimationFrame(this.loop.bind(this));
    }
    update (deltaTime) {
        this.camera.update();

        this.background._updateLayers(deltaTime);

        if (this.physicsEnabled)
            this.physics.update(deltaTime);

        if (this.activeTileMap)
            this.tileMap.update();

        for (const [_, entity] of this.entities) {
            if (typeof entity.update === 'function')
                entity.update(deltaTime);
        }

        if (this.collisionEnabled && !this.physicsEnabled) {
            const collidableEntities = Array.from(this.entities.values()).filter(
                entity => entity.collision?.enabled
            );
            this.collision.updateCollisions(collidableEntities);
        }

        this.emitters.update(deltaTime);

        this.audio._update();

        this.trigger('update', deltaTime);
    }
    render () {
        this.clear();
        this.ctx.save();
        this.ctx.scale(this.config.quality, this.config.quality);
        this.camera.apply(this.ctx);

        this.trigger('beforerender', this.ctx);

        this.background._renderLayers(this.ctx, false);

        if (this.activeTileMap)
            this.tileMap.render(this.activeTileMap);

        const sortedEntities = Array.from(this.entities.values()).sort(
            (a, b) => a.zIndex - b.zIndex
        );

        sortedEntities.forEach(entity => {
            if (typeof entity.render === 'function') {
                this.ctx.save();
                entity.render(this.ctx);
                this.ctx.restore();
            }
        });

        this.trigger('render', this.ctx);

        this.emitters.render(this.ctx);

        this.background._renderLayers(this.ctx, true);

        if (this.gridEnabled)
            this.grid.render(this.ctx);

        this.ctx.restore();
        this.renderDebugInfo();
    }

    start () {
        if (this.running)
            return this;

        this.timers.forEach(timer => {
            timer.isRunning = true;
            timer.lastTime = performance.now();
        });
        this.audio.resumeAll();
        this.startLoop();

        this.trigger('start');

        return this;
    }
    stop () {
        this.running = false;
        this.timers.forEach(timer => {
            timer.isRunning = false;
        });
        this.audio.pauseAll();
        this.trigger('stop');
        return this;
    }
    clear () {
        // Full reset of transforms
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Clearing the entire canvas while maintaining quality
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Drawing the background in global coordinates
        this.ctx.fillStyle = this.config.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    reset () {
        this.entities.clear();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.eventListeners.clear();
        this.timers.clear();
        this.collision.reset();
        this.audio.cleanup();
        this.draggedEntity = null;
        this.hoveredEntity = null;
        this.touchIdentifier = null;
        this.activeTileMap = null;
    }
    /** ======== END ======== */

    /** ======== DEBUGGER ======== */
    enableDebugger () {
        this.debugger.active = true;
        this.entities.forEach(entity => {
            this.enableEntityDebug(entity);
        });
        return this;
    }
    disableDebugger () {
        this.debugger.active = false;
        this.entities.forEach(entity => {
            this.disableEntityDebug(entity);
        });
        return this;
    }
    enableEntityDebug (entity) {
        entity.style({debugCollision: true});
        entity.children.forEach(child => {
            this.enableEntityDebug(child);
        });
    }
    disableEntityDebug (entity) {
        entity.style({debugCollision: false});
        entity.children.forEach(child => {
            this.disableEntityDebug(child);
        });
    }
    renderDebugInfo () {
        if (!this.debugger.active) return;

        const ctx = this.ctx;
        const padding = 10;
        const lineHeight = 20;
        let y = padding;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(padding, padding, 300, 500);
        ctx.font = '12px monospace';
        ctx.fillStyle = '#ffffff';

        ctx.fillStyle = '#00ff00';
        ctx.fillText('=== Performance ===', padding + 5, y += lineHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`FPS: ${this.debugger.fps.actual}`, padding + 5, y += lineHeight);
        ctx.fillText(`Max FPS: ${this.debugger.fps.target}`, padding + 5, y += lineHeight);
        ctx.fillText(`FPS Ratio: ${this.debugger.fps.ratio}%`, padding + 5, y += lineHeight);

        ctx.fillStyle = '#00ff00';
        ctx.fillText('=== System ===', padding + 5, y += lineHeight * 1.5);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Quality: ${this.config.quality}x`, padding + 5, y += lineHeight);
        ctx.fillText(`Canvas Size: ${this.canvas.width}x${this.canvas.height}`, padding + 5, y += lineHeight);

        ctx.fillStyle = '#00ff00';
        ctx.fillText('=== State ===', padding + 5, y += lineHeight * 1.5);
        ctx.fillStyle = '#ffffff';

        let totalEntities = 0;
        let visibleEntities = 0;
        const countEntities = (entity) => {
            totalEntities++;
            if (entity.styles.visible) visibleEntities++;
            entity.children.forEach(countEntities);
        };
        this.entities.forEach(countEntities);
        ctx.fillText(`Total Entities: ${totalEntities}`, padding + 5, y += lineHeight);
        ctx.fillText(`Visible Entities: ${visibleEntities}`, padding + 5, y += lineHeight);

        ctx.fillStyle = '#00ff00';
        ctx.fillText('=== Physics & Collision ===', padding + 5, y += lineHeight * 1.5);
        ctx.fillStyle = '#ffffff';
        let activeCollisions = 0;
        this.entities.forEach(entity => {
            if (entity.collision?.enabled) activeCollisions++;
        });
        ctx.fillText(`Physics: ${this.physicsEnabled ? 'Enabled' : 'Disabled'}`, padding + 5, y += lineHeight);
        ctx.fillText(`Collision Objects: ${activeCollisions}`, padding + 5, y += lineHeight);

        ctx.fillStyle = '#00ff00';
        ctx.fillText('=== Grid System ===', padding + 5, y += lineHeight * 1.5);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Grid Enabled: ${this.gridEnabled ? 'Yes' : 'No'}`, padding + 5, y += lineHeight);
        if (this.gridEnabled) {
            ctx.fillText(`Grid Size: ${this.grid.width}x${this.grid.height}`, padding + 5, y += lineHeight);
            ctx.fillText(`Major Grid: Every ${this.grid.majorGridEvery}`, padding + 5, y += lineHeight);
            ctx.fillText(`Zoom Range: ${this.grid.minZoomToShow} - ${this.grid.maxZoomToShow}`, padding + 5, y += lineHeight);
        }

        ctx.restore();
    }

    log (...args) {
        if (this.debugger && this.debugger.active)
            console.log('%c[Pixalo LOG]', 'color: #2196f3;', ...args);
        return this;
    }
    info (...args) {
        if (this.debugger && this.debugger.active)
            console.info('%c[Pixalo INFO]', 'color: #4caf50;', ...args);
        return this;
    }
    warn (...args) {
        if (this.debugger && this.debugger.active)
            console.warn('%c[Pixalo WARN]', 'color: #ff9800;', ...args);
        return this;
    }
    error (...args) {
        if (this.debugger && this.debugger.active)
            console.error('%c[Pixalo ERROR]', 'color: #f44336;', ...args);
        return this;
    }
    /** ======== END ======== */

    /** ======== ASSETS ======== */
    loadAsset (type, id, src, config = {}) {
        if (!type || !id || !src) {
            return Promise.reject(new Error("Invalid parameters for Assets.load"));
        }

        if (this.assets.has(id))
            return Promise.resolve(this.assets.get(id));

        return new Promise(async (resolve, reject) => {
            let asset;

            switch (type.toLowerCase()) {
                case 'image':
                case 'tiles':
                    asset = new Image();
                    asset.onload = () => {
                        if (type.toLowerCase() === 'tiles') {
                            if (!config.tileSize) {
                                this.warn('No tileSize specified for tiles');
                                config.tileSize = 32; // Default value
                            }

                            if (!config.tiles) {
                                this.warn('No tiles configuration specified for tiles');
                                config.tiles = {};
                            }

                            // Calculating the number of rows and columns
                            config.columns = Math.floor(asset.width / config.tileSize);
                            config.rows = Math.floor(asset.height / config.tileSize);

                            // Convert relative coordinates to absolute for each tile
                            for (const [name, coords] of Object.entries(config.tiles)) {
                                if (Array.isArray(coords)) {
                                    const [x, y] = coords;
                                    config.tiles[name] = {
                                        x: x * config.tileSize,
                                        y: y * config.tileSize,
                                        width: config.tileSize,
                                        height: config.tileSize
                                    };
                                }
                            }
                        }

                        this.#applyAssetConfig(asset, config);
                        this.assets.set(id, {id, asset, config, type});
                        resolve({asset, config, type});
                    };
                    asset.onerror = reject;
                    asset.src = src;
                    break;
                case 'spritesheet':
                    asset = new Image();

                    asset.onload = () => {
                        // Validation of essential parameters
                        const requiredParams = ['columns', 'rows', 'width', 'height'];
                        for (const param of requiredParams) {
                            if (!config[param]) {
                                this.error(`Missing required parameter: ${param}`);
                                throw new Error(`Missing required parameter: ${param}`);
                            }
                        }

                        // Setting default values for offset and margin
                        config.originOffset = config.originOffset || [0, 0];
                        config.margin = config.margin || [0, 0];

                        // Validating the structure of offset and margin arrays
                        if (!Array.isArray(config.originOffset) || config.originOffset.length !== 2) {
                            config.originOffset = [0, 0];
                        }
                        if (!Array.isArray(config.margin) || config.margin.length !== 2) {
                            config.margin = [0, 0];
                        }

                        // Calculate the total number of frames
                        config.totalFrames = config.columns * config.rows;

                        // Create a frames array by calculating the position of each frame
                        config.frames = [];
                        for (let row = 0; row < config.rows; row++) {
                            for (let col = 0; col < config.columns; col++) {
                                config.frames.push({
                                    x: config.originOffset[0] +
                                        col * (config.width + config.margin[0]),
                                    y: config.originOffset[1] +
                                        row * (config.height + config.margin[1]),
                                    width: config.width,
                                    height: config.height
                                });
                            }
                        }

                        // Save assets to the assets collection
                        this.assets.set(id, {id, asset, config, type});

                        // Announcing successful upload
                        resolve({asset, config, type});
                    };

                    asset.onerror = reject;

                    asset.src = src;
                    break;
                case 'audio':
                    try {
                        const response = await fetch(src, {
                            mode: 'cors', ...(config.fetch || {})
                        });
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await this.audio.context.decodeAudioData(arrayBuffer);

                        const assetObject = {
                            id,
                            asset: audioBuffer,
                            config: {
                                ...config,
                                volume: config.volume || 1,
                                loop: config.loop || false,
                                autoplay: config.autoplay || false,
                                muted: config.muted || false,
                                category: config.category || 'master'
                            },
                            type
                        };

                        this.assets.set(id, assetObject);

                        resolve({asset: audioBuffer, config: assetObject.config, type});
                    } catch (e) {
                        reject(new Error(`Failed to load audio: ${e.message}`));
                    }
                    break;
                default:
                    reject(new Error(`Unsupported asset type: ${type}`));
            }
        });
    }
    getAsset (id) {
        return this.assets.get(id) || null;
    }
    deleteAsset (id) {
        this.assets.delete(id);
        return this;
    }
    clearAssets () {
        this.assets.clear();
        return this;
    }
    #applyAssetConfig (asset, config) {
        if (config.tileSize) return;

        for (const key in config) {
            if (key in asset) {
                try {
                    asset[key] = config[key];
                } catch (e) {
                    this.warn(`Failed to set property "${key}" on asset:`, e);
                }
            }
        }
    }
    /** ======== END ASSETS ======== */

    /** ======== ENTITIES ======== */
    defineAnimation (name, keyframes, options = {}) {
        this.animations[name] = {
            keyframes,
            options: {
                duration: options.duration || 1000,
                repeat: options.repeat || 0,
                easing: options.easing || 'linear'
            }
        };
        return this;
    }
    append (id, config = {}) {
        // Convert input to Entity instance if needed
        const entity = id instanceof Entity ? id : (
            config instanceof Entity ? config : new Entity(id, {
                ...config, engine: this
        }));
    
        // Handle duplicate IDs
        if (this.entities.has(entity.id)) {
            entity.id = `${entity.id}_${Date.now()}`;
        }
    
        // Setup entity
        entity.engine = this;
        this.entities.set(entity.id, entity);
        
        // Update position if method exists
        entity.updatePosition?.();
    
        // Handle physics if enabled
        if (this.physicsEnabled && (entity.physics || config.physics)) {
            this.physics.addEntity(entity, entity.physics || config.physics);
        }
    
        // Enable debug if active
        if (this.debugger.active) {
            this.enableEntityDebug(entity);
        }
    
        return entity;
    }
    getAllEntities () {
        return this.entities;
    }
    getSortedEntitiesByZIndex () {
        return Array.from(this.entities.values()).sort((a, b) => b.zIndex - a.zIndex);
    }
    find (entityId) {
        return this.entities.get(entityId);
    }
    isEntity (target) {
        return target instanceof Entity;
    }
    kill (entityId) {
        const entity = this.entities.get(entityId);
        return entity ? entity.kill() : false;
    }
    /** ======== END ======== */

    /** ======== COLLISIONS ======== */
    enableCollisions () {
        this.collisionEnabled = true;
        return this;
    }
    checkCollision (entity1, entity2) {
        return this.collision.detectCollisionDetailed(entity1, entity2);
    }
    checkGroupCollision (group1, group2) {
        for (const entity1 of group1) {
            for (const entity2 of group2) {
                if (this.detectCollisionDetailed(entity1, entity2)) {
                    return {entity1, entity2};
                }
            }
        }
        return false;
    }
    disableCollisions () {
        this.collisionEnabled = false;
        return this;
    }
    /** ======== END ======== */

    /** ======== TILE MAP ======== */
    createTileMap (config) {
        return this.tileMap.create(config);
    }
    renderTileMap (tilemap) {
        this.activeTileMap = tilemap;
        return this;
    }
    addTile (layer, symbol, x = 0, y = 0) {
        this.tileMap.addTile(...arguments);
        return this;
    }
    exportTileMap (layer) {
        return this.tileMap.exportLayers(layer);
    }
    /** ======== END ======== */

    /** ======== EMITTERS ======== */
    createEmitter (id, config) {
        return this.emitters.create(id, config);
    }
    /** ======== END ======== */

    /** ======== SCREENSHOT ======== */
    shot (options = {}) {
        const {
            format = 'png',
            quality = 1.0,
            backgroundColor = this.config.background,
            download = false,
            filename = `pixalo-screenshot-${Date.now()}`
        } = options;

        // Validate parameters
        if (!['png', 'jpeg', 'webp'].includes(format.toLowerCase()))
            return this.error('Invalid format. Supported formats are: png, jpeg, webp');

        if (quality < 0 || quality > 1)
            return this.error('Quality must be between 0 and 1');

        // Create a temporary canvas to handle the screenshot
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Set the dimensions to match the original canvas
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;

        // Fill background if specified
        if (backgroundColor) {
            tempCtx.fillStyle = backgroundColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Draw the current canvas content
        tempCtx.drawImage(this.canvas, 0, 0);

        // Convert to data URL
        const mimeType = `image/${format.toLowerCase()}`;
        const dataURL = tempCanvas.toDataURL(mimeType, quality);

        // Convert to Blob
        const blob = this.dataURLToBlob(dataURL);

        // Create Blob URL
        const blobURL = URL.createObjectURL(blob);

        // Handle download if requested
        if (download) {
            const link = document.createElement('a');
            link.download = `${filename}.${format.toLowerCase()}`;
            link.href = dataURL;
            link.click();
        }

        return {
            dataURL,
            blob,
            blobURL,
            width: tempCanvas.width,
            height: tempCanvas.height,
            revoke: () => URL.revokeObjectURL(blobURL)
        };
    }
    /** ======== END ======== */

}

Pixalo.prototype.Bezier  = Bezier;
Pixalo.prototype.Ease    = Ease;
Pixalo.prototype.TileMap = TileMap;

export default Pixalo;