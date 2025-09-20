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

const size = 100;
game.append('polygon', {
    width: size,
    height: size,
    x: (game.baseWidth  - 100) / 2,
    y: (game.baseHeight - 100) / 2,
    fill: '#268984',

    shape: 'polygon',
    points: [
        {x: -size / 2, y: -size / 2},
        {x: size / 2, y: -size / 2},
        {x: size / 2, y: 0},
        {x: 0, y: size / 2},
        {x: -size / 2, y: 0}
    ],

    // Optional: Just to understand how collision points are drawn for polygon shapes.
    collision: true,
});