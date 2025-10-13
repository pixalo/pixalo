/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */
import Box2D from './dependencies/Box2D.min.js';

class Physics {

    constructor (engine, config = {}) {
        if (!engine.physicsEnabled)
            return;

        this.engine = engine;
        this.canvas = engine.canvas;
        this.BASE_SCALE = config.scale || 30;
        this.quality = config.quality || 1;
        this.SCALE = this.BASE_SCALE * this.quality;

        const gravity = config.gravity === false || config.gravity === undefined ? {x: 0, y: 0} : {
            x: config.gravity.x ?? 0,
            y: config.gravity.y ?? 9.8 * this.SCALE
        };

        // Store original config for reset functionality
        this.originalConfig = {
            scale: this.BASE_SCALE,
            quality: this.quality,
            gravity,
            sleep: config.sleep !== undefined ? config.sleep : true,
            friction: config.friction ?? 0.2,
            restitution: config.bounce ?? 0.2,
            density: config.density ?? 1,
            maxVelocity: config.maxVelocity ?? 1000,
            velocityIterations: config.velocityIterations ?? 8,
            positionIterations: config.positionIterations ?? 3,
            ...config,
            drag: {
                angularDamping: config.drag?.angularDamping ?? 1,
                linearDamping : config.drag?.linearDamping  ?? 0.1,
                fixedRotation : config.drag?.fixedRotation  ?? false
            }
        };
        this.config = {...this.originalConfig};

        this.world = new Box2D.Dynamics.b2World(
            new Box2D.Common.Math.b2Vec2(gravity.x / this.SCALE, gravity.y / this.SCALE),
            this.originalConfig.sleep
        );

        this.bodies = new Map();
        this.joints = new Map();
        this.velocities = new Map();
        this.materials = new Map();
        this.activeContacts = new Map();

        this._setupContactListener();

        this.mouseJoints = new Map();
        this.draggedBodies = new Map();
        this.bodyTouchMap = new Map();
        this.mouseWorld = new Box2D.Common.Math.b2Vec2(0, 0);

        this._setupDragListeners();
    }

    update (deltaTime) {
        const dt = Math.min(deltaTime, 20) / 1000; // Maximum 20ms, converted to seconds

        this.world.Step(
            dt,
            this.config.velocityIterations || 8,
            this.config.positionIterations || 3
        );

        // Update the position of entities
        for (const [entityId, body] of this.bodies) {
            const entity = body.GetUserData();
            if (!entity) continue;

            const position = body.GetPosition();
            const angle = body.GetAngle();

            // Convert position from meters to pixels
            entity.style({
                x: (position.x * this.SCALE) - entity.width / 2,
                y: (position.y * this.SCALE) - entity.height / 2,
                rotation: angle * 180 / Math.PI
            });

            // Save speed
            const velocity = body.GetLinearVelocity();
            this.velocities.set(entityId, {
                x: velocity.x * this.SCALE,
                y: velocity.y * this.SCALE
            });
        }

        this.world.ClearForces();
    }

    /** ======== SETUP COLLISION ======== */
    isTouching (entityA, entityB) {
        const idA = this._getEntityId(entityA);
        const idB = this._getEntityId(entityB);

        const contactsA = this.activeContacts.get(idA);
        return contactsA ? contactsA.includes(idB) : false;
    }
    getCollisionSides (contact, worldManifold) {
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();

        if (fixtureA.IsSensor() || fixtureB.IsSensor()) {
            const bodyA = fixtureA.GetBody();
            const bodyB = fixtureB.GetBody();
            const posA = bodyA.GetPosition();
            const posB = bodyB.GetPosition();

            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;

            let sideA, sideB;

            if (Math.abs(dx) > Math.abs(dy)) {
                sideA = dx > 0 ? 'right' : 'left';
                sideB = dx > 0 ? 'left' : 'right';
            } else {
                sideA = dy > 0 ? 'bottom' : 'top';
                sideB = dy > 0 ? 'top' : 'bottom';
            }

            return {sideA, sideB};
        }

        const normal = worldManifold.m_normal;

        let sideA, sideB;

        if (Math.abs(normal.x) > Math.abs(normal.y)) {
            sideA = normal.x > 0 ? 'left' : 'right';
            sideB = normal.x > 0 ? 'right' : 'left';
        } else {
            sideA = normal.y > 0 ? 'top' : 'bottom';
            sideB = normal.y > 0 ? 'bottom' : 'top';
        }

        return {sideA, sideB};
    }
    _setupContactListener () {
        const listener = new Box2D.Dynamics.b2ContactListener();

        listener.BeginContact = contact => {
            const entityA = contact.GetFixtureA().GetBody().GetUserData();
            const entityB = contact.GetFixtureB().GetBody().GetUserData();

            if (!entityA || !entityB) return;

            this._addContact(entityA.id, entityB.id);
            this._addContact(entityB.id, entityA.id);

            const worldManifold = new Box2D.Collision.b2WorldManifold();
            contact.GetWorldManifold(worldManifold);

            const contactPoints = worldManifold.m_points.map(point => ({
                x: point.x * this.SCALE,
                y: point.y * this.SCALE
            }));

            const normal = {
                x: worldManifold.m_normal.x,
                y: worldManifold.m_normal.y
            };
            const {sideA, sideB} = this.getCollisionSides(contact, worldManifold);

            const bodyA = contact.GetFixtureA().GetBody();
            const bodyB = contact.GetFixtureB().GetBody();
            const velocityA = bodyA.GetLinearVelocity();
            const velocityB = bodyB.GetLinearVelocity();

            const relativeVelocity = {
                x: (velocityB.x - velocityA.x) * this.SCALE,
                y: (velocityB.y - velocityA.y) * this.SCALE
            };

            const collisionData = {
                entityA,
                entityB,
                sideA,
                sideB,
                contact,
                contactPoints,
                normal,
                relativeVelocity,
                type: 'start',
                impactForce: Math.sqrt(
                    relativeVelocity.x * relativeVelocity.x +
                    relativeVelocity.y * relativeVelocity.y
                ),
                angle: Math.atan2(normal.y, normal.x) * 180 / Math.PI
            };

            this.engine.trigger('collisions', collisionData);

            if (entityA && typeof entityA.trigger === 'function') {
                entityA.trigger('collide', {
                    ...collisionData,
                    target: entityB,
                    side: sideA
                });
            }

            if (entityB && typeof entityB.trigger === 'function') {
                entityB.trigger('collide', {
                    ...collisionData,
                    target: entityA,
                    side: sideB,
                    normal: {x: -normal.x, y: -normal.y},
                    relativeVelocity: {x: -relativeVelocity.x, y: -relativeVelocity.y}
                });
            }
        };
        listener.EndContact   = contact => {
            const entityA = contact.GetFixtureA().GetBody().GetUserData();
            const entityB = contact.GetFixtureB().GetBody().GetUserData();

            this._removeContact(entityA.id, entityB.id);
            this._removeContact(entityB.id, entityA.id);

            // emit to physics
            this.engine.trigger('collisionEnd', {entityA, entityB, contact});

            // emit to the entities themselves
            if (entityA && typeof entityA.trigger === 'function') {
                entityA.trigger('collideEnd', {
                    target: entityB,
                    contact,
                    type: 'end'
                });
            }

            if (entityB && typeof entityB.trigger === 'function') {
                entityB.trigger('collideEnd', {
                    target: entityA,
                    contact,
                    type: 'end'
                });
            }
        };

        this.world.SetContactListener(listener);
    }
    _addContact (entityId, targetId) {
        if (!this.activeContacts.has(entityId))
            this.activeContacts.set(entityId, []);

        const contacts = this.activeContacts.get(entityId);
        if (!contacts.includes(targetId))
            contacts.push(targetId);
    }
    _removeContact (entityId, targetId) {
        if (!this.activeContacts.has(entityId)) return;

        const contacts = this.activeContacts.get(entityId);
        const index = contacts.indexOf(targetId);

        if (index !== -1) {
            contacts.splice(index, 1);
            if (contacts.length === 0)
                this.activeContacts.delete(entityId);
        }
    }
    /** ======== END SETUP COLLISION ======== */

    /** ======== ENTITIES ======== */
    hasEntity (entity) {
        return this.bodies.has(entity);
    }
    addEntity (entity, config = {}) {
        const bodyDef = new Box2D.Dynamics.b2BodyDef();
        const scaled = this._getScaledDimensions(entity);

        // merge material + config
        const mat = this.materials.get(config.material) || {};
        const props = {...mat, ...config};

        // body type
        switch (props.bodyType) {
            case 'static':
                bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
                break;
            case 'kinematic':
                bodyDef.type = Box2D.Dynamics.b2Body.b2_kinematicBody;
                break;
            default:
                bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        }

        // initial transform
        bodyDef.position.x = (entity.absoluteX + scaled.width / 2) / this.SCALE;
        bodyDef.position.y = (entity.absoluteY + scaled.height / 2) / this.SCALE;
        bodyDef.angle = (entity.styles.rotation || 0) * Math.PI / 180;

        // body-level flags
        bodyDef.gravityScale = props.gravityScale ?? 1;
        bodyDef.bullet = props.bullet ?? false;
        bodyDef.allowSleep = props.sleeping ?? true;

        // create body & shape
        const body = this.world.CreateBody(bodyDef);
        const shape = this._createShape(entity);

        // fixture definition
        const fixtureDef = new Box2D.Dynamics.b2FixtureDef();
        fixtureDef.shape = shape;
        fixtureDef.isSensor = props.sensor || false;
        fixtureDef.density = props.density ?? this.config.density;
        fixtureDef.friction = props.friction ?? this.config.friction;
        fixtureDef.restitution = props.restitution ?? this.config.restitution;

        // collision filter
        const filter = new Box2D.Dynamics.b2FilterData();
        const c_filter = props.collision, m_filter = mat.filter;
        filter.categoryBits = c_filter?.categoryBits ?? m_filter?.categoryBits ?? 0x0001;
        filter.maskBits = c_filter?.maskBits ?? m_filter?.maskBits ?? 0xFFFF;
        filter.groupIndex = c_filter?.groupIndex ?? m_filter?.groupIndex ?? 0;
        fixtureDef.filter = filter;

        body.CreateFixture(fixtureDef);

        // runtime body properties
        body.SetFixedRotation(props.fixedRotation ?? false);
        body.SetLinearDamping(props.linearDamping ?? 0.1);
        body.SetAngularDamping(props.angularDamping ?? 1);

        // register
        this.bodies.set(entity.id, body);
        this.velocities.set(entity.id, {x: 0, y: 0});
        body.SetUserData(entity);

        return body;
    }
    removeEntity (entity) {
        const body = this.bodies.get(entity.id);
        if (body) {
            Promise.resolve().then(() => {
                body.SetActive(false);
                body.SetUserData(null);

                this.world.DestroyBody(body);
                this.bodies.delete(entity.id);
                this.velocities.delete(entity.id);
                this.activeContacts.delete(entity.id);
                this.bodies.delete(entity.id);
            });
        }
        return this;
    }
    moveEntity (options, y = 0, duration = 0, easing = 'linear') {
        /* ---------- argument overloading ---------- */
        if (typeof options === 'number')
            options = {x: options, y, duration: duration || 0, easing};

        const config = {
            x: 0,
            y: 0,
            duration: 0,
            easing: 'linear',
            relative: false,
            onUpdate: null,
            onComplete: null,
            ...options
        };

        const entity = config.entity;
        if (!entity || !this.engine.isEntity(entity))
            throw new Error('Entity is required');

        const body = this.bodies.get(entity.id);
        if (!body) return this;

        try {
            /* ---------- helpers to swap body type ---------- */
            const makeKinematic = () => {
                if (body.GetType() === Box2D.Dynamics.b2Body.b2_staticBody) {
                    body.SetType(Box2D.Dynamics.b2Body.b2_kinematicBody);
                    return true;
                }
                return false;
            };
            const restoreType = (wasStatic) => {
                if (wasStatic) body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
                body.SetAwake(true);
            };

            /* ---------- starting position (world pixels) ---------- */
            const currentPos = body.GetPosition();
            const startPos = {
                x: currentPos.x * this.SCALE,
                y: currentPos.y * this.SCALE
            };

            /* ---------- target position (pixels) ---------- */
            let target = {x: config.x, y: config.y};
            if (config.relative) {
                target.x += startPos.x;
                target.y += startPos.y;
            }

            /* ---------- instantaneous move ---------- */
            if (!config.duration) {
                const newPos = new Box2D.Common.Math.b2Vec2(
                    target.x / this.SCALE,
                    target.y / this.SCALE
                );
                const wasStatic = makeKinematic();
                body.SetPosition(newPos);
                restoreType(wasStatic);
                config.onComplete?.(entity);
                return true;
            }

            /* ---------- animated move ---------- */
            let startTime = performance.now();
            let pausedAt = 0;
            let totalPause = 0;

            const deltaX = target.x - startPos.x;
            const deltaY = target.y - startPos.y;

            const easingFunction =
                typeof config.easing === 'function'
                    ? config.easing
                    : (this.engine.Ease?.[config.easing] || this.engine.Ease.linear);

            const animate = (now) => {
                /* ---- engine paused -> record pause start ---- */
                if (!this.engine.running) {
                    if (pausedAt === 0) pausedAt = now;
                    requestAnimationFrame(animate);
                    return;
                }

                /* ---- just resumed -> update total paused time ---- */
                if (pausedAt !== 0) {
                    totalPause += now - pausedAt;
                    pausedAt = 0;
                }

                const adjustedNow = now - totalPause;
                const elapsed = adjustedNow - startTime;

                /* ---- final frame ---- */
                if (elapsed >= config.duration) {
                    const finalPos = new Box2D.Common.Math.b2Vec2(
                        target.x / this.SCALE,
                        target.y / this.SCALE
                    );
                    const wasStatic = makeKinematic();
                    body.SetPosition(finalPos);
                    restoreType(wasStatic);
                    config.onComplete?.(entity);
                    return;
                }

                /* ---- interpolate ---- */
                const progress = elapsed / config.duration;
                const eased = easingFunction(progress);

                const newPos = new Box2D.Common.Math.b2Vec2(
                    (startPos.x + deltaX * eased) / this.SCALE,
                    (startPos.y + deltaY * eased) / this.SCALE
                );

                const wasStatic = makeKinematic();
                body.SetPosition(newPos);
                restoreType(wasStatic);

                config.onUpdate?.(entity, eased);

                /* ---- keep looping ---- */
                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
            return this;
        } catch (err) {
            this.engine.warn('Error moving entity:', err);
            return this;
        }
    }
    _getEntityId (entity) {
        return this.engine.isEntity(entity) ? entity.id : entity;
    }
    /** ======== END ENTITIES ======== */

    /** ======== SHAPES ======== */
    updateShape (entity) {
        const body = this.bodies.get(entity.id);
        if (!body) return this;
        body.m_fixtureList.m_shape = this._createShape(entity);
        return this;
    }
    _createShape (entity) {
        switch (entity.styles.shape) {
            case 'circle': {
                const shape = new Box2D.Collision.Shapes.b2CircleShape(
                    Math.min(entity.width, entity.height) / 2 / this.SCALE
                );
                return shape;
            }
            case 'triangle': {
                const shape = new Box2D.Collision.Shapes.b2PolygonShape();
                const vertices = [
                    new Box2D.Common.Math.b2Vec2(0, -entity.height / 2 / this.SCALE),
                    new Box2D.Common.Math.b2Vec2(entity.width / 2 / this.SCALE, entity.height / 2 / this.SCALE),
                    new Box2D.Common.Math.b2Vec2(-entity.width / 2 / this.SCALE, entity.height / 2 / this.SCALE)
                ];
                shape.SetAsArray(vertices, vertices.length);
                return shape;
            }
            case 'star': {
                const shape = new Box2D.Collision.Shapes.b2PolygonShape();
                const spikes = entity.styles.spikes || 5;
                const size = Math.min(entity.width, entity.height);
                const outerRadius = (size / 2) / this.SCALE;

                // Using a regular polygon for collision
                // Reduce radius to 99% to ensure no interference
                const safeRadius = outerRadius * 0.99;
                const points = [];

                // Construct a regular polygon with more points for better coverage
                const segments = spikes * 2;
                for (let i = 0; i < segments; i++) {
                    const angle = (i * 2 * Math.PI / segments) - Math.PI / 2;
                    points.push(new Box2D.Common.Math.b2Vec2(
                        Math.cos(angle) * safeRadius,
                        Math.sin(angle) * safeRadius
                    ));
                }

                try {
                    // Creating a simpler polygon with fewer points
                    const simplifiedPoints = [];
                    const simplifiedSegments = 8; // Using 8 points for greater stability

                    for (let i = 0; i < simplifiedSegments; i++) {
                        const angle = (i * 2 * Math.PI / simplifiedSegments) - Math.PI / 2;
                        simplifiedPoints.push(new Box2D.Common.Math.b2Vec2(
                            Math.cos(angle) * safeRadius,
                            Math.sin(angle) * safeRadius
                        ));
                    }

                    shape.SetAsArray(simplifiedPoints, simplifiedPoints.length);
                    return shape;
                } catch (error) {
                    this.engine.warn('Creating circle shape as fallback for star');
                    // In case of error, we use a circle with a smaller radius.
                    return new Box2D.Collision.Shapes.b2CircleShape(safeRadius);
                }
            }
            case 'polygon': {
                if (entity.collision.points && entity.collision.points.length >= 3) {
                    const shape = new Box2D.Collision.Shapes.b2PolygonShape();
                    const vertices = entity.collision.points.map(point =>
                        new Box2D.Common.Math.b2Vec2(
                            point.x / this.SCALE,
                            point.y / this.SCALE
                        )
                    );

                    try {
                        // Ensure the clockwise order of the points
                        const clockwise = vertices.reduce((sum, point, i) => {
                            const next = vertices[(i + 1) % vertices.length];
                            return sum + (next.x - point.x) * (next.y + point.y);
                        }, 0);

                        if (clockwise > 0) {
                            vertices.reverse();
                        }

                        shape.SetAsArray(vertices, vertices.length);
                        return shape;
                    } catch (error) {
                        this.engine.warn('Failed to create polygon shape, falling back to rectangle');
                        return this._createRectangleShape(entity);
                    }
                }
                // If no collision points are defined, it will be converted to a rectangle.
                return this._createRectangleShape(entity);
            }
            default: {
                return this._createRectangleShape(entity);
            }
        }
    }
    _createRectangleShape (entity) {
        const shape = new Box2D.Collision.Shapes.b2PolygonShape();
        const scaled = this._getScaledDimensions(entity);

        shape.SetAsBox(
            (scaled.width / 2) / this.SCALE,
            (scaled.height / 2) / this.SCALE
        );
        return shape;
    }
    _getScaledDimensions (entity) {
        const scaleX = entity.styles.scaleX * entity.styles.scale;
        const scaleY = entity.styles.scaleY * entity.styles.scale;

        return {
            width: entity.width * Math.abs(scaleX),
            height: entity.height * Math.abs(scaleY),
            scaleX,
            scaleY
        };
    }
    /** ======== END SHAPES ======== */

    /** ======== MATERIAL ======== */
    createMaterial (name, properties) {
        const {
            // physical
            bodyType = 'dynamic',
            density = 1,
            friction = 0.3,
            restitution = 0.2,

            // damping
            linearDamping = 0.1,
            angularDamping = 1,

            // behaviour
            fixedRotation = false,
            gravityScale = 1, // 0 = weight-less, Negative value = anti-gravity
            bullet = false,
            sleeping = true,

            // filters
            categoryBits = 0x0001,
            maskBits = 0xFFFF,
            groupIndex = 0
        } = properties;

        this.materials.set(name, {
            bodyType,
            density,
            friction,
            restitution,
            linearDamping,
            angularDamping,
            fixedRotation,
            gravityScale,
            bullet,
            sleeping,
            filter: {categoryBits, maskBits, groupIndex}
        });
        return this;
    }
    getMaterial (name) {
        return this.materials.get(name);
    }
    /** ======== END MATERIAL ======== */

    /** ======== APPLY METHODS ======== */
    setGravity (x, y = 0) {
        if (x === false) {
            x = 0;
            y = 0;
        }
        this.world.SetGravity(new Box2D.Common.Math.b2Vec2(x / this.SCALE, y / this.SCALE));

        for (const [, body] of this.bodies) {
            if (body.GetType() !== Box2D.Dynamics.b2Body.b2_staticBody) {
                this.applyImpulse(body.GetUserData(), {x: 0.0001, y: 0.0001});
            }
        }
        return this;
    }
    applyForce (entity, force) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (body) {
            const center = body.GetWorldCenter();
            body.ApplyForce(
                new Box2D.Common.Math.b2Vec2(force.x, force.y),
                center
            );
        }
        return this;
    }
    setVelocity (entity, velocity) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (body) {
            body.SetLinearVelocity(
                new Box2D.Common.Math.b2Vec2(
                    velocity.x / this.SCALE,
                    velocity.y / this.SCALE
                )
            );
        }
        return this;
    }
    setVelocityLimit (entity, limit) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (body) {
            body.SetLinearVelocity({
                x: Math.min(Math.max(body.GetLinearVelocity().x, -limit), limit),
                y: Math.min(Math.max(body.GetLinearVelocity().y, -limit), limit)
            });
        }
        return this;
    }
    setTransform (entity, {x, y, rotation} = {}) {
        if (!this.bodies.has(entity.id)) return this;
        const body = this.bodies.get(entity.id);
        const SCALE = this.SCALE;

        /* ---- position ---- */
        if (x !== undefined || y !== undefined) {
            const newX = x !== undefined ? (x + entity.width / 2) / SCALE : body.GetPosition().x;
            const newY = y !== undefined ? (y + entity.height / 2) / SCALE : body.GetPosition().y;
            body.SetPosition(new Box2D.Common.Math.b2Vec2(newX, newY));
        }

        /* ---- rotation ---- */
        if (rotation !== undefined)
            body.SetAngle((rotation * Math.PI) / 180);

        return this;
    }
    setAngularVelocity (entity, omega) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (body) {
            body.SetAngularVelocity(omega);
        }
        return this;
    }
    applyTorque (entity, torque) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (body) {
            body.ApplyTorque(torque);
        }
        return this;
    }
    applyImpulse (entity, impulse, point = null) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (body) {
            const worldPoint = point ? new Box2D.Common.Math.b2Vec2(
                point.x / this.SCALE, point.y / this.SCALE
            ) : body.GetWorldCenter();
            body.ApplyImpulse(
                new Box2D.Common.Math.b2Vec2(impulse.x, impulse.y),
                worldPoint
            );
        }
        return this;
    }
    /** ======== END APPLY METHODS ======== */

    /** ======== BODY CONTROL ======== */
    setBodyType (entity, type) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (!body) return this;

        let b2Type;
        switch (type) {
            case 'static':
                b2Type = Box2D.Dynamics.b2Body.b2_staticBody;
                break;
            case 'kinematic':
                b2Type = Box2D.Dynamics.b2Body.b2_kinematicBody;
                break;
            case 'dynamic':
                b2Type = Box2D.Dynamics.b2Body.b2_dynamicBody;
                break;
            default:
                this.engine.warn(`Unknown body type: ${type}`);
                return this;
        }

        body.SetType(b2Type);
        body.SetAwake(true); // wake it up so change takes effect immediately
        return this;
    }
    isBodyAwake (entity) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        return body ? body.IsAwake() : false;
    }
    setBodyAwake (entity, awake) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (body) body.SetAwake(awake);
        return this;
    }
    setBodyProperties (entity, properties) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (body) {
            const fixture = body.GetFixtureList();
            if (fixture) {
                if (properties.friction !== undefined)
                    fixture.SetFriction(properties.friction);

                if (properties.restitution !== undefined)
                    fixture.SetRestitution(properties.restitution);

                if (properties.density !== undefined) {
                    fixture.SetDensity(properties.density);
                    body.ResetMassData();
                }

                if (properties.fixedRotation !== undefined)
                    body.SetFixedRotation(properties.fixedRotation);
            }
        }
        return this;
    }
    haltBody (entity) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (!body) return;
        body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
        return this;
    }
    brakeBody (entity, dampingFactor = 0.9, minSpeed = 0.05) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (!body) return this;

        const v = body.GetLinearVelocity();
        const speed = v.Length(); // Current speed measurement

        if (speed < minSpeed) {
            // The speed is too low; turn it to zero directly so it doesn't increase.
            this.haltBody(entity);
            return this;
        }

        // Multiplying speed by a number less than 1 = step braking
        const newSpeed = speed * dampingFactor;
        // Ratio of the length of the new vector to the old one
        const ratio = newSpeed / speed;

        body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(v.x * ratio, v.y * ratio));
        return this;
    }
    toggleSensor (entity, turnOn = true) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (!body) return this;

        let fixture = body.GetFixtureList();
        while (fixture) {
            fixture.SetSensor(!!turnOn);   // true  -> sensor
            fixture = fixture.GetNext();   // false -> solid
        }
        return this;
    }
    enableSensor (entity) {
        return this.toggleSensor(entity, true);
    }
    disableSensor (entity) {
        return this.toggleSensor(entity, false);
    }
    /** ======== END BODY CONTROL ======== */

    /** ======== GET METHODS ======== */
    getBodyVelocity (entity) {
        entity = this._getEntityId(entity);
        return this.velocities.get(entity);
    }
    getBodyType (entity) {
        entity = this._getEntityId(entity);
        const body = this.bodies.get(entity);
        if (!body) return null;

        const t = body.GetType();
        if (t === Box2D.Dynamics.b2Body.b2_staticBody) return 'static';
        if (t === Box2D.Dynamics.b2Body.b2_kinematicBody) return 'kinematic';
        return 'dynamic';
    }
    getBodySpeed (entity) {
        entity = this._getEntityId(entity);
        const velocity = this.getBodyVelocity(entity);
        return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    }
    /** ======== END GET METHODS ======== */

    /** ======== JOINT SYSTEM ======== */
    joint (entityA, entityB, config = {}) {
        const bodyA = this.bodies.get(entityA.id);
        const bodyB = this.bodies.get(entityB.id);

        if (!bodyA || !bodyB) {
            this.engine.warn('Both entities must have physics bodies');
            return null;
        }

        const jointType = config.type || 'revolute';
        let joint = null;

        switch (jointType) {
            case 'revolute':
                joint = this._createRevoluteJoint(bodyA, bodyB, config);
                break;
            case 'distance':
                joint = this._createDistanceJoint(bodyA, bodyB, config);
                break;
            case 'prismatic':
                joint = this._createPrismaticJoint(bodyA, bodyB, config);
                break;
            case 'weld':
                joint = this._createWeldJoint(bodyA, bodyB, config);
                break;
            case 'rope':
                joint = this._createRopeJoint(bodyA, bodyB, config);
                break;
            case 'pulley':
                joint = this._createPulleyJoint(bodyA, bodyB, config);
                break;
            case 'gear':
                joint = this._createGearJoint(bodyA, bodyB, config);
                break;
            case 'friction':
                joint = this._createFrictionJoint(bodyA, bodyB, config);
                break;
            default:
                this.engine.warn(`Unknown joint type: ${jointType}`);
                return null;
        }

        if (joint) {
            // Store joint reference for cleanup
            if (!this.joints) this.joints = new Map();
            const jointId = `${entityA.id}_${entityB.id}_${Date.now()}`;
            this.joints.set(jointId, {
                joint,
                entityA,
                entityB,
                type: jointType,
                config
            });

            // Trigger joint creation event
            this.engine.trigger('jointCreated', {
                jointId,
                entityA,
                entityB,
                type: jointType,
                joint
            });

            return jointId;
        }

        return null;
    }
    _createRevoluteJoint (bodyA, bodyB, config) {
        const jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();

        // Anchor point (default: center between bodies)
        let anchorX, anchorY;
        if (config.anchor) {
            anchorX = config.anchor.x / this.SCALE;
            anchorY = config.anchor.y / this.SCALE;
        } else {
            const posA = bodyA.GetPosition();
            const posB = bodyB.GetPosition();
            anchorX = (posA.x + posB.x) / 2;
            anchorY = (posA.y + posB.y) / 2;
        }

        jointDef.Initialize(
            bodyA,
            bodyB,
            new Box2D.Common.Math.b2Vec2(anchorX, anchorY)
        );

        // Motor settings
        if (config.motor) {
            jointDef.enableMotor = true;
            jointDef.motorSpeed = (config.motor.speed || 0) * Math.PI / 180; // Convert to radians
            jointDef.maxMotorTorque = config.motor.torque || 1000;
        }

        // Limit settings
        if (config.limits) {
            jointDef.enableLimit = true;
            jointDef.lowerAngle = (config.limits.lower || 0) * Math.PI / 180;
            jointDef.upperAngle = (config.limits.upper || 360) * Math.PI / 180;
        }

        jointDef.collideConnected = config.collideConnected ?? false;

        return this.world.CreateJoint(jointDef);
    }
    _createDistanceJoint (bodyA, bodyB, config) {
        const jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef();

        // Anchor points
        const anchorA = config.anchorA ?
            new Box2D.Common.Math.b2Vec2(config.anchorA.x / this.SCALE, config.anchorA.y / this.SCALE) :
            bodyA.GetWorldCenter();

        const anchorB = config.anchorB ?
            new Box2D.Common.Math.b2Vec2(config.anchorB.x / this.SCALE, config.anchorB.y / this.SCALE) :
            bodyB.GetWorldCenter();

        jointDef.Initialize(bodyA, bodyB, anchorA, anchorB);

        // Distance settings
        if (config.length !== undefined) {
            jointDef.length = config.length / this.SCALE;
        }

        // Spring settings
        jointDef.frequencyHz = config.frequency ?? 4.0;
        jointDef.dampingRatio = config.damping ?? 0.5;
        jointDef.collideConnected = config.collideConnected ?? false;

        return this.world.CreateJoint(jointDef);
    }
    _createPrismaticJoint (bodyA, bodyB, config) {
        const jointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();

        // Anchor point
        const anchor = config.anchor ?
            new Box2D.Common.Math.b2Vec2(config.anchor.x / this.SCALE, config.anchor.y / this.SCALE) :
            bodyA.GetWorldCenter();

        // Axis direction
        const axis = config.axis || {x: 1, y: 0};
        const axisVec = new Box2D.Common.Math.b2Vec2(axis.x, axis.y);

        jointDef.Initialize(bodyA, bodyB, anchor, axisVec);

        // Motor settings
        if (config.motor) {
            jointDef.enableMotor = true;
            jointDef.motorSpeed = config.motor.speed / this.SCALE || 0;
            jointDef.maxMotorForce = config.motor.force || 1000;
        }

        // Limit settings
        if (config.limits) {
            jointDef.enableLimit = true;
            jointDef.lowerTranslation = (config.limits.lower || 0) / this.SCALE;
            jointDef.upperTranslation = (config.limits.upper || 100) / this.SCALE;
        }

        jointDef.collideConnected = config.collideConnected ?? false;

        return this.world.CreateJoint(jointDef);
    }
    _createWeldJoint (bodyA, bodyB, config) {
        const jointDef = new Box2D.Dynamics.Joints.b2WeldJointDef();

        // Anchor point
        const anchor = config.anchor ?
            new Box2D.Common.Math.b2Vec2(config.anchor.x / this.SCALE, config.anchor.y / this.SCALE) :
            bodyA.GetWorldCenter();

        jointDef.Initialize(bodyA, bodyB, anchor);

        // Flexibility settings
        jointDef.frequencyHz = config.frequency ?? 0;
        jointDef.dampingRatio = config.damping ?? 0;
        jointDef.collideConnected = config.collideConnected ?? false;

        return this.world.CreateJoint(jointDef);
    }
    _createRopeJoint (bodyA, bodyB, config) {
        const jointDef = new Box2D.Dynamics.Joints.b2RopeJointDef();

        // Local anchor points
        jointDef.localAnchorA = config.anchorA ?
            new Box2D.Common.Math.b2Vec2(config.anchorA.x / this.SCALE, config.anchorA.y / this.SCALE) :
            new Box2D.Common.Math.b2Vec2(0, 0);

        jointDef.localAnchorB = config.anchorB ?
            new Box2D.Common.Math.b2Vec2(config.anchorB.x / this.SCALE, config.anchorB.y / this.SCALE) :
            new Box2D.Common.Math.b2Vec2(0, 0);

        jointDef.bodyA = bodyA;
        jointDef.bodyB = bodyB;
        jointDef.maxLength = (config.maxLength || 100) / this.SCALE;
        jointDef.collideConnected = config.collideConnected ?? true;

        return this.world.CreateJoint(jointDef);
    }
    _createPulleyJoint (bodyA, bodyB, config) {
        const jointDef = new Box2D.Dynamics.Joints.b2PulleyJointDef();

        if (!config.groundAnchorA || !config.groundAnchorB) {
            this.engine.warn('Pulley joint requires groundAnchorA and groundAnchorB');
            return null;
        }

        const groundAnchorA = new Box2D.Common.Math.b2Vec2(
            config.groundAnchorA.x / this.SCALE,
            config.groundAnchorA.y / this.SCALE
        );

        const groundAnchorB = new Box2D.Common.Math.b2Vec2(
            config.groundAnchorB.x / this.SCALE,
            config.groundAnchorB.y / this.SCALE
        );

        const anchorA = config.anchorA ?
            new Box2D.Common.Math.b2Vec2(config.anchorA.x / this.SCALE, config.anchorA.y / this.SCALE) :
            bodyA.GetWorldCenter();

        const anchorB = config.anchorB ?
            new Box2D.Common.Math.b2Vec2(config.anchorB.x / this.SCALE, config.anchorB.y / this.SCALE) :
            bodyB.GetWorldCenter();

        const ratio = config.ratio || 1.0;

        jointDef.Initialize(bodyA, bodyB, groundAnchorA, groundAnchorB, anchorA, anchorB, ratio);
        jointDef.collideConnected = config.collideConnected ?? true;

        return this.world.CreateJoint(jointDef);
    }
    _createGearJoint (bodyA, bodyB, config) {
        if (!config.joint1 || !config.joint2) {
            this.engine.warn('Gear joint requires joint1 and joint2');
            return null;
        }

        const jointDef = new Box2D.Dynamics.Joints.b2GearJointDef();

        jointDef.bodyA = bodyA;
        jointDef.bodyB = bodyB;
        jointDef.joint1 = config.joint1;
        jointDef.joint2 = config.joint2;
        jointDef.ratio = config.ratio || 1.0;
        jointDef.collideConnected = config.collideConnected ?? false;

        return this.world.CreateJoint(jointDef);
    }
    _createFrictionJoint (bodyA, bodyB, config) {
        const jointDef = new Box2D.Dynamics.Joints.b2FrictionJointDef();

        const anchor = config.anchor ?
            new Box2D.Common.Math.b2Vec2(config.anchor.x / this.SCALE, config.anchor.y / this.SCALE) :
            bodyA.GetWorldCenter();

        jointDef.Initialize(bodyA, bodyB, anchor);
        jointDef.maxForce = config.maxForce || 1000;
        jointDef.maxTorque = config.maxTorque || 1000;
        jointDef.collideConnected = config.collideConnected ?? false;

        return this.world.CreateJoint(jointDef);
    }
    destroyJoint (jointId) {
        if (!this.joints || !this.joints.has(jointId)) {
            this.engine.warn(`Joint with ID ${jointId} not found`);
            return false;
        }

        const jointData = this.joints.get(jointId);
        const {joint, entityA, entityB, type} = jointData;

        try {
            this.world.DestroyJoint(joint);
            this.joints.delete(jointId);

            // Trigger joint destruction event
            this.engine.trigger('jointDestroyed', {
                jointId,
                entityA,
                entityB,
                type
            });

            return true;
        } catch (error) {
            this.engine.warn('Error destroying joint:', error);
            return false;
        }
    }
    getJoint (jointId) {
        return this.joints ? this.joints.get(jointId) : null;
    }
    getAllJoints () {
        return this.joints ? Array.from(this.joints.entries()) : [];
    }
    updateJointMotor (jointId, speed, torqueOrForce) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return this;

        const {joint, type} = jointData;

        try {
            if (type === 'revolute') {
                joint.SetMotorSpeed(speed * Math.PI / 180); // Convert to radians
                if (torqueOrForce !== undefined) {
                    joint.SetMaxMotorTorque(torqueOrForce);
                }
            } else if (type === 'prismatic') {
                joint.SetMotorSpeed(speed / this.SCALE);
                if (torqueOrForce !== undefined) {
                    joint.SetMaxMotorForce(torqueOrForce);
                }
            } else {
                this.engine.warn(`Motor control not available for ${type} joints`);
            }
        } catch (error) {
            this.engine.warn('Error updating joint motor:', error);
        }

        return this;
    }
    enableJointMotor (jointId, enable = true) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return this;

        const {joint, type} = jointData;

        try {
            if (type === 'revolute' || type === 'prismatic') {
                joint.EnableMotor(enable);
            } else {
                this.engine.warn(`Motor control not available for ${type} joints`);
            }
        } catch (error) {
            this.engine.warn('Error toggling joint motor:', error);
        }

        return this;
    }
    setJointLimits (jointId, lower, upper) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return this;

        const {joint, type} = jointData;

        try {
            if (type === 'revolute') {
                joint.SetLimits(
                    lower * Math.PI / 180, // Convert to radians
                    upper * Math.PI / 180
                );
            } else if (type === 'prismatic') {
                joint.SetLimits(
                    lower / this.SCALE,
                    upper / this.SCALE
                );
            } else {
                this.engine.warn(`Limits not available for ${type} joints`);
            }
        } catch (error) {
            this.engine.warn('Error setting joint limits:', error);
        }

        return this;
    }
    enableJointLimits (jointId, enable = true) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return this;

        const {joint, type} = jointData;

        try {
            if (type === 'revolute' || type === 'prismatic') {
                joint.EnableLimit(enable);
            } else {
                this.engine.warn(`Limits not available for ${type} joints`);
            }
        } catch (error) {
            this.engine.warn('Error toggling joint limits:', error);
        }

        return this;
    }
    getJointReactionForce (jointId, invDt = 60) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return null;

        const {joint} = jointData;

        try {
            const force = joint.GetReactionForce(1 / invDt);
            return {
                x: force.x * this.SCALE,
                y: force.y * this.SCALE,
                magnitude: Math.sqrt(force.x * force.x + force.y * force.y) * this.SCALE
            };
        } catch (error) {
            this.engine.warn('Error getting joint reaction force:', error);
            return null;
        }
    }
    getJointReactionTorque (jointId, invDt = 60) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return null;

        const {joint} = jointData;

        try {
            return joint.GetReactionTorque(1 / invDt);
        } catch (error) {
            this.engine.warn('Error getting joint reaction torque:', error);
            return null;
        }
    }
    getJointAngle (jointId) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return null;

        const {joint, type} = jointData;

        try {
            if (type === 'revolute') {
                return joint.GetJointAngle() * 180 / Math.PI; // Convert to degrees
            } else {
                this.engine.warn(`Angle not available for ${type} joints`);
                return null;
            }
        } catch (error) {
            this.engine.warn('Error getting joint angle:', error);
            return null;
        }
    }
    getJointSpeed (jointId) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return null;

        const {joint, type} = jointData;

        try {
            if (type === 'revolute') {
                return joint.GetJointSpeed() * 180 / Math.PI; // Convert to degrees per second
            } else if (type === 'prismatic') {
                return joint.GetJointSpeed() * this.SCALE; // Convert to pixels per second
            } else {
                this.engine.warn(`Speed not available for ${type} joints`);
                return null;
            }
        } catch (error) {
            this.engine.warn('Error getting joint speed:', error);
            return null;
        }
    }
    getJointTranslation (jointId) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return null;

        const {joint, type} = jointData;

        try {
            if (type === 'prismatic') {
                return joint.GetJointTranslation() * this.SCALE; // Convert to pixels
            } else {
                this.engine.warn(`Translation not available for ${type} joints`);
                return null;
            }
        } catch (error) {
            this.engine.warn('Error getting joint translation:', error);
            return null;
        }
    }
    isJointLimitEnabled (jointId) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return false;

        const {joint, type} = jointData;

        try {
            if (type === 'revolute' || type === 'prismatic') {
                return joint.IsLimitEnabled();
            } else {
                return false;
            }
        } catch (error) {
            this.engine.warn('Error checking joint limit status:', error);
            return false;
        }
    }
    isJointMotorEnabled (jointId) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return false;

        const {joint, type} = jointData;

        try {
            if (type === 'revolute' || type === 'prismatic') {
                return joint.IsMotorEnabled();
            } else {
                return false;
            }
        } catch (error) {
            this.engine.warn('Error checking joint motor status:', error);
            return false;
        }
    }
    createHinge (entityA, entityB, options = {}) {
        return this.joint(entityA, entityB, {
            type: 'revolute',
            anchor: options.anchor,
            motor: options.motor,
            limits: options.limits,
            collideConnected: options.collideConnected ?? false
        });
    }
    createSpring (entityA, entityB, options = {}) {
        return this.joint(entityA, entityB, {
            type: 'distance',
            anchorA: options.anchorA,
            anchorB: options.anchorB,
            length: options.length,
            frequency: options.stiffness ?? 4.0,
            damping: options.damping ?? 0.5,
            collideConnected: options.collideConnected ?? false
        });
    }
    createSlider (entityA, entityB, options = {}) {
        return this.joint(entityA, entityB, {
            type: 'prismatic',
            anchor: options.anchor,
            axis: options.axis || {x: 1, y: 0},
            motor: options.motor,
            limits: options.limits,
            collideConnected: options.collideConnected ?? false
        });
    }
    createChain (entities, options = {}) {
        if (!entities || entities.length < 2) {
            this.engine.warn('Chain requires at least 2 entities');
            return [];
        }

        const joints = [];
        const jointType = options.type || 'revolute';
        const spacing = options.spacing || 0;

        for (let i = 0; i < entities.length - 1; i++) {
            const entityA = entities[i];
            const entityB = entities[i + 1];

            let anchor = null;
            if (spacing === 0) {
                // Default: connect at the edge between entities
                const posA = {
                    x: entityA.absoluteX + entityA.width / 2,
                    y: entityA.absoluteY + entityA.height / 2
                };
                const posB = {
                    x: entityB.absoluteX + entityB.width / 2,
                    y: entityB.absoluteY + entityB.height / 2
                };
                anchor = {
                    x: (posA.x + posB.x) / 2,
                    y: (posA.y + posB.y) / 2
                };
            }

            const jointConfig = {
                type: jointType,
                anchor: anchor,
                collideConnected: options.collideConnected ?? false,
                ...options.jointConfig
            };

            const jointId = this.joint(entityA, entityB, jointConfig);
            if (jointId) {
                joints.push(jointId);
            }
        }

        // Trigger chain creation event
        this.engine.trigger('chainCreated', {
            entities,
            joints,
            options
        });

        return joints;
    }
    createRope (entities, options = {}) {
        return this.createChain(entities, {
            ...options,
            type: 'distance',
            jointConfig: {
                frequency: options.flexibility ?? 2.0,
                damping: options.damping ?? 0.3,
                ...options.jointConfig
            }
        });
    }
    destroyAllJoints () {
        if (!this.joints) return this;

        const jointIds = Array.from(this.joints.keys());
        for (const jointId of jointIds) {
            this.destroyJoint(jointId);
        }

        return this;
    }
    getJointsForEntity (entity) {
        if (!this.joints) return [];

        const entityId = this._getEntityId(entity);
        const entityJoints = [];

        for (const [jointId, jointData] of this.joints) {
            if (jointData.entityA.id === entityId || jointData.entityB.id === entityId) {
                entityJoints.push({jointId, ...jointData});
            }
        }

        return entityJoints;
    }
    breakJointsForEntity (entity) {
        const entityJoints = this.getJointsForEntity(entity);
        const brokenJoints = [];

        for (const joint of entityJoints) {
            if (this.destroyJoint(joint.jointId)) {
                brokenJoints.push(joint.jointId);
            }
        }

        // Trigger break event
        if (brokenJoints.length > 0) {
            this.engine.trigger('jointsBreak', {
                entity,
                brokenJoints
            });
        }

        return brokenJoints;
    }
    monitorJointStress (jointId, maxForce, maxTorque, callback) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return this;

        // Create a monitoring function
        const monitor = () => {
            if (!this.joints || !this.joints.has(jointId)) {
                // Joint was destroyed, stop monitoring
                return;
            }

            const reactionForce = this.getJointReactionForce(jointId);
            const reactionTorque = this.getJointReactionTorque(jointId);

            let stressed = false;
            const stressData = {
                jointId,
                force: reactionForce,
                torque: reactionTorque,
                maxForce,
                maxTorque
            };

            if (reactionForce && maxForce && reactionForce.magnitude > maxForce) {
                stressed = true;
                stressData.forceExceeded = true;
            }

            if (reactionTorque && maxTorque && Math.abs(reactionTorque) > maxTorque) {
                stressed = true;
                stressData.torqueExceeded = true;
            }

            if (stressed && callback) {
                callback(stressData);
            }

            // Continue monitoring
            if (this.engine.running) {
                requestAnimationFrame(monitor);
            }
        };

        // Start monitoring
        requestAnimationFrame(monitor);
        return this;
    }
    debugJoint (jointId, options = {}) {
        const jointData = this.getJoint(jointId);
        if (!jointData) return;

        const {joint, type, entityA, entityB} = jointData;

        const debugInfo = {
            id: jointId,
            type: type,
            entityA: entityA.id,
            entityB: entityB.id,
            angle: this.getJointAngle(jointId),
            speed: this.getJointSpeed(jointId),
            translation: this.getJointTranslation(jointId),
            reactionForce: this.getJointReactionForce(jointId),
            reactionTorque: this.getJointReactionTorque(jointId),
            motorEnabled: this.isJointMotorEnabled(jointId),
            limitEnabled: this.isJointLimitEnabled(jointId)
        };

        if (options.log !== false) {
            console.table(debugInfo);
        }

        return debugInfo;
    }
    /** ======== END JOINT SYSTEM ======== */

    /** ======== DRAG & DROP ======== */
    _setupDragListeners () {
        let hoveredEntity = null;
        let touchStartTime = 0;
        let touchStartPosition = {x: 0, y: 0};
        const CLICK_THRESHOLD = 10;
        const CLICK_TIME_THRESHOLD = 200;
        const MOUSE_IDENTIFIER = 'mouse';

        // Track entities that received start events
        this.mouseDownEntity = null;
        this.touchStartEntities = new Map();

        // Helper function to create event data
        const createEventData = (screenX, screenY, worldPos, identifier = null, target = null, which = null) => {
            const data = {
                x: worldPos.x,
                y: worldPos.y,
                worldX: worldPos.x,
                worldY: worldPos.y,
                screenX: screenX,
                screenY: screenY,
                timestamp: Date.now()
            };

            if (identifier !== null) data.identifier = identifier;
            if (target !== null) data.target = target;
            if (which !== null) data.which = which;

            return data;
        };

        // Mouse Events
        this.engine.on('mousedown', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            const entities = Array.from(this.bodies.entries());
            for (const [entityId, body] of entities) {
                const entity = body.GetUserData();
                if (entity && this._isPointInEntity(x, y, entity)) {
                    // Interactive events
                    if (entity.isInteractive && entity.isInteractive()) {
                        entity.trigger('mousedown', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, entity, e.which));
                        this.mouseDownEntity = entity;
                    }

                    // Drag events
                    if (entity.events.draggable) {
                        this._startDrag(entity, worldPos.x, worldPos.y, MOUSE_IDENTIFIER);
                        entity.trigger('drag', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, entity));
                    }
                    break;
                }
            }
        });
        this.engine.on('mousemove', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            // Interactive mousemove for tracked entity
            if (this.mouseDownEntity && this.mouseDownEntity.isInteractive && this.mouseDownEntity.isInteractive()) {
                this.mouseDownEntity.trigger('mousemove', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, this.mouseDownEntity, e.which));
            } else {
                // Interactive mousemove for current entity under cursor
                const entities = Array.from(this.bodies.entries());
                for (const [entityId, body] of entities) {
                    const entity = body.GetUserData();
                    if (entity && entity.isInteractive && entity.isInteractive() && this._isPointInEntity(x, y, entity)) {
                        entity.trigger('mousemove', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, entity, e.which));
                        break;
                    }
                }
            }

            // Hover handling
            let foundEntity = null;
            const entities = Array.from(this.bodies.entries());
            for (const [entityId, body] of entities) {
                const entity = body.GetUserData();
                if (entity && entity.events.hoverable && this._isPointInEntity(x, y, entity)) {
                    foundEntity = entity;
                    break;
                }
            }

            if (foundEntity !== hoveredEntity) {
                if (hoveredEntity) {
                    hoveredEntity.trigger('hoverOut', createEventData(x, y, worldPos, null, hoveredEntity));
                }
                if (foundEntity) {
                    foundEntity.trigger('hover', createEventData(x, y, worldPos, null, foundEntity));
                }
                hoveredEntity = foundEntity;
            }

            // Drag handling
            if (this.mouseJoints.has(MOUSE_IDENTIFIER)) {
                const dragBodyData = this.draggedBodies.get(MOUSE_IDENTIFIER);
                if (dragBodyData && dragBodyData.entity && dragBodyData.entity.events.draggable) {
                    this._updateDrag(worldPos.x, worldPos.y, MOUSE_IDENTIFIER);
                    dragBodyData.entity.trigger('dragMove', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, dragBodyData.entity, e.which));
                }
            }
        });
        this.engine.on('mouseup', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            // Interactive mouseup for tracked entity
            if (this.mouseDownEntity && this.mouseDownEntity.isInteractive && this.mouseDownEntity.isInteractive()) {
                this.mouseDownEntity.trigger('mouseup', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, this.mouseDownEntity, e.which));
                this.mouseDownEntity = null;
            }

            // Drag handling
            if (this.mouseJoints.has(MOUSE_IDENTIFIER)) {
                const dragBodyData = this.draggedBodies.get(MOUSE_IDENTIFIER);
                if (dragBodyData && dragBodyData.entity) {
                    dragBodyData.entity.trigger('drop', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, dragBodyData.entity, e.which));
                }
                this._endDrag(MOUSE_IDENTIFIER);
            }
        });

        // Mouse wheel events
        this.engine.on('wheel', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            const entities = Array.from(this.bodies.entries());
            for (const [entityId, body] of entities) {
                const entity = body.GetUserData();
                if (entity && entity.isInteractive && entity.isInteractive() && this._isPointInEntity(x, y, entity)) {
                    const eventData = createEventData(x, y, worldPos, null, entity);
                    eventData.deltaX = e.deltaX;
                    eventData.deltaY = e.deltaY;
                    eventData.deltaZ = e.deltaZ;
                    eventData.deltaMode = e.deltaMode;
                    entity.trigger('wheel', eventData);
                    break;
                }
            }
        });

        // Touch Events
        this.engine.on('touchstart', (e) => {
            if (!this.engine.running) return;

            touchStartTime = Date.now();

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            touchStartPosition = {x, y};

            const entities = Array.from(this.bodies.entries())
                .filter(([entityId, _]) => !this.bodyTouchMap.has(entityId));

            for (const [entityId, body] of entities) {
                const entity = body.GetUserData();
                if (entity && this._isPointInEntity(x, y, entity)) {
                    // Interactive events
                    if (entity.isInteractive && entity.isInteractive()) {
                        entity.trigger('touchstart', createEventData(x, y, worldPos, e.identifier, entity));
                        this.touchStartEntities.set(e.identifier, entity);
                    }

                    // Drag events
                    if (entity.events.draggable) {
                        this._startDrag(entity, worldPos.x, worldPos.y, e.identifier);
                        entity.trigger('drag', createEventData(x, y, worldPos, e.identifier, entity));
                    }
                    break;
                }
            }
        });
        this.engine.on('touchmove', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            // Interactive touchmove for tracked entity
            const touchStartEntity = this.touchStartEntities.get(e.identifier);
            if (touchStartEntity && touchStartEntity.isInteractive && touchStartEntity.isInteractive()) {
                touchStartEntity.trigger('touchmove', createEventData(x, y, worldPos, e.identifier, touchStartEntity));
            } else {
                // Interactive touchmove for current entity under touch
                const entities = Array.from(this.bodies.entries());
                for (const [entityId, body] of entities) {
                    const entity = body.GetUserData();
                    if (entity && entity.isInteractive && entity.isInteractive() && this._isPointInEntity(x, y, entity)) {
                        entity.trigger('touchmove', createEventData(x, y, worldPos, e.identifier, entity));
                        break;
                    }
                }
            }

            // Drag handling
            if (this.mouseJoints.has(e.identifier)) {
                const dragBodyData = this.draggedBodies.get(e.identifier);
                if (dragBodyData && dragBodyData.entity) {
                    this._updateDrag(worldPos.x, worldPos.y, e.identifier);
                    dragBodyData.entity.trigger('dragMove', createEventData(x, y, worldPos, e.identifier, dragBodyData.entity));
                }
            }
        });
        this.engine.on('touchend', (e) => {
            if (!this.engine.running) return;

            const currentTime = Date.now();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            // Interactive touchend for tracked entity
            const touchStartEntity = this.touchStartEntities.get(e.identifier);
            if (touchStartEntity && touchStartEntity.isInteractive && touchStartEntity.isInteractive()) {
                touchStartEntity.trigger('touchend', createEventData(x, y, worldPos, e.identifier, touchStartEntity));
                this.touchStartEntities.delete(e.identifier);
            }

            const dx = x - touchStartPosition.x;
            const dy = y - touchStartPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const timeDiff = currentTime - touchStartTime;

            // Click detection
            if (distance < CLICK_THRESHOLD && timeDiff < CLICK_TIME_THRESHOLD) {
                const entities = Array.from(this.bodies.entries());
                for (const [entityId, body] of entities) {
                    const entity = body.GetUserData();
                    if (entity && entity.events.clickable && this._isPointInEntity(x, y, entity)) {
                        entity.trigger('click', createEventData(x, y, worldPos, null, entity));
                        break;
                    }
                }
            }

            // Drag handling
            if (this.mouseJoints.has(e.identifier)) {
                const dragBodyData = this.draggedBodies.get(e.identifier);
                if (dragBodyData && dragBodyData.entity) {
                    dragBodyData.entity.trigger('drop', createEventData(x, y, worldPos, e.identifier, dragBodyData.entity));
                }
                this._endDrag(e.identifier);
            }
        });
        this.engine.on('touchcancel', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            // Clean up tracked entity
            if (this.touchStartEntities.has(e.identifier)) {
                this.touchStartEntities.delete(e.identifier);
            }

            // Drag handling
            if (this.mouseJoints.has(e.identifier)) {
                const dragBodyData = this.draggedBodies.get(e.identifier);
                if (dragBodyData && dragBodyData.entity) {
                    dragBodyData.entity.trigger('drop', createEventData(x, y, worldPos, e.identifier, dragBodyData.entity));
                }
                this._endDrag(e.identifier);
            }
        });

        // Click events (separate from touch/mouse)
        this.engine.on('click', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            const entities = Array.from(this.bodies.entries());
            for (const [entityId, body] of entities) {
                const entity = body.GetUserData();
                if (entity && this._isPointInEntity(x, y, entity)) {
                    if (entity.isInteractive && entity.isInteractive()) {
                        entity.trigger('click', createEventData(x, y, worldPos, null, entity));
                        break;
                    }
                }
            }
        });
        this.engine.on('rightclick', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            const entities = Array.from(this.bodies.entries());
            for (const [entityId, body] of entities) {
                const entity = body.GetUserData();
                if (entity && this._isPointInEntity(x, y, entity)) {
                    if (entity.isInteractive && entity.isInteractive()) {
                        entity.trigger('rightclick', createEventData(x, y, worldPos, null, entity));
                        break;
                    }
                }
            }
        });
    }
    _startDrag (targetEntity, mouseX, mouseY, identifier) {
        const body = this.bodies.get(targetEntity.id);
        if (!body || this.mouseJoints.has(identifier) || this.bodyTouchMap.has(targetEntity.id)) return;

        // Store the original body type
        const originalType = body.GetType();

        // Temporarily change to dynamic body for dragging
        if (originalType !== Box2D.Dynamics.b2Body.b2_dynamicBody) {
            body.SetType(Box2D.Dynamics.b2Body.b2_dynamicBody);
        }

        const mouseWorldPoint = new Box2D.Common.Math.b2Vec2(
            mouseX / this.SCALE,
            mouseY / this.SCALE
        );

        const jointDef = new Box2D.Dynamics.Joints.b2MouseJointDef();
        const groundBody = this.world.CreateBody(new Box2D.Dynamics.b2BodyDef());

        jointDef.bodyA = groundBody;
        jointDef.bodyB = body;
        jointDef.target.Set(mouseWorldPoint.x, mouseWorldPoint.y);
        jointDef.maxForce = 1000 * body.GetMass();
        jointDef.collideConnected = true;
        jointDef.dampingRatio = 0.5;
        jointDef.frequencyHz = 5.0;

        const mouseJoint = this.world.CreateJoint(jointDef);

        this.mouseJoints.set(identifier, mouseJoint);
        this.draggedBodies.set(identifier, {
            body: body,
            entity: targetEntity,
            originalType: originalType // Store the original type
        });
        this.bodyTouchMap.set(targetEntity.id, identifier);

        const {angularDamping, linearDamping, fixedRotation} = this.config.drag;
        body.SetAngularDamping(angularDamping);
        body.SetLinearDamping(linearDamping);
        body.SetFixedRotation(fixedRotation);

        // Stop moving
        targetEntity.halt();

        if (typeof targetEntity.trigger === 'function') {
            targetEntity.trigger('drag', {
                x: mouseX,
                y: mouseY,
                identifier
            });
        }
    }
    _updateDrag (mouseX, mouseY, identifier) {
        const mouseJoint = this.mouseJoints.get(identifier);
        const dragBodyData = this.draggedBodies.get(identifier);
        if (!mouseJoint || !dragBodyData) return;

        const mouseWorldPoint = new Box2D.Common.Math.b2Vec2(
            mouseX / this.SCALE,
            mouseY / this.SCALE
        );

        mouseJoint.SetTarget(mouseWorldPoint);

        const {body, entity} = dragBodyData;
        if (typeof entity.trigger === 'function') {
            entity.trigger('dragMove', {
                x: mouseX,
                y: mouseY,
                identifier
            });
        }
    }
    _endDrag (identifier) {
        const mouseJoint = this.mouseJoints.get(identifier);
        const dragBodyData = this.draggedBodies.get(identifier);

        if (!mouseJoint || !dragBodyData) return;

        const {body, entity, originalType} = dragBodyData;
        const {angularDamping, linearDamping} = this.config.drag;

        body.SetFixedRotation(false);
        body.SetAngularDamping(angularDamping);
        body.SetLinearDamping(linearDamping);

        // If it was originally kinematic, reset velocities before changing type
        if (originalType === Box2D.Dynamics.b2Body.b2_kinematicBody) {
            body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
            body.SetAngularVelocity(0);
        }

        // Restore the original body type
        if (originalType !== Box2D.Dynamics.b2Body.b2_dynamicBody) {
            body.SetType(originalType);
        }

        if (typeof entity.trigger === 'function') {
            const position = body.GetPosition();
            entity.trigger('drop', {
                x: position.x * this.SCALE,
                y: position.y * this.SCALE,
                identifier
            });
        }

        this.world.DestroyJoint(mouseJoint);
        this.mouseJoints.delete(identifier);
        this.draggedBodies.delete(identifier);
        this.bodyTouchMap.delete(entity.id);
    }
    _isPointInEntity (x, y, entity) {
        const body = this.bodies.get(entity.id);
        if (!body) return false;

        // Converting screen coordinates to global coordinates using camera
        const worldPos = entity.engine.camera.screenToWorld(x, y);
        const worldPoint = new Box2D.Common.Math.b2Vec2(
            worldPos.x / this.SCALE,
            worldPos.y / this.SCALE
        );

        // Check for each fixture
        let fixture = body.GetFixtureList();
        while (fixture) {
            if (fixture.TestPoint(worldPoint)) {
                return true;
            }
            fixture = fixture.GetNext();
        }
        return false;
    }
    /** ======== END DRAG & DROP ======== */

    /** ======== RESET ======== */
    reset () {
        try {
            // Clear all drag operations
            for (const [identifier, mouseJoint] of this.mouseJoints) {
                this.world.DestroyJoint(mouseJoint);
            }
            this.mouseJoints.clear();
            this.draggedBodies.clear();
            this.bodyTouchMap.clear();

            // Clear interactive tracking
            this.mouseDownEntity = null;
            if (this.touchStartEntities) {
                this.touchStartEntities.clear();
            }

            for (const [entityId, body] of this.bodies) {
                // Stop moving
                pixalo.find(entityId).halt();

                // Destroy body
                this.world.DestroyBody(body);
            }

            // Clear internal maps
            this.bodies.clear();
            this.velocities.clear();
            this.materials.clear();
            this.activeContacts.clear();

            if (this.joints) {
                for (const [jointId, jointData] of this.joints) {
                    try {
                        this.world.DestroyJoint(jointData.joint);
                    } catch (error) {
                        // Joint might already be destroyed
                    }
                }
                this.joints.clear();
            }

            // Recreate world with original settings
            this.world = new Box2D.Dynamics.b2World(
                new Box2D.Common.Math.b2Vec2(
                    this.originalConfig.gravity.x / this.SCALE,
                    this.originalConfig.gravity.y / this.SCALE
                ),
                this.originalConfig.sleep
            );

            // Reset config to original values
            this.config = {
                friction: this.originalConfig.friction,
                restitution: this.originalConfig.restitution,
                density: this.originalConfig.density,
                maxVelocity: this.originalConfig.maxVelocity,
                velocityIterations: this.originalConfig.velocityIterations,
                positionIterations: this.originalConfig.positionIterations
            };

            // Reset scale values
            this.BASE_SCALE = this.originalConfig.scale;
            this.quality = this.originalConfig.quality;
            this.SCALE = this.BASE_SCALE * this.quality;

            // Reset mouse world position
            this.mouseWorld.Set(0, 0);

            // Recreate contact listener
            this._setupContactListener();

            // Reset interactive tracking variables
            this.mouseDownEntity = null;
            this.touchStartEntities = new Map();

            // Trigger reset event
            if (this.engine && typeof this.engine.trigger === 'function') {
                this.engine.trigger('physicsReset', {
                    timestamp: Date.now(),
                    config: this.originalConfig
                });
            }

            return this;
        } catch (error) {
            if (this.engine && typeof this.engine.error === 'function') {
                this.engine.error('Error during physics reset:', error);
            }
            return false;
        }
    }
    /** ======== END ======== */

}

export {Physics as default, Box2D};