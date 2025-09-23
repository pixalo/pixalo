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
    height: window.innerHeight
});
game.start();

/**
 * Hold SPACE to rotate camera 45° then snap back
 */
let rot = false;
game.on({
    keydown: key => {
        if (key === 'space' && !rot) {
            rot = true;
            game.camera.rotateBy(45, false, 300);
        }
    },
    keyup: key => {
        if (key === 'space' && rot) {
            rot = false;
            game.camera.rotateBy(-45, false, 300);
        }
    }
});

game.append('guide', {
    width: 260,
    height: 35,
    x: (game.baseWidth - 260) / 2,
    y: (game.baseHeight - 35) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Hold SPACE to rotate camera',
    font: '20px Arial'
});