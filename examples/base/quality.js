/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from '../../src/Pixalo.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight,
    fps: 60,
    quality: window.devicePixelRatio
});
game.start();

game.quality(0); // Very Low
game.quality(0.5); // Low
game.quality(1); // Normal
game.quality(1.5); // Medium (Recommended)
game.quality(2); // High (Recommended)
game.quality(3); // Very High

// Set actual size in memory (scaled to account for extra pixel density).
// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
game.quality(window.devicePixelRatio);

const currentQuality = game.quality();

console.log('Current Quality:', currentQuality);