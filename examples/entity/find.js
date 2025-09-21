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
    fps: 60,
    width : window.innerWidth,
    height: window.innerHeight,
    collision: true,
    debugger: true
});

game.start();

game.append('rect', {
    class: 'rectangles',
    width: 50,
    height: 50,
    x: 100,
    y: 50,
    fill: 'gray'
});

// Get entity by id
console.log('Find By ID', game.find('rect'));

// Get entity by ClassName
console.log('Find By ClassName', game.findByClass('rectangles'));