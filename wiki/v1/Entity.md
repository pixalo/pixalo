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
entity.one(['click', 'hover'], singleUseHandler);
entity.one({
    'animationEnd': onAnimationComplete,
    'collisionStart': onFirstCollision
});
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
entity.trigger(['event1', 'event2'], sharedData);
```

### append(childId, config): Entity

Creates and appends a child entity to this entity, establishing a parent-child relationship. Can accept either a string ID with config or an existing Entity instance.

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

### layer(value): Entity | number

Sets or gets the z-index (layer) of the entity for rendering order control. When called without parameters, returns the current layer value.

| Name  | Type             | Default   |
|-------|------------------|-----------|
| value | number \| string | undefined |

**Usage Example:**
```javascript
entity.layer(10);
entity.layer('above'); // 'above', 'below', 'top', 'bottom', 'reset'
const currentLayer = entity.layer(); // Returns current layer
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

Returns an array of direct child entities that have the specified class.

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

Creates a deep copy of the entity including all its properties, children, event listeners, and animation states.

| Name  | Type   | Default |
|-------|--------|---------|
| newId | string | null    |

**Usage Example:**
```javascript
const clonedEntity = entity.clone('newEntityId');
const autoIdClone = entity.clone(); // Auto-generated ID
```

### updatePosition(): void

Updates the absolute position coordinates of this entity and all its children based on parent positions and camera settings.

**Usage Example:**
```javascript
entity.updatePosition(); // Usually called automatically
```

### transition(properties, options): Entity

Animates entity properties smoothly over time using easing functions. Supports pause/resume functionality.

| Name       | Type             | Default                                       |
|------------|------------------|-----------------------------------------------|
| properties | object \| string | -                                             |
| options    | object           | { duration: 300, easing: 'linear', delay: 0 } |

**Usage Example:**
```javascript
entity.transition({ x: 100, opacity: 0.5 }, {
    duration: 1000,
    easing: 'easeInOut',
    delay: 500,
    onComplete: () => console.log('Done')
});

// Single property transition
entity.transition('rotation', 180, { duration: 500 });
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

Stops a running keyframe animation. If no name is provided, stops all animations.

| Name | Type   | Default   |
|------|--------|-----------|
| name | string | undefined |

**Usage Example:**
```javascript
entity.stopAnimation('blinking');
entity.stopAnimation(); // Stop all animations
```

### style(property, value): Entity | any

Sets or gets visual style properties of the entity. Handles special cases like position, dimensions, and physics updates.

| Name     | Type             | Default   |
|----------|------------------|-----------|
| property | object \| string | -         |
| value    | any              | undefined |

**Usage Example:**
```javascript
entity.style({ 
    backgroundColor: '#ff0000', 
    opacity: 0.8,
    borderRadius: 10 
});
entity.style('width', 100);
const currentOpacity = entity.style('opacity'); // Returns current opacity
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

Sets an image as the background of the entity using an asset ID or asset path with tile notation.

| Name       | Type   | Default |
|------------|--------|---------|
| asset      | string | -       |
| properties | object | {}      |

**Usage Example:**
```javascript
entity.img('heroImage', {
    fit: 'cover',
    position: 'center',
    repeat: false
});

// Using tile notation
entity.img('tileset.grassTile', { fit: 'stretch' });
```

### halt(): Entity

Stops any currently running movement animation and triggers the 'moveStop' event.

**Usage Example:**
```javascript
entity.halt(); // Stops movement immediately
```

### move(options, y, duration): Entity

Moves the entity to a new position with optional animation. Supports physics integration and pause/resume functionality.

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
    easing: 'easeInCubic',
    relative: true,
    duration: 5000,
    onUpdate(eased) {
        console.log('Moving...', eased);
    },
    onComplete() {
        console.log('Movement complete');
    }
});

entity.move(100, 50, 500); // Alternative syntax
```

### jump(force, config): Entity

Performs a jump animation by moving the entity upward with the specified force.

| Name   | Type   | Default |
|--------|--------|---------|
| force  | number | -       |
| config | object | {}      |

**Usage Example:**
```javascript
entity.jump(50, {
    duration: 300,
    easing: 'easeOut',
    onComplete: () => console.log('Jump complete')
});
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

Sets or gets custom data associated with the entity using an internal Map.

| Name  | Type   | Default   |
|-------|--------|-----------|
| key   | string | -         |
| value | any    | undefined |

**Usage Example:**
```javascript
entity.data('health', 100);
entity.data('inventory', { coins: 50, keys: 2 });
const health = entity.data('health'); // Returns 100
```

### unset(key): Entity

Removes custom data associated with the entity.

| Name | Type   | Description        |
|------|--------|--------------------|
| key  | string | The key to remove. |

**Usage Example:**
```javascript
entity.data('health', 100);
entity.unset('health'); // Removes 'health'
const health = entity.data('health'); // Returns undefined
```

### addClass(...names): Entity

Adds one or more class names to the entity. Duplicates are automatically ignored.

| Name  | Type      | Description      |
|-------|-----------|------------------|
| names | ...string | Class(es) to add |

**Usage Example:**
```javascript
entity.addClass('enemy', 'fast', 'boss');
```

### removeClass(...names): Entity

Removes one or more class names from the entity. Non-existent names are silently ignored.

| Name  | Type      | Description         |
|-------|-----------|---------------------|
| names | ...string | Class(es) to remove |

**Usage Example:**
```javascript
entity.removeClass('fast', 'boss');
```

### toggleClass(name): Entity

Toggles the presence of a single class name. If the class exists it is removed; otherwise it is added.

| Name | Type   | Description     |
|------|--------|-----------------|
| name | string | Class to toggle |

**Usage Example:**
```javascript
entity.toggleClass('active');
```

### hasClass(name): boolean

Returns `true` if the entity's class list contains the given class name; otherwise `false`.

| Name | Type   | Default |
|------|--------|---------|
| name | string | —       |

**Usage Example:**
```javascript
if (entity.hasClass('enemy')) {
    entity.addClass('invulnerable');
}
```

### setFixed(x, y): Entity

Sets the entity's position mode to 'fixed' relative to the camera viewport.

| Name | Type   | Default |
|------|--------|---------|
| x    | number | null    |
| y    | number | null    |

**Usage Example:**
```javascript
entity.setFixed(10, 10); // Fixed at top-left corner
entity.setFixed(); // Keep current position but make it fixed
```

### setAbsolute(): Entity

Sets the entity's position mode to 'absolute' relative to the world coordinates.

**Usage Example:**
```javascript
entity.setAbsolute(); // Switch back to world positioning
```

### play(animationName): Entity

Starts playing a sprite animation by name. Triggers animation events and callbacks.

| Name          | Type   | Default   |
|---------------|--------|-----------|
| animationName | string | undefined |

**Usage Example:**
```javascript
entity.play('walkCycle');
entity.play(); // Plays current animation if paused
```

### pause(): Entity

Pauses the currently playing sprite animation without resetting the frame.

**Usage Example:**
```javascript
entity.pause();
```

### resume(): Entity

Resumes a paused sprite animation from the current frame.

**Usage Example:**
```javascript
entity.resume();
```

### stop(): Entity

Stops the sprite animation and resets to the first frame. Triggers 'animationStop' event.

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

Changes the sprite asset used for sprite animations and triggers 'spriteAssetChanged' event.

| Name  | Type   | Default |
|-------|--------|---------|
| asset | string | -       |

**Usage Example:**
```javascript
entity.setSpriteAsset('newSpriteSheet');
```

### addAnimation(name, config): Entity

Adds a new sprite animation configuration to the entity's animation collection.

| Name   | Type   | Default |
|--------|--------|---------|
| name   | string | -       |
| config | object | -       |

**Usage Example:**
```javascript
entity.addAnimation('jump', {
    frames: [0, 1, 2, 1],
    frameRate: 10,
    loop: false,
    onStart: () => console.log('Jump started'),
    onEnd: () => console.log('Jump ended')
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
    walk: { frames: [1, 2, 3, 2], frameRate: 8, loop: true },
    attack: { frames: [4, 5, 6], frameRate: 12, loop: false }
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

Sets the current frame of the sprite animation to a specific frame number within the current animation.

| Name        | Type   | Default |
|-------------|--------|---------|
| frameNumber | number | -       |

**Usage Example:**
```javascript
entity.setFrame(5); // Jump to frame 5 of current animation
```

### getCurrentFrame(): object | null

Returns the current frame data of the active sprite animation including frame index and configuration.

**Usage Example:**
```javascript
const frameData = entity.getCurrentFrame();
if (frameData) {
    console.log('Current frame:', frameData);
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

```markdown
### render(ctx): void

Renders the entity and all its children to the provided canvas context. Handles camera culling, transformations, and various rendering effects.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Usually called by the engine automatically
entity.render(canvasContext);
```

### renderShape(ctx): void

Renders the entity's shape based on the current shape style (rectangle, circle, triangle, star, polygon).

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Called internally during render process
entity.renderShape(ctx);
```

### renderRectangle(ctx): void

Renders a rectangle shape with optional border radius.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Called internally when shape is 'rectangle'
entity.renderRectangle(ctx);
```

### renderCircle(ctx): void

Renders a circular shape using the smaller of width or height as diameter.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Called internally when shape is 'circle'
entity.renderCircle(ctx);
```

### renderTriangle(ctx): void

Renders a triangular shape with apex at top center.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Called internally when shape is 'triangle'
entity.renderTriangle(ctx);
```

### renderPolygon(ctx): void

Renders a polygon using the points array with optional border radius support.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Called internally when shape is 'polygon'
entity.renderPolygon(ctx);
```

### renderStar(ctx): void

Renders a star shape with configurable number of spikes.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Called internally when shape is 'star'
entity.renderStar(ctx);
```

### fillAndStroke(ctx): void

Applies fill and stroke styles to the current path, including gradient support and border styling.

| Name | Type                     | Default |
|------|--------------------------|---------|
| ctx  | CanvasRenderingContext2D | -       |

**Usage Example:**
```javascript
// Called internally after creating a path
entity.fillAndStroke(ctx);
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

Sets custom collision points for precise collision detection using polygonal shapes. Validates points structure and clears collision cache.

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

Removes custom collision points and reverts to rectangular collision detection. Also clears collision cache.

**Usage Example:**
```javascript
entity.clearCollisionPoints();
```

### getBounds(): object

Returns the current bounding box of the entity including transformations like scale and rotation.

**Usage Example:**
```javascript
const bounds = entity.getBounds();
console.log(`Position: ${bounds.x}, ${bounds.y}`);
console.log(`Size: ${bounds.width}x${bounds.height}`);
```

### kill(): boolean

Completely removes the entity from the engine, including physics bodies, collision detection, all children, and references. Triggers 'kill' events and cleans up debugger entries.

**Usage Example:**
```javascript
if (entity.kill()) {
    console.log('Entity successfully removed');
}
```

## Entity Events

The Entity class provides a comprehensive event system that allows you to respond to various interactions and state changes:

### Built-in Events

- **render** - Triggered during the render process after transforms are applied
- **beforeRender** - Triggered before any rendering transformations
- **afterRender** - Triggered after all rendering is complete
- **animationStart** - Triggered when a sprite animation starts
- **animationEnd** - Triggered when a sprite animation ends
- **animationChange** - Triggered when switching between animations
- **animationOnLoop** - Triggered when a looping animation restarts
- **animationPause** - Triggered when an animation is paused
- **animationResume** - Triggered when an animation is resumed
- **animationStop** - Triggered when an animation is stopped
- **frameChange** - Triggered when sprite animation frame changes
- **spriteRender** - Triggered during sprite rendering with detailed frame info
- **spriteAssetChanged** - Triggered when sprite asset is changed
- **moveStop** - Triggered when movement animation stops
- **kill** - Triggered when entity is destroyed

### Interactive Events (requires engine setup)

- **click** - Triggered when entity is clicked (requires `clickable: true`)
- **hover** - Triggered when mouse hovers over entity (requires `hoverable: true`)
- **drag** - Triggered during drag operations (requires `draggable: true`)

## Configuration Options

When creating an Entity, you can pass a comprehensive configuration object with the following properties:

```javascript
const entity = new Entity('myEntity', {
    // ========== ENGINE & CORE ==========
    engine: gameEngine,                    // Reference to the game engine instance
    
    // ========== POSITION & DIMENSIONS ==========
    x: 100,                               // X coordinate (number, default: 0)
    y: 100,                               // Y coordinate (number, default: 0)
    width: 64,                            // Entity width (number, default: 32)
    height: 64,                           // Entity height (number, default: 32)
    
    // ========== CLASSES & DATA ==========
    class: 'enemy boss fast',             // Class names (string, space-separated)
    data: {                               // Custom data object
        health: 100,
        score: 500,
        inventory: ['sword', 'potion']
    },
    
    // ========== VISUAL STYLING - BACKGROUND ==========
    backgroundColor: '#ff0000',           // Background color (string, default: 'transparent')
    fill: '#ff0000',                      // Alternative to backgroundColor (string)
    
    // Background gradient configuration
    backgroundGradient: {                 // Gradient object
        type: 'linear',                   // 'linear' or 'radial'
        stops: [                          // Array of color stops
            { offset: 0, color: '#ff0000' },
            { offset: 0.5, color: '#00ff00' },
            { offset: 1, color: '#0000ff' }
        ],
        // Linear gradient coordinates
        x1: -32, y1: -32,                 // Start point
        x2: 32, y2: 32,                   // End point
        // Radial gradient (alternative)
        centerX: 0, centerY: 0,           // Center point
        radius: 50                        // Radius
    },
    gradient: {/* same as backgroundGradient */}, // Alternative key name
    
    // ========== VISUAL STYLING - BORDERS ==========
    borderColor: '#000000',               // Border color (string)
    borderWidth: 2,                       // Border width (number, default: 0)
    borderStyle: 'solid',                 // Border style: 'solid', 'dashed', 'dotted' (default: 'solid')
    borderRadius: 8,                      // Border radius (number, default: 0)
    
    // ========== VISUAL STYLING - EFFECTS ==========
    opacity: 0.8,                         // Opacity (number, 0-1, default: 1)
    blur: 0,                              // Blur effect (number, default: 0)
    visible: true,                        // Visibility (boolean, default: true)
    blendMode: 'source-over',             // Canvas blend mode (string, default: 'source-over')
    
    // Shadow configuration
    shadowColor: '#000000',               // Shadow color (string)
    shadowBlur: 10,                       // Shadow blur radius (number, default: 0)
    shadowOffsetX: 5,                     // Shadow X offset (number, default: 0)
    shadowOffsetY: 5,                     // Shadow Y offset (number, default: 0)
    
    filter: 'brightness(1.2)',            // CSS filter string
    
    // ========== SHAPE CONFIGURATION ==========
    shape: 'rectangle',                   // Shape type: 'rectangle', 'circle', 'triangle', 'star', 'polygon'
    spikes: 5,                            // Number of spikes for star shape (number, default: 5)
    points: [                             // Points array for polygon shape
        { x: 0, y: -20 },
        { x: 20, y: 10 },
        { x: -20, y: 10 }
    ],
    
    // Custom drawing function
    customPath: function(ctx) {           // Custom path drawing function
        ctx.beginPath();
        // Custom drawing code here
        ctx.closePath();
        this.fillAndStroke(ctx);
    },
    
    // ========== TRANSFORMATIONS ==========
    rotation: 45,                         // Rotation in degrees (number, default: 0)
    scale: 1.5,                           // Uniform scale (number, default: 1)
    scaleX: 1.2,                          // X-axis scale (number, default: 1)
    scaleY: 0.8,                          // Y-axis scale (number, default: 1)
    skewX: 0,                             // X-axis skew (number, default: 0)
    skewY: 0,                             // Y-axis skew (number, default: 0)
    flipX: false,                         // Flip horizontally (boolean, default: false)
    flipY: false,                         // Flip vertically (boolean, default: false)
    
    // ========== TEXT CONFIGURATION ==========
    text: 'Hello World',                  // Text content (string)
    font: '16px Arial',                   // Font specification (string, default: '16px Arial')
    color: '#000000',                     // Text color (string, default: '#000000')
    textAlign: 'center',                  // Text alignment: 'left', 'center', 'right' (default: 'center')
    textBaseline: 'middle',               // Text baseline: 'top', 'middle', 'bottom', etc. (default: 'middle')
    lineHeight: 1.2,                      // Line height multiplier (number, default: 1.2)
    
    // ========== IMAGE/BACKGROUND IMAGE ==========
    image: 'heroSprite',                  // Asset ID for background image (string)
    backgroundImage: 'heroSprite',        // Alternative key name (string)
    backgroundImageFit: 'contain',        // Image fit: 'contain', 'cover', 'stretch' (default: 'contain')
    backgroundImagePosition: 'center',    // Image position: 'center', 'top', 'bottom', 'left', 'right', combinations
    backgroundImageRepeat: false,         // Repeat image as pattern (boolean, default: false)
    
    // Image object configuration (alternative)
    image: {
        asset: 'heroSprite',              // Asset ID or direct image
        src: 'heroSprite',                // Alternative to asset
        fit: 'cover',                     // Fit mode
        position: 'top left',             // Position
        repeat: true                      // Repeat flag
    },
    
    // ========== SPRITE CONFIGURATION ==========
    sprite: {
        asset: 'characterSheet',          // Sprite sheet asset ID (string)
        width: null,                      // Override sprite width (number or null)
        height: null,                     // Override sprite height (number or null)
        x: 0,                             // Sprite X offset (number, default: 0)
        y: 0,                             // Sprite Y offset (number, default: 0)
        
        // Animation configurations
        animations: {
            idle: {
                frames: [0, 1, 2, 1],     // Frame indices array
                frameRate: 4,             // Frames per second
                loop: true,               // Loop animation (boolean)
                onStart (name) {},        // Start callback
                onEnd (name) {},          // End callback
                onLoop (name) {},         // Loop callback
                onFrame (frame) {},       // Frame change callback
                onRender(info) {}         // Render callback
            },
            walk: {
                frames: [3, 4, 5, 6],
                frameRate: 8,
                loop: true
            },
            attack: {
                frames: [7, 8, 9],
                frameRate: 12,
                loop: false
            }
        },
        defaultAnimation: 'idle'         // Auto-start animation name (string)
    },
    
    // ========== INTERACTION FLAGS ==========
    clickable: true,                     // Enable click events (boolean, default: false)
    hoverable: true,                     // Enable hover events (boolean, default: false)
    draggable: false,                    // Enable drag events (boolean, default: false)
    
    // ========== COLLISION CONFIGURATION ==========
    collision: {
        enabled: true,                   // Enable collision detection (boolean)
        group: 'enemies',                // Collision group name (string, default: 'group_${id}')
        width: 60,                       // Collision box width (number, defaults to entity width)
        height: 60,                      // Collision box height (number, defaults to entity height)
        x: 2,                            // Collision box X offset (number, default: 0)
        y: 2,                            // Collision box Y offset (number, default: 0)
        points: [                        // Custom collision polygon points (array)
            { x: 0, y: 0 },
            { x: 32, y: 0 },
            { x: 16, y: 32 }
        ]
    },
    
    // Simplified collision (alternative)
    collision: true,                     // Just enable with defaults (boolean)
    
    // ========== PHYSICS INTEGRATION ==========
    physics: true,                       // Enable physics body (boolean, default: false)
    physics: {                           // Detailed physics configuration (object)
        enabled: true,                   // Enable physics
        type: 'dynamic',                 // Body type: 'static', 'dynamic', 'kinematic'
        density: 1,                      // Body density
        friction: 0.3,                   // Surface friction
        restitution: 0.5,                // Bounciness
        fixedRotation: false             // Prevent rotation
    },
    
    // ========== POSITIONING & LAYERING ==========
    position: 'absolute',               // Position mode: 'absolute', 'fixed' (default: 'absolute')
    layer: 5,                           // Z-index layer (number, default: 0)
    constrainToParent: true,            // Keep within parent bounds (boolean, default: true)
    
    // ========== MASKING & CLIPPING ==========
    mask: maskEntity,                   // Entity to use as mask (Entity instance)
    mask: function(ctx) {               // Custom mask function
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
    },
    
    clip: clipEntity,                   // Entity to use for clipping (Entity instance)
    clip: [                             // Array of points for clipping
        { x: -20, y: -20 },
        { x: 20, y: -20 },
        { x: 0, y: 20 }
    ],
    clip: function(ctx) {               // Custom clip function
        ctx.rect(-15, -15, 30, 30);
    },
    
    // ========== ANIMATION & TRANSITIONS ==========
    transition: {                       // Default transition settings
        duration: 500,                  // Default duration (number)
        easing: 'easeInOut',            // Default easing function (string)
        delay: 0                        // Default delay (number)
    }
});
```

### Additional Configuration Notes:

#### Asset References
```javascript
// Asset ID string
image: 'heroImage',

// Asset with tile notation (for tile sheets)
image: 'tileset.grassTile',

// Direct image object
image: imageElement,

// Complex asset configuration
image: {
    asset: 'spriteSheet',
    src: 'alternative', 
    fit: 'contain',
    position: 'center',
    repeat: false
}
```

#### Color Formats
```javascript
// All supported color formats
backgroundColor: '#ff0000',        // Hex
backgroundColor: '#f00',           // Short hex
backgroundColor: 'rgb(255,0,0)',   // RGB
backgroundColor: 'rgba(255,0,0,0.5)', // RGBA
backgroundColor: 'red',            // Named colors
backgroundColor: 'hsl(0,100%,50%)', // HSL
backgroundColor: 'transparent'     // Transparent
```

#### Event Callbacks in Animations
```javascript
sprite: {
    animations: {
        walk: {
            frames: [0, 1, 2, 3],
            frameRate: 8,
            loop: true,
            onStart: function(animationName) {
                console.log(`Started animation: ${animationName}`);
            },
            onEnd: function(animationName) {
                console.log(`Ended animation: ${animationName}`);
            },
            onLoop: function(animationName) {
                console.log(`Animation looped: ${animationName}`);
            },
            onFrame: function(frameNumber) {
                console.log(`Frame changed to: ${frameNumber}`);
            },
            onRender: function(renderInfo) {
                console.log('Render info:', renderInfo);
            }
        }
    }
}
```