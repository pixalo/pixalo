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
    height: window.innerHeight,
    collision: true,
    resize: 'window'
});

game.start();

const button = game.append('button', {
    width : 250,
    height: 50,
    x : (game.baseWidth - 250) / 2,
    y: (game.baseHeight - 50) / 2,
    font: '20px Arial',
    text: 'Click Me!',

    clickable: true,
    hoverable: true,
    draggable: true
});

// To review events
button.isClickable();
button.isHoverable();
button.isDraggable();

button.on('click', async () => {
    button.text('Thanks :)');

    // Disable Click
    button.events.clickable = false;

    await game.delay(500);
    button.text('Now, Drag and Drop');

    button.on('drag', () => {
        button.text('Dragging');
    }).on('drop', async () => {
        // Disable Drag/Drop
        button.events.draggable = false;

        button.text('OK, I dropped');
        await game.delay(500);
        button.text('Hover Me :>');

        button.on('hover', () => {
            button.text('Hooray! I hovered :)');
        }).on('hoverOut', () => {
            // Disable Hover
            button.events.hoverable = false;
            button.text('Bye!');
        });
    });
});
