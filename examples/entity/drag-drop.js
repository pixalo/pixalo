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
    height: window.innerHeight
});
game.start();

const entity = game.append('entity', {
    width: 50,
    height: 50,
    x: 50,
    y: 50,
    fill: '#258883',
    draggable: true
});
entity.on({
    drag (e) {
        console.log('Dragged', e);
        entity.style('fill', '#F4A71A');
    },
    dragMove (e) {
        console.log('Movement', e);
    },
    drop (e) {
        console.log('Dropped', e);
        entity.style('fill', '#258883');
    }
});