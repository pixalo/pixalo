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
    height: window.innerHeight,
    background: '#f4f4f4',
    grids: {
        width: 40,
        height: 40,
        color: 'rgba(0,0,0,0.08)',
        lineWidth: 1,
        majorGridEvery: 5,
        majorColor: 'rgba(0,0,0,0.2)',
        majorLineWidth: 1,
        minZoomToShow: 0.2,
        maxZoomToShow: 5
    }
});
game.start();
game.enableGrid();

// snake head
const head = game.append('head', {
    x: 0,
    y: 0,
    width: game.grid.width,
    height: game.grid.height,
    fill: '#268984'
});

// move head by one cell
function move (dx, dy) {
    const cx = Math.round(head.x / game.grid.width) + dx;
    const cy = Math.round(head.y / game.grid.height) + dy;
    const snapped = game.cellToWorld(cx, cy);
    head.move({
        x: snapped.x,
        y: snapped.y,
        relative: false
    });
}

// arrow keys
game.on('keydown', k => {
    if (game.isKeyPressed('up'))    move(0, -1);
    if (game.isKeyPressed('down'))  move(0, 1);
    if (game.isKeyPressed('left'))  move(-1, 0);
    if (game.isKeyPressed('right')) move(1, 0);
});

// center camera on head after each move
game.camera.follow(head);