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
    physics: { gravity: { x: 0, y: 900 } }
});
game.start();

// ground
game.append('ground', {
    x: 0,
    y: game.baseHeight - 20,
    width: game.baseWidth,
    height: 40,
    backgroundColor: '#248884',
    physics: { bodyType: 'static' }
});

// tower of boxes
const W = 40, H = 40, COUNT = 12;
for (let i = 0; i < COUNT; i++) {
    game.append(`b${i}`, {
        x: game.baseWidth / 2,
        y: game.baseHeight - 60 - i * H,
        width: W,
        height: H,
        backgroundColor: `hsl(${(i * 360) / COUNT}, 70%, 50%)`,
        physics: { density: 1, friction: 0.6, restitution: 0.1 }
    });
}

// knock-out bullet on click
game.on('click', ({ worldX, worldY }) => {
    const bullet = game.append(`bullet_${Date.now()}`, {
        x: worldX,
        y: worldY,
        radius: 15,
        shape: 'circle',
        backgroundColor: '#F3A71B',
        physics: { density: 3 }
    });
    game.physics.applyImpulse(bullet, {
        x: (game.baseWidth / 2 - worldX) * 0.3,
        y: (game.baseHeight / 2 - worldX) * 0.3
    });
});