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
    width : window.innerWidth,
    height: window.innerHeight
});
game.start();

/**
 * Keyboard arrow keys move camera (edge-scroll)
 */
game.on('update', () => {
    const spd = 12;
    if (game.isKeyPressed('left'))  game.camera.moveBy(-spd, 0, true);
    if (game.isKeyPressed('right')) game.camera.moveBy(spd, 0, true);
    if (game.isKeyPressed('up'))    game.camera.moveBy(0, -spd, true);
    if (game.isKeyPressed('down'))  game.camera.moveBy(0, spd, true);
});

game.append('guide', {
    width: 160,
    height: 35,
    x: (game.baseWidth  - 160) / 2,
    y: (game.baseHeight - 35) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Camera movement with arrow keys',
    font: '20px Arial'
});