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

await game.loadAsset('image', 'character',
    'https://raw.githubusercontent.com/pixalo/pixalo/main/examples/assets/character.png');

const emitter = game.createEmitter('tex', {
    position: { x: game.baseWidth * .5, y: game.baseHeight * .5 },
    shape: 'invisible',

    emission: {
        type: 'square',
        rate: 3,
        burst: 20,
        lifetime: 1000
    },

    particle: {
        // Add texture
        texture: 'character',

        velocity: {
            min: {x: -150, y: -150},
            max: {x: 150, y: -50}
        },
        acceleration: { x: 0, y: 120 },
        size: { min: 30, max: 60 },
        alpha: { start: 1, end: 0 },
        rotation: { min: 0, max: 360 },
        rotationSpeed: { min: -180, max: 180 }
    },
    autoDestroy: true
});

emitter.start();
emitter.burst(20);

game.timer(() => {
    emitter.burst(20);
}, 1500);