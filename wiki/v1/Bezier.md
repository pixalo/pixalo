The Bezier class provides utility methods for working with cubic and quadratic Bezier curves. It includes functionality to calculate points along curves, generate multiple points with specified resolution, and compute curve lengths. All methods are static, making them easy to use without instantiation.

## Public Methods

### getPoint(p0, p1, p2, p3, t): Object

Calculates a single point on a cubic Bezier curve at parameter t.

| Name | Type | Default |
|------|------|---------|
| p0 | Object | - |
| p1 | Object | - |
| p2 | Object | - |
| p3 | Object | - |
| t | Number | - |

**Usage Example:**
```javascript
const startPoint = { x: 0, y: 0 };
const controlPoint1 = { x: 50, y: 100 };
const controlPoint2 = { x: 150, y: 100 };
const endPoint = { x: 200, y: 0 };

const point = Pixalo.Bezier.getPoint(startPoint, controlPoint1, controlPoint2, endPoint, 0.5);
console.log(point); // { x: 100, y: 75 }
```

### getPoints(p0, p1, p2, p3, resolution): Array

Generates an array of points along a cubic Bezier curve with specified resolution.

| Name | Type | Default |
|------|------|---------|
| p0 | Object | - |
| p1 | Object | - |
| p2 | Object | - |
| p3 | Object | - |
| resolution | Number | 20 |

**Usage Example:**
```javascript
const startPoint = { x: 0, y: 0 };
const controlPoint1 = { x: 50, y: 100 };
const controlPoint2 = { x: 150, y: 100 };
const endPoint = { x: 200, y: 0 };

const points = Pixalo.Bezier.getPoints(startPoint, controlPoint1, controlPoint2, endPoint, 10);
console.log(points.length); // 11 points (0 to 1 inclusive with resolution 10)
```

### getQuadraticPoint(p0, p1, p2, t): Object

Calculates a single point on a quadratic Bezier curve at parameter t.

| Name | Type | Default |
|------|------|---------|
| p0 | Object | - |
| p1 | Object | - |
| p2 | Object | - |
| t | Number | - |

**Usage Example:**
```javascript
const startPoint = { x: 0, y: 0 };
const controlPoint = { x: 100, y: 100 };
const endPoint = { x: 200, y: 0 };

const point = Pixalo.Bezier.getQuadraticPoint(startPoint, controlPoint, endPoint, 0.5);
console.log(point); // { x: 100, y: 50 }
```

### getLength(p0, p1, p2, p3, samples): Number

Calculates the approximate length of a cubic Bezier curve using linear approximation.

| Name | Type | Default |
|------|------|---------|
| p0 | Object | - |
| p1 | Object | - |
| p2 | Object | - |
| p3 | Object | - |
| samples | Number | 100 |

**Usage Example:**
```javascript
const startPoint = { x: 0, y: 0 };
const controlPoint1 = { x: 50, y: 100 };
const controlPoint2 = { x: 150, y: 100 };
const endPoint = { x: 200, y: 0 };

const length = Pixalo.Bezier.getLength(startPoint, controlPoint1, controlPoint2, endPoint, 50);
console.log(length); // Approximate curve length
```