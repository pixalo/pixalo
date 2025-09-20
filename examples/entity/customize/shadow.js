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
    height: window.innerHeight
});
game.start();

game.append('shadow', {
    width: 200,
    height: 200,
    x: (game.baseWidth  - 200) / 2,
    y: (game.baseHeight - 200) / 2,

    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowBlur: 6,
    shadowOffsetX: 10,
    shadowOffsetY: 10,
});