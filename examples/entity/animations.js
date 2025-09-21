/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from 'http://cdn.jsdelivr.net/gh/pixalo/pixalo@master/dist/pixalo.esm.js';

const game = new Pixalo('#canvas', {
    width : window.innerWidth,
    height: window.innerHeight
});
game.start();

/**
 * Define an animation to be run later for entities
 */
game.defineAnimation('blinking', [
    {
        color: '#268984',
        opacity: 0.1,
        // You can add more entity properties...
    },
    {
        color: '#F3A81B',
        opacity: 1,
        // You can add more entity properties...
    },
    // You can add more keyframes...
], {
    duration: 1000,
    easing: game.Ease.easeInBounce, // Default: 'linear'
    repeat: true
});

const entity = game.append('entity', {
    width: 100,
    height: 100,
    x: (game.baseWidth  - 100) / 2,
    y: (game.baseHeight - 100) / 2,

    // Text
    text: 'Pixalo Powerful & Easy',
    color: '#268984',
    font: '35px Arial',
});

entity.startAnimation('blinking');
game.timeout(() => {
    entity.stopAnimation('blinking');
}, 5000);