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
    // debugger: true
});
game.start();

await game.loadAsset('spritesheet', '3D_panda', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/spritesheets/3D-panda.webp', {
    width: 596,
    height: 596,
    columns: 5,
    rows: 18,
}).then(asset => {
    /**
     * Full information and spritesheet settings
     */
    console.log(asset);
});

const panda = game.append('panda', {
    width: 150,
    height: 80,
    x: (game.baseWidth / 2) - (128 / 2),
    y: (game.baseHeight / 2) - (128 / 2),
    draggable: true,

    /**
     * Specify the sprite
     */
    sprite: {
        asset: '3D_panda',
        animations: {
            panda: {
                frames: Array.from({length: 88}, (_, i) => i),
                frameRate: 50,
                loop: true
            }
        },
        defaultAnimation: 'panda'
    }
});