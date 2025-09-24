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
    physics: { gravity: { x: 0, y: 0 } }
});
game.start();

// centre magnet
game.append('core', {
    x: game.baseWidth / 2,
    y: game.baseHeight / 2,
    radius: 30,
    shape: 'circle',
    backgroundColor: '#e74c3c',
    physics: { bodyType: 'static' }
});

// orbiting balls
for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = game.baseWidth / 2 + Math.cos(angle) * 180;
    const y = game.baseHeight / 2 + Math.sin(angle) * 180;

    const ball = game.append(`ball${i}`, {
        x, y, radius: 12,
        shape: 'circle',
        backgroundColor: `hsl(${i * 45}, 70%, 50%)`,
        physics: { density: 0.5, friction: 0, restitution: 1 }
    });

    // give tangential speed for orbit
    game.physics.setVelocity(ball, {
        x: -Math.sin(angle) * 220,
        y: Math.cos(angle) * 220
    });
}

// tiny gravity toward core each frame
game.on('update', () => {
    const cx = game.baseWidth / 2;
    const cy = game.baseHeight / 2;
    for (let i = 0; i < 8; i++) {
        const b = game.find(`ball${i}`);
        if (!b) continue;
        const dx = cx - b.styles.x - b.width / 2;
        const dy = cy - b.styles.y - b.height / 2;
        const r = Math.hypot(dx, dy) || 1;
        game.physics.applyForce(b, {
            x: (dx / r) * 300,
            y: (dy / r) * 300
        });
    }
});