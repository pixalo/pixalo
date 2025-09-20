/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from '../../src/index.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight
});
game.start();

const entity = game.append('entity', {
    width: 280,
    height: 20,
    x: (game.baseWidth - 280) / 2,
    y: (game.baseHeight - 20) / 2,

    fill: 'transparent',
    text: 'View the console log to see the results',
    scale: 1.5,

    // Define class names
    class: 'enemy boss'
});

entity.addClass('fast');
console.log('Added ClassName', entity.class);

if (entity.hasClass('enemy')) {
    entity.toggleClass('invulnerable');
}
console.log('Toggle ClassName', entity.class);

entity.removeClass('invulnerable');
console.log('Remove ClassName', entity.class);

const classNames = game.find('entity').class;
console.log('ClassNames', classNames);