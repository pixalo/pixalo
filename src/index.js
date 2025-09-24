// ----------  Import  ----------
import Utils        from './Utils.js';
import Pixalo       from './Pixalo.js';
import Workers      from './Workers.js';
import AudioManager from './AudioManager.js';
import Background   from './Background.js';
import Bezier       from './Bezier.js';
import Camera       from './Camera.js';
import Collision    from './Collision.js';
import Ease         from './Ease.js';
import Emitters     from './Emitters.js';
import Entity       from './Entity.js';
import Grid         from './Grid.js';
import Particle     from './Particle.js';
import Physics, {Box2D} from './Physics.js';
import TileMap      from './TileMap.js';

// ----------  ES-Module Export  ----------
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
    Box2D,
    TileMap,
    Utils
};

// ----------  UMD / AMD / CommonJS / Browser  ----------
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
        Box2D,
        TileMap,
        Utils
    };

    // 1) AMD
    if (typeof define === 'function' && define.amd) {
        define(function () { return PixaloBundle; });
    }
    // 2) CommonJS
    else if (typeof module === 'object' && module.exports) {
        module.exports = PixaloBundle;
    }
    // 3) Browser global
    else {
        window.PixaloBundle = PixaloBundle;
    }
}