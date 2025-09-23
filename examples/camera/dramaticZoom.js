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

/**
 * Dramatic focus on entity
 */
const dramaticFocus = entity => game.camera.dramaticFocus(
    { x: entity.x + entity.width / 2, y: entity.y + entity.height / 2 },
    1200,
    2.5
);

// clickable targets
const square1 = game.append(`target1`, {
    shape: 'rect',
    width: 100,
    height: 100,
    x: (game.baseWidth - 500) / 2,
    y: (game.baseHeight - 100) / 2,
    fill: '#278985',
    clickable: true
});
square1.on('click', e => dramaticFocus(square1));

const square2 = game.append(`target2`, {
    shape: 'rect',
    width: 100,
    height: 100,
    x: game.baseWidth * 0.62,
    y: (game.baseHeight - 100) / 2,
    fill: '#F4A81B',
    clickable: true
});
square2.on('click', e => dramaticFocus(square2));

game.append('guide', {
    width: 220,
    height: 35,
    x: (game.baseWidth - 220) / 2,
    y: 40,
    fill: 'transparent',
    text: 'Click squares for dramatic zoom',
    font: '20px Arial'
});