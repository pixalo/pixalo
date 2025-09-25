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
    physics: {gravity: {x: 0, y: 0}},
    autoStartStop: false
});
game.start();

game.on('visibility', visibility => {
    if (visibility && !game.data('gameover') && !game.data('win')) {
        game.start();
    } else {
        game.stop();
    }
});

// walls
['top', 'left', 'right'].forEach(side => {
    game.append(`${side}Wall`, {
        x: side === 'left' ? 0 : side === 'right' ? game.baseWidth - 20 : 0,
        y: side === 'top' ? 0 : 0,
        width: side === 'top' ? game.baseWidth : 20,
        height: side === 'top' ? 20 : game.baseHeight,
        fill: '#268985',
        physics: {bodyType: 'static'}
    });
});

// bricks
const BRICK_W = 60, BRICK_H = 25, ROWS = 6, COLS = Math.floor((game.baseWidth - 40) / BRICK_W);
let bricksLeft = ROWS * COLS;
for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
        const brick = game.append(`brick_${r}_${c}`, {
            x: 20 + c * (BRICK_W + 2),
            y: 80 + r * (BRICK_H + 2),
            width: BRICK_W, height: BRICK_H,
            fill: `hsl(${r * 40}, 70%, 50%)`,
            physics: {bodyType: 'static'}
        });
        brick.one('collide', () => {
            brick.kill();
            if (--bricksLeft === 0) win();
        });
    }
}

// paddle
const paddle = game.append('paddle', {
    x: (game.baseWidth - 100) / 2,
    y: game.baseHeight - 80,
    width: 100, height: 15,
    fill: '#F3A71A',
    borderRadius: 6,
    physics: {bodyType: 'kinematic'}
});
game.on(['mousemove', 'touchmove'], e => {
    paddle.style({x: Math.max(20, Math.min(game.baseWidth - 120, e.worldX - 50))});
});
paddle.on('collide', ({entityB}) => {
    if (entityB.id !== 'ball') return;
    const vx = (entityB.x + 10 - (paddle.x + 50)) / 50 * 400;
    game.physics.setVelocity(entityB, {x: vx, y: -400});
});

// ball
const ball = game.append('ball', {
    shape: 'circle',
    width: 20, height: 20,
    x: game.baseWidth / 2,
    y: paddle.y - 20,
    fill: '#fff',
    physics: {density: 1, restitution: 1, friction: 0}
});
game.one('update', () => {
    game.physics.setVelocity(ball, {x: 300, y: -300});
});

// bottom wall + game over
const bottomWall = game.append('bottomWall', {
    x: 0, y: game.baseHeight - 20,
    width: game.baseWidth, height: 20,
    fill: '#F3A71A',
    visible: false,
    physics: {bodyType: 'static'}
});
bottomWall.on('collide', () => {
    game.append('gameOver', {
        width: 200,
        x: (game.baseWidth - 200) / 2, y: game.baseHeight / 2,
        fill: 'transparent', text: 'GAME OVER',
        color: '#F3A71A', font: '50px Arial',
        origin: {x: 0.5, y: 0.5}
    });
    game.data('gameover', true);
    game.stop();
});

// win
function win () {
    game.append('win', {
        width: 300,
        x: (game.baseWidth - 300) / 2, y: game.baseHeight / 2,
        fill: 'transparent', text: 'YOU WIN!',
        color: '#F3A71A', font: '60px Arial',
        origin: {x: 0.5, y: 0.5}
    });
    game.data('win', true);
    game.stop();
}