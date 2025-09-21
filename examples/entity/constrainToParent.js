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

const parent = game.append('parent', {
    width: 200,
    height: 200,
    x: (game.baseWidth - 200) / 2,
    y: (game.baseHeight - 200) / 2,
    fill: '#1D3130',
    borderRadius: 12
});

parent.append('children', {
    shape: 'triangle',
    width: 50,
    height: 50,
    fill: '#F4A71A',
    draggable: true,

    // Constrain to parent
    constrainToParent: true // Default: true
});

parent.append('freeChild', {
    shape: 'circle',
    width: 50,
    height: 50,
    x: 100,
    y: 100,
    fill: '#258884',
    draggable: true,

    // Constrain to parent
    constrainToParent: false // Default: true
});

game.append('guide', {
    x: 150,
    y: game.baseHeight - 50,
    fill: 'transparent',
    text: 'Try to drag the children out of the parent.'
});