# Pixalo Game Engine 🎮

A powerful and flexible 2D game engine built with JavaScript, designed for creating interactive web games and applications.

## ✨ Features

- 🎯 High-performance 2D rendering system
- 🏃 Advanced animation support with keyframes
- 🎨 Background layer management
- 📐 Grid system with customizable properties
- 🔄 Sprite sheet and asset management
- 💥 Collision detection system
- 🎵 Audio management with categories and effects
- 🗺️ Tile map system for level design
- 🎆 Particle emitter system
- 📸 Screenshot functionality
- 🎚️ Quality control and scaling
- 🐞 Built-in debugging tools

## Installation

### Using bundled version
```html
<script src="pixalo.bundle.js"></script>
```

### Using ES modules
```javascript
// ESM import
import Pixalo from 'pixalo.esm.js';
```

### Using UMD
```javascript
// UMD import
import Pixalo from 'pixalo.umd.js';
```
OR
```html
<script src="pixalo.umd.js"></script>
```

### Direct source import
```javascript
// Direct source import
import Pixalo from './src/Pixalo.js';
```

Choose the import method that best suits your project's build setup and requirements. All methods provide the same functionality, but they are optimized for different use cases:

- `pixalo.bundle.js`: Bundled version, ideal for direct browser usage via script tag
- `pixalo.esm.js`: ES modules version, best for modern JavaScript projects using module bundlers
- `pixalo.umd.js`: Universal Module Definition version, supports both AMD and CommonJS environments
- Direct source import: Useful during development or when you want to import directly from source files

### Basic Usage

```javascript
import Pixalo from './src/Pixalo.js';

// Initialize the engine
const game = new Pixalo('#canvas', {
    width: 800,
    height: 600,
    fps: 60
});

// Start the game loop
game.start();
```

## 🛠️ Core Components

### Canvas Management

```javascript
// Set canvas quality
game.quality(2); // 2x high resolution

// Take a screenshot
game.shot({
    format: 'png',
    quality: 1.0,
    download: true
});
```

### [Entity](https://github.com/pixalo/pixalo/wiki/Entity) System

```javascript
// Create and add an entity
const player = game.append('player', {
    x: 100,
    y: 100,
    width: 32,
    height: 32,
    hoverable: true,
    clickable: true,
    draggable: true
});
```

### Asset Management

```javascript
// Load an image asset
game.loadAsset('image', 'player-sprite', 'path/to/sprite.png');

// Load a sprite sheet
game.loadAsset('spritesheet', 'player-animations', 'path/to/spritesheet.png', {
    columns: 8,
    rows: 4,
    width: 32,
    height: 32
});

// Load audio
game.loadAsset('audio', 'background-music', 'path/to/music.mp3', {
    volume: 0.8,
    loop: true
});
```

## 🎨 Visual Features

### Background Layers

```javascript
// Add parallax background
pixalo.addBackground('background', {
    repeat : 'x', // y or both
    speed  : { x: 10, y: 0 },
    zIndex : 1,
    opacity: 0.8
});
```

### Grid System

```javascript
// Enable and configure grid
game.enableGrid();
game.setGridSize(64, 32);
game.setGridColors('#333333', '#666666');
```

### [Tile Maps](https://github.com/pixalo/pixalo/wiki/TileMap)

```javascript
// Create a tile map
const tilemap = game.createTileMap({
    layers: {
        ground: game.tileMap.fillBoxWith('G'),
        objects: [
            'WWWWWWWWWWWWWWWWWWW',
            'W                 W',
            'W     B     T     W',
            'W   T    B        W',
            'W         T     B W',
            'W     B           W',
            'W T       B     T W',
            'WWWWWWWWWWWWWWWWWWW'
        ]
    },
    tiles: {
        G: 'tiles.grass',
        W: {
            tile: 'tiles.wall',
            collision: {
                type: 'solid',
                bounds: [0, 0, 32, 32]
            },
            frames: ['tiles.bush', 'tiles.wall'],
            frameRate: 2,
            loop: true
        },
        B: {
            tile: 'tiles.bush',
            collision: {
                type: 'trigger',
                bounds: [3, 8, 26, 24], // x, y, width, height
                onCollide: (data) => {
                    console.log('Triggered!', data);
                }
            }
        },
        T: {
            tile: 'tiles.tree',
            collision: {
                type: 'solid',
                bounds: [4, -19, 25, 51], // x, y, width, height
            },
            parts: [
                {
                    tile: 'tiles.headTree',
                    offsetY: -1
                }
            ]
        }
    }
});

game.renderTileMap(tilemap);

for (let i = 0; i < 20; i++) {
    game.addTile('objects', 'T', i, 8);
}
```

## 🔧 Debug Mode

```javascript
// Enable debug mode
game.enableDebugger();

// Log debug information
game.log('Debug message');
game.info('Info message');
game.warn('Warning message');
game.error('Error message');
```

## 🎵 [Audio](https://github.com/pixalo/pixalo/wiki/AudioManager) System

```javascript
await game.audio.play('sound-effect', {
    volume: 0.8,
    loop: false
});
```

## 🔄 Event System

```javascript
// Listen for events
game.on('update', (deltaTime) => {
    // Update game logic
});

let isDragging = false;
let lastScreenPos = null;

game.on(['mousedown', 'touchstart'], event => {
    isDragging = true;
    lastScreenPos = {x: event.screenX, y: event.screenY};
});
game.on(['mouseup', 'touchend'], event => {
    isDragging = false;
    lastScreenPos = null;
    game.camera.follow(player);
});
game.on(['mousemove', 'touchmove'], event => {
    if (!isDragging || !lastScreenPos || event.identifier) return;

    const dx = event.screenX - lastScreenPos.x;
    const dy = event.screenY - lastScreenPos.y;

    game.camera.cancelFollow().moveBy(-dx, -dy, true);

    lastScreenPos = {x: event.screenX, y: event.screenY};
});
```

## 📚 Documentation

For detailed documentation and examples, please visit our [wiki](https://github.com/pixalo/pixalo/wiki).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/pixalo/pixalo/blob/main/LICENSE) file for details.

## 🌟 Support

If you like this project, please give it a star ⭐️