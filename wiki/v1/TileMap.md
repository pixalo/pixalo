The TileMap class provides comprehensive tile-based map creation and management for 2D games. It handles tile rendering,
collision detection, animations, physics integration, and user interactions. The class seamlessly integrates with both
the Collision and Physics systems of the Pixalo game engine.

> [!NOTE]
> TileMap automatically integrates with the active collision or physics system. When Physics is enabled, tiles with
> collision properties become physics entities. When only Collision is enabled, tiles use the collision detection
> system.

## Configuration Object

```javascript
const config = {
    tileBaseSize: 32,              // Base size of tiles in pixels
    overlap: 1,                    // Pixel overlap for seamless rendering

    // Layer definitions
    layers: {
        background: [               // Layer as array of strings
            '##########',
            '#        #',
            '#   P    #',
            '#        #',
            '##########'
        ],
        foreground: [              // Or as array of arrays
            ['#', '#', '#'],
            [' ', 'P', ' '],
            ['#', '#', '#']
        ]
    },

    // Tile definitions
    tiles: {
        '#': 'tileset.wall',             // Simple tile reference
        'P': {                           // Advanced tile configuration
            tile: 'tileset.platform',
            collision: {
                type: 'platform',        // 'solid', 'platform', 'sensor'
                bounds: [0, 0, 32, 16],  // [x, y, width, height]
                side: 'top',             // For platforms: which side is solid
                onCollide: (data) => {}, // Collision callback
                onCollisionEnd: (data) => {}
            },
            physics: {                   // Physics properties (when physics enabled)
                friction: 0.8,
                restitution: 0.2,
                density: 1.0,
                bodyType: 'static'
            },

            // Tile transformations
            rotation: 0,                 // Rotation in degrees
            scale: 1,                    // Uniform scale
            scaleX: 1,                   // Horizontal scale
            scaleY: 1,                   // Vertical scale
            skewX: 0,                    // Horizontal skew
            skewY: 0,                    // Vertical skew

            // Animation support
            frames: ['tile.frame1', 'tile.frame2'], // Animation frames
            frameRate: 8,                // Frames per second
            loop: true,                  // Loop animation
            playing: true,               // Auto-start animation

            // Event handlers
            onClick: (event) => {},      // Click handler
            onRightClick: (event) => {}, // Right-click handler
            onHover: (event) => {},      // Hover enter handler
            onHoverOut: (event) => {},   // Hover exit handler

            // Composite tiles
            parts: [{                    // Additional tile parts
                tile: 'tileset.decoration',
                offsetX: 0,
                offsetY: -16
            }]
        }
    },
}
```

## Public Methods

### `create(name, config): TileMap`

Creates a new tilemap with the specified configuration.

| Name   | Type   | Default | Description                  |
|--------|--------|---------|------------------------------|
| name   | string | -       | Unique name for the tilemap  |
| config | Object | -       | Tilemap configuration object |

**Usage Example:**

```javascript
game.tileMap.create('level1', {
    tiles: {
        '#': 'tileset.wall',
        'P': {
            tile: 'tileset.platform',
            collision: {type: 'platform', side: 'top'}
        }
    },
    layers: {
        main: [
            '#####',
            '#   #',
            '# P #',
            '#####'
        ]
    },
    tileBaseSize: 32
});
```

### `render(tileMap): void`

Activates and renders the specified tilemap.

| Name    | Type   | Default | Description               |
|---------|--------|---------|---------------------------|
| tileMap | string | -       | Name of tilemap to render |

**Usage Example:**

```javascript
game.tileMap.render('level1');
```

### `update(): void`

Updates tile animations and collision detection. Called automatically by the game loop.

> [!NOTE]
> This method is automatically called in the Pixalo class. Manual calls are only needed for custom update loops.

### `addTile(layer, symbol, x, y): TileMap`

Adds a single tile to the specified layer at the given coordinates.

| Name   | Type   | Default | Description             |
|--------|--------|---------|-------------------------|
| layer  | string | -       | Target layer name       |
| symbol | string | -       | Tile symbol from config |
| x      | number | 0       | Tile X coordinate       |
| y      | number | 0       | Tile Y coordinate       |

**Usage Example:**

```javascript
game.tileMap.addTile('main', '#', 5, 3);
game.tileMap.addTile('foreground', 'P', 10, 8);
```

### `removeTile(layer, x, y): TileMap`

Removes a tile from the specified layer at the given coordinates.

| Name  | Type   | Default | Description       |
|-------|--------|---------|-------------------|
| layer | string | -       | Target layer name |
| x     | number | -       | Tile X coordinate |
| y     | number | -       | Tile Y coordinate |

**Usage Example:**

```javascript
game.tileMap.removeTile('main', 5, 3);
```

### `moveTile(oldLayer, oldX, oldY, newLayer, newX, newY): TileMap`

Moves a tile from one position to another, optionally changing layers.

| Name     | Type   | Default | Description              |
|----------|--------|---------|--------------------------|
| oldLayer | string | -       | Source layer name        |
| oldX     | number | -       | Source X coordinate      |
| oldY     | number | -       | Source Y coordinate      |
| newLayer | string | -       | Destination layer name   |
| newX     | number | -       | Destination X coordinate |
| newY     | number | -       | Destination Y coordinate |

**Usage Example:**

```javascript
game.tileMap.moveTile('background', 2, 3, 'foreground', 4, 5);
```

### `getTileInfo(symbol): Array`

Returns information about all tiles with the specified symbol.

| Name   | Type   | Default | Description         |
|--------|--------|---------|---------------------|
| symbol | string | -       | Tile symbol to find |

**Usage Example:**

```javascript
const platforms = game.tileMap.getTileInfo('P');
console.log(`Found ${platforms.length} platforms`);
```

### `getTilesAt(x, y): Array`

Returns all tiles at the specified world coordinates.

| Name | Type   | Default | Description        |
|------|--------|---------|--------------------|
| x    | number | -       | World X coordinate |
| y    | number | -       | World Y coordinate |

**Usage Example:**

```javascript
const tilesUnderPlayer = game.tileMap.getTilesAt(player.x, player.y);
```

### `findTilesIn(worldX, worldY): Array`

Finds all tiles that contain the specified world point, including composite tiles.

| Name   | Type   | Default | Description        |
|--------|--------|---------|--------------------|
| worldX | number | -       | World X coordinate |
| worldY | number | -       | World Y coordinate |

**Usage Example:**

```javascript
const tilesAtPoint = game.tileMap.findTilesIn(mouseX, mouseY);
```

### `findTileByEntityId(entityId): Object|null`

Finds tile data by its physics entity ID.

| Name     | Type   | Default | Description       |
|----------|--------|---------|-------------------|
| entityId | string | -       | Physics entity ID |

**Usage Example:**

```javascript
const tileData = game.tileMap.findTileByEntityId('tile_5_3_main');
```

## Coordinate System Methods

### `tileToWorld(tileX, tileY, mapName): Object`

Converts tile coordinates to world coordinates.

| Name    | Type   | Default   | Description       |
|---------|--------|-----------|-------------------|
| tileX   | number | -         | Tile X coordinate |
| tileY   | number | -         | Tile Y coordinate |
| mapName | string | activeMap | Target map name   |

**Usage Example:**

```javascript
const worldPos = game.tileMap.tileToWorld(5, 3);
console.log(`World position: ${worldPos.x}, ${worldPos.y}`);
```

### `worldToTile(worldX, worldY, mapName): Object`

Converts world coordinates to tile coordinates.

| Name    | Type   | Default   | Description        |
|---------|--------|-----------|--------------------|
| worldX  | number | -         | World X coordinate |
| worldY  | number | -         | World Y coordinate |
| mapName | string | activeMap | Target map name    |

**Usage Example:**

```javascript
const tilePos = game.tileMap.worldToTile(player.x, player.y);
console.log(`Player is on tile: ${tilePos.x}, ${tilePos.y}`);
```

## Layer Management

### `normalizeLayer(layer): Array`

Converts layer data to normalized format (array of arrays).

| Name  | Type  | Default | Description    |
|-------|-------|---------|----------------|
| layer | Array | -       | Raw layer data |

**Usage Example:**

```javascript
const normalized = game.tileMap.normalizeLayer([
    '####',
    '#  #',
    '####'
]);
```

### `exportLayers(layer): string`

Exports layer data as JSON string for saving/loading.

| Name  | Type   | Default | Description                   |
|-------|--------|---------|-------------------------------|
| layer | string | -       | Layer name (optional for all) |

**Usage Example:**

```javascript
const mapData = game.tileMap.exportLayers();
const backgroundData = game.tileMap.exportLayers('background');
```

## Utility Methods

### `fillBoxWith(symbol): Array`

Creates a rectangular grid filled with the specified symbol.

| Name   | Type   | Default | Description    |
|--------|--------|---------|----------------|
| symbol | string | -       | Symbol to fill |

**Usage Example:**

```javascript
const wallGrid = game.tileMap.fillBoxWith('#');
```

### `fillWith(symbol, count): Array`

Creates an array filled with the specified symbol.

| Name   | Type   | Default | Description        |
|--------|--------|---------|--------------------|
| symbol | string | -       | Symbol to fill     |
| count  | number | -       | Number of elements |

**Usage Example:**

```javascript
const wallRow = game.tileMap.fillWith('#', 10);
```

### `getTileSize(tileReference): number`

Gets the size of a specific tile or the base tile size.

| Name          | Type   | Default | Description           |
|---------------|--------|---------|-----------------------|
| tileReference | string | -       | Tile reference string |

**Usage Example:**

```javascript
const size = game.tileMap.getTileSize('tileset.wall');
```

### `getTileBaseSize(mapName): number`

Gets the base tile size for the specified map.

| Name    | Type   | Default   | Description |
|---------|--------|-----------|-------------|
| mapName | string | activeMap | Map name    |

**Usage Example:**

```javascript
const baseSize = game.tileMap.getTileBaseSize('level1');
```

## Animation System

### `getCurrentTileFrame(symbol, tileX, tileY, layer): string|null`

Gets the current animation frame for a tile.

| Name   | Type   | Default | Description       |
|--------|--------|---------|-------------------|
| symbol | string | -       | Tile symbol       |
| tileX  | number | null    | Tile X coordinate |
| tileY  | number | null    | Tile Y coordinate |
| layer  | string | null    | Layer name        |

**Usage Example:**

```javascript
const currentFrame = game.tileMap.getCurrentTileFrame('water', 5, 3, 'main');
```

### `playTileAnimation(symbol, tileX, tileY, layer): TileMap`

Starts animation for the specified tile(s).

| Name   | Type   | Default | Description       |
|--------|--------|---------|-------------------|
| symbol | string | -       | Tile symbol       |
| tileX  | number | null    | Tile X coordinate |
| tileY  | number | null    | Tile Y coordinate |
| layer  | string | null    | Layer name        |

**Usage Example:**

```javascript
// Play all water tile animations
game.tileMap.playTileAnimation('water');

// Play specific tile animation
game.tileMap.playTileAnimation('water', 5, 3, 'main');
```

### `pauseTileAnimation(symbol, tileX, tileY, layer): TileMap`

Pauses animation for the specified tile(s).

| Name   | Type   | Default | Description       |
|--------|--------|---------|-------------------|
| symbol | string | -       | Tile symbol       |
| tileX  | number | null    | Tile X coordinate |
| tileY  | number | null    | Tile Y coordinate |
| layer  | string | null    | Layer name        |

**Usage Example:**

```javascript
game.tileMap.pauseTileAnimation('fire');
```

### `stopTileAnimation(symbol, tileX, tileY, layer): TileMap`

Stops animation and resets to first frame.

| Name   | Type   | Default | Description       |
|--------|--------|---------|-------------------|
| symbol | string | -       | Tile symbol       |
| tileX  | number | null    | Tile X coordinate |
| tileY  | number | null    | Tile Y coordinate |
| layer  | string | null    | Layer name        |

**Usage Example:**

```javascript
game.tileMap.stopTileAnimation('explosion');
```

### `setTileAnimationFrame(symbol, frame, tileX, tileY, layer): TileMap`

Sets the current animation frame.

| Name   | Type   | Default | Description       |
|--------|--------|---------|-------------------|
| symbol | string | -       | Tile symbol       |
| frame  | number | -       | Frame index       |
| tileX  | number | null    | Tile X coordinate |
| tileY  | number | null    | Tile Y coordinate |
| layer  | string | null    | Layer name        |

**Usage Example:**

```javascript
game.tileMap.setTileAnimationFrame('door', 3);
```

### `setTileAnimationSpeed(symbol, frameRate, tileX, tileY, layer): TileMap`

Changes the animation frame rate.

| Name      | Type   | Default | Description       |
|-----------|--------|---------|-------------------|
| symbol    | string | -       | Tile symbol       |
| frameRate | number | -       | Frames per second |
| tileX     | number | null    | Tile X coordinate |
| tileY     | number | null    | Tile Y coordinate |
| layer     | string | null    | Layer name        |

**Usage Example:**

```javascript
game.tileMap.setTileAnimationSpeed('water', 12);
```

## Debug Methods

### `enableTileDebug(): TileMap`

Enables visual debugging for all tiles with collision.

**Usage Example:**

```javascript
game.tileMap.enableTileDebug();
```

### `disableTileDebug(): TileMap`

Disables tile debugging visualization.

**Usage Example:**

```javascript
game.tileMap.disableTileDebug();
```

## Cleanup Methods

### `clear(): void`

Clears the current tilemap state without removing configurations.

**Usage Example:**

```javascript
game.tileMap.clear();
```

### `reset(): void`

Completely resets the tilemap system, removing all maps and state.

**Usage Example:**

```javascript
game.tileMap.reset();
```

### `destroy(): void`

Destroys the tilemap instance and removes all event listeners.

**Usage Example:**

```javascript
game.tileMap.destroy();
```

## Collision Types

### Solid Collision

Creates impassable barriers that stop entity movement.

```javascript
tiles: {
    '#': {
        tile: 'tileset.wall',
        collision: {
            type: 'solid',
            bounds: [0, 0, 32, 32]
        }
    }
}
```

### Platform Collision

Creates one-way platforms that entities can jump through from below.

```javascript
tiles: {
    'P': {
        tile: 'tileset.platform',
        collision: {
            type: 'platform',
            side: 'top',           // Which side is solid
            bounds: [0, 0, 32, 16] // Usually shorter height
        }
    }
}
```

### Sensor Collision

Creates trigger areas that detect entity presence without blocking movement.

```javascript
tiles: {
    'T': {
        tile: 'tileset.trigger',
        collision: {
            type: 'sensor',
            onCollide: (data) => {
                console.log('Entity entered trigger zone!');
            },
            onCollisionEnd: (data) => {
                console.log('Entity left trigger zone!');
            }
        }
    }
}
```

## Advanced Features

### Composite Tiles

Create complex tiles with multiple visual parts.

```javascript
tiles: {
    'D': {
        tile: 'tileset.door_base',
        collision: {
            type: 'solid', 
            bounds: [0, 16, 32, 16] // Only bottom half has collision
        },
        parts: [
            {
                tile: 'tileset.door_top',
                offsetX: 0,
                offsetY: -1  // Render one tile above
            },
            {
                tile: 'tileset.door_decoration',
                offsetX: 0.5,
                offsetY: -0.5
            }
        ]
    }
}
```

### Animated Tiles

Create tiles with frame-based animations.

```javascript
tiles: {
    'W': {
        tile: 'water.frame1',
        frames: [
            'water.frame1',
            'water.frame2',
            'water.frame3',
            'water.frame4'
        ],
        frameRate: 6,           // 6 FPS
        loop: true,
        playing: true,
        collision: {
            type: 'sensor'      // Water is typically a sensor
        }
    }
}
```

### Interactive Tiles

Add click and hover functionality to tiles.

```javascript
tiles: {
    'C': {
        tile: 'tileset.chest',
        onClick: (event) => {
            console.log(`Clicked chest at (${event.tileX}, ${event.tileY})`);
            // Open chest logic here
            event.stopPropagation(); // Prevent event bubbling
        },
        onHover: (event) => {
            console.log('Hovering over chest');
        },
        onHoverOut: (event) => {
            console.log('No longer hovering over chest');
        }
    }
}
```

### Transformed Tiles

Apply visual transformations to tiles.

```javascript
tiles: {
    '/': {
        tile: 'tileset.slope',
        rotation: 45,           // Rotate 45 degrees
        scaleX: -1,            // Flip horizontally
        scaleY: 1,             // Normal vertical scale
        skewX: 15,             // Skew effect
        collision: {
            type: 'solid',
            bounds: [0, 16, 32, 16] // Adjust collision for slope
        }
    }
}
```

## Events

### Tile Events

Each tile can have individual event handlers:

**`onClick(event)`** - Triggered when tile is clicked

- `symbol`: Tile symbol
- `config`: Tile configuration
- `tileX`: Tile X coordinate
- `tileY`: Tile Y coordinate
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `layer`: Layer name
- `screenX`: Screen X coordinate
- `screenY`: Screen Y coordinate
- `originalEvent`: Original mouse/touch event
- `stopPropagation()`: Prevents event from bubbling to other tiles

**`onRightClick(event)`** - Triggered on right-click

- Same properties as onClick

**`onHover(event)`** - Triggered when mouse enters tile

- Same properties as onClick

**`onHoverOut(event)`** - Triggered when mouse leaves tile

- Same properties as onClick

### Collision Events

Tiles can respond to collision events:

**`onCollide(data)`** - Triggered when entity collides with tile

- `entity`: The colliding entity
- `tile`: Tile configuration
- `position`: Collision position `{x, y}`
- `worldX`: World X coordinate
- `worldY`: World Y coordinate
- `layer`: Layer name
- `side`: Collision side ('top', 'bottom', 'left', 'right')
- `amount`: Collision overlap amount

**`onCollisionEnd(data)`** - Triggered when collision ends

- Same properties as onCollide

## Physics Integration

When Physics is enabled, tiles automatically become physics bodies:

```javascript
tiles: {
    '#': {
        tile: 'tileset.wall',
        collision: {
            type: 'solid',
            bounds: [0, 0, 32, 32]
        },
        physics: {
            bodyType: 'static',    // Default for tiles
            friction: 0.8,
            restitution: 0.2,
            density: 1.0,
                
            // Collision filtering
            categoryBits: 0x0002,
            maskBits: 0xFFFF
        }
    }
}
```

### Physics Events Integration

Physics collision events are automatically mapped to tile events:

```javascript
// Physics collision automatically triggers tile collision events
game.on('collisions', (data) => {
    // Data includes entityA, entityB, contact info, etc.
    // If one entity is a tile, tile's onCollide is called
});
```

## Best Practices

### Performance Optimization

```javascript
// Use appropriate tile sizes
const config = {
    tileBaseSize: 32,        // Good balance of detail and performance
    overlap: 1               // Minimal overlap for seamless rendering
};

// Optimize collision bounds
tiles: {
    'P': {
        tile: 'tileset.platform',
        collision: {
            bounds: [2, 0, 28, 8]  // Slightly smaller than visual for better gameplay
        }
    }
}

// Use sensors for non-blocking interactions
tiles: {
    'powerup': {
        tile: 'items.coin',
        collision: {
            type: 'sensor',        // No physics collision, just detection
            onCollide: (data) => {
                // Collect coin logic
                game.tileMap.removeTile(data.layer, data.tileX, data.tileY);
            }
        }
    }
}
```

### Layer Organization

```javascript
const mapConfig = {
    layers: {
        background: backgroundTiles,    // Visual background
        collision: solidTiles,          // Main collision layer
        platforms: platformTiles,       // One-way platforms
        triggers: sensorTiles,          // Invisible triggers
        foreground: decorationTiles,    // Visual foreground
        ui: interfaceTiles              // Interface elements
    }
};
```

### Memory Management

```javascript
// Clear unused maps
game.tileMap.clear();

// Reset for level changes
game.tileMap.reset();

// Destroy when done
game.tileMap.destroy();
```

### Dynamic Tile Manipulation

```javascript
// Example: Destructible walls
tiles: {
    'B': {
        tile: 'tileset.breakable_wall',
        collision: {
            type: 'solid', 
            onCollide: (data) => {
                if (data.entity.type === 'projectile') {
                    // Remove the wall
                    game.tileMap.removeTile(data.layer, data.tileX, data.tileY);
                    // Add debris effect
                    createDebrisEffect(data.worldX, data.worldY);
                }
            }
        }
    }
}

// Example: Moving platforms
function createMovingPlatform (startX, startY, endX, endY, speed) {
    let direction = 1;
    let currentPos = {x: startX, y: startY};

    const update = () => {
        // Remove old position
        game.tileMap.removeTile('platforms', currentPos.x, currentPos.y);

        // Calculate new position
        currentPos.x += (direction * speed);
        if (currentPos.x >= endX || currentPos.x <= startX) {
            direction *= -1;
        }

        // Add at new position
        game.tileMap.addTile('platforms', 'P', currentPos.x, currentPos.y);
    };

    game.timer(update, 100);
}
```

### Error Handling

```javascript
// Safe tile operations
function saflyAddTile (layer, symbol, x, y) {
    try {
        game.tileMap.addTile(layer, symbol, x, y);
    } catch (error) {
        console.warn(`Failed to add tile: ${error.message}`);
    }
}
```

## Troubleshooting

### Common Issues and Solutions

#### Tiles Not Rendering

```javascript
// Check if tilemap is active
if (!game.tileMap.activeMap) {
    game.tileMap.render('myMap');
}

// Verify asset references
const tileInfo = game.tileMap.getAssetTileInfo('tileset.wall');
if (!tileInfo.exists) {
    console.error('Tile asset not found');
}
```

#### Collision Not Working

```javascript
// Ensure collision is enabled
if (!game.engine.collisionEnabled && !game.engine.physicsEnabled) {
    console.error('Neither collision nor physics is enabled');
}

// Check tile collision configuration
const tileData = game.tileMap.getTileInfo('#')[0];
if (!tileData.config.collision) {
    console.error('Tile has no collision configuration');
}
```

#### Animation Issues

```javascript
// Check animation data
const animData = game.tileMap.animatedTiles.get('tile_water');
if (!animData.playing) {
    game.tileMap.playTileAnimation('water');
}

// Verify frame references
const currentFrame = game.tileMap.getCurrentTileFrame('water');
if (!currentFrame) {
    console.error('Animation frame not found');
}
```