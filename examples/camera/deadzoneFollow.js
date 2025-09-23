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

const game = new Pixalo('#canvas', { width: innerWidth, height: innerHeight });
game.start();

const player = game.append('player', {
    shape: 'circle',
    width: 60,
    height: 60,
    x: game.baseWidth / 2 - 30,
    y: game.baseHeight / 2 - 30,
    fill: '#F4A81B',
    draggable: true
});

game.camera.follow(player, {
    behavior: 'edge',
    deadzone: { x: 120, y: 80 },
    smooth: true,
    smoothSpeed: 0.08
});

game.append('guide', {
    width: 260,
    height: 35,
    x: (game.baseWidth - 260) / 2,
    y: 40,
    fill: 'transparent',
    color: '#268884',
    text: 'Drag circle - camera moves only outside deadzone',
    font: '20px Arial'
});