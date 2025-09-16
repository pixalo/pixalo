The `Pixalo` class is the most important class.
- ⚠️ This class provides everything from initialization to full access to all `Pixalo` features.
- ⚡ To render and start building a game, you need to fully learn this class.
- 🪄 Using this class is very easy.

# Getting Start
```js
const game = new Pixalo('#canvas', {
    width: 800,
    height: 600,
    fps: 60,
    quality: 2,
    background: 'transparent',
    resizeTarget: 'window',
    grid: GridConfig{}|Boolean,           // See Grid class documentation
    collision: CollisionConfig{}|Boolean, // See Collision class documentation
    physics: PhysicsConfig{}|Boolean,     // See Physics class documentation
    camera: CameraConfig{}|Undefined      // See Camera class documentation
});
```

### Key Points
- `Flexibility`: Most parameters are optional and come with default values.
- `Configuration Merging`: If selector is an object, it will be merged with the config.
- `Worker Environment`: The worker parameter is automatically detected.
- `Advanced Settings`: Each of the [`grid`](https://github.com/pixalo/pixalo/wiki/Grid), [`physics`](https://github.com/pixalo/pixalo/wiki/Physics), [`collision`](https://github.com/pixalo/pixalo/wiki/Collision), and [`camera`](https://github.com/pixalo/pixalo/wiki/Camera) systems can be defined as complex objects with detailed configurations.

> An initialization is performed here. Note that the `game` variable is used throughout the documentation examples and is associated with this class.

# Quick Access
- [Public Methods](#public-methods)
- [Constants](#constants)

# Public Methods

## Quality Control

### `quality(value)`: Number | Pixalo
Gets or sets the rendering quality multiplier for the canvas.

| Name | Type | Default |
|------|------|---------|
| value | Number | undefined |

**Usage Examples:**
```javascript
// Get current quality
const currentQuality = game.quality();

// Set quality to 2x for high DPI displays
game.quality(2);
```

---

## Event System

### `on(eventName, callback)`: Pixalo
Registers an event listener for specified event(s).

| Name | Type | Default |
|------|------|---------|
| eventName | String\|Array\|Object | - |
| callback | Function | - |

**Usage Examples:**
```javascript
// Single event
game.on('ready', () => console.log('Engine ready!'));

// Multiple events
game.on(['start', 'stop'], (data) => console.log('Game state changed'));

// Object notation
game.on({
    'ready': () => console.log('Ready'),
    'update': (deltaTime) => console.log('Update:', deltaTime)
});
```

### `one(eventName, callback)`: Pixalo
Registers a one-time event listener that automatically removes itself after first execution.

| Name | Type | Default |
|------|------|---------|
| eventName | String\|Array\|Object | - |
| callback | Function | - |

**Usage Examples:**
```javascript
// Single one-time event
game.one('ready', () => console.log('This runs only once'));

// Multiple one-time events
game.one(['start', 'render'], () => console.log('First occurrence'));
```

### `trigger(eventName, data)`: Pixalo
Triggers all listeners registered for the specified event(s).

| Name | Type | Default |
|------|------|---------|
| eventName | String\|Array | - |
| data | Any | undefined |

**Usage Examples:**
```javascript
// Trigger single event
game.trigger('custom-event', { score: 100 });

// Trigger multiple events
game.trigger(['game-over', 'save-score'], playerData);
```

### `off(eventName, callback)`: Pixalo
Removes an event listener from specified event(s).

| Name | Type | Default |
|------|------|---------|
| eventName | String\|Array | - |
| callback | Function | - |

**Usage Examples:**
```javascript
const handler = () => console.log('Handler');
game.on('update', handler);

// Remove specific handler
game.off('update', handler);

// Remove from multiple events
game.off(['start', 'stop'], handler);
```

---

## Timer System

### `timer(callback, delay, repeat = true)`: Symbol
Creates a repeating timer that executes a callback at specified intervals.

| Name | Type | Default |
|------|------|---------|
| callback | Function | - |
| delay | Number | - |
| repeat | Boolean | true |

**Usage Examples:**
```javascript
// Repeating timer (every 1000ms)
const timerId = game.timer(() => {
    console.log('Timer tick');
}, 1000);

// One-time timer
const oneTimeId = game.timer(() => {
    console.log('Execute once');
}, 2000, false);
```

### `timeout(callback, delay)`: void
Creates a one-time timer that executes a callback after specified delay.

| Name | Type | Default |
|------|------|---------|
| callback | Function | - |
| delay | Number | - |

**Usage Examples:**
```javascript
// Execute after 3 seconds
game.timeout(() => {
    console.log('3 seconds passed');
}, 3000);
```

### `clearTimer(timerId)`: Boolean
Removes a timer by its ID.

| Name | Type | Default |
|------|------|---------|
| timerId | Symbol | - |

**Usage Examples:**
```javascript
const timerId = game.timer(() => console.log('tick'), 1000);
// Later...
game.clearTimer(timerId);
```

### `delay(ms)` (async): Promise<void>
Returns a Promise that resolves after specified milliseconds.

| Name | Type | Default |
|------|------|---------|
| ms | Number | - |

**Usage Examples:**
```javascript
// Using with async/await
async function gameSequence() {
    console.log('Starting...');
    await game.delay(2000);
    console.log('2 seconds later');
}

// Using with .then()
game.delay(1000).then(() => {
    console.log('1 second passed');
});
```

---

## [Background](https://github.com/pixalo/pixalo/wiki/Background) Management

### `addBackground(source, config = {})`: Pixalo
Adds a background layer with specified source and configuration.

| Name | Type | Default |
|------|------|---------|
| source | String\|Image | - |
| config | Object | {} |

**Usage Examples:**
```javascript
// Simple background
game.addBackground('background.jpg');

// Background with configuration
game.addBackground('sky', {
    id: 'sky',
    parallax: 0.5,
    repeat: true
});
```

### `removeBackground(layerId)`: Pixalo
Removes a background layer by its ID.

| Name | Type | Default |
|------|------|---------|
| layerId | String | - |

**Usage Examples:**
```javascript
game.removeBackground('sky');
```

### `updateBackground(layerId, config)`: Pixalo
Updates configuration of an existing background layer.

| Name | Type | Default |
|------|------|---------|
| layerId | String | - |
| config | Object | - |

**Usage Examples:**
```javascript
game.updateBackground('sky', {
    parallax: 0.8,
    opacity: 0.5
});
```

### `clearBackgrounds()`: Pixalo
Removes all background layers.

**Usage Examples:**
```javascript
game.clearBackgrounds();
```

### `getBackground(layerId)`: Pixalo
Retrieves a background layer by its ID.

| Name | Type | Default |
|------|------|---------|
| layerId | String | - |

**Usage Examples:**
```javascript
const skyLayer = game.getBackground('sky');
```

### `setBackgroundOrder(layerId, zIndex)`: Pixalo
Sets the rendering order of a background layer.

| Name | Type | Default |
|------|------|---------|
| layerId | String | - |
| zIndex | Number | - |

**Usage Examples:**
```javascript
game.setBackgroundOrder('mountains', 1);
game.setBackgroundOrder('clouds', 2);
```

### `setBackgroundVisible(layerId, visible)`: Pixalo
Sets the visibility of a background layer.

| Name | Type | Default |
|------|------|---------|
| layerId | String | - |
| visible | Boolean | - |

**Usage Examples:**
```javascript
// Hide background
game.setBackgroundVisible('rain', false);
// Show background
game.setBackgroundVisible('rain', true);
```

---

## [Grid](https://github.com/pixalo/pixalo/wiki/Grid) System

### `enableGrid()`: Pixalo
Enables the grid system for rendering.

**Usage Examples:**
```javascript
game.enableGrid();
```

### `disableGrid()`: Pixalo
Disables the grid system rendering.

**Usage Examples:**
```javascript
game.disableGrid();
```

### `toggleGrid()`: Pixalo
Toggles the grid system on/off.

**Usage Examples:**
```javascript
// Toggle grid visibility
game.toggleGrid();
```

### `setGridSize(width, height = width)`: Pixalo
Sets the size of grid cells.

| Name | Type | Default |
|------|------|---------|
| width | Number | - |
| height | Number | width |

**Usage Examples:**
```javascript
// Square grid cells (32x32)
game.setGridSize(32);

// Rectangular grid cells (32x64)
game.setGridSize(32, 64);
```

### `setGridColors(color, majorColor)`: Pixalo
Sets the colors for grid lines and major grid lines.

| Name | Type | Default |
|------|------|---------|
| color | String | - |
| majorColor | String | - |

**Usage Examples:**
```javascript
game.setGridColors('#cccccc', '#333333');
```

### `setGridLineWidth(lineWidth, majorLineWidth)`: Pixalo
Sets the line width for grid lines and major grid lines.

| Name | Type | Default |
|------|------|---------|
| lineWidth | Number | - |
| majorLineWidth | Number | - |

**Usage Examples:**
```javascript
game.setGridLineWidth(1, 2);
```

### `setMajorGrid(every, color, lineWidth)`: Pixalo
Configures major grid lines that appear every N cells.

| Name | Type | Default |
|------|------|---------|
| every | Number | - |
| color | String | - |
| lineWidth | Number | - |

**Usage Examples:**
```javascript
// Major grid line every 10 cells
game.setMajorGrid(10, '#ff0000', 3);
```

### `setGridBounds(bounds)`: Pixalo
Sets the boundaries where grid should be rendered.

| Name | Type | Default |
|------|------|---------|
| bounds | Object | - |

**Usage Examples:**
```javascript
game.setGridBounds({
    x: 0, y: 0,
    width: 1000, height: 800
});
```

### `setGridOrigin(x, y)`: Pixalo
Sets the origin point for grid rendering.

| Name | Type | Default |
|------|------|---------|
| x | Number | - |
| y | Number | - |

**Usage Examples:**
```javascript
game.setGridOrigin(100, 100);
```

### `setGridVisibilityRange(minZoom, maxZoom)`: Pixalo
Sets the zoom range where grid is visible.

| Name | Type | Default |
|------|------|---------|
| minZoom | Number | - |
| maxZoom | Number | - |

**Usage Examples:**
```javascript
// Grid visible between 0.5x and 2x zoom
game.setGridVisibilityRange(0.5, 2);
```

### `snapToGrid(x, y)`: Object
Snaps coordinates to the nearest grid intersection.

| Name | Type | Default |
|------|------|---------|
| x | Number | - |
| y | Number | - |

**Usage Examples:**
```javascript
const snapped = game.snapToGrid(157, 243);
// Returns nearest grid coordinates
```

### `getGridCell(x, y)`: Object
Gets the grid cell coordinates for given world coordinates.

| Name | Type | Default |
|------|------|---------|
| x | Number | - |
| y | Number | - |

**Usage Examples:**
```javascript
const cell = game.getGridCell(100, 200);
// Returns {x: cellX, y: cellY}
```

### `cellToWorld(cellX, cellY)`: Object
Converts grid cell coordinates to world coordinates.

| Name | Type | Default |
|------|------|---------|
| cellX | Number | - |
| cellY | Number | - |

**Usage Examples:**
```javascript
const worldPos = game.cellToWorld(5, 10);
// Returns world coordinates for cell (5, 10)
```

---

## Game Loop Control

### `start()`: Pixalo
Starts the game loop and resumes all timers and audio.

**Usage Examples:**
```javascript
game.start();
```

### `stop()`: Pixalo
Stops the game loop and pauses all timers and audio.

**Usage Examples:**
```javascript
game.stop();
```

### `clear()`: void
Clears the canvas and fills it with background color.

**Usage Examples:**
```javascript
game.clear();
```

### `reset()`: void
Resets the engine state, clearing all entities, events, and timers.

**Usage Examples:**
```javascript
// Complete engine reset
game.reset();
```

---

## Debug System

### `enableDebugger()`: Pixalo
Enables the debug overlay and entity debug visualization.

**Usage Examples:**
```javascript
game.enableDebugger();
```

### `disableDebugger()`: Pixalo
Disables the debug overlay and entity debug visualization.

**Usage Examples:**
```javascript
game.disableDebugger();
```

### `log(...args)`: Pixalo
Logs debug information to console (only when debugger is active).

| Name | Type | Default |
|------|------|---------|
| ...args | Any | - |

**Usage Examples:**
```javascript
game.log('Player position:', player.x, player.y);
```

### `info(...args)`: Pixalo
Logs info message to console (only when debugger is active).

| Name | Type | Default |
|------|------|---------|
| ...args | Any | - |

**Usage Examples:**
```javascript
game.info('Game started successfully');
```

### `warn(...args)`: Pixalo
Logs warning message to console (only when debugger is active).

| Name | Type | Default |
|------|------|---------|
| ...args | Any | - |

**Usage Examples:**
```javascript
game.warn('Low performance detected');
```

### `error(...args)`: Pixalo
Logs error message to console (only when debugger is active).

| Name | Type | Default |
|------|------|---------|
| ...args | Any | - |

**Usage Examples:**
```javascript
game.error('Failed to load asset:', assetId);
```

---

## Asset Management

### `loadAsset(type, id, src, config = {})` (async): Promise<Object>
Loads an asset (image, spritesheet, tiles, or audio) asynchronously.

| Name | Type | Default |
|------|------|---------|
| type | String | - |
| id | String | - |
| src | String | - |
| config | Object | {} |

**Usage Examples:**
```javascript
// Load image
await game.loadAsset('image', 'player', 'path/player.png');

// Load spritesheet
await game.loadAsset('spritesheet', 'character', 'path/char.png', {
    columns: 4, rows: 2, width: 32, height: 32
});

// Load tileset
await game.loadAsset('tiles', 'terrain', 'path/tiles.png', {
    tileSize: 32,
    tiles: {
        grass: [0, 0],
        stone: [1, 0]
    }
});

// Load audio
await game.loadAsset('audio', 'bgm', 'music.mp3', {
    loop: true, volume: 0.8
});
```

### `getAsset(id)`: Object | null
Retrieves a loaded asset by its ID.

| Name | Type | Default |
|------|------|---------|
| id | String | - |

**Usage Examples:**
```javascript
const playerAsset = game.getAsset('player');
```

### `deleteAsset(id)`: Pixalo
Removes an asset from memory.

| Name | Type | Default |
|------|------|---------|
| id | String | - |

**Usage Examples:**
```javascript
game.deleteAsset('old-texture');
```

### `clearAssets()`: Pixalo
Removes all loaded assets from memory.

**Usage Examples:**
```javascript
// Clear all assets (useful for level transitions)
game.clearAssets();
```

---

## [Entity](https://github.com/pixalo/pixalo/wiki/Entity) Management

### `defineAnimation(name, keyframes, options = {})`: Pixalo
Defines a reusable animation that can be applied to entities.

| Name | Type | Default |
|------|------|---------|
| name | String | - |
| keyframes | Array | - |
| options | Object | {} |

**Usage Examples:**
```javascript
game.defineAnimation('fadeIn', [
    { opacity: 0, offset: 0 },
    { opacity: 1, offset: 1 }
], {
    duration: 1000,
    easing: 'ease-in-out'
});
```

### `append(id, config = {})`: [Entity](https://github.com/pixalo/pixalo/wiki/Entity)
Creates and adds an entity to the game world.

| Name | Type | Default |
|------|------|---------|
| id | String\|Entity | - |
| config | Object | {} |

**Usage Examples:**
```javascript
const player = game.append('player', {
    x: 100, y: 100,
    width: 32, height: 32
});
```

### `getAllEntities()`: Map
Returns a Map of all entities in the game world.

**Usage Examples:**
```javascript
const entities = game.getAllEntities();
console.log(`Total entities: ${entities.size}`);
```

### `getSortedEntitiesByZIndex()`: Array
Returns an array of entities sorted by their z-index (back to front).

**Usage Examples:**
```javascript
const sortedEntities = game.getSortedEntitiesByZIndex();
// Entities ordered by rendering depth
```

### `find(entityId)`: [Entity](https://github.com/pixalo/pixalo/wiki/Entity) | undefined
Finds and returns an entity by its ID.

| Name | Type | Default |
|------|------|---------|
| entityId | String | - |

**Usage Examples:**
```javascript
const player = game.find('player');
if (player) {
    player.move(10, 0);
}
```

### `findByClass(className)`: Array
Finds all entities that have the specified CSS class.

| Name | Type | Default |
|------|------|---------|
| className | String | - |

**Usage Examples:**
```javascript
const enemies = game.findByClass('enemy');
enemies.forEach(enemy => enemy.kill());
```

### `isEntity(target)`: Boolean
Checks if the given object is an Entity instance.

| Name | Type | Default |
|------|------|---------|
| target | Any | - |

**Usage Examples:**
```javascript
if (game.isEntity(someObject)) {
    someObject.show();
}
```

### `kill(entityId)`: Boolean
Removes an entity from the game world.

| Name | Type | Default |
|------|------|---------|
| entityId | String | - |

**Usage Examples:**
```javascript
// Remove enemy entity
game.kill('enemy-1');
```

---

## Collision System

### `enableCollisions()`: Pixalo
Enables the collision detection system.

**Usage Examples:**
```javascript
game.enableCollisions();
```

### `disableCollisions()`: Pixalo
Disables the collision detection system.

**Usage Examples:**
```javascript
game.disableCollisions();
```

### `checkCollision(entity1, entity2)`: Object | Boolean
Checks collision between two specific entities.

| Name | Type | Default |
|------|------|---------|
| entity1 | Entity | - |
| entity2 | Entity | - |

**Usage Examples:**
```javascript
const player = game.find('player');
const enemy = game.find('enemy');
const collision = game.checkCollision(player, enemy);

if (collision) {
    console.log('Collision detected!');
}
```

### `checkGroupCollision(group1, group2)`: Object | Boolean
Checks collisions between two groups of entities.

| Name | Type | Default |
|------|------|---------|
| group1 | Array | - |
| group2 | Array | - |

**Usage Examples:**
```javascript
const bullets = game.findByClass('bullet');
const enemies = game.findByClass('enemy');
const collision = game.checkGroupCollision(bullets, enemies);

if (collision) {
    game.kill(collision.entity1.id);
    game.kill(collision.entity2.id);
}
```

---

## Tile Map System

### `createTileMap(config)`: Object
Creates a new tile map with specified configuration.

| Name | Type | Default |
|------|------|---------|
| config | Object | - |

**Usage Examples:**
```javascript
const tileMap = game.createTileMap({
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
       // ...
    }
});
```

### `renderTileMap(tilemap)`: Pixalo
Sets the active tile map for rendering.

| Name | Type | Default |
|------|------|---------|
| tilemap | Object | - |

**Usage Examples:**
```javascript
game.renderTileMap(tileMap);
```

### `addTile(layer, symbol, x = 0, y = 0)`: Pixalo
Adds a tile to the specified layer at given coordinates.

| Name | Type | Default |
|------|------|---------|
| layer | String | - |
| symbol | String | - |
| x | Number | 0 |
| y | Number | 0 |

**Usage Examples:**
```javascript
// Add grass tile at position (5, 3)
game.addTile('ground', 'grass', 5, 3);

// Add tile at origin
game.addTile('background', 'sky');
```

### `exportTileMap(layer)`: Object
Exports tile map data for specified layer or all layers.

| Name | Type | Default |
|------|------|---------|
| layer | String | - |

**Usage Examples:**
```javascript
// Export specific layer
const groundData = game.exportTileMap('ground');

// Export all layers
const allData = game.exportTileMap();
```

---

## [Particle](https://github.com/pixalo/pixalo/wiki/Particle) System

### `createEmitter(id, config)`: Object
Creates a particle emitter with specified configuration.

| Name | Type | Default |
|------|------|---------|
| id | String | - |
| config | Object | - |

**Usage Examples:**
```javascript
const explosion = game.createEmitter('explosion', {
    x: 200, y: 150,
    particleCount: 50,
    speed: { min: 100, max: 300 },
    life: 2000,
    color: '#ff6600'
});

// Start emitting
explosion.start();
```

---

## Screenshot System

### `shot(options = {})`: Object | Promise<Object>
Takes a screenshot of the current canvas state.

| Name | Type | Default |
|------|------|---------|
| options | Object | {} |

**Options Object Properties:**
- `format`: String ('png', 'jpeg', 'webp') - Default: 'png'
- `quality`: Number (0-1) - Default: 1.0
- `backgroundColor`: String - Default: engine background
- `download`: Boolean - Default: false
- `filename`: String - Default: auto-generated

**Usage Examples:**
```javascript
// Simple screenshot
const screenshot = game.shot();
console.log(screenshot.dataURL);

// High quality JPEG with download
game.shot({
    format: 'jpeg',
    quality: 0.9,
    download: true,
    filename: 'game-screenshot'
});

// Custom background
const shot = game.shot({
    backgroundColor: '#000000',
    format: 'png'
});

// Clean up blob URL when done
shot.revoke();
```

---

## Canvas Management

### `resize(width, height)`: Pixalo
Manually resizes the canvas to specified dimensions.

| Name | Type | Default |
|------|------|---------|
| width | Number | - |
| height | Number | - |

**Usage Examples:**
```javascript
// Resize canvas to 1024x768
game.resize(1024, 768);
```

---

## Input System

### `isPointInEntity(x, y, entity)`: Boolean
Checks if a point (x, y) is inside the specified entity's bounds.

| Name | Type | Default |
|------|------|---------|
| x | Number | - |
| y | Number | - |
| entity | Entity | - |

**Usage Examples:**
```javascript
const player = game.find('player');
const isInside = game.isPointInEntity(100, 150, player);
if (isInside) {
    console.log('Point is inside player entity');
}
```

---

## Color Utilities

### `hexToRgb(hex)`: Object | null
Converts a hexadecimal color to RGB object.

| Name | Type | Default |
|------|------|---------|
| hex | String | - |

**Usage Examples:**
```javascript
const rgb = game.hexToRgb('#ff6600');
// Returns: {r: 255, g: 102, b: 0}
```

### `rgbToHex(r, g, b)`: String
Converts RGB values to hexadecimal color string.

| Name | Type | Default |
|------|------|---------|
| r | Number | - |
| g | Number | - |
| b | Number | - |

**Usage Examples:**
```javascript
const hex = game.rgbToHex(255, 102, 0);
// Returns: '#ff6600'
```

### `hslToRgb(h, s, l)`: Object
Converts HSL values to RGB object.

| Name | Type | Default |
|------|------|---------|
| h | Number | - |
| s | Number | - |
| l | Number | - |

**Usage Examples:**
```javascript
const rgb = game.hslToRgb(0.6, 0.8, 0.5);
// Returns: {r: 51, g: 153, b: 204}
```

### `randHex(includeAlpha = false)`: String
Generates a random hexadecimal color.

| Name | Type | Default |
|------|------|---------|
| includeAlpha | Boolean | false |

**Usage Examples:**
```javascript
// Random hex color
const color = game.randHex();
// Returns: '#a3b2c1'

// Random hex with alpha
const colorWithAlpha = game.randHex(true);
// Returns: '#a3b2c1ff'
```

### `randRgb(includeAlpha = false)`: String
Generates a random RGB color string.

| Name | Type | Default |
|------|------|---------|
| includeAlpha | Boolean | false |

**Usage Examples:**
```javascript
// Random RGB color
const color = game.randRgb();
// Returns: 'rgb(163, 178, 193)'

// Random RGBA color
const colorWithAlpha = game.randRgb(true);
// Returns: 'rgba(163, 178, 193, 0.75)'
```

### `randHsl(options = {}, includeAlpha = false)`: String
Generates a random HSL color with customizable ranges.

| Name | Type | Default |
|------|------|---------|
| options | Object | {} |
| includeAlpha | Boolean | false |

**Options Object Properties:**
- `hueRange`: Array [min, max] - Default: [0, 360]
- `saturationRange`: Array [min, max] - Default: [0, 100]
- `lightnessRange`: Array [min, max] - Default: [0, 100]

**Usage Examples:**
```javascript
// Random HSL color
const color = game.randHsl();
// Returns: 'hsl(240, 65%, 45%)'

// Custom ranges
const warmColor = game.randHsl({
    hueRange: [0, 60], // Red to yellow
    saturationRange: [70, 100],
    lightnessRange: [40, 70]
});

// With alpha
const colorWithAlpha = game.randHsl({}, true);
// Returns: 'hsla(240, 65%, 45%, 0.8)'
```

### `adjustAlpha(colorString, multiplier)`: String
Adjusts the alpha (opacity) of a color string.

| Name | Type | Default |
|------|------|---------|
| colorString | String | - |
| multiplier | Number | - |

**Usage Examples:**
```javascript
// Make color more transparent
const faded = game.adjustAlpha('rgba(255, 100, 50, 1.0)', 0.5);
// Returns: 'rgba(255, 100, 50, 0.5)'

// Works with hex colors too
const fadedHex = game.adjustAlpha('#ff6432', 0.3);
// Returns: 'rgba(255, 100, 50, 0.15)'
```

---

## Mathematical Utilities

### `getDistance(x1, y1, x2, y2)`: Number
Calculates the Euclidean distance between two points.

| Name | Type | Default |
|------|------|---------|
| x1 | Number | - |
| y1 | Number | - |
| x2 | Number | - |
| y2 | Number | - |

**Usage Examples:**
```javascript
const distance = game.getDistance(0, 0, 100, 100);
// Returns: 141.42135623730952
```

### `randBetween(min, max)`: Number
Generates a random integer between min and max (inclusive).

| Name | Type | Default |
|------|------|---------|
| min | Number | - |
| max | Number | - |

**Usage Examples:**
```javascript
const randomNum = game.randBetween(1, 10);
// Returns: random integer between 1 and 10
```

### `clamp(value, min, max)`: Number
Constrains a value between minimum and maximum bounds.

| Name | Type | Default |
|------|------|---------|
| value | Number | - |
| min | Number | - |
| max | Number | - |

**Usage Examples:**
```javascript
const clamped = game.clamp(150, 0, 100);
// Returns: 100

const clamped2 = game.clamp(-50, 0, 100);
// Returns: 0
```

### `lerp(start, end, amount)`: Number
Performs linear interpolation between two values.

| Name | Type | Default |
|------|------|---------|
| start | Number | - |
| end | Number | - |
| amount | Number | - |

**Usage Examples:**
```javascript
// 50% between 0 and 100
const interpolated = game.lerp(0, 100, 0.5);
// Returns: 50

// Animation interpolation
const position = game.lerp(startX, endX, animationProgress);
```

### `degToRad(degrees)`: Number
Converts degrees to radians.

| Name | Type | Default |
|------|------|---------|
| degrees | Number | - |

**Usage Examples:**
```javascript
const radians = game.degToRad(90);
// Returns: 1.5707963267948966 (π/2)
```

### `radToDeg(radians)`: Number
Converts radians to degrees.

| Name | Type | Default |
|------|------|---------|
| radians | Number | - |

**Usage Examples:**
```javascript
const degrees = game.radToDeg(Math.PI);
// Returns: 180
```

### `getAngle(x1, y1, x2, y2)`: Number
Calculates the angle (in radians) from point 1 to point 2.

| Name | Type | Default |
|------|------|---------|
| x1 | Number | - |
| y1 | Number | - |
| x2 | Number | - |
| y2 | Number | - |

**Usage Examples:**
```javascript
const angle = game.getAngle(0, 0, 100, 100);
// Returns: 0.7853981633974483 (45 degrees in radians)
```

### `rotatePoint(centerX, centerY, pointX, pointY, angle)`: Object
Rotates a point around a center point by specified angle (in degrees).

| Name | Type | Default |
|------|------|---------|
| centerX | Number | - |
| centerY | Number | - |
| pointX | Number | - |
| pointY | Number | - |
| angle | Number | - |

**Usage Examples:**
```javascript
// Rotate point (100, 0) around origin by 90 degrees
const rotated = game.rotatePoint(0, 0, 100, 0, 90);
// Returns: {x: 0, y: 100}
```

---

## Async Utilities

### `wait(...args)` (async): Promise<Array>
Waits for multiple promises to complete and returns their results.

| Name | Type | Default |
|------|------|---------|
| ...args | Promise\|Array\|Any | - |

**Usage Examples:**
```javascript
// Wait for multiple asset loads
const results = await game.wait(
    game.loadAsset('image', 'player', 'player.png'),
    game.loadAsset('audio', 'bgm', 'music.mp3'),
    game.delay(1000)
);

// Wait for nested arrays of promises
const results2 = await game.wait([
    promise1,
    [promise2, promise3],
    promise4
]);
```

---

## Worker Communication

### `workerSend(data = {}, wait_for = null, callback = null)` (async): Pixalo
Sends data to worker thread (only available in worker mode).

| Name | Type | Default |
|------|------|---------|
| data | Object | {} |
| wait_for | String | null |
| callback | Function | null |

**Usage Examples:**
```javascript
// Simple message to worker
game.workerSend({
    action: 'custom_action',
    payload: { score: 100 }
});

// Send and wait for response
game.workerSend({
    action: 'calculate_physics'
}, 'physics_calculated', (response) => {
    console.log('Physics calculated:', response.data);
});
```

# Constants

### Constants accessible through the Pixalo class for mathematical calculations, animations, and utility functions
- [Pixalo.Bezier]()
- [Pixalo.Ease]()