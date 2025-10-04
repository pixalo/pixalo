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

const px = new Pixalo('#canvas', {width: innerWidth, height: innerHeight});
px.start();

await px.loadAsset('tiles', 'tiles', 'assets/tiles/tiles.png', {
    tileSize: 64, tiles: {
        grass: [0, 0],
        dirt: [1, 0],
        tree: [2, 0],
        headTree: [3, 0],
        bush: [4, 0]
    }
});

const map = px.tileMap.create('map', {
    layers: {
        bg: px.tileMap.fillBoxWith('g'),
        lvl: [
            'wwwwwwwwwwwwwwwwwwwwwwww',
            'w                      w',
            'w  b                b  w',
            'w      b         b     w',
            'w           b          w',
            'w      b         b     w',
            'w  b                b  w',
            'w                      w',
            'wwwwwwwwwwwwwwwwwwwwwwww'
        ]
    },
    tiles: {
        g: 'tiles.grass',
        b: {tile: 'tiles.bush'}, // one-way platform
        w: {
            tile: 'tiles.tree',
            parts: [
                {
                    tile: 'tiles.headTree',
                    offsetY: -1
                }
            ]
        }
    }
});

px.tileMap.render('map');

px.camera.setBounds({
    x: 0, y: 0,
    width: px.baseWidth,
    height: px.baseHeight
}).zoomTo(1.5, 0, 0);