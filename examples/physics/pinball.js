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
    physics: { gravity: { x: 0, y: 300 } }
});
game.start();

// table walls
game.append('leftWall',  { x: 0,  y: 0, width: 20, height: game.baseHeight, fill: '#268985', physics: { bodyType: 'static' } });
game.append('rightWall', { x: game.baseWidth - 20, y: 0, width: 20, height: game.baseHeight, fill: '#268985', physics: { bodyType: 'static' } });
game.append('ceiling',   { x: 0,  y: 0, width: game.baseWidth, height: 20, fill: '#268985', physics: { bodyType: 'static' } });

// sloped floor
game.append('floor', {
    x: 0, y: game.baseHeight - 40,
    width: game.baseWidth, height: 40,
    fill: '#268985',
    physics: { bodyType: 'static', friction: 0.2 }
});

// bumpers
const bumpers = [];
for (let i = 0; i < 5; i++) {
    const b = game.append(`bumper_${i}`, {
        x: 200 + i * 120, y: 200 + (i % 2) * 80,
        width: 20, height: 20, shape: 'circle',
        fill: '#F3A71A',
        physics: { bodyType: 'static', restitution: 1.5 }
    });
    b.on('collide', () => game.physics.applyImpulse(b, { x: 0, y: -400 }));
    bumpers.push(b);
}

// plunger lane
game.append('plungerLane', {
    x: game.baseWidth - 60, y: game.baseHeight - 200,
    width: 40, height: 160,
    fill: '#444',
    physics: { bodyType: 'static' }
});

// ball
const ball = game.append('ball', {
    shape: 'circle',
    width: 25,
    height: 25,
    x: game.baseWidth - 60, y: game.baseHeight - 80,
    fill: '#fff',
    physics: { density: 1, friction: 0.05, restitution: 0.6 }
});

// plunger (mouse down = charge, up = fire)
let charge = 0;
game.on(['mousedown', 'touchstart'], () => charge = 0);
game.on(['mousemove', 'touchmove'], () => {
    charge = Math.min(charge + 2, 80);
});
game.on(['mouseup', 'touchend'], () => {
    game.physics.applyImpulse(ball, { x: -charge * 3, y: -charge * 2 });
    charge = 0;
});

// flippers (left/right arrows)
['left', 'right'].forEach((side, i) => {
    const flip = game.append(`${side}Flipper`, {
        x: (i ? game.baseWidth - 180 : 180), y: game.baseHeight - 100,
        width: 60, height: 12,
        fill: '#F3A71A',
        physics: { bodyType: 'kinematic' }
    });

    game.on('keydown', key => {
        if (key === (i ? 'right' : 'left')) {
            flip.style({ rotation: i ? 30 : -30 });
            game.physics.applyImpulse(ball, {
                x: (i ? 1 : -1) * 300,
                y: -200
            });
        }
    });
    game.on('keyup', key => {
        if (key === (i ? 'right' : 'left')) flip.style({ rotation: 0 });
    });
});

game.append('guide', {
    x: game.baseWidth / 2,
    y: 40,
    fill: 'transparent',
    text: '← →  Flip  |  Hold / Drag Mouse = Charge Plunger  |  Release = Launch',
    color: '#F3A71A',
    font: '18px Arial'
});