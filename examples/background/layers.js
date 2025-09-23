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
    width : window.innerWidth,
    height: window.innerHeight
});

await game.wait(
    game.loadAsset('image', 'background',  'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/cloudscape/background.png'),
    game.loadAsset('image', 'moon',        'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/cloudscape/moon.png'),
    game.loadAsset('image', 'bottom-clouds','https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/cloudscape/bottom-clouds.png'),
    game.loadAsset('image', 'top-clouds',  'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/cloudscape/top-clouds.png')
);
game.start();

game.addBackground('background', {
    width : game.baseWidth,
    height: game.baseHeight
});

game.addBackground('moon', {
    y    : -50,
    scale: 1.5
});

game.addBackground('top-clouds', {
    repeat: 'x',
    speed : { x: 5, y: 0 },
    zIndex: 20
});

game.addBackground('bottom-clouds', {
    top   : true,
    y     : game.baseHeight - 180,
    repeat: 'x',
    speed : { x: 5, y: 0 }
});