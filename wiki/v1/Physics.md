The Physics class provides comprehensive 2D physics simulation using Box2D engine. It handles physics bodies, collision detection, drag & drop interactions, materials, joints, and various physics forces. The class integrates seamlessly with the Pixalo game engine to provide realistic physics behavior for game entities.

> [!WARNING]
> When Physics is enabled, you cannot use the features of the [Collision class](https://github.com/pixalo/pixalo/tree/main/wiki/v1/Collision.md), and all [Collision class](https://github.com/pixalo/pixalo/tree/main/wiki/v1/Collision.md) commands in the Pixalo engine are disabled. This is because the Physics class exclusively handles all collision calculations and sends the results to you.

## Configuration Object

```javascript
const config = {
    // Scaling and Quality
    scale: 30,                    // Base scale for physics world (pixels per meter)
    quality: 1,                   // Quality multiplier for precision, Pixalo engine automatically adjusts quality

    // Gravity
    gravity: {
        x: 0,                     // Horizontal gravity force
        y: 9.8                    // Vertical gravity force (positive = downward)
    },
    // or
    gravity: false,               // Disable gravity completely

    // World Settings
    sleep: true,                  // Allow bodies to sleep when inactive

    // Default Material Properties
    friction: 0.2,                // Default friction coefficient (0-1)
    bounce: 0.2,                  // Default restitution/bounce (0-1)
    density: 1,                   // Default density

    // Simulation Settings
    maxVelocity: 1000,            // Maximum velocity limit
    velocityIterations: 8,        // Velocity solver iterations per step
    positionIterations: 3,        // Position solver iterations per step

    // Drag interaction settings
    drag: {
        angularDamping: 1,        // Angular resistance while dragging (0 = free spin, 10+ ≈ locked)
        linearDamping: 0.1,      // Linear resistance while dragging (0 = no friction, 1+ = sticky)
        fixedRotation: false     // true = prevent rotation during drag, false = allow natural spin
    }
}
```

## Entity Management

### `hasEntity(entity): boolean`

Checks if an entity exists in the physics world.

| Name   | Type   | Default |
|--------|--------|---------|
| entity | Object | -       |

**Usage Example:**

```javascript
const exists = game.physics.hasEntity(myEntity);
```

### `addEntity(entity, config): b2Body`

Adds an entity to the physics world and creates a physics body for it.

> [!NOTE]
> This function is automatically called when you add an entity to your game world, so you don't need to call it manually—unless you want to use it for customization purposes.

| Name   | Type   | Default |
|--------|--------|---------|
| entity | Object | -       |
| config | Object | {}      |

**Config Object:**

- `bodyType`: 'dynamic' | 'static' | 'kinematic'
- `material`: string (material name)
- `density`: number
- `friction`: number
- `restitution`: number
- `sensor`: boolean (creates sensor body)
- `fixedRotation`: boolean (prevents rotation)
- `angularDamping`: number (angular resistance)
- `linearDamping`: number (linear resistance)
- `gravityScale`: number (0 = weightless, negative = anti-gravity)
- `bullet`: boolean (continuous collision detection for fast-moving objects)
- `sleeping`: boolean (allow body to sleep when inactive)
- `collision`: Object with `categoryBits`, `maskBits`, `groupIndex`

**Usage Example:**

```javascript
const body = game.physics.addEntity(myEntity, {
    bodyType: 'dynamic',
    density: 2,
    friction: 0.5,
    sensor: false,
    gravityScale: 1.5,
    bullet: true,
    collision: {
        categoryBits: 0x0001,
        maskBits: 0xFFFF
    }
});
```

### `removeEntity(entity): Physics`

Removes an entity from the physics world.

| Name   | Type   | Default |
|--------|--------|---------|
| entity | Object | -       |

**Usage Example:**

```javascript
game.physics.removeEntity(myEntity);
```

### `moveEntity(options, y, duration, easing): Physics`

Moves an entity to a specific position in the physics world with optional animation.

| Name     | Type               | Default  | Description                                |
|----------|--------------------|----------|--------------------------------------------|
| options  | Object \| number   | –        | Config object or X coordinate              |
| y        | number             | 0        | Y coordinate (when first param is number)  |
| duration | number             | 0        | Animation length in ms. `0` = instant move |
| easing   | string \| function | 'linear' | Easing curve name or custom function       |

**Options Object:**

- `entity`: Object (required) - The entity to move
- `x`: number - Target X coordinate
- `y`: number - Target Y coordinate
- `duration`: number - Animation duration in ms
- `easing`: string | function - Easing function
- `relative`: boolean - Whether coordinates are relative to current position
- `onUpdate`: function - Callback during animation
- `onComplete`: function - Callback when animation completes

**Usage Examples:**

```javascript
// Instant teleport
game.physics.moveEntity({
    entity: player,
    x: 100,
    y: 200
});

// Smooth 1-second slide with callback
game.physics.moveEntity({
    entity: player,
    x: 300,
    y: 0,
    duration: 1000,
    easing: 'easeOutQuad',
    onComplete: (entity) => console.log('Move complete!')
});

// Relative movement
game.physics.moveEntity({
    entity: player,
    x: 50,
    y: -30,
    relative: true,
    duration: 500
});
```

## Shape Management

### `updateShape(entity): Physics`

Updates the physics shape of an entity based on its current properties.

| Name   | Type   | Default |
|--------|--------|---------|
| entity | Object | -       |

**Usage Example:**

```javascript
game.physics.updateShape(myEntity);
```

## Material System

### `createMaterial(name, properties): Physics`

Creates a named material with specific physics properties.

| Name       | Type   | Default |
|------------|--------|---------|
| name       | string | -       |
| properties | Object | -       |

**Properties Object:**

- `bodyType`: 'dynamic' | 'static' | 'kinematic' - Body type
- `density`: number - Mass per unit area
- `friction`: number - Surface friction coefficient (0-1)
- `restitution`: number - Bounce coefficient (0-1)
- `linearDamping`: number - Linear velocity damping
- `angularDamping`: number - Angular velocity damping
- `fixedRotation`: boolean - Prevent rotation
- `gravityScale`: number - Gravity multiplier (0 = weightless, negative = anti-gravity)
- `bullet`: boolean - Continuous collision detection
- `sleeping`: boolean - Allow sleeping when inactive
- `categoryBits`: number - Collision category
- `maskBits`: number - Collision mask
- `groupIndex`: number - Collision group

**Usage Example:**

```javascript
game.physics.createMaterial('ice', {
    bodyType: 'dynamic',
    friction: 0.05,
    restitution: 0.1,
    density: 0.9,
    linearDamping: 0.05,
    angularDamping: 0.5,
    gravityScale: 0.8,
    categoryBits: 0x0002,
    maskBits: 0xFFFF
});
```

### `getMaterial(name): Object`

Retrieves a material by name.

| Name | Type   | Default |
|------|--------|---------|
| name | string | -       |

**Usage Example:**

```javascript
const iceMaterial = game.physics.getMaterial('ice');
```

## Collision Detection

### `isTouching(entityA, entityB): boolean`

Checks if two entities are currently colliding.

| Name    | Type   | Default |
|---------|--------|---------|
| entityA | Object | -       |
| entityB | Object | -       |

**Usage Example:**

```javascript
const touching = game.physics.isTouching(player, platform);
```

## Force and Motion

### `setGravity(x, y): Physics`

Updates the world's gravity vector and nudges every non-static body so they wake up and react immediately.

| Name | Type            | Default | Description                                                                              |
|------|-----------------|---------|------------------------------------------------------------------------------------------|
| x    | number \| false | –       | Horizontal gravity (m/s²).  Pass `false` as shorthand for zero-gravity (`x = 0, y = 0`). |
| y    | number          | 0       | Vertical gravity (m/s²).                                                                 |

**Usage Examples:**

```javascript
// Standard Earth gravity
game.physics.setGravity(0, 9.8);

// Moon gravity
game.physics.setGravity(0, 1.6);

// Disable gravity
game.physics.setGravity(false);
```

### `applyForce(entity, force): Physics`

Applies a force to an entity's center of mass.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |
| force  | Object         | -       |

**Usage Example:**

```javascript
game.physics.applyForce(myEntity, {x: 100, y: -50});
```

### `setVelocity(entity, velocity): Physics`

Sets the linear velocity of an entity.

| Name     | Type           | Default |
|----------|----------------|---------|
| entity   | Object\|string | -       |
| velocity | Object         | -       |

**Usage Example:**

```javascript
game.physics.setVelocity(myEntity, {x: 5, y: -10});
```

### `setVelocityLimit(entity, limit): Physics`

Limits the velocity of an entity to a maximum value.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |
| limit  | number         | -       |

**Usage Example:**

```javascript
game.physics.setVelocityLimit(myEntity, 20);
```

### `setTransform(entity, {x, y, rotation}): Physics`

Instantly moves and/or rotates a physics body to the specified transform.

| Name     | Type   | Default | Description                                                |
|----------|--------|---------|------------------------------------------------------------|
| entity   | Object | —       | The entity whose body will be updated                      |
| x        | number | —       | New world **x** coordinate (top-left corner)               |
| y        | number | —       | New world **y** coordinate (top-left corner)               |
| rotation | number | —       | New angle in **degrees** (0 = right, positive = clockwise) |

**Usage Example:**

```javascript
// teleport entity to (100, 200) facing 45°
game.physics.setTransform(myEntity, {x: 100, y: 200, rotation: 45});
```

### `setAngularVelocity(entity, omega): Physics`

Sets the angular velocity (rotation speed) of an entity.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |
| omega  | number         | -       |

**Usage Example:**

```javascript
game.physics.setAngularVelocity(myEntity, 0.5); // Rotate clockwise
```

### `applyTorque(entity, torque): Physics`

Applies rotational force to an entity.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |
| torque | number         | -       |

**Usage Example:**

```javascript
game.physics.applyTorque(myEntity, 10);
```

### `applyImpulse(entity, impulse, point): Physics`

Applies an instantaneous impulse to an entity.

| Name    | Type           | Default |
|---------|----------------|---------|
| entity  | Object\|string | -       |
| impulse | Object         | -       |
| point   | Object         | null    |

**Usage Example:**

```javascript
game.physics.applyImpulse(myEntity, {x: 5, y: -3});
game.physics.applyImpulse(myEntity, {x: 5, y: -3}, {x: 10, y: 20});
```

## Body Control

### `setBodyType(entity, type): Physics`

Changes the body type of an entity.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |
| type   | string         | -       |

**Type Options:** 'static', 'kinematic', 'dynamic'

**Usage Example:**

```javascript
game.physics.setBodyType(myEntity, 'static');
```

### `getBodyType(entity): string`

Gets the current body type of an entity.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |

**Usage Example:**

```javascript
const type = game.physics.getBodyType(myEntity); // 'dynamic', 'static', or 'kinematic'
```

### `isBodyAwake(entity): boolean`

Checks if a physics body is awake (active).

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |

**Usage Example:**

```javascript
const isAwake = game.physics.isBodyAwake(myEntity);
```

### `setBodyAwake(entity, awake): Physics`

Sets the awake state of a physics body.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |
| awake  | boolean        | -       |

**Usage Example:**

```javascript
game.physics.setBodyAwake(myEntity, true);
```

### `setBodyProperties(entity, properties): Physics`

Updates the physics properties of an entity's body.

| Name       | Type           | Default |
|------------|----------------|---------|
| entity     | Object\|string | -       |
| properties | Object         | -       |

**Properties Object:**

- `friction`: number
- `restitution`: number
- `density`: number
- `fixedRotation`: boolean

**Usage Example:**

```javascript
game.physics.setBodyProperties(myEntity, {
    friction: 0.8,
    restitution: 0.9,
    density: 2.5,
    fixedRotation: true
});
```

### `haltBody(entity): Physics`

Immediately stops all movement of a physics body.

| Name   | Type   | Default |
|--------|--------|---------|
| entity | Object | -       |

**Usage Example:**

```javascript
game.physics.haltBody(myEntity);
```

### `brakeBody(entity, dampingFactor, minSpeed): Physics`

Gradually slows down a physics body using damping.

| Name          | Type   | Default |
|---------------|--------|---------|
| entity        | Object | -       |
| dampingFactor | number | 0.9     |
| minSpeed      | number | 0.05    |

**Usage Example:**

```javascript
game.physics.brakeBody(myEntity, 0.95, 0.1);
```

### Sensor Control

### `toggleSensor(entity, turnOn): Physics`

Toggles sensor mode for an entity.

| Name   | Type    | Default |
|--------|---------|---------|
| entity | Object  | -       |
| turnOn | boolean | true    |

**Usage Example:**

```javascript
game.physics.toggleSensor(myEntity, true); // Enable sensor
```

### `enableSensor(entity): Physics`

Enables sensor mode for an entity (no physical collision, but detects overlaps).

| Name   | Type   | Default |
|--------|--------|---------|
| entity | Object | -       |

**Usage Example:**

```javascript
game.physics.enableSensor(myEntity);
```

### `disableSensor(entity): Physics`

Disables sensor mode for an entity (restores physical collision).

| Name   | Type   | Default |
|--------|--------|---------|
| entity | Object | -       |

**Usage Example:**

```javascript
game.physics.disableSensor(myEntity);
```

## Information Retrieval

### `getBodyVelocity(entity): Object`

Returns the current velocity of an entity.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |

**Usage Example:**

```javascript
const velocity = game.physics.getBodyVelocity(myEntity);
console.log(velocity.x, velocity.y);
```

### `getBodySpeed(entity): number`

Returns the current speed (magnitude of velocity) of an entity.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |

**Usage Example:**

```javascript
const speed = game.physics.getBodySpeed(myEntity);
```

## Joint System

### `joint(entityA, entityB, config): string`

Creates a joint between two entities and returns a unique joint ID.

| Name    | Type   | Default |
|---------|--------|---------|
| entityA | Object | -       |
| entityB | Object | -       |
| config  | Object | {}      |

**Config Object:**

- `type`: string - Joint type ('revolute', 'distance', 'prismatic', 'weld', 'rope', 'pulley', 'gear', 'friction')
- `anchor`: Object {x, y} - Anchor point for joint
- `anchorA`: Object {x, y} - Anchor point on entity A
- `anchorB`: Object {x, y} - Anchor point on entity B
- `collideConnected`: boolean - Whether connected bodies can collide
- `motor`: Object - Motor settings (speed, torque/force)
- `limits`: Object - Joint limits (lower, upper)
- Additional type-specific properties

**Usage Example:**

```javascript
const jointId = game.physics.joint(boxA, boxB, {
    type: 'revolute',
    anchor: {x: 100, y: 100},
    motor: {speed: 45, torque: 1000},
    limits: {lower: -90, upper: 90},
    collideConnected: false
});
```

### `getJoint(jointId): Object`

Retrieves joint data by ID.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |

**Usage Example:**

```javascript
const jointData = game.physics.getJoint(jointId);
```

### `getAllJoints(): Array`

Returns an array of all joints with their IDs and data.

**Usage Example:**

```javascript
const allJoints = game.physics.getAllJoints();
```

### Joint Control Methods

### `updateJointMotor(jointId, speed, torqueOrForce): Physics`

Updates the motor settings of a joint.

| Name          | Type   | Default |
|---------------|--------|---------|
| jointId       | string | -       |
| speed         | number | -       |
| torqueOrForce | number | -       |

**Usage Example:**

```javascript
game.physics.updateJointMotor(jointId, 90, 2000);
```

### `enableJointMotor(jointId, enable): Physics`

Enables or disables a joint's motor.

| Name    | Type    | Default |
|---------|---------|---------|
| jointId | string  | -       |
| enable  | boolean | true    |

**Usage Example:**

```javascript
game.physics.enableJointMotor(jointId, true);
```

### `setJointLimits(jointId, lower, upper): Physics`

Sets the limits for a joint.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |
| lower   | number | -       |
| upper   | number | -       |

**Usage Example:**

```javascript
game.physics.setJointLimits(jointId, -45, 45);
```

### `enableJointLimits(jointId, enable): Physics`

Enables or disables joint limits.

| Name    | Type    | Default |
|---------|---------|---------|
| jointId | string  | -       |
| enable  | boolean | true    |

**Usage Example:**

```javascript
game.physics.enableJointLimits(jointId, true);
```

### Joint Information Methods

### `getJointReactionForce(jointId, invDt): Object`

Gets the reaction force of a joint.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |
| invDt   | number | 60      |

**Usage Example:**

```javascript
const force = game.physics.getJointReactionForce(jointId);
console.log(force.x, force.y, force.magnitude);
```

### `getJointReactionTorque(jointId, invDt): number`

Gets the reaction torque of a joint.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |
| invDt   | number | 60      |

**Usage Example:**

```javascript
const torque = game.physics.getJointReactionTorque(jointId);
```

### `getJointAngle(jointId): number`

Gets the current angle of a revolute joint in degrees.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |

**Usage Example:**

```javascript
const angle = game.physics.getJointAngle(jointId);
```

### `getJointSpeed(jointId): number`

Gets the current speed of a joint.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |

**Usage Example:**

```javascript
const speed = game.physics.getJointSpeed(jointId);
```

### `getJointTranslation(jointId): number`

Gets the current translation of a prismatic joint in pixels.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |

**Usage Example:**

```javascript
const translation = game.physics.getJointTranslation(jointId);
```

### `isJointLimitEnabled(jointId): boolean`

Checks if joint limits are enabled.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |

**Usage Example:**

```javascript
const hasLimits = game.physics.isJointLimitEnabled(jointId);
```

### `isJointMotorEnabled(jointId): boolean`

Checks if joint motor is enabled.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |

**Usage Example:**

```javascript
const hasMotor = game.physics.isJointMotorEnabled(jointId);
```

### Joint Helper Methods

### `createHinge(entityA, entityB, options): string`

Creates a revolute joint (hinge) between two entities.

| Name    | Type   | Default |
|---------|--------|---------|
| entityA | Object | -       |
| entityB | Object | -       |
| options | Object | {}      |

**Usage Example:**

```javascript
const hingeId = game.physics.createHinge(door, wall, {
    anchor: {x: 50, y: 100},
    limits: {lower: -90, upper: 0}
});
```

### `createSpring(entityA, entityB, options): string`

Creates a distance joint (spring) between two entities.

| Name    | Type   | Default |
|---------|--------|---------|
| entityA | Object | -       |
| entityB | Object | -       |
| options | Object | {}      |

**Options:**
- `anchorA`: Object {x, y} - Anchor point on entity A
- `anchorB`: Object {x, y} - Anchor point on entity B
- `length`: number - Rest length of spring
- `stiffness`: number - Spring stiffness (frequency)
- `damping`: number - Spring damping ratio
- `collideConnected`: boolean

**Usage Example:**

```javascript
const springId = game.physics.createSpring(weight, ceiling, {
    length: 100,
    stiffness: 8.0,
    damping: 0.3
});
```

### `createSlider(entityA, entityB, options): string`

Creates a prismatic joint (slider) between two entities.

| Name    | Type   | Default |
|---------|--------|---------|
| entityA | Object | -       |
| entityB | Object | -       |
| options | Object | {}      |

**Options:**
- `anchor`: Object {x, y} - Anchor point
- `axis`: Object {x, y} - Slide direction (default: {x: 1, y: 0})
- `motor`: Object - Motor settings
- `limits`: Object - Translation limits
- `collideConnected`: boolean

**Usage Example:**

```javascript
const sliderId = game.physics.createSlider(piston, cylinder, {
    axis: {x: 0, y: 1}, // Vertical sliding
    limits: {lower: -50, upper: 50},
    motor: {speed: 10, force: 1000}
});
```

### `createChain(entities, options): Array`

Creates a chain of joints connecting multiple entities.

| Name     | Type  | Default |
|----------|-------|---------|
| entities | Array | -       |
| options  | Object| {}      |

**Options:**
- `type`: string - Joint type for chain links
- `spacing`: number - Distance between connection points
- `jointConfig`: Object - Additional joint configuration
- `collideConnected`: boolean

**Usage Example:**

```javascript
const chainJoints = game.physics.createChain([link1, link2, link3, link4], {
    type: 'revolute',
    spacing: 0,
    collideConnected: false
});
```

### `createRope(entities, options): Array`

Creates a rope using distance joints between multiple entities.

| Name     | Type   | Default |
|----------|--------|---------|
| entities | Array  | -       |
| options  | Object | {}      |

**Options:**
- `flexibility`: number - Rope flexibility (frequency)
- `damping`: number - Rope damping
- `spacing`: number - Distance between segments
- `jointConfig`: Object - Additional joint configuration

**Usage Example:**

```javascript
const ropeJoints = game.physics.createRope([segment1, segment2, segment3], {
    flexibility: 2.0,
    damping: 0.3,
    spacing: 20
});
```

### Joint Management

### `destroyJoint(jointId): boolean`

Destroys a joint by its ID.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |

**Usage Example:**

```javascript
game.physics.destroyJoint(jointId);
```

### `destroyAllJoints(): Physics`

Destroys all joints in the physics world.

**Usage Example:**

```javascript
game.physics.destroyAllJoints();
```

### `monitorJointStress(jointId, maxForce, maxTorque, callback): Physics`

Monitors joint stress and calls callback when limits are exceeded.

| Name      | Type     | Default |
|-----------|----------|---------|
| jointId   | string   | -       |
| maxForce  | number   | -       |
| maxTorque | number   | -       |
| callback  | function | -       |

**Usage Example:**

```javascript
game.physics.monitorJointStress(jointId, 1000, 500, (stressData) => {
    if (stressData.forceExceeded) {
        console.log('Joint under too much force!');
        game.physics.destroyJoint(jointId);
    }
});
```

### `debugJoint(jointId, options): Object`

Returns detailed debugging information about a joint.

| Name    | Type   | Default |
|---------|--------|---------|
| jointId | string | -       |
| options | Object | {}      |

**Options:**
- `log`: boolean - Whether to console.log the information (default: true)

**Usage Example:**

```javascript
const debugInfo = game.physics.debugJoint(jointId);
```

## System Management

### `update(deltaTime): void`

Updates the physics simulation by one step. Called automatically by the game loop.

> [!NOTE]
> This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do customization elsewhere.

| Name      | Type   | Default |
|-----------|--------|---------|
| deltaTime | number | -       |

**Usage Example:**

```javascript
game.physics.update(16.67); // 60 FPS
```

### `reset(): Physics`

Completely clears the physics world and returns it to its original state. All bodies, joints, drag, and velocities are lost; the world is recreated with the original default gravity, scale, quality, and materials. An engine-level `physicsReset` event is fired on success.

**Returns:**  
`PhysicsInstance` – Self for chaining on success.  
`false` – If an exception occurred during teardown/rebuild.

**Side Effects:**

- Every entity that owns a physics body is automatically halted (`entity.halt()`).
- All active mouse-joints are destroyed.
- Internal caches (`bodies`, `velocities`, `materials`, `mouseJoints`, `draggedBodies`, `bodyTouchMap`) are cleared.
- World scale & quality are reset to the values stored in `originalConfig`.
- A fresh `b2World` and contact listener are created.

**Usage Example:**

```javascript
// wipe everything and start physics from scratch
game.physics.reset();
```

## Shape Support

The Physics class supports various entity shapes with automatic collision detection:

### Supported Shapes

- **Rectangle** - Default shape for all entities
- **Circle** - Circular collision boundary
- **Triangle** - Three-sided polygon
- **Star** - Multi-pointed star shape (simplified to 8-point polygon for stability)
- **Polygon** - Custom polygon defined by collision points

### Custom Polygon Setup

For custom polygons, define collision points in your entity:

```javascript
const myEntity = game.append({
    shape: 'polygon',
    collision: {
        points: [
            { x: -20, y: -15 },  // Top-left
            { x:  20, y: -15 },   // Top-right
            { x:  25, y:  15 },    // Bottom-right
            { x: -25, y:  15 }    // Bottom-left
        ]
    }
});
```

> [!NOTE]
> Polygon points should be defined relative to the entity's center and in counter-clockwise order for proper collision detection.

## Collision Detection

### Collision Sides

The physics system automatically determines which sides of entities are involved in collisions:

- `'top'`, `'bottom'`, `'left'`, `'right'` for normal collisions
- For sensor bodies, collision sides are calculated based on entity positions


## Drag & Drop System

The Physics class includes a comprehensive drag & drop system that works with both mouse and touch inputs:

### Entity Interaction Setup

Enable drag & drop interactions on entities:

```javascript
const draggableEntity = game.append({
    // ... entity properties
    events: {
        draggable: true,    // Enable drag & drop
        hoverable: true,    // Enable hover events
        clickable: true,    // Enable click/tap events
        interactive: true   // Enable mouse/touch events
    }
});
```

### Drag Behavior

- **Dynamic Bodies**: Can be dragged freely
- **Static Bodies**: Temporarily converted to kinematic during drag
- **Kinematic Bodies**: Maintain their type during drag
- **Multi-touch Support**: Each touch point can drag a different entity simultaneously

### Drag Configuration

Control drag behavior through the config object:

```javascript
const config = {
    drag: {
        angularDamping: 2.0,    // Higher = less spinning during drag
        linearDamping: 0.2,     // Higher = more resistance to movement
        fixedRotation: true     // Prevent rotation during drag
    }
};
```

## Events

### Global Events

**`collisions`** - Triggered on `game.on('collisions')` when collision starts

- `entityA`: First entity in collision
- `entityB`: Second entity in collision
- `sideA`: Collision side for entity A ('top', 'bottom', 'left', 'right')
- `sideB`: Collision side for entity B
- `contact`: Box2D contact object
- `contactPoints`: Array of collision points in world coordinates
- `normal`: Collision normal vector
- `relativeVelocity`: Relative velocity between entities
- `type`: 'start'
- `impactForce`: Magnitude of collision impact
- `angle`: Collision angle in degrees

**`collisionEnd`** - Triggered on `game.on('collisionEnd')` when collision ends

- `entityA`: First entity in collision
- `entityB`: Second entity in collision
- `contact`: Box2D contact object

**`physicsReset`** – Triggered on `game.on('physicsReset')` when reset finishes rebuilding the world

- `timestamp` *(Number)* – Milliseconds since epoch when the reset occurred
- `config` *(Object)* – The original physics configuration object that was reapplied

**`jointCreated`** - Triggered on `game.on('jointCreated')` when a joint is created

- `jointId`: Unique identifier for the joint
- `entityA`: First entity in joint
- `entityB`: Second entity in joint
- `type`: Joint type
- `joint`: Box2D joint object

**`jointDestroyed`** - Triggered on `game.on('jointDestroyed')` when a joint is destroyed

- `jointId`: Joint identifier
- `entityA`: First entity in joint
- `entityB`: Second entity in joint
- `type`: Joint type

**`chainCreated`** - Triggered on `game.on('chainCreated')` when a chain is created

- `entities`: Array of entities in chain
- `joints`: Array of joint IDs created
- `options`: Chain configuration options

**`jointsBreak`** - Triggered on `game.on('jointsBreak')` when joints are broken for an entity

- `entity`: Entity whose joints were broken
- `brokenJoints`: Array of broken joint IDs

### Entity Events

**`collide`** - Triggered on `entity.on('collide')` when collision starts

- `target`: The other entity in collision
- `side`: Collision side for this entity ('top', 'bottom', 'left', 'right')
- `contact`: Box2D contact object
- `contactPoints`: Array of collision points
- `normal`: Collision normal vector (relative to this entity)
- `relativeVelocity`: Relative velocity (relative to this entity)
- `type`: 'start'
- `impactForce`: Magnitude of collision impact
- `angle`: Collision angle in degrees

**`collideEnd`** - Triggered on `entity.on('collideEnd')` when collision ends

- `target`: The other entity in collision
- `contact`: Box2D contact object
- `type`: 'end'

**`drag`** - Triggered on `entity.on('drag')` when drag starts

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Drag identifier ('mouse' or touch ID number)
- `target`: The dragged entity
- `timestamp`: Event timestamp

**`dragMove`** - Triggered on `entity.on('dragMove')` during drag movement

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Drag identifier
- `target`: The dragged entity
- `timestamp`: Event timestamp
- `which`: Mouse button (for mouse events only)

**`drop`** - Triggered on `entity.on('drop')` when drag ends

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Drag identifier
- `target`: The dropped entity
- `timestamp`: Event timestamp
- `which`: Mouse button (for mouse events only)

**`hover`** - Triggered on `entity.on('hover')` when mouse/touch enters entity (requires `hoverable: true`)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `target`: The hovered entity
- `timestamp`: Event timestamp

**`hoverOut`** - Triggered on `entity.on('hoverOut')` when mouse/touch leaves entity

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `target`: The entity being left
- `timestamp`: Event timestamp

**`mousedown`** - Triggered on `entity.on('mousedown')` when mouse button is pressed on entity (requires `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Always 'mouse'
- `target`: The clicked entity
- `which`: Mouse button number
- `timestamp`: Event timestamp

**`mouseup`** - Triggered on `entity.on('mouseup')` when mouse button is released on entity (requires `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Always 'mouse'
- `target`: The clicked entity
- `which`: Mouse button number
- `timestamp`: Event timestamp

**`mousemove`** - Triggered on `entity.on('mousemove')` when mouse moves over entity (requires `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Always 'mouse'
- `target`: The entity under mouse
- `which`: Mouse button number
- `timestamp`: Event timestamp

**`touchstart`** - Triggered on `entity.on('touchstart')` when touch begins on entity (requires `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Touch ID number
- `target`: The touched entity
- `timestamp`: Event timestamp

**`touchend`** - Triggered on `entity.on('touchend')` when touch ends on entity (requires `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Touch ID number
- `target`: The touched entity
- `timestamp`: Event timestamp

**`touchmove`** - Triggered on `entity.on('touchmove')` when touch moves over entity (requires `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `identifier`: Touch ID number
- `target`: The entity under touch
- `timestamp`: Event timestamp

**`click`** - Triggered on `entity.on('click')` when entity is clicked/tapped (requires `clickable: true` or `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `target`: The clicked entity
- `timestamp`: Event timestamp

**`rightclick`** - Triggered on `entity.on('rightclick')` when entity is right-clicked (requires `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `target`: The right-clicked entity
- `timestamp`: Event timestamp

**`wheel`** - Triggered on `entity.on('wheel')` when mouse wheel is used over entity (requires `isInteractive()` to return true)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `target`: The entity under mouse
- `deltaX`: Horizontal scroll amount
- `deltaY`: Vertical scroll amount
- `deltaZ`: Z-axis scroll amount
- `deltaMode`: Delta mode indicator
- `timestamp`: Event timestamp

## Best Practices

### Performance Optimization

- Use `sleep: true` to allow inactive bodies to sleep
- Set appropriate `velocityIterations` and `positionIterations` based on your needs
- Use static bodies for immovable objects like walls and platforms
- Limit the number of active dynamic bodies in complex scenes
- Destroy unused joints to free up memory
- Use sensor bodies instead of full collision detection for trigger zones

### Collision Optimization

- Use collision filtering to reduce unnecessary collision checks
- Consider using sensor bodies for trigger zones instead of full collision detection
- Group similar entities using `groupIndex` for better performance
- Avoid creating too many small bodies in close proximity

### Scale

- Choose an appropriate `scale` value (30 is recommended for most games)
- Keep entity sizes reasonable relative to your scale (avoid very small or very large entities)
- Test different scale values to find the optimal balance for your game

### Joint Management

- Destroy joints when they're no longer needed
- Monitor joint stress to prevent unrealistic forces
- Use appropriate joint types for different mechanical behaviors
- Limit the number of joints per entity for better performance

### Drag & Drop Optimization

- Use `fixedRotation: true` in drag config for UI elements
- Adjust `linearDamping` and `angularDamping` for different drag feels
- Implement velocity-based throwing for natural drag-and-throw mechanics
- Consider performance impact of many draggable entities

### Error Handling

The Physics class includes built-in error handling and will gracefully fallback to simpler shapes if complex polygons fail to create. Monitor console warnings for potential issues with:

- Invalid polygon definitions
- Joint creation failures
- Body type transitions
- Memory leaks from undestroyed joints