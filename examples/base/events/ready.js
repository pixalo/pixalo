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

const game = new Pixalo({
    width: window.innerWidth,
    height: window.innerHeight
});

// It is needed when you run your game in the WebWorker,
// otherwise you don't need to run your game code in this function.
game.on('ready', () => {
    game.start();
    console.log('Game ready');
});