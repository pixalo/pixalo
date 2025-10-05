# Physics Class Documentation

The Physics class provides comprehensive 2D physics simulation using Box2D engine. It handles physics bodies, collision
detection, drag & drop interactions, materials, and various physics forces. The class integrates seamlessly with the
Pixalo game engine to provide realistic physics behavior for game entities.

> [!WARNING]
> When Physics is enabled, you cannot use the features of
> the [Collision class](https://github.com/pixalo/pixalo/tree/main/wiki/v1/Collision.md), and
> all [Collision class](https://github.com/pixalo/pixalo/tree/main/wiki/v1/Collision.md) commands in the Pixalo engine are disabled. This
> is because the Physics class exclusively handles all collision calculations and sends the results to you.

## Configuration Object

```javascript
const config = {
    // Scaling and Quality
    scale: 30,                    // Base scale for physics world (pixels per meter)
    quality: 1,                   // Quality multiplier for precision

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

## Public Methods

### `update(deltaTime): void`

Updates the physics simulation by one step. Called automatically by the game loop.

> [!NOTE]
> This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do
> customization elsewhere.

| Name      | Type   | Default |
|-----------|--------|---------|
| deltaTime | number | -       |

**Usage Example:**

```javascript
game.physics.update(16.67); // 60 FPS
```

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
> This function is automatically called when you add an entity to your game world, so you don't need to call it
> manually—unless you want to use it for customization purposes.

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
- `collision`: Object with `categoryBits`, `maskBits`, `groupIndex`

**Usage Example:**

```javascript
const body = game.physics.addEntity(myEntity, {
    bodyType: 'dynamic',
    density: 2,
    friction: 0.5,
    sensor: false,
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

### `updateShape(entity): Physics`

Updates the physics shape of an entity based on its current properties.

| Name   | Type   | Default |
|--------|--------|---------|
| entity | Object | -       |

**Usage Example:**

```javascript
game.physics.updateShape(myEntity);
```

### `createMaterial(name, properties): Physics`

Creates a named material with specific physics properties.

| Name       | Type   | Default |
|------------|--------|---------|
| name       | string | -       |
| properties | Object | -       |

**Properties Object:**

- `friction`: number
- `restitution`: number
- `density`: number

**Usage Example:**

```javascript
game.physics.createMaterial('ice', {
    friction: 0.1,
    restitution: 0.2,
    density: 0.5
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

### `reset(): Physics`

Completely clears the physics world and returns it to its original state.
All bodies, joints, drag, and velocities are lost; the world is recreated with the original default gravity, scale,
quality, and materials.
An engine-level `physicsReset` event is fired on success.

| Name   | –    |
|--------|------|
| Params | none |

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
> Polygon points should be defined relative to the entity's center and in counter-clockwise order for proper collision
> detection.

## Collision Detection

### Collision Sides

The physics system automatically determines which sides of entities are involved in collisions:

- `'top'`, `'bottom'`, `'left'`, `'right'` for normal collisions
- For sensor bodies, collision sides are calculated based on entity positions

### Collision Filtering

Control which entities can collide with each other using bit masks:

```javascript
game.physics.addEntity(myEntity, {
    collision: {
        categoryBits: 0x0001,    // What category this body belongs to
        maskBits: 0xFFFF,        // What categories this body can collide with
        groupIndex: 0            // Collision group (negative = never collide, positive = always collide)
    }
});
```

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
        clickable: true     // Enable click/tap events
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

**`click`** - Triggered on `entity.on('click')` on touch/click (requires `clickable: true`)

- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `target`: The clicked entity
- `timestamp`: Event timestamp

## Best Practices

### Performance Optimization

- Use `sleep: true` to allow inactive bodies to sleep
- Set appropriate `velocityIterations` and `positionIterations` based on your needs
- Use static bodies for immovable objects like walls and platforms
- Limit the number of active dynamic bodies in complex scenes

### Collision Optimization

- Use collision filtering to reduce unnecessary collision checks
- Consider using sensor bodies for trigger zones instead of full collision detection
- Group similar entities using `groupIndex` for better performance

### Scale and Quality

- Choose an appropriate `scale` value (30 is recommended for most games)
- Increase `quality` for higher precision but expect performance impact
- Keep entity sizes reasonable relative to your scale (avoid very small or very large entities)

### Material Management

```javascript
// Create reusable materials for common surface types
game.physics.createMaterial('bouncy', {
    friction: 0.1,
    restitution: 0.9,
    density: 0.5
});

game.physics.createMaterial('sticky', {
    friction: 1.0,
    restitution: 0.1,
    density: 1.5
});

// Apply materials to entities
game.physics.addEntity(ball, {material: 'bouncy'});
game.physics.addEntity(platform, {material: 'sticky'});
```

### Error Handling

The Physics class includes built-in error handling and will gracefully fallback to simpler shapes if complex polygons
fail to create. Monitor console warnings for potential issues with polygon definitions.

## Advanced Features

### Body Type Management

The Physics class provides dynamic body type switching for advanced gameplay mechanics:

```javascript
// Switch a dynamic platform to static when player stands on it
player.on('collide', (data) => {
    if (data.target === platform && data.side === 'bottom') {
        game.physics.setBodyType(platform, 'static');
    }
});

// Make a static wall kinematic for moving platforms
game.physics.setBodyType(movingWall, 'kinematic');
game.physics.setVelocity(movingWall, {x: 2, y: 0});
```

### Sensor Bodies

Create trigger zones and detection areas using sensor bodies:

```javascript
const triggerZone = game.append({
    x: 100, y: 100,
    width: 50, height: 50,
    shape: 'rectangle',
    fill : 'transparent'
});

game.physics.addEntity(triggerZone, {
    bodyType: 'static',
    sensor: true  // No physical collision, but detects overlaps
});

triggerZone.on('collide', (data) => {
    console.log('Player entered trigger zone!');
});
```

### Force and Impulse Systems

#### Continuous Forces

Use `applyForce()` for continuous effects like wind, magnetism, or thrusters:

```javascript
// Wind effect pushing entities to the right
game.timer(() => {
    entities.forEach(entity => {
        if (game.physics.hasEntity(entity)) {
            game.physics.applyForce(entity, {x: 10, y: 0});
        }
    });
}, 16); // Apply every frame
```

#### Instant Impulses

Use `applyImpulse()` for immediate velocity changes like jumps or explosions:

```javascript
// Jump mechanics
game.on('keydown', (e) => {
    if (e.key === 'Space') {
        game.physics.applyImpulse(player, {x: 0, y: -15});
    }
});

// Explosion effect
function explode (center, radius, force) {
    entities.forEach(entity => {
        const dx = entity.x - center.x;
        const dy = entity.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            const impulse = force * (1 - distance / radius);

            game.physics.applyImpulse(entity, {
                x: normalizedX * impulse,
                y: normalizedY * impulse
            });
        }
    });
}
```

### Advanced Movement Patterns

#### Smooth Entity Animation

```javascript
// Move entity with easing and callbacks
game.physics.moveEntity({
    entity: player,
    x: 300,
    y: 200,
    duration: 2000,
    easing: 'easeInOutQuad',
    onUpdate: (entity, progress) => {
        // Change opacity during movement
        entity.style({alpha: 0.5 + (progress * 0.5)});
    },
    onComplete: (entity) => {
        console.log('Movement complete!');
        entity.style({alpha: 1});
    }
});
```

### Material System Advanced Usage

#### Dynamic Material Switching

```javascript
// Create multiple surface materials
game.physics.createMaterial('ice', {
    friction: 0.05,
    restitution: 0.1,
    density: 0.9
});

game.physics.createMaterial('rubber', {
    friction: 0.8,
    restitution: 0.95,
    density: 0.7
});

game.physics.createMaterial('metal', {
    friction: 0.3,
    restitution: 0.2,
    density: 2.0
});

// Switch materials based on game state
function changeEnvironment (materialName) {
    platforms.forEach(platform => {
        const material = game.physics.getMaterial(materialName);
        game.physics.setBodyProperties(platform, material);
    });
}
```

### Collision Groups and Filtering

#### Advanced Collision Filtering

```javascript
// Define collision categories
const CATEGORY = {
    PLAYER: 0x0001,
    ENEMY: 0x0002,
    PROJECTILE: 0x0004,
    WALL: 0x0008,
    PICKUP: 0x0010
};

// Player setup - collides with enemies, walls, and pickups but not projectiles
game.physics.addEntity(player, {
    collision: {
        categoryBits: CATEGORY.PLAYER,
        maskBits: CATEGORY.ENEMY | CATEGORY.WALL | CATEGORY.PICKUP
    }
});

// Enemy projectile - collides only with player and walls
game.physics.addEntity(bullet, {
    collision: {
        categoryBits: CATEGORY.PROJECTILE,
        maskBits: CATEGORY.PLAYER | CATEGORY.WALL
    }
});

// Pickup item - sensor that only detects player
game.physics.addEntity(coin, {
    sensor: true,
    collision: {
        categoryBits: CATEGORY.PICKUP,
        maskBits: CATEGORY.PLAYER
    }
});
```

### Multi-Touch and Complex Interactions

#### Advanced Drag Handling

```javascript
// Track multiple simultaneous drags
const activeDrags = new Map();

entity.on('drag', (data) => {
    activeDrags.set(data.identifier, {
        entity: data.target,
        startPos: {x: data.x, y: data.y},
        startTime: data.timestamp
    });
});

entity.on('drop', (data) => {
    const dragData = activeDrags.get(data.identifier);
    if (dragData) {
        const duration = data.timestamp - dragData.startTime;
        const distance = Math.sqrt(
            Math.pow(data.x - dragData.startPos.x, 2) +
            Math.pow(data.y - dragData.startPos.y, 2)
        );

        // Apply throw velocity based on drag speed
        if (duration < 300 && distance > 20) {
            const velocityX = (data.x - dragData.startPos.x) / duration * 10;
            const velocityY = (data.y - dragData.startPos.y) / duration * 10;
            game.physics.setVelocity(data.target, {x: velocityX, y: velocityY});
        }
    }

    activeDrags.delete(data.identifier);
});
```

### Performance Monitoring and Optimization

#### Physics Performance Tracking

```javascript
class PhysicsProfiler {
    constructor (physics) {
        this.physics = physics;
        this.metrics = {
            bodyCount: 0,
            activeBodyCount: 0,
            collisionCount: 0,
            updateTime: 0
        };
    }

    update () {
        const startTime = performance.now();

        // Count bodies
        this.metrics.bodyCount = this.physics.bodies.size;
        this.metrics.activeBodyCount = 0;

        for (const [id, body] of this.physics.bodies) {
            if (body.IsAwake()) {
                this.metrics.activeBodyCount++;
            }
        }

        this.metrics.updateTime = performance.now() - startTime;
    }

    getReport () {
        return {
            ...this.metrics,
            memoryUsage: this.physics.bodies.size + this.physics.velocities.size + this.physics.materials.size
        };
    }
}

// Usage
const profiler = new PhysicsProfiler(game.physics);
setInterval(() => {
    profiler.update();
    console.log(profiler.getReport());
}, 1000);
```

### Custom Physics Behaviors

#### Gravity Wells

```javascript
function createGravityWell (center, radius, strength) {
    return {
        update () {
            for (const [entityId, body] of game.physics.bodies) {
                const entity = body.GetUserData();
                if (!entity) continue;

                const dx = center.x - entity.x;
                const dy = center.y - entity.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius && distance > 0) {
                    const force = strength / (distance * distance);
                    const normalizedX = dx / distance;
                    const normalizedY = dy / distance;

                    game.physics.applyForce(entity, {
                        x: normalizedX * force,
                        y: normalizedY * force
                    });
                }
            }
        }
    };
}

// Create and use gravity well
const blackHole = createGravityWell({x: 400, y: 300}, 200, 50000);
game.on('update', () => blackHole.update());
```

#### Magnetic Fields

```javascript
function createMagneticField (entities, strength = 100) {
    entities.forEach((entityA, indexA) => {
        entities.forEach((entityB, indexB) => {
            if (indexA >= indexB) return;

            const dx = entityB.x - entityA.x;
            const dy = entityB.y - entityA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const force = strength / distance;
                const normalizedX = dx / distance;
                const normalizedY = dy / distance;

                // Attract or repel based on entity properties
                const multiplier = (entityA.magnetic === entityB.magnetic) ? -1 : 1;

                game.physics.applyForce(entityA, {
                    x: normalizedX * force * multiplier,
                    y: normalizedY * force * multiplier
                });

                game.physics.applyForce(entityB, {
                    x: -normalizedX * force * multiplier,
                    y: -normalizedY * force * multiplier
                });
            }
        });
    });
}
```

## Troubleshooting

### Common Issues and Solutions

#### Bodies Not Moving

```javascript
// Check if body is awake
if (!game.physics.isBodyAwake(entity)) {
    game.physics.setBodyAwake(entity, true);
}

// Check body type
const bodyType = game.physics.getBodyType(entity);
if (bodyType === 'static') {
    game.physics.setBodyType(entity, 'dynamic');
}
```