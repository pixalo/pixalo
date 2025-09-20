/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import {Workers} from '../../../src/index.js';

const canvas = document.getElementById('canvas');

Workers.register(canvas, `./game.js`, {
    onmessage: (message) =>
        console.log('From Worker', message),
    onerror: (error) =>
        console.error('Worker error', error)
});