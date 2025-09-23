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
 * Drag to pan
 */
let dragging = false, last = null;
game.on(['mousedown', 'touchstart'], e => {
    dragging = true;
    last = {x: e.screenX, y: e.screenY};
});
game.on(['mouseup', 'touchend'], () => {
    dragging = false;
    last = null;
});
game.on(['mousemove', 'touchmove'], e => {
    if (!dragging || !last) return;
    const dx = e.screenX - last.x, dy = e.screenY - last.y;
    game.camera.moveBy(-dx, -dy, true);
    last = {x: e.screenX, y: e.screenY};
});

game.append('guide', {
    width: 250,
    height: 35,
    x: (game.baseWidth - 250) / 2,
    y: (game.baseHeight - 35) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Drag to pan',
    font: '20px Arial'
});