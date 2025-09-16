import Pixalo from "../../src/Pixalo.js";

const game = new Pixalo('#canvas', {
    width: window.innerWidth,
    height: window.innerHeight,
    fps: 60
});
game.start();

// Wait for multiple asset loads
const results = await game.wait(
    game.delay(1000),
    game.loadAsset('image', 'player', 'player.png'),
    game.loadAsset('audio', 'bgm', 'music.mp3'),
);

const promise1 = game.loadAsset('image', 'background', 'bg.jpg');
const promise2 = new Promise((resolve) => {
    game.timeout(() => {
        console.log('Animation setup complete');
        resolve('animation-ready');
    }, 500);
});
const promise3 = game.loadAsset('audio', 'jumpSound', 'jump.wav');
const promise4 = fetch('/api/player-stats')
    .then(response => response.json())
    .then(data => {
        console.log('Player stats loaded:', data);
        return data;
    });

// Wait for nested arrays of promises
const results2 = await game.wait([
    promise1,
    [promise2, promise3],
    promise4
]);

console.log('All promises resolved:', results2);