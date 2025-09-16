import Pixalo from '../../../src/Pixalo.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight
});
game.start();

game.one('click', function () {
    console.log('You can only click once.');
});