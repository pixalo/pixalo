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
    width    : window.innerWidth,
    height   : window.innerHeight,
    quality  : window.devicePixelRatio,
    fps      : 60,
    collision: true,
});

await game.loadAsset('image', 'player', './assets/character.png');

game.start();

const maxBullets = 2;
const maxEnemies = 10;
const spawnSafeDistance = 200;

game.append('guide', {
    x: 200,
    y: game.baseHeight - 50,
    fill: 'transparent',
    text: 'Move with ArrowKeys or WASD, shoot with Space or a tap',
    layer: 'above'
});

const scoreText = game.append('score', {
    x: 20,
    y: 20,
    fill: 'transparent',
    text: '0',
    font: '50px Arial',
    layer: 'above'
});

const player = game.append('player', {
    width: 100,
    height: 100,
    x: 10,
    y: 60,
    image: 'player',
    collision: {
        width: 70,
        x: 15
    }
});

player.on('collide', async info => {
    if (info.entity.hasClass('enemy')) {
        game.reset().start();

        game.camera.shake({
            intensity: 8,
            duration: 1000
        });

        const overText = game.append('text', {
            width: 160,
            height: 30,
            x: (game.baseWidth - 160) / 2,
            y: (game.baseHeight - 30) / 2,

            // Text
            fill: 'transparent',
            text: 'Game Over',
            color: '#F4A71B',
            font: '35px Arial',

            clickable: true
        });

        await game.delay(1000);

        overText.text('Play Again').on('click', () => {
            location.reload();
        });
    }
});

game.on('keydown', key => {
    if (game.isKeyPressed('space'))
        shooting();
});

game.on('click', () => shooting());

game.on('update', deltaTime => {
    const speed = 150; // 150 px/s
    const step = speed * (deltaTime / 1000);
    let dx = 0, dy = 0;
    const leftKey = game.isKeyPressed('left', 'a');

    if (leftKey) dx -= step;
    if (game.isKeyPressed('right', 'd')) dx += step;
    if (game.isKeyPressed('up', 'w')) dy -= step;
    if (game.isKeyPressed('down', 's')) dy += step;

    player.style('flipX', leftKey ?? player.styles.flipX).move(dx, dy);
});

function shooting () {
    const countBullets = game.findByClass('bullets').length;
    if (countBullets >= maxBullets)
        return;

    const bullet = game.append(`bullet-${countBullets}`, {
        shape: 'circle',
        width: 15,
        height: 15,
        fill: 'black',
        x: player.styles.flipX ? player.x : player.x + player.width,
        y: player.y + (player.height / 2),
        class: 'bullets',
        collision: true
    });

    bullet.move({
        x: !player.styles.flipX ? 1000 : -1000,
        duration: 500,
        onComplete () {
            bullet.kill();
        }
    });
}

function addEnemy () {
    const countEnemies = game.findByClass('enemy').length;
    if (countEnemies >= maxEnemies) return;
    let x, y;

    do {
        const side = Math.random() < 0.5 ? 0 : game.baseWidth;
        x = side;
        y = Math.random() * (game.baseHeight - 60);
    } while (Math.hypot(x - player.x, y - player.y) < spawnSafeDistance);

    const shapes = ['rectangle', 'circle', 'triangle', 'star'];
    const enemy = game.append(`enemy-${countEnemies + 1}`, {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        width: 60,
        height: 60,
        x,
        y,
        fill: game.randHex(),
        class: 'enemy',
        collision: true
    });

    enemy.on('collide', info => {
        if (info.entity.hasClass('bullets')) {
            info.entity.kill();

            // Disable collision detection so that when the player is close to the enemy
            // and the enemy is dying and the scale and rotation change, the player does
            // not collide and the player does not lose.
            enemy.disableCollision();

            enemy.transition({
                rotation: 180,
                opacity: 0,
                scale: 1.5,
            }, {
                duration: 300,
                onComplete: () => {
                    enemy.kill();
                    scoreText.text(Number(scoreText.text()) + 1);
                }
            });
        }
    });
}

function followPlayer () {
    game.findByClass('enemy').forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const len = Math.hypot(dx, dy) || 1;
        const vx = (dx / len) * 80;
        const vy = (dy / len) * 80;

        enemy.move({
            x: vx * 0.5,
            y: vy * 0.5,
            relative: true,
            duration: 500
        });
    });
}

game.timer(() => addEnemy(), 1500);
game.timer(() => followPlayer(), 500);

// game.enableDebugger();