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

game.addBackground('#268884', {
    id    : 'green',
    width : game.baseWidth,
    height: game.baseHeight
});

game.addBackground('#F4A81B', {
    id    : 'orange',
    width : 20,
    height: 20
});

let visible = false;
game.timer(() => {
    game.setBackgroundVisible('orange', visible = !visible);
}, 1000);