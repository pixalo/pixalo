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
    background: '#031C1B',
});
game.start();

const flame = game.createEmitter('flame', {
    position: {x: innerWidth / 2, y: innerHeight / 2},
    shape: 'invisible',
    emission: {type: 'point', rate: 35, lifetime: 800},
    particle: {
        velocity: {min: {x: -30, y: -90}, max: {x: 30, y: -60}},
        acceleration: {x: 0, y: -30},
        size: {min: 3, max: 7},
        color: {start: '#ff8c00', end: '#ffcc00'},
        alpha: {start: 1, end: 0},
        rotation: {min: 0, max: 360},
        rotationSpeed: {min: -90, max: 90}
    }
});
flame.start();

game.on(['mousemove', 'touchmove'], (event) => {
    flame.move(event.x, event.y);
});