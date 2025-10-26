/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */
import Collision from './Collision.js';

class Utils {

    static _handleCanvasSelector (selector, appendTo = null) {
        let canvas;

        if (typeof selector === 'string') {
            canvas = document.querySelector(selector);
            if (!canvas) {
                canvas = document.createElement('canvas');

                if (selector.startsWith('#'))
                    canvas.id = selector.replace('#', '');
                else {
                    selector  = selector.replace('.', '');
                    canvas.classList.add(selector);
                }

                if (!appendTo || typeof appendTo === 'string')
                    appendTo = document.querySelector(appendTo || 'body');

                appendTo.appendChild(canvas);
            }
        } else if (selector instanceof HTMLCanvasElement)
            return selector
        else
            throw new Error('Invalid HTMLCanvasElement')

        return canvas;
    }

    /** ======== RESIZE ======== */
    resize (width, height, trigger = true, target = null) {
        this._updateCanvasSize(width, height, trigger, target);
        return this;
    }
    _windowResizeListener () {
        window.addEventListener('resize', () => {
            const target = this.config.resizeTarget;
            let width, height, resize = false;

            this._createWindow();

            if (target === 'window') {
                width  = this.window.width;
                height = this.window.height;
                resize = true;
            } else if (target === 'document') {
                width  = document.documentElement.clientWidth;
                height = document.documentElement.clientHeight;
                resize = true;
            }

            if (resize && !this.config.autoResize) {
                this.trigger('resize', {width, height, target: 'window'});
                return;
            }

            if (resize)
                this.resize(width, height, true, 'window');
        });
    }
    _setupResizeObserver (element) {
        if (!element instanceof HTMLElement || typeof document === 'undefined' || typeof ResizeObserver === 'undefined') return;
        new ResizeObserver(() => {
            const width  = element.offsetWidth;
            const height = element.offsetHeight;
            if (this.config.autoResize) {
                this.resize(width, height, true, element);
                return;
            }
            this.trigger('resize', {width, height, target: element});
        }).observe(element);
    }
    _updateCanvasSize (width, height, trigger, target) {
        // Update the base dimensions
        this.baseWidth  = width;
        this.baseHeight = height;

        // Update config dimensions
        this.config.width  = width;
        this.config.height = height;

        // Update canvas physical size (considering quality)
        this.canvas.width  = width * this.config.quality;
        this.canvas.height = height * this.config.quality;

        // Update canvas display size
        this.canvas.style.width  = width + 'px';
        this.canvas.style.height = height + 'px';

        // Reset context scale
        this.ctx.scale(this.config.quality, this.config.quality);

        this.workerSend({
            action: 'update_canvas',
            props: {
                attributes: {
                    width: this.canvas.width,
                    height: this.canvas.height,
                },
                style: this.canvas.style
            }
        });

        // Trigger resize event
        if (trigger)
            this.trigger('resize', {width, height, target});
    }
    /** ======== END ======== */

    /** ======== ENTITIES ======== */
    getSortedEntitiesForInteraction () {
        const entities = [];
        let globalIndex = 0;

        const addEntityWithChildren = (entity, level = 0, parentZIndex = 0) => {
            // Calculating the effective zIndex considering all parents
            let effectiveZIndex = parentZIndex + (entity.zIndex || 0);

            // Add your entity
            entities.push({
                entity,
                level,                  // Depth in the tree
                effectiveZIndex,        // Effective zIndex
                isChild: !!entity.parent,
                addOrder: globalIndex++ // Global sequence number
            });

            // In-depth survey of children
            for (const child of entity.children.values()) {
                // Each child inherits its parent's zIndex.
                addEntityWithChildren(child, level + 1, effectiveZIndex);
            }
        };

        // Starting from the main entities
        for (const entity of this.entities.values()) {
            addEntityWithChildren(entity);
        }

        // Sorting by different criteria
        return entities
            .sort((a, b) => {
                // 1. Priority by layer (effective zIndex)
                if (b.effectiveZIndex !== a.effectiveZIndex) {
                    return b.effectiveZIndex - a.effectiveZIndex;
                }

                // 2. Priority with greater depth (deeper children)
                if (b.level !== a.level) {
                    return b.level - a.level;
                }

                // 3. Finally, the order of addition
                return a.addOrder - b.addOrder;
            })
            .map(item => item.entity);
    }
    isPointInEntity (x, y, entity) {
        if (!entity.styles.visible) return false;

        const centerX = entity.absoluteX + entity.width / 2;
        const centerY = entity.absoluteY + entity.height / 2;
        const rotation = -entity.styles.rotation * Math.PI / 180;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const localX = cos * (x - centerX) - sin * (y - centerY);
        const localY = sin * (x - centerX) + cos * (y - centerY);

        if (entity.collision?.points?.length > 0)
            return Collision.isPointInCollisionPoints(localX, localY, entity.collision.points);

        const scaledWidth = entity.width * entity.styles.scale * entity.styles.scaleX;
        const scaledHeight = entity.height * entity.styles.scale * entity.styles.scaleY;

        switch (entity.styles.shape) {
            case 'circle':
                const radius = Math.min(scaledWidth, scaledHeight) / 2;
                return (localX * localX + localY * localY) <= radius * radius;
            case 'triangle':
                return Collision.isPointInTriangle(localX, localY, scaledWidth, scaledHeight);
            default: // rectangle
                return Math.abs(localX) <= scaledWidth / 2 && Math.abs(localY) <= scaledHeight / 2;
        }
    }
    /** ======== END ======== */

    /** ======== TOUCHES ======== */
    _handleTouchStart (e) {
        if (!this.running) return;

        for (const touch of e.changedTouches) {
            const identifier = touch.identifier;
            const worldCoords = this.camera.screenToWorld(touch.clientX, touch.clientY);

            const eventData = {
                x: worldCoords.x,
                y: worldCoords.y,
                worldX: worldCoords.x,
                worldY: worldCoords.y,
                screenX: touch.clientX,
                screenY: touch.clientY,
                timestamp: Date.now(),
                touches: this._handleTouches(e),
                identifier
            };

            this.trigger('touchstart', eventData);

            if (this.physicsEnabled) continue;

            const sortedEntities = this.getSortedEntitiesForInteraction();
            const targetEntity = sortedEntities.find(entity =>
                (entity.isDraggable() || entity.isClickable() || entity.isInteractive()) &&
                this.isPointInEntity(worldCoords.x, worldCoords.y, entity)
            );

            if (targetEntity) {
                if (targetEntity.isInteractive()) {
                    targetEntity.trigger('touchstart', eventData);
                    this.touchStartEntities.set(identifier, targetEntity);
                }

                this.entities.forEach(entity => {
                    if (entity.zIndex > targetEntity.zIndex) {
                        entity.zIndex--;
                    }
                });

                let maxZIndex = 0;
                this.entities.forEach(entity => {
                    maxZIndex = Math.max(maxZIndex, entity.zIndex || 0);
                });
                targetEntity.zIndex = maxZIndex + 1;

                if (targetEntity.isDraggable()) {
                    this.draggedEntities.set(identifier, {
                        entity: targetEntity,
                        touchStartX: worldCoords.x,
                        touchStartY: worldCoords.y,
                        dragStartX: worldCoords.x - targetEntity.absoluteX,
                        dragStartY: worldCoords.y - targetEntity.absoluteY
                    });
                    targetEntity.trigger('drag', eventData);
                }
            }
        }
    }
    _handleTouchMove (e) {
        e?.preventDefault?.();
        if (!this.running) return;

        for (const touch of e.changedTouches) {
            const identifier = touch.identifier;
            const draggedData = this.draggedEntities.get(identifier);
            const worldCoords = this.camera.screenToWorld(touch.clientX, touch.clientY);

            const eventData = {
                x: worldCoords.x,
                y: worldCoords.y,
                worldX: worldCoords.x,
                worldY: worldCoords.y,
                screenX: touch.clientX,
                screenY: touch.clientY,
                timestamp: Date.now(),
                touches: this._handleTouches(e),
                identifier,
            };

            this.trigger('touchmove', eventData);

            if (this.physicsEnabled) continue;

            const touchStartEntity = this.touchStartEntities.get(identifier);
            if (touchStartEntity && touchStartEntity.isInteractive()) {
                touchStartEntity.trigger('touchmove', eventData);
            } else {
                const sortedEntities = this.getSortedEntitiesForInteraction();
                const targetEntity = sortedEntities.find(entity =>
                    entity.isInteractive() && this.isPointInEntity(worldCoords.x, worldCoords.y, entity)
                );

                if (targetEntity) {
                    targetEntity.trigger('touchmove', eventData);
                }
            }

            // Handle drag logic
            if (!draggedData) continue;

            const entity = draggedData.entity;
            let newX = worldCoords.x - draggedData.dragStartX;
            let newY = worldCoords.y - draggedData.dragStartY;

            if (entity.parent && entity.constrainToParent) {
                const parent = entity.parent;
                const minX = 0;
                const minY = 0;
                const maxX = parent.width - entity.width;
                const maxY = parent.height - entity.height;
                newX = Math.max(minX, Math.min(maxX, newX - parent.absoluteX));
                newY = Math.max(minY, Math.min(maxY, newY - parent.absoluteY));
            } else if (entity.parent) {
                newX -= entity.parent.absoluteX;
                newY -= entity.parent.absoluteY;
            }

            entity.style({
                x: newX,
                y: newY
            });

            entity.trigger('dragMove', eventData);
        }
    }
    _handleTouchEnd (e) {
        if (!this.running) return;

        for (const touch of e.changedTouches) {
            const identifier = touch.identifier;
            const draggedData = this.draggedEntities.get(identifier);
            const worldCoords = this.camera.screenToWorld(touch.clientX, touch.clientY);

            const eventData = {
                x: worldCoords.x,
                y: worldCoords.y,
                worldX: worldCoords.x,
                worldY: worldCoords.y,
                screenX: touch.clientX,
                screenY: touch.clientY,
                timestamp: Date.now(),
                touches: this._handleTouches(e),
                identifier
            };

            this.trigger('touchend', eventData);

            if (this.physicsEnabled) return;

            const touchStartEntity = this.touchStartEntities.get(identifier);
            if (touchStartEntity && touchStartEntity.isInteractive()) {
                touchStartEntity.trigger('touchend', eventData);
                this.touchStartEntities.delete(identifier);
            }

            // Handle drag end logic
            if (draggedData) {
                const entity = draggedData.entity;

                const deltaX = Math.abs(worldCoords.x - draggedData.touchStartX);
                const deltaY = Math.abs(worldCoords.y - draggedData.touchStartY);
                const wasDragged = deltaX > 5 || deltaY > 5;

                if (entity.isDraggable())
                    entity.trigger('drop', eventData);

                // if (!wasDragged && entity.isClickable()) {
                //     entity.trigger('click', eventData);
                // }

                this.draggedEntities.delete(identifier);
            }
        }
    }
    _handleTouchCancel (e) {
        if (!this.running) return;

        for (const touch of e.changedTouches) {
            const identifier = touch.identifier;

            const touchStartEntity = this.touchStartEntities.get(identifier);
            if (touchStartEntity) {
                this.touchStartEntities.delete(identifier);
            }

            if (this.draggedEntities.has(identifier)) {
                this.draggedEntities.delete(identifier);
            }
        }
    }
    _handleTouches (e) {
        const touches = [];
        for (const touch of e.touches) {
            const world = this.camera.screenToWorld(touch.clientX, touch.clientY);
            touches.push({
                identifier: touch.identifier,
                screenX: touch.clientX,
                screenY: touch.clientY,
                worldX: world.x,
                worldY: world.y
            });
        }
        return touches;
    }
    /** ======== END ======== */

    /** ======== MOUSE ======== */
    _handleMouseDown (e) {
        if (!this.running || e.buttons === 2) return;

        const worldCoords = this.camera.screenToWorld(e.clientX, e.clientY);
        const eventData = {
            x: worldCoords.x,
            y: worldCoords.y,
            worldX: worldCoords.x,
            worldY: worldCoords.y,
            screenX: e.clientX,
            screenY: e.clientY,
            which: e.which,
            timestamp: Date.now()
        };

        this.trigger('mousedown', eventData);

        if (this.physicsEnabled) return;

        const sortedEntities = this.getSortedEntitiesForInteraction();
        const targetEntity = sortedEntities.find(entity =>
            (entity.isDraggable() || entity.isInteractive()) && this.isPointInEntity(worldCoords.x, worldCoords.y, entity)
        );

        if (targetEntity) {
            if (targetEntity.isInteractive()) {
                targetEntity.trigger('mousedown', eventData);
                this.mouseDownEntity = targetEntity;
            }

            if (targetEntity.isDraggable()) {
                this.draggedEntity = targetEntity;

                this.entities.forEach(entity => {
                    if (entity.zIndex > targetEntity.zIndex) {
                        entity.zIndex--;
                    }
                });

                let maxZIndex = 0;
                this.entities.forEach(entity => {
                    maxZIndex = Math.max(maxZIndex, entity.zIndex || 0);
                });
                targetEntity.zIndex = maxZIndex + 1;

                this.draggedEntity.dragStartX = worldCoords.x - targetEntity.absoluteX;
                this.draggedEntity.dragStartY = worldCoords.y - targetEntity.absoluteY;
                targetEntity.trigger('drag', eventData);
            }
        }
    }
    _handleMouseUp (e) {
        if (!this.running || e.buttons === 2) return;

        const worldCoords = this.camera.screenToWorld(e.clientX, e.clientY);
        const eventData = {
            x: worldCoords.x,
            y: worldCoords.y,
            worldX: worldCoords.x,
            worldY: worldCoords.y,
            screenX: e.clientX,
            screenY: e.clientY,
            which: e.which,
            timestamp: Date.now()
        };

        this.trigger('mouseup', eventData);

        if (this.physicsEnabled) return;

        if (this.mouseDownEntity && this.mouseDownEntity.isInteractive()) {
            this.mouseDownEntity.trigger('mouseup', eventData);
            this.mouseDownEntity = null;
        }

        // Handle drag end
        if (this.draggedEntity) {
            this.draggedEntity.trigger('drop', eventData);
            this.draggedEntity = null;
        }
    }
    _handleMouseMove (e) {
        if (!this.running || e.buttons === 2) return;

        const worldCoords = this.camera.screenToWorld(e.clientX, e.clientY);
        const eventData = {
            x: worldCoords.x,
            y: worldCoords.y,
            worldX: worldCoords.x,
            worldY: worldCoords.y,
            screenX: e.clientX,
            screenY: e.clientY,
            which: e.which,
            timestamp: Date.now()
        };

        this.trigger('mousemove', eventData);

        if (this.physicsEnabled) return;

        // Handle drag
        if (this.draggedEntity && this.draggedEntity.isDraggable()) {
            let newX = worldCoords.x - this.draggedEntity.dragStartX;
            let newY = worldCoords.y - this.draggedEntity.dragStartY;

            if (this.draggedEntity.parent && this.draggedEntity.constrainToParent) {
                const parent = this.draggedEntity.parent;
                const minX = 0;
                const minY = 0;
                const maxX = parent.width - this.draggedEntity.width;
                const maxY = parent.height - this.draggedEntity.height;
                newX = Math.max(minX, Math.min(maxX, newX - parent.absoluteX));
                newY = Math.max(minY, Math.min(maxY, newY - parent.absoluteY));
            } else if (this.draggedEntity.parent) {
                newX -= this.draggedEntity.parent.absoluteX;
                newY -= this.draggedEntity.parent.absoluteY;
            }

            this.draggedEntity.style({
                x: newX,
                y: newY
            });

            this.draggedEntity.trigger('dragMove', eventData);
        }

        if (this.mouseDownEntity && this.mouseDownEntity.isInteractive()) {
            this.mouseDownEntity.trigger('mousemove', eventData);
        } else {
            const sortedEntities = this.getSortedEntitiesForInteraction();
            const targetEntity = sortedEntities.find(entity =>
                this.isPointInEntity(worldCoords.x, worldCoords.y, entity)
            );

            if (targetEntity && targetEntity.isInteractive()) {
                targetEntity.trigger('mousemove', eventData);
            }
        }

        // Handle hover
        const sortedEntities = this.getSortedEntitiesForInteraction();
        const hoverableEntity = sortedEntities.find(entity =>
            this.isPointInEntity(worldCoords.x, worldCoords.y, entity) && entity.isHoverable()
        );

        if (hoverableEntity !== this.hoveredEntity) {
            if (this.hoveredEntity)
                this.hoveredEntity.trigger('hoverOut', eventData);

            if (hoverableEntity) {
                this.hoveredEntity = hoverableEntity;
                hoverableEntity.trigger('hover', eventData);
            } else {
                this.hoveredEntity = null;
            }
        }
    }
    _handleWheel (e) {
        if (!this.running) return;
        e?.preventDefault?.();

        const worldCoords = this.camera.screenToWorld(e.clientX, e.clientY);
        const eventData = {
            x: worldCoords.x,
            y: worldCoords.y,
            worldX: worldCoords.x,
            worldY: worldCoords.y,
            screenX: e.clientX,
            screenY: e.clientY,
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            deltaZ: e.deltaZ,
            deltaMode: e.deltaMode,
            timestamp: Date.now()
        };

        this.trigger('wheel', eventData);

        if (this.physicsEnabled) return;

        const sortedEntities = this.getSortedEntitiesForInteraction();
        const targetEntity = sortedEntities.find(entity =>
            entity.isInteractive() && this.isPointInEntity(worldCoords.x, worldCoords.y, entity)
        );

        if (targetEntity) {
            targetEntity.trigger('wheel', eventData);
        }
    }
    /** ======== END ======== */

    /** ======== CLICK ======== */
    _handleClick (e) {
        if (e.button === 2) return;
        this._handleClicks(e, 'click');
    }
    _handleRightClick (e) {
        this._handleClicks(e, 'rightclick');
    }
    _handleClicks (e, trigger) {
        e?.preventDefault?.();
        Promise.resolve().then(() => this.canvas?.focus?.());

        if (!this.running) return;

        const worldCoords = this.camera.screenToWorld(e.clientX, e.clientY);
        const eventData = {
            x: worldCoords.x,
            y: worldCoords.y,
            worldX: worldCoords.x,
            worldY: worldCoords.y,
            screenX: e.clientX,
            screenY: e.clientY,
            timestamp: Date.now()
        };
        this.trigger(trigger, eventData);

        if (this.physicsEnabled) return;

        const sortedEntities = this.getSortedEntitiesForInteraction();
        const targetEntity = sortedEntities.find(entity =>
            (entity.isClickable() || entity.isInteractive()) && this.isPointInEntity(worldCoords.x, worldCoords.y, entity)
        );

        if (targetEntity)
            targetEntity.trigger(trigger, eventData);
    }
    /** ======== END ======== */

    /** ======== KEYS ======== */
    pressedKeys = new Map(); // Map<physicalKey, {physical: '', logical: ''}>
    keyMap = {
        'control': 'ctrl',
        ' ': 'space',
        'arrowup': 'up',
        'arrowdown': 'down',
        'arrowleft': 'left',
        'arrowright': 'right',
        'escape': 'esc',
        'enter': 'enter',
        'shift': 'shift',
        'alt': 'alt',
        'meta': 'meta', // for Command key on Mac
        'delete': 'del',
        'backspace': 'backspace',
        'tab': 'tab',
        'capslock': 'caps',
        'pageup': 'pageup',
        'pagedown': 'pagedown',
        'insert': 'ins',
        'home': 'home',
        'end': 'end'
    };

    isKeyPressed (...keys) {
        return keys.some(k => this.pressedKeys.has(k));
    }
    isLogicalKeyPressed (...keys) {
        return keys.some(k =>
            Array.from(this.pressedKeys.values()).some(keyObj => keyObj.logical === k)
        );
    }
    #normalizeKeyPhysical (e) {
        // Handle letter keys (KeyA, KeyB, KeyC, ...)
        if (e.code && e.code.startsWith('Key'))
            return e.code.replace('Key', '').toLowerCase();

        // Handle digit keys (Digit0, Digit1, ...)
        if (e.code && e.code.startsWith('Digit'))
            return e.code.replace('Digit', '');

        // Handle special keys using keyMap
        const keyFromEvent = e.key.toLowerCase();
        return this.keyMap[keyFromEvent] || keyFromEvent;
    }
    #normalizeKeyLogical (e) {
        const key = e.key.toLowerCase();
        return this.keyMap[key] || key;
    }
    #orderKeys (keys) {
        const priority = ['ctrl', 'shift', 'alt', 'meta'];
        return [...keys].sort((a, b) => {
            const ai = priority.indexOf(a);
            const bi = priority.indexOf(b);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
        });
    }
    _handleKeyDown (e) {
        e?.preventDefault?.();

        // Get normalized keys
        const physicalKey = this.#normalizeKeyPhysical(e);
        const logicalKey = this.#normalizeKeyLogical(e);

        // Store both physical and logical keys
        this.pressedKeys.set(physicalKey, {
            physical: physicalKey,
            logical: logicalKey
        });

        // Generate combo from physical keys
        const combo = this.#orderKeys(this.pressedKeys.keys()).join('+');

        // Create key event object with all information
        const keyEvent = {
            key: logicalKey,        // The letter typed by the user
            combo: combo,           // Physical composition (ctrl+a)
            physical: physicalKey,  // Physical key
            original: e.key,        // Raw key from browser
        };

        // Trigger events
        this.trigger('keydown', keyEvent, e);
        this.trigger(combo, keyEvent, e);
    }
    _handleKeyUp (e) {
        e?.preventDefault?.();

        // Get normalized keys
        const physicalKey = this.#normalizeKeyPhysical(e);
        const logicalKey = this.#normalizeKeyLogical(e);

        // Get combo before removing the key
        const combo = this.#orderKeys(this.pressedKeys.keys()).join('+');

        // Remove key from pressed map
        this.pressedKeys.delete(physicalKey);

        // Create key event object
        const keyEvent = {
            key: logicalKey,        // The letter typed by the user
            combo: combo,           // Physical composition (ctrl+a)
            physical: physicalKey,  // Physical key
            original: e.key         // Raw key from browser
        };

        // Trigger event
        this.trigger('keyup', keyEvent, e);
    }
    /** ======== END ======== */

    /** ======== COLORS ======== */
    hexToRgb (hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    rgbToHex (r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    hslToRgb (h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    randHex (includeAlpha = false) {
        // Random number generation for RGB
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        // Convert to hexadecimal format and add zeros if needed.
        const toHex = (n) => n.toString(16).padStart(2, '0');

        if (includeAlpha) {
            const a = Math.floor(Math.random() * 256);
            return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
        }

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    randRgb (includeAlpha = false) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        if (includeAlpha) {
            // Generate a random number between 0 and 1 for alpha.
            const a = Math.random().toFixed(2);
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        return `rgb(${r}, ${g}, ${b})`;
    }
    randHsl (options = {}, includeAlpha = false) {
        const {
            hueRange = [0, 360],
            saturationRange = [0, 100],
            lightnessRange = [0, 100]
        } = options;

        // Generate random values within specified ranges
        const h = Math.floor(
            Math.random() * (hueRange[1] - hueRange[0]) + hueRange[0]
        );
        const s = Math.floor(
            Math.random() * (saturationRange[1] - saturationRange[0]) + saturationRange[0]
        );
        const l = Math.floor(
            Math.random() * (lightnessRange[1] - lightnessRange[0]) + lightnessRange[0]
        );

        if (includeAlpha) {
            const a = Math.random().toFixed(2);
            return `hsla(${h}, ${s}%, ${l}%, ${a})`;
        }

        return `hsl(${h}, ${s}%, ${l}%)`;
    }
    adjustAlpha (colorString, multiplier) {
        if (colorString.includes('rgba')) {
            return colorString.replace(/rgba\((.+),\s*([0-9.]+)\)/, (match, rgb, alpha) => {
                const newAlpha = Math.min(parseFloat(alpha) * multiplier, 1);
                return `rgba(${rgb}, ${newAlpha})`;
            });
        } else if (colorString.includes('rgb')) {
            const rgb = colorString.match(/rgb\((.+)\)/)[1];
            const newAlpha = Math.min(0.5 * multiplier, 1);
            return `rgba(${rgb}, ${newAlpha})`;
        } else {
            // Handle hex colors by converting to rgba
            const hex = colorString.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const newAlpha = Math.min(0.5 * multiplier, 1);
            return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
        }
    }
    /** ======== END ======== */

    /** ======== MATHS ======== */
    getDistance (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    randBetween (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    clamp (value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    lerp (start, end, amount) {
        return start + (end - start) * amount;
    }
    degToRad (degrees) {
        return degrees * (Math.PI / 180);
    }
    radToDeg (radians) {
        return radians * (180 / Math.PI);
    }
    getAngle (x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    rotatePoint (centerX, centerY, pointX, pointY, angle) {
        const radians = this.degToRad(angle);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const dx  = pointX - centerX;
        const dy  = pointY - centerY;

        return {
            x: centerX + (dx * cos - dy * sin),
            y: centerY + (dx * sin + dy * cos)
        };
    }
    /** ======== END ======== */

    async wait (...args) {
        if (args.length === 0)
            return [];

        const promises = this._flattenPromises(args);

        if (promises.length === 0)
            return [];

        try {
            return await Promise.all(promises);
        } catch (error) {
            throw new Error(`Wait operation failed: ${error.message}`);
        }
    }
    _flattenPromises (args) {
        const promises = [];

        for (const arg of args) {
            if (Array.isArray(arg)) {
                promises.push(...this._flattenPromises(arg));
            } else if (arg && typeof arg.then === 'function') {
                promises.push(arg);
            } else if (arg !== null && arg !== undefined) {
                promises.push(Promise.resolve(arg));
            }
        }

        return promises;
    }

    static dataURLToBlob (dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], {type: mime});
    }

    static scriptToUrl (script) {
        try {
            new URL(script);
            return script;
        } catch { /* not a full url */ }

        const isFn = v => typeof v === 'function';

        /** Function */
        if (isFn(script))
            script = `${script.toString()}()`;

        /** Path */
        else if (/^(?:\.\/|\.\.\/|\/|[^/]*\.[a-zA-Z0-9]{1,5}$)/.test(script) && !/\s/.test(script))
            return script;

        /** Function Name */
        else if (/^[a-zA-Z_$][\w$]*$/.test(String(script).trim())) {
            const fnName = String(script).trim();
            const fn = globalThis[fnName];
            if (isFn(fn))
                script = `(${fn.toString()})();`; // IIFE
        }

        /** Script */
        else if (/[(){}\[\];=>]/.test(script) || /\b(function|=>|var|let|const|if|for|while|return)\b/.test(script)) {/** Nothing */}

        else throw new Error(`${script} is not valid`);

        const blob = new Blob([script], {type: 'application/javascript'});
        return URL.createObjectURL(blob);
    }

}

export default Utils;