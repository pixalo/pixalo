import Pixalo from '../../../src/Pixalo.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight
});
game.start();

// Add a custom event
game.on('myEvent', (text, data) => {
    console.log('Text', text);
    console.log('Data', data);
});

// Calling a custom event
game.trigger('myEvent', 'Hello World!', {
    foo: 'bar',
    bar: 'baz'
});