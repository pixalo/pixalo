The Background class provides a comprehensive system for managing layered background elements in the Pixalo game engine. It supports both color and image backgrounds with advanced features including parallax scrolling, independent movement, repeating patterns, and multi-layer composition with z-ordering.

## Public Methods

### add(source, config): string | null

Adds a new background layer to the scene. Returns the layer ID on success or null if the asset is not found.

| name | type | default |
|------|------|---------|
| source | string | - |
| config | object | {} |

**Config Object Properties:**
| name | type | default |
|------|------|---------|
| id | string | auto-generated |
| x | number | 0 |
| y | number | 0 |
| scale | number | 1 |
| rotation | number | 0 |
| opacity | number | 1 |
| parallax | number | 1 |
| parallaxX | number | parallax value |
| parallaxY | number | parallax value |
| repeat | string | 'none' |
| speed.x | number | 0 |
| speed.y | number | 0 |
| offset.x | number | 0 |
| offset.y | number | 0 |
| top | boolean | false |
| zIndex | number | 0 |
| visible | boolean | true |

**Usage Example:**
```javascript
// Add a color background
const colorLayerId = game.background.add('#3498db', {
    parallax: 0.5,
    zIndex: -1
});

// Add an image background with repeating pattern
const imageLayerId = game.background.add('mountains', {
    repeat: 'x',
    parallaxX: 0.3,
    speed: { x: -20 },
    scale: 1.5
});
```

### get(layerId): object | null

Retrieves a background layer by its ID. Returns the layer object or null if not found.

| name | type | default |
|------|------|---------|
| layerId | string | - |

**Usage Example:**
```javascript
const layer = game.background.get('bg_layer_1');
if (layer) {
    console.log('Layer position:', layer.x, layer.y);
}
```

### remove(layerId): boolean

Removes a background layer from the scene. Returns true if the layer was removed, false if not found.

| name | type | default |
|------|------|---------|
| layerId | string | - |

**Usage Example:**
```javascript
const removed = game.background.remove('bg_layer_1');
if (removed) {
    console.log('Layer removed successfully');
}
```

### clear(): Background

Removes all background layers and resets the layer counter. Returns the Background instance for method chaining.

**Usage Example:**
```javascript
game.background.clear();
```

### setOrder(layerId, zIndex): boolean

Changes the z-index (rendering order) of a background layer. Returns true if successful, false if layer not found.

| name | type | default |
|------|------|---------|
| layerId | string | - |
| zIndex | number | - |

**Usage Example:**
```javascript
game.background.setOrder('bg_layer_1', 10);
```

### setVisible(layerId, visible): boolean

Sets the visibility of a background layer. Returns true if successful, false if layer not found.

| name | type | default |
|------|------|---------|
| layerId | string | - |
| visible | boolean | - |

**Usage Example:**
```javascript
// Hide a background layer
game.background.setVisible('bg_layer_1', false);

// Show it again
game.background.setVisible('bg_layer_1', true);
```

### update(layerId, config): boolean

Updates properties of an existing background layer. Returns true if successful, false if layer not found.

| name | type | default |
|------|------|---------|
| layerId | string | - |
| config | object | - |

**Usage Example:**
```javascript
// Update multiple properties at once
game.background.update('bg_layer_1', {
    x: 100,
    y: 50,
    opacity: 0.8,
    speed: { x: -10, y: 5 }
});
```