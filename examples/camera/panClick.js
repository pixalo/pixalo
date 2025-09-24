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
 * Click anywhere to pan the camera there with smooth animation
 */
game.on('click', e => {
    const x = e.worldX - game.baseWidth / 2;
    const y = e.worldY - game.baseHeight / 2;
    game.camera.moveTo(x, y, false, 600);
});

game.append('guide', {
    width: 160,
    height: 35,
    x: (game.baseWidth  - 160) / 2,
    y: (game.baseHeight - 35) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Click anywhere to pan the camera \n there with smooth animation',
    font: '20px Arial',
    lineHeight: 2
});