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
    physics: { gravity: { x: 0, y: 500 } }
});
game.start();

// --- auto sizing ---
const W = 50, H = 12, MARGIN = 0, PILLAR_W = 60;
const clearSpan = game.baseWidth - 2 * 150 - 2 * (PILLAR_W / 2);
const PLANKS = Math.floor((clearSpan + MARGIN) / (W + MARGIN));
const gap = (clearSpan - W) / (PLANKS - 1);
const startX = 150 + PILLAR_W;

// --- pillars (centred) ---
const leftPillar = game.append('leftPillar', {
    x: 150,
    y: (game.baseHeight - 300) / 2 + 300 / 2,
    width: PILLAR_W, height: 300,
    fill: '#268985',
    physics: { bodyType: 'static' }
});
const rightPillar = game.append('rightPillar', {
    x: game.baseWidth - 150,
    y: (game.baseHeight - 300) / 2 + 300 / 2,
    width: PILLAR_W, height: 300,
    fill: '#268985',
    physics: { bodyType: 'static' }
});

// --- bridge planks ---
const bodies = [];
for (let i = 0; i < PLANKS; i++) {
    const id = `p${i}`;
    game.append(id, {
        x: startX + i * gap,
        y: game.baseHeight - 270,
        width: W, height: H,
        fill: '#F3A71A',
        physics: { density: 0.8, friction: 0.4 }
    });
    bodies.push(game.physics.bodies.get(id));
}

// --- link planks with revolute joints ---
for (let i = 1; i < PLANKS; i++) {
    const anchor = new Box2D.Common.Math.b2Vec2(
        (startX + i * gap) / game.physics.SCALE,
        (game.baseHeight - 270) / game.physics.SCALE
    );
    const rjd = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    rjd.Initialize(bodies[i - 1], bodies[i], anchor);
    game.physics.world.CreateJoint(rjd);
}

// --- anchor first & last plank to pillars ---
const leftAnchor = new Box2D.Common.Math.b2Vec2(
    startX / game.physics.SCALE,
    (game.baseHeight - 270) / game.physics.SCALE
);
const rightAnchor = new Box2D.Common.Math.b2Vec2(
    (startX + (PLANKS - 1) * gap) / game.physics.SCALE,
    (game.baseHeight - 270) / game.physics.SCALE
);

const ljd = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
ljd.Initialize(game.physics.bodies.get('leftPillar'), bodies[0], leftAnchor);
game.physics.world.CreateJoint(ljd);

const rjd = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
rjd.Initialize(game.physics.bodies.get('rightPillar'), bodies[PLANKS - 1], rightAnchor);
game.physics.world.CreateJoint(rjd);

// weld last plank to pillar to stop wobble
const weldDef = new Box2D.Dynamics.Joints.b2WeldJointDef();
weldDef.Initialize(
    game.physics.bodies.get('rightPillar'),
    bodies[PLANKS - 1],
    rightAnchor
);
game.physics.world.CreateJoint(weldDef);

// --- real 2-wheel car ---
// const carX = (game.baseWidth - 70) / 2; // Center
const carX = leftPillar.x;
const carY = 200;
const wheelR = 30;

const chassis = game.append('chassis', {
    x: carX - 2, y: carY,
    width: 70, height: 15,
    fill: '#268985',
    physics: { density: 2 },
    draggable: true
});

const wheel1 = game.append('wh1', {
    shape: 'circle', width: wheelR, height: wheelR,
    x: carX - 5, y: carY + 15,
    fill: '#F3A71A',
    text: '+',
    physics: { density: 1, friction: 1.2 },
    draggable: true
});
const wheel2 = game.append('wh2', {
    shape: 'circle', width: wheelR, height: wheelR,
    x: (carX + 70) - wheelR, y: carY + 15,
    fill: '#F3A71A',
    text: '+',
    physics: { density: 1, friction: 1.2 },
    draggable: true
});

const [w1, w2] = [wheel1, wheel2].map(w => game.physics.bodies.get(w.id));
const c = game.physics.bodies.get(chassis.id);

// wait one frame so positions are valid
game.one('update', () => {
    [w1, w2].forEach(w => {
        const anchor = w.GetWorldCenter();
        const rjd = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
        rjd.Initialize(c, w, anchor);
        rjd.enableMotor = true;
        rjd.maxMotorTorque = 50;
        rjd.motorSpeed = 3;
        game.physics.world.CreateJoint(rjd);
    });
});