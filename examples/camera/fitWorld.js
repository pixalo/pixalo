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

/**
 * Zoom-to-fit entire world on R key
 */
game.on('keydown', k => k === 'r' && game.camera.focusOnRect({
    x: 0, y: 0,
    width: game.baseWidth * 2,
    height: game.baseHeight * 2
}));

game.append('guide', {
    width: 260,
    height: 35,
    x: (game.baseWidth - 260) / 2,
    y: (game.baseHeight - 35) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Zoom-to-fit entire world on R key',
    font: '20px Arial'
});