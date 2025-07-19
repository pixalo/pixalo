/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

import Particle from "./Particle.js";

class Emitters {

    constructor (engine) {
        this.engine = engine;
        this.emitters = new Map();
        this.particlePool = []; // Object pooling for performance
        this.maxPoolSize = 1000;
    }

    /** ========== EMITTER MANAGEMENT ========== */
    create (id, config = {}) {
        const emitter = new Emitter(id, config, this.engine);
        this.emitters.set(id, emitter);
        return emitter;
    }
    get (id) {
        return this.emitters.get(id) || null;
    }
    remove (id) {
        const emitter = this.emitters.get(id);
        if (emitter) {
            emitter.destroy();
            this.emitters.delete(id);
            return true;
        }
        return false;
    }
    getAll () {
        return Array.from(this.emitters.values());
    }
    clear () {
        this.emitters.forEach(emitter => emitter.destroy());
        this.emitters.clear();
        this.particlePool = [];
    }
    /** ======== END ======== */

    /** ========== PARTICLE POOLING ========== */
    getParticle () {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return new Particle();
    }
    returnParticle (particle) {
        if (this.particlePool.length < this.maxPoolSize) {
            particle.reset();
            this.particlePool.push(particle);
        }
    }
    /** ======== END ======== */

    /** ========== UPDATE & RENDER ========== */
    update (deltaTime) {
        this.emitters.forEach(emitter => {
            if (emitter.active) {
                emitter.update(deltaTime);
            }
        });
    }
    render (ctx) {
        this.emitters.forEach(emitter => {
            if (emitter.visible) {
                emitter.render(ctx);
            }
        });
    }
    /** ======== END ======== */

    /** ========== PRESETS ========== */
    explosion (x, y, options = {}) {
        const config = {
            position: {x, y},
            shape: 'invisible',
            emission: {
                type: 'point',
                rate: 0,
                burst: options.particleCount || 30,
                lifetime: options.lifetime || 1500
            },
            particle: {
                velocity: {
                    min: {x: -150, y: -150},
                    max: {x: 150, y: -50}
                },
                acceleration: {x: 0, y: 100},
                size: {min: 3, max: 8},
                color: {
                    start: options.startColor || '#ff4444',
                    end: options.endColor || '#ffaa00'
                },
                alpha: {start: 1, end: 0},
                rotation: {min: 0, max: 360},
                rotationSpeed: {min: -360, max: 360}
            },
            autoDestroy: true
        };

        const emitter = this.create(`explosion_${Date.now()}`, config);
        emitter.start();
        emitter.burst(options.particleCount || 30);
        return emitter;
    }
    fire (x, y, options = {}) {
        const config = {
            position: {x, y},
            shape: 'invisible',
            emission: {
                type: 'point',
                rate: options.rate || 40,
                lifetime: options.lifetime || 1200
            },
            particle: {
                velocity: {
                    min: {x: -30, y: -80},
                    max: {x: 30, y: -40}
                },
                acceleration: {x: 0, y: -20},
                size: {min: 2, max: 6},
                color: {
                    start: '#ff4444',
                    end: '#ff8800'
                },
                alpha: {start: 0.8, end: 0}
            }
        };

        const emitter = this.create(`fire_${Date.now()}`, config);
        emitter.start();
        return emitter;
    }
    smoke (x, y, options = {}) {
        const config = {
            position: {x, y},
            shape: 'invisible',
            emission: {
                type: 'point',
                rate: options.rate || 15,
                lifetime: options.lifetime || 3000
            },
            particle: {
                velocity: {
                    min: {x: -20, y: -60},
                    max: {x: 20, y: -30}
                },
                acceleration: {x: 0, y: -10},
                size: {min: 8, max: 16},
                color: {
                    start: '#666666',
                    end: '#cccccc'
                },
                alpha: {start: 0.6, end: 0}
            }
        };

        const emitter = this.create(`smoke_${Date.now()}`, config);
        emitter.start();
        return emitter;
    }
    /** ======== END ======== */

}

class Emitter {

    constructor (id, config, engine) {
        this.id = id;
        this.engine = engine;
        this.particles = [];
        this.active = false;
        this.visible = true;

        // Position and movement
        this.x = config.position?.x || 0;
        this.y = config.position?.y || 0;
        this.targetX = this.x;
        this.targetY = this.y;
        this.moveAnimation = null;

        // Emitter visual shape
        this.shape = config.shape || 'invisible';
        this.size = config.size || 10;
        this.color = config.color || '#ff0000';
        this.opacity = config.opacity || 0.5;

        // Emission settings
        this.emission = {
            type: config.emission?.type || 'point',
            rate: config.emission?.rate || 30,
            lifetime: config.emission?.lifetime || 2000,
            burst: config.emission?.burst || 0,
            ...config.emission
        };

        // Particle settings
        this.particle = {
            velocity: config.particle?.velocity || {min: {x: -50, y: -50}, max: {x: 50, y: 50}},
            acceleration: config.particle?.acceleration || {x: 0, y: 0},
            size: config.particle?.size || {min: 2, max: 4},
            color: config.particle?.color || {start: '#ffffff', end: '#000000'},
            alpha: config.particle?.alpha || {start: 1, end: 0},
            rotation: config.particle?.rotation || {min: 0, max: 0},
            rotationSpeed: config.particle?.rotationSpeed || {min: 0, max: 0},
            texture: config.particle?.texture || null
        };

        // Timing
        this.lastEmissionTime = 0;
        this.emissionInterval = 1000 / this.emission.rate;
        this.autoDestroy = config.autoDestroy || false;
    }

    /** ========== CONTROLS ========== */
    start () {
        this.active = true;
        this.lastEmissionTime = performance.now();
        return this;
    }
    stop () {
        this.active = false;
        return this;
    }
    pause () {
        this.active = false;
        return this;
    }
    resume () {
        this.active = true;
        this.lastEmissionTime = performance.now();
        return this;
    }
    burst (count) {
        for (let i = 0; i < count; i++) {
            this.emitParticle();
        }
        return this;
    }
    /** ======== END ======== */

    /** ========== MOVEMENT ========== */
    move (x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        if (this.moveAnimation) {
            this.moveAnimation = null;
        }
        return this;
    }
    moveTo (x, y, options = {}) {
        this.targetX = x;
        this.targetY = y;

        const startX = this.x;
        const startY = this.y;
        const duration = options.duration || 1000;
        const easing = this.engine.Ease[options.easing] || this.engine.Ease.linear;

        const startTime = performance.now();

        this.moveAnimation = {
            startX, startY,
            targetX: x, targetY: y,
            duration, easing, startTime
        };

        return this;
    }
    /** ======== END ======== */

    /** ========== PARTICLE EMISSION ========== */
    emitParticle () {
        const particle = this.engine.emitters.getParticle();
        const emissionPos = this.getEmissionPosition();

        particle.init({
            x: emissionPos.x,
            y: emissionPos.y,
            velocity: this.randomizeValue(this.particle.velocity),
            acceleration: this.particle.acceleration,
            size: this.randomizeValue(this.particle.size),
            color: this.particle.color,
            alpha: this.particle.alpha,
            rotation: this.randomizeValue(this.particle.rotation),
            rotationSpeed: this.randomizeValue(this.particle.rotationSpeed),
            lifetime: this.emission.lifetime,
            texture: this.engine.getAsset(this.particle.texture)?.asset,
        });

        this.particles.push(particle);
    }
    getEmissionPosition () {
        switch (this.emission.type) {
            case 'point':
                return {x: this.x, y: this.y};

            case 'circle':
                const angle = Math.random() * Math.PI * 2;
                const radius = this.emission.edge ?
                    this.emission.radius :
                    Math.random() * this.emission.radius;
                return {
                    x: this.x + Math.cos(angle) * radius,
                    y: this.y + Math.sin(angle) * radius
                };

            case 'rectangle':
                if (this.emission.edge) {
                    // Emit from rectangle edges
                    const side = Math.floor(Math.random() * 4);
                    const w = this.emission.width;
                    const h = this.emission.height;
                    switch (side) {
                        case 0:
                            return {x: this.x + Math.random() * w - w / 2, y: this.y - h / 2};
                        case 1:
                            return {x: this.x + w / 2, y: this.y + Math.random() * h - h / 2};
                        case 2:
                            return {x: this.x + Math.random() * w - w / 2, y: this.y + h / 2};
                        case 3:
                            return {x: this.x - w / 2, y: this.y + Math.random() * h - h / 2};
                    }
                } else {
                    // Emit from rectangle area
                    return {
                        x: this.x + (Math.random() - 0.5) * this.emission.width,
                        y: this.y + (Math.random() - 0.5) * this.emission.height
                    };
                }

            case 'line':
                const t = Math.random();
                return {
                    x: this.x + this.emission.start.x + t * (this.emission.end.x - this.emission.start.x),
                    y: this.y + this.emission.start.y + t * (this.emission.end.y - this.emission.start.y)
                };

            default:
                return {x: this.x, y: this.y};
        }
    }
    randomizeValue (value) {
        if (typeof value === 'number') return value;
        if (value.min !== undefined && value.max !== undefined) {
            if (typeof value.min === 'object') {
                return {
                    x: value.min.x + Math.random() * (value.max.x - value.min.x),
                    y: value.min.y + Math.random() * (value.max.y - value.min.y)
                };
            }
            return value.min + Math.random() * (value.max - value.min);
        }
        return value;
    }
    /** ======== END ======== */

    /** ========== UPDATE ========== */
    update (deltaTime) {
        // Update movement animation
        if (this.moveAnimation) {
            const elapsed = performance.now() - this.moveAnimation.startTime;
            const progress = Math.min(elapsed / this.moveAnimation.duration, 1);
            const easedProgress = this.moveAnimation.easing(progress);

            this.x = this.moveAnimation.startX +
                (this.moveAnimation.targetX - this.moveAnimation.startX) * easedProgress;
            this.y = this.moveAnimation.startY +
                (this.moveAnimation.targetY - this.moveAnimation.startY) * easedProgress;

            if (progress >= 1) {
                this.moveAnimation = null;
            }
        }

        // Emit new particles
        if (this.active && this.emission.rate > 0) {
            const now = performance.now();
            if (now - this.lastEmissionTime >= this.emissionInterval) {
                this.emitParticle();
                this.lastEmissionTime = now;
            }
        }

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);

            if (particle.isDead()) {
                this.engine.emitters.returnParticle(particle);
                this.particles.splice(i, 1);
            }
        }

        // Auto destroy if no particles left
        if (this.autoDestroy && !this.active && this.particles.length === 0) {
            this.engine.emitters.remove(this.id);
        }
    }
    /** ======== END ======== */

    /** ========== RENDER ========== */
    render (ctx) {
        // Render particles
        this.particles.forEach(particle => {
            particle.render(ctx);
        });

        // Render emitter shape (for debug/visual feedback)
        if (this.shape !== 'invisible') {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            switch (this.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'square':
                    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                    break;

                case 'diamond':
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - this.size / 2);
                    ctx.lineTo(this.x + this.size / 2, this.y);
                    ctx.lineTo(this.x, this.y + this.size / 2);
                    ctx.lineTo(this.x - this.size / 2, this.y);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'cross':
                    const crossSize = this.size / 6;
                    ctx.fillRect(this.x - this.size / 2, this.y - crossSize, this.size, crossSize * 2);
                    ctx.fillRect(this.x - crossSize, this.y - this.size / 2, crossSize * 2, this.size);
                    break;
            }

            ctx.restore();
        }
    }
    /** ======== END ======== */

    /** ========== CLEANUP ========== */
    destroy () {
        this.particles.forEach(particle => {
            this.engine.emitters.returnParticle(particle);
        });
        this.particles = [];
        this.active = false;
    }
    /** ======== END ======== */

}

export default Emitters;