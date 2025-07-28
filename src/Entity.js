/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

class Entity {

    constructor (id, config = {}) {
        this.engine = config.engine;
        this.id = id;
        this.x  = config.x || 0;
        this.y  = config.y || 0;
        this.width = config.width || 32;
        this.height = config.height || 32;

        this.class = config.class || '';

        this._data = {};
        this.parent = null;
        this.children = new Map();
        this.absoluteX = this.x;
        this.absoluteY = this.y;
        this.constrainToParent = config.constrainToParent ?? true;

        this.styles = {
            ...this.#normalizeBackground(config),

            color: config.color || '#000000',
            opacity: config.opacity || 1,

            shape: config.shape || 'rectangle',
            borderColor: config.borderColor,
            borderWidth: config.borderWidth || 0,
            borderStyle: config.borderStyle || 'solid',
            borderRadius: config.borderRadius || 0,

            shadowColor: config.shadowColor,
            shadowBlur: config.shadowBlur || 0,
            shadowOffsetX: config.shadowOffsetX || 0,
            shadowOffsetY: config.shadowOffsetY || 0,
            blur: config.blur || 0,

            rotation: config.rotation || 0,
            scale: config.scale || 1,
            scaleX: config.scaleX || 1,
            scaleY: config.scaleY || 1,

            skewX: config.skewX || 0,
            skewY: config.skewY || 0,

            flipX: config.flipX || false,
            flipY: config.flipY || false,

            text: config.text,
            font: config.font || '16px Arial',
            textAlign: config.textAlign || 'center',
            textBaseline: config.textBaseline || 'middle',
            lineHeight: config.lineHeight || 1.2,

            transition: config.transition || {},
            animation: config.animation || {},

            visible: config.visible ?? true,
            blendMode: config.blendMode || 'source-over',

            clip: config.clip,
            mask: config.mask,
            filter: config.filter,

            points: config.points || [],
            roundness: config.roundness || 0,
            customPath: config.customPath ? config.customPath.bind(this) : null
        };

        this.collision = {
            enabled: Boolean(config.collision),
            group  : config.collision?.group  || `group_${id}`,
            width  : config.collision?.width  || this.width,
            height : config.collision?.height || this.height,
            points : config.collision?.points || config.points || null,
            x: config.collision?.x || 0,
            y: config.collision?.y || 0
        };
        this.physics = config.physics ?? false;

        this.events = {
            hoverable: Boolean(config.hoverable),
            draggable: Boolean(config.draggable),
            clickable: Boolean(config.clickable)
        };

        this.eventListeners  = new Map();
        this.animationStates = new Map();
        this.zIndex = config.zIndex || 0;
        this.defaultZIndex = this.zIndex;

        this.sprite = config.sprite ? {
            asset: this.engine.getAsset(config.sprite.asset),
            width: config.sprite?.width || null,
            height: config.sprite?.height || null,
            x: config.sprite?.x || 0,
            y: config.sprite?.y || 0,
            currentFrame: 0,
            currentAnimation: null,
            lastFrameUpdate: 0,
            animations: config.sprite.animations || {},
            defaultAnimation: config.sprite.defaultAnimation,
            playing: false,
            frameTimer: null
        } : null;

        if (this.sprite && this.sprite.defaultAnimation)
            this.play(this.sprite.defaultAnimation);

        this.moveAnimation = null;
    }

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
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, new Set());
        }
        this.eventListeners.get(eventName).add(callback);
        return this;
    }
    one (eventName, callback) {
        if (Array.isArray(eventName)) {
            eventName.forEach(event => {
                this.one(event, callback);
            });
            return this;
        }

        if (typeof eventName === 'object') {
            for (const key in eventName)
                this.one(key, eventName[key]);
            return this;
        }

        const onceWrapper = (data) => {
            callback.call(this, data);
            this.off(eventName, onceWrapper);
        };

        this.on(eventName, onceWrapper);
        return this;
    }
    off (eventName, callback) {
        if (Array.isArray(eventName)) {
            eventName.forEach(event => this.off(event, callback));
            return this;
        }
        if (this.eventListeners.has(eventName))
            this.eventListeners.get(eventName).delete(callback);
        return this;
    }
    trigger (eventName, ...args) {
        if (Array.isArray(eventName)) {
            eventName.forEach(event => {
                this.trigger(event, data);
            })
            return this;
        }

        if (!this.eventListeners.has(eventName)) return this;

        const listeners = this.eventListeners.get(eventName);
        for (const callback of listeners)
            callback.apply(this, args);
        
        return this;
    }
    /** ======== END ======== */

    isHoverable () {
        return this.events.hoverable;
    }
    isDraggable () {
        return this.events.draggable;
    }
    isClickable () {
        return this.events.clickable;
    }

    /** ======== ENTITIES ======== */
    append (childId, config = {}) {
        let child;

        if (childId instanceof Entity) {
            child = childId;
            childId = child.id;
        } else {
            child = new Entity(
                childId, { ...config, engine: this.engine }
            );
        }

        child.parent = this;
        this.children.set(childId, child);

        child.move({
            x: 0, y: 0,
            relative: !this.engine.physicsEnabled
        });

        return child;
    }
    layer (value) {
        if (typeof value === 'number') {
            this.zIndex = value;
        } else {
            switch (value) {
                case 'above':
                    this.zIndex = 999999;
                    break;
                case 'below':
                    this.zIndex = -999999;
                    break;
                case 'top':
                    this.zIndex = 100;
                    break;
                case 'bottom':
                    this.zIndex = -100;
                    break;
                case 'reset':
                    this.zIndex = this.defaultZIndex;
                    break;
                default:
                    this.zIndex = 0;
            }
        }
        return this;
    }
    find (childId) {
        return this.children.get(childId);
    }
    findByClass (className) {
        return Array.from(this.children).filter(
            ([key, value]) => value.class.split(' ').includes(className)
        ).map(([key, value]) => value);
    }
    getEntities () {
        const entities = [this];

        const addChildren = (entity) => {
            entity.children.forEach(child => {
                entities.push(child);
                addChildren(child);
            });
        };

        addChildren(this);
        return entities;
    }
    clone (newId = null) {
        // Create base configuration from current entity state
        const config = {
            x: this.x,
            y: this.y,
            absoluteX: this.absoluteX,
            absoluteY: this.absoluteY,
            width: this.width,
            height: this.height,
            _data: this._data,
            engine: this.engine,
            constrainToParent: this.constrainToParent,
            zIndex: this.zIndex,
            ...this.styles,
            ...this.events,
            collision: {
                ...this.collision,
                points: this.collision?.points ? JSON.parse(JSON.stringify(this.collision.points)) : null
            },
            physics: this.physics
        };

        // Generate unique ID if not provided
        const uniqueId = newId || `${this.id}_clone_${Date.now()}`;

        // Create new entity instance
        const clone = new Entity(uniqueId, config);

        // Copy additional properties
        clone.defaultZIndex = this.defaultZIndex;

        // Clone event listeners
        this.eventListeners.forEach((listeners, eventName) => {
            listeners.forEach(callback => {
                clone.on(eventName, callback);
            });
        });

        // Clone animation states
        this.animationStates.forEach((state, name) => {
            clone.animationStates.set(name, {...state});
        });

        if (this.sprite) {
            clone.sprite = {
                ...this.sprite,
                animations: JSON.parse(JSON.stringify(this.sprite.animations)),
                asset: this.sprite.asset,
                // reset runtime properties
                currentFrame: 0,
                currentAnimation: null,
                lastFrameUpdate: 0,
                playing: false,
                frameTimer: null
            };

            if (clone.sprite.defaultAnimation) {
                clone.play(clone.sprite.defaultAnimation);
            }
        }

        if (this.styles.mask instanceof Entity) {
            clone.styles.mask = this.styles.mask.clone();
        }

        if (this.styles.backgroundImage) {
            clone.style({
                backgroundImage: this.styles.backgroundImage,
                backgroundImageFit: this.styles.backgroundImageFit,
                backgroundImagePosition: this.styles.backgroundImagePosition,
                backgroundImageRepeat: this.styles.backgroundImageRepeat
            });
        }

        // Clone children recursively
        this.children.forEach((child, childId) => {
            const childClone = child.clone();
            childClone.parent = clone;
            clone.children.set(childId, childClone);
        });

        return clone;
    }
    /** ======== END ======== */

    /** ======== UPDATE ======== */
    updatePosition () {
        if (this.parent) {
            this.absoluteX = this.parent.absoluteX + this.x;
            this.absoluteY = this.parent.absoluteY + this.y;
        } else {
            this.absoluteX = this.x;
            this.absoluteY = this.y;
        }

        this.children.forEach(child => child.updatePosition());
    }
    /** ======== END ======== */

    /** ======== ANIMATIONS ======== */
    transition (properties, options = {}) {
        if (typeof properties === 'string') {
            const property = properties;
            const value = arguments[1];
            options = arguments[2] || {};
            properties = {[property]: value};
        }

        options = {
            duration: 300,
            easing: 'linear',
            delay: 0,
            ...options
        };

        const startValues = {};
        Object.keys(properties).forEach(prop => {
            startValues[prop] = this.styles[prop];
        });

        const startTime = performance.now() + options.delay;

        let ease = typeof options.easing === 'function' ? options.easing : (this.engine.Ease[options.easing] ?? this.engine.Ease['linear']);

        const animate = (currentTime) => {
            if (currentTime < startTime) {
                requestAnimationFrame(animate);
                return;
            }

            const elapsed = currentTime - startTime;
            if (elapsed >= options.duration) {
                this.style(properties);
                if (typeof options.onComplete === 'function') {
                    options.onComplete.call(this);
                }
                return;
            }

            const progress = elapsed / options.duration;
            const eased = ease(progress);

            const currentValues = {};
            Object.keys(properties).forEach(prop => {
                const startValue = startValues[prop];
                const targetValue = properties[prop];

                if (typeof startValue === 'number') {
                    currentValues[prop] = startValue + (targetValue - startValue) * eased;
                } else if (typeof startValue === 'string' && startValue.startsWith('#')) {
                    currentValues[prop] = this._interpolateColor(startValue, targetValue, eased);
                }
            });

            this.style(currentValues);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        return this;
    }
    startAnimation (name) {
        const animation = this.engine.animations[name];
        if (!animation) return this;

        const state = this.animationStates.get(name) || {
            currentFrame: 0,
            repeat: animation.options.repeat,
            isRunning: true
        };

        state.isRunning = true;
        this.animationStates.set(name, state);

        const animate = () => {
            if (!state.isRunning) return;

            const keyframe = animation.keyframes[state.currentFrame];
            this.style(keyframe);

            state.currentFrame++;
            if (state.currentFrame >= animation.keyframes.length) {
                if (state.repeat === 'infinite' || state.repeat > 0) {
                    state.currentFrame = 0;
                    if (typeof state.repeat === 'number') state.repeat--;
                } else {
                    state.isRunning = false;
                    return;
                }
            }

            setTimeout(() => requestAnimationFrame(animate),
                animation.options.duration / animation.keyframes.length);
        };

        requestAnimationFrame(animate);
        return this;
    }
    stopAnimation (name) {
        if (!this.animationStates) return this;

        if (name) {
            const state = this.animationStates.get(name);
            if (state) {
                state.isRunning = false;
                state.currentFrame = 0;
            }
        } else {
            this.animationStates.forEach(state => {
                state.isRunning = false;
                state.currentFrame = 0;
            });
        }
        return this;
    }
    /** ======== END ======== */

    /** ======== Wrapper Methods ======== */
    style (property, value) {
        if (typeof property === 'object') {
            if ('x' in property || 'y' in property) {
                Object.assign(this, property);
                this.updatePosition();
            }
            Object.assign(this.styles, property);
        } else {
            if (property === 'x' || property === 'y') {
                this[property] = value;
                this.updatePosition();
            } else {
                this.styles[property] = value;
            }
        }
        return this;
    }
    text (text) {
        if (typeof text === 'undefined')
            return this.styles.text;
        this.styles.text = text;
        return this;
    }
    img (asset, properties = {}) {
        const image = this.engine.getAsset(asset);

        if (!image)
            throw new Error('Asset not found.');

        return this.style({
            backgroundColor: 'transparent',
            backgroundImage: image.asset,
            backgroundImageFit: properties.fit || 'cover',
            backgroundImagePosition: properties.position || 'center',
            backgroundImageRepeat: properties.repeat || false
        });
    }
    move (options, y = 0, duration = 0) {
        this.halt();

        if (typeof options === 'number') {
            options = {
                x: options,
                y: y,
                duration: duration || 0
            };
        }

        const config = {
            x: this.x,
            y: this.y,
            duration: 0,
            easing: 'linear',
            relative: true,
            ...options
        };

        if (config.relative) {
            if ('x' in options) config.x = this.x + (options.x || 0);
            if ('y' in options) config.y = this.y + (options.y || 0);
        }

        const deltaX = config.x - this.x;
        const deltaY = config.y - this.y;

        if (!config.duration) {
            this.style({
                x: config.x,
                y: config.y
            });

            if (config.onComplete) {
                config.onComplete.call(this);
            }

            return this;
        }

        const entities = this.getEntities();
        const initialPositions = new Map();

        entities.forEach(entity => {
            initialPositions.set(entity, {
                x: entity.x,
                y: entity.y,
                absoluteX: entity.absoluteX,
                absoluteY: entity.absoluteY
            });
        });

        const startTime = performance.now();
        const easingFunction = typeof config.easing === 'function' ? config.easing : this.engine.Ease[config.easing] || this.engine.Ease['linear'];

        const animate = (currentTime) => {
            let elapsed = currentTime - startTime;

            if (elapsed >= config.duration) {
                this.style({
                    x: config.x,
                    y: config.y
                });

                if (config.onComplete) {
                    config.onComplete.call(this);
                }

                this.moveAnimation = null;
                return;
            }

            const progress = elapsed / config.duration;
            const eased = easingFunction(progress);

            // Update entities position
            entities.forEach(entity => {
                const initial = initialPositions.get(entity);

                if (entity === this) { // this entity
                    entity.style({
                        x: initial.x + deltaX * eased,
                        y: initial.y + deltaY * eased
                    });
                } else { // children
                    const relativeToParent = {
                        x: initial.x,
                        y: initial.y
                    };
                    entity.style({
                        x: relativeToParent.x,
                        y: relativeToParent.y
                    });
                }
            });

            if (config.onUpdate)
                config.onUpdate.call(this, eased);

            this.moveAnimation = requestAnimationFrame(animate);
        };

        this.moveAnimation = requestAnimationFrame(animate);

        return this;
    }
    hide () {
        this.style('visible', false);
    }
    show () {
        this.style('visible', true);
    }
    data (key, value) {
        if (value === undefined)
            return this._data[key] || undefined;
        this._data[key] = value;
        return this;
    }
    halt () {
        if (this.moveAnimation) {
            cancelAnimationFrame(this.moveAnimation);
            this.moveAnimation = null;
            this.trigger('moveStop', {x: this.x, y: this.y});
        }
        return this;
    }
    addClass (className) {
        this.class += ` ${className}`
    }

    /** ======== SpriteSheet ======== */
    play (animationName) {
        animationName = animationName || this.sprite.currentAnimation;
        if (!this.sprite || !this.sprite.animations[animationName]) return this;

        const oldAnimation = this.sprite.currentAnimation;

        // Stop previous animation
        this.stop();

        const animation = this.sprite.animations[animationName];
        this.sprite.currentAnimation = animationName;
        this.sprite.currentFrame = 0;
        this.sprite.playing = true;
        this.sprite.lastFrameUpdate = performance.now();

        // trigger events callbacks
        this.trigger('animationStart', animationName);
        animation.onStart?.call(this);

        if (oldAnimation !== animationName) {
            this.trigger('animationChange', oldAnimation, animationName);
        }

        const updateFrame = () => {
            if (!this.sprite.playing) return;

            const now = performance.now();
            const elapsed = now - this.sprite.lastFrameUpdate;
            const frameInterval = 1000 / animation.frameRate;

            if (elapsed >= frameInterval) {
                const oldFrame = this.sprite.currentFrame;
                this.sprite.currentFrame++;
                this.sprite.lastFrameUpdate = now;

                // trigger framechange
                if (oldFrame !== this.sprite.currentFrame) {
                    this.trigger('frameChange', this.sprite.currentFrame);
                    animation.onFrame?.call(this, this.sprite.currentFrame);
                }

                // Check the end of the animation
                if (this.sprite.currentFrame >= animation.frames.length) {
                    if (animation.loop) {
                        this.sprite.currentFrame = 0;
                        animation.onLoop?.call(this);
                    } else {
                        this.stop();
                        this.trigger('animationEnd', animationName);
                        animation.onEnd?.call(this);
                        return;
                    }
                }
            }

            this.sprite.frameTimer = requestAnimationFrame(updateFrame);
        };

        updateFrame();
        return this;
    }
    pause () {
        if (!this.sprite || !this.sprite.playing) return this;
        this.sprite.playing = false;
        if (this.sprite.frameTimer) {
            cancelAnimationFrame(this.sprite.frameTimer);
            this.sprite.frameTimer = null;
        }
        this.trigger('animationPause', this.sprite.currentAnimation);
        return this;
    }
    resume () {
        if (!this.sprite || this.sprite.playing) return this;

        // Keep current frame
        const currentFrame = this.sprite.currentFrame;

        this.sprite.playing = true;
        this.play(this.sprite.currentAnimation);

        // Revert to the previous frame
        this.sprite.currentFrame = currentFrame;

        this.trigger('animationResume', this.sprite.currentAnimation);
        return this;
    }
    stop () {
        if (!this.sprite) return this;
        const currentAnimation = this.sprite.currentAnimation;
        this.sprite.playing = false;
        this.sprite.currentFrame = 0;
        if (this.sprite.frameTimer) {
            cancelAnimationFrame(this.sprite.frameTimer);
            this.sprite.frameTimer = null;
        }
        if (currentAnimation) {
            this.trigger('animationStop', currentAnimation);
        }
        return this;
    }
    isPlaying () {
        return this.sprite?.playing || false;
    }
    setSpriteAsset (asset) {
        asset = this.engine.getAsset(asset);
        if (asset.type !== 'spritesheet')
            return this;
        this.sprite.asset = asset;
        this.trigger('spriteAssetChanged', asset.id);
        return this;
    }
    addAnimation (name, config) {
        if (!this.sprite) return this;
        this.sprite.animations[name] = config;
        return this;
    }
    setAnimations (animations) {
        if (!this.sprite) return this;
        this.sprite.animations = animations;
        return this;
    }
    getCurrentAnimation () {
        return this.sprite?.currentAnimation || null;
    }
    setFrame (frameNumber) {
        if (!this.sprite ||
            !this.sprite.currentAnimation ||
            frameNumber >= this.sprite.animations[this.sprite.currentAnimation].frames.length) return this;

        this.sprite.currentFrame = frameNumber;
        return this;
    }
    getCurrentFrame () {
        if (!this.sprite || !this.sprite.currentAnimation) return null;
        const animation = this.sprite.animations[this.sprite.currentAnimation];
        return animation.frames[this.sprite.currentFrame];
    }
    setFrameRate (animationName, newFrameRate) {
        if (!this.sprite || !this.sprite.animations[animationName]) return this;
        this.sprite.animations[animationName].frameRate = newFrameRate;
        return this;
    }
    /** ======== END SpriteSheet ======== */

    /** ======== END Wrapper Methods ======== */

    /** ======== RENDERING ======== */
    render (ctx) {
        if (!this.styles.visible) return;

        ctx.save();

        // Calling the beforerender event before applying any changes
        this.trigger('beforerender', ctx);

        // Apply transforms
        ctx.translate(this.absoluteX + this.width / 2, this.absoluteY + this.height / 2);
        ctx.rotate(this.styles.rotation * Math.PI / 180);
        ctx.scale(
            (this.styles.flipX ? -1 : 1) * this.styles.scaleX * this.styles.scale,
            (this.styles.flipY ? -1 : 1) * this.styles.scaleY * this.styles.scale
        );
        ctx.transform(1, this.styles.skewY, this.styles.skewX, 1, 0, 0);

        // Apply base styles
        ctx.globalAlpha = this.styles.opacity;
        ctx.globalCompositeOperation = this.styles.blendMode;

        // Apply filters
        this._applyFilters(ctx);

        // Apply clip
        this._applyClip(ctx);

        // Apply shadow
        if (this.styles.shadowColor) {
            ctx.shadowColor = this.styles.shadowColor;
            ctx.shadowBlur = this.styles.shadowBlur;
            ctx.shadowOffsetX = this.styles.shadowOffsetX;
            ctx.shadowOffsetY = this.styles.shadowOffsetY;
        }

        // Apply borderRadius
        const hasBorderRadius = this.styles.borderRadius > 0;
        if (hasBorderRadius) {
            ctx.save();
            this._clipPath(ctx);
        }

        // Calling the render event after applying transforms and before rendering the content
        this.trigger('render', ctx);

        // Render content
        if (this.sprite) {
            this._renderSprite(ctx);
        } else {
            if (this.styles.backgroundImage) {
                this._renderBackgroundImage(ctx);
            }
            if (this.styles.customPath) {
                this._renderCustomPath(ctx);
            } else {
                this.renderShape(ctx);
            }
        }

        if (this.styles.text) {
            this._renderText(ctx);
        }

        // Apply mask
        this._applyMask(ctx);

        // Restore context for borderRadius
        if (hasBorderRadius) {
            ctx.restore();
        }

        // Calling the afterrender event before the final restore
        this.trigger('afterrender', ctx);

        ctx.restore();

        // Debug rendering
        if (this.engine?.debugger?.active) {
            ctx.save();

            // Set blendMode for debug visualization
            ctx.globalCompositeOperation = 'source-over';

            // Re-apply transforms for debug
            ctx.translate(this.absoluteX + this.width / 2, this.absoluteY + this.height / 2);
            ctx.rotate(this.styles.rotation * Math.PI / 180);
            ctx.scale(
                (this.styles.flipX ? -1 : 1) * this.styles.scaleX * this.styles.scale,
                (this.styles.flipY ? -1 : 1) * this.styles.scaleY * this.styles.scale
            );
            ctx.transform(1, this.styles.skewY, this.styles.skewX, 1, 0, 0);

            // Render debug info
            this._renderDebugInfo(ctx);

            ctx.restore();
        }

        // Render children
        if (this.children.size > 0) {
            this.children.forEach(child => {
                if (child.styles.visible) {
                    child.render(ctx);
                }
            });
        }
    }
    renderShape (ctx) {
        switch (this.styles.shape) {
            case 'circle':
                this.renderCircle(ctx);
                break;
            case 'triangle':
                this.renderTriangle(ctx);
                break;
            case 'star':
                this.renderStar(ctx);
                break;
            case 'polygon':
                this.renderPolygon(ctx);
                break;
            default:
                this.renderRectangle(ctx);
        }
    }
    renderRectangle (ctx) {
        const w = this.width;
        const h = this.height;

        if (this.styles.borderRadius > 0) {
            const r = this.styles.borderRadius;
            ctx.beginPath();
            ctx.moveTo(-w / 2 + r, -h / 2);
            ctx.lineTo(w / 2 - r, -h / 2);
            ctx.arcTo(w / 2, -h / 2, w / 2, -h / 2 + r, r);
            ctx.lineTo(w / 2, h / 2 - r);
            ctx.arcTo(w / 2, h / 2, w / 2 - r, h / 2, r);
            ctx.lineTo(-w / 2 + r, h / 2);
            ctx.arcTo(-w / 2, h / 2, -w / 2, h / 2 - r, r);
            ctx.lineTo(-w / 2, -h / 2 + r);
            ctx.arcTo(-w / 2, -h / 2, -w / 2 + r, -h / 2, r);
            ctx.closePath();
        } else {
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
        }

        this.fillAndStroke(ctx);
    }
    renderCircle (ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(this.width, this.height) / 2, 0, Math.PI * 2);
        this.fillAndStroke(ctx);
    }
    renderTriangle (ctx) {
        const w = this.width;
        const h = this.height;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(-w / 2, h / 2);
        ctx.closePath();
        this.fillAndStroke(ctx);
    }
    renderPolygon (ctx) {
        if (this.styles.points.length < 3) return;

        // Apply borderRadius to polygon
        if (this.styles.borderRadius > 0) {
            this._renderPolygonWithRadius(ctx);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.styles.points[0].x, this.styles.points[0].y);
            for (let i = 1; i < this.styles.points.length; i++) {
                ctx.lineTo(this.styles.points[i].x, this.styles.points[i].y);
            }
            ctx.closePath();
        }

        this.fillAndStroke(ctx);
    }
    renderStar (ctx) {
        const outerRadius = Math.min(this.width, this.height) / 2;
        const innerRadius = outerRadius * 0.4;
        const spikes = this.styles.spikes || 5;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(0, -outerRadius);

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = step * i - Math.PI / 2;
            ctx.lineTo(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
            );
        }

        ctx.closePath();
        this.fillAndStroke(ctx);
    }

    fillAndStroke (ctx) {
        if (this.styles.backgroundGradient) {
            const gradient = this._createGradient(ctx);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.styles.backgroundColor || this.styles.fill;
        }

        if (this.styles.borderWidth > 0) {
            ctx.strokeStyle = this.styles.borderColor;
            ctx.lineWidth = this.styles.borderWidth;

            if (this.styles.borderStyle === 'dashed') {
                ctx.setLineDash([this.styles.borderWidth * 2]);
            } else if (this.styles.borderStyle === 'dotted') {
                ctx.setLineDash([this.styles.borderWidth]);
            }
        }

        ctx.fill();
        if (this.styles.borderWidth > 0) {
            ctx.stroke();
        }
    }

    _renderPolygonWithRadius (ctx) {
        const points = this.styles.points;
        const radius = this.styles.borderRadius;

        ctx.beginPath();

        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            const next = points[(i + 1) % points.length];
            const prev = points[(i - 1 + points.length) % points.length];

            // Calculating direction vectors
            const toPrev = {x: prev.x - current.x, y: prev.y - current.y};
            const toNext = {x: next.x - current.x, y: next.y - current.y};

            // Normalization of vectors
            const toPrevLength = Math.sqrt(toPrev.x * toPrev.x + toPrev.y * toPrev.y);
            const toNextLength = Math.sqrt(toNext.x * toNext.x + toNext.y * toNext.y);

            toPrev.x /= toPrevLength;
            toPrev.y /= toPrevLength;
            toNext.x /= toNextLength;
            toNext.y /= toNextLength;

            // Calculation of control points
            const r = Math.min(radius, toPrevLength / 2, toNextLength / 2);
            const cp1 = {
                x: current.x + toPrev.x * r,
                y: current.y + toPrev.y * r
            };
            const cp2 = {
                x: current.x + toNext.x * r,
                y: current.y + toNext.y * r
            };

            if (i === 0) {
                ctx.moveTo(cp1.x, cp1.y);
            } else {
                ctx.lineTo(cp1.x, cp1.y);
            }

            ctx.quadraticCurveTo(current.x, current.y, cp2.x, cp2.y);
        }

        ctx.closePath();
    }
    _renderBackgroundImage (ctx) {
        if (!this.styles.backgroundImage) return;

        if (this.styles.borderRadius > 0) {
            this._clipPath(ctx);
        }

        this.style('backgroundColor', 'transparent');

        const image = this.styles.backgroundImage;
        const fit = this.styles.backgroundImageFit;
        const position = this.styles.backgroundImagePosition;
        const repeat = this.styles.backgroundImageRepeat;

        let targetWidth = this.width;
        let targetHeight = this.height;
        let targetX = -this.width / 2;
        let targetY = -this.height / 2;

        if (!repeat) {
            // Calculating image size based on fit
            const scale = fit === 'contain' ? Math.min(
                this.width / image.width, this.height / image.height
            ) : fit === 'cover' ? Math.max(
                this.width / image.width, this.height / image.height
            ) : 1;

            if (fit !== 'stretch') {
                targetWidth = image.width * scale;
                targetHeight = image.height * scale;
            }

            // Calculating position based on position
            if (position.includes('center')) {
                targetX = -targetWidth / 2;
                targetY = -targetHeight / 2;
            } else {
                if (position.includes('left')) targetX = -this.width / 2;
                if (position.includes('right')) targetX = this.width / 2 - targetWidth;
                if (position.includes('top')) targetY = -this.height / 2;
                if (position.includes('bottom')) targetY = this.height / 2 - targetHeight;
            }

            ctx.drawImage(image, targetX, targetY, targetWidth, targetHeight);
        } else {
            // Repeating image rendering
            ctx.fillStyle = ctx.createPattern(image, 'repeat');
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
    }
    _renderText (ctx) {
        if (!this.styles.text) return;

        ctx.font = this.styles.font;
        ctx.textAlign = this.styles.textAlign;
        ctx.textBaseline = this.styles.textBaseline;
        ctx.fillStyle = this.styles.color;

        const lines = this.styles.text.toString().split('\n');
        const lineHeight = parseInt(this.styles.font) * this.styles.lineHeight;

        lines.forEach((line, index) => {
            let textX = 0;
            const textY = (index - (lines.length - 1) / 2) * lineHeight;

            switch (this.styles.textAlign) {
                case 'left':
                    textX = -this.width / 2;
                    break;
                case 'right':
                    textX = this.width / 2;
                    break;
                default:
                    textX = 0;
            }

            ctx.fillText(line, textX, textY);
        });
    }
    _clipPath (ctx) {
        // Create a clipping path based on shape and borderRadius
        const w = this.width;
        const h = this.height;
        const r = this.styles.borderRadius;

        if (r > 0) {
            ctx.beginPath();
            ctx.moveTo(-w / 2 + r, -h / 2);
            ctx.lineTo(w / 2 - r, -h / 2);
            ctx.arcTo(w / 2, -h / 2, w / 2, -h / 2 + r, r);
            ctx.lineTo(w / 2, h / 2 - r);
            ctx.arcTo(w / 2, h / 2, w / 2 - r, h / 2, r);
            ctx.lineTo(-w / 2 + r, h / 2);
            ctx.arcTo(-w / 2, h / 2, -w / 2, h / 2 - r, r);
            ctx.lineTo(-w / 2, -h / 2 + r);
            ctx.arcTo(-w / 2, -h / 2, -w / 2 + r, -h / 2, r);
            ctx.closePath();
            ctx.clip();
        }
    }
    _applyClip (ctx) {
        if (!this.styles.clip) return;

        if (typeof this.styles.clip === 'function') {
            // Custom clip with function
            this.styles.clip.call(this, ctx);
            ctx.clip();
        } else if (Array.isArray(this.styles.clip)) {
            // clip with an array of points
            ctx.beginPath();
            ctx.moveTo(this.styles.clip[0].x, this.styles.clip[0].y);
            for (let i = 1; i < this.styles.clip.length; i++) {
                ctx.lineTo(this.styles.clip[i].x, this.styles.clip[i].y);
            }
            ctx.closePath();
            ctx.clip();
        }
    }
    _applyFilters (ctx) {
        // Apply blur
        if (this.styles.blur > 0) {
            ctx.filter = `blur(${this.styles.blur}px)`;
        }

        // Applying CSS filters
        if (this.styles.filter) {
            ctx.filter = this.styles.filter;
        }
    }
    _applyMask (ctx) {
        if (!this.styles.mask) return;

        ctx.save();

        if (typeof this.styles.mask === 'function') {
            // Custom mask with function
            this.styles.mask.call(this, ctx);
        } else if (this.styles.mask instanceof Entity) {
            // Using another entity as a mask
            ctx.globalCompositeOperation = 'destination-in';
            this.styles.mask.render(ctx);
        }

        ctx.restore();
    }
    _renderCustomPath (ctx) {
        if (typeof this.styles.customPath === 'function') {
            this.styles.customPath(ctx);
        }
    }
    _renderSprite (ctx) {
        if (!this.sprite || !this.sprite.asset) return;

        const spriteAsset = this.sprite.asset;
        if (spriteAsset.type !== 'spritesheet') return;

        const currentAnimation = this.sprite.animations[this.sprite.currentAnimation];
        if (!currentAnimation) return;

        const frameIndex = currentAnimation.frames[this.sprite.currentFrame];
        const frame = spriteAsset.config.frames[frameIndex];
        if (!frame) return;

        ctx.save();

        // Translate to entity coordinates
        ctx.translate(-this.width / 2, -this.height / 2);

        // Render background color if present.
        if (this.styles.backgroundColor || this.styles.backgroundGradient) {
            if (this.styles.backgroundGradient) {
                ctx.fillStyle = this._createGradient(ctx);
            } else {
                ctx.fillStyle = this.styles.backgroundColor;
            }
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Getting spritesheet parameters
        const {
            width: frameWidth,
            height: frameHeight,
            columns,
            margin = [0, 0],
            originOffset = [0, 0]
        } = spriteAsset.config;

        // Calculating the scale and dimensions of the target
        let targetWidth, targetHeight, scale;

        if (this.sprite.width !== null && this.sprite.height !== null) {
            targetWidth = this.sprite.width;
            targetHeight = this.sprite.height;
            scale = targetWidth / frameWidth;
        } else {
            const widthRatio = this.width / frameWidth;
            const heightRatio = this.height / frameHeight;
            scale = Math.max(widthRatio, heightRatio);
            targetWidth = frameWidth * scale;
            targetHeight = frameHeight * scale;
        }

        // Calculating center position with sprite offsets
        const x = (this.width - targetWidth) * 0.5 + (this.sprite.x || 0);
        const y = (this.height - targetHeight) * 0.5 + (this.sprite.y || 0);

        // Calculate the frame position in the spritesheet considering margin and originOffset
        const col = frameIndex % columns;
        const row = Math.floor(frameIndex / columns);

        const sourceX = originOffset[0] + col * (frameWidth + margin[0]);
        const sourceY = originOffset[1] + row * (frameHeight + margin[1]);

        // Render Frame
        ctx.drawImage(
            spriteAsset.asset,
            sourceX, sourceY,         // Source position with margin and offset
            frameWidth, frameHeight,  // Source dimensions
            x, y,                     // Target position
            targetWidth, targetHeight // Target dimensions
        );

        // Create renderInfo
        const renderInfo = {
            frame: {
                current: this.sprite.currentFrame,
                total: currentAnimation.frames.length,
                index: frameIndex,
                data: {
                    x: sourceX,
                    y: sourceY,
                    width: frameWidth,
                    height: frameHeight,
                    column: col,
                    row: row
                }
            },
            timing: {
                lastUpdate: this.sprite.lastFrameUpdate,
                frameRate: currentAnimation.frameRate,
                elapsedSinceLastFrame: performance.now() - this.sprite.lastFrameUpdate
            },
            render: {
                source: {
                    x: sourceX,
                    y: sourceY,
                    width: frameWidth,
                    height: frameHeight
                },
                target: {
                    x,
                    y,
                    width: targetWidth,
                    height: targetHeight,
                    scale
                }
            },
            animation: {
                name: this.sprite.currentAnimation,
                isPlaying: this.sprite.playing,
                loop: currentAnimation.loop
            },
            sprite: {
                asset: spriteAsset.id,
                totalFrames: currentAnimation.frames.length,
                config: {
                    columns,
                    rows: spriteAsset.config.rows,
                    width: frameWidth,
                    height: frameHeight,
                    originOffset,
                    margin
                }
            }
        };

        this.trigger('spriteRender', renderInfo);
        currentAnimation.onRender?.call(this, renderInfo);

        // Render border if present
        if (this.styles.borderWidth > 0) {
            ctx.strokeStyle = this.styles.borderColor;
            ctx.lineWidth = this.styles.borderWidth;

            if (this.styles.borderStyle === 'dashed') {
                ctx.setLineDash([this.styles.borderWidth * 2]);
            } else if (this.styles.borderStyle === 'dotted') {
                ctx.setLineDash([this.styles.borderWidth]);
            }

            ctx.strokeRect(0, 0, this.width, this.height);
        }

        ctx.restore();
    }
    /** ======== END ======== */

    /** ======== COLLISIONS ======== */
    isCollidable () {
        return this.collision.enabled;
    }
    enableCollision () {
        this.collision.enabled = true;
        return this;
    }
    disableCollision () {
        this.collision.enabled = false;
        return this;
    }
    setCollisionGroup (group) {
        this.collision.group = group;
        return this;
    }
    setCollisionPoints (points) {
        if (!Array.isArray(points) || points.length < 3) {
            throw new Error('Collision points must be an array with at least 3 points');
        }

        // Validate points structure
        points.forEach(point => {
            if (!point.x || !point.y) {
                throw new Error('Each collision point must have x and y coordinates');
            }
        });

        this.collision.points = points;

        // Clear collision cache if exists
        if (this.engine && this.engine.collision) {
            this.engine.collision.clearCache(this.id);
        }

        return this;
    }
    clearCollisionPoints () {
        this.collision.points = null;

        // Clear collision cache if exists
        if (this.engine && this.engine.collision) {
            this.engine.collision.clearCache(this.id);
        }

        return this;
    }

    getBounds () {
        const bounds = {
            x: this.absoluteX + this.collision.x,
            y: this.absoluteY + this.collision.y,
            width: this.collision.width * Math.abs(this.styles.scaleX * this.styles.scale),
            height: this.collision.height * Math.abs(this.styles.scaleY * this.styles.scale)
        };

        // If we had a rotation
        if (this.styles.rotation !== 0) {
            const rad = (this.styles.rotation * Math.PI) / 180;
            const cos = Math.abs(Math.cos(rad));
            const sin = Math.abs(Math.sin(rad));

            // Calculating the new width and height after rotation
            const w = bounds.width * cos + bounds.height * sin;
            const h = bounds.width * sin + bounds.height * cos;

            bounds.width = w;
            bounds.height = h;
        }

        return bounds;
    }
    /** ======== END ======== */

    /** ======== COLORS ======== */
    _createGradient (ctx) {
        const grad = this.styles.backgroundGradient;
        let gradient;

        if (grad.type === 'linear') {
            gradient = ctx.createLinearGradient(
                grad.x1 || -this.width / 2,
                grad.y1 || -this.height / 2,
                grad.x2 || this.width / 2,
                grad.y2 || this.height / 2
            );
        } else if (grad.type === 'radial') {
            gradient = ctx.createRadialGradient(
                0, 0, 0,
                0, 0, Math.max(this.width, this.height) / 2
            );
        }

        grad.stops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });

        return gradient;
    }
    _interpolateColor (color1, color2, progress) {
        // Convert hex colors to RGB
        const c1 = this.engine.hexToRgb(color1);
        const c2 = this.engine.hexToRgb(color2);

        // Calculate the intermediate color
        const r = Math.round(c1.r + (c2.r - c1.r) * progress);
        const g = Math.round(c1.g + (c2.g - c1.g) * progress);
        const b = Math.round(c1.b + (c2.b - c1.b) * progress);

        return `rgb(${r},${g},${b})`;
    }
    /** ======== END ======== */

    /** ======== DEBUGGER ======== */
    _renderDebugInfo (ctx) {
        if (!this.collision.enabled) return;

        // Setting basic styles for debug display
        ctx.lineWidth = 1;

        if (this.collision.points) {
            this._renderCustomCollisionShape(ctx);
        } else {
            this._renderCollisionShape(ctx);
        }
    }
    _renderCustomCollisionShape (ctx) {
        const points = this.collision.points;
        if (!points || points.length < 2) return;

        // Draw the outer line in white for greater clarity.
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        if (this.styles.customPath) {
            let i = 0;
            while (i < points.length - 1) {
                const curr = points[i];
                const next = points[i + 1];

                const control1 = {
                    x: curr.x + (next.x - curr.x) / 3,
                    y: curr.y + (next.y - curr.y) / 3
                };
                const control2 = {
                    x: curr.x + 2 * (next.x - curr.x) / 3,
                    y: curr.y + 2 * (next.y - curr.y) / 3
                };

                ctx.bezierCurveTo(
                    control1.x, control1.y,
                    control2.x, control2.y,
                    next.x, next.y
                );

                i++;
            }
        } else {
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }

        ctx.closePath();
        ctx.stroke();

        // Draw a fill with a semi-transparent red color.
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.fill();
        ctx.stroke();

        // Show points in advanced debug mode
        if (this.engine.debugger.level === 'advanced') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
    _renderCollisionShape (ctx) {
        ctx.save();

        // Calculate offset for collision box
        const offsetX = (-this.width / 2) + this.collision.x + (this.collision.width / 2);
        const offsetY = (-this.height / 2) + this.collision.y + (this.collision.height / 2);

        ctx.translate(offsetX, offsetY);

        const originalStyles = {...this.styles};

        const debugStyles = {
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            borderColor: 'rgba(255, 0, 0, 0.5)',
            borderWidth: 1,
            color: 'rgba(255, 0, 0, 0.3)'
        };

        // Temporarily change width and height for collision box
        const originalWidth = this.width;
        const originalHeight = this.height;
        this.width = this.collision.width;
        this.height = this.collision.height;

        Object.assign(this.styles, debugStyles);
        this.renderShape(ctx);

        // Restore original dimensions
        this.width = originalWidth;
        this.height = originalHeight;
        this.styles = originalStyles;

        ctx.restore();
    }
    /** ======== END ======== */

    kill () {
        if (!this.engine) return false;

        if (this.engine.physics && this.physics)
            this.engine.physics.removeEntity(this);

        // Reset engine states if this entity is involved
        if (this.engine.draggedEntity === this)
            this.engine.draggedEntity = null;
        if (this.engine.hoveredEntity === this)
            this.engine.hoveredEntity = null;

        // Remove from collision system if enabled
        if (this.engine.collisionEnabled && this.collision?.enabled)
            this.engine.collision.remove(this);

        // Remove from parent if exists
        if (this.parent)
            this.parent.children.delete(this.id);

        // Kill all children
        this.children.forEach(child => child.kill());

        // Remove from engine
        this.engine.entities.delete(this.id);

        // Trigger
        this.trigger('kill');
        this.engine.trigger('kill', this.id);

        // Clear references
        this.parent = null;
        this.engine = null;

        return true;
    }

    #normalizeBackground (config = {}) {
        const background = {};

        background.backgroundColor = config.fill ?? config.backgroundColor;
        background.backgroundGradient = config.gradient ?? config.backgroundGradient;

        let imageConfig = config.image ?? config.backgroundImage;

        if (typeof imageConfig === 'string') {
            background.backgroundImage = this.#getAssetImage(imageConfig);
            background.backgroundImageFit = config.backgroundImageFit || 'contain';
            background.backgroundImagePosition = config.backgroundImagePosition || 'center';
            background.backgroundImageRepeat = config.backgroundImageRepeat || false;
        } else if (typeof imageConfig === 'object' && (imageConfig?.asset || imageConfig?.src)) {
            background.backgroundImage = imageConfig?.asset || this.#getAssetImage(imageConfig.src);
            background.backgroundImageFit = imageConfig.fit || 'contain';
            background.backgroundImagePosition = imageConfig.position || 'center';
            background.backgroundImageRepeat = imageConfig.repeat || false;
        }

        return background;
    }
    #getAssetImage (id) {
        if (typeof id === 'object' && id?.asset)
            return id.asset;
        return this.engine.getAsset?.(id)?.asset;
    }

}

export default Entity;