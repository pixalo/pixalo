import Pixalo from '../../src/Pixalo';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight,
    fps: 60
});
game.start();

// Disable debugger
game.disableDebugger();

// Enable debugger
game.enableDebugger();

// Only when the debugger is active
game.log('Log');
game.info('Info');
game.warn('Warn');
game.error('Error');