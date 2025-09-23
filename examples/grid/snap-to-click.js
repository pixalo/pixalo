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
    background: 'white',
    grids: {
        width: 32,
        height: 32,
        color: 'rgba(0,0,0,0.15)',
        lineWidth: 1,
        majorGridEvery: 5,
        majorColor: 'rgba(0,0,0,0.35)',
        majorLineWidth: 2,
        minZoomToShow: 0.2,
        maxZoomToShow: 8
    }
});
game.start();

game.enableGrid();

// Drop a green tile on click (snapped)
game.on('click', e => {
    const {x, y} = game.snapToGrid(e.x - 10, e.y - 10);
    game.append(`tile_${Date.now()}`, {
        x, y,
        width: game.grid.width,
        height: game.grid.height,
        fill: 'green',
        opacity: 0.5
    });
});

// Keyboard: G → toggle grid, +/- → resize grid
game.on('keydown', k => {
    if (k.toLowerCase() === 'g') game.toggleGrid();
    if (k === '=' || k === '+') {
        const s = Math.min(game.grid.width * 1.5, 128);
        game.setGridSize(s);
    }
    if (k === '-' || k === '_') {
        const s = Math.max(game.grid.width / 1.5, 8);
        game.setGridSize(s);
    }
});

// Drag to pan
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
    x: 250,
    y: 10,
    fill: 'transparent',
    text: 'Click anywhere to drop a tile that auto-snaps to the nearest grid cell.'
});