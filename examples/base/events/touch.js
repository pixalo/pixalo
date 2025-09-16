import Pixalo from '../../../src/Pixalo.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight
});

game.start();

game.on('touchstart', (e) => {
    console.log('TouchStart', e);
});
game.on('touchmove', (e) => {
    console.log('TouchMove', e);
});
game.on('touchend', (e) => {
    console.log('TouchEnd', e);
});

// Hold Finger in the game world
game.on('rightclick', (e) => {
    console.log('Rightclick', e);
});

// Click in the game world
game.on('click', (e) => {
    console.log('Click', e);
});