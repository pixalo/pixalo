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
    fps: 60,
    width : window.innerWidth,
    height: window.innerHeight,
    collision: true,
    resize: 'window'
});

await game.wait(
    game.loadAsset('image', 'player', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/character.png'),
    game.loadAsset('image', 'coin', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/coin.png')
);

game.start();

game.append('guide', {
    x: 80,
    y: game.baseHeight - 50,
    fill: 'transparent',
    text: 'Move with Arrow Keys'
});

const player = game.append('player', {
    width: 100,
    height: 100,
    x: 10,
    y: 10,
    image: 'player',
    collision: true
});

game.on('keydown', combo => {
    let dx = 0;
    let dy = 0;
    const isLeft = combo.includes('left');

    if (isLeft)  dx -= 10;
    if (combo.includes('right')) dx += 10;
    if (combo.includes('up'))    dy -= 10;
    if (combo.includes('down'))  dy += 10;

    player.style('flipX', isLeft).move(dx, dy);
});

function randomPosition () {
    let x = Math.floor(Math.random() * (game.baseWidth / 1.5));
    let y = Math.floor(Math.random() * (game.baseHeight / 1.5));

    if (x <= 100) x += 300;

    return {x, y};
}

const coinPos = randomPosition();
const coin = game.append('coin', {
    width: 50,
    height: 50,
    x: coinPos.x,
    y: coinPos.y,
    image: 'coin',
    shape: 'circle',
    collision: true
});

const collected = game.append('collected', {
    x: game.baseWidth - 50,
    y: 20,
    text: '0',
    font: '50px Arial'
})

coin.on('collide', () => {
    const coinPos = randomPosition();
    coin.move({
        x: coinPos.x,
        y: coinPos.y,
        relative: false
    });
    collected.text(Number(collected.text()) + 1);
});

game.enableDebugger(true);

window.game = game;