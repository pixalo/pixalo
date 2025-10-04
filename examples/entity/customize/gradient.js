/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from 'https://cdn.jsdelivr.net/gh/pixalo/pixalo@master/dist/pixalo.esm.js';

const game = new Pixalo('#canvas', {
    fps: 60,
    width : window.innerWidth,
    height: window.innerHeight
});
game.start();

game.append('background', {
    width: 100,
    height: 100,
    x: (game.baseWidth  - 100) / 2,
    y: (game.baseHeight - 100) / 2,

    backgroundGradient: {
        type: 'linear', // or 'radial'
        stops: [
            {offset: 0, color: '#ff0000'},
            {offset: 1, color: '#0000ff'}
        ],
        x1: 0, y1: 0, x2: 100, y2: 100 // for linear gradients
    }
});