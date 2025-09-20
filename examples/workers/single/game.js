/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from '../../../src/index.js';

globalThis.game = new Pixalo({
    fps: 60,
    quality: 2,
    resizeTarget: 'window'
});

game.on('ready', () => {
    game.resize(game.window.width, game.window.height);
    game.start();

    game.append('text', {
        x: game.baseWidth / 2,
        y: game.baseHeight / 2,

        text: 'Hello, World!',
        font: '30px Arial',
    });
});