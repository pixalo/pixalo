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
    background: '#031C1B',
    camera: {
        zoom: 3
    },
    physics: {
        gravity: {x: 0, y: 250}
    }
});
px.start();

await px.wait(
    px.loadAsset('image', 'character', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/character.png'),
    px.loadAsset('tiles', 'ground', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/tiles/kenny/ground.png', {
        tileSize: 128,
        tiles: {
            middle  : [0, 1],
            right   : [0, 0],
            left    : [0, 2],
            platform: [0, 8]
        }
    }),
    px.loadAsset('tiles', 'items', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/tiles/kenny/items.png', {
        tileSize: 128,
        tiles: {
            flag    : [1, 0],
            flagUp  : [1, 1],
            flagDown: [1, 2],
            key     : [4, 0],
            coin    : [5, 3]
        }
    })
);

const UI = px.append('ui', {
    x: 10, y: 10,
    width: 100,
    height: 20,
    position: 'fixed'
});
UI.append('icon', {
    x: 0, y: -1,
    width: 22,
    height: 22,
    image: 'items.coin'
});
UI.append('counter', {
    x: 20, y: 6,
    width: 25,
    height: 10,
    text: '0',
    font: '12px Arial',
    color: 'white',
    textAlign: 'left'
});

/* ---------- TileMap ---------- */
px.tileMap.create('level-1', {
    overlap: 0,
    baseTileSize: 128,
    layers: {
        main: [
            '   P      C  C',
            '   _      _  _',
            '',
            'LGGGGGR        F',
            '        LGGGGGGR'
        ]
    },
    tiles: {
        R: {
            tile: 'ground.right',
            collision: {
                type: 'platform',
                side: 'bottom'
            }
        },
        G: {
            tile: 'ground.middle',
            collision: {
                type: 'platform',
                side: 'bottom',
                physics: {
                    restitution: 5
                }
            }
        },
        L: {
            tile: 'ground.left',
            collision: {
                type: 'platform',
                side: 'bottom'
            }
        },
        _: {
            tile: 'ground.platform',
            collision: {
                type: 'platform',
                bounds: [0, 0, 32, 18]
            }
        },
        C: {
            tile : 'items.coin',
            shape: 'circle',
            collision: {
                type : 'sensor',
                bounds: [4.2, 4.2, 15, 15],
                onCollide (e) {
                    if (e.entityB.id !== 'player') return;
                    const tile = e.entityA.data('tile');
                    px.tileMap.removeTile('main', tile.tileX, tile.tileY);

                    // Collect coin
                    const count = Number(UI.find('counter').text());
                    UI.find('counter').text(count + 1);
                }
            }
        },
        F: {
            tile: 'items.flag',
            frames: ['items.flagUp', 'items.flagDown'],
            frameRate: 1,
            loop: true,
            playing: false,
            collision: {
                type: 'sensor',
                onCollide (e) {
                    if (e.entityB.id !== 'player') return;
                    const tile = e.entityA.data('tile');
                    px.tileMap.playTileAnimation('F', tile.x, tile.y);
                }
            }
        }
    }
});
px.tileMap.render('level-1');

/* ---------- Player ---------- */
const playerPos = px.tileMap.tileToWorld(3, 1);
const player = px.append('player', {
    x: playerPos.x,
    y: playerPos.y - 30,
    width: 24,
    height: 30,
    image: 'character',
    collision: true,
    physics: {
        fixedRotation: true
    },
    data: {
        speed: 3,
        jumpPower: 100
    }
});
px.camera.follow(player);

const box = px.append('box', {
    x: 140, y: 50,
    width: 25,
    height: 25,
    fill: 'white',
    borderRadius: 6,
    physics: {
        friction: 0,
        density : 0,
        restitution: 0
    }
});
box.on('collide', data => {
    if (data.target.id === 'player' && data.sideB === 'bottom')
        data.target.data('onGround', box);
}).on('collideEnd', data => {
    if (data.target.id === 'player')
        data.target.unset('onGround');
});

const DEAD_ZONE = 250;
px.on('update', () => {
    const playerSpeed = player.data('speed');
    const jumpPower = player.data('jumpPower');
    const onGround = player.data('onGround');
    let dx = 0, dy = 0;

    if (px.isKeyPressed('left', 'a'))
        dx = -playerSpeed;
    if (px.isKeyPressed('right', 'd'))
        dx = playerSpeed;

    player.style('flipX', dx < 0);

    if (px.isKeyPressed('up', 'space', 'w') && onGround)
        player.jump(jumpPower);

    if (!player.data('jumped'))
        player.move(dx, dy);

    if (DEAD_ZONE < player.y)
        location.reload();
});