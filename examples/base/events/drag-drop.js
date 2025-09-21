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

const entity = game.append('entity', {
    width: 50,
    height: 50,
    fill: 'blue',
    draggable: true
});
entity.on({
    drag (e) {
        console.log('Dragged', e);
        entity.style('fill', 'red');
    },
    dragMove (e) {
        console.log('Movement', e);
    },
    drop (e) {
        console.log('Dropped', e);
        entity.style('fill', 'blue');
    }
});