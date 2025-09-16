// Import all classes
import Utils from './Utils.js';
import Pixalo from './Pixalo.js';
import Workers from './Workers.js';
import AudioManager from './AudioManager.js';
import Background from './Background.js';
import Bezier from './Bezier.js';
import Camera from './Camera.js';
import Collision from './Collision.js';
import Ease from './Ease.js';
import Emitters from './Emitters.js';
import Entity from './Entity.js';
import Grid from './Grid.js';
import Particle from './Particle.js';
import Physics from './Physics.js';
import TileMap from './TileMap.js';

// Export all classes
export {
    Pixalo as default,
    Workers,
    AudioManager,
    Background,
    Bezier,
    Camera,
    Collision,
    Ease,
    Emitters,
    Entity,
    Grid,
    Particle,
    Physics,
    TileMap,
    Utils
};

// For UMD builds, also attach to the main Pixalo object
if (typeof window !== 'undefined') {
    const PixaloBundle = {
        Pixalo,
        Workers,
        AudioManager,
        Background,
        Bezier,
        Camera,
        Collision,
        Ease,
        Emitters,
        Entity,
        Grid,
        Particle,
        Physics,
        TileMap,
        Utils
    };

    // Make individual classes available
    Object.assign(PixaloBundle, {
        Workers,
        AudioManager,
        Background,
        Bezier,
        Camera,
        Collision,
        Ease,
        Emitters,
        Entity,
        Grid,
        Particle,
        Physics,
        TileMap,
        Utils
    });

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PixaloBundle;
    }
}