The Camera class is a comprehensive 2D camera system for the Pixalo game engine that provides advanced viewport management, smooth animations, and cinematic effects. It handles camera movement, zooming, rotation, entity following, bounds management, and various visual effects like screen shake, fade transitions, and cinematic modes.

## Public Methods

### moveTo(x, y, instant, duration, easing): Camera

Moves the camera to a specific position with optional animation.

| Name | Type | Default |
|------|------|---------|
| x | number | - |
| y | number | 0 |
| instant | boolean | false |
| duration | number | 500 |
| easing | string\|function | 'easeInOutCubic' |

**Usage Example:**
```javascript
// Move camera to position (100, 200) instantly
game.camera.moveTo(100, 200, true);

// Move camera with animation
game.camera.moveTo(300, 400, false, 1000, 'easeInOutQuad');
```

### moveBy(dx, dy, instant, duration, easing): Camera

Moves the camera by a relative offset from its current position.

| Name | Type | Default |
|------|------|---------|
| dx | number | - |
| dy | number | 0 |
| instant | boolean | false |
| duration | number | 500 |
| easing | string\|function | 'easeInOutCubic' |

**Usage Example:**
```javascript
// Move camera 50 pixels right and 30 pixels down
game.camera.moveBy(50, 30);

// Move with custom duration and easing
game.camera.moveBy(-100, 0, false, 800, 'easeOutBounce');
```

### getCurrentCenter(): Object

Returns the current center point of the camera viewport in world coordinates.

**Usage Example:**
```javascript
const center = game.camera.getCurrentCenter();
console.log(`Camera center: ${center.x}, ${center.y}`);
```

### zoomTo(zoom, centerX, centerY, duration, easing): Camera

Zooms the camera to a specific level while maintaining focus on a center point.

| Name | Type | Default |
|------|------|---------|
| zoom | number\|object | - |
| centerX | number | undefined |
| centerY | number | undefined |
| duration | number | 500 |
| easing | string\|function | 'easeInOutCubic' |

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

| Name | Type | Default |
|------|------|---------|
| zoom | number | - |
| centerX | number | undefined |
| centerY | number | undefined |
| duration | number | 500 |
| easing | string\|function | 'easeInOutCubic' |

**Usage Example:**
```javascript
game.camera.zoomToLevel(2.5, 300, 200);
```

### zoomBy(factor, centerX, centerY, duration, easing): Camera

Zooms the camera by a multiplication factor relative to current zoom level.

| Name | Type | Default |
|------|------|---------|
| factor | number | - |
| centerX | number | undefined |
| centerY | number | undefined |
| duration | number | 500 |
| easing | string\|function | 'easeInOutCubic' |

**Usage Example:**
```javascript
// Zoom in by 50%
game.camera.zoomBy(1.5);

// Zoom out by half
game.camera.zoomBy(0.5, 400, 300);
```

### zoomAtPoint(factor, screenX, screenY, duration, easing): Camera

Zooms the camera at a specific screen coordinate point.

| Name | Type | Default |
|------|------|---------|
| factor | number | - |
| screenX | number | - |
| screenY | number | - |
| duration | number | 500 |
| easing | string\|function | 'easeInOutCubic' |

**Usage Example:**
```javascript
// Zoom in at mouse position
game.camera.zoomAtPoint(2, mouseX, mouseY);
```

### rotate(angle, instant, duration, easing): Camera

Rotates the camera to a specific angle in degrees.

| Name | Type | Default |
|------|------|---------|
| angle | number | - |
| instant | boolean | false |
| duration | number | 500 |
| easing | string\|function | 'easeInOutCubic' |

**Usage Example:**
```javascript
// Rotate to 45 degrees instantly
game.camera.rotate(45, true);

// Rotate with animation
game.camera.rotate(90, false, 1000);
```

### rotateBy(deltaAngle, instant, duration, easing): Camera

Rotates the camera by a relative angle from its current rotation.

| Name | Type | Default |
|------|------|---------|
| deltaAngle | number | - |
| instant | boolean | false |
| duration | number | 500 |
| easing | string\|function | 'easeInOutCubic' |

**Usage Example:**
```javascript
// Rotate 30 degrees clockwise
game.camera.rotateBy(30);

// Rotate counterclockwise with animation
game.camera.rotateBy(-45, false, 800);
```

### setBounds(bounds): Camera

Sets movement boundaries for the camera to constrain its position.

| Name | Type | Default |
|------|------|---------|
| bounds | object\|null | - |

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

### focusOn(x, y, zoom): Camera

Focuses the camera on a specific world coordinate with optional zoom level.

| Name | Type | Default |
|------|------|---------|
| x | number | - |
| y | number | - |
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

| Name | Type | Default |
|------|------|---------|
| rect | object | - |
| padding | number | 0 |

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

### apply(ctx): void

Applies the camera transformation to the rendering context.

| Name | Type | Default |
|------|------|---------|
| ctx | CanvasRenderingContext2D | - |

**Usage Example:**
```javascript
// Apply camera transformation before rendering
game.camera.apply(ctx);
// ... render game objects ...
game.camera.restore(ctx);
```

### restore(ctx): void

Restores the rendering context after camera transformation.

| Name | Type | Default |
|------|------|---------|
| ctx | CanvasRenderingContext2D | - |

**Usage Example:**
```javascript
game.camera.apply(ctx);
// ... render game objects ...
game.camera.restore(ctx);
```

### update(): void

Updates the camera's position, zoom, rotation, and effects. Should be called every frame.

> This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do customization elsewhere.

**Usage Example:**
```javascript
// In game loop
game.camera.update();
```

### screenToWorld(screenX, screenY): Object

Converts screen coordinates to world coordinates considering camera transformation.

| Name | Type | Default |
|------|------|---------|
| screenX | number | - |
| screenY | number | - |

**Usage Example:**
```javascript
const worldPos = game.camera.screenToWorld(mouseX, mouseY);
console.log(`World position: ${worldPos.x}, ${worldPos.y}`);
```

### worldToScreen(worldX, worldY): Object

Converts world coordinates to screen coordinates considering camera transformation.

| Name | Type | Default |
|------|------|---------|
| worldX | number | - |
| worldY | number | - |

**Usage Example:**
```javascript
const screenPos = game.camera.worldToScreen(100, 200);
console.log(`Screen position: ${screenPos.x}, ${screenPos.y}`);
```

### follow(entity, config): Camera

Makes the camera follow a specific entity with configurable behavior.

| Name | Type | Default |
|------|------|---------|
| entity | object | - |
| config | object | {} |

**Usage Example:**
```javascript
// Basic following
game.camera.follow(player);

// Follow with custom configuration
game.camera.follow(player, {
    behavior: 'edge',
    offset: { x: 0, y: -50 },
    deadzone: { x: 100, y: 80 },
    smooth: true,
    smoothSpeed: 0.05
});
```

### cancelFollow(): Camera

Stops the camera from following any entity.

**Usage Example:**
```javascript
game.camera.cancelFollow();
```

### saveState(name): Camera

Saves the current camera state with a given name for later restoration.

| Name | Type | Default |
|------|------|---------|
| name | string | - |

**Usage Example:**
```javascript
// Save current camera state
game.camera.saveState('beforeCutscene');
```

### loadState(name, options): Camera

Loads a previously saved camera state.

| Name | Type | Default |
|------|------|---------|
| name | string | - |
| options | object | {} |

**Usage Example:**
```javascript
// Load state instantly
game.camera.loadState('beforeCutscene');

// Load state with smooth transition
game.camera.loadState('beforeCutscene', {
    smooth: true,
    duration: 1000
});
```

### deleteState(name): boolean

Deletes a saved camera state.

| Name | Type | Default |
|------|------|---------|
| name | string | - |

**Usage Example:**
```javascript
const deleted = game.camera.deleteState('oldState');
console.log('State deleted:', deleted);
```

### getStatesList(): Array

Returns an array of all saved state names.

**Usage Example:**
```javascript
const states = game.camera.getStatesList();
console.log('Saved states:', states);
```

### hasState(name): boolean

Checks if a state with the given name exists.

| Name | Type | Default |
|------|------|---------|
| name | string | - |

**Usage Example:**
```javascript
if (game.camera.hasState('checkpoint1')) {
    game.camera.loadState('checkpoint1');
}
```

### shake(options): Camera

Applies a screen shake effect to the camera.

| Name | Type | Default |
|------|------|---------|
| options | object\|number | {} |

**Usage Example:**
```javascript
// Simple shake
game.camera.shake(10);

// Advanced shake configuration
game.camera.shake({
    intensity: 15,
    duration: 800,
    frequency: 60,
    falloff: 'exponential'
});
```

### setCinematicMode(options): Camera

Applies cinematic black bars effect to create widescreen appearance.

| Name | Type | Default |
|------|------|---------|
| options | object | {} |

**Usage Example:**
```javascript
// Apply cinematic mode
game.camera.setCinematicMode({
    duration: 1500,
    ratio: 2.35
});
```

### fade(options): Camera

Applies a fade in/out effect to the camera.

| Name | Type | Default |
|------|------|---------|
| options | object | {} |

**Usage Example:**
```javascript
// Fade to black
game.camera.fade({
    type: 'out',
    color: 'black',
    duration: 1000
});

// Fade in from white
game.camera.fade({
    type: 'in',
    color: 'white',
    duration: 800
});
```

### dramaticFocus(target, duration, finalZoom): Camera

Creates a dramatic focus effect by zooming and moving to a target point.

| Name | Type | Default |
|------|------|---------|
| target | object | - |
| duration | number | 1000 |
| finalZoom | number | 2 |

**Usage Example:**
```javascript
// Dramatic focus on player
game.camera.dramaticFocus({
    x: player.x,
    y: player.y
}, 1500, 3);
```

## Configuration Options

### Follow Behaviors
The camera's follow system supports several behavior modes:

- `'center'` - Keep the entity centered in the viewport
- `'edge'` - Follow only when entity approaches viewport edges
- `'horizontal-edge'` - Follow only on horizontal edges
- `'vertical-edge'` - Follow only on vertical edges
- `'top'` - Keep entity at top of viewport
- `'bottom'` - Keep entity at bottom of viewport
- `'left'` - Keep entity at left of viewport
- `'right'` - Keep entity at right of viewport

### Easing Functions
Available easing functions for smooth animations:
- `'easeInOutCubic'` (default)
- `'easeInOutQuad'`
- `'easeOutBounce'`
- `'easeInOutQuart'`
- And other easing functions provided by the Pixalo.Ease

### Shake Falloff Types
- `'linear'` - Linear intensity decrease
- `'exponential'` - Exponential intensity decrease for more natural effect

## Important Notes

- The camera automatically handles bounds checking when set via `setBounds()`
- All animation methods return the Camera instance for method chaining
- The `update()` method must be called every frame for smooth animations and effects
- Screen shake respects camera bounds to prevent invalid positions
- Zoom levels are constrained by `minZoom` and `maxZoom` properties
- Entity following requires the target entity to have `absoluteX`, `absoluteY`, `width`, and `height` properties