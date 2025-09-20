/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from '../../../src/Pixalo.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight
});
game.start();

// Control + R
game.on('ctrl+r', combo => {
    location.reload()
});

// Control + D
game.on('ctrl+d', combo => {
    !game.debugger.active ? game.enableDebugger() : game.disableDebugger();
});

game.on('keydown', e => {
    // Samples:
    // - ArrowKeys: up, down, left, right
    // - ComboKeys:
    //   - shift+d
    //   - ctrl+c
    // - Check the browser console to see other keys.
    console.log('Keydown', e);
}).on('keyup', e => {
    console.log('Keyup', e);
});