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
    background: '#031C1B',
    physics: { gravity: { x: 0, y: 600 } }
});
game.start();

// ground
game.append('ground', {
    x: 0, y: game.baseHeight - 40,
    width: game.baseWidth, height: 40,
    fill: '#2ecc71',
    physics: { bodyType: 'static' }
});

// drop a ball every click
game.on('click', ({ worldX, worldY }) => {
    game.append(`b${Date.now()}`, {
        x: worldX, y: worldY, radius: 20,
        shape: 'circle', fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
        draggable: true,
        physics: { restitution: 0.9, density: 1 }
    });
});