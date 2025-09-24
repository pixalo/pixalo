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
 * Click = save state
 * RightClick = restore
 **/
game.on('click', () => {
    game.camera.saveState('move');
    game.camera.moveBy(150, 80, false, 400);
}).on('rightclick', () => {
    if (game.camera.hasState('move')) {
        game.camera.loadState('move', {smooth: true, duration: 400});
    }
})

game.append('guide', {
    width: 300,
    height: 35,
    x: (game.baseWidth - 300) / 2,
    y: (game.baseHeight - 35) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Click = save \n RightClick = restore',
    font: '20px Arial',
    lineHeight: 2
});