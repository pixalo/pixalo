AudioManager is a comprehensive audio management class designed for web applications that provides advanced audio playback capabilities including spatial audio, instance management, and worker thread support. It utilizes the Web Audio API to deliver high-quality audio experiences with features like 3D positioning, volume control, and batch operations.

## Public Methods

### async load(id, src, config): Promise\<{asset: AudioBuffer, config: Object}\>
*Async method that returns a Promise*

Loads an audio asset from a URL and stores it with the specified ID for later playback.

| name   | type   | default |
|--------|--------|---------|
| id     | string | -       |
| src    | string | -       |
| config | Object | -       |

**Usage Example:**
```javascript
await game.audio.load('bgMusic', '/audio/background.mp3', {
    volume: 0.8,
    loop: true,
    autoplay: false
});
```

### async play(id, options): Promise\<{instanceId: string, assetId: string, source: AudioBufferSourceNode, gainNode: GainNode, spatialNodes: Object}\>
*Async method that returns a Promise*

Plays a loaded audio asset with optional configuration overrides.

| name    | type   | default |
|---------|--------|---------|
| id      | string | -       |
| options | Object | {}      |

**Usage Example:**
```javascript
const playback = await game.audio.play('bgMusic', {
    volume: 0.5,
    loop: false
});
console.log('Playing instance:', playback.instanceId);
```

### pause(id): AudioManager

Pauses an audio instance or the first active instance of an asset.

| name | type   | default |
|------|--------|---------|
| id   | string | -       |

**Usage Example:**
```javascript
game.audio.pause('bgMusic');
// or pause by instance ID
game.audio.pause('instance_123');
```

### resume(id): AudioManager

Resumes a paused audio instance or the first paused instance of an asset.

| name | type   | default |
|------|--------|---------|
| id   | string | -       |

**Usage Example:**
```javascript
game.audio.resume('bgMusic');
```

### stop(id): AudioManager

Stops an audio instance or the first active instance of an asset.

| name | type   | default |
|------|--------|---------|
| id   | string | -       |

**Usage Example:**
```javascript
game.audio.stop('bgMusic');
```

### stopAsset(assetId): AudioManager

Stops all instances of a specific audio asset.

| name    | type   | default |
|---------|--------|---------|
| assetId | string | -       |

**Usage Example:**
```javascript
game.audio.stopAsset('bgMusic');
```

### setVolume(id, volume): AudioManager

Sets the volume for a specific audio instance or asset.

| name   | type   | default |
|--------|--------|---------|
| id     | string | -       |
| volume | number | -       |

**Usage Example:**
```javascript
game.audio.setVolume('bgMusic', 0.3);
```

### setAssetVolume(assetId, volume): AudioManager

Sets the volume for all instances of a specific audio asset.

| name    | type   | default |
|---------|--------|---------|
| assetId | string | -       |
| volume  | number | -       |

**Usage Example:**
```javascript
game.audio.setAssetVolume('bgMusic', 0.7);
```

### setMasterVolume(volume): AudioManager

Sets the master volume that affects all audio instances.

| name   | type   | default |
|--------|--------|---------|
| volume | number | -       |

**Usage Example:**
```javascript
game.audio.setMasterVolume(0.5);
```

### setListenerPosition(x, y, z): AudioManager

Sets the position of the 3D audio listener.

| name | type   | default |
|------|--------|---------|
| x    | number | -       |
| y    | number | -       |
| z    | number | 0       |

**Usage Example:**
```javascript
game.audio.setListenerPosition(10, 5, 0);
```

### setListenerOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ): AudioManager

Sets the orientation of the 3D audio listener.

| name     | type   | default |
|----------|--------|---------|
| forwardX | number | -       |
| forwardY | number | -       |
| forwardZ | number | 0       |
| upX      | number | 0       |
| upY      | number | 1       |
| upZ      | number | 0       |

**Usage Example:**
```javascript
game.audio.setListenerOrientation(0, 0, -1, 0, 1, 0);
```

### setSpatialPosition(id, x, y, z): AudioManager

Sets the 3D position of a spatial audio source.

| name | type   | default |
|------|--------|---------|
| id   | string | -       |
| x    | number | -       |
| y    | number | -       |
| z    | number | 0       |

**Usage Example:**
```javascript
game.audio.setSpatialPosition('spatialSound', 5, 0, -3);
```

### setSpatialOrientation(id, x, y, z): AudioManager

Sets the 3D orientation of a spatial audio source.

| name | type   | default |
|------|--------|---------|
| id   | string | -       |
| x    | number | -       |
| y    | number | -       |
| z    | number | 0       |

**Usage Example:**
```javascript
game.audio.setSpatialOrientation('spatialSound', 1, 0, 0);
```

### async playSpatial(assetId, x, y, z, options): Promise\<{instanceId: string, assetId: string, source: AudioBufferSourceNode, gainNode: GainNode, spatialNodes: Object}\>
*Async method that returns a Promise*

Plays an audio asset with 3D spatial positioning.

| name    | type   | default |
|---------|--------|---------|
| assetId | string | -       |
| x       | number | -       |
| y       | number | -       |
| z       | number | 0       |
| options | Object | {}      |

**Usage Example:**
```javascript
const spatial = await game.audio.playSpatial('footsteps', 10, 0, -5, {
    volume: 0.8,
    loop: true
});
```

### updateSpatial(id, config): AudioManager

Updates spatial audio properties for an audio instance.

| name   | type   | default |
|--------|--------|---------|
| id     | string | -       |
| config | Object | -       |

**Usage Example:**
```javascript
game.audio.updateSpatial('spatialSound', {
    position: {x: 2, y: 1, z: -1},
    orientation: {x: 0, y: 1, z: 0},
    volume: 0.6
});
```

### isPlaying(id): boolean

Checks if an audio instance or asset is currently playing.

| name | type   | default |
|------|--------|---------|
| id   | string | -       |

**Usage Example:**
```javascript
if (game.audio.isPlaying('bgMusic')) {
    console.log('Background music is playing');
}
```

### getAssetInstances(assetId): Array\<Object\>

Returns information about all instances of a specific audio asset.

| name    | type   | default |
|---------|--------|---------|
| assetId | string | -       |

**Usage Example:**
```javascript
const instances = game.audio.getAssetInstances('bgMusic');
instances.forEach(instance => {
    console.log(`Instance ${instance.instanceId}: ${instance.isPlaying ? 'playing' : 'stopped'}`);
});
```

### getDuration(assetId): number

Returns the duration of an audio asset in seconds.

| name    | type   | default |
|---------|--------|---------|
| assetId | string | -       |

**Usage Example:**
```javascript
const duration = game.audio.getDuration('bgMusic');
console.log(`Duration: ${duration} seconds`);
```

### getCurrentTime(id): number

Returns the current playback time of an audio instance or asset.

| name | type   | default |
|------|--------|---------|
| id   | string | -       |

**Usage Example:**
```javascript
const currentTime = game.audio.getCurrentTime('bgMusic');
console.log(`Current time: ${currentTime} seconds`);
```

### getDistance(id): number|null

Returns the distance between a spatial audio source and the listener.

| name | type   | default |
|------|--------|---------|
| id   | string | -       |

**Usage Example:**
```javascript
const distance = game.audio.getDistance('spatialSound');
if (distance !== null) {
    console.log(`Distance: ${distance} units`);
}
```

### muteAll(): AudioManager

Mutes all currently playing audio instances.

**Usage Example:**
```javascript
game.audio.muteAll();
```

### unmuteAll(): AudioManager

Unmutes all audio instances, restoring their original volumes.

**Usage Example:**
```javascript
game.audio.unmuteAll();
```

### pauseAll(): AudioManager

Pauses all currently playing audio instances.

**Usage Example:**
```javascript
game.audio.pauseAll();
```

### resumeAll(): AudioManager

Resumes all paused audio instances.

**Usage Example:**
```javascript
game.audio.resumeAll();
```

### stopAll(): AudioManager

Stops all audio instances and clears the instance registry.

**Usage Example:**
```javascript
game.audio.stopAll();
```

### cleanup(): AudioManager

Performs complete cleanup by stopping all audio, clearing assets, and closing the audio context.

**Usage Example:**
```javascript
game.audio.cleanup();
```