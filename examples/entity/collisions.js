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
    height: window.innerHeight,
    fps: 60,
    collision: true,
    debugger: true,
});
game.start();

game.on({
    collisions: data => {
        const {entityA, entityB, point, timestamp} = data;

        // Add collision point marker
        game.debugger.addItem(`collision-${timestamp}`, {
            x: point.x - 2,
            y: point.y - 2,
            width: 4,
            height: 4,
            shape: 'circle',
            strokeColor: 'rgba(255, 255, 0, 1)',
            fillColor: 'rgba(255, 255, 0, 0.6)'
        });

        // Remove after short time
        game.timeout(() => {
            game.debugger.removeItem(`collision-${timestamp}`);
        }, 1000);
    },
    collisionEnd: data => {
        game.log('Global: End Collision', data);
    }
});

const rectangle = game.append('rectangle', {
    width: 30,
    height: 30,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    backgroundColor: '#278984',
    collision: true,
    draggable: true
});
rectangle.on('collide', info => {
    game.info('Rectangle collide with ' + info.entity.id, info)
});

if (rectangle.isCollidable()) {
    game.info('Rectangle is collidable');

    /**
     * Set collision group
     *
     * WARNING: When entities are in a collision group, they cannot collide with their groupmates.
     * */
    rectangle.setCollisionGroup('rectangles');
}

const rectangle2 = game.append('rectangle2', {
    width: 50,
    height: 50,
    backgroundColor: '#278984',
    x: window.innerWidth / 4,
    y: window.innerHeight / 4,
    borderRadius: 6,
    collision: {
        /**
         * Collision group
         *
         * WARNING: When entities are in a collision group, they cannot collide with their groupmates.
         * */
        group: 'rectangles',

        // Change the position of the collision points.
        x: -100,
        y: 10,

        // Change the size of collision points
        width: 30,
        height: 30,
    },
    draggable: true
});
rectangle2.on('collide', info => {
    game.info('Rectangle2 collide with ' + info.entity.id, info)
});

const circle = game.append('circle', {
    shape: 'circle',
    width: 50,
    height: 50,
    x: (window.innerWidth / 2) + 100,
    y: window.innerHeight / 2,
    backgroundColor: '#F4A71B',
    draggable: true,
    collision: true
});
circle.on('collide', info => {
    game.info('Circle collide with ' + info.entity.id, info)
});

const star = game.append('star', {
    shape: 'star',
    width: 50,
    height: 50,
    x: (window.innerWidth / 2) + 100,
    y: window.innerHeight / 2 + 100,
    backgroundColor: '#F4A71B',
    collision: {
        // Change the position of the collision points.
        x: 100
    },
    draggable: true
});
star.on('collide', info => {
    game.info('Star collide with ' + info.entity.id, info)
});

const polygon = game.append('polygon', {
    shape: 'polygon',
    width: 200,
    height: 200,
    backgroundColor: '#ff0000',

    // Collision points
    points: [
        {x: -200 / 2, y: -200 / 2},
        {x: 200 / 2, y: -200 / 2},
        {x: 200 / 2, y: 0},
        {x: 0, y: 200 / 2},
        {x: -200 / 2, y: 0}
    ],
    collision: {
        // points: [
        //     {x: -200 / 2, y: -200 / 2},
        //     {x: 200 / 2, y: -200 / 2},
        //     {x: 200 / 2, y: 0},
        //     {x: 0, y: 200 / 2},
        //     {x: -200 / 2, y: 0}
        // ],
    },

    draggable: true
});
polygon.on('collide', info => {
    game.info('Polygon collide with ' + info.entity.id, info)
});