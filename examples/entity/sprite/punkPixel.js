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

await game.loadAsset('spritesheet', 'punk_pixel', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/spritesheets/punk-pixel.png', {
    width: 48,
    height: 48,
    columns: 6,
    rows: 3,
    originOffset: [-8, 6] // x, y
}).then(asset => {
    /**
     * Full information and spritesheet settings
     */
    console.log(asset);
});

const punk = game.append('punk', {
    width: 150,
    height: 80,
    x: (game.baseWidth  - 150) / 2,
    y: (game.baseHeight - 80) / 2,
    draggable: true,

    /**
     * Specify the sprite
     */
    sprite: {
        asset: 'punk_pixel',
        animations: {
            idle: {
                frames: [0, 1, 2, 3],
                frameRate: 8,
                loop: true
            },
            attack: {
                frames: [6, 7, 8, 9, 10, 11],
                frameRate: 12,
                loop: true
            },
            run: {
                frames: [12, 13, 14, 15, 16, 17],
                frameRate: 8,
                loop: true
            },
        },
        defaultAnimation: 'idle'
    }
});

/**
 * Run the next animation when the
 * current animation is finished.
 */
punk.on('animationOnLoop', current => {
    const animNames = Object.keys(punk.sprite.animations);
    const next = animNames[(animNames.indexOf(current) + 1) % animNames.length];
    punk.play(next);
});