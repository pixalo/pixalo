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

globalThis.game = new Pixalo({
    fps: 60,
    quality: 2,
    resizeTarget: 'window'
});

game.on('ready', () => {
    let width = game.window.width;
    let height = game.window.height;

    if (width > 1024) {
        width  /= 2;
    } else {
        height /= 2;
        game.camera.zoomTo(0.8);
    }

    game.resize(width, height);
    game.start();

    game.on('worker_msg', msg => {
        const {data} = msg;
        if (data?.action !== 'game_config') return;

        const {background, text} = msg.data;

        game.config.background = background;
        game.append('text', {
            width : 400,
            height: 60,

            x: (game.baseWidth - 400) / 2,
            y: game.baseHeight / 2,

            borderRadius: 6,

            fill: 'white',
            text: text + " (Drag Me)",
            font: '30px Arial',

            draggable: true,
        });
    });
});