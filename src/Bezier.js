/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

class Bezier {

    static getPoint (p0, p1, p2, p3, t) {
        const mt = 1 - t;
        return {
            x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
            y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
        };
    }

    static getPoints (p0, p1, p2, p3, resolution = 20) {
        const points = [];
        for (let t = 0; t <= 1; t += 1 / resolution) {
            points.push(this.getPoint(p0, p1, p2, p3, t));
        }
        return points;
    }

    static getQuadraticPoint (p0, p1, p2, t) {
        const mt = 1 - t;
        return {
            x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
            y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
        };
    }

    static getLength (p0, p1, p2, p3, samples = 100) {
        let length = 0;
        let lastPoint = this.getPoint(p0, p1, p2, p3, 0);

        for (let i = 1; i <= samples; i++) {
            const t = i / samples;
            const point = this.getPoint(p0, p1, p2, p3, t);
            const dx = point.x - lastPoint.x;
            const dy = point.y - lastPoint.y;
            length += Math.sqrt(dx * dx + dy * dy);
            lastPoint = point;
        }

        return length;
    }

}

export default Bezier;