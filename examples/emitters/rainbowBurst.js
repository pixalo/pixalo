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
    background: '#0d0d0d'
});
game.start();

const circle = game.createEmitter('circ', {
    position: {x: game.baseWidth * .5, y: game.baseHeight * .5},
    shape: 'circle', size: 12, color: '#00ffe1', opacity: .4,
    emission: {type: 'circle', radius: 60, edge: true, rate: 0, burst: 40, lifetime: 1800},
    particle: {
        acceleration: {x: 0, y: 30},
        size: {min: 4, max: 10},
        color: {start: '#ff00aa', end: '#00aaff'},
        alpha: {start: 1, end: 0},
        rotation: {min: 0, max: 360},
        rotationSpeed: {min: -180, max: 180}
    },
    autoDestroy: false
});
circle.start();

game.timer(() => circle.burst(40), 1200);