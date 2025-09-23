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

game.on('click', () => {
    /**
     * Shake camera
     */
    game.camera.shake();
});

game.append('player', {
    width: 150,
    height: 150,
    x: (game.baseWidth  - 150) / 2,
    y: (game.baseHeight - 150) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Click to shake',
    font: '40px Arial',
});
