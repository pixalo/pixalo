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
    height: window.innerHeight,
    // debugger: true
});
game.start();

await game.loadAsset('spritesheet', 'punk_pixel', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/spritesheets/punk-pixel.png', {
    width: 48,
    height: 48,
    columns: 6,
    rows: 3,
    originOffset: [-8, 6] // x, y
}).then(asset => {
    /**
     * Full information and spritesheet settings
     */
    console.log(asset);
});

const sprite = game.append('sprite', {
    width: 115,
    height: 128,
    x: (game.baseWidth - 115) / 2,
    y: (game.baseHeight - 128) / 2,
    draggable: true,

    /**
     * Specify the sprite
     */
    sprite: {
        asset: 'punk_pixel',
        animations: {
            idle: {
                frames: [0, 1, 2, 3],
                frameRate: 8,
                loop: true,

                // When rendering
                onRender (renderInfo) {
                    console.log('Rendering', renderInfo)
                },

                // When the animation starts
                onStart (animationName) {
                    console.log('Starting', animationName);
                },

                // When the animation ends (for loop: false)
                onEnd (animationName) {
                    console.log('Ending', animationName);
                },

                // Every time the animation loops
                onLoop (animationName) {
                    console.log('Looping', animationName);
                },

                // At each frame change
                onFrame (frameIndex) {
                    console.log('Frame Index', frameIndex);
                }
            },
            attack: {
                frames: [6, 7, 8, 9, 10, 11],
                frameRate: 12,
                loop: true
            },
            run: {
                frames: [12, 13, 14, 15, 16, 17],
                frameRate: 8,
                loop: true
            },
        },
        defaultAnimation: 'idle',
    }
});


sprite.on({
    spriteRender: info => {
        console.log(`Rendered sprite`, info);
    },
    animationStart: animationName => {
        console.log(`Animation ${animationName} started`);
    },
    animationOnLoop: animationName => {
        console.log(`Animation ${animationName} on loop`);

        /**
         * Run the next animation when the
         * current animation is finished.
         */
        const animNames = Object.keys(sprite.sprite.animations);
        const next = animNames[(animNames.indexOf(animationName) + 1) % animNames.length];
        sprite.play(next);
    },
    animationEnd: animationName => {
        // When the animation ends (for loop: false)
        console.log(`Animation ${animationName} ended`);
    },
    frameChange: frameIndex => {
        console.log(`Frame changed to ${frameIndex}`);
    },
    animationChange: (oldAnim, newAnim) => {
        console.log(`Animation changed from ${oldAnim} to ${newAnim}`);
    },
    animationStop: animationName => {
        console.log(`Animation ${animationName} stopped`);
    },
    animationPause: animationName => {
        console.log(`Animation ${animationName} paused`);
    },
    animationResume: animationName => {
        console.log(`Animation ${animationName} resumed`);
    },
    spriteAssetChanged: asset => {
        console.log(`Sprite asset changed: ${asset}`);
    }
});