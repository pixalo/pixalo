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
    fps: 60,
    width : window.innerWidth,
    height: window.innerHeight
});
game.start();

const maskEntity = game.append('triangle', {
    width: 100,
    height: 100,
    fill: '#f3a71a',
    shape: 'triangle',
});

game.append('rectangle', {
    width: 200,
    height: 200,
    x: 200,
    y: 100,
    fill: '#268985',

    // Using another entity as a mask
    mask: maskEntity
});

game.append('maskFunction', {
    width: 200,
    height: 200,
    x: 500,
    y: 100,
    fill: '#268985',

    // Custom mask
    mask: function (ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-100, -100, 200, 200);
    }
});