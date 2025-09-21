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

const canvas = document.getElementById('canvas');
const gameScript = `https://cdn.jsdelivr.net/gh/pixalo/pixalo/examples/workers/single/game.js`;

Workers.register(canvas, gameScript, {
    onmessage: (message) =>
        console.log('From Worker', message),
    onerror: (error) =>
        console.error('Worker error', error)
});