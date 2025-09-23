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
    background: '#031C1B'
});
game.start();

const star = game.createEmitter('diamondSpinner', {
    position: { x: game.baseWidth * .5, y: game.baseHeight * .5 },
    shape: 'diamond', size: 20, color: '#00ff88', opacity: .6,
    emission: { type: 'point', rate: 60, lifetime: 2000 },
    particle: {
        velocity: { min: { x: -70, y: -160 }, max: { x: 70, y: -120 } },
        acceleration: { x: 0, y: 50 },
        size: { min: 5, max: 9 },
        color: { start: '#00ff88', end: '#ffffff' },
        alpha: { start: 1, end: 0 },
        rotation: { min: 0, max: 360 },
        rotationSpeed: { min: 360, max: 720 }
    }
});
star.start();

let dir = 1;
game.on('update', () => {
    if (star.x > game.baseWidth - 100 || star.x < 100) dir *= -1;
    star.move(star.x + dir * 2, star.y);
});