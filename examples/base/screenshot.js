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

globalThis.game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight,
    fps: 60
});
game.start();

game.append('player', {
    width: 100,
    height: 100,
    x: (window.innerWidth - 100) / 2,
    y: (window.innerHeight - 100) / 2,
    fill: 'blue'
});

// 1 millisecond wait for full rendering
await game.delay(1);

// High quality JPEG with download
const shot = game.shot({
    format: 'jpeg',
    quality: 1,
    download: true,
    filename: 'game-screenshot'
});

console.log('Result', shot);

// Clean up blob URL when done
shot.revoke();