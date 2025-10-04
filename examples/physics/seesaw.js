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
    x: 0,
    y: game.baseHeight - 20,
    width: game.baseWidth,
    height: 40,
    backgroundColor: '#258784',
    physics: { bodyType: 'static' }
});

// pivot
game.append('pivot', {
    x: (game.baseWidth - 20) / 2,
    y: game.baseHeight - 120,
    width: 20,
    height: 20,
    backgroundColor: '#95a5a6',
    physics: { bodyType: 'static' }
});

// plank (seesaw)
game.append('plank', {
    x: (game.baseWidth - 300) / 2,
    y: game.baseHeight - 100,
    width: 300,
    height: 15,
    backgroundColor: '#F4A81B',
    physics: { density: 0.5 }
});

// create joint via raw Box2D through game.physics.world
const plankBody = game.physics.bodies.get('plank');
const pivotBody = game.physics.bodies.get('pivot');
const anchor = new Box2D.Common.Math.b2Vec2(
    (game.baseWidth / 2) / game.physics.SCALE,
    (game.baseHeight - 120) / game.physics.SCALE
);
const revolute = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
revolute.Initialize(pivotBody, plankBody, anchor);
game.physics.world.CreateJoint(revolute);

// drop boxes
let count = 0;
const dropBox = side => {
    game.append(`box${++count}`, {
        x: game.baseWidth / 2 + side * 120,
        y: 50,
        width: 40,
        height: 40,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        physics: { density: 1, restitution: 0.2 },
        draggable: true
    });
};
dropBox(-1);

game.timeout(() => dropBox(1), 500);