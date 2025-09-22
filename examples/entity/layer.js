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
    height: window.innerHeight,
});
game.start();

await game.loadAsset('image', 'character', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/character.png');

game.append('entity-1', {
    width: 100,
    height: 100,
    x: 10,
    y: 10,
    image: 'character',

    layer: 'above'
});

game.append('entity-2', {
    width: 100,
    height: 100,
    x: 50,
    y: 50,
    image: 'character',
    filter: 'brightness(80%)',

    layer: 1,
});

game.find('entity-1').layer('above');