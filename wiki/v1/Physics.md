The Physics class provides comprehensive 2D physics simulation using Box2D engine. It handles physics bodies, collision detection, drag & drop interactions, materials, and various physics forces. The class integrates seamlessly with the Pixalo game engine to provide realistic physics behavior for game entities.

> [!WARNING]
When Physics is enabled, you cannot use the features of the [Collision class](https://github.com/pixalo/pixalo/wiki/Collision), and all [Collision class](https://github.com/pixalo/pixalo/wiki/Collision) commands in the Pixalo engine are disabled. This is because the Physics class exclusively handles all collision calculations and sends the results to you.

## Configuration Object

```javascript
const config = {
  // Gravity
  gravity: {
    x: 0,                       // Horizontal gravity force
    y: 9.8                      // Vertical gravity force (positive = downward)
  },
  
  // World Settings
  sleep: true,                  // Allow bodies to sleep when inactive
  
  // Default Material Properties
  friction: 0.2,                // Default friction coefficient (0-1)
  bounce: 0.2,                  // Default restitution/bounce (0-1)
  density: 1,                   // Default density
  
  // Simulation Settings
  maxVelocity: 1000,            // Maximum velocity limit
  velocityIterations: 8,        // Velocity solver iterations per step
  positionIterations: 3         // Position solver iterations per step
}
```

## Public Methods

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
- `collision`: Object with `categoryBits`, `maskBits`, `groupIndex`

**Usage Example:**
```javascript
const body = game.physics.addEntity(myEntity, {
  bodyType: 'dynamic',
  density: 2,
  friction: 0.5,
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

### `moveEntity(entity, position, relative, duration, easing): boolean`
Moves an entity to a specific position in the physics world.  
When `duration` is supplied the motion becomes an interpolated animation instead of an instantaneous teleport.

| Name     | Type               | Default  | Description                                                                    |
|----------|--------------------|----------|--------------------------------------------------------------------------------|
| entity   | Object \| string   | –        | Entity instance or its ID.                                                     |
| position | Object             | –        | Target point `{ x, y }` in world pixels.                                       |
| relative | boolean            | false    | `true` → treat `position` as an offset from the current location.              |
| duration | number             | 0        | Animation length in ms. `0` = instant move.                                    |
| easing   | string \| function | 'linear' | Easing curve name (lookup in `engine.Ease`) or custom `(t)=> Number` function. |

**Returns:**  
`boolean` – `true` when the body was found and the move started; `false` otherwise.

**Usage Examples:**
```javascript
// Instant teleport
game.physics.moveEntity(player, { x: 100, y: 200 });

// Smooth 1-second slide to the right
game.physics.moveEntity(player, { x: 300, y: 0 }, false, 1000, 'easeOutQuad');

// Move 50 px up relative to current spot, custom easing
game.physics.moveEntity(player, { x: 0, y: -50 }, true, 600, Pixalo.Ease.linear);
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

### `applyForce(entity, force): Physics`
Applies a force to an entity's center of mass.

| Name   | Type           | Default |
|--------|----------------|---------|
| entity | Object\|string | -       |
| force  | Object         | -       |

**Usage Example:**
```javascript
game.physics.applyForce(myEntity, { x: 100, y: -50 });
```

### `setVelocity(entity, velocity): Physics`
Sets the linear velocity of an entity.

| Name     | Type           | Default |
|----------|----------------|---------|
| entity   | Object\|string | -       |
| velocity | Object         | -       |

**Usage Example:**
```javascript
game.physics.setVelocity(myEntity, { x: 5, y: -10 });
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

| Name     | Type           | Default | Description                                                 |
|----------|----------------|---------|-------------------------------------------------------------|
| entity   | Object\|string | —       | The entity (or its id) whose body will be updated.          |
| x        | number         | —       | New world **x** coordinate (top-left corner).               |
| y        | number         | —       | New world **y** coordinate (top-left corner).               |
| rotation | number         | —       | New angle in **degrees** (0 = right, positive = clockwise). |

**Usage Example:**
```javascript
// teleport entity to (100, 200) facing 45°
game.physics.setTransform(myEntity, { x: 100, y: 200, rotation: 45 });
```

### `setGravity(x, y): Physics`
Updates the world’s gravity vector and nudges every non-static body so they wake up and react immediately.

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
game.physics.applyImpulse(myEntity, { x: 5, y: -3 });
game.physics.applyImpulse(myEntity, { x: 5, y: -3 }, { x: 10, y: 20 });
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

**Usage Example:**
```javascript
game.physics.setBodyProperties(myEntity, {
  friction: 0.8,
  restitution: 0.9,
  density: 2.5
});
```

### `reset(): Physics`
Completely clears the physics world and returns it to its original state.
All bodies, joints, drag, and velocities are lost; the world is recreated with the original default gravity, scale, quality, and materials.
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

## Events

### Global Events

**`collisions`** - Triggered on `game.on('collisions')` when collision starts
- `entityA`: First entity in collision
- `entityB`: Second entity in collision
- `contact`: Box2D contact object
- `contactPoints`: Array of collision points
- `normal`: Collision normal vector
- `relativeVelocity`: Relative velocity between entities
- `type`: 'start'
- `impactForce`: Magnitude of collision impact
- `angle`: Collision angle in degrees

**`collisionEnd`** - Triggered on `game.on('collisionEnd')` when collision ends
- `entityA`: First entity in collision
- `entityB`: Second entity in collision
- `contact`: Box2D contact object

**`physicsReset`** – Triggered on `game.on('physicsReset')` finishes rebuilding the world.
- `timestamp` *(Number)* – Milliseconds since epoch when the reset occurred.  
- `config` *(Object)* – The original physics configuration object that was reapplied (gravity, scale, quality, material defaults, iterations, etc.).

### Entity Events

**`collide`** - Triggered on `entity.on('collide')` when collision starts
- `target`: The other entity in collision
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
- `identifier`: Drag identifier (e.g., 'mouse' or touch ID)
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

**`hover`** - Triggered on `entity.on('hover')` when mouse enters entity (requires `hoverable: true`)
- `x`: World X coordinate
- `y`: World Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `target`: The hovered entity
- `timestamp`: Event timestamp

**`hoverOut`** - Triggered on `entity.on('hoverOut')` when mouse leaves entity
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