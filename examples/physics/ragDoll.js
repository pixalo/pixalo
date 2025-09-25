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
    width : window.innerWidth,
    height: window.innerHeight,
    background: '#031C1B',
    physics : { gravity: { y: 800 } }
});
game.start();

// 2. Static ground
game.append('ground', {
    x: 0,  y: game.baseHeight - 40,
    width : game.baseWidth,
    height: 40,
    backgroundColor: '#268985',
    physics: { bodyType: 'static' }
});

// 3. Body-part dimensions (top-left anchor)
const HEAD_D  = 44;                                // head diameter
const TORSO_W = 35,  TORSO_H = 70;        // torso
const ARM_W   = 45,  ARM_H  = 10;         // upper arms
const LEG_W   = 14,  LEG_H  = 65;         // upper legs

// 4. Factory – create a draggable body part
function part (id, opts) {
    opts.draggable = true;                // Pixalo flag
    return game.append(id, opts);         // returns the sprite
}

/* ------------------------------------------------------------------ */
/* 5. Assemble the doll                                               */
/*    All parts are initially centred horizontally and stacked        */
/*    vertically so they look connected before physics kicks in.      */
/* ------------------------------------------------------------------ */
const head = part('head', {
    shape: 'circle', width: HEAD_D, height: HEAD_D,
    backgroundColor: '#F3A71A',
    physics: { density: 1, friction: 0.3, restitution: 0.2 },
    x: (game.baseWidth - HEAD_D) / 2,
    y: 50,
    text: '> <\n_',
    lineHeight: 0.1
});

const torso = part('torso', {
    width: TORSO_W, height: TORSO_H,
    backgroundColor: '#268985',
    physics: { density: 1, friction: 0.3, restitution: 0.1 },
    x: (game.baseWidth - TORSO_W) / 2,
    y: head.y + HEAD_D          // Top edge = bottom edge of head
});

const armL = part('armL', {
    width: ARM_W, height: ARM_H,
    backgroundColor: '#F3A71A',
    physics: { density: 0.8, friction: 0.3 },
    x: torso.x - ARM_W,        // Right edge = left edge of trunk
    y: torso.y + 25
});

const armR = part('armR', {
    width: ARM_W, height: ARM_H,
    backgroundColor: '#F3A71A',
    physics: { density: 0.8, friction: 0.3 },
    x: torso.x + TORSO_W,      // Left edge = right edge of trunk
    y: torso.y + 25
});

const legL = part('legL', {
    width: LEG_W, height: LEG_H,
    backgroundColor: '#268985',
    physics: { density: 1, friction: 0.3 },
    x: torso.x,
    y: torso.y + TORSO_H
});

const legR = part('legR', {
    width: LEG_W, height: LEG_H,
    backgroundColor: '#268985',
    physics: { density: 1, friction: 0.3 },
    x: torso.x + TORSO_W - LEG_W,
    y: torso.y + TORSO_H
});

/* ------------------------------------------------------------------ */
/* 6. Joint stiffness – single knob to tune the whole doll            */
/*    0  : spaghetti (no motor, no limit)                             */
/*    100: mannequin (strong motor, tight angle limits)               */
/* ------------------------------------------------------------------ */
const stiffness = 20;   // 0-100 scale

// 7. Helper – create a revolute joint between two bodies
function join(idA, idB, worldX, worldY, lo = -45, hi = 45) {
    const bA = game.physics.bodies.get(idA);
    const bB = game.physics.bodies.get(idB);
    const anchor = new Box2D.Common.Math.b2Vec2(
        worldX / game.physics.SCALE,
        worldY / game.physics.SCALE
    );
    const rjd = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    rjd.Initialize(bA, bB, anchor);

    if (stiffness > 5) {
        rjd.enableLimit = true;
        rjd.lowerAngle = lo * Math.PI / 180;
        rjd.upperAngle = hi * Math.PI / 180;
    } else {
        rjd.enableLimit = false;
    }

    rjd.maxMotorTorque = stiffness * 0.6;
    rjd.motorSpeed = 0;
    rjd.enableMotor = stiffness > 2;
    game.physics.world.CreateJoint(rjd);
}


// 8. Wire the skeleton once physics bodies exist
game.one('update', () => {
    /* Neck: Horizontal center of both + bottom edge of head = top edge of torso */
    join('head', 'torso',
        head.x + HEAD_D / 2,
        head.y + HEAD_D,
        -25, 25);

    /* Shoulder: Single horizontal edge */
    join('torso', 'armL',
        torso.x,
        torso.y + 25,
        -70, 40);

    join('torso', 'armR',
        torso.x + TORSO_W,
        torso.y + 25,
        -40, 70);

    /* Pelvis: Lower edge of the torso */
    join('torso', 'legL',
        torso.x + LEG_W / 2,
        torso.y + TORSO_H,
        -30, 20);

    join('torso', 'legR',
        torso.x + TORSO_W - LEG_W / 2,
        torso.y + TORSO_H,
        -20, 30);
});