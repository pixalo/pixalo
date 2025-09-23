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
    width: window.innerWidth,
    height: window.innerHeight
});
game.start();

// Adjusting the camera movement range
game.camera.setBounds({
    x: 0,
    y: 0,
    width: game.baseWidth * 1.2,
    height: game.baseHeight * 1.2
});

// Moving the camera with the keyboard
game.on('update', () => {
    const spd = 10;
    if (game.isKeyPressed('left'))  game.camera.moveBy(-spd, 0, true);
    if (game.isKeyPressed('right')) game.camera.moveBy(spd, 0, true);
    if (game.isKeyPressed('up'))    game.camera.moveBy(0, -spd, true);
    if (game.isKeyPressed('down'))  game.camera.moveBy(0, spd, true);
});

// Guide
game.append('guide', {
    width: 300,
    height: 35,
    x: (game.baseWidth - 300) / 2,
    y: (game.baseHeight - 35) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Use arrow keys to move camera\nCamera is bounded to world edges',
    font: '20px Arial',
    lineHeight: 2
});