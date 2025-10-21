The Grid class provides a flexible and performant grid system for 2D canvas-based games and applications. It supports
customizable grid sizes, colors, major grid lines, bounds, and zoom-based visibility controls. The grid can be snapped
to, and provides utility methods for converting between world coordinates and grid cells.

## Configuration Object

The Grid class accepts a comprehensive configuration object during initialization:

```javascript
const gridConfig = {
    enabled: true,                    // Enable/disable grid rendering
    width: 32,                        // Grid cell width
    height: 32,                       // Grid cell height
    color: 'rgba(0,0,0,0.3)',         // Regular grid line color
    lineWidth: 1,                     // Regular grid line width
    majorGridEvery: 5,                // Major grid line frequency (every N cells)
    majorColor: 'rgba(0,0,0,0.6)',    // Major grid line color
    majorLineWidth: 2,                // Major grid line width
    bounds: null,                     // Grid bounds {x, y, width, height} or null for infinite
    minZoomToShow: 0.1,               // Minimum zoom level to show grid
    maxZoomToShow: 10,                // Maximum zoom level to show grid
    maxLines: 1000,                   // Maximum number of lines for performance
    originX: 0,                       // Grid origin X coordinate
    originY: 0                        // Grid origin Y coordinate
};
```

# Public Methods

## `render(ctx): void`

Renders the grid to the canvas context with current camera settings and zoom-based optimizations.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**

```javascript
// This method is typically called internally by the engine
// But can be called manually if needed
game.grid.render(canvasContext);
```

## `snapToGrid(x, y): Object`

Snaps world coordinates to the nearest grid intersection point.

| Name | Type   | Default |
|------|--------|---------|
| x    | number | -       |
| y    | number | -       |

**Usage Example:**

```javascript
const mousePos = {x: 123.7, y: 456.3};
const snapped = game.grid.snapToGrid(mousePos.x, mousePos.y);
console.log(snapped); // {x: 128, y: 448} (assuming 32x32 grid)
```

## `getGridCell(x, y): Object`

Converts world coordinates to grid cell coordinates.

| Name | Type   | Default |
|------|--------|---------|
| x    | number | -       |
| y    | number | -       |

**Usage Example:**

```javascript
const worldPos = {x: 100, y: 200};
const cell = game.grid.getGridCell(worldPos.x, worldPos.y);
console.log(cell); // {x: 3, y: 6} (assuming 32x32 grid)
```

## `cellToWorld(cellX, cellY): Object`

Converts grid cell coordinates to world coordinates.

| Name  | Type   | Default |
|-------|--------|---------|
| cellX | number | -       |
| cellY | number | -       |

**Usage Example:**

```javascript
const cellPos = {x: 5, y: 3};
const worldPos = game.grid.cellToWorld(cellPos.x, cellPos.y);
console.log(worldPos); // {x: 160, y: 96} (assuming 32x32 grid)
```

## `setEnabled(enabled): Grid`

Enables or disables grid rendering.

| Name    | Type    | Default |
|---------|---------|---------|
| enabled | boolean | -       |

**Usage Example:**

```javascript
// Hide the grid
game.grid.setEnabled(false);

// Show the grid
game.grid.setEnabled(true);
```

## `setSize(width, height): Grid`

Sets the grid cell dimensions.

| Name   | Type   | Default |
|--------|--------|---------|
| width  | number | -       |
| height | number | width   |

**Usage Example:**

```javascript
// Set square grid cells
game.grid.setSize(64);

// Set rectangular grid cells
game.grid.setSize(32, 48);
```

## `setColors(color, majorColor): Grid`

Sets the colors for regular and major grid lines.

| Name       | Type   | Default             |
|------------|--------|---------------------|
| color      | string | current color       |
| majorColor | string | current major color |

**Usage Example:**

```javascript
// Set both colors
game.grid.setColors('rgba(255,0,0,0.3)', 'rgba(255,0,0,0.6)');

// Set only regular grid color
game.grid.setColors('rgba(0,255,0,0.2)');
```

## `setLineWidth(lineWidth, majorLineWidth): Grid`

Sets the line widths for regular and major grid lines.

| Name           | Type   | Default                  |
|----------------|--------|--------------------------|
| lineWidth      | number | current line width       |
| majorLineWidth | number | current major line width |

**Usage Example:**

```javascript
// Set both line widths
game.grid.setLineWidth(1, 3);

// Set only regular line width
game.grid.setLineWidth(0.5);
```

## `setMajorGrid(every, color, lineWidth): Grid`

Configures major grid line appearance and frequency.

| Name      | Type   | Default                  |
|-----------|--------|--------------------------|
| every     | number | current frequency        |
| color     | string | current major color      |
| lineWidth | number | current major line width |

**Usage Example:**

```javascript
// Major line every 10 cells with custom styling
game.grid.setMajorGrid(10, 'rgba(0,0,255,0.8)', 3);

// Disable major grid lines
game.grid.setMajorGrid(0);
```

## `setBounds(bounds): Grid`

Sets the grid rendering bounds or removes bounds for infinite grid.

| Name   | Type         | Default |
|--------|--------------|---------|
| bounds | Object\|null | -       |

**Usage Example:**

```javascript
// Set bounds to a specific area
game.grid.setBounds({x: 0, y: 0, width: 1000, height: 800});

// Remove bounds for infinite grid
game.grid.setBounds(null);
```

## `setOrigin(x, y): Grid`

Sets the grid origin point (where grid lines intersect at 0,0).

| Name | Type   | Default |
|------|--------|---------|
| x    | number | -       |
| y    | number | -       |

**Usage Example:**

```javascript
// Center the grid origin
game.grid.setOrigin(400, 300);

// Reset to default origin
game.grid.setOrigin(0, 0);
```

## `setVisibilityRange(minZoom, maxZoom): Grid`

Sets the zoom levels at which the grid is visible.

| Name    | Type   | Default          |
|---------|--------|------------------|
| minZoom | number | current min zoom |
| maxZoom | number | current max zoom |

**Usage Example:**

```javascript
// Grid visible only between 0.5x and 5x zoom
game.grid.setVisibilityRange(0.5, 5);

// Set only minimum zoom
game.grid.setVisibilityRange(0.2);
```

## Performance Considerations

- The grid automatically hides when zoom levels are outside the configured visibility range
- Line rendering is limited by `maxLines` configuration to prevent performance issues at high zoom levels
- Grid line opacity automatically adjusts based on zoom level for better visual clarity
- Only visible grid lines within the camera viewport are rendered

## Grid Coordinate System

The grid uses a coordinate system where:

- `(0, 0)` represents the grid origin (configurable via `setOrigin`)
- Grid cells are indexed starting from the origin
- Positive X moves right, positive Y moves down
- World coordinates can be converted to/from grid cell coordinates using `getGridCell()` and `cellToWorld()` methods