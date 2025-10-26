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

await game.loadAsset('image', 'player', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/character.png');

game.start();

const player = game.append('player', {
    width: 100,
    height: 100,
    x: 10,
    y: 10,
    image: 'player'
});

game.on('update', deltaTime => {
    const speed = 250; // 250 px/s
    const step = speed * (deltaTime / 1000);
    let dx = 0, dy = 0;
    const leftKey = game.isKeyPressed('left', 'a');

    if (leftKey) dx -= step;
    if (game.isKeyPressed('right', 'd')) dx += step;
    if (game.isKeyPressed('up', 'w')) dy -= step;
    if (game.isKeyPressed('down', 's')) dy += step;

    player.style('flipX', leftKey).move(dx, dy);
});

game.append('guide', {
    x: 80,
    y: game.baseHeight - 50,
    fill: 'transparent',
    text: 'Move with Arrow Keys'
});