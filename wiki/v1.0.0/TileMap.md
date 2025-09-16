The TileMap class is a comprehensive tile-based map system for 2D games that handles layer management, tile rendering, collision detection, and tile animations. It provides powerful features for creating complex game worlds with multiple layers, animated tiles, and various collision types including solid, platform, and trigger collisions.

## Public Methods

### create(config): Object
Creates and initializes a tilemap with the provided configuration including layers and tiles definitions.

| Name | Type | Default |
|------|------|---------|
| config | Object | - |

**Config Object Structure:**
```javascript
{
  layers: {
    "layerName": [
      "ABC",     // String format (each character is a tile symbol)
      "DEF",
      "GHI"
    ],
    "anotherLayer": [
      ['A', 'B', 'C'],  // Array format
      ['D', 'E', 'F'],
      ['G', 'H', 'I']
    ]
  },
  tiles: {
    "A": "assetId.tileName",  // Simple tile definition
    "B": {                    // Advanced tile definition
      tile: "assetId.tileName",
      collision: {
        type: "solid",        // "solid", "platform", "trigger"
        bounds: [0, 0, 32, 32], // [x, y, width, height]
        onCollide: function(data) {
          // Collision callback
          // data: { entity, tile, position, layer, collisionType, side, amount }
        },
        onCollisionEnd: function(data) {
          // Collision end callback
          // data: { entity, tile, position, layer }
        }
      }
    },
    "C": {                    // Animated tile
      tile: "assetId.tileName",
      frames: ["asset.frame1", "asset.frame2", "asset.frame3"],
      frameRate: 8,           // frames per second
      loop: true              // whether to loop animation
    },
    "D": {                    // Composite tile with parts
      tile: "assetId.baseTile",
      parts: [
        {
          tile: "assetId.partTile",
          offsetX: 1,         // offset in tile units
          offsetY: 0,
          collision: {        // each part can have its own collision
            type: "trigger",
            bounds: [8, 8, 16, 16]
          }
        }
      ]
    }
  }
}
```

**Usage Example:**
```javascript
const mapConfig = {
  layers: {
    background: [
      "GGGG",
      "GGGG",
      "SSSS"
    ],
    foreground: [
      "    ",
      " PB ",
      "    "
    ]
  },
  tiles: {
    "G": "terrain.grass",
    "S": {
      tile: "terrain.stone",
      collision: {
        type: "solid",
        bounds: [0, 0, 32, 32]
      }
    },
    "P": {
      tile: "objects.platform",
      collision: {
        type: "platform",
        bounds: [0, 0, 32, 8]
      }
    },
    "B": {
      tile: "effects.fire1",
      frames: ["effects.fire1", "effects.fire2", "effects.fire3"],
      frameRate: 6,
      loop: true
    }
  }
};

const result = game.tileMap.create(mapConfig);
```

### update(): void
Updates the tilemap system including collision detection for all entities and tile animations.

> [!NOTE]
> This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do customization elsewhere.

**Usage Example:**
```javascript
// Called automatically by the engine, but can be called manually
game.tileMap.update();
```

### render(tilemap): void
Renders all visible tiles from all layers to the canvas with camera culling and pixel-perfect rendering.

> [!NOTE]
> This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do customization elsewhere.

| Name | Type | Default |
|------|------|---------|
| tilemap | Object | - |

**Usage Example:**
```javascript
// Usually called automatically by the engine
const tilemap = game.tileMap.create(config);
game.tileMap.render(tilemap);
```

### addTile(layer, symbol, x, y): TileMap
Adds a single tile to the specified layer at the given coordinates.

| Name | Type | Default |
|------|------|---------|
| layer | string | - |
| symbol | string | - |
| x | number | 0 |
| y | number | 0 |

**Usage Example:**
```javascript
game.tileMap.addTile("foreground", "G", 5, 3);
game.tileMap.addTile("background", "S", 2, 4);
```

### getTilesAt(x, y): Array
Returns an array of all tiles at the specified world coordinates from all layers.

| Name | Type | Default |
|------|------|---------|
| x | number | - |
| y | number | - |

**Usage Example:**
```javascript
const tiles = game.tileMap.getTilesAt(64, 96);
tiles.forEach(tile => {
  console.log(`Found tile: ${tile.symbol} on layer: ${tile.layer}`);
});
```

### getTileAt(x, y, layer): Object|null
Returns a single tile at the specified world coordinates. If layer is specified, searches only that layer; otherwise returns the first tile found.

| Name | Type | Default |
|------|------|---------|
| x | number | - |
| y | number | - |
| layer | string | null |

**Usage Example:**
```javascript
const tile = game.tileMap.getTileAt(64, 96, "foreground");
if (tile) {
  console.log(`Tile: ${tile.symbol} at (${tile.x}, ${tile.y})`);
}

// Get from any layer
const anyTile = game.tileMap.getTileAt(64, 96);
```

### getTileInfo(tileReference): Object|null
Parses a tile reference string and returns asset ID and tile name information.

| Name | Type | Default |
|------|------|---------|
| tileReference | string | - |

**Usage Example:**
```javascript
const info = game.tileMap.getTileInfo("terrain.grass");
// Returns: { assetId: "terrain", tileName: "grass" }
```

### getTileSize(tileReference): number
Returns the size of a tile. If no reference is provided or tile is not found, returns the default tile size.

| Name | Type | Default |
|------|------|---------|
| tileReference | string | - |

**Usage Example:**
```javascript
const size = game.tileMap.getTileSize("terrain.grass");
console.log(`Tile size: ${size}px`);
```

### getCurrentTileFrame(symbol): string|null
Returns the current frame reference for an animated tile.

| Name | Type | Default |
|------|------|---------|
| symbol | string | - |

**Usage Example:**
```javascript
const currentFrame = game.tileMap.getCurrentTileFrame("B");
if (currentFrame) {
  console.log(`Current animation frame: ${currentFrame}`);
}
```

### fillBoxWith(symbol): Array
Creates a grid filled with the specified symbol that covers the entire canvas area.

| Name | Type | Default |
|------|------|---------|
| symbol | string | - |

**Usage Example:**
```javascript
const grassBackground = game.tileMap.fillBoxWith("G");
// Use this grid in layer configuration
```

### fillWith(symbol, count): Array
Creates an array filled with the specified symbol for the given count.

| Name | Type | Default |
|------|------|---------|
| symbol | string | - |
| count | number | - |

**Usage Example:**
```javascript
const grassRow = game.tileMap.fillWith("G", 10);
// Returns: ["G", "G", "G", "G", "G", "G", "G", "G", "G", "G"]
```

### exportLayers(layer): string
Exports layer data as a JSON string. If layer parameter is provided, exports only that layer; otherwise exports all layers.

| Name | Type | Default |
|------|------|---------|
| layer | string | undefined |

**Usage Example:**
```javascript
// Export all layers
const allLayers = game.tileMap.exportLayers();
console.log(allLayers);

// Export specific layer
const backgroundLayer = game.tileMap.exportLayers("background");
console.log(backgroundLayer);
```

## Animation System

Animated tiles support:
- Multiple animation frames
- Configurable frame rate (frames per second)
- Loop control (infinite or play-once)
- Automatic frame progression during updates

## Layer Management

- Multiple layers with independent tile grids
- String or array format support for layer definition
- Dynamic layer creation when adding tiles
- Layer-specific tile queries and operations

## Events

### Event Flow

1. **Collision Detection**: During `update()`, the class checks for collisions between entities and tiles
2. **Direct Callback Execution**: When collision conditions are met, callbacks are executed immediately
3. **No Event Queue**: There's no event queuing or asynchronous event handling
4. **Immediate Response**: All collision responses happen synchronously during the collision check

### Collision Types and Events

#### Solid Collision
- **onCollide**: Called when entity hits a solid tile
- **onCollisionEnd**: Called when entity stops touching the solid tile
- **Behavior**: Entity position is automatically adjusted to prevent overlap

#### Platform Collision  
- **onCollide**: Called only when entity approaches from above (`side === "bottom"`)
- **onCollisionEnd**: Called when entity leaves the platform area
- **Behavior**: Entity can pass through from below and sides

#### Trigger Collision
- **onCollide**: Called when entity enters trigger area
- **onCollisionEnd**: Called when entity leaves trigger area  
- **Behavior**: No position adjustment, only callback execution