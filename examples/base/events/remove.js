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

function clickEvent (e) {
    console.log('Clicked', e);
}

game.on(['click', 'mousedown'], clickEvent);

// Remove event listener
game.off('click', clickEvent);

// Remove event listeners
game.off(['click', 'mousedown'], clickEvent);