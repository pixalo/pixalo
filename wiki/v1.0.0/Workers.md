The Workers class is a static utility class that manages Web Workers for offscreen canvas rendering. It provides a streamlined interface for registering canvas elements with Web Workers, handling event communication between the main thread and worker threads, and managing worker lifecycle. This class is designed to accelerate complex computations including intensive graphics operations, smooth animations, game physics simulations, mathematical calculations, and other performance-critical tasks by offloading them to separate threads, preventing the main UI thread from being blocked.

## Public Methods

### `register(selector, scriptURL, options): string`

Registers a canvas element with a Web Worker for offscreen rendering and returns a unique worker ID.

| Name | Type | Default |
|------|------|---------|
| selector | string \| HTMLCanvasElement | - |
| scriptURL | string | - |
| options | object | {} |

**Options object properties:**
- `type`: string - Worker type ('module' or 'classic'), defaults to 'module'
- `onmessage`: function - Custom message handler for worker messages
- `onerror`: function - Custom error handler for worker errors

```javascript
// Register with canvas selector
const workerId = Workers.register('#myCanvas', './game.js');

// Register with canvas element and options
const canvas = document.getElementById('myCanvas');
const workerId = Workers.register(canvas, './game.js', {
    type: 'module',
    onmessage: (event) => console.log('Worker message:', event.data),
    onerror: (error) => console.error('Worker error:', error)
});
```

### `send(wid, message): void`

Sends a message to a specific worker identified by its worker ID.

| Name | Type | Default |
|------|------|---------|
| wid | string | - |
| message | object | - |

```javascript
// Send a message to the worker
Workers.send(workerId, {
    action: 'updateScene',
    data: { x: 100, y: 200 }
});
```

### `destroy(wid): void`

Terminates a worker and removes it from the workers registry.

| Name | Type | Default |
|------|------|---------|
| wid | string | - |

```javascript
// Destroy a worker when no longer needed
Workers.destroy(workerId);
```

## Event Handling

The Workers class automatically handles various events from the canvas and forwards them to the worker:

- **Mouse Events**: mousemove, mousedown, mouseup, contextmenu
- **Keyboard Events**: keydown, keyup
- **Touch Events**: touchstart, touchmove, touchend, touchcancel
- **Focus Events**: focus, blur
- **Document Events**: visibilitychange

## Worker Messages

The class handles several internal message types from workers:

- `ready`: Triggered when worker is initialized
- `update_canvas`: Updates canvas styling
- `set_resize_target`: Sets up resize event listeners
- `take_screenshot`: Captures canvas screenshot

## Screenshot Functionality

Workers can request screenshots through the messaging system. The screenshot feature supports:

- Multiple formats (PNG, JPEG, etc.)
- Quality settings
- Background color options
- Automatic download capability
- Blob and data URL generation