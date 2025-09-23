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
    width: innerWidth,
    height: innerHeight,
    background: '#031C1B'
});
game.start();

const lineEm = game.createEmitter('lineFire', {
    position: { x: innerWidth * 0.5, y: innerHeight * 0.5 },
    shape: 'invisible',

    emission: {
        type: 'line',
        start: { x: -100, y: 0 }, // Line starting point (relative to position)
        end  : { x: 100,  y: 0 }, // End point of the line
        rate: 80,
        lifetime: 900
    },

    particle: {
        velocity: { min: { x: -20, y: -120 }, max: { x: 20, y: -80 } },
        acceleration: { x: 0, y: -40 },
        size: { min: 3, max: 6 },
        color: { start: '#ffdd00', end: '#ff3300' },
        alpha: { start: 1, end: 0 },
        rotation: { min: 0, max: 360 },
        rotationSpeed: { min: -180, max: 180 }
    }
});
lineEm.start();