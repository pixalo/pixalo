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
game.start();

// one-shot callback after 1000 ms
game.timeout(() => {
    console.log('I was executed after 1 second.');
}, 1000);

// repeating timer – every 2000 ms
const endlessTimer = game.timer(() => {
    console.log('Every 2 seconds');
}, 2000);

// one-shot timer – fires once after 2000 ms
game.timer(() => {
    console.log('Runs only once.');
}, 2000, false);

// non-blocking pause for 8000 ms
await game.delay(8000);

// remove the repeating timer by its ID
game.clearTimer(endlessTimer);