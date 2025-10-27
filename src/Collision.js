/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

class Collision {

    constructor () {
        this.decomposedShapes = new Map();
        this.activeCollisions = new Map();
        this.lastPositions    = new Map();
        this.customPathCache  = new Map();
    }

    updateCollisions (entities) {
        entities = entities.filter(e => e && e.collision?.enabled);

        const newCollisions = new Map();

        entities.forEach(entity => {
            const lastPos = this.lastPositions.get(entity.id);
            if (!lastPos ||
                lastPos.x !== entity.absoluteX + entity.collision.x ||
                lastPos.y !== entity.absoluteY + entity.collision.y ||
                lastPos.rotation !== entity.styles.rotation ||
                lastPos.scaleX !== entity.styles.scaleX ||
                lastPos.scaleY !== entity.styles.scaleY ||
                lastPos.skewX !== entity.styles.skewX ||
                lastPos.skewY !== entity.styles.skewY ||
                lastPos.borderRadius !== entity.styles.borderRadius) {
                this.clearCache(entity.id);
            }

            this.lastPositions.set(entity.id, {
                x: entity.absoluteX + entity.collision.x,
                y: entity.absoluteY + entity.collision.y,
                rotation: entity.styles.rotation,
                scaleX: entity.styles.scaleX,
                scaleY: entity.styles.scaleY,
                skewX: entity.styles.skewX,
                skewY: entity.styles.skewY,
                borderRadius: entity.styles.borderRadius
            });
        });

        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];

                if (!entityA.collision?.enabled || !entityB.collision?.enabled) continue;
                if (entityA.collision.group === entityB.collision.group) continue;

                const collisionKey  = `${entityA.id}-${entityB.id}`;
                const collisionInfo = this.detectCollisionDetailed(entityA, entityB);

                if (collisionInfo.colliding && !this.activeCollisions.has(collisionKey)) {
                    const collisionData = {
                        entityA,
                        entityB,
                        ...collisionInfo,
                        timestamp: Date.now()
                    };

                    newCollisions.set(collisionKey, collisionData);

                    // Trigger global collision event
                    if (entityA.engine) {
                        entityA.engine.trigger('collisions', collisionData);
                    }

                    // Entity-specific collision events
                    entityA.trigger('collide', {
                        entity: entityB,
                        side: collisionInfo.sideA,
                        otherSide: collisionInfo.sideB,
                        point: collisionInfo.point,
                        overlap: collisionInfo.overlap,
                        normal: collisionInfo.normal
                    });

                    entityB.trigger('collide', {
                        entity: entityA,
                        side: collisionInfo.sideB,
                        otherSide: collisionInfo.sideA,
                        point: collisionInfo.point,
                        overlap: collisionInfo.overlap,
                        normal: {
                            x: -collisionInfo.normal.x,
                            y: -collisionInfo.normal.y
                        }
                    });
                }
            }
        }

        // Review of completed encounters
        for (const [key, collision] of this.activeCollisions) {
            if (!newCollisions.has(key)) {
                const {entityA, entityB, sideA, sideB} = collision;
                const timestamp = Date.now();

                // Trigger global collisionEnd event
                if (entityA.engine) {
                    entityA.engine.trigger('collisionEnd', {
                        colliding: false,
                        entityA, entityB,
                        sideA, sideB,
                        timestamp
                    });
                }

                // Entity-specific collisionEnd events
                entityA.trigger('collideEnd', {entity: entityB, side: sideA, timestamp});
                entityB.trigger('collideEnd', {entity: entityA, side: sideB, timestamp});
            }
        }

        this.activeCollisions = newCollisions;
    }

    /** ======== COLLISIONS ======== */
    detectCollisionDetailed (entityA, entityB) {
        // Adding a threshold for borderRadius
        const hasRoundedCorners = entityA.styles.borderRadius > 0 || entityB.styles.borderRadius > 0;
        const threshold = hasRoundedCorners ? Math.max(entityA.styles.borderRadius, entityB.styles.borderRadius) * 0.2 : 0;

        if (!this.checkAABBCollision(entityA, entityB, threshold)) {
            return {colliding: false};
        }

        // Collision detection based on the shape of entities
        if (entityA.styles.shape === 'circle' && entityB.styles.shape === 'circle') {
            return this.detectCircleCollision(entityA, entityB);
        }

        const vertices1 = this.getVertices(entityA);
        const vertices2 = this.getVertices(entityB);

        return this.detectSATCollision(vertices1, vertices2, entityA, entityB, threshold);
    }
    detectCircleCollision (circle1, circle2) {
        const radius1 = Math.min(circle1.collision.width, circle1.collision.height) / 2;
        const radius2 = Math.min(circle2.collision.width, circle2.collision.height) / 2;

        const center1 = {
            x: circle1.absoluteX + circle1.collision.x + circle1.collision.width / 2,
            y: circle1.absoluteY + circle1.collision.y + circle1.collision.height / 2
        };
        const center2 = {
            x: circle2.absoluteX + circle2.collision.x + circle2.collision.width / 2,
            y: circle2.absoluteY + circle2.collision.y + circle2.collision.height / 2
        };

        const dx = center2.x - center1.x;
        const dy = center2.y - center1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const totalRadius = radius1 + radius2;

        if (distance >= totalRadius) {
            return {colliding: false};
        }

        const overlap = totalRadius - distance;
        const normal = {
            x: dx / distance,
            y: dy / distance
        };

        return {
            colliding: true,
            sideA: this.getSideFromNormal(normal),
            sideB: this.getSideFromNormal({x: -normal.x, y: -normal.y}),
            point: {
                x: center1.x + normal.x * radius1,
                y: center1.y + normal.y * radius1
            },
            overlap,
            normal
        };
    }
    detectSATCollision (vertices1, vertices2, entityA, entityB, threshold = 0) {
        let minOverlap = Infinity;
        let collisionNormal = {x: 0, y: 0};

        const axes = this.getAxes(vertices1).concat(this.getAxes(vertices2));

        for (const axis of axes) {
            const projection1 = this.projectVertices(vertices1, axis);
            const projection2 = this.projectVertices(vertices2, axis);

            const overlap = this.getOverlap(projection1, projection2) - threshold;

            if (overlap <= 0)
                return {colliding: false};

            if (overlap < minOverlap) {
                minOverlap = overlap;
                collisionNormal = axis;
            }
        }

        const collisionPoint = this.findCollisionPoint(vertices1, vertices2);

        // Calculating the center of two objects
        const center1 = this.getEntityCenter(entityA);
        const center2 = this.getEntityCenter(entityB);

        // Calculate the vector from the center of `entityA` to the center of `entityB`
        const directionVector = {
            x: center2.x - center1.x,
            y: center2.y - center1.y
        };

        // If the dot product of the direction vector and the normal is negative, invert the normal.
        const dotProduct = directionVector.x * collisionNormal.x + directionVector.y * collisionNormal.y;
        if (dotProduct < 0) {
            collisionNormal.x = -collisionNormal.x;
            collisionNormal.y = -collisionNormal.y;
        }

        const sideA = this.getSideFromNormal(collisionNormal);
        const sideB = this.getOppositeSide(sideA);

        return {
            colliding: true,
            sideA,
            sideB,
            point: collisionPoint,
            overlap: minOverlap,
            normal: collisionNormal
        };
    }
    getEntityCenter(entity) {
        return {
            x: entity.absoluteX + entity.collision.x + entity.collision.width / 2,
            y: entity.absoluteY + entity.collision.y + entity.collision.height / 2
        };
    }
    checkAABBCollision (entityA, entityB, threshold = 0) {
        const bounds1 = this.getAABB(entityA);
        const bounds2 = this.getAABB(entityB);

        // Applying thresholds in AABB analysis
        return (bounds1.minX - threshold) <= (bounds2.maxX + threshold) &&
            (bounds1.maxX + threshold) >= (bounds2.minX - threshold) &&
            (bounds1.minY - threshold) <= (bounds2.maxY + threshold) &&
            (bounds1.maxY + threshold) >= (bounds2.minY - threshold);
    }
    getSideFromNormal(normal) {
        const angle = Math.atan2(normal.y, normal.x) * 180 / Math.PI;

        if (angle > -45 && angle <= 45) return 'right';
        if (angle > 45 && angle <= 135) return 'bottom';
        if (angle > 135 || angle <= -135) return 'left';
        return 'top';
    }
    getSideFromCenters (entityA, entityB) {
        const cxA = entityA.absoluteX + (entityA.width >> 1);
        const cyA = entityA.absoluteY + (entityA.height >> 1);
        const cxB = entityB.absoluteX + (entityB.width >> 1);
        const cyB = entityB.absoluteY + (entityB.height >> 1);

        const dx = cxA - cxB;
        const dy = cyA - cyB;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);

        if (adx > ady) return dx > 0 ? 'right' : 'left';
        return dy > 0 ? 'bottom' : 'top';
    }
    getOppositeSide (side) {
        const opposites = {
            'left': 'right',
            'right': 'left',
            'top': 'bottom',
            'bottom': 'top'
        };
        return opposites[side];
    }
    /** ======== END ======== */

    /** ======== POINTS & VERTICES ======== */
    getOverlap (projection1, projection2) {
        // Increasing the accuracy of calculations by eliminating decimal errors
        const overlap = Math.min(
            projection1.max - projection2.min,
            projection2.max - projection1.min
        );

        // Rounding to 4 decimal places to avoid calculation errors
        return Math.round(overlap * 10000) / 10000;
    }
    getAABB (entity) {
        const vertices = this.getVertices(entity);
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        vertices.forEach(vertex => {
            minX = Math.min(minX, vertex.x);
            minY = Math.min(minY, vertex.y);
            maxX = Math.max(maxX, vertex.x);
            maxY = Math.max(maxY, vertex.y);
        });

        return {minX, minY, maxX, maxY};
    }
    getAxes (vertices) {
        const axes = [];
        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];
            const edge = {
                x: next.x - current.x,
                y: next.y - current.y
            };
            const normal = {
                x: -edge.y,
                y: edge.x
            };
            const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            if (length !== 0) {
                axes.push({
                    x: normal.x / length,
                    y: normal.y / length
                });
            }
        }
        return axes;
    }
    projectVertices (vertices, axis) {
        let min = Infinity;
        let max = -Infinity;

        vertices.forEach(vertex => {
            const projection = vertex.x * axis.x + vertex.y * axis.y;
            min = Math.min(min, projection);
            max = Math.max(max, projection);
        });

        return {min, max};
    }
    getVertices (entity) {
        if (this.decomposedShapes.has(entity.id)) {
            return this.decomposedShapes.get(entity.id);
        }

        let vertices;

        // First check collision.points
        if (entity.collision.points && entity.collision.points.length >= 3) {
            vertices = entity.collision.points;
        }
        // Then check customPath
        else if (entity.styles.customPath) {
            vertices = this.getCustomPathVertices(entity);
        }
        // Finally, check the default shapes.
        else {
            switch (entity.styles.shape) {
                case 'star':
                    vertices = this.getStarVertices(entity);
                    break;
                case 'circle':
                    vertices = this.getCircleVertices(entity);
                    break;
                case 'triangle':
                    vertices = this.getTriangleVertices(entity);
                    break;
                case 'polygon':
                    vertices = entity.styles.points;
                    break;
                default:
                    vertices = this.getRectangleVertices(entity, entity.styles.borderRadius);
            }
        }

        vertices = this.applyTransformations(vertices, entity);
        this.decomposedShapes.set(entity.id, vertices);
        return vertices;
    }
    getStarVertices (entity) {
        const outerRadius = Math.min(entity.collision.width, entity.collision.height) / 2;
        const innerRadius = outerRadius * 0.4;  // We reduce the ratio of the inner to outer radius.
        const spikes = entity.styles.spikes || 5;
        const vertices = [];
        const angleStep = Math.PI / spikes;

        // Increase accuracy by calculating more points
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = angleStep * i - Math.PI / 2;
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });

            // Adding midpoints for more accuracy
            if (i < spikes * 2 - 1) {
                const nextRadius = (i + 1) % 2 === 0 ? outerRadius : innerRadius;
                const nextAngle = angleStep * (i + 1) - Math.PI / 2;

                // Midpoint between two vertices
                const midX = (Math.cos(angle) * radius + Math.cos(nextAngle) * nextRadius) / 2;
                const midY = (Math.sin(angle) * radius + Math.sin(nextAngle) * nextRadius) / 2;

                vertices.push({
                    x: midX,
                    y: midY
                });
            }
        }

        return vertices;
    }
    getCircleVertices (entity, segments = 16) {
        const vertices = [];
        const radius = Math.min(entity.collision.width, entity.collision.height) / 2;

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }

        return vertices;
    }
    getTriangleVertices (entity) {
        const w = entity.collision.width / 2;
        const h = entity.collision.height / 2;
        return [
            {x: 0, y: -h},
            {x: w, y: h},
            {x: -w, y: h}
        ];
    }
    getRectangleVertices (entity, radius) {
        const w = entity.collision.width / 2;
        const h = entity.collision.height / 2;

        if (!radius) {
            return [
                {x: -w, y: -h},
                {x: w, y: -h},
                {x: w, y: h},
                {x: -w, y: h}
            ];
        }

        // Limit corner radius to half of the smallest dimension
        const r = Math.min(radius, Math.min(w, h));
        const vertices = [];

        // Reduce the number of points for each rounded corner to 4 points
        // This makes the collision smoother and more natural.
        const segments = 4;

        // Straight points between corners
        vertices.push({x: w - r, y: -h}); // UP
        vertices.push({x: -w + r, y: -h});

        vertices.push({x: -w, y: -h + r}); // LEFT
        vertices.push({x: -w, y: h - r});

        vertices.push({x: -w + r, y: h}); // DOWN
        vertices.push({x: w - r, y: h});

        vertices.push({x: w, y: h - r}); // RIGHT
        vertices.push({x: w, y: -h + r});

        // Adding rounded corner points
        this.addRoundedCornerVertices(vertices, w - r, -h + r, r, 0, segments); // UP-RIGHT
        this.addRoundedCornerVertices(vertices, -w + r, -h + r, r, Math.PI / 2, segments); // UP-LEFT
        this.addRoundedCornerVertices(vertices, -w + r, h - r, r, Math.PI, segments); // DOWN-LEFT
        this.addRoundedCornerVertices(vertices, w - r, h - r, r, Math.PI * 3 / 2, segments); // DOWN-RIGHT

        return vertices;
    }
    addRoundedCornerVertices (vertices, centerX, centerY, radius, startAngle, segments) {
        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + (Math.PI / 2) * (i / segments);
            vertices.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }
    }
    getCustomPathVertices (entity) {
        const cacheKey = `${entity.id}-${entity.styles.customPath}`;
        if (this.customPathCache.has(cacheKey)) {
            return this.customPathCache.get(cacheKey);
        }

        // Create a temporary canvas to draw a path
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = entity.collision.width;
        tempCanvas.height = entity.collision.height;

        // Draw a path
        tempCtx.save();
        tempCtx.translate(entity.collision.width / 2, entity.collision.height / 2);

        // CustomPath implementation
        entity.styles.customPath(tempCtx);

        // Extracting points from a path using isPointInPath
        const vertices = this.samplePathPoints(tempCtx, entity.collision.width, entity.collision.height);

        tempCtx.restore();

        // Cache
        this.customPathCache.set(cacheKey, vertices);

        return vertices;
    }

    findCollisionPoint (vertices1, vertices2) {
        let closestDistance = Infinity;
        let collisionPoint = {x: 0, y: 0};

        vertices1.forEach(v1 => {
            vertices2.forEach(v2 => {
                const dx = v2.x - v1.x;
                const dy = v2.y - v1.y;
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared < closestDistance) {
                    closestDistance = distanceSquared;
                    collisionPoint = {
                        x: v1.x + dx / 2,
                        y: v1.y + dy / 2
                    };
                }
            });
        });

        return collisionPoint;
    }
    samplePathPoints (ctx, width, height, samples = 16) {
        const vertices = [];
        const padding = 2; // Distance from edges
        const bounds = {
            minX: -width / 2 + padding,
            maxX: width / 2 - padding,
            minY: -height / 2 + padding,
            maxY: height / 2 - padding
        };

        // Sampling points in the shape's perimeter
        for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / samples) {
            let minR = 0;
            let maxR = Math.max(width, height);
            let bestR = maxR;

            // Binary search to find path edges
            for (let i = 0; i < 8; i++) { // 8 steps of searching
                const r = (minR + maxR) / 2;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;

                if (this.isPointInBounds(x, y, bounds) && ctx.isPointInPath(x + width / 2, y + height / 2)) {
                    bestR = r;
                    maxR = r;
                } else {
                    minR = r;
                }
            }

            const x = Math.cos(angle) * bestR;
            const y = Math.sin(angle) * bestR;

            if (this.isPointInBounds(x, y, bounds)) {
                vertices.push({x, y});
            }
        }

        // Adding midpoints for more accuracy
        if (vertices.length > 2) {
            const refinedVertices = [];
            for (let i = 0; i < vertices.length; i++) {
                const current = vertices[i];
                const next = vertices[(i + 1) % vertices.length];

                refinedVertices.push(current);

                // Midpoint
                refinedVertices.push({
                    x: (current.x + next.x) / 2,
                    y: (current.y + next.y) / 2
                });
            }
            return refinedVertices;
        }

        return vertices;
    }
    isPointInBounds (x, y, bounds) {
        return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
    }
    applyTransformations (vertices, entity) {
        const rad = entity.styles.rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const scaleX = entity.styles.scale * entity.styles.scaleX;
        const scaleY = entity.styles.scale * entity.styles.scaleY;
        const skewX = Math.tan(entity.styles.skewX * Math.PI / 180);
        const skewY = Math.tan(entity.styles.skewY * Math.PI / 180);

        return vertices.map(v => {
            // Apply scale
            let x = v.x * scaleX;
            let y = v.y * scaleY;

            // Apply skew
            x += y * skewX;
            y += x * skewY;

            // Apply rotation
            const rotatedX = x * cos - y * sin;
            const rotatedY = x * sin + y * cos;

            // Apply position
            return {
                x: rotatedX + entity.absoluteX + entity.collision.x + entity.collision.width / 2,
                y: rotatedY + entity.absoluteY + entity.collision.y + entity.collision.height / 2
            };
        });
    }
    /** ======== VERTICES ======== */

    /** ======== UTILS ======== */
    static isPointInCollisionPoints (x, y, points, tolerance = 2) {
        // First we check if the point is on the following lines
        if (this.isPointOnBezierCurves(x, y, points, tolerance))
            return true;

        // If it is not on the curves, we check whether it is inside the shape or not.
        // Using the improved winding number algorithm
        return this.isPointInShape(x, y, points);
    }
    static isPointInTriangle (x, y, width, height) {
        const x1 = 0;
        const y1 = -height / 2;
        const x2 = width / 2;
        const y2 = height / 2;
        const x3 = -width / 2;
        const y3 = height / 2;

        const d1 = (x - x3) * (y1 - y3) - (x1 - x3) * (y - y3);
        const d2 = (x - x1) * (y2 - y1) - (x2 - x1) * (y - y1);
        const d3 = (x - x2) * (y3 - y2) - (x3 - x2) * (y - y2);

        return (d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0);
    }
    static isPointOnBezierCurves (x, y, points, tolerance) {
        // Checking the distance to all curved parts with high accuracy
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            // Calculate midpoints between two control points for greater accuracy
            const subPoints = this.getIntermediatePoints(p1, p2, 10);

            for (let j = 0; j < subPoints.length - 1; j++) {
                const sp1 = subPoints[j];
                const sp2 = subPoints[j + 1];
                const distance = this.pointToLineDistance(x, y, sp1.x, sp1.y, sp2.x, sp2.y);
                if (distance <= tolerance) {
                    return true;
                }
            }
        }

        // Check the line connecting the last point to the first.
        if (points.length > 0) {
            const first = points[0];
            const last = points[points.length - 1];
            const subPoints = this.getIntermediatePoints(last, first, 10);

            for (let i = 0; i < subPoints.length - 1; i++) {
                const sp1 = subPoints[i];
                const sp2 = subPoints[i + 1];
                const distance = this.pointToLineDistance(x, y, sp1.x, sp1.y, sp2.x, sp2.y);
                if (distance <= tolerance) {
                    return true;
                }
            }
        }

        return false;
    }
    static isPointInShape (x, y, points) {
        let wn = 0; // winding number

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            if (p1.y <= y) {
                if (p2.y > y) {
                    if (this.isLeft(p1, p2, {x, y}) > 0) {
                        wn++;
                    }
                }
            } else {
                if (p2.y <= y) {
                    if (this.isLeft(p1, p2, {x, y}) < 0) {
                        wn--;
                    }
                }
            }
        }

        return wn !== 0;
    }
    static isLeft (p1, p2, point) {
        return ((p2.x - p1.x) * (point.y - p1.y) - (point.x - p1.x) * (p2.y - p1.y));
    }
    static getIntermediatePoints (p1, p2, count) {
        const points = [];
        for (let i = 0; i <= count; i++) {
            const t = i / count;
            points.push({
                x: p1.x + (p2.x - p1.x) * t,
                y: p1.y + (p2.y - p1.y) * t
            });
        }
        return points;
    }
    static pointToLineDistance (x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;

        if (len_sq !== 0) {
            param = dot / len_sq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }
    static optimizeCollisionPoints (points, minDistance = 5) {
        if (points.length <= 2) return points;

        const optimizedPoints = [points[0]];
        let lastPoint = points[0];

        for (let i = 1; i < points.length; i++) {
            const currentPoint = points[i];
            const dx = currentPoint.x - lastPoint.x;
            const dy = currentPoint.y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance >= minDistance) {
                optimizedPoints.push(currentPoint);
                lastPoint = currentPoint;
            }
        }

        // Ensure the shape is closed.
        if (optimizedPoints[0] !== optimizedPoints[optimizedPoints.length - 1]) {
            optimizedPoints.push(optimizedPoints[0]);
        }

        return optimizedPoints;
    }
    /** ======== END ======== */

    /** ======== CONTROLS ======== */
    remove (entity) {
        this.decomposedShapes.delete(entity.id);
        this.lastPositions.delete(entity.id);

        const collisionsToRemove = [];
        this.activeCollisions.forEach((collision, key) => {
            if (collision.entityA.id === entity.id || collision.entityB.id === entity.id) {
                collisionsToRemove.push(key);
            }
        });

        collisionsToRemove.forEach(key => {
            const collision = this.activeCollisions.get(key);
            if (collision) {
                const otherEntity = collision.entityA.id === entity.id ? collision.entityB : collision.entityA;
                const otherSide = collision.entityA.id === entity.id ? collision.sideB : collision.sideA;
                otherEntity.trigger('collideEnd', {entity, side: otherSide});
                this.activeCollisions.delete(key);
            }
        });
    }
    clearCache (entityId) {
        this.decomposedShapes.delete(entityId);
    }
    reset () {
        this.decomposedShapes.clear();
        this.activeCollisions.clear();
        this.lastPositions.clear();
        this.customPathCache.clear();
    }
    /** ======== END ======== */

}

export default Collision;