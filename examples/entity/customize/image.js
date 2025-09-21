/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from 'http://cdn.jsdelivr.net/gh/pixalo/pixalo@master/dist/pixalo.esm.js';

const game = new Pixalo('#canvas', {
    fps: 60,
    width : window.innerWidth,
    height: window.innerHeight
});

await game.loadAsset('image', 'banner', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/banner.png');

game.start();

game.append('photo', {
    width: 300,
    height: 300,
    x: (game.baseWidth  - 300) / 2,
    y: (game.baseHeight - 300) / 2,

    /** Setting an image in several different ways */

    // backgroundImage: pixalo.getAsset('banner'),
    // backgroundImage: 'banner',
    // backgroundImageFit: 'cover',
    // backgroundImagePosition: 'center',
    // backgroundImageRepeat: false,
    // image: {
    //     src: pixalo.getAsset('banner'),
    //     fit: 'cover',
    //     position: 'center',
    //     repeat: false
    // },
    image: 'banner',
});