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

await game.loadAsset('spritesheet', 'rpg_character', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/spritesheets/rpg_character.png', {
    width: 32,
    height: 32,
    columns: 4,
    rows: 4,
    originOffset: [0, 6] // x, y
}).then(asset => {
    /**
     * Full information and spritesheet settings
     */
    console.log(asset);
});

game.append('rpg_character', {
    width: 60,
    height: 85,
    x: (game.baseWidth / 2) - (128 / 2),
    y: (game.baseHeight / 2) - (128 / 2),
    draggable: true,

    /**
     * Specify the sprite
     */
    sprite: {
        asset: 'rpg_character',

        // Resizing a sprite
        width: 160,
        height: 160,

        animations: {
            rpg_character: {
                frames: Array.from({length: 15}, (_, i) => i),
                frameRate: 4,
                loop: true
            }
        },
        defaultAnimation: 'rpg_character'
    }
});