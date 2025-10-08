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

const game = new Pixalo('#canvas', {width: innerWidth, height: innerHeight});
game.start();

const rectangle = game.append('rectangle', {
    width: 180,
    height: 60,
    x: (game.baseWidth - 180) / 2,
    y: (game.baseHeight - 60) / 2,
    backgroundColor: '#278984',
    borderRadius: 6,
    text: 'See the console',
    font: '22px Arial',
    color: 'white',

    /**
     * Enable interactive
     */
    interactive: true
});

/**
 * Touches
 */
rectangle.on({
    touchstart: (e) => {
        console.log('touchstart', e);
    },
    touchmove: (e) => {
        console.log('touchmove', e);
    },
    touchend: (e) => {
        console.log('touchend', e);
    }
});

/**
 * Mouse
 */
rectangle.on({
    mousedown: (e) => {
        console.log('mousedown', e);
    },
    mousemove: (e) => {
        console.log('mousemove', e);
    },
    mouseup: (e) => {
        console.log('mouseup', e);
    },
    wheel: (e) => {
        console.log('wheel', e);
    }
});

/**
 * Click
 */
rectangle.on({
    click: (e) => {
        console.log('click', e);
    },
    rightclick: (e) => {
        console.log('rightclick', e);
    }
});