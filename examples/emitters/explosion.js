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
    width: innerWidth,
    height: innerHeight,
    background: '#1a1a1a',
});
game.start();

game.on('click', (event) => {
    const {x, y} = event;
    const em = game.emitters.explosion(x, y, {
        particleCount: 50,
        lifetime: 1200,
        startColor: '#ff4444',
        endColor: '#ffaa00'
    });

    // Remove emitter after 3s
    game.timeout(() => {
        game.emitters.remove(em.id)
    }, 3000);
});
