/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */
import Box2D from './dependencies/Box2D.esm.min.js';

class Physics {

    constructor (engine, config = {}) {
        if (!engine.physicsEnabled)
            return;

        this.engine = engine;
        this.canvas = engine.canvas;
        this.BASE_SCALE = config.scale || 30;
        this.quality = config.quality || 1;
        this.SCALE = this.BASE_SCALE * this.quality;

        this.world = new Box2D.Dynamics.b2World(
            new Box2D.Common.Math.b2Vec2(
                config.gravity?.x / this.SCALE || 0,
                config.gravity?.y / this.SCALE || 9.8
            ),
            config.sleep || true // allow sleep
        );

        this.config = {
            friction: config.friction || 0.2,
            restitution: config.bounce || 0.2,
            density: config.density || 1,
            maxVelocity: config.maxVelocity || 1000,
            velocityIterations: config.velocityIterations || 8,
            positionIterations: config.positionIterations || 3,
            ...config
        };

        this.bodies = new Map();
        this.velocities = new Map();
        this.materials = new Map();

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
    _setupContactListener () {
        const listener = new Box2D.Dynamics.b2ContactListener();

        listener.BeginContact = contact => {
            const entityA = contact.GetFixtureA().GetBody().GetUserData();
            const entityB = contact.GetFixtureB().GetBody().GetUserData();

            // Receive detailed collision information
            const worldManifold = new Box2D.Collision.b2WorldManifold();
            contact.GetWorldManifold(worldManifold);

            // Converting impact points from meters to pixels
            const contactPoints = worldManifold.m_points.map(point => ({
                x: point.x * this.SCALE,
                y: point.y * this.SCALE
            }));

            // Calculating the direction and intensity of the collision
            const normal = {
                x: worldManifold.m_normal.x,
                y: worldManifold.m_normal.y
            };

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
                contact,
                contactPoints,
                normal,
                relativeVelocity,
                type: 'start',
                // Calculating the severity of the collision
                impactForce: Math.sqrt(
                    relativeVelocity.x * relativeVelocity.x +
                    relativeVelocity.y * relativeVelocity.y
                ),
                // Angle of contact
                angle: Math.atan2(normal.y, normal.x) * 180 / Math.PI
            };

            // emit to physics
            this.engine.trigger('collisions', collisionData);

            // emit to the entities themselves
            if (entityA && typeof entityA.trigger === 'function') {
                entityA.trigger('collide', {
                    ...collisionData,
                    target: entityB
                });
            }

            if (entityB && typeof entityB.trigger === 'function') {
                entityB.trigger('collide', {
                    ...collisionData,
                    target: entityA,
                    // Reverse the direction for the second entity
                    normal: {x: -normal.x, y: -normal.y},
                    relativeVelocity: {x: -relativeVelocity.x, y: -relativeVelocity.y}
                });
            }
        };

        listener.EndContact = contact => {
            const entityA = contact.GetFixtureA().GetBody().GetUserData();
            const entityB = contact.GetFixtureB().GetBody().GetUserData();

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
    /** ======== END SETUP COLLISION ======== */

    /** ======== ENTITIES ======== */
    addEntity (entity, config = {}) {
        const bodyDef = new Box2D.Dynamics.b2BodyDef();

        // Set body type
        switch (config.bodyType) {
            case 'static':
                bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
                break;
            case 'kinematic':
                bodyDef.type = Box2D.Dynamics.b2Body.b2_kinematicBody;
                break;
            default:
                bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        }

        // Setting the initial position
        bodyDef.position.x = (entity.absoluteX + entity.width / 2) / this.SCALE;
        bodyDef.position.y = (entity.absoluteY + entity.height / 2) / this.SCALE;
        bodyDef.angle = entity.styles.rotation * Math.PI / 180;

        // Create a body
        const body = this.world.CreateBody(bodyDef);
        const shape = this._createShape(entity);

        // Enhanced fixture definition
        const fixtureDef = new Box2D.Dynamics.b2FixtureDef();
        fixtureDef.shape = shape;

        // Material handling
        if (config.material && this.materials.has(config.material)) {
            const material = this.materials.get(config.material);
            fixtureDef.density = material.density;
            fixtureDef.friction = material.friction;
            fixtureDef.restitution = material.restitution;
        } else {
            fixtureDef.density = config.density || this.config.density;
            fixtureDef.friction = config.friction || this.config.friction;
            fixtureDef.restitution = config.restitution || this.config.restitution;
        }

        // Collision filtering
        if (config.collision) {
            fixtureDef.filter.categoryBits = config.collision.categoryBits || 0x0001;
            fixtureDef.filter.maskBits = config.collision.maskBits || 0xFFFF;
            fixtureDef.filter.groupIndex = config.collision.groupIndex || 0;
        }

        body.CreateFixture(fixtureDef);

        // Save body and velocity
        this.bodies.set(entity.id, body);
        this.velocities.set(entity.id, {x: 0, y: 0});

        // Adding a reference to an entity
        body.SetUserData(entity);

        return body;
    }
    removeEntity (entity) {
        const body = this.bodies.get(entity.id);
        if (body) {
            this.world.DestroyBody(body);
            this.bodies.delete(entity.id);
            this.velocities.delete(entity.id);
        }
        return this;
    }
    moveEntity (entity, position, relative = false) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
        const body = this.bodies.get(entity);
        if (!body) return false;

        try {
            // If relative movement is needed
            if (relative) {
                const currentPos = body.GetPosition();
                position = {
                    x: (currentPos.x * this.SCALE + position.x),
                    y: (currentPos.y * this.SCALE + position.y)
                };
            }

            // Convert coordinates from pixels to meters (Box2D scale)
            const newPosition = new Box2D.Common.Math.b2Vec2(
                position.x / this.SCALE,
                position.y / this.SCALE
            );

            // If the body is static, it needs to be converted to kinematic first
            const wasStatic = body.GetType() === Box2D.Dynamics.b2Body.b2_staticBody;
            if (wasStatic) {
                body.SetType(Box2D.Dynamics.b2Body.b2_kinematicBody);
            }

            // Perform the movement
            body.SetPosition(newPosition);

            // Return to static state if it was static before
            if (wasStatic) {
                body.SetType(Box2D.Dynamics.b2Body.b2_staticBody);
            }

            // Update entity to synchronize with new position
            if (entity.style) {
                entity.style({
                    x: position.x - entity.width / 2,
                    y: position.y - entity.height / 2
                });
            }

            // To ensure changes are applied
            body.SetAwake(true);

            return true;
        } catch (error) {
            this.engine.error('Error moving entity:', error);
            return false;
        }
    }
    /** ======== END ENTITIES ======== */

    /** ======== SHAPES ======== */
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
        shape.SetAsBox(
            (entity.width / 2) / this.SCALE,
            (entity.height / 2) / this.SCALE
        );
        return shape;
    }
    /** ======== END SHAPES ======== */

    /** ======== MATERIAL ======== */
    createMaterial (name, properties) {
        this.materials.set(name, {
            friction: properties.friction ?? this.config.friction,
            restitution: properties.restitution ?? this.config.restitution,
            density: properties.density ?? this.config.density
        });
        return this;
    }
    getMaterial (name) {
        return this.materials.get(name);
    }
    /** ======== END MATERIAL ======== */

    /** ======== APPLY METHODS ======== */
    applyForce (entity, force) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
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
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
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
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
        const body = this.bodies.get(entity);
        if (body) {
            body.SetLinearVelocity({
                x: Math.min(Math.max(body.GetLinearVelocity().x, -limit), limit),
                y: Math.min(Math.max(body.GetLinearVelocity().y, -limit), limit)
            });
        }
        return this;
    }
    setGravity (x, y) {
        this.world.SetGravity(new Box2D.Common.Math.b2Vec2(x / this.SCALE, y / this.SCALE));

        for (const [entityId, body] of this.bodies) {
            if (body.GetType() !== Box2D.Dynamics.b2Body.b2_staticBody) {
                this.applyImpulse(body.GetUserData(), {x: 0.0001, y: 0.0001});
            }
        }

        return this;
    }
    getBodyVelocity (entity) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
        return this.velocities.get(entity);
    }
    setAngularVelocity (entity, omega) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
        const body = this.bodies.get(entity);
        if (body) {
            body.SetAngularVelocity(omega);
        }
        return this;
    }
    applyTorque (entity, torque) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
        const body = this.bodies.get(entity);
        if (body) {
            body.ApplyTorque(torque);
        }
        return this;
    }
    applyImpulse (entity, impulse, point = null) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
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
    isBodyAwake (entity) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
        const body = this.bodies.get(entity);
        return body ? body.IsAwake() : false;
    }
    setBodyAwake (entity, awake) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
        const body = this.bodies.get(entity);
        if (body) body.SetAwake(awake);
        return this;
    }
    setBodyProperties (entity, properties) {
        entity = this.engine.isEntity(entity) ? entity?.id : entity;
        const body = this.bodies.get(entity);
        if (body) {
            const fixture = body.GetFixtureList();
            if (fixture) {
                if (properties.friction !== undefined) fixture.SetFriction(properties.friction);
                if (properties.restitution !== undefined) fixture.SetRestitution(properties.restitution);
                if (properties.density !== undefined) {
                    fixture.SetDensity(properties.density);
                    body.ResetMassData();
                }
            }
        }
        return this;
    }
    /** ======== END BODY CONTROL ======== */

    /** ======== DRAG & DROP ======== */
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

        body.SetAngularDamping(0.1);
        body.SetLinearDamping(0.1);
        body.SetFixedRotation(true);

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

        body.SetFixedRotation(false);
        body.SetAngularDamping(0.1);
        body.SetLinearDamping(0.1);

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
    _setupDragListeners () {
        let hoveredEntity = null;
        let touchStartTime = 0;
        let touchStartPosition = {x: 0, y: 0};
        const CLICK_THRESHOLD = 10;
        const CLICK_TIME_THRESHOLD = 200;
        const MOUSE_IDENTIFIER = 'mouse';

        // Helper function to create event data
        const createEventData = (screenX, screenY, worldPos, identifier = null, target = null) => {
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
                if (entity && entity.events.draggable && this._isPointInEntity(x, y, entity)) {
                    this._startDrag(entity, worldPos.x, worldPos.y, MOUSE_IDENTIFIER);
                    entity.trigger('drag', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, entity));
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
                    dragBodyData.entity.trigger('dragMove', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, dragBodyData.entity));
                }
            }
        });
        this.engine.on('mouseup', (e) => {
            if (!this.engine.running) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.screenX - rect.left;
            const y = e.screenY - rect.top;
            const worldPos = {x: e.worldX, y: e.worldY};

            if (this.mouseJoints.has(MOUSE_IDENTIFIER)) {
                const dragBodyData = this.draggedBodies.get(MOUSE_IDENTIFIER);
                if (dragBodyData && dragBodyData.entity) {
                    dragBodyData.entity.trigger('drop', createEventData(x, y, worldPos, MOUSE_IDENTIFIER, dragBodyData.entity));
                }
                this._endDrag(MOUSE_IDENTIFIER);
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
                if (entity && entity.events.draggable && this._isPointInEntity(x, y, entity)) {
                    this._startDrag(entity, worldPos.x, worldPos.y, e.identifier);
                    entity.trigger('drag', createEventData(x, y, worldPos, e.identifier, entity));
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

            const dx = x - touchStartPosition.x;
            const dy = y - touchStartPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const timeDiff = currentTime - touchStartTime;

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

            if (this.mouseJoints.has(e.identifier)) {
                const dragBodyData = this.draggedBodies.get(e.identifier);
                if (dragBodyData && dragBodyData.entity) {
                    dragBodyData.entity.trigger('drop', createEventData(x, y, worldPos, e.identifier, dragBodyData.entity));
                }
                this._endDrag(e.identifier);
            }
        });
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

}

export default Physics;