The Collision class is a comprehensive collision detection system that handles collision detection between various geometric shapes including rectangles, circles, triangles, stars, polygons, and custom paths. This class uses advanced algorithms like Separating Axis Theorem (SAT) for precise collision detection and supports complex transformations including rotation, scaling, and skewing.

> :warning: Note: This class is managed and updated automatically by the Pixalo class. You don't need to call methods from this class directly unless you want to perform custom operations or advanced collision handling.

## Public Methods

### `updateCollisions(entities): void`

Updates collision detection for all provided entities and triggers collision events.
> :warning: This method is automatically called in the Pixalo class. You don't need to call this method unless you want to do customization elsewhere.

| Name | Type | Default |
|------|------|---------|
| entities | Array | - |

**Usage Example:**
```javascript
// Typically handled automatically by Pixalo, but can be called manually
game.collision.updateCollisions([entity1, entity2, entity3]);
```

### `detectCollisionDetailed(entity1, entity2): Object`

Performs detailed collision detection between two entities and returns comprehensive collision information.

| Name | Type | Default |
|------|------|---------|
| entity1 | Object | - |
| entity2 | Object | - |

**Usage Example:**
```javascript
const collisionInfo = game.collision.detectCollisionDetailed(player, enemy);
if (collisionInfo.colliding) {
    console.log('Collision detected!', collisionInfo);
}
```

### `detectCircleCollision(circle1, circle2): Object`

Specialized collision detection method for circular entities.

| Name | Type | Default |
|------|------|---------|
| circle1 | Object | - |
| circle2 | Object | - |

**Usage Example:**
```javascript
const result = game.collision.detectCircleCollision(ball1, ball2);
if (result.colliding) {
    console.log('Circles are colliding with overlap:', result.overlap);
}
```

### `detectSATCollision(vertices1, vertices2, entity1, entity2, threshold): Object`

Performs Separating Axis Theorem collision detection between two sets of vertices.

| Name | Type | Default |
|------|------|---------|
| vertices1 | Array | - |
| vertices2 | Array | - |
| entity1 | Object | - |
| entity2 | Object | - |
| threshold | Number | 0 |

**Usage Example:**
```javascript
const vertices1 = game.collision.getVertices(entity1);
const vertices2 = game.collision.getVertices(entity2);
const collision = game.collision.detectSATCollision(vertices1, vertices2, entity1, entity2, 2);
```

### `checkAABBCollision(entity1, entity2, threshold): Boolean`

Performs Axis-Aligned Bounding Box collision detection for quick collision filtering.

| Name | Type | Default |
|------|------|---------|
| entity1 | Object | - |
| entity2 | Object | - |
| threshold | Number | 0 |

**Usage Example:**
```javascript
const hasAABBCollision = game.collision.checkAABBCollision(player, wall, 1);
if (hasAABBCollision) {
    // Proceed with detailed collision detection
}
```

### `getVertices(entity): Array`

Retrieves or calculates the vertices for an entity based on its shape and transformations.

| Name | Type | Default |
|------|------|---------|
| entity | Object | - |

**Usage Example:**
```javascript
const vertices = game.collision.getVertices(myEntity);
console.log('Entity vertices:', vertices);
```

### `getStarVertices(entity): Array`

Generates vertices for star-shaped entities with configurable spikes.

| Name | Type | Default |
|------|------|---------|
| entity | Object | - |

**Usage Example:**
```javascript
const starVertices = game.collision.getStarVertices(starEntity);
```

### `getCircleVertices(entity, segments): Array`

Generates vertices for circular entities by approximating the circle with polygon segments.

| Name | Type | Default |
|------|------|---------|
| entity | Object | - |
| segments | Number | 16 |

**Usage Example:**
```javascript
const circleVertices = game.collision.getCircleVertices(ball, 24);
```

### `getTriangleVertices(entity): Array`

Generates vertices for triangular entities.

| Name | Type | Default |
|------|------|---------|
| entity | Object | - |

**Usage Example:**
```javascript
const triangleVertices = game.collision.getTriangleVertices(triangleEntity);
```

### `getRectangleVertices(entity, radius): Array`

Generates vertices for rectangular entities with optional rounded corners.

| Name | Type | Default |
|------|------|---------|
| entity | Object | - |
| radius | Number | - |

**Usage Example:**
```javascript
const rectVertices = game.collision.getRectangleVertices(box, 10);
```

### `getCustomPathVertices(entity): Array`

Generates vertices for entities with custom path shapes by sampling points from the path.

| Name | Type | Default |
|------|------|---------|
| entity | Object | - |

**Usage Example:**
```javascript
const customVertices = game.collision.getCustomPathVertices(customShapeEntity);
```

### `applyTransformations(vertices, entity): Array`

Applies transformations (rotation, scaling, skewing, positioning) to a set of vertices.

| Name | Type | Default |
|------|------|---------|
| vertices | Array | - |
| entity | Object | - |

**Usage Example:**
```javascript
const originalVertices = [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}];
const transformedVertices = game.collision.applyTransformations(originalVertices, rotatedEntity);
```

### `findCollisionPoint(vertices1, vertices2): Object`

Finds the approximate collision point between two sets of vertices.

| Name | Type | Default |
|------|------|---------|
| vertices1 | Array | - |
| vertices2 | Array | - |

**Usage Example:**
```javascript
const collisionPoint = game.collision.findCollisionPoint(playerVertices, enemyVertices);
console.log('Collision occurred at:', collisionPoint);
```

### `getAABB(entity): Object`

Calculates the Axis-Aligned Bounding Box for an entity.

| Name | Type | Default |
|------|------|---------|
| entity | Object | - |

**Usage Example:**
```javascript
const boundingBox = game.collision.getAABB(entity);
console.log('AABB:', boundingBox); // {minX, minY, maxX, maxY}
```

### `remove(entity): void`

Removes an entity from collision tracking and cleans up related data.

| Name | Type | Default |
|------|------|---------|
| entity | Object | - |

**Usage Example:**
```javascript
// Remove entity from collision system
game.collision.remove(destroyedEnemy);
```

### `clearCache(entityId): void`

Clears cached collision data for a specific entity.

| Name | Type | Default |
|------|------|---------|
| entityId | String/Number | - |

**Usage Example:**
```javascript
// Clear collision cache for an entity
game.collision.clearCache(entity.id);
```

### `reset(): void`

Resets the entire collision system, clearing all cached data and active collisions.

**Usage Example:**
```javascript
// Reset collision system (useful for scene changes)
game.collision.reset();
```

## Events

The collision system automatically triggers the following events:

### Entity Events
- **`collide`**: Fired on entity when a collision starts with another entity
- **`collideEnd`**: Fired on entity when a collision ends with another entity

These events are automatically triggered by the Pixalo framework and provide detailed collision information including collision point, overlap amount, surface normals, and collision sides.

## Static Utility Methods

### `isPointInCollisionPoints(x, y, points, tolerance): Boolean`

Checks if a point is within or on the boundary of a shape defined by collision points.

| Name | Type | Default |
|------|------|---------|
| x | Number | - |
| y | Number | - |
| points | Array | - |
| tolerance | Number | 2 |

**Usage Example:**
```javascript
const isInside = game.collision.constructor.isPointInCollisionPoints(100, 150, shapePoints, 3);
```

### `isPointInTriangle(x, y, width, height): Boolean`

Checks if a point is inside a triangle with specified dimensions.

| Name | Type | Default |
|------|------|---------|
| x | Number | - |
| y | Number | - |
| width | Number | - |
| height | Number | - |

**Usage Example:**
```javascript
const isInTriangle = game.collision.constructor.isPointInTriangle(50, 25, 100, 100);
```

### `optimizeCollisionPoints(points, minDistance): Array`

Optimizes collision points by removing points that are too close together.

| Name | Type | Default |
|------|------|---------|
| points | Array | - |
| minDistance | Number | 5 |

**Usage Example:**
```javascript
const optimizedPoints = game.collision.constructor.optimizeCollisionPoints(rawPoints, 8);
```