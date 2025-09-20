/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from '../../../src/index.js';

const game = new Pixalo('#canvas', {
    fps: 60,
    width : window.innerWidth,
    height: window.innerHeight,
    debugger: true
});
game.start();

game.append('clip_triangle', {
    width: 100,
    height: 100,
    x: (game.baseWidth - 100) / 2,
    y: (game.baseHeight - 100) / 2,
    fill: '#f3a71a',

    // Triangle
    clip: [
        { x: 0, y: -50 },
        { x: 50, y: 50 },
        { x: -50, y: 50 }
    ],

    // Clip collision points
    collision: {
        points: [
            { x: 0, y: -50 },
            { x: 50, y: 50 },
            { x: -50, y: 50 }
        ]
    },
});

game.append('clip_circle', {
    width: 100,
    height: 100,
    x: (game.baseWidth - 300) / 2,
    y: (game.baseHeight - 300) / 2,
    fill: '#268985',

    clip (ctx) {
        const r = Math.min(this.width, this.height) / 2;
        ctx.arc(0, 0, r, 0, Math.PI * 2);
    },

    // Circular collision ready for this shape
    shape: 'circle',
    collision: true

    // Or define the collision points
    // collision: {
    //     points: circlePoints(0, 0, 50)
    // }
});

// Generate circle points
function circlePoints (cx, cy, r, segments = 8) {
    const pts = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        pts.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r
        });
    }
    return pts;
}