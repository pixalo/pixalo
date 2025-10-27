The Collision class is a comprehensive collision detection system that handles collision detection between various
geometric shapes including rectangles, circles, triangles, stars, polygons, and custom paths. This class uses advanced
algorithms like Separating Axis Theorem (SAT) for precise collision detection and supports complex transformations
including rotation, scaling, and skewing.

> :warning: **Note**: This class is managed and updated automatically by the Pixalo class. You don't need to call
> methods from this class directly unless you want to perform custom operations or advanced collision handling.

## Public Methods

---

### `updateCollisions(entities): void`

Updates collision detection for all provided entities and triggers collision events. Automatically filters entities with
collision disabled and manages collision enter/exit events.

> ⚠️ This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do
> customization elsewhere.

| Name     | Type  | Default | Description                               |
|----------|-------|---------|-------------------------------------------|
| entities | Array | -       | Array of entities to check for collisions |

**Usage Example:**

```javascript
// Typically handled automatically by Pixalo, but can be called manually
game.collision.updateCollisions([entityA, entityB, entity3]);
```

---

### `detectCollisionDetailed(entityA, entityB): Object`

Performs detailed collision detection between two entities and returns comprehensive collision information.
Automatically applies thresholds for rounded corners and uses appropriate detection method based on shape types.

| Name    | Type   | Default | Description                      |
|---------|--------|---------|----------------------------------|
| entityA | Object | -       | First entity to check collision  |
| entityB | Object | -       | Second entity to check collision |

**Returns:**  
`{colliding: Boolean, sideA: String, sideB: String, overlap: Number, normal: {x,y}, point: {x,y}}`

**Usage Example:**

```javascript
const collisionInfo = game.collision.detectCollisionDetailed(player, enemy);
if (collisionInfo.colliding) {
    console.log('Collision detected!', collisionInfo);
    console.log('Player hit on:', collisionInfo.sideA);
    console.log('Overlap distance:', collisionInfo.overlap);
}
```

---

### `detectCircleCollision(circle1, circle2): Object`

Specialized collision detection method for circular entities with precise center-to-center distance calculations.

| Name    | Type   | Default | Description            |
|---------|--------|---------|------------------------|
| circle1 | Object | -       | First circular entity  |
| circle2 | Object | -       | Second circular entity |

**Returns:** `{colliding: Boolean, sideA: String, sideB: String, overlap: Number, normal: {x,y}, point: {x,y}}`

**Usage Example:**

```javascript
const result = game.collision.detectCircleCollision(ball1, ball2);
if (result.colliding) {
    console.log('Circles are colliding with overlap:', result.overlap);
    console.log('Collision point:', result.point);
}
```

---

### `detectSATCollision(vertices1, vertices2, entityA, entityB, threshold): Object`

Performs Separating Axis Theorem collision detection between two sets of vertices with configurable threshold for
rounded shapes.

| Name      | Type   | Default | Description                              |
|-----------|--------|---------|------------------------------------------|
| vertices1 | Array  | -       | Vertices of first entity                 |
| vertices2 | Array  | -       | Vertices of second entity                |
| entityA   | Object | -       | First entity reference                   |
| entityB   | Object | -       | Second entity reference                  |
| threshold | Number | 0       | Threshold for rounded corner adjustments |

**Returns:** `{colliding: Boolean, sideA: String, sideB: String, overlap: Number, normal: {x,y}, point: {x,y}}`

**Usage Example:**

```javascript
const vertices1 = game.collision.getVertices(entityA);
const vertices2 = game.collision.getVertices(entityB);
const collision = game.collision.detectSATCollision(vertices1, vertices2, entityA, entityB, 2);
```

---

### `checkAABBCollision(entityA, entityB, threshold): Boolean`

Performs Axis-Aligned Bounding Box collision detection for quick collision filtering with configurable threshold.

| Name      | Type   | Default | Description                         |
|-----------|--------|---------|-------------------------------------|
| entityA   | Object | -       | First entity to check               |
| entityB   | Object | -       | Second entity to check              |
| threshold | Number | 0       | Additional padding for bounding box |

**Usage Example:**

```javascript
const hasAABBCollision = game.collision.checkAABBCollision(player, wall, 1);
if (hasAABBCollision) {
    // Proceed with detailed collision detection
    const detailed = game.collision.detectCollisionDetailed(player, wall);
}
```

---

### `getVertices(entity): Array`

Retrieves or calculates the transformed vertices for an entity based on its shape and styles. Uses caching for
performance optimization.

| Name   | Type   | Default | Description                |
|--------|--------|---------|----------------------------|
| entity | Object | -       | Entity to get vertices for |

**Returns:** `Array<{x: Number, y: Number}>` - Array of vertex coordinates

**Usage Example:**

```javascript
const vertices = game.collision.getVertices(myEntity);
console.log('Entity vertices:', vertices);

// Vertices are automatically cached until entity transforms
const sameVertices = game.collision.getVertices(myEntity); // Retrieved from cache
```

---

### `getStarVertices(entity): Array`

Generates vertices for star-shaped entities with configurable spikes and improved accuracy using midpoints.

| Name   | Type   | Default | Description                    |
|--------|--------|---------|--------------------------------|
| entity | Object | -       | Star entity with spikes config |

**Returns:** `Array<{x: Number, y: Number}>` - Star vertices with midpoints

**Usage Example:**

```javascript
// Entity must have styles.spikes property
entity.styles.spikes = 6;
const starVertices = game.collision.getStarVertices(starEntity);
```

---

### `getCircleVertices(entity, segments): Array`

Generates vertices for circular entities by approximating the circle with polygon segments.

| Name     | Type   | Default | Description                       |
|----------|--------|---------|-----------------------------------|
| entity   | Object | -       | Circular entity                   |
| segments | Number | 16      | Number of segments to approximate |

**Returns:** `Array<{x: Number, y: Number}>` - Circle approximation vertices

**Usage Example:**

```javascript
const circleVertices = game.collision.getCircleVertices(ball, 24);
// Higher segments = more accurate but slower collision detection
```

---

### `getTriangleVertices(entity): Array`

Generates vertices for triangular entities as an equilateral triangle pointing upward.

| Name   | Type   | Default | Description     |
|--------|--------|---------|-----------------|
| entity | Object | -       | Triangle entity |

**Returns:** `Array<{x: Number, y: Number}>` - Triangle vertices

**Usage Example:**

```javascript
const triangleVertices = game.collision.getTriangleVertices(triangleEntity);
```

---

### `getRectangleVertices(entity, radius): Array`

Generates vertices for rectangular entities with optional rounded corners using high-precision curve approximation.

| Name   | Type   | Default | Description               |
|--------|--------|---------|---------------------------|
| entity | Object | -       | Rectangle entity          |
| radius | Number | -       | Border radius for corners |

**Returns:** `Array<{x: Number, y: Number}>` - Rectangle vertices

**Usage Example:**

```javascript
const rectVertices = game.collision.getRectangleVertices(box, 10);
// Creates smooth rounded corners with multiple points per corner
```

---

### `getCustomPathVertices(entity): Array`

Generates vertices for entities with custom path shapes by sampling points from the path using canvas rendering and
binary search.

| Name   | Type   | Default | Description                     |
|--------|--------|---------|---------------------------------|
| entity | Object | -       | Entity with customPath function |

**Returns:** `Array<{x: Number, y: Number}>` - Sampled path vertices

**Usage Example:**

```javascript
// Entity must have styles.customPath function
entity.styles.customPath = (ctx) => {
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.closePath();
};

const customVertices = game.collision.getCustomPathVertices(customShapeEntity);
```

---

### `applyTransformations(vertices, entity): Array`

Applies all transformations (rotation, scaling, skewing, positioning) to a set of vertices in the correct order.

| Name     | Type   | Default | Description                           |
|----------|--------|---------|---------------------------------------|
| vertices | Array  | -       | Original vertices to transform        |
| entity   | Object | -       | Entity containing transformation data |

**Returns:** `Array<{x: Number, y: Number}>` - Transformed vertices

**Usage Example:**

```javascript
const originalVertices = [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}];
const transformedVertices = game.collision.applyTransformations(originalVertices, rotatedEntity);

// Transformations applied in order: scale → skew → rotate → translate
```

---

### `findCollisionPoint(vertices1, vertices2): Object`

Finds the approximate collision point between two sets of vertices by finding the closest vertex pair.

| Name      | Type  | Default | Description            |
|-----------|-------|---------|------------------------|
| vertices1 | Array | -       | First set of vertices  |
| vertices2 | Array | -       | Second set of vertices |

**Returns:** `{x: Number, y: Number}` - Collision point coordinates

**Usage Example:**

```javascript
const collisionPoint = game.collision.findCollisionPoint(playerVertices, enemyVertices);
console.log('Collision occurred at:', collisionPoint);

// Use for particle effects or impact visualization
game.particles.explode(collisionPoint.x, collisionPoint.y);
```

---

### `getAABB(entity): Object`

Calculates the Axis-Aligned Bounding Box for an entity using its transformed vertices.

| Name   | Type   | Default | Description            |
|--------|--------|---------|------------------------|
| entity | Object | -       | Entity to get AABB for |

**Returns:** `{minX: Number, minY: Number, maxX: Number, maxY: Number}`

**Usage Example:**

```javascript
const boundingBox = game.collision.getAABB(entity);
console.log('AABB:', boundingBox);

// Check if entity is within screen bounds
const screenBounds = {minX: 0, minY: 0, maxX: 800, maxY: 600};
const onScreen = boundingBox.maxX >= 0 && boundingBox.minX <= screenBounds.maxX;
```

---

### `getSideFromNormal(normal): String`

Converts a collision normal vector to a cardinal direction string based on angle.

| Name   | Type   | Default | Description                            |
|--------|--------|---------|----------------------------------------|
| normal | Object | -       | Normal vector `{x: Number, y: Number}` |

**Returns:** `'left' | 'right' | 'top' | 'bottom'`

**Usage Example:**

```javascript
const side = game.collision.getSideFromNormal({x: 0, y: -1});
console.log(side); // 'top'

const sideB = game.collision.getSideFromNormal({x: 1, y: 0});
console.log(sideB); // 'right'
```

---

### `getSideFromCenters(entityA, entityB): String`

Determines collision direction by comparing centers of two entities (simple & reliable method).

| Name    | Type   | Default | Description   |
|---------|--------|---------|---------------|
| entityA | Object | -       | First entity  |
| entityB | Object | -       | Second entity |

**Returns:** `'left' | 'right' | 'top' | 'bottom'`

**Usage Example:**

```javascript
const side = game.collision.getSideFromCenters(player, platform);
if (side === 'bottom') {
    console.log('Player landed on platform');
    player.data('onGround', true);
}
```

---

### `getOppositeSide(side): String`

Returns the opposite cardinal direction of the given side.

| Name | Type   | Default | Description                        |
|------|--------|---------|------------------------------------|
| side | String | -       | Cardinal direction to get opposite |

**Returns:** `'left' | 'right' | 'top' | 'bottom'`

**Usage Example:**

```javascript
console.log(game.collision.getOppositeSide('left')); // 'right'
console.log(game.collision.getOppositeSide('top'));  // 'bottom'
```

---

### `getAxes(vertices): Array`

Calculates perpendicular axes from edges of a polygon for SAT collision detection.

| Name     | Type  | Default | Description      |
|----------|-------|---------|------------------|
| vertices | Array | -       | Polygon vertices |

**Returns:** `Array<{x: Number, y: Number}>` - Normalized axis vectors

**Usage Example:**

```javascript
const vertices = game.collision.getVertices(entity);
const axes = game.collision.getAxes(vertices);
console.log('SAT axes:', axes);
```

---

### `projectVertices(vertices, axis): Object`

Projects vertices onto an axis and returns the min/max projection values for SAT algorithm.

| Name     | Type   | Default | Description          |
|----------|--------|---------|----------------------|
| vertices | Array  | -       | Vertices to project  |
| axis     | Object | -       | Axis vector `{x, y}` |

**Returns:** `{min: Number, max: Number}`

**Usage Example:**

```javascript
const projection = game.collision.projectVertices(vertices, {x: 1, y: 0});
console.log('Projection range:', projection.min, 'to', projection.max);
```

---

### `getOverlap(projection1, projection2): Number`

Calculates overlap between two projections with high precision rounding to avoid floating-point errors.

| Name        | Type   | Default | Description       |
|-------------|--------|---------|-------------------|
| projection1 | Object | -       | First projection  |
| projection2 | Object | -       | Second projection |

**Returns:** `Number` - Overlap amount (0 or negative = no overlap)

**Usage Example:**

```javascript
const proj1 = {min: 10, max: 20};
const proj2 = {min: 15, max: 25};
const overlap = game.collision.getOverlap(proj1, proj2);
console.log('Overlap:', overlap); // 5
```

---

### `addRoundedCornerVertices(vertices, centerX, centerY, radius, startAngle, segments): void`

Adds vertices for a rounded corner to the vertices array (used internally by getRectangleVertices).

| Name       | Type   | Default | Description                      |
|------------|--------|---------|----------------------------------|
| vertices   | Array  | -       | Array to add vertices to         |
| centerX    | Number | -       | Corner center X coordinate       |
| centerY    | Number | -       | Corner center Y coordinate       |
| radius     | Number | -       | Corner radius                    |
| startAngle | Number | -       | Starting angle in radians        |
| segments   | Number | -       | Number of segments for the curve |

**Usage Example:**

```javascript
const vertices = [];
game.collision.addRoundedCornerVertices(vertices, 50, 50, 10, 0, 4);
console.log('Vertices with rounded corner:', vertices);
```

---

| Name    | Type   | Default | Description                              |
|---------|--------|---------|------------------------------------------|
| ctx     | Object | -       | Canvas 2D context with drawn path        |
| width   | Number | -       | Path width                               |
| height  | Number | -       | Path height                              |
| samples | Number | 16      | Number of sample points around perimeter |

**Returns:** `Array<{x: Number, y: Number}>` - Sampled path vertices

**Usage Example:**

```javascript
// Used internally by getCustomPathVertices
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// ... draw custom path
const points = game.collision.samplePathPoints(ctx, 100, 100, 24);
```

---

### `isPointInBounds(x, y, bounds): Boolean`

Checks if a point is within specified boundary limits.

| Name   | Type   | Default | Description                       |
|--------|--------|---------|-----------------------------------|
| x      | Number | -       | X coordinate to check             |
| y      | Number | -       | Y coordinate to check             |
| bounds | Object | -       | Bounds `{minX, minY, maxX, maxY}` |

**Returns:** `Boolean` - True if point is within bounds

**Usage Example:**

```javascript
const bounds = {minX: 0, minY: 0, maxX: 800, maxY: 600};
const inBounds = game.collision.isPointInBounds(400, 300, bounds);
console.log('Point is in bounds:', inBounds);
```

---

### `remove(entity): void`

Removes an entity from collision tracking, cleans up cached data, and triggers collideEnd events for active collisions.

| Name   | Type   | Default | Description                    |
|--------|--------|---------|--------------------------------|
| entity | Object | -       | Entity to remove from tracking |

**Usage Example:**

```javascript
// Automatically called when entity is destroyed
game.collision.remove(destroyedEnemy);
```

---

### `clearCache(entityId): void`

Clears cached vertex data for a specific entity, forcing recalculation on next collision check.

| Name     | Type          | Default | Description                     |
|----------|---------------|---------|---------------------------------|
| entityId | String/Number | -       | ID of entity to clear cache for |

**Usage Example:**

```javascript
// Clear cache when entity transforms significantly
entity.styles.rotation = 45;
game.collision.clearCache(entity.id);

// Cache is also automatically cleared when position/transform changes
```

---

### `reset(): void`

Resets the entire collision system, clearing all cached data, active collisions, and position history.

**Usage Example:**

```javascript
// Reset collision system (useful for level transitions)
game.collision.reset();
```

---

## Static Utility Methods

Access via `Collision.method(…)` – no instance required.

---

### `isPointInCollisionPoints(x, y, points, tolerance): Boolean`

Checks if a point is inside or on the boundary of a polygon using advanced winding number algorithm and Bezier curve
detection.

| Name      | Type   | Default | Description                           |
|-----------|--------|---------|---------------------------------------|
| x         | Number | -       | X coordinate to test                  |
| y         | Number | -       | Y coordinate to test                  |
| points    | Array  | -       | Polygon vertices `Array<{x, y}>`      |
| tolerance | Number | 2       | Distance tolerance for edge detection |

**Returns:** `Boolean` - True if point is inside or on polygon boundary

**Usage Example:**

```javascript
const shapePoints = [{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 100}, {x: 0, y: 100}];
const inside = Collision.isPointInCollisionPoints(50, 50, shapePoints, 3);
console.log('Point is inside shape:', inside);

// Useful for custom hit detection
const mouseInside = Collision.isPointInCollisionPoints(
    mouse.x, mouse.y, entity.collision.points, 5
);
```

---

### `isPointInTriangle(x, y, width, height): Boolean`

Fast point-in-triangle test for default upward-pointing triangles using barycentric coordinates.

| Name   | Type   | Default | Description          |
|--------|--------|---------|----------------------|
| x      | Number | -       | X coordinate to test |
| y      | Number | -       | Y coordinate to test |
| width  | Number | -       | Triangle base width  |
| height | Number | -       | Triangle height      |

**Returns:** `Boolean` - True if point is inside triangle

**Usage Example:**

```javascript
const isInTriangle = Collision.isPointInTriangle(50, 25, 100, 100);

// Check mouse click on triangle
if (Collision.isPointInTriangle(mouse.x - triangle.x, mouse.y - triangle.y,
    triangle.width, triangle.height)) {
    console.log('Triangle clicked!');
}
```

---

### `isPointOnBezierCurves(x, y, points, tolerance): Boolean`

Checks if a point lies on or near Bezier curves formed by connecting polygon points.

| Name      | Type   | Default | Description          |
|-----------|--------|---------|----------------------|
| x         | Number | -       | X coordinate to test |
| y         | Number | -       | Y coordinate to test |
| points    | Array  | -       | Curve control points |
| tolerance | Number | -       | Distance tolerance   |

**Returns:** `Boolean` - True if point is on curve path

**Usage Example:**

```javascript
const onCurve = Collision.isPointOnBezierCurves(100, 150, curvePoints, 3);
console.log('Point is on curve:', onCurve);
```

---

### `isPointInShape(x, y, points): Boolean`

Determines if a point is inside a polygon using the winding number algorithm.

| Name   | Type   | Default | Description          |
|--------|--------|---------|----------------------|
| x      | Number | -       | X coordinate to test |
| y      | Number | -       | Y coordinate to test |
| points | Array  | -       | Polygon vertices     |

**Returns:** `Boolean` - True if point is inside shape

**Usage Example:**

```javascript
const inside = Collision.isPointInShape(75, 75, polygonPoints);
if (inside) {
    console.log('Point is inside the polygon');
}
```

---

### `isLeft(p1, p2, point): Number`

Cross product test to determine which side of a line a point lies on (used by winding number algorithm).

| Name  | Type   | Default | Description                |
|-------|--------|---------|----------------------------|
| p1    | Object | -       | First line point `{x, y}`  |
| p2    | Object | -       | Second line point `{x, y}` |
| point | Object | -       | Point to test `{x, y}`     |

**Returns:** `Number` - Positive if left, negative if right, zero if on line

**Usage Example:**

```javascript
const result = Collision.isLeft({x: 0, y: 0}, {x: 100, y: 0}, {x: 50, y: 50});
console.log('Point is to the', result > 0 ? 'left' : 'right', 'of line');
```

---

### `getIntermediatePoints(p1, p2, count): Array`

Generates intermediate points along a line segment for smoother collision detection.

| Name  | Type   | Default | Description                   |
|-------|--------|---------|-------------------------------|
| p1    | Object | -       | Start point `{x, y}`          |
| p2    | Object | -       | End point `{x, y}`            |
| count | Number | -       | Number of intermediate points |

**Returns:** `Array<{x: Number, y: Number}>` - Points along the line

**Usage Example:**

```javascript
const linePoints = Collision.getIntermediatePoints(
    {x: 0, y: 0}, {x: 100, y: 100}, 10
);
console.log('Interpolated points:', linePoints);
```

---

### `pointToLineDistance(x, y, x1, y1, x2, y2): Number`

Calculates the shortest distance from a point to a line segment.

| Name | Type   | Default | Description        |
|------|--------|---------|--------------------|
| x    | Number | -       | Point X coordinate |
| y    | Number | -       | Point Y coordinate |
| x1   | Number | -       | Line start X       |
| y1   | Number | -       | Line start Y       |
| x2   | Number | -       | Line end X         |
| y2   | Number | -       | Line end Y         |

**Returns:** `Number` - Distance from point to line

**Usage Example:**

```javascript
const distance = Collision.pointToLineDistance(50, 50, 0, 0, 100, 0);
console.log('Distance to line:', distance);

// Check if point is near a line
if (distance <= 5) {
    console.log('Point is close to the line');
}
```

---

### `optimizeCollisionPoints(points, minDistance): Array`

Removes vertices that are closer than `minDistance` to reduce collision complexity and ensures the shape is properly
closed.

| Name        | Type   | Default | Description                     |
|-------------|--------|---------|---------------------------------|
| points      | Array  | -       | Original polygon points         |
| minDistance | Number | 5       | Minimum distance between points |

**Returns:** `Array<{x: Number, y: Number}>` - Optimized point array

**Usage Example:**

```javascript
const roughPoints = [
    {x: 0, y: 0}, {x: 2, y: 1}, {x: 5, y: 0},
    {x: 100, y: 0}, {x: 98, y: 2}, {x: 100, y: 5}
];
const optimized = Collision.optimizeCollisionPoints(roughPoints, 8);
console.log('Optimized from', roughPoints.length, 'to', optimized.length, 'points');

// Use for custom collision shapes with many points
entity.collision.points = Collision.optimizeCollisionPoints(rawPoints, 10);
```

---

## Properties

| Property           | Type | Description                             |
|--------------------|------|-----------------------------------------|
| `decomposedShapes` | Map  | Cache for calculated entity vertices    |
| `activeCollisions` | Map  | Currently active collision pairs        |
| `lastPositions`    | Map  | Previous positions for change detection |
| `customPathCache`  | Map  | Cache for custom path vertices          |

---

## Events Fired on Entities

The collision system automatically triggers these events on entities when collisions occur:

| Event        | Payload                                                                   | Description                 |
|--------------|---------------------------------------------------------------------------|-----------------------------|
| `collide`    | `{entity, side, otherSide, point: {x,y}, overlap: Number, normal: {x,y}}` | Fired when collision starts |
| `collideEnd` | `{entity, side}`                                                          | Fired when collision ends   |

**Event Usage Examples:**

```javascript
// Listen for collision events
player.on('collide', (data) => {
    console.log(`Player hit ${data.entity.name} on ${data.side} side`);
    console.log(`Overlap: ${data.overlap}, Point: ${data.point.x}, ${data.point.y}`);

    if (data.side === 'bottom' && data.entity.name === 'platform') {
        player.data('onGround', true);
        player.velocity.y = 0;
    }
});

player.on('collideEnd', (data) => {
    console.log(`Player stopped colliding with ${data.entity.name}`);

    if (data.entity.name === 'platform') {
        player.data('onGround', false);
    }
});

// Enemy collision with damage
enemy.on('collide', (data) => {
    if (data.entity === player) {
        player.data('health', player.data('health') - 10);
    }
});
```

---

## Collision Groups

Entities with the same collision group will not collide with each other:

```javascript
// Set collision groups
player.collision.group = 'players';
enemy1.collision.group = 'enemies';
enemy2.collision.group = 'enemies';

// player will collide with enemies, but enemies won't collide with each other
```

---

## Performance Optimization Features

### 1. **Automatic Caching**

```javascript
// Vertices are cached until entity transforms
const vertices1 = collision.getVertices(entity); // Calculated
const vertices2 = collision.getVertices(entity); // Retrieved from cache
```

### 2. **Change Detection**

```javascript
// Cache is automatically cleared when entity changes
entity.x = 100;           // Position change detected
entity.styles.rotation = 45; // Transform change detected
// Cache cleared automatically on next collision check
```

### 3. **AABB Pre-filtering**

```javascript
// Fast AABB check before expensive SAT collision
if (!collision.checkAABBCollision(a, b)) {
    return; // Skip detailed collision detection
}
```

### 4. **Optimized Shapes**

```javascript
// Rounded rectangles use minimal points for smooth collisions
const rectVertices = collision.getRectangleVertices(entity, 10);
// Star shapes include midpoints for better accuracy
const starVertices = collision.getStarVertices(entity);
```

---

## Manual Collision Detection Workflow

For custom collision handling outside the automatic system:

### 1. **Quick AABB Test**

```javascript
if (!game.collision.checkAABBCollision(entityA, entityB, 1)) {
    return false; // No collision possible
}
```

### 2. **Detailed Collision Test**

```javascript
const collisionInfo = game.collision.detectCollisionDetailed(entityA, entityB);
if (!collisionInfo.colliding) {
    return false; // No collision
}
```

### 3. **Handle Collision Response**

```javascript
// Separate entities
entityA.x -= collisionInfo.normal.x * collisionInfo.overlap * 0.5;
entityA.y -= collisionInfo.normal.y * collisionInfo.overlap * 0.5;
entityB.x += collisionInfo.normal.x * collisionInfo.overlap * 0.5;
entityB.y += collisionInfo.normal.y * collisionInfo.overlap * 0.5;

// Apply physics response
if (collisionInfo.sideA === 'bottom') {
    entityA.velocity.y = 0;
    entityA.data('onGround', true);
}
```

---

## Advanced Custom Shapes

### **Custom Collision Points**

```javascript
entity.collision.points = [
    {x: 0, y: -50},   // Top
    {x: 50, y: 0},    // Right  
    {x: 0, y: 50},    // Bottom
    {x: -50, y: 0}    // Left
];
```

### **Custom Path Shapes**

```javascript
entity.styles.customPath = (ctx) => {
    // Draw any custom shape
    ctx.beginPath();
    ctx.moveTo(-30, -40);
    ctx.bezierCurveTo(-30, -40, -10, -40, 0, -20);
    ctx.bezierCurveTo(10, -40, 30, -40, 30, -40);
    ctx.lineTo(20, 40);
    ctx.lineTo(-20, 40);
    ctx.closePath();
};
```

### **Polygon Shapes**

```javascript
entity.styles.shape = 'polygon';
entity.styles.points = [
    {x: 0, y: -40},    // Pentagon shape
    {x: 38, y: -12},
    {x: 24, y: 32},
    {x: -24, y: 32},
    {x: -38, y: -12}
];
```

---

## Collision Shape Types

| Shape Type   | Configuration                              | Performance | Accuracy |
|--------------|--------------------------------------------|-------------|----------|
| `rectangle`  | `width`, `height`, `borderRadius`          | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐    |
| `circle`     | `width`, `height` (uses smaller dimension) | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐     |
| `triangle`   | `width`, `height`                          | ⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐    |
| `star`       | `width`, `height`, `spikes`                | ⭐⭐⭐         | ⭐⭐⭐⭐     |
| `polygon`    | `points` array                             | ⭐⭐⭐         | ⭐⭐⭐⭐⭐    |
| `customPath` | `customPath` function                      | ⭐⭐          | ⭐⭐⭐⭐⭐    |

---

## Transformation Support

The collision system fully supports all entity transformations:

### **Rotation**

```javascript
entity.styles.rotation = 45; // Degrees
// Collision shape automatically rotates
```

### **Scaling**

```javascript
entity.styles.scale = 1.5;    // Uniform scaling
entity.styles.scaleX = 2.0;   // X-axis scaling
entity.styles.scaleY = 0.5;   // Y-axis scaling
// Collision bounds scale accordingly
```

### **Skewing**

```javascript
entity.styles.skewX = 15;     // Skew along X-axis (degrees)
entity.styles.skewY = -10;    // Skew along Y-axis (degrees)
// Collision shape skews with entity
```

### **Combined Transformations**

```javascript
entity.styles.rotation = 30;
entity.styles.scale = 1.2;
entity.styles.scaleX = 1.5;
entity.styles.skewX = 10;
// All transformations applied in correct order: scale → skew → rotate → translate
```

---

## Common Use Cases

### **1. Platform Game Physics**

```javascript
// Player-Platform collision
player.on('collide', (data) => {
    const platform = data.entity;

    switch (data.side) {
        case 'bottom':
            // Landing on platform
            player.data('velocityY', 0);
            player.data('onGround', true);
            break;

        case 'top':
            // Hitting platform from below
            player.data('velocityY', 0);
            break;

        case 'left':
        case 'right':
            // Hitting wall
            player.data('velocityX', 0);
            break;
    }
});
```

### **2. Collectible Items**

```javascript
coin.on('collide', (data) => {
    if (data.entity.id === 'player') {
        // Play collection sound
        game.audio.play('coinCollect');

        // Add to player score
        player.data('score', player.data('score') + coin.value);

        // Remove coin
        coin.kill();
    }
});
```

### **3. Trigger Zones**

```javascript
// Invisible trigger zone
const triggerZone = game.append({
    x: 400, y: 300,
    width: 100, height: 100,
    visible: false,  // Invisible but still has collision
    collision: {
        enabled: true,
        group: 'triggers'
    }
});

triggerZone.on('collide', (data) => {
    if (data.entity.id === 'player') {
        // Trigger event (door open, cutscene, etc.)
        game.trigger('playerEnteredZone', {
            zone: 'secretArea',
            player: data.entity
        });
    }
});

triggerZone.on('collideEnd', (data) => {
    if (data.entity.id === 'player') {
        // Player left trigger zone
        game.trigger('playerLeftZone', {
            zone: 'secretArea',
            player: data.entity
        });
    }
});
```

---

## Technical Notes

### **Coordinate System**

- All collision calculations use entity center coordinates (`absoluteX`, `absoluteY`)
- Collision offset is applied via `entity.collision.x` and `entity.collision.y`
- Vertices are calculated relative to center, then transformed to world coordinates

### **Precision**

- Overlap calculations are rounded to 4 decimal places to avoid floating-point errors
- Custom path sampling uses binary search for accurate edge detection
- SAT algorithm uses normalized axes for consistent results

### **Memory Management**

- Vertex calculations are cached until entity transforms
- Custom path vertices are cached with path-specific keys
- All caches are automatically cleared when entities are removed

### **Thread Safety**

- The collision system is single-threaded and designed for game loop execution
- All collision events are fired synchronously during the update cycle

---

> **Important**: Entity coordinates (`absoluteX`, `absoluteY`) represent the **center** of the entity in Pixalo's
> coordinate system. The collision system automatically handles the conversion between center-based coordinates and
> collision bounds.

> **Caching**: Vertex calculations and custom path samples are automatically cached for performance. The cache is
> intelligently invalidated when entities move or transform, ensuring accuracy while maintaining speed.