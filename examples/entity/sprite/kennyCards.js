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

await game.loadAsset('spritesheet', 'kennyCards', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/spritesheets/kennyCards.png', {
    width: 65,
    height: 65,
    columns: 14,
    rows: 4,
    originOffset: [0, 0], // x, y
    margin: [0, 0] // x, y
}).then(asset => {
    /**
     * Full information and spritesheet settings
     */
    console.log(asset);
});

game.append('rpg_character', {
    width: 100,
    height: 150,
    x: (game.baseWidth  - 100) / 2,
    y: (game.baseHeight - 150) / 2,
    draggable: true,

    /**
     * Specify the sprite
     */
    sprite: {
        asset: 'kennyCards',

        // Resizing and repositioning a sprite
        width: 160,
        height: 160,
        x: 1,
        y: 1,

        animations: {
            cards: {
                frames: Array.from({length: 56}, (_, i) => i),
                frameRate: 6,
                loop: true
            }
        },
        defaultAnimation: 'cards'
    }
});