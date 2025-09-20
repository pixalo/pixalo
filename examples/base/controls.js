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

globalThis.game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight,
    fps: 60
});

// Start Game
game.on('start', () => {
    console.log('Game started!');
});
game.start();

// Stop Game
game.on('stop', () => {
    console.log('Game stopped!');
});
game.stop();

// Resets the engine state, clearing all entities, events, and timers.
game.on('reset', () => {
    console.log('The game was reset.');
});
game.reset();