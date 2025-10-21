/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

class Camera {

    constructor (engine, config = {}) {
        this.engine = engine;

        this.config = {
            x: config.x || 0,
            y: config.y || 0,
            zoom: config.zoom ?? 1,
            bounds: config.bounds || null,
            minZoom: config.minZoom ?? 0.1,
            maxZoom: config.maxZoom ?? 5,
            smoothing: config.smoothing ?? true,
            smoothSpeed: config.smoothSpeed ?? 0.1,
            rotation: config.rotation || 0,
            viewPadding: config.viewPadding ?? 100
        };

        // Store original config for reset functionality
        this._originalConfig = {...this.config};

        this.x = this.config.x;
        this.y = this.config.y;
        this.zoom = this.config.zoom;

        // Camera limitations
        this.bounds = this.config.bounds;
        this.minZoom = this.config.minZoom;
        this.maxZoom = this.config.maxZoom;

        // Smooth motion settings
        this.smoothing = this.config.smoothing;
        this.smoothSpeed = this.config.smoothSpeed;

        this._targetX = this.x;
        this._targetY = this.y;
        this._targetZoom = this.zoom;

        this._lastX = this.x;
        this._lastY = this.y;
        this._lastZoom = this.zoom;

        this.deltaX = 0;
        this.deltaY = 0;
        this.deltaZoom = 0;

        this._followedEntity = null;
        this._followConfig = null;
        this._followOffset = {x: 0, y: 0};

        this._states = new Map();

        this._effects = {
            shake: null
        };

        this.rotation = this.config.rotation; // Current rotation angle
        this._targetRotation = this.rotation; // Target angle for rotation
        this._lastRotation = this.rotation;   // Previous angle to calculate changes
        this.deltaRotation = 0;               // The amount of change in rotation
    }

    /** ======== MOVEMENT ======== */
    moveTo (x, y = 0, instant = false, duration = 500, easing = 'easeInOutCubic') {
        // If we have bounds, we limit it.
        if (this.bounds) {
            const viewportWidth = this.engine.baseWidth / this.zoom;
            const viewportHeight = this.engine.baseHeight / this.zoom;

            if (this.bounds.width > viewportWidth) {
                x = Math.min(Math.max(x, this.bounds.x),
                    this.bounds.x + this.bounds.width - viewportWidth);
            } else {
                x = this.bounds.x + (this.bounds.width - viewportWidth) / 2;
            }

            if (this.bounds.height > viewportHeight) {
                y = Math.min(Math.max(y, this.bounds.y),
                    this.bounds.y + this.bounds.height - viewportHeight);
            } else {
                y = this.bounds.y + (this.bounds.height - viewportHeight) / 2;
            }
        }

        // Immediate action
        if (instant || !duration) {
            this.x = this._targetX = x;
            this.y = this._targetY = y;
            return this;
        }

        // Moving with animation
        const startX = this.x;
        const startY = this.y;
        const startTime = Date.now();

        this.smoothing = false;
        easing = typeof easing === 'function' ? easing : this.engine.Ease[easing] || this.engine.Ease['easeInOutCubic'];

        const animate = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const t = easing(progress);

            this.x = this._targetX = startX + (x - startX) * t;
            this.y = this._targetY = startY + (y - startY) * t;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.smoothing = true;
            }
        };

        animate();
        return this;
    }
    moveBy (dx, dy = 0, instant = false, duration = 500, easing = 'easeInOutCubic') {
        return this.moveTo(this.x + dx, this.y + dy, instant, duration, easing);
    }
    /** ======== END ======== */

    /** ======== ZOOM ======== */
    getCurrentCenter () {
        const viewportWidth = this.engine.baseWidth / this.zoom;
        const viewportHeight = this.engine.baseHeight / this.zoom;
        return {
            x: this.x + viewportWidth / 2,
            y: this.y + viewportHeight / 2
        };
    }
    zoomTo (zoom, centerX = null, centerY = null, duration = 500, easing = 'easeInOutCubic') {
        if (typeof zoom === 'object')
            ({zoom, centerX, centerY, duration = 500, easing = 'easeInOutCubic'} = zoom);

        // Limit zoom to allowed values
        zoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom);

        const center = this.getCurrentCenter();
        centerX = centerX ?? center.x;
        centerY = centerY ?? center.y;

        const startZoom = this.zoom;
        const startX = this.x;
        const startY = this.y;
        const startTime = Date.now();

        // Calculating the new position while preserving the zoom point
        const startViewportWidth = this.engine.baseWidth / startZoom;
        const startViewportHeight = this.engine.baseHeight / startZoom;
        const endViewportWidth = this.engine.baseWidth / zoom;
        const endViewportHeight = this.engine.baseHeight / zoom;

        // Calculating the final position while maintaining the zoom center point
        let targetX = centerX - endViewportWidth / 2;
        let targetY = centerY - endViewportHeight / 2;

        // Applying bounds to the final position
        if (this.bounds) {
            if (this.bounds.width > endViewportWidth) {
                targetX = Math.min(
                    Math.max(targetX, this.bounds.x),
                    this.bounds.x + this.bounds.width - endViewportWidth
                );
            } else {
                targetX = this.bounds.x + (this.bounds.width - endViewportWidth) / 2;
            }

            if (this.bounds.height > endViewportHeight) {
                targetY = Math.min(
                    Math.max(targetY, this.bounds.y),
                    this.bounds.y + this.bounds.height - endViewportHeight
                );
            } else {
                targetY = this.bounds.y + (this.bounds.height - endViewportHeight) / 2;
            }
        }

        // Save the original smoothing state
        const originalSmoothing = this.smoothing;
        this.smoothing = false;

        easing = typeof easing === 'function' ? easing : this.engine.Ease[easing] || this.engine.Ease['easeInOutCubic'];

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easing(progress);

            // Apply gradual zoom changes
            this.zoom = startZoom + (zoom - startZoom) * easeProgress;

            // Calculate the position according to the current zoom and bounds constraints.
            const currentViewportWidth = this.engine.baseWidth / this.zoom;
            const currentViewportHeight = this.engine.baseHeight / this.zoom;

            // Calculate the current position considering bounds
            let currentX, currentY;

            if (this.bounds) {
                if (this.bounds.width > currentViewportWidth) {
                    currentX = startX + (targetX - startX) * easeProgress;
                    currentX = Math.min(
                        Math.max(currentX, this.bounds.x),
                        this.bounds.x + this.bounds.width - currentViewportWidth
                    );
                } else {
                    currentX = this.bounds.x + (this.bounds.width - currentViewportWidth) / 2;
                }

                if (this.bounds.height > currentViewportHeight) {
                    currentY = startY + (targetY - startY) * easeProgress;
                    currentY = Math.min(
                        Math.max(currentY, this.bounds.y),
                        this.bounds.y + this.bounds.height - currentViewportHeight
                    );
                } else {
                    currentY = this.bounds.y + (this.bounds.height - currentViewportHeight) / 2;
                }
            } else {
                currentX = startX + (targetX - startX) * easeProgress;
                currentY = startY + (targetY - startY) * easeProgress;
            }

            this.x = currentX;
            this.y = currentY;

            // Update target values
            this._targetZoom = this.zoom;
            this._targetX = this.x;
            this._targetY = this.y;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.smoothing = originalSmoothing;
            }
        };

        animate();
        return this;
    }
    zoomToLevel (zoom, centerX = null, centerY = null, duration = 500, easing = 'easeInOutCubic') {
        return this.zoomTo(zoom, centerX, centerY, duration, easing);
    }
    zoomBy (factor, centerX = null, centerY = null, duration = 500, easing = 'easeInOutCubic') {
        return this.zoomTo(this.zoom * factor, centerX, centerY, duration, easing);
    }
    zoomAtPoint (factor, screenX, screenY, duration = 500, easing = 'easeInOutCubic') {
        const worldPoint = this.screenToWorld(screenX, screenY);
        return this.zoomTo(this.zoom * factor, worldPoint.x, worldPoint.y, duration, easing);
    }
    /** ======== END ======== */

    /** ======== ROTATION ======== */
    rotate (angle, instant = false, duration = 500, easing = 'easeInOutCubic') {
        // Angle normalization between 0 and 360 degrees
        angle = angle % 360;
        if (angle < 0) angle += 360;

        // If the rotation is immediate
        if (instant || !duration) {
            this.rotation = this._targetRotation = angle;
            return this;
        }

        // Rotation with animation
        const startRotation = this.rotation;
        const startTime = Date.now();

        // Disable temporary softening
        this.smoothing = false;
        easing = typeof easing === 'function' ? easing : this.engine.Ease[easing] || this.engine.Ease['easeInOutCubic'];

        const animate = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const t = easing(progress);

            // Calculating the shortest turning path
            let diff = angle - startRotation;
            if (Math.abs(diff) > 180) {
                if (diff > 0) {
                    diff -= 360;
                } else {
                    diff += 360;
                }
            }

            this.rotation = this._targetRotation = startRotation + diff * t;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.smoothing = true;
            }
        };

        animate();
        return this;
    }
    rotateBy (deltaAngle, instant = false, duration = 500, easing = 'easeInOutCubic') {
        return this.rotate(this.rotation + deltaAngle, instant, duration, easing);
    }
    /** ======== END ======== */

    /** ======== LIMIT ZONE ======== */
    setBounds (bounds) {
        this.bounds = bounds;
        this._enforceBounds();
        return this;
    }
    _enforceBounds () {
        if (!this.bounds) return;

        const viewportWidth = this.engine.baseWidth / this._targetZoom;
        const viewportHeight = this.engine.baseHeight / this._targetZoom;

        if (this.bounds.width > viewportWidth) {
            this._targetX = Math.min(
                Math.max(this._targetX, this.bounds.x),
                this.bounds.x + this.bounds.width - viewportWidth
            );
        } else {
            this._targetX = this.bounds.x + (this.bounds.width - viewportWidth) / 2;
        }

        if (this.bounds.height > viewportHeight) {
            this._targetY = Math.min(
                Math.max(this._targetY, this.bounds.y),
                this.bounds.y + this.bounds.height - viewportHeight
            );
        } else {
            this._targetY = this.bounds.y + (this.bounds.height - viewportHeight) / 2;
        }
    }
    /** ======== END ======== */

    /** ======== FOCUS ======== */
    focusOn (x, y, zoom = this.zoom) {
        const viewportWidth = this.engine.baseWidth / zoom;
        const viewportHeight = this.engine.baseHeight / zoom;

        return this.moveTo(
            x - viewportWidth / 2,
            y - viewportHeight / 2
        ).zoomTo(zoom);
    }
    focusOnRect (rect, padding = 0) {
        const viewportRatio = this.engine.baseWidth / this.engine.baseHeight;
        const rectRatio = (rect.width + padding * 2) / (rect.height + padding * 2);

        let zoom;
        if (rectRatio > viewportRatio) {
            zoom = this.engine.baseWidth / (rect.width + padding * 2);
        } else {
            zoom = this.engine.baseHeight / (rect.height + padding * 2);
        }

        return this.focusOn(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2,
            Math.min(Math.max(zoom, this.minZoom), this.maxZoom)
        );
    }
    /** ======== END ======== */

    apply () {
        const ctx = this.engine.ctx;
        ctx.save();
        ctx.translate(this.engine.baseWidth / 2, this.engine.baseHeight / 2);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(
            -this.engine.baseWidth / (2 * this.zoom) - this.x,
            -this.engine.baseHeight / (2 * this.zoom) - this.y
        );
    }
    update () {
        this._lastRotation = this.rotation;

        // Save previous values
        this._lastX = this.x;
        this._lastY = this.y;
        this._lastZoom = this.zoom;

        // If we are following
        if (this._followedEntity && this._followConfig) {
            const targetPosition = this.calcFollowPosition();
            if (targetPosition) {
                if (this._followConfig.smooth) {
                    // Smooth movement towards the goal
                    this._targetX = targetPosition.x;
                    this._targetY = targetPosition.y;
                } else {
                    // Immediate movement to the target
                    this.x = this._targetX = targetPosition.x;
                    this.y = this._targetY = targetPosition.y;
                }
            }
        }

        // Camera position update
        if (this.smoothing || (this._followedEntity && this._followConfig?.smooth)) {
            // Only when smoothing is enabled or we are in follow mode with smooth=true
            const speed = this._followConfig?.smoothSpeed || this.smoothSpeed;
            this.x += (this._targetX - this.x) * speed;
            this.y += (this._targetY - this.y) * speed;
            this.zoom += (this._targetZoom - this.zoom) * this.smoothSpeed;
            this.rotation += (this._targetRotation - this.rotation) * this.smoothSpeed;
        } else {
            // Otherwise, move immediately.
            this.x = this._targetX;
            this.y = this._targetY;
            this.zoom = this._targetZoom;
            this.rotation = this._targetRotation;
        }

        // Calculating changes
        this.deltaX = this.x - this._lastX;
        this.deltaY = this.y - this._lastY;
        this.deltaZoom = this.zoom - this._lastZoom;
        this.deltaRotation = this.rotation - this._lastRotation;

        // Applying restrictions
        this._enforceBounds();
        this._updateEffects(this.engine.ctx);
    }

    /** ======== CONVERT TO (SCREEN, WORLD) ======== */
    screenToWorld (screenX, screenY) {
        const rect = this.engine.canvas.getBoundingClientRect();

        // Converting page coordinates to canvas coordinates considering physical size
        const viewX = (screenX - rect.left) * (this.engine.canvas.width / rect.width);
        const viewY = (screenY - rect.top) * (this.engine.canvas.height / rect.height);

        // Remove the quality effect
        const unscaledX = viewX / this.engine.config.quality;
        const unscaledY = viewY / this.engine.config.quality;

        // Move to the center of the viewport
        const centerX = unscaledX - this.engine.baseWidth / 2;
        const centerY = unscaledY - this.engine.baseHeight / 2;

        // Inverting the rotation using the inverse rotation matrix
        const rotationRad = -this.rotation * Math.PI / 180; // Negative to reverse rotation
        const rotatedX = centerX * Math.cos(rotationRad) - centerY * Math.sin(rotationRad);
        const rotatedY = centerX * Math.sin(rotationRad) + centerY * Math.cos(rotationRad);

        // Removing the zoom effect and calculating the position in the world
        const worldX = rotatedX / this.zoom + this.x + this.engine.baseWidth / (2 * this.zoom);
        const worldY = rotatedY / this.zoom + this.y + this.engine.baseHeight / (2 * this.zoom);

        return {x: worldX, y: worldY};
    }
    worldToScreen (worldX, worldY) {
        // Convert to coordinates relative to the camera center
        const relativeX = (worldX - this.x) * this.zoom;
        const relativeY = (worldY - this.y) * this.zoom;

        // Applying rotation using the rotation matrix
        const rotationRad = this.rotation * Math.PI / 180;
        const rotatedX = relativeX * Math.cos(rotationRad) - relativeY * Math.sin(rotationRad);
        const rotatedY = relativeX * Math.sin(rotationRad) + relativeY * Math.cos(rotationRad);

        // Apply overall scale
        const scaledX = rotatedX * this.engine.config.quality;
        const scaledY = rotatedY * this.engine.config.quality;

        // Convert to plane coordinates
        const rect = this.engine.canvas.getBoundingClientRect();
        const screenX = scaledX * (rect.width / this.engine.canvas.width) + rect.left + (rect.width / 2);
        const screenY = scaledY * (rect.height / this.engine.canvas.height) + rect.top + (rect.height / 2);

        return {x: screenX, y: screenY};
    }
    /** ======== LIMIT ZONE ======== */

    /** ======== FOLLOW ENTITY ======== */
    follow (entity, config = {}) {
        if (!this.engine.isEntity(entity))
            throw new Error('Entity is required');

        this._followedEntity = entity;
        this._followConfig = {
            behavior: config.behavior || 'center',
            offset: {
                x: config.offset?.x || 0,
                y: config.offset?.y || 0
            },
            deadzone: {
                x: config.deadzone?.x || 0,
                y: config.deadzone?.y || 0
            },
            smooth: config.smooth ?? true,
            smoothSpeed: config.smoothSpeed || 0.1
        };

        // Ensure smooth speed is between 0 and 1
        this._followConfig.smoothSpeed = Math.min(Math.max(this._followConfig.smoothSpeed, 0), 1);

        return this;
    }
    cancelFollow () {
        this._followedEntity = null;
        this._followConfig = null;
        this._followOffset = {x: 0, y: 0};
        return this;
    }
    /** ======== END ======== */

    /** ======== POSITION HANDLING ======== */
    calcFollowPosition () {
        if (!this._followedEntity || !this._followConfig) return null;

        const entity = this._followedEntity;
        const config = this._followConfig;
        const viewportWidth = this.engine.baseWidth / this.zoom;
        const viewportHeight = this.engine.baseHeight / this.zoom;

        let targetX = this.x;
        let targetY = this.y;

        // Calculating the center position of an entity
        const entityCenterX = entity.absoluteX + entity.width / 2;
        const entityCenterY = entity.absoluteY + entity.height / 2;

        // Calculating current visibility limits
        const viewLeft = this.x;
        const viewRight = this.x + viewportWidth;
        const viewTop = this.y;
        const viewBottom = this.y + viewportHeight;

        // Calculating the deadzone range
        const deadzoneX = config.deadzone.x;
        const deadzoneY = config.deadzone.y;

        // Calculating target position based on behavior
        switch (config.behavior) {
            case 'center':
                targetX = entityCenterX - viewportWidth / 2 + config.offset.x;
                targetY = entityCenterY - viewportHeight / 2 + config.offset.y;
                break;

            case 'edge':
                if (entityCenterX < viewLeft + deadzoneX) {
                    targetX = entityCenterX - deadzoneX;
                } else if (entityCenterX > viewRight - deadzoneX) {
                    targetX = entityCenterX + deadzoneX - viewportWidth;
                }

                if (entityCenterY < viewTop + deadzoneY) {
                    targetY = entityCenterY - deadzoneY;
                } else if (entityCenterY > viewBottom - deadzoneY) {
                    targetY = entityCenterY + deadzoneY - viewportHeight;
                }
                break;

            case 'horizontal-edge':
                if (entityCenterX < viewLeft + deadzoneX) {
                    targetX = entityCenterX - deadzoneX;
                } else if (entityCenterX > viewRight - deadzoneX) {
                    targetX = entityCenterX + deadzoneX - viewportWidth;
                }
                break;

            case 'vertical-edge':
                if (entityCenterY < viewTop + deadzoneY) {
                    targetY = entityCenterY - deadzoneY;
                } else if (entityCenterY > viewBottom - deadzoneY) {
                    targetY = entityCenterY + deadzoneY - viewportHeight;
                }
                break;

            case 'top':
                targetX = entityCenterX - viewportWidth / 2 + config.offset.x;
                targetY = entityCenterY - deadzoneY + config.offset.y;
                break;

            case 'bottom':
                targetX = entityCenterX - viewportWidth / 2 + config.offset.x;
                targetY = entityCenterY + deadzoneY - viewportHeight + config.offset.y;
                break;

            case 'left':
                targetX = entityCenterX - deadzoneX + config.offset.x;
                targetY = entityCenterY - viewportHeight / 2 + config.offset.y;
                break;

            case 'right':
                targetX = entityCenterX + deadzoneX - viewportWidth + config.offset.x;
                targetY = entityCenterY - viewportHeight / 2 + config.offset.y;
                break;
        }

        // Applying bounds restrictions
        if (this.bounds) {
            if (this.bounds.width > viewportWidth) {
                targetX = Math.min(
                    Math.max(targetX, this.bounds.x),
                    this.bounds.x + this.bounds.width - viewportWidth
                );
            } else {
                targetX = this.bounds.x + (this.bounds.width - viewportWidth) / 2;
            }

            if (this.bounds.height > viewportHeight) {
                targetY = Math.min(
                    Math.max(targetY, this.bounds.y),
                    this.bounds.y + this.bounds.height - viewportHeight
                );
            } else {
                targetY = this.bounds.y + (this.bounds.height - viewportHeight) / 2;
            }
        }

        return {x: targetX, y: targetY};
    }
    calcFixedPosition (x, y) {
        const camera = this.engine.camera;
        const viewportWidth = this.engine.baseWidth / camera.zoom;
        const viewportHeight = this.engine.baseHeight / camera.zoom;

        // Calculating position relative to viewport
        let fixedX = camera.x + (x / this.engine.baseWidth) * viewportWidth;
        let fixedY = camera.y + (y / this.engine.baseHeight) * viewportHeight;

        // If x or y are negative, we calculate from the right/bottom.
        if (x < 0)
            fixedX = camera.x + viewportWidth + (x / this.engine.baseWidth) * viewportWidth;
        if (y < 0)
            fixedY = camera.y + viewportHeight + (y / this.engine.baseHeight) * viewportHeight;

        return {x: fixedX, y: fixedY};
    }
    /** ======== END ======== */

    /** ======== VISIBILITY CHECK ======== */
    inView (object, padding = this.config.viewPadding) {
        // Calculating viewport taking zoom into account
        const viewportWidth = this.engine.baseWidth / this.zoom;
        const viewportHeight = this.engine.baseHeight / this.zoom;

        // Camera view boundaries with extra padding
        const cameraLeft = this.x - padding;
        const cameraTop = this.y - padding;
        const cameraRight = this.x + viewportWidth + padding;
        const cameraBottom = this.y + viewportHeight + padding;

        let objectBounds;

        // Detecting object type and extracting bounds
        if (this.engine.isEntity(object)) {
            const collision = object.collision || {};
            objectBounds = {
                left: object.absoluteX + (collision.x || 0),
                top: object.absoluteY + (collision.y || 0),
                right: object.absoluteX + (collision.x || 0) + (collision.width || object.width),
                bottom: object.absoluteY + (collision.y || 0) + (collision.height || object.height)
            };
        } else if (object.collision) {
            objectBounds = {
                left: object.x + object.collision.x,
                top: object.y + object.collision.y,
                right: object.x + object.collision.x + object.collision.width,
                bottom: object.y + object.collision.y + object.collision.height
            };
        } else {
            objectBounds = {
                left: object.x || 0,
                top: object.y || 0,
                right: (object.x || 0) + (object.width || 0),
                bottom: (object.y || 0) + (object.height || 0)
            };
        }

        // Checking overlap
        return !(objectBounds.right < cameraLeft ||
            objectBounds.left > cameraRight ||
            objectBounds.bottom < cameraTop ||
            objectBounds.top > cameraBottom);
    }
    pointInView (x, y, padding = this.config.viewPadding) {
        const viewportWidth = this.engine.baseWidth / this.zoom;
        const viewportHeight = this.engine.baseHeight / this.zoom;

        return x >= (this.x - padding) &&
            x <= (this.x + viewportWidth + padding) &&
            y >= (this.y - padding) &&
            y <= (this.y + viewportHeight + padding);
    }
    /** ======== END ======== */

    /** ======== STATES ======== */
    saveState (name) {
        if (!name) {
            throw new Error('Status name cannot be empty.');
        }

        // Save all important camera parameters
        const state = {
            x: this.x,
            y: this.y,
            zoom: this.zoom,
            _targetX: this._targetX,
            _targetY: this._targetY,
            _targetZoom: this._targetZoom,
            smoothing: this.smoothing,
            smoothSpeed: this.smoothSpeed,
            bounds: this.bounds ? {...this.bounds} : null,
            minZoom: this.minZoom,
            maxZoom: this.maxZoom,
            _followedEntity: this._followedEntity,
            _followConfig: this._followConfig ? {...this._followConfig} : null,
            _followOffset: {...this._followOffset},
            timestamp: new Date().toISOString()
        };

        this._states.set(name, state);
        return this;
    }
    loadState (name, options = {}) {
        const state = this._states.get(name);
        if (!state) {
            throw new Error(`No status with name "${name}" found.`);
        }

        const {smooth = false, duration = 500} = options;

        if (smooth) {
            // Soft transition to saved state
            this.zoomTo({
                zoom: state.zoom,
                centerX: state.x + (this.engine.baseWidth / state.zoom) / 2,
                centerY: state.y + (this.engine.baseHeight / state.zoom) / 2,
                duration: duration
            });
        } else {
            // Apply status immediately
            this.x = this._targetX = state.x;
            this.y = this._targetY = state.y;
            this.zoom = this._targetZoom = state.zoom;
        }

        // Restoring other settings
        this.smoothing = state.smoothing;
        this.smoothSpeed = state.smoothSpeed;
        this.bounds = state.bounds ? {...state.bounds} : null;
        this.minZoom = state.minZoom;
        this.maxZoom = state.maxZoom;

        // Restore follow settings
        if (state._followedEntity) {
            this._followedEntity = state._followedEntity;
            this._followConfig = state._followConfig ? {...state._followConfig} : null;
            this._followOffset = {...state._followOffset};
        } else {
            this.cancelFollow();
        }

        return this;
    }
    deleteState (name) {
        return this._states.delete(name);
    }
    getStatesList () {
        return Array.from(this._states.keys());
    }
    hasState (name) {
        return this._states.has(name);
    }
    /** ======== END ======== */

    /** ======== EFFECTS ======== */
    shake (options = {}) {
        if (typeof options === 'number') {
            options = {intensity: options};
        }

        const {
            intensity = 5,
            duration = 500,
            frequency = 50,
            falloff = 'linear'
        } = options;

        const startTime = Date.now();
        const originalX = this.x;
        const originalY = this.y;

        this._effects.shake = {
            animate: () => {
                const elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    // Calculation of residual intensity
                    const progress = elapsed / duration;
                    const remainingIntensity = falloff === 'linear' ? intensity * (1 - progress) : intensity * Math.pow(1 - progress, 2);

                    // Apply vibration
                    const offsetX = (Math.random() - 0.5) * 2 * remainingIntensity;
                    const offsetY = (Math.random() - 0.5) * 2 * remainingIntensity;

                    // Calculating the new position
                    let newX = originalX + offsetX;
                    let newY = originalY + offsetY;

                    // Applying bounds restrictions
                    if (this.bounds) {
                        const viewportWidth = this.engine.baseWidth / this.zoom;
                        const viewportHeight = this.engine.baseHeight / this.zoom;

                        if (this.bounds.width > viewportWidth) {
                            newX = Math.min(
                                Math.max(newX, this.bounds.x),
                                this.bounds.x + this.bounds.width - viewportWidth
                            );
                        } else {
                            newX = this.bounds.x + (this.bounds.width - viewportWidth) / 2;
                        }

                        if (this.bounds.height > viewportHeight) {
                            newY = Math.min(
                                Math.max(newY, this.bounds.y),
                                this.bounds.y + this.bounds.height - viewportHeight
                            );
                        } else {
                            newY = this.bounds.y + (this.bounds.height - viewportHeight) / 2;
                        }
                    }

                    this.x = newX;
                    this.y = newY;

                    return true;
                } else {
                    // At the end of the effect, return to the original position (within bounds)
                    if (this.bounds) {
                        const viewportWidth = this.engine.baseWidth / this.zoom;
                        const viewportHeight = this.engine.baseHeight / this.zoom;

                        if (this.bounds.width > viewportWidth) {
                            this.x = Math.min(
                                Math.max(originalX, this.bounds.x),
                                this.bounds.x + this.bounds.width - viewportWidth
                            );
                        } else {
                            this.x = this.bounds.x + (this.bounds.width - viewportWidth) / 2;
                        }

                        if (this.bounds.height > viewportHeight) {
                            this.y = Math.min(
                                Math.max(originalY, this.bounds.y),
                                this.bounds.y + this.bounds.height - viewportHeight
                            );
                        } else {
                            this.y = this.bounds.y + (this.bounds.height - viewportHeight) / 2;
                        }
                    } else {
                        this.x = originalX;
                        this.y = originalY;
                    }

                    this._effects.shake = null;
                    return false;
                }
            }
        };

        return this;
    }
    dramaticFocus (target, duration = 1000, finalZoom = 2) {
        // Save initial state
        const startZoom = this.zoom;
        const startX = this.x;
        const startY = this.y;
        const startTime = Date.now();

        // Calculating the final position
        const finalX = target.x - (this.engine.baseWidth / finalZoom) / 2;
        const finalY = target.y - (this.engine.baseHeight / finalZoom) / 2;

        this._effects.dramaticFocus = {
            animate: () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Using the easing function for smoother motion
                const easeProgress = this.engine.Ease.easeInOutCubic(progress);

                // Make gradual changes
                this.zoom = startZoom + (finalZoom - startZoom) * easeProgress;
                this.x = startX + (finalX - startX) * easeProgress;
                this.y = startY + (finalY - startY) * easeProgress;

                return progress < 1;
            }
        };

        return this;
    }
    _updateEffects (ctx) {
        // Update all active effects
        for (const [name, effect] of Object.entries(this._effects)) {
            if (effect && !effect.animate(ctx)) {
                this._effects[name] = null;
            }
        }
    }
    /** ======== END ======== */

    /** ======== RESET ======== */
    reset () {
        // Reset position and zoom
        this.x = this._originalConfig.x;
        this.y = this._originalConfig.y;
        this.zoom = this._originalConfig.zoom;
        this.rotation = this._originalConfig.rotation;

        // Reset target values
        this._targetX = this.x;
        this._targetY = this.y;
        this._targetZoom = this.zoom;
        this._targetRotation = this.rotation;

        // Reset last values
        this._lastX = this.x;
        this._lastY = this.y;
        this._lastZoom = this.zoom;
        this._lastRotation = this.rotation;

        // Reset deltas
        this.deltaX = 0;
        this.deltaY = 0;
        this.deltaZoom = 0;
        this.deltaRotation = 0;

        // Reset camera limitations
        this.bounds = this._originalConfig.bounds;
        this.minZoom = this._originalConfig.minZoom;
        this.maxZoom = this._originalConfig.maxZoom;

        // Reset smooth motion settings
        this.smoothing = this._originalConfig.smoothing;
        this.smoothSpeed = this._originalConfig.smoothSpeed;

        // Cancel follow
        this.cancelFollow();

        // Clear all states
        this._states.clear();

        // Clear all effects
        this._effects = {
            shake: null
        };

        return this;
    }
    /** ======== END ======== */

}

export default Camera;