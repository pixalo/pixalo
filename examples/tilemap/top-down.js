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

const px = new Pixalo('#canvas', {
    width: innerWidth,
    height: innerHeight,
    camera: {
        zoom: 2.5,
        bounds: {
            x: 0, y: 0,
            width: innerWidth,
            height: innerHeight,
        }
    },
    collision: true,
    // debugger: true
});
px.start();

await px.wait(
    px.loadAsset('tiles', 'tiles', 'assets/tiles/tiles.png', {
        tileSize: 64, tiles: {
            grass   : [0, 0],
            dirt    : [1, 0],
            tree    : [2, 0],
            bush    : [4, 0],
            headTree: [3, 0]
        }
    }),
    px.loadAsset('image', 'character', 'assets/character.png')
);

px.tileMap.create('top-down', {
    layers: {
        bg: px.tileMap.fillBoxWith('G'),
        lvl: [
            '                          ',
            'TTTTTTTTTTTTTTTTTTTTTTTTTT',
            'T             B          T',
            'T  T   B    T     B   T  T',
            'T    B        B          T',
            'T       B         B    T T',
            'T T           T          T',
            'T         B         T    T',
            'T     T     B   T        T',
            'T  B     B         T   B T',
            'T                        T',
            'TTTTTTTTTTTTTTTTTTTTTTTTTT'
        ]
    },
    tiles: {
        G: 'tiles.grass',
        B: {
            tile: 'tiles.bush',
            collision: {
                type: 'solid',
                bounds: [1, 4, 26, 24]
            }
        },
        T: {
            tile: 'tiles.tree',
            parts: [
                {
                    tile: 'tiles.headTree',
                    offsetY: -1
                }
            ],
            collision: {
                type: 'solid',
                bounds: [2, -9, 25, 51]
            }
        }
    }
});

px.tileMap.render('top-down');

const player = px.append('player', {
    x: 80,
    y: 100,
    width: 24,
    height: 30,
    image: 'character',
    collision: true,
    data: {
        speed: 1.5
    }
});

px.camera.follow(player);

px.on('update', () => {
    const speedPlayer = player.data('speed');
    let dx = 0, dy = 0;

    if (px.isKeyPressed('left', 'a'))
        dx = -speedPlayer;
    if (px.isKeyPressed('right', 'd'))
        dx = speedPlayer;
    if (px.isKeyPressed('up', 'w'))
        dy = -speedPlayer;
    if (px.isKeyPressed('down', 's'))
        dy = speedPlayer;

    player.move(dx, dy).style('flipX', dx < 0);
});