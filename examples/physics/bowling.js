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
    height: window.innerHeight,
    background: '#031C1B',
    physics: {gravity: {x: 0, y: 800}}
});
game.start();

// ground & lane
game.append('lane', {
    x: 0, y: game.baseHeight - 60,
    width: game.baseWidth, height: 60,
    backgroundColor: '#268985',
    physics: {bodyType: 'static'}
});

// gutter walls
['left', 'right'].forEach((side, i) => {
    game.append(`${side}Gutter`, {
        x: i ? game.baseWidth - 20 : 0, y: 0,
        width: 20, height: game.baseHeight,
        backgroundColor: '#F3A71A',
        physics: {bodyType: 'static', friction: 0.1}
    });
});

// 10 bowling pins (triangle)
const PIN_W = 30, PIN_H = 60, BASE = game.baseWidth / 2;
for (let row = 0; row < 3; row++) {
    for (let col = row; col >= 0; col--) {
        const x = BASE + (col - row / 2) * (PIN_W + 2);
        const y = game.baseHeight - 60 - (3 - row) * (PIN_H + 2);
        game.append(`pin_${row}_${col}`, {
            x, y, width: PIN_W, height: PIN_H,
            shape: 'rectangle', backgroundColor: '#F3A71A',
            class: 'pin',
            physics: {density: 0.4, friction: 0.4, restitution: 0.05}
        });
    }
}

// bowling ball
const ball = game.append('ball', {
    x: 0, y: game.baseHeight - 120,
    radius: 25, shape: 'circle',
    backgroundColor: '#268985',
    draggable: true,
    physics: {density: 1.5, friction: 0.05, restitution: 0.05}
});

ball.on('collide', function collideBall ({entityA}) {
    if (entityA.hasClass('pin')) {
        game.timeout(() => {
            game.append('strike', {
                width: 150,
                height: 40,
                x: (game.baseWidth - 150) / 2,
                y: game.baseHeight / 2,
                fill: 'transparent',
                text: 'Strike!',
                color: '#F4A71A',
                font: '50px Arial'
            });
        }, 0);
        ball.off('collide', collideBall);
    }
});