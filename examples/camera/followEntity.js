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
    width : window.innerWidth,
    height: window.innerHeight
});
game.start();

game.append('player', {
    shape: 'circle',
    width: 150,
    height: 150,
    x: (game.baseWidth  - 150) / 2,
    y: (game.baseHeight - 150) / 2,
    fill: '#F4A81B',
    draggable: true
});

game.append('guide', {
    width: 160,
    height: 35,
    x: (game.baseWidth  - 160) / 2,
    y: 25,
    fill: 'transparent',
    color: '#268884',
    text: 'Move the circle',
    font: '40px Arial'
});

/**
 * Follow entity
 */
game.camera.follow(game.find('player'));