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

game.on('mousemove', (e) => {
    console.log('MouseMove', e);
});
game.on('mousedown', (e) => {
    console.log('MouseDown', e);
});
game.on('mouseup', (e) => {
    console.log('MouseUp', e);
});

// RightClick in the game world
game.on('rightclick', (e) => {
    console.log('Rightclick', e);
});

// Click in the game world
game.on('click', (e) => {
    console.log('Click', e);
});

// Entity events
const entity = game.append('entity', {
    width: 50,
    height: 50,
    fill: 'blue',
    hoverable: true,
    clickable: true,
});
entity.on({
    hover (e) {
        console.log('Hover', e);
    },
    hoverOut (e) {
        console.log('HoverOut', e);
    },
    click (e) {
        console.log('Click', e);
    }
})