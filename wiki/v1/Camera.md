The Camera class is a comprehensive 2D camera system for the Pixalo game engine that provides advanced viewport
management, smooth animations, and cinematic effects. It handles camera movement, zooming, rotation, entity following,
bounds management, and screen-shake effects.

## Configuration

### Default Configuration

```javascript
const game = new Pixalo('#game', {
    // ...
    camera: {
        x: 0,                  // Initial X position in world coordinates
        y: 0,                  // Initial Y position in world coordinates
        zoom: 1,               // Initial zoom level (1 = normal, 2 = 2x zoom, 0.5 = zoomed out)
        bounds: null|{         // Camera movement boundaries (null = no bounds)
            x: number,         // Left boundary
            y: number,         // Top boundary
            width: number,     // Width of allowed area
            height: number     // Height of allowed area
        },
        minZoom: 0.1,          // Minimum allowed zoom level
        maxZoom: 5,            // Maximum allowed zoom level
        smoothing: true,       // Enable smooth camera movement interpolation
        smoothSpeed: 0.1,      // Speed of smooth interpolation (0-1, where 1 = instant)
        rotation: 0,           // Initial rotation angle in degrees
        viewPadding: 100       // Default padding for inView() method - extends visibility area beyond camera bounds
    }
});
```

## Movement Methods

### moveTo(x, y, instant, duration, easing): Camera

Moves the camera to a specific position with optional animation.

| Name     | Type             | Default          |
|----------|------------------|------------------|
| x        | number           | -                |
| y        | number           | 0                |
| instant  | boolean          | false            |
| duration | number           | 500              |
| easing   | string\|function | 'easeInOutCubic' |

**Usage Example:**

```javascript
// Move camera to position (100, 200) instantly
game.camera.moveTo(100, 200, true);

// Move camera with animation
game.camera.moveTo(300, 400, false, 1000, 'easeInOutQuad');
```

### moveBy(dx, dy, instant, duration, easing): Camera

Moves the camera by a relative offset from its current position.

| Name     | Type             | Default          |
|----------|------------------|------------------|
| dx       | number           | -                |
| dy       | number           | 0                |
| instant  | boolean          | false            |
| duration | number           | 500              |
| easing   | string\|function | 'easeInOutCubic' |

**Usage Example:**

```javascript
// Move camera 50 pixels right and 30 pixels down
game.camera.moveBy(50, 30);

// Move with custom duration and easing
game.camera.moveBy(-100, 0, false, 800, 'easeOutBounce');
```

## Zoom Methods

### getCurrentCenter(): Object

Returns the current center point of the camera viewport in world coordinates.

**Usage Example:**

```javascript
const center = game.camera.getCurrentCenter();
console.log(`Camera center: ${center.x}, ${center.y}`);
```

### zoomTo(zoom, centerX, centerY, duration, easing): Camera

Zooms the camera to a specific level while maintaining focus on a center point.

| Name     | Type             | Default          |
|----------|------------------|------------------|
| zoom     | number\|object   | -                |
| centerX  | number           | null             |
| centerY  | number           | null             |
| duration | number           | 500              |
| easing   | string\|function | 'easeInOutCubic' |

**Usage Example:**

```javascript
// Zoom to 2x at current center
game.camera.zoomTo(2);

// Zoom to 1.5x at specific point
game.camera.zoomTo(1.5, 400, 300);

// Using object parameter
game.camera.zoomTo({
    zoom: 3,
    centerX: 200,
    centerY: 150,
    duration: 1000,
    easing: 'easeInOutQuart'
});
```

### zoomToLevel(zoom, centerX, centerY, duration, easing): Camera

Alias for zoomTo method. Zooms the camera to a specific level.

| Name     | Type             | Default          |
|----------|------------------|------------------|
| zoom     | number           | -                |
| centerX  | number           | null             |
| centerY  | number           | null             |
| duration | number           | 500              |
| easing   | string\|function | 'easeInOutCubic' |

**Usage Example:**

```javascript
game.camera.zoomToLevel(2.5, 300, 200);
```

### zoomBy(factor, centerX, centerY, duration, easing): Camera

Zooms the camera by a multiplication factor relative to current zoom level.

| Name     | Type             | Default          |
|----------|------------------|------------------|
| factor   | number           | -                |
| centerX  | number           | null             |
| centerY  | number           | null             |
| duration | number           | 500              |
| easing   | string\|function | 'easeInOutCubic' |

**Usage Example:**

```javascript
// Zoom in by 50%
game.camera.zoomBy(1.5);

// Zoom out by half
game.camera.zoomBy(0.5, 400, 300);
```

### zoomAtPoint(factor, screenX, screenY, duration, easing): Camera

Zooms the camera at a specific screen coordinate point.

| Name     | Type             | Default          |
|----------|------------------|------------------|
| factor   | number           | -                |
| screenX  | number           | -                |
| screenY  | number           | -                |
| duration | number           | 500              |
| easing   | string\|function | 'easeInOutCubic' |

**Usage Example:**

```javascript
// Zoom in at mouse position
game.camera.zoomAtPoint(2, mouseX, mouseY);
```

## Rotation Methods

### rotate(angle, instant, duration, easing): Camera

Rotates the camera to a specific angle in degrees.

| Name     | Type             | Default          |
|----------|------------------|------------------|
| angle    | number           | -                |
| instant  | boolean          | false            |
| duration | number           | 500              |
| easing   | string\|function | 'easeInOutCubic' |

**Usage Example:**

```javascript
// Rotate to 45 degrees instantly
game.camera.rotate(45, true);

// Rotate with animation
game.camera.rotate(90, false, 1000);
```

### rotateBy(deltaAngle, instant, duration, easing): Camera

Rotates the camera by a relative angle from its current rotation.

| Name       | Type             | Default          |
|------------|------------------|------------------|
| deltaAngle | number           | -                |
| instant    | boolean          | false            |
| duration   | number           | 500              |
| easing     | string\|function | 'easeInOutCubic' |

**Usage Example:**

```javascript
// Rotate 30 degrees clockwise
game.camera.rotateBy(30);

// Rotate counterclockwise with animation
game.camera.rotateBy(-45, false, 800);
```

## Bounds Management

### setBounds(bounds): Camera

Sets movement boundaries for the camera to constrain its position.

| Name   | Type         | Default |
|--------|--------------|---------|
| bounds | object\|null | -       |

**Usage Example:**

```javascript
// Set camera bounds
game.camera.setBounds({
    x: 0,
    y: 0,
    width: 2000,
    height: 1500
});

// Remove bounds
game.camera.setBounds(null);
```

## Focus Methods

### focusOn(x, y, zoom): Camera

Focuses the camera on a specific world coordinate with optional zoom level.

| Name | Type   | Default      |
|------|--------|--------------|
| x    | number | -            |
| y    | number | -            |
| zoom | number | current zoom |

**Usage Example:**

```javascript
// Focus on point with current zoom
game.camera.focusOn(500, 300);

// Focus with specific zoom level
game.camera.focusOn(500, 300, 2);
```

### focusOnRect(rect, padding): Camera

Focuses the camera to fit a rectangular area within the viewport.

| Name    | Type   | Default |
|---------|--------|---------|
| rect    | object | -       |
| padding | number | 0       |

**Usage Example:**

```javascript
// Focus on a rectangular area
game.camera.focusOnRect({
    x: 100,
    y: 100,
    width: 300,
    height: 200
});

// Focus with padding
game.camera.focusOnRect(rect, 50);
```

## Core Methods

### apply(): void

Applies the camera transformation to the rendering context. This method transforms the canvas context to reflect the
camera's position, zoom, and rotation.

**Usage Example:**

```javascript
// Apply camera transformation before rendering
game.camera.apply();
// ... render game objects ...
game.ctx.restore();
```

### update(): void

Updates the camera's position, zoom, rotation, and effects. Should be called every frame to handle smooth interpolation
and effects.

> This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do
> customization elsewhere.

**Usage Example:**

```javascript
// In game loop (if not using Pixalo's automatic update)
game.camera.update();
```

## Coordinate Conversion

### screenToWorld(screenX, screenY): Object

Converts screen coordinates to world coordinates considering camera transformation (position, zoom, and rotation).

| Name    | Type   | Default |
|---------|--------|---------|
| screenX | number | -       |
| screenY | number | -       |

**Returns:** Object with `x` and `y` properties representing world coordinates.

**Usage Example:**

```javascript
// Convert mouse position to world coordinates
const worldPos = game.camera.screenToWorld(mouseX, mouseY);
console.log(`World position: ${worldPos.x}, ${worldPos.y}`);

// Example: Click to place object at world position
canvas.addEventListener('click', (e) => {
    const worldPos = game.camera.screenToWorld(e.clientX, e.clientY);
    spawnObject(worldPos.x, worldPos.y);
});
```

### worldToScreen(worldX, worldY): Object

Converts world coordinates to screen coordinates considering camera transformation.

| Name   | Type   | Default |
|--------|--------|---------|
| worldX | number | -       |
| worldY | number | -       |

**Returns:** Object with `x` and `y` properties representing screen coordinates.

**Usage Example:**

```javascript
// Convert world position to screen coordinates
const screenPos = game.camera.worldToScreen(100, 200);
console.log(`Screen position: ${screenPos.x}, ${screenPos.y}`);

// Example: Draw UI element at world object position
const screenPos = game.camera.worldToScreen(player.x, player.y);
drawHealthBar(screenPos.x, screenPos.y - 30);
```

## Entity Following

### follow(entity, config): Camera

Makes the camera follow a specific entity with configurable behavior.

| Name   | Type   | Default |
|--------|--------|---------|
| entity | object | -       |
| config | object | {}      |

#### Configuration Options

| Property    | Type    | Default  | Description                            |
|-------------|---------|----------|----------------------------------------|
| behavior    | string  | 'center' | Follow behavior mode                   |
| offset.x    | number  | 0        | Horizontal offset from target          |
| offset.y    | number  | 0        | Vertical offset from target            |
| deadzone.x  | number  | 0        | Horizontal deadzone for edge behaviors |
| deadzone.y  | number  | 0        | Vertical deadzone for edge behaviors   |
| smooth      | boolean | true     | Enable smooth following                |
| smoothSpeed | number  | 0.1      | Speed of smooth following (0-1)        |

#### Follow Behaviors

- `'center'` - Keep the entity centered in the viewport
- `'edge'` - Follow only when entity approaches viewport edges (uses deadzone)
- `'horizontal-edge'` - Follow only on horizontal edges
- `'vertical-edge'` - Follow only on vertical edges
- `'top'` - Keep entity at top of viewport
- `'bottom'` - Keep entity at bottom of viewport
- `'left'` - Keep entity at left of viewport
- `'right'` - Keep entity at right of viewport

**Usage Example:**

```javascript
// Basic following (center behavior)
game.camera.follow(player);

// Follow with edge behavior and deadzone
game.camera.follow(player, {
    behavior: 'edge',
    offset: {x: 0, y: -50},
    deadzone: {x: 100, y: 80},
    smooth: true,
    smoothSpeed: 0.05
});

// Platform game style following
game.camera.follow(player, {
    behavior: 'horizontal-edge',
    deadzone: {x: 150, y: 0},
    offset: {x: 0, y: -100}
});
```

### cancelFollow(): Camera

Stops the camera from following any entity and clears follow configuration.

**Usage Example:**

```javascript
// Stop following
game.camera.cancelFollow();
```

## Position Calculation

### calcFollowPosition(): Object|null

Calculates the target camera position based on the current follow configuration. This is an internal method but can be
useful for custom implementations.

**Returns:** Object with `x` and `y` properties or `null` if no entity is being followed.

**Usage Example:**

```javascript
// Get calculated follow position
const followPos = game.camera.calcFollowPosition();
if (followPos) {
    console.log(`Follow target: ${followPos.x}, ${followPos.y}`);
}
```

### calcFixedPosition(x, y): Object

Calculates a fixed position relative to the viewport for UI elements that should remain in the same screen position
regardless of camera movement.

| Name | Type   | Default |
|------|--------|---------|
| x    | number | -       |
| y    | number | -       |

**Usage Example:**

```javascript
// Calculate position for fixed UI element
const fixedPos = game.camera.calcFixedPosition(100, 50);
// This position will always be 100px from left, 50px from top of screen

// Negative values calculate from right/bottom
const bottomRight = game.camera.calcFixedPosition(-100, -50);
// This will be 100px from right, 50px from bottom
```

## Visibility Testing

### inView(object, padding): boolean

Checks if an object is visible within the camera's viewport.

| Name    | Type   | Default              |
|---------|--------|----------------------|
| object  | object | -                    |
| padding | number | `config.viewPadding` |

**Usage Example:**

```javascript
// Check if entity is visible
if (game.camera.inView(enemy)) {
    enemy.update(); // Only update visible enemies
}

// Check with padding for early loading
if (game.camera.inView(entity, 100)) {
    entity.prepareForView();
}
```

### pointInView(x, y, padding): boolean

Checks if a specific point is visible within the camera's viewport.

| Name    | Type   | Default              |
|---------|--------|----------------------|
| x       | number | -                    |
| y       | number | -                    |
| padding | number | `config.viewPadding` |

**Usage Example:**

```javascript
// Check if point is visible
if (game.camera.pointInView(100, 200)) {
    console.log('Point is visible');
}

// Check with padding
if (game.camera.pointInView(x, y, 50)) {
    renderSpecialEffect(x, y);
}
```

## State Management

### saveState(name): Camera

Saves the current camera state with a given name for later restoration. Saves position, zoom, rotation, bounds, and
follow settings.

| Name | Type   | Default |
|------|--------|---------|
| name | string | -       |

**Usage Example:**

```javascript
// Save current camera state
game.camera.saveState('beforeCutscene');
game.camera.saveState('checkpoint1');
```

### loadState(name, options): Camera

Loads a previously saved camera state with optional smooth transition.

| Name    | Type   | Default |
|---------|--------|---------|
| name    | string | -       |
| options | object | {}      |

#### Options

| Property | Type    | Default | Description                       |
|----------|---------|---------|-----------------------------------|
| smooth   | boolean | false   | Enable smooth transition to state |
| duration | number  | 500     | Duration of smooth transition     |

**Usage Example:**

```javascript
// Load state instantly
game.camera.loadState('beforeCutscene');

// Load state with smooth transition
game.camera.loadState('beforeCutscene', {
    smooth: true,
    duration: 1000
});

// Load checkpoint state
game.camera.loadState('checkpoint1');
```

### deleteState(name): boolean

Deletes a saved camera state and returns whether the deletion was successful.

| Name | Type   | Default |
|------|--------|---------|
| name | string | -       |

**Usage Example:**

```javascript
// Delete a specific state
const deleted = game.camera.deleteState('oldState');
console.log('State deleted:', deleted);

// Clean up temporary states
game.camera.deleteState('tempState');
```

### getStatesList(): Array

Returns an array of all saved state names.

**Usage Example:**

```javascript
// Get all saved states
const states = game.camera.getStatesList();
console.log('Saved states:', states);

// Create a save menu
states.forEach(stateName => {
    createMenuItem(stateName, () => game.camera.loadState(stateName));
});
```

### hasState(name): boolean

Checks if a state with the given name exists.

| Name | Type   | Default |
|------|--------|---------|
| name | string | -       |

**Usage Example:**

```javascript
// Check before loading
if (game.camera.hasState('checkpoint1')) {
    game.camera.loadState('checkpoint1');
} else {
    console.log('Checkpoint not found');
}

// Conditional saving
if (!game.camera.hasState('autosave')) {
    game.camera.saveState('autosave');
}
```

## Visual Effects

### shake(options): Camera

Applies a screen shake effect to the camera for impact feedback or dramatic effect.

| Name    | Type           | Default |
|---------|----------------|---------|
| options | object\|number | {}      |

#### Configuration Options

| Property  | Type   | Default  | Description                              |
|-----------|--------|----------|------------------------------------------|
| intensity | number | 5        | Maximum shake distance in pixels         |
| duration  | number | 500      | Duration of shake effect in milliseconds |
| frequency | number | 50       | Frequency of shake updates               |
| falloff   | string | 'linear' | Intensity falloff type                   |

#### Shake Falloff Types

- `'linear'` - Linear intensity decrease over time
- `'exponential'` - Exponential intensity decrease for more natural effect

**Usage Example:**

```javascript
// Simple shake with default settings
game.camera.shake(10);

// Explosion shake effect
game.camera.shake({
    intensity: 25,
    duration: 800,
    frequency: 60,
    falloff: 'exponential'
});

// Subtle impact shake
game.camera.shake({
    intensity: 5,
    duration: 200,
    falloff: 'linear'
});

// Earthquake effect
game.camera.shake({
    intensity: 15,
    duration: 2000,
    frequency: 30,
    falloff: 'linear'
});
```

### dramaticFocus(target, duration, finalZoom): Camera

Creates a dramatic focus effect by smoothly zooming and moving to a target point. Useful for cutscenes, important
events, or drawing attention to specific areas.

| Name      | Type   | Default |
|-----------|--------|---------|
| target    | object | -       |
| duration  | number | 1000    |
| finalZoom | number | 2       |

**Usage Example:**

```javascript
// Dramatic focus on player
game.camera.dramaticFocus({
    x: player.x,
    y: player.y
}, 1500, 3);

// Focus on important item
game.camera.dramaticFocus({
    x: treasureChest.x,
    y: treasureChest.y
}, 2000, 2.5);

// Quick focus for dialogue
game.camera.dramaticFocus({
    x: npc.x,
    y: npc.y - 50 // Offset to show character's face
}, 800, 1.8);
```

## Utility Methods

### reset(): Camera

Resets all camera properties to their initial configuration values. This includes:

- Position (x, y)
- Zoom level
- Rotation angle
- Bounds
- Zoom limits
- Smoothing settings
- Cancels entity following
- Clears all saved states
- Stops all active effects

**Usage Example:**

```javascript
// Reset camera to initial state
game.camera.reset();

// Useful for level transitions
function startNewLevel () {
    game.camera.reset();
    game.camera.focusOn(player.x, player.y);
}

// Reset after cutscene
function endCutscene () {
    game.camera.reset();
    game.camera.follow(player);
}
```

## Properties

### Position Properties

- `x`, `y` - Current camera position in world coordinates
- `_targetX`, `_targetY` - Target position for smooth interpolation
- `_lastX`, `_lastY` - Previous position for delta calculation
- `deltaX`, `deltaY` - Change in position since last update

### Zoom Properties

- `zoom` - Current zoom level (1 = normal, 2 = 2x zoom, 0.5 = zoomed out)
- `_targetZoom` - Target zoom for smooth interpolation
- `_lastZoom` - Previous zoom level
- `deltaZoom` - Change in zoom since last update
- `minZoom`, `maxZoom` - Zoom level constraints

### Rotation Properties

- `rotation` - Current rotation angle in degrees
- `_targetRotation` - Target rotation for smooth interpolation
- `_lastRotation` - Previous rotation angle
- `deltaRotation` - Change in rotation since last update

### Configuration Properties

- `smoothing` - Whether smooth interpolation is enabled
- `smoothSpeed` - Speed of smooth interpolation (0-1)
- `bounds` - Movement boundaries object or null

## Advanced Usage Examples

### Custom Follow Behavior

```javascript
// Create a custom follow system with lookahead
game.camera.follow(player, {
    behavior: 'center',
    smooth: true,
    smoothSpeed: 0.08
});

// Add velocity-based offset in update loop
game.on('update', () => {
    if (player.velocity.x !== 0) {
        const lookahead = player.velocity.x * 50; // Look ahead based on speed
        game.camera._targetX += lookahead;
    }
});
```

### Multi-Zone Camera System

```javascript
// Define different camera zones
const cameraZones = [
    {x: 0, y: 0, width: 800, height: 600, zoom: 1},
    {x: 800, y: 0, width: 400, height: 600, zoom: 1.5},
    {x: 0, y: 600, width: 1200, height: 400, zoom: 0.8}
];

// Update camera based on player position
function updateCameraZone () {
    const currentZone = cameraZones.find(zone =>
        player.x >= zone.x && player.x < zone.x + zone.width &&
        player.y >= zone.y && player.y < zone.y + zone.height
    );

    if (currentZone) {
        game.camera.zoomTo(currentZone.zoom, null, null, 1000);
    }
}
```

### Cinematic Camera Sequence

```javascript
async function playCinematic () {
    // Save current state
    game.camera.saveState('beforeCinematic');

    // Sequence of camera movements
    await new Promise(resolve => {
        game.camera.moveTo(100, 100, false, 1000);
        setTimeout(resolve, 1000);
    });

    await new Promise(resolve => {
        game.camera.dramaticFocus({x: 500, y: 300}, 1500, 3);
        setTimeout(resolve, 2000);
    });

    // Shake for dramatic effect
    game.camera.shake({
        intensity: 20,
        duration: 1000,
        falloff: 'exponential'
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return to original state
    game.camera.loadState('beforeCinematic', {
        smooth: true,
        duration: 1000
    });
}
```

### Dynamic Bounds System

```javascript
// Update camera bounds based on current level section
function updateCameraBounds () {
    const currentSection = getCurrentLevelSection(player.x, player.y);

    if (currentSection) {
        game.camera.setBounds({
            x: currentSection.minX,
            y: currentSection.minY,
            width: currentSection.maxX - currentSection.minX,
            height: currentSection.maxY - currentSection.minY
        });
    }
}
```

## Easing Functions

The camera system supports all easing functions provided by
the [Pixalo.Ease](https://github.com/pixalo/pixalo/tree/main/wiki/v1/Ease.md) system:

- `'easeInOutCubic'` (default)

You can also provide custom easing functions:

```javascript
// Custom easing function
const customEasing = (t) => t * t * (3 - 2 * t); // Smoothstep

game.camera.moveTo(100, 100, false, 1000, customEasing);
```

## Important Notes

### Performance Considerations

- The camera automatically handles bounds checking when set via `setBounds()`
- Use `inView()` to optimize rendering by only drawing visible objects
- The `update()` method must be called every frame for smooth animations and effects
- Consider using object pooling for frequently created/destroyed objects in view

### Entity Requirements

- Entity following requires the target entity to have `absoluteX`, `absoluteY`, `width`, and `height` properties
- For collision-based visibility testing, entities should have a `collision` property with `x`, `y`, `width`, and
  `height`

### Transform Order

- The camera applies transformations in this order: translate to center, rotate, scale (zoom), translate by camera
  position
- This ensures rotation occurs around the screen center rather than the world origin

### Method Chaining

- All modification methods return the Camera instance, allowing for method chaining:

```javascript
game.camera
    .moveTo(100, 100)
    .zoomTo(2)
    .rotate(45)
    .shake(10);
```

### Coordinate Systems

- World coordinates: The game world's coordinate system
- Screen coordinates: The canvas/viewport coordinate system
- The camera handles conversion between these systems automatically

### State Management Best Practices

- Use descriptive names for saved states
- Clean up temporary states to prevent memory leaks
- Save states before major camera changes (cutscenes, level transitions)
- Consider implementing an autosave system for camera states at checkpoints