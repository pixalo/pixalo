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
game.start();

const originalText = game.append('text', {
    width: 100,
    height: 100,
    x: (game.baseWidth  - 100) / 2,
    y: (game.baseHeight - 200) / 2,

    // Text
    text: 'Original text',
    color: '#268984',
    font: '35px Arial',
    textAlign: 'center',
    textBaseline: 'middle',
    lineHeight: 2,
});

const clonedText = originalText.clone(
    // Set a custom ID for this clone.
    'clonedText'
);

clonedText.text('Cloned text from the original text');
clonedText.style({
    y: originalText.y + 100
});

// Append to game
game.append(clonedText);