import Pixalo from '../../../src/Pixalo.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight
});
game.start();

function clickEvent (e) {
    console.log('Clicked', e);
}

game.on(['click', 'mousedown'], clickEvent);

// Remove event listener
game.off('click', clickEvent);

// Remove event listeners
game.off(['click', 'mousedown'], clickEvent);