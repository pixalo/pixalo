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
    height: window.innerHeight,
    fps: 60
});
game.start();

// Disable debugger
game.disableDebugger();

// Enable debugger
game.enableDebugger();

// Only when the debugger is active
game.log('Log');
game.info('Info');
game.warn('Warn');
game.error('Error');