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

// 1) Fixed sky (motionless)
game.addBackground('background', {
    width   : game.baseWidth,
    height  : game.baseHeight,
    repeat  : 'x',
    parallax: 0        // Completely fixed to the camera
});

// 2) The moon moves a little with the camera.
game.addBackground('moon', {
    parallax: 0.2,     // 20% movement relative to the camera
    zIndex  : 10
});

// 3) Medium-speed clouds
game.addBackground('top-clouds', {
    repeat  : 'x',
    parallax: 0.4,     // 40% movement
    zIndex  : 20
});

// 4) Clouds near the fastest parallax movement + in front of the camera
game.addBackground('bottom-clouds', {
    top     : true,
    repeat  : 'x',
    parallax: 0.7,     // 70% movement (seems to be very close)
    y       : game.baseHeight - 180,
    zIndex  : 30
});

let dir = 1;
game.timer(() => {
    const shift = 600 * dir;
    game.camera.moveBy(shift, 0, false, 2000);
    dir *= -1;
}, 2500);