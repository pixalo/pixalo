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
game.start();

/**
 * Pinch-to-zoom (touch)
 */
// Optional: Adjust this value to control zoom sensitivity (higher = more sensitive)
const ZOOM_SENSITIVITY = 10;

// Variable to store the initial pinch state
let pinchState = null;

game.on({
    touchstart: e => {
        if (e.touches.length === 2) {
            // Store initial pinch state with two finger positions
            pinchState = {
                distance: game.getDistance(
                    e.touches[0].screenX, e.touches[0].screenY,
                    e.touches[1].screenX, e.touches[1].screenY
                ),
                // Store midpoint for centered zooming
                midpoint: {
                    x: (e.touches[0].screenX + e.touches[1].screenX) / 2,
                    y: (e.touches[0].screenY + e.touches[1].screenY) / 2
                }
            };
        }
    },
    touchmove : e => {
        // Only process two-finger gestures when we have an initial pinch state
        if (e.touches.length !== 2 || !pinchState) return;

        // Calculate new distance between fingers
        const newDistance = game.getDistance(
            e.touches[0].screenX, e.touches[0].screenY,
            e.touches[1].screenX, e.touches[1].screenY
        );

        // Calculate midpoint of the two fingers
        const midpoint = {
            x: (e.touches[0].screenX + e.touches[1].screenX) / 2,
            y: (e.touches[0].screenY + e.touches[1].screenY) / 2
        };

        // Calculate scale factor with sensitivity adjustment
        const rawScale = newDistance / pinchState.distance;
        const scale = 1 + ((rawScale - 1) * ZOOM_SENSITIVITY);

        // Apply zoom if there's any change in scale
        if (scale !== 1)
            game.camera.zoomAtPoint(scale, midpoint.x, midpoint.y, 50, game.Ease.linear);

        // Update pinch state for next frame
        pinchState = {
            distance: newDistance,
            midpoint: midpoint
        };
    },
    touchend  : e => {
        if (e.touches.length < 2)
            pinchState = null;
    }
});

/**
 * mouse-wheel zoom centered on pointer
 **/
const wheel = e => {
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    game.camera.zoomAtPoint(factor, e.screenX, e.screenY, 50, game.Ease.linear);
};
game.on('wheel', wheel);

game.append('guide', {
    width: 300,
    height: 35,
    x: (game.baseWidth - 300) / 2,
    y: (game.baseHeight - 35) / 2,
    fill: 'transparent',
    color: '#268884',
    text: 'Wheel / pinch to zoom',
    font: '20px Arial'
});