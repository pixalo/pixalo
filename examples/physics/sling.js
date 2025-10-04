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
    width: window.innerWidth, height: window.innerHeight, background: '#031C1B',
    physics: {gravity: {x: 0, y: 500}}
});
game.start();

// walls
const sides = {
    left:  { x: 0, y: 0, width: 20, height: game.baseHeight },
    right: { x: game.baseWidth-20, y: 0, width: 20, height: game.baseHeight },
    bottom:{ x: 0, y: game.baseHeight-20, width: game.baseWidth, height: 20 }
};

['left', 'right', 'bottom'].forEach(side => {
    game.append(side, {
        ...sides[side],
        fill: '#258984',
        physics: {bodyType: 'static'}
    });
});

let ammo = 0;
game.on('click', ({worldX, worldY}) => {
    const ball = game.append(`a${++ammo}`, {
        x: worldX, y: worldY,
        width: 25, height: 25,
        shape: 'circle', fill: '#f39c12',
        physics: {density: 2, restitution: 0.5}
    });
    game.physics.applyImpulse(ball, {
        x: (400 - worldX) * 0.4,
        y: (100 - worldY) * 0.4
    });
});