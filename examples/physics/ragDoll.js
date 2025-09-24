/**
 * Copyright (c) 2025 Pixalo
 *
 * @Repository: https://github.com/pixalo
 * @License: MIT
 * @Author:
 *    - Salar Izadi
 *    - https://github.com/salarizadi
 */
import Pixalo, {Box2D} from 'https://cdn.jsdelivr.net/gh/pixalo/pixalo@master/dist/pixalo.esm.js';

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight,
    background: '#031C1B',
    physics: { gravity: { x: 0, y: 800 } }
});
game.start();

// ground
game.append('ground', {
    x: 0, y: game.baseHeight - 40,
    width: game.baseWidth, height: 40,
    backgroundColor: '#268985',
    physics: { bodyType: 'static' }
});

// helper: create & centre body part
function part (id, opts) {
    const w = opts.width || opts.radius * 2 || 0;
    const h = opts.height || opts.radius * 2 || 0;
    opts.x = (game.baseWidth - w) / 2 + (opts.dx || 0);
    opts.y = (opts.baseY || 150);
    opts.draggable = true;
    return game.append(id, opts);
}

// build tighter ragdoll
const head = part('head', { radius: 22, shape: 'circle', backgroundColor: '#F3A71A', physics: { density: 1, friction: 0.3, restitution: 0.2 }, baseY: 120 });

const torso = part('torso', { width: 35, height: 70, backgroundColor: '#268985', physics: { density: 1, friction: 0.3, restitution: 0.1 }, baseY: 190 });

const armL = part('armL', { width: 45, height: 10, backgroundColor: '#F3A71A', physics: { density: 0.8, friction: 0.3 }, dx: -38, baseY: 180 });

const armR = part('armR', { width: 45, height: 10, backgroundColor: '#F3A71A', physics: { density: 0.8, friction: 0.3 }, dx: 38, baseY: 180 });

const legL = part('legL', { width: 14, height: 65, backgroundColor: '#268985', physics: { density: 1, friction: 0.3 }, dx: -12, baseY: 270 });

const legR = part('legR', { width: 14, height: 65, backgroundColor: '#268985', physics: { density: 1, friction: 0.3 }, dx: 12, baseY: 270 });

// joint helper
function join (idA, idB, ox, oy) {
    const bA = game.physics.bodies.get(idA);
    const bB = game.physics.bodies.get(idB);
    const anchor = new Box2D.Common.Math.b2Vec2(
        (game.baseWidth / 2 + ox) / game.physics.SCALE,
        oy / game.physics.SCALE
    );
    const rjd = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    rjd.Initialize(bA, bB, anchor);
    game.physics.world.CreateJoint(rjd);
}

// assemble after first step
game.one('update', () => {
    join('head', 'torso', 0, 155);
    join('torso', 'armL', -32, 175);
    join('torso', 'armR', 32, 175);
    join('torso', 'legL', -10, 245);
    join('torso', 'legR', 10, 245);
});