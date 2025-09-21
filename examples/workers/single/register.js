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

Workers.register(canvas, `https://cdn.jsdelivr.net/gh/pixalo/pixalo@main/examples/workers/single/game.js`, {
    onmessage: (message) =>
        console.log('From Worker', message),
    onerror: (error) =>
        console.error('Worker error', error)
});