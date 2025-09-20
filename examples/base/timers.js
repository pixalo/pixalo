/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from '../../src/Pixalo.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight,
    fps: 60
});
game.start();

game.timeout(() => {
    console.log('I was executed after 1 second.');
}, 1000);

game.updateTimers(() => {
    console.log('I was executed after 1 second.');
}, 1000);

// Add timer - runs every 2 seconds
game.timer(() => {
    console.log('Every 2 seconds');
}, 2000);

// Add timer - runs after 2 seconds
const endlessTimer = game.timer(() => {
    console.log('Runs only once.');
}, 2000, false);

// 8 seconds delay and then continue executing the code
await game.delay(8000);

// Clear timer with ID
game.clearTimer(endlessTimer);

// Update timers with new timestamp
game.updateTimers(Date.now());