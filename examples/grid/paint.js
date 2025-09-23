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
    background: '#111',
    grids: {
        width: 24,
        height: 24,
        color: 'rgba(255,255,255,0.1)',
        lineWidth: 1,
        majorGridEvery: 4,
        majorColor: 'rgba(255,255,255,0.25)',
        majorLineWidth: 1,
        minZoomToShow: 0.3,
        maxZoomToShow: 10
    }
});
game.start();
game.enableGrid();

let painting = false;
let erasing = false;

game.on(['mousedown', 'touchstart'], () => painting = true);
game.on(['mouseup', 'touchend'], () => painting = false);
game.on('keydown', k => erasing = k.toLowerCase() === 'x');
game.on('keyup', k => { if (k.toLowerCase() === 'x') erasing = false; });

game.on(['mousemove', 'touchmove'], e => {
    if (!painting) return;
    const {x, y} = game.snapToGrid(e.x - 1, e.y - 1);
    const key = `cell_${x}_${y}`;

    if (erasing) {
        game.kill(key);
    } else if (!game.find(key)) {
        game.append(key, {
            x, y,
            width: game.grid.width,
            height: game.grid.height,
            fill: `hsl(${Date.now() % 360}, 70%, 60%)`,
            opacity: 0.8
        });
    }
});

// Zoom with wheel
game.on('wheel', e => {
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    game.camera.zoomAtPoint(factor, e.screenX, e.screenY, 150, 'linear');
});

game.append('guide', {
    x: 250,
    y: 10,
    fill: 'transparent',
    text: 'Hold & drag to paint tiles; press X while dragging to erase instead.',
    color: 'white'
});