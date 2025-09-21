/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from 'http://cdn.jsdelivr.net/gh/pixalo/pixalo@master/dist/pixalo.esm.js';

const game = new Pixalo('#canvas', {
    fps: 60,
    width : window.innerWidth,
    height: window.innerHeight
});
game.start();

const visibility = game.append('visibility', {
    width: 100,
    height: 100,
    x: (game.baseWidth  - 100) / 2,
    y: (game.baseHeight - 100) / 2,
    fill: '#268984',

    visible: true
});

game.timer(() => {

    if (visibility.styles.visible)
        visibility.hide();
    else
        visibility.show();

}, 500);