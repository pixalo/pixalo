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
    width: window.innerWidth,
    height: window.innerHeight
});
game.start();

// Add a custom event
game.on('myEvent', (text, data) => {
    console.log('Text', text);
    console.log('Data', data);
});

// Calling a custom event
game.trigger('myEvent', 'Hello World!', {
    foo: 'bar',
    bar: 'baz'
});