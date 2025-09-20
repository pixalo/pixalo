/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from '../../src/index.js';

const game = new Pixalo('#canvas', {
    width : window.innerWidth,
    height: window.innerHeight
});

await game.loadAsset('image', 'player', '../assets/character.png');

game.start();

const player = game.append('player', {
    width: 100,
    height: 100,
    x: 10,
    y: 10,
    image: 'player'
});

player.move({
    x: 100,
    y: 100,
    easing: game.Ease.easeInCubic, // Default: 'linear'
    relative: true,
    duration: 5000,
    onUpdate (eased) {
        console.log('moveAnimation updating', eased);
    },
    onComplete () {
        console.log('moveAnimation complete');
    }
});