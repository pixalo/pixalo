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
    physics: {gravity: {x: 0, y: 500}}
});
game.start();

// ground
game.append('ground', {
    x: 0, y: game.baseHeight - 40,
    width: game.baseWidth, height: 40,
    backgroundColor: '#268985',
    physics: {bodyType: 'static'}
});

// cannon base
game.append('base', {
    x: 120, y: game.baseHeight - 100,
    width: 100, height: 60,
    backgroundColor: '#F3A71A',
    borderRadius: 6,
    physics: {bodyType: 'static'}
});

// rotating barrel
const barrel = game.append('barrel', {
    x: 150, y: game.baseHeight - 110,
    width: 100, height: 20,
    backgroundColor: '#268985',
    borderRadius: 6,
    physics: { bodyType: 'kinematic' }
});

// angle control
let angle = -15; // degrees
function updateAngle () {
    barrel.style('rotation', angle);
}

updateAngle();
const STEP = 5; // degree per wheel tick
game.on('wheel', e => {
    angle = Math.max(-45, Math.min(10, angle + Math.sign(e.deltaY) * STEP));
    updateAngle();
});

// fire cannonball
game.on('click', () => {
    const angle = barrel.styles.rotation;
    const rad = angle * Math.PI / 180;

    // Get barrel center position instead of top-left
    const barrelCenterX = barrel.x + barrel.width / 2;
    const barrelCenterY = barrel.y + barrel.height / 2;

    // Calculate tip position relative to barrel center
    const tipOffsetX = barrel.width / 2;  // Distance from center to tip
    const tipX = barrelCenterX + tipOffsetX * Math.cos(rad);
    const tipY = barrelCenterY + tipOffsetX * Math.sin(rad);

    const ball = game.append(`ball_${Date.now()}`, {
        shape: 'circle',
        width: 25,
        height: 25,
        x: tipX - 12.5, // Adjust for ball size (25/2)
        y: tipY - 12.5, // Adjust for ball size (25/2)
        backgroundColor: '#F3A71A',
        physics: { density: 3, restitution: 0.4 }
    });

    game.physics.setVelocity(ball, {
        x: Math.cos(rad) * 900,
        y: Math.sin(rad) * 900
    });

    game.timeout(() => ball.kill(), 2000);
});

// random target boxes
for (let i = 0; i < 6; i++) {
    game.append(`box${i}`, {
        x: 500 + i * 55,
        y: game.baseHeight - 60,
        width: 50, height: 50,
        backgroundColor: '#268985',
        borderRadius: 6,
        physics: {density: 0.5, friction: 0.3, restitution: 0.1}
    });
}