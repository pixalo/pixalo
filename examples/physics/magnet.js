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
    physics: {gravity: {x: 0, y: 0}}
});
game.start();

// centre magnet
game.append('core', {
    width: 25,
    height: 25,
    x: (game.baseWidth - 25) / 2,
    y: (game.baseHeight - 25) / 2,
    shape: 'circle',
    backgroundColor: '#e74c3c',
    physics: {bodyType: 'static'}
});

// orbiting balls
const R = 180;
const G = 200;
const speed = Math.sqrt(G / R);

for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = game.baseWidth / 2 + Math.cos(angle) * R;
    const y = game.baseHeight / 2 + Math.sin(angle) * R;

    const ball = game.append(`ball${i}`, {
        x, y,
        width: 20, height: 20,
        shape: 'circle',
        backgroundColor: `hsl(${i * 45}, 70%, 50%)`,
        physics: {density: 0.5, friction: 0, restitution: 1}
    });

    game.physics.setVelocity(ball, {
        x: -Math.sin(angle) * speed * R,
        y: Math.cos(angle) * speed * R
    });
}

// tiny gravity toward core each frame
game.on('update', () => {
    const cx = game.baseWidth / 2;
    const cy = game.baseHeight / 2;

    for (let i = 0; i < 8; i++) {
        const b = game.find(`ball${i}`);
        if (!b) continue;

        const dx = cx - (b.x + b.width / 2);
        const dy = cy - (b.y + b.height / 2);
        const r = Math.hypot(dx, dy) || 1;

        const correctionForce = 150;
        game.physics.applyForce(b, {
            x: (dx / r) * correctionForce,
            y: (dy / r) * correctionForce
        });
    }
});