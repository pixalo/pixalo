/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from '../../src/Pixalo.js';

globalThis.game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight,
    background: '#ccc'
});
game.start();

const player = game.append('player', {
    width: 100,
    height: 100,
    x: (window.innerWidth - 100) / 2,
    y: (window.innerHeight - 100) / 2,
    fill: 'blue'
});

game.on('resize', () => {
    player.style({
        x: (game.baseWidth - player.width) / 2,
        y: (game.baseHeight - player.height) / 2
    });
});

const sizes = [
    [200, 200],
    [400, 400],
    [380, 480],
    [window.innerWidth, window.innerHeight]
];
game.timer(() => {
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    game.resize(randomSize[0], randomSize[1]);
}, 1000);