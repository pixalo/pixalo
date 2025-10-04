/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

class Debugger {

    constructor (engine, config = {}) {
        this.engine = engine;

        this.active = config.active || false;
        this.panel  = config.panel  ?? true;
        this.hotKey = config.hotKey ?? true;

        this.fps = config.fps || {
            target: 60,
            actual: 60,
            ratio: 100
        };

        this.lastFpsUpdate = performance.now();
        this.frameCount = 0;
        this.targetFrameCount = 0;

        this.items = new Map();

        this.styles = {
            fillColor: config.fillColor || 'rgba(255, 0, 0, 0.3)',
            strokeColor: config.stroke || 'rgba(255, 0, 0, 0.8)',
            lineWidth: config.lineWidth ?? 1,
            pointColor: config.pointColor || 'rgba(255, 255, 255, 0.8)',
            pointRadius: config.lineWidth ?? 2,
            ...config.styles
        };

        if (this.active) {
            this.engine.on('ctrl+d', () => {
                if (!this.hotKey) return;
                this.active = !this.active;
            });
        }
    }

    /** ======== CONTROL ======== */
    enableDebugger () {
        this.active = true;
        return this;
    }
    disableDebugger () {
        this.active = false;
        return this;
    }
    showPanel () {
        this.panel = true;
    }
    hidePanel () {
        this.panel = false;
    }
    /** ======== END ======== */

    /** ======== LOGS ======== */
    log (...args) {
        if (this.active)
            console.log('%c[Pixalo LOG]', 'color: #2196f3;', ...args);
        return this;
    }
    info (...args) {
        if (this.active)
            console.info('%c[Pixalo INFO]', 'color: #4491F8;', ...args);
        return this;
    }
    warn (...args) {
        if (this.active)
            console.warn('%c[Pixalo WARN]', 'color: #ff9800;', ...args);
        return this;
    }
    error (...args) {
        if (this.active)
            console.error('%c[Pixalo ERROR]', 'color: #f44336;', ...args);
        return this;
    }
    /** ======== END ======== */

    /** ======== ITEMS ======== */
    addItem (debugId, config) {
        if (this.engine.isEntity(config)) {
            this.items.set(debugId, {
                entity: config,
                type: 'entity'
            });
        } else {
            this.items.set(debugId, {
                ...this._normalizeItem(config),
                type: 'static'
            });
        }
        return this;
    }
    removeItem (debugId) {
        return this.items.delete(debugId);
    }
    hasItem (debugId) {
        return this.items.has(debugId);
    }
    getItem (debugId) {
        return this.items.get(debugId);
    }
    getAllItems () {
        return Array.from(this.items.entries());
    }
    updateItem (debugId, config) {
        if (!this.items.has(debugId)) return false;

        const existingItem = this.items.get(debugId);
        if (existingItem.type === 'static') {
            const updatedItem = {...existingItem, ...this._normalizeItem(config)};
            this.items.set(debugId, updatedItem);
        }
        return true;
    }
    clearItems () {
        this.items.clear();
        return this;
    }
    _normalizeItem (config) {
        const isEntity = this.engine.isEntity(config);
        const styles = isEntity ? config.styles : config;

        const collision = {
            x: config.collision?.x || 0,
            y: config.collision?.y || 0,
            width: config.collision?.width   || config.width,
            height: config.collision?.height || config.height,
            points: config.collision?.points || null
        };

        return {
            x: config.absoluteX || config.x || 0,
            y: config.absoluteY || config.y || 0,
            width: collision.width,
            height: collision.height,
            shape: styles.shape || 'rectangle',
            scale: styles.scale || 1,
            scaleX: styles.scaleX || 1,
            scaleY: styles.scaleY || 1,
            skewX: styles.skewX || 0,
            skewY: styles.skewY || 0,
            rotation: styles.rotation || 0,
            borderRadius: styles.borderRadius || 0,
            spikes: styles.spikes || 5,
            flipX: styles.flipX || false,
            flipY: styles.flipY || false,
            points: styles.points || [],
            customPath: styles.customPath || null,
            collision,
            visible: styles.visible ?? true,
            type: isEntity ? 'entity' : 'static',
            ...(isEntity && {entity: config})
        };
    }
    /** ======== END ======== */

    /** ======== RENDERING ======== */
    renderPanel () {
        if (!this.active || !this.panel) return;

        const ctx = this.engine.ctx;
        const padding = 0;
        const lineHeight = 18;
        const sectionSpacing = 20;
        let y = padding + 20;

        let totalEntities = 0;
        let invisibleEntities = 0;
        let activeCollisions = 0;
        let activePhysics = 0;

        const countEntities = (entity) => {
            totalEntities++;
            if (!entity.styles.visible) invisibleEntities++;
            if (entity.collision?.enabled) activeCollisions++;
            if (entity.physics) activePhysics++;
            entity.children.forEach(countEntities);
        };
        this.engine.entities.forEach(countEntities);

        ctx.save();

        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(padding, padding, 125, this.engine.baseHeight);

        // Performance Section
        ctx.font = 'bold 14px "Consolas", "Monaco", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#F3A71B';
        ctx.fillText('⚡ PERFORMANCE', padding + 2, y);
        y += sectionSpacing;

        ctx.font = '12px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`FPS: `, padding + 8, y);
        ctx.fillStyle = this.fps.actual >= this.fps.target * 0.9 ? '#4AFF4A' : this.fps.actual >= this.fps.target * 0.7 ? '#F3A71B' : '#FF4444';
        ctx.fillText(`${this.fps.actual}`, padding + 40, y);
        ctx.fillStyle = '#B0B0B0';
        ctx.fillText(`/ ${this.fps.target}`, padding + 55, y);
        y += lineHeight;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Ratio: `, padding + 8, y);
        const ratio = this.fps.ratio || 0;
        ctx.fillStyle = ratio >= 90 ? '#4AFF4A' : ratio >= 70 ? '#F3A71B' : '#FF4444';
        ctx.fillText(`${ratio}%`, padding + 55, y);
        y += lineHeight + sectionSpacing;

        // System Section
        ctx.font = 'bold 14px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#F3A71B';
        ctx.fillText('🔧 SYSTEM', padding + 2, y);
        y += sectionSpacing;

        ctx.font = '12px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Quality: `, padding + 8, y);
        ctx.fillStyle = '#8FE5D4';
        ctx.fillText(`${this.engine.config.quality}x`, padding + 65, y);
        y += lineHeight;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Canvas: `, padding + 8, y);
        ctx.fillStyle = '#8FE5D4';
        ctx.fillText(`${this.engine.canvas.width}×${this.engine.canvas.height}`, padding + 65, y);
        y += lineHeight + sectionSpacing;

        // Grid Section
        ctx.font = 'bold 14px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#F3A71B';
        ctx.fillText('📐 GRID', padding + 2, y);
        y += sectionSpacing;

        ctx.font = '12px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Status: `, padding + 8, y);
        ctx.fillStyle = this.engine.gridEnabled ? '#4AFF4A' : '#666666';
        ctx.fillText(`${this.engine.gridEnabled ? 'ON' : 'OFF'}`, padding + 60, y);

        if (this.engine.gridEnabled) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`Size: `, padding + 8, y);
            ctx.fillStyle = '#8FE5D4';
            ctx.fillText(`${this.engine.grid.width}×${this.engine.grid.height}`, padding + 45, y);
            y += lineHeight;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`Major: `, padding + 8, y);
            ctx.fillStyle = '#8FE5D4';
            ctx.fillText(`${this.engine.grid.majorGridEvery}`, padding + 50, y);
            y += lineHeight;
        }

        y += lineHeight + sectionSpacing;

        // Entities Section
        ctx.font = 'bold 14px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#F3A71B';
        ctx.fillText('🎭 ENTITIES', padding + 2, y);
        y += sectionSpacing;

        ctx.font = '12px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Total: `, padding + 8, y);
        ctx.fillStyle = '#4AFF4A';
        ctx.fillText(`${totalEntities}`, padding + 55, y);
        y += lineHeight;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Invisible: `, padding + 8, y);
        ctx.fillStyle = '#F3A71B';
        ctx.fillText(`${invisibleEntities}`, padding + 80, y);
        y += lineHeight;

        y += sectionSpacing;

        // Collision Section
        ctx.font = 'bold 14px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#F3A71B';
        ctx.fillText('⚙️ COLLISION', padding + 2, y);
        y += sectionSpacing;

        ctx.font = '12px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Engine: `, padding + 8, y);
        ctx.fillStyle = this.engine.collisionEnabled ? '#4AFF4A' : '#666666';
        ctx.fillText(`${this.engine.collisionEnabled ? 'ON' : 'OFF'}`, padding + 60, y);
        y += lineHeight;

        if (activeCollisions > 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`Objects: `, padding + 8, y);
            ctx.fillStyle = '#F3A71B';
            ctx.fillText(`${activeCollisions}`, padding + 65, y);
            y += lineHeight;
        }
        y += sectionSpacing;

        // Physics Section
        ctx.font = 'bold 14px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#F3A71B';
        ctx.fillText('⚙️ PHYSICS', padding + 2, y);
        y += sectionSpacing;

        ctx.font = '12px "Consolas", "Monaco", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Engine: `, padding + 8, y);
        ctx.fillStyle = this.engine.physicsEnabled ? '#4AFF4A' : '#666666';
        ctx.fillText(`${this.engine.physicsEnabled ? 'Box2D' : 'OFF'}`, padding + 60, y);
        y += lineHeight;

        if (activePhysics > 0) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`Objects: `, padding + 8, y);
            ctx.fillStyle = '#F3A71B';
            ctx.fillText(`${activePhysics}`, padding + 65, y);
        }

        ctx.restore();
    }
    render (ctx) {
        if (!this.active) return;

        this.items.forEach((item, debugId) => {
            let renderData;

            if (item.type === 'entity' && this.engine.isEntity(item.entity)) {
                renderData = this._normalizeItem(item.entity);
            } else {
                renderData = item;
            }

            if (renderData.visible && this.engine.camera.inView(renderData)) {
                this._renderItem(ctx, renderData);
            }
        });
    }
    _renderItem (ctx, item) {
        ctx.save();

        ctx.globalCompositeOperation = 'source-over';

        const offsetX = (-item.width / 2) + item.collision.x + (item.collision.width / 2);
        const offsetY = (-item.height / 2) + item.collision.y + (item.collision.height / 2);

        ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
        ctx.translate(offsetX, offsetY);

        ctx.rotate(item.rotation * Math.PI / 180);
        ctx.scale(
            (item.flipX ? -1 : 1) * item.scaleX * item.scale,
            (item.flipY ? -1 : 1) * item.scaleY * item.scale
        );
        ctx.transform(1, item.skewY, item.skewX, 1, 0, 0);

        this._renderShape(ctx, item);

        if (item.collision && item.collision.points) {
            this._renderCustomCollisionShape(ctx, item);
        }

        ctx.restore();
    }
    _renderShape (ctx, item) {
        ctx.strokeStyle = this.styles.strokeColor;
        ctx.fillStyle = this.styles.fillColor;
        ctx.lineWidth = this.styles.lineWidth;

        switch (item.shape) {
            case 'circle':
                this._renderCircle(ctx, item);
                break;
            case 'triangle':
                this._renderTriangle(ctx, item);
                break;
            case 'star':
                this._renderStar(ctx, item);
                break;
            case 'polygon':
                this._renderPolygon(ctx, item);
                break;
            default:
                this._renderRectangle(ctx, item);
        }
    }
    _renderRectangle (ctx, item) {
        const w = item.width;
        const h = item.height;

        if (item.borderRadius > 0) {
            const r = item.borderRadius;
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

        ctx.fill();
        ctx.stroke();
    }
    _renderCircle (ctx, item) {
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(item.width, item.height) / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    _renderTriangle (ctx, item) {
        const w = item.width;
        const h = item.height;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(-w / 2, h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    _renderPolygon (ctx, item) {
        if (item.points.length < 3) return;

        if (item.borderRadius > 0) {
            this._renderPolygonWithRadius(ctx, item);
        } else {
            ctx.beginPath();
            ctx.moveTo(item.points[0].x, item.points[0].y);
            for (let i = 1; i < item.points.length; i++) {
                ctx.lineTo(item.points[i].x, item.points[i].y);
            }
            ctx.closePath();
        }

        ctx.fill();
        ctx.stroke();
    }
    _renderStar (ctx, item) {
        const outerRadius = Math.min(item.width, item.height) / 2;
        const innerRadius = outerRadius * 0.4;
        const spikes = item.spikes || 5;
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
        ctx.fill();
        ctx.stroke();
    }
    _renderPolygonWithRadius (ctx, item) {
        const points = item.points;
        const radius = item.borderRadius;

        ctx.beginPath();

        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            const next = points[(i + 1) % points.length];
            const prev = points[(i - 1 + points.length) % points.length];

            const toPrev = {x: prev.x - current.x, y: prev.y - current.y};
            const toNext = {x: next.x - current.x, y: next.y - current.y};

            const toPrevLength = Math.sqrt(toPrev.x * toPrev.x + toPrev.y * toPrev.y);
            const toNextLength = Math.sqrt(toNext.x * toNext.x + toNext.y * toNext.y);

            toPrev.x /= toPrevLength;
            toPrev.y /= toPrevLength;
            toNext.x /= toNextLength;
            toNext.y /= toNextLength;

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
        ctx.fill();
        ctx.stroke();
    }
    _renderCustomCollisionShape (ctx, item) {
        const points = item.collision.points;
        if (!points || points.length < 2) return;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        if (item.customPath) {
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

        ctx.strokeStyle = this.styles.strokeColor;
        ctx.fillStyle = this.styles.fillColor;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.styles.pointColor;
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.styles.pointRadius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    /** ======== END ======== */

}

export default Debugger;