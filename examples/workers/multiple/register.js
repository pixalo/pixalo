/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import {Workers} from 'https://cdn.jsdelivr.net/gh/pixalo/pixalo@master/dist/pixalo.esm.js';

const gameScript = 'https://cdn.jsdelivr.net/gh/pixalo/pixalo@master/examples/workers/multiple/game.js';

const Primary = Workers.register('#primary', gameScript, {
    onmessage: (message) =>
        console.log('Primary: From Worker', message),
    onerror: (error) =>
        console.error('Primary: Worker error', error)
});
Workers.send(Primary, {
    action: 'game_config',
    text  : 'Primary Canvas',
    background: '#268884'
});

const Secondary = Workers.register('#secondary', gameScript, {
    onmessage: (message) =>
        console.log('Secondary: From Worker', message),
    onerror: (error) =>
        console.error('Secondary: Worker error', error)
});
Workers.send(Secondary, {
    action: 'game_config',
    text  : 'Secondary Canvas',
    background: '#F3A71B'
});