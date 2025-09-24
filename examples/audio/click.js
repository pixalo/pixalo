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

await game.loadAsset('audio', 'click', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/sfx/click.m4a', {
    volume: 1
});

game.start();

const button = game.append('button', {
    width: 150,
    height: 50,
    x: (game.baseWidth  - 150) / 2,
    y: (game.baseHeight - 50) / 2,
    fill: '#268884',
    text: 'Click Me',
    color: 'white',
    borderRadius: 5,
    clickable: true
});

button.on('click', () => {
    game.audio.play('click');
});