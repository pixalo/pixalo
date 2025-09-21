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
    width: window.innerWidth,
    height: window.innerHeight
});
game.start();

const entity = game.append('entity', {
    width: 200,
    height: 200,
    x: (game.baseWidth - 200) / 2,
    y: (game.baseHeight - 200) / 2,
    fill: '#1D3130',
    borderRadius: 12,
    opacity: 0
});

entity.transition({
    fill : '#F4A81B',
    scale: 1.2,
    rotation: 180,
    opacity: 1,
    // You can add more entity properties...
}, {
    delay: 250,
    easing: game.Ease.easeInElastic, // Default: 'linear'
    duration: 2000,
    onComplete: () => {
        console.log('First transition complete!');
    }
});