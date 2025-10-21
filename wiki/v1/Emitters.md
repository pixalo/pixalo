The Emitters system provides a powerful and flexible particle system for 2D games built with Pixalo engine. It consists
of two main classes: `Emitters` (the manager class) and `Emitter` (individual particle emitters). The system includes
object pooling for performance optimization, various built-in presets (explosion, fire, smoke), and comprehensive
configuration options for creating custom particle effects.

## Public Methods

### Emitters Class Methods

### create(id, config): Emitter

Creates a new particle emitter with the specified configuration.

| Name   | Type   | Default |
|--------|--------|---------|
| id     | string | -       |
| config | object | {}      |

**Config Object Structure:**
```javascript
{
  position: {
    x: number,           // X position (default: 0)
    y: number            // Y position (default: 0)
  },
  shape: string,         // 'invisible', 'circle', 'square', 'diamond', 'cross' (default: 'invisible')
  size: number,          // Size of emitter visual (default: 10)
  color: string,         // Color of emitter visual (default: '#ff0000')
  opacity: number,       // Opacity of emitter visual (default: 0.5)
  emission: {
    type: string,        // 'point', 'circle', 'rectangle', 'line' (default: 'point')
    rate: number,        // Particles per second (default: 30)
    lifetime: number,    // Particle lifetime in ms (default: 2000)
    burst: number,       // Burst particle count (default: 0)
    radius: number,      // For circle emission
    edge: boolean,       // Emit from edges only
    width: number,       // For rectangle emission
    height: number,      // For rectangle emission
    start: {x, y},       // For line emission start point
    end: {x, y}          // For line emission end point
  },
  particle: {
    velocity: {
      min: {x: number, y: number},  // Min velocity (default: {x: -50, y: -50})
      max: {x: number, y: number}   // Max velocity (default: {x: 50, y: 50})
    },
    acceleration: {
      x: number,         // X acceleration (default: 0)
      y: number          // Y acceleration (default: 0)
    },
    size: {
      min: number,       // Min particle size (default: 2)
      max: number        // Max particle size (default: 4)
    },
    color: {
      start: string,     // Start color (default: '#ffffff')
      end: string        // End color (default: '#000000')
    },
    alpha: {
      start: number,     // Start alpha (default: 1)
      end: number        // End alpha (default: 0)
    },
    rotation: {
      min: number,       // Min rotation in degrees (default: 0)
      max: number        // Max rotation in degrees (default: 0)
    },
    rotationSpeed: {
      min: number,       // Min rotation speed deg/s (default: 0)
      max: number        // Max rotation speed deg/s (default: 0)
    },
    texture: string      // Asset ID for particle texture (default: null)
  },
  autoDestroy: boolean   // Auto destroy when particles finished (default: false)
}
```

**Usage Example:**

```javascript
const emitter = game.emitters.create('myEmitter', {
    position: {x: 100, y: 100},
    emission: {
        type: 'circle',
        rate: 50,
        radius: 20
    },
    particle: {
        velocity: {
            min: {x: -100, y: -100},
            max: {x: 100, y: 100}
        },
        color: {
            start: '#ff0000',
            end: '#ffff00'
        }
    }
});
```

---

### get(id): Emitter | null

Retrieves an existing emitter by its ID.

| Name | Type   | Default |
|------|--------|---------|
| id   | string | -       |

**Usage Example:**

```javascript
const emitter = game.emitters.get('myEmitter');
if (emitter) {
    emitter.start();
}
```

---

### remove(id): boolean

Removes and destroys an emitter by its ID.

| Name | Type   | Default |
|------|--------|---------|
| id   | string | -       |

**Usage Example:**

```javascript
const success = game.emitters.remove('myEmitter');
console.log('Emitter removed:', success);
```

---

### getAll(): Array<Emitter>

Returns an array of all active emitters.

**Usage Example:**

```javascript
const allEmitters = game.emitters.getAll();
allEmitters.forEach(emitter => emitter.pause());
```

---

### clear(): void

Removes and destroys all emitters and clears the particle pool.

**Usage Example:**

```javascript
game.emitters.clear();
```

---

### update(deltaTime): void

Updates all active emitters. Called automatically by the engine.

| Name      | Type   | Default |
|-----------|--------|---------|
| deltaTime | number | -       |

**Usage Example:**

```javascript
// Called automatically by engine, but can be called manually
game.emitters.update(16.67); // 60 FPS
```

---

### render(ctx): void

Renders all visible emitters. Called automatically by the engine.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**

```javascript
// Called automatically by engine, but can be called manually
game.emitters.render(canvas.getContext('2d'));
```

---

### explosion(x, y, options): Emitter

Creates an explosion effect preset at the specified position.

| Name    | Type   | Default |
|---------|--------|---------|
| x       | number | -       |
| y       | number | -       |
| options | object | {}      |

**Options Object:**

- `particleCount`: number (default: 30)
- `lifetime`: number (default: 1500)
- `startColor`: string (default: '#ff4444')
- `endColor`: string (default: '#ffaa00')

**Usage Example:**

```javascript
game.emitters.explosion(200, 150, {
    particleCount: 50,
    startColor: '#ff0000',
    endColor: '#ffff00'
});
```

---

### fire(x, y, options): Emitter

Creates a fire effect preset at the specified position.

| Name    | Type   | Default |
|---------|--------|---------|
| x       | number | -       |
| y       | number | -       |
| options | object | {}      |

**Options Object:**

- `rate`: number (default: 40)
- `lifetime`: number (default: 1200)

**Usage Example:**

```javascript
const fireEmitter = game.emitters.fire(100, 300, {
    rate: 60,
    lifetime: 1500
});
```

---

### smoke(x, y, options): Emitter

Creates a smoke effect preset at the specified position.

| Name    | Type   | Default |
|---------|--------|---------|
| x       | number | -       |
| y       | number | -       |
| options | object | {}      |

**Options Object:**

- `rate`: number (default: 15)
- `lifetime`: number (default: 3000)

**Usage Example:**

```javascript
const smokeEmitter = game.emitters.smoke(150, 200, {
    rate: 20,
    lifetime: 4000
});
```

### Emitter Class Methods

### start(): Emitter

Starts the emitter particle emission.

**Usage Example:**

```javascript
const emitter = game.emitters.create('test', {});
emitter.start();
```

---

### stop(): Emitter

Stops the emitter particle emission.

**Usage Example:**

```javascript
emitter.stop();
```

---

### pause(): Emitter

Pauses the emitter particle emission.

**Usage Example:**

```javascript
emitter.pause();
```

---

### resume(): Emitter

Resumes the emitter particle emission.

**Usage Example:**

```javascript
emitter.resume();
```

---

### burst(count): Emitter

Emits a specified number of particles instantly.

| Name  | Type   | Default |
|-------|--------|---------|
| count | number | -       |

**Usage Example:**

```javascript
emitter.burst(25); // Emit 25 particles instantly
```

---

### move(x, y): Emitter

Instantly moves the emitter to the specified position.

| Name | Type   | Default |
|------|--------|---------|
| x    | number | -       |
| y    | number | -       |

**Usage Example:**

```javascript
emitter.move(300, 400);
```

---

### moveTo(x, y, options): Emitter

Animates the emitter to the specified position over time.

| Name    | Type   | Default |
|---------|--------|---------|
| x       | number | -       |
| y       | number | -       |
| options | object | {}      |

**Options Object:**

- `duration`: number (default: 1000) - Animation duration in milliseconds
- `easing`: string (default: 'linear') - Easing function name

**Usage Example:**

```javascript
emitter.moveTo(500, 300, {
    duration: 2000,
    easing: 'easeInOut'
});
```

---

### destroy(): void

Destroys the emitter and returns all particles to the pool.

**Usage Example:**

```javascript
emitter.destroy();
```

## Additional Notes

### Performance Considerations

- The system uses object pooling with a maximum pool size of 1000 particles for optimal performance
- Particles are automatically returned to the pool when they die to reduce garbage collection
- Use `autoDestroy: true` for one-time effects like explosions to automatically clean up emitters

### Emission Types

- **point**: Emits from a single point (emitter position)
- **circle**: Emits from within or on the edge of a circle
- **rectangle**: Emits from within or on the edges of a rectangle
- **line**: Emits along a line between two points

### Color and Alpha Interpolation

- Colors are interpolated from start to end over the particle's lifetime
- Supports hex color format (#ffffff)
- Alpha values are interpolated linearly from start to end values

### Movement Animation

- The `moveTo` method supports easing functions from the
  engine's [Ease](https://github.com/pixalo/pixalo/tree/main/wiki/v1/Ease.md) module
- Movement animations can be interrupted by calling `move()` or another `moveTo()`
- Available easing options depend on the engine's implementation

### Texture Support

- Particles can use textures by referencing asset IDs
- If no texture is specified, particles render as colored circles
- Textures are automatically retrieved from the engine's asset system