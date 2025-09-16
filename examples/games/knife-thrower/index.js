import {Workers} from 'https://cdn.jsdelivr.net/gh/pixalo/pixalo/dist/pixalo.esm.js';

const register = Workers.register('#canvas', './game.js', {
    onmessage (message) { },
    onerror (error) { }
});