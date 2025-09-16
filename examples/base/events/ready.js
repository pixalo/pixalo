import Pixalo from '../../../src/Pixalo.js';

const game = new Pixalo({
    width: window.innerWidth,
    height: window.innerHeight
});

// It is needed when you run your game in the WebWorker,
// otherwise you don't need to run your game code in this function.
game.on('ready', () => {
    game.start();
    console.log('Game ready');
});