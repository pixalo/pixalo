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
    width: window.innerWidth,
    height: window.innerHeight
});

await game.wait(
    game.loadAsset('image', 'pixalo', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/character.png'),
    game.loadAsset('image', 'play', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/play.png')
);

game.start();

const parent = game.append('parent', {
    width: 250,
    height: 250,
    x: (game.baseWidth - 250) / 2,
    y: (game.baseHeight - 250) / 2,
    fill: '#1D3130',
    borderRadius: 12,
    draggable: true
});

parent.append('character', {
    width: 100,
    height: 100,
    x: (parent.width - 140) / 2,
    y: (parent.height - 150) / 2,
    image: 'pixalo',
});

game.find('parent').append('play', {
    shape: 'triangle',
    width: 50,
    height: 50,
    x: (parent.width / 2) + 20,
    y: (parent.height - 95) / 2,
    borderRadius: 12,
    image: 'play'
});

game.find('parent').append('text', {
    width: 115,
    height: 20,
    x: (parent.width - 105) / 2,
    y: parent.height - 70,
    fill: 'transparent',
    color: 'white',
    text: 'Pixalo',
    font: '45px Arial',
});