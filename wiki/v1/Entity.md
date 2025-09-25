The Entity class is a core component of the Pixalo game engine that represents visual objects in a 2D canvas-based environment. It provides comprehensive functionality for rendering, animation, collision detection, event handling, and hierarchical object management. Each entity can have various visual properties including shapes, sprites, text, transformations, and effects, making it suitable for creating complex interactive applications and games.

## Public Methods

### on(eventName, callback): Entity

Registers one or more event listeners for the specified event(s). Supports multiple registration patterns including arrays and objects.

| Name      | Type                         | Default |
|-----------|------------------------------|---------|
| eventName | string \| string[] \| object | -       |
| callback  | function                     | -       |

**Usage Example:**
```javascript
entity.on('click', () => console.log('Entity clicked'));
entity.on(['hover', 'click'], handleInteraction);
entity.on({
    'hover': onHover,
    'click': onClick
});
```

### one(eventName, callback): Entity

Registers one-time event listeners that automatically remove themselves after being triggered once.

| Name      | Type                         | Default |
|-----------|------------------------------|---------|
| eventName | string \| string[] \| object | -       |
| callback  | function                     | -       |

**Usage Example:**
```javascript
entity.one('animationEnd', () => console.log('Animation completed once'));
```

### off(eventName, callback): Entity

Removes specific event listeners from the entity.

| Name      | Type               | Default |
|-----------|--------------------|---------|
| eventName | string \| string[] | -       |
| callback  | function           | -       |

**Usage Example:**
```javascript
entity.off('click', clickHandler);
entity.off(['hover', 'click'], multiHandler);
```

### trigger(eventName, ...args): Entity

Triggers all registered listeners for the specified event(s) with optional arguments.

| Name      | Type               | Default |
|-----------|--------------------|---------|
| eventName | string \| string[] | -       |
| ...args   | any                | -       |

**Usage Example:**
```javascript
entity.trigger('customEvent', data1, data2);
entity.trigger(['event1', 'event2']);
```

### append(childId, config): Entity

Creates and appends a child entity to this entity, establishing a parent-child relationship.

| Name    | Type             | Default |
|---------|------------------|---------|
| childId | string \| Entity | -       |
| config  | object           | {}      |

**Usage Example:**
```javascript
const child = entity.append('child1', {
    x: 10, y: 20,
    width: 50, height: 30,
    backgroundColor: '#ff0000'
});
```

### layer(value): Entity

Sets the z-index (layer) of the entity for rendering order control.

| Name  | Type             | Default |
|-------|------------------|---------|
| value | number \| string | -       |

**Usage Example:**
```javascript
entity.layer(10);
entity.layer('above'); // 'above', 'below', 'top', 'bottom', 'reset'
```

### find(childId): Entity | undefined

Finds and returns a direct child entity by its ID.

| Name    | Type   | Default |
|---------|--------|---------|
| childId | string | -       |

**Usage Example:**
```javascript
const child = entity.find('childId');
if (child) {
    child.style({ visible: false });
}
```

### findByClass(className): Entity[]

Returns an array of child entities that have the specified CSS class.

| Name      | Type   | Default |
|-----------|--------|---------|
| className | string | -       |

**Usage Example:**
```javascript
const buttons = entity.findByClass('button');
buttons.forEach(button => button.style({ color: '#blue' }));
```

### getEntities(): Entity[]

Returns an array containing this entity and all its descendants in a flat structure.

**Usage Example:**
```javascript
const allEntities = entity.getEntities();
console.log(`Total entities: ${allEntities.length}`);
```

### clone(newId): Entity

Creates a deep copy of the entity including all its properties, children, and event listeners.

| Name  | Type   | Default |
|-------|--------|---------|
| newId | string | null    |

**Usage Example:**
```javascript
const clonedEntity = entity.clone('newEntityId');
const autoIdClone = entity.clone(); // Auto-generated ID
```

### updatePosition(): void

Updates the absolute position coordinates of this entity and all its children based on parent positions.

**Usage Example:**
```javascript
entity.updatePosition(); // Usually called automatically
```

### transition(properties, options): Entity

Animates entity properties smoothly over time using easing functions.

| Name       | Type             | Default                                       |
|------------|------------------|-----------------------------------------------|
| properties | object \| string | -                                             |
| options    | object           | { duration: 300, easing: 'linear', delay: 0 } |

**Usage Example:**
```javascript
entity.transition({ x: 100, opacity: 0.5 }, {
    duration: 1000,
    easing: 'easeInOut',
    onComplete: () => console.log('Done')
});
```

### startAnimation(name): Entity

Starts playing a predefined keyframe animation by name.

| Name | Type   | Default |
|------|--------|---------|
| name | string | -       |

**Usage Example:**
```javascript
entity.startAnimation('blinking');
```

### stopAnimation(name): Entity

Stops a running animation. If no name is provided, stops all animations.

| Name | Type   | Default   |
|------|--------|-----------|
| name | string | undefined |

**Usage Example:**
```javascript
entity.stopAnimation('blinking');
entity.stopAnimation(); // Stop all animations
```

### style(property, value): Entity

Sets visual style properties of the entity. Accepts object or key-value parameters.

| Name     | Type             | Default   |
|----------|------------------|-----------|
| property | object \| string | -         |
| value    | any              | undefined |

**Usage Example:**
```javascript
entity.style({ backgroundColor: '#ff0000', opacity: 0.8 });
entity.style('borderRadius', 10);
```

### text(text): Entity | string

Sets or gets the text content of the entity.

| Name | Type   | Default   |
|------|--------|-----------|
| text | string | undefined |

**Usage Example:**
```javascript
entity.text('Hello World');
const currentText = entity.text(); // Returns current text
```

### img(asset, properties): Entity

Sets an image as the background of the entity using an asset ID.

| Name       | Type   | Default |
|------------|--------|---------|
| asset      | string | -       |
| properties | object | {}      |

**Usage Example:**
```javascript
entity.img('heroImage', {
    fit: 'cover',
    position: 'center'
});
```

### move(options, y, duration): Entity

Moves the entity to a new position with optional animation.

| Name     | Type             | Default |
|----------|------------------|---------|
| options  | object \| number | -       |
| y        | number           | 0       |
| duration | number           | 0       |

**Usage Example:**
```javascript
entity.move({
    x: 100,
    y: 100,
    easing: game.Ease.easeInCubic, // Default: 'linear'
    relative: true,
    duration: 5000,
    onUpdate (eased) {
        console.log('moveAnimation updating', eased);
    },
    onComplete () {
        console.log('moveAnimation complete');
    }
});
entity.move(100, 50, 500); // Alternative syntax
```

### hide(): Entity

Makes the entity invisible by setting visibility to false.

**Usage Example:**
```javascript
entity.hide();
```

### show(): Entity

Makes the entity visible by setting visibility to true.

**Usage Example:**
```javascript
entity.show();
```

### data(key, value): Entity | any

Sets or gets custom data associated with the entity.

| Name  | Type   | Default   |
|-------|--------|-----------|
| key   | string | -         |
| value | any    | undefined |

**Usage Example:**
```javascript
entity.data('health', 100);
const health = entity.data('health'); // Returns 100
```

### unset(key): Entity

Removes custom data associated with the entity.

| Name | Type   | Description          |
|------|--------|----------------------|
| key  | string | The key to remove.   |

**Usage Example:**
```javascript
entity.data('health', 100);
entity.unset('health'); // Removes 'health'
const health = entity.data('health'); // Returns undefined
```

### halt(): Entity

Stops any currently running movement animation.

**Usage Example:**
```javascript
entity.halt(); // Stops movement immediately
```

### addClass(...names): Entity

Adds one or more class names to the entity.  
Duplicates are automatically ignored.

| Name  | Type      | Description      |
|-------|-----------|------------------|
| names | ...string | Class(es) to add |

**Usage Example:**
```javascript
entity.addClass('enemy', 'fast', 'boss');
```

---

### removeClass(...names): Entity

Removes one or more class names from the entity.  
Non-existent names are silently ignored.

| Name  | Type      | Description         |
|-------|-----------|---------------------|
| names | ...string | Class(es) to remove |

**Usage Example:**
```javascript
entity.removeClass('fast', 'boss');
```

---

### toggleClass(name): Entity

Toggles the presence of a single class name.  
If the class exists it is removed; otherwise it is added.

| Name | Type   | Description     |
|------|--------|-----------------|
| name | string | Class to toggle |

**Usage Example:**
```javascript
entity.toggleClass('active');
```

### hasClass(name): boolean
Returns `true` if the entity’s class list contains the given class name; otherwise `false`.

| Name | Type   | Default |
|------|--------|---------|
| name | string | —       |

**Usage Example:**
```javascript
if (entity.hasClass('enemy')) {
    entity.addClass('invulnerable');
}
```

### play(animationName): Entity

Starts playing a sprite animation by name.

| Name          | Type   | Default   |
|---------------|--------|-----------|
| animationName | string | undefined |

**Usage Example:**
```javascript
entity.play('walkCycle');
entity.play(); // Plays current animation
```

### pause(): Entity

Pauses the currently playing sprite animation.

**Usage Example:**
```javascript
entity.pause();
```

### resume(): Entity

Resumes a paused sprite animation from where it left off.

**Usage Example:**
```javascript
entity.resume();
```

### stop(): Entity

Stops the sprite animation and resets to the first frame.

**Usage Example:**
```javascript
entity.stop();
```

### isPlaying(): boolean

Returns whether a sprite animation is currently playing.

**Usage Example:**
```javascript
if (entity.isPlaying()) {
    console.log('Animation is running');
}
```

### setSpriteAsset(asset): Entity

Changes the sprite asset used for sprite animations.

| Name  | Type   | Default |
|-------|--------|---------|
| asset | string | -       |

**Usage Example:**
```javascript
entity.setSpriteAsset('newSpriteSheet');
```

### addAnimation(name, config): Entity

Adds a new sprite animation configuration to the entity.

| Name   | Type   | Default |
|--------|--------|---------|
| name   | string | -       |
| config | object | -       |

**Usage Example:**
```javascript
entity.addAnimation('jump', {
    frames: [0, 1, 2, 1],
    frameRate: 10,
    loop: false
});
```

### setAnimations(animations): Entity

Replaces all sprite animations with a new animation configuration object.

| Name       | Type   | Default |
|------------|--------|---------|
| animations | object | -       |

**Usage Example:**
```javascript
entity.setAnimations({
    idle: { frames: [0], frameRate: 1, loop: true },
    walk: { frames: [1, 2, 3, 2], frameRate: 8, loop: true }
});
```

### getCurrentAnimation(): string | null

Returns the name of the currently playing sprite animation.

**Usage Example:**
```javascript
const currentAnim = entity.getCurrentAnimation();
console.log(`Playing: ${currentAnim}`);
```

### setFrame(frameNumber): Entity

Sets the current frame of the sprite animation to a specific frame number.

| Name        | Type   | Default |
|-------------|--------|---------|
| frameNumber | number | -       |

**Usage Example:**
```javascript
entity.setFrame(5); // Jump to frame 5
```

### getCurrentFrame(): object | null

Returns the current frame data of the active sprite animation.

**Usage Example:**
```javascript
const frameData = entity.getCurrentFrame();
if (frameData) {
    console.log('Current frame index:', frameData.index);
}
```

### setFrameRate(animationName, newFrameRate): Entity

Changes the frame rate of a specific sprite animation.

| Name          | Type   | Default |
|---------------|--------|---------|
| animationName | string | -       |
| newFrameRate  | number | -       |

**Usage Example:**
```javascript
entity.setFrameRate('walkCycle', 12); // 12 FPS
```

### render(ctx): void

Renders the entity and all its children to the provided canvas context.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Usually called by the engine automatically
entity.render(canvasContext);
```

### isHoverable(): boolean

Returns whether the entity can receive hover events.

**Usage Example:**
```javascript
if (entity.isHoverable()) {
    entity.on('hover', handleHover);
}
```

### isDraggable(): boolean

Returns whether the entity can be dragged.

**Usage Example:**
```javascript
if (entity.isDraggable()) {
    console.log('Entity can be dragged');
}
```

### isClickable(): boolean

Returns whether the entity can receive click events.

**Usage Example:**
```javascript
if (entity.isClickable()) {
    entity.on('click', handleClick);
}
```

### isCollidable(): boolean

Returns whether the entity participates in collision detection.

**Usage Example:**
```javascript
if (entity.isCollidable()) {
    console.log('Entity has collision enabled');
}
```

### enableCollision(): Entity

Enables collision detection for this entity.

**Usage Example:**
```javascript
entity.enableCollision();
```

### disableCollision(): Entity

Disables collision detection for this entity.

**Usage Example:**
```javascript
entity.disableCollision();
```

### setCollisionGroup(group): Entity

Sets the collision group for this entity, used for selective collision detection.

| Name  | Type   | Default |
|-------|--------|---------|
| group | string | -       |

**Usage Example:**
```javascript
entity.setCollisionGroup('enemies');
```

### setCollisionPoints(points): Entity

Sets custom collision points for precise collision detection using polygonal shapes.

| Name   | Type  | Default |
|--------|-------|---------|
| points | array | -       |

**Usage Example:**
```javascript
entity.setCollisionPoints([
    { x: 0, y: 0 },
    { x: 32, y: 0 },
    { x: 16, y: 32 }
]);
```

### clearCollisionPoints(): Entity

Removes custom collision points and reverts to rectangular collision detection.

**Usage Example:**
```javascript
entity.clearCollisionPoints();
```

### getBounds(): object

Returns the current bounding box of the entity including position, width, and height.

**Usage Example:**
```javascript
const bounds = entity.getBounds();
console.log(`Position: ${bounds.x}, ${bounds.y}`);
console.log(`Size: ${bounds.width}x${bounds.height}`);
```

### kill(): boolean

Completely removes the entity from the engine, including all children and references.

**Usage Example:**
```javascript
if (entity.kill()) {
    console.log('Entity successfully removed');
}
```