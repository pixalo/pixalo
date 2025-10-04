The `Debugger` class provides comprehensive development tools and visual debugging capabilities for the Pixalo engine.

## Overview

The Debugger class offers real-time performance monitoring, entity visualization, system status tracking, and
development utilities. It integrates seamlessly with the Pixalo engine to provide essential debugging information during
game development and testing phases.

### Key Features

- **📊 Performance Monitoring**: Real-time FPS tracking with visual indicators
- **🎯 Entity Visualization**: Visual debugging overlays for collision boxes and entity bounds
- **📋 System Status**: Live monitoring of engine subsystems (physics, collisions, grid)
- **🔍 Development Panel**: Comprehensive information display with metrics and statistics
- **⌨️ Hotkey Support**: Quick toggle functionality with customizable keyboard shortcuts
- **🎨 Customizable Appearance**: Configurable colors, line widths, and visual styles

### Design Philosophy

The debugger follows a non-intrusive approach, providing detailed development information without affecting game
performance or logic. It supports both visual overlays and console logging with conditional activation based on debug
state.

---

# Constructor

```javascript
const game = new Pixalo('#game', {
    // ...
    debugger: {
        active: false,                          // Enable/disable debugger
        panel : true,                           // Show/hide debug panel
        hotKey: true,                           // Enable Ctrl+D hotkey toggle
        fps: {                                  // FPS monitoring configuration
            target: 60,
            actual: 60,
            ratio: 100
        },
        fillColor: 'rgba(255, 0, 0, 0.3)',      // Entity fill color
        strokeColor: 'rgba(255, 0, 0, 0.8)',    // Entity stroke color
        lineWidth: 1,                           // Stroke line width
        pointColor: 'rgba(255, 255, 255, 0.8)', // Collision point color
        pointRadius: 2,                         // Collision point radius
        styles: {}                              // Additional style overrides
    }
});
```

### Constructor Parameters

| Name   | Type   | Description            |
|--------|--------|------------------------|
| engine | Pixalo | Pixalo engine instance |
| config | Object | Configuration options  |

---

# Public Methods

## Control Methods

### `enableDebugger()`: Debugger

Activates the debugger and enables all debugging features.

**Usage Examples:**

```javascript
// Enable debugger programmatically
game.enableDebugger();

// Chain with other methods
game.enableDebugger().showPanel();
```

### `disableDebugger()`: Debugger

Deactivates the debugger and hides all debugging elements.

**Usage Examples:**

```javascript
// Disable debugger
game.disableDebugger();

// Conditional disable for production
if (PRODUCTION) {
    game.disableDebugger();
}
```

### `showPanel()`: void

Shows the debug information panel.

**Usage Examples:**

```javascript
// Show debug panel
game.debugger.showPanel();
```

### `hidePanel()`: void

Hides the debug information panel.

**Usage Examples:**

```javascript
// Hide debug panel while keeping other debug features active
game.debugger.hidePanel();
```

---

## Logging Methods

### `log(...args)`: Debugger

Logs debug information to console (only when debugger is active).

| Name    | Type | Default |
|---------|------|---------|
| ...args | Any  | -       |

**Usage Examples:**

```javascript
// Basic logging
game.log('Player health:', player.health);

// Multiple arguments
game.log('Position:', x, y, 'Velocity:', vx, vy);

// Object logging
game.log('Game state:', gameState);
```

### `info(...args)`: Debugger

Logs informational messages to console (only when debugger is active).

| Name    | Type | Default |
|---------|------|---------|
| ...args | Any  | -       |

**Usage Examples:**

```javascript
// Information messages
game.info('Level loaded successfully');
game.info('Assets loaded:', assetCount);
```

### `warn(...args)`: Debugger

Logs warning messages to console (only when debugger is active).

| Name    | Type | Default |
|---------|------|---------|
| ...args | Any  | -       |

**Usage Examples:**

```javascript
// Warning messages
game.warn('Low FPS detected:', currentFPS);
game.warn('Entity count high:', entityCount);
```

### `error(...args)`: Debugger

Logs error messages to console (only when debugger is active).

| Name    | Type | Default |
|---------|------|---------|
| ...args | Any  | -       |

**Usage Examples:**

```javascript
// Error messages
game.error('Failed to load texture:', textureId);
game.error('Collision detection failed:', error);
```

---

## Item Management

### `addItem(debugId, config)`: Debugger

Adds an item to the debug visualization system.

| Name    | Type           | Default |
|---------|----------------|---------|
| debugId | String         | -       |
| config  | Entity\|Object | -       |

**Usage Examples:**

```javascript
// Add entity for debugging
const player = game.append('player', {x: 100, y: 100});
game.debugger.addItem('player-debug', player);

// Add static debug item
game.debugger.addItem('boundary', {
    x: 0, y: 0,
    width: 800, height: 600,
    shape: 'rectangle',
    strokeColor: 'rgba(255, 255, 0, 0.8)'
});

// Add custom collision shape
game.debugger.addItem('custom-collision', {
    x: 200, y: 200,
    collision: {
        points: [
            {x: 0, y: -20},
            {x: 20, y: 0},
            {x: 0, y: 20},
            {x: -20, y: 0}
        ]
    }
});
```

### `removeItem(debugId)`: Boolean

Removes an item from the debug visualization system.

| Name    | Type   | Default |
|---------|--------|---------|
| debugId | String | -       |

**Usage Examples:**

```javascript
// Remove debug item
const removed = game.debugger.removeItem('player-debug');
if (removed) {
    console.log('Debug item removed successfully');
}
```

### `hasItem(debugId)`: Boolean

Checks if a debug item exists.

| Name    | Type   | Default |
|---------|--------|---------|
| debugId | String | -       |

**Usage Examples:**

```javascript
// Check if debug item exists
if (game.debugger.hasItem('player-debug')) {
    game.debugger.updateItem('player-debug', newConfig);
}
```

### `getItem(debugId)`: Object | undefined

Retrieves a debug item by its ID.

| Name    | Type   | Default |
|---------|--------|---------|
| debugId | String | -       |

**Usage Examples:**

```javascript
// Get debug item
const debugItem = game.debugger.getItem('player-debug');
if (debugItem) {
    console.log('Debug item type:', debugItem.type);
}
```

### `getAllItems()`: Array

Returns all debug items as an array of [id, item] pairs.

**Usage Examples:**

```javascript
// Get all debug items
const allItems = game.debugger.getAllItems();
console.log(`Total debug items: ${allItems.length}`);

// Iterate through all items
allItems.forEach(([id, item]) => {
    console.log(`Item ${id}:`, item.type);
});
```

### `updateItem(debugId, config)`: Boolean

Updates an existing static debug item configuration.

| Name    | Type   | Default |
|---------|--------|---------|
| debugId | String | -       |
| config  | Object | -       |

**Usage Examples:**

```javascript
// Update debug item properties
game.debugger.updateItem('boundary', {
    strokeColor: 'rgba(0, 255, 0, 0.8)',
    lineWidth: 3
});

// Update position
game.debugger.updateItem('marker', {
    x: newX,
    y: newY
});
```

### `clearItems()`: Debugger

Removes all debug items from the visualization system.

**Usage Examples:**

```javascript
// Clear all debug items
game.debugger.clearItems();

// Clear and add new items
game.debugger.clearItems()
    .addItem('new-item', itemConfig);
```

---

## Rendering Methods

### `renderPanel()`: void

> This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do
> customization elsewhere.

Renders the debug information panel with system metrics and statistics.

**Panel Information Includes:**

- **Performance**: FPS, frame ratio, performance indicators
- **System**: Quality settings, canvas dimensions
- **Grid**: Grid status, size, and major grid configuration
- **Entities**: Total count, invisible entities count
- **Collision**: Engine status, active collision objects
- **Physics**: Engine status, physics-enabled objects

**Usage Examples:**

```javascript
// Manual call if needed
game.debugger.renderPanel();
```

### `render(ctx)`: void

Renders debug visualization overlays for all registered items.

> This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do
> customization elsewhere.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Examples:**

```javascript
// Manual call for custom rendering
game.debugger.render(gameContext);
```

---

## Configuration Options

### Initial Configuration

```javascript
const debuggerConfig = {
    // Core settings
    active: true,                           // Enable debugger
    panel : true,                           // Show debug panel
    hotKey: true,                          // Enable Ctrl+D toggle

    // Visual styles
    fillColor: 'rgba(255, 0, 0, 0.3)',      // Entity fill color
    strokeColor: 'rgba(255, 0, 0, 0.8)',    // Entity stroke color
    lineWidth: 2,                           // Stroke thickness
    pointColor: 'rgba(255, 255, 255, 0.8)', // Collision point color
    pointRadius: 3,                         // Collision point size

    // FPS monitoring
    fps: {
        target: 60,                         // Target FPS
        actual: 60,                         // Current FPS (auto-updated)
        ratio: 100                          // Performance ratio (auto-calculated)
    },

    // Style overrides
    styles: {
        customProperty: 'value'            // Additional custom styles
    }
};
```

---

## Supported Debug Shapes

### Rectangle

```javascript
game.debugger.addItem('rect', {
    x: 100, y: 100,
    width: 50, height: 30,
    shape: 'rectangle',
    borderRadius: 5  // Optional rounded corners
});
```

### Circle

```javascript
game.debugger.addItem('circle', {
    x: 200, y: 200,
    width: 60, height: 60,  // Diameter determined by smaller dimension
    shape: 'circle'
});
```

### Triangle

```javascript
game.debugger.addItem('triangle', {
    x: 150, y: 150,
    width: 40, height: 40,
    shape: 'triangle'
});
```

### Star

```javascript
game.debugger.addItem('star', {
    x: 250, y: 150,
    width: 50, height: 50,
    shape: 'star',
    spikes: 6  // Number of star points
});
```

### Polygon

```javascript
game.debugger.addItem('polygon', {
    x: 300, y: 200,
    shape: 'polygon',
    points: [
        {x: -20, y: -10},
        {x: 20, y: -10},
        {x: 15, y: 10},
        {x: -15, y: 10}
    ],
    borderRadius: 3  // Optional rounded corners
});
```

### Custom Collision Shape

```javascript
game.debugger.addItem('custom-collision', {
    x: 400, y: 300,
    width: 60, height: 40,
    collision: {
        x: 5, y: 5,           // Offset from entity position
        width: 50, height: 30, // Collision box dimensions
        points: [              // Custom collision points
            {x: -25, y: -15},
            {x: 25, y: -15},
            {x: 20, y: 15},
            {x: -20, y: 15}
        ]
    }
});
```

---

## Visual Indicators

### Performance Colors

- **🟢 Green**: FPS ≥ 90% of target (good performance)
- **🟡 Yellow**: FPS ≥ 70% of target (moderate performance)
- **🔴 Red**: FPS < 70% of target (poor performance)

### System Status Colors

- **🟢 Green**: System enabled and active
- **⚫ Gray**: System disabled or inactive
- **🟡 Yellow**: System active with warnings
- **🔵 Blue**: Configuration values and metrics

---

## Event Integration

### Automatic Entity Tracking

```javascript
// Entities are automatically added to debugger when appended
const player = game.append('player', {
    x: 100, y: 100,
    width: 32, height: 32
});
// Debug visualization is automatically available

// Manual control if needed
game.debugger.removeItem('player'); // Remove from debug view
```

---

## Performance Considerations

### Efficient Rendering

```javascript
// Debugger only renders items in camera view
// Automatic culling for performance

// Manual performance optimization
if (game.debugger.items.size > 100) {
    game.warn('High debug item count:',
        game.debugger.items.size);
}
```

---

## Best Practices

### Custom Debug Items

```javascript
// Add custom debug markers
const addDebugMarker = (id, x, y, color = 'red') => {
    game.debugger.addItem(id, {
        x, y,
        width: 10, height: 10,
        shape: 'circle',
        strokeColor: color,
        fillColor: `${color}33` // Semi-transparent
    });
};

// Mark spawn points
addDebugMarker('spawn-1', 100, 100, 'green');
addDebugMarker('spawn-2', 700, 500, 'blue');
```

### Performance Monitoring

```javascript
// Monitor performance thresholds
game.on('update', () => {
    const fps = game.debugger.fps.actual;

    if (fps < 30) {
        game.debugger.error('Critical performance issue:', fps);
    } else if (fps < 50) {
        game.debugger.warn('Performance warning:', fps);
    }
});
```

---

## Troubleshooting

### Debug Panel Not Showing

```javascript
// Check debugger state
console.log('Debugger active:', game.debugger.active);
console.log('Panel visible:', game.debugger.panel);

// Force enable
game.debugger.enableDebugger().showPanel();
```

### Debug Items Not Rendering

```javascript
// Check if items are added
console.log('Debug items:', game.debugger.getAllItems());

// Check visibility and camera view
const item = game.debugger.getItem('my-item');
if (item) {
    console.log('Item visible:', item.visible);
    console.log('In camera view:', game.camera.inView(item));
}

// Verify debugger is active
if (!game.debugger.active) {
    game.debugger.enableDebugger();
}
```

### Performance Issues with Debug Mode

### Collision Debug Not Working

```javascript
// Ensure collision system is enabled
if (!game.collisionEnabled) {
    game.enableCollisions();
}

// Add collision debug for entity
const entity = game.find('player');
if (entity.collision) {
    game.debugger.addItem('player-collision', {
        ...entity,
        collision: entity.collision
    });
}
```

---

## Advanced Usage

### Dynamic Debug Configuration

```javascript
// Runtime configuration changes
game.on('keydown', (key) => {
    switch (key) {
        case 'f1':
            game.debugger.showPanel();
            break;
        case 'f2':
            game.debugger.hidePanel();
            break;
        case 'f3':
            // Toggle entity debug visualization
            game.getAllEntities().forEach((entity, id) => {
                if (game.debugger.hasItem(id)) {
                    game.debugger.removeItem(id);
                } else {
                    game.debugger.addItem(id, entity);
                }
            });
            break;
    }
});
```

### Debug Item Animation

```javascript
// Animate debug items for better visibility
let debugPulse = 0;

game.on('update', (deltaTime) => {
    if (!game.debugger.active) return;

    debugPulse += deltaTime * 0.005;
    const alpha = 0.3 + Math.sin(debugPulse) * 0.2;

    game.debugger.styles.fillColor = `rgba(255, 0, 0, ${alpha})`;
    game.debugger.styles.strokeColor = `rgba(255, 0, 0, ${alpha + 0.5})`;
});
```

### Debug Information Export

```javascript
// Export debug information for analysis
const exportDebugInfo = () => {
    const debugInfo = {
        timestamp: Date.now(),
        fps: game.debugger.fps,
        entities: game.getAllEntities().size,
        debugItems: game.debugger.getAllItems().length,
        systems: {
            physics: game.physicsEnabled,
            collision: game.collisionEnabled,
            grid: game.gridEnabled
        },
        performance: {
            canvas: {
                width: game.canvas.width,
                height: game.canvas.height
            },
            quality: game.config.quality
        }
    };

    console.log('Debug Export:', JSON.stringify(debugInfo, null, 2));
    return debugInfo;
};

// Export on demand
game.on('f9', exportDebugInfo);

// Periodic export
game.timer(() => {
    if (game.debugger.active) {
        exportDebugInfo();
    }
}, 30000); // Every 30 seconds
```

---

## API Reference Summary

### Constructor

- `new Debugger(engine, config)` - Creates debugger instance

### Control Methods

- `enableDebugger()` - Enable debugger
- `disableDebugger()` - Disable debugger
- `showPanel()` - Show debug panel
- `hidePanel()` - Hide debug panel

### Logging Methods

- `log(...args)` - Debug logging
- `info(...args)` - Info logging
- `warn(...args)` - Warning logging
- `error(...args)` - Error logging

### Item Management

- `addItem(id, config)` - Add debug item
- `removeItem(id)` - Remove debug item
- `hasItem(id)` - Check if item exists
- `getItem(id)` - Get debug item
- `getAllItems()` - Get all debug items
- `updateItem(id, config)` - Update debug item
- `clearItems()` - Clear all debug items

### Rendering Methods

- `render(ctx)` - Render debug overlays
- `renderPanel()` - Render debug panel

### Properties

- `active` - Boolean indicating if debugger is active
- `panel` - Boolean indicating if panel is visible
- `hotKey` - Boolean indicating if hotkey is enabled
- `fps` - Object containing FPS metrics
- `items` - Map of debug items
- `styles` - Object containing visual styling options

---

## Integration Examples

### With Collision System

```javascript
// Highlight collision events
game.on('collision', (data) => {
    const {entity1, entity2, point} = data;

    // Add collision point marker
    game.debugger.addItem(`collision-${Date.now()}`, {
        x: point.x - 2,
        y: point.y - 2,
        width: 4,
        height: 4,
        shape: 'circle',
        strokeColor: 'rgba(255, 255, 0, 1)',
        fillColor: 'rgba(255, 255, 0, 0.6)'
    });

    // Remove after short time
    game.timeout(() => {
        game.debugger.removeItem(`collision-${Date.now()}`);
    }, 1000);
});
```