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
    physics: { gravity: { x: 0, y: 700 } }
});
game.start();

// floor
game.append('floor', {
    x: 0,
    y: game.baseHeight - 40,
    width: game.baseWidth,
    height: 40,
    backgroundColor: '#258884',
    physics: { bodyType: 'static' }
});

// domino row
const W = 20, H = 100, GAP = 10;
for (let i = 0; i < 25; i++) {
    game.append(`d${i}`, {
        x: 250 + i * (W + GAP),
        y: game.baseHeight - H - 20,
        width: W,
        height: H,
        backgroundColor: `hsl(${i * 15}, 70%, 50%)`,
        physics: { density: 1, friction: 0.4 }
    });
}

// ball to start chain
const ball = game.append('starter', {
    x: 0,
    y: game.baseHeight - 310,
    radius: 25,
    shape: 'circle',
    backgroundColor: '#F4A71A',
    physics: { density: 2 }
});
game.physics.applyImpulse(ball, { x: 20, y: 0 });