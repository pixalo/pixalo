The `Particle` class is a versatile particle system component designed for creating dynamic visual effects in
canvas-based applications. It handles individual particle lifecycle management, including position updates, visual
interpolation, rotation, and rendering with support for both colored shapes and textured sprites.

## Public Methods

### `constructor()`

Creates a new particle instance and initializes it with default values.

**Usage Example:**

```javascript
const particle = new Particle();
```

### `init(config): void`

Initializes the particle with the provided configuration object, setting up all particle properties including position,
velocity, appearance, and behavior.

| Name                  | Type       | Default |
|-----------------------|------------|---------|
| config                | Object     | -       |
| config.x              | number     | -       |
| config.y              | number     | -       |
| config.velocity       | Object     | -       |
| config.velocity.x     | number     | -       |
| config.velocity.y     | number     | -       |
| config.acceleration   | Object     | -       |
| config.acceleration.x | number     | -       |
| config.acceleration.y | number     | -       |
| config.size           | number     | -       |
| config.color          | Object     | -       |
| config.color.start    | string     | -       |
| config.color.end      | string     | -       |
| config.alpha          | Object     | -       |
| config.alpha.start    | number     | -       |
| config.alpha.end      | number     | -       |
| config.rotation       | number     | -       |
| config.rotationSpeed  | number     | -       |
| config.lifetime       | number     | -       |
| config.texture        | Image/null | -       |

**Usage Example:**

```javascript
particle.init({
    x: 100,
    y: 200,
    velocity: {x: 50, y: -30},
    acceleration: {x: 0, y: 9.8},
    size: 10,
    color: {start: '#ff0000', end: '#ffff00'},
    alpha: {start: 1.0, end: 0.0},
    rotation: 0,
    rotationSpeed: 45,
    lifetime: 2000,
    texture: null
});
```

### `render(ctx): void`

Renders the particle to the provided canvas context, handling alpha interpolation, rotation, and drawing either a
textured sprite or colored circle based on configuration.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
particle.render(ctx);
```

### `update(deltaTime): void`

Updates the particle's physics simulation including position, velocity, rotation, and age based on the provided delta
time.

| Name      | Type   | Default |
|-----------|--------|---------|
| deltaTime | number | -       |

**Usage Example:**

```javascript
const deltaTime = 16.67; // ~60fps
particle.update(deltaTime);
```

### `reset(): void`

Resets the particle to its default state, clearing all properties and preparing it for reuse.

**Usage Example:**

```javascript
particle.reset();
```

### `isDead(): boolean`

Checks if the particle has exceeded its lifetime and should be considered dead/inactive.

**Usage Example:**

```javascript
if (particle.isDead()) {
    // Remove particle from active list
    particles.splice(index, 1);
}
```

### `interpolateColor(color1, color2, progress): string`

Interpolates between two hex colors based on the given progress value (0-1), returning an RGB color string.

| Name     | Type   | Default |
|----------|--------|---------|
| color1   | string | -       |
| color2   | string | -       |
| progress | number | -       |

**Usage Example:**

```javascript
const interpolatedColor = particle.interpolateColor('#ff0000', '#0000ff', 0.5);
// Returns: "rgb(127, 0, 127)"
```