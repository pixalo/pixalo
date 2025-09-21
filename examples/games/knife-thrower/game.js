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

globalThis.pixalo = new Pixalo({
    quality: 2,
    fps: 60,
    resizeTarget: 'window',
    collision: true,
});

pixalo.on('ready', async () => {
    await pixalo.wait(
        pixalo.loadAsset('image', 'background', 'assets/images/background.png'),
        pixalo.loadAsset('image', 'circle', 'assets/images/circle.png'),
        pixalo.loadAsset('image', 'knife', 'assets/images/knife.png'),
        pixalo.loadAsset('audio', 'throw', 'assets/sounds/throw.mp3'),
        pixalo.loadAsset('audio', 'hit', 'assets/sounds/hit.mp3', {
            volume: 0.8
        }),
    );

    pixalo.resize(pixalo.window.width, pixalo.window.height);
    pixalo.start();

    pixalo.addBackground('background', {
        scale: 0.9,
        y: -150
    });

    let angle = 0;
    let knives = [];
    let currentKnife = null;
    let canThrow = true;
    let GAME_OVER = false;
    const RADIUS = 90;
    const ROTATION_SPEED = 1.2;
    const KNIFE_PENETRATION = 6;

    const scoreText = pixalo.append('score', {
        x: 30,
        y: 30,
        backgroundColor: 'transparent',
        text: '0',
        font: '50px Arial',
    });

    const circleWidth = 160, circleHeight = 160;
    const circle = pixalo.append('circle', {
        width: circleWidth,
        height: circleHeight,
        x: (pixalo.baseWidth - circleWidth) / 2,
        y: (pixalo.baseHeight - circleHeight) / 5,
        image: 'circle',
        collision: true,
        shape: 'circle',
    });
    circle.layer('above');

    const knifeWidth = 24, knifeHeight = 84;
    const knife = pixalo.append('knife', {
        width: knifeWidth,
        height: knifeHeight,
        x: (pixalo.baseWidth - knifeWidth) / 2,
        y: (pixalo.baseHeight - knifeHeight) / 1.1,
        image: 'knife',
        shape: 'rectangle',
        scale: 1.2,
        collision: {
            width: 10,
            height: 80,
            x: knifeWidth / 4,
            y: 2
        },
        zIndex: 1
    });

    function throwKnife (combo) {
        if (combo !== 'space' && typeof combo !== 'object')
            return;

        if (GAME_OVER) {
            pixalo.start();

            pixalo.findByClass('knife').forEach(entity => entity.kill());
            pixalo.find('gameover').kill();
            scoreText.text('0');

            knives    = [];
            canThrow  = true;
            GAME_OVER = false;
            return;
        }

        if (!canThrow || currentKnife) return;
        canThrow = false;

        pixalo.audio.play('throw');

        currentKnife = knife.clone();
        currentKnife.setCollisionGroup('attached_knife_' + scoreText.text());
        currentKnife.addClass('knife');

        pixalo.append(currentKnife);

        knife.hide();

        currentKnife.on('collide', collideKnife);

        currentKnife.move({
            y: circle.y - pixalo.baseHeight,
            duration: 800,
            easing: 'linear',
            onComplete () {
                if (currentKnife && !currentKnife.data('hasCollided')) {
                    currentKnife.kill();
                    canThrow = true;
                }
            }
        });
    }
    pixalo.on(['click', 'keydown'], throwKnife);

    circle.on('render', () => {
        if (GAME_OVER) return;

        angle = (angle + ROTATION_SPEED) % 360;
        circle.style('rotation', angle);

        const center = getCenterPosition();

        for (let i = 0; i < knives.length; i++) {
            const attachedKnife = knives[i];
            if (!attachedKnife.data('hasCollided')) continue;

            const totalAngle = attachedKnife.data('attachAngle') + angle;
            const totalRad = totalAngle * Math.PI / 180;

            const effectiveRadius = RADIUS - KNIFE_PENETRATION;

            const newX = center.x + effectiveRadius * Math.cos(totalRad) - attachedKnife.width / 2;
            const newY = center.y + effectiveRadius * Math.sin(totalRad) - attachedKnife.height / 2;

            attachedKnife.style({
                x: newX,
                y: newY,
                rotation: totalAngle - 90
            });
        }
    }).on('collide', async info => {
        if (!currentKnife || currentKnife.data('hasCollided')) return;

        currentKnife.data('hasCollided', true);
        currentKnife.halt();

        const center = getCenterPosition();
        const knifeX = currentKnife.x + currentKnife.width / 2;
        const knifeY = currentKnife.y + currentKnife.height;

        const dx = knifeX - center.x;
        const dy = knifeY - center.y;
        const collisionAngle = (Math.atan2(dy, dx) * 180 / Math.PI - angle + 360) % 360;
        const collisionRad = collisionAngle * Math.PI / 180;

        const effectiveRadius = RADIUS - KNIFE_PENETRATION;
        const finalY = center.y + effectiveRadius * Math.sin(collisionRad) - currentKnife.height / 2;

        currentKnife.data('attachAngle', collisionAngle);

        pixalo.audio.play('hit');

        knives.push(currentKnife);

        await pixalo.delay(250);

        pixalo.audio.stop('hit').stop('throw');

        knife.show();

        currentKnife = null;
        canThrow = true;

        scoreText.text(Number(scoreText.text()) + 1);
    });

    function collideKnife (info) {
        if (!GAME_OVER && pixalo.isEntity(currentKnife) && info.entity.id !== 'circle') {
            if (info.point.y <= knife.y - knife.height) { // Avoid collision with the main knife
                currentKnife.off('collide', collideKnife);

                GAME_OVER = true;
                canThrow = false;

                pixalo.append('gameover', {
                    width: 200,
                    height: 50,
                    x: (pixalo.baseWidth - 200) / 2,
                    y: (pixalo.baseHeight - 50) / 2,
                    text: 'Game Over',
                    borderRadius: 18,
                    borderWidth: 6,
                    borderColor: 'red'
                }).layer('above');

                currentKnife.halt().transition({
                    y: currentKnife.y + pixalo.baseHeight,
                    rotation: Math.floor(Math.random() * (360 - 180 + 1)) + 180
                }, {
                    duration: 600
                })
            }
        }
    }

    function getCenterPosition () {
        return {
            x: circle.x + circle.width / 2,
            y: circle.y + circle.height / 2
        };
    }

    pixalo.on('resize', () => {
        circle.style({
            x: (pixalo.baseWidth - circleWidth) / 2,
            y: (pixalo.baseHeight - circleHeight) / 5
        });

        knife.style({
            x: (pixalo.baseWidth - knifeWidth) / 2,
            y: (pixalo.baseHeight - knifeHeight) / 1.1
        });
    });
});

// pixalo.enableDebugger();