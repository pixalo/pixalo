/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo from 'https://cdn.jsdelivr.net/gh/pixalo/pixalo@master/dist/pixalo.esm.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight
});

await game.loadAsset('audio', 'music', 'https://raw.githubusercontent.com/pixalo/pixalo/refs/heads/main/examples/assets/audio/An-Epic-Story.mp3', {
    volume: 1,
    loop: true
});

game.start();

const player = game.append('player', {
    width: 150,
    height: 50,
    x: 10,
    y: 10,
    fill: '#268984',
    text: 'Move Me',
    color: 'white',
    borderRadius: 5,
    draggable: true
});

const music = game.append('music', {
    width: 150,
    height: 50,
    x: (game.baseWidth - 150) / 2,
    y: (game.baseHeight - 50) / 2,
    fill: '#F4A71A',
    text: 'Music: Come to me',
    color: 'black',
    borderRadius: 5,
    draggable: true
});

player.on('dragMove', updateAudio);
music.on('dragMove', updateAudio);

let musicInstance;
const MAX_HEARING_DISTANCE = 800;

async function updateAudio () {
    if (!musicInstance) {
        musicInstance = true;
        game.audio.playSpatial('music', music.absoluteX, music.absoluteY, 0, {
            spatial: {
                refDistance: 50,                   // Reference distance (lower = longer)
                maxDistance: MAX_HEARING_DISTANCE, // Maximum hearing distance
                rolloffFactor: 0.5,                // Sound attenuation rate (lower = slower)
                panningModel: 'HRTF',
                distanceModel: 'exponential'       // or 'linear'
            }
        });
    }

    // Setting the listener (player) position
    game.audio.setListenerPosition(player.absoluteX, player.absoluteY, 0);

    // Adjusting the position of the sound source (music)
    game.audio.setSpatialPosition('music', music.absoluteX, music.absoluteY, 0);

    const distance = game.getDistance(player.absoluteX, player.absoluteY, music.absoluteX, music.absoluteY);

    // Calculating sound volume based on distance
    let volume;
    if (distance >= MAX_HEARING_DISTANCE) {
        volume = 0;
    } else {
        volume = 1 - (distance / MAX_HEARING_DISTANCE);
        volume = volume * volume; // Quadratic curve
    }

    game.audio.setVolume('music', volume);
}