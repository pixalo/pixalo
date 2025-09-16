/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */
import Pixalo from "./Pixalo.js";
import AudioManager from "./AudioManager.js";

class Workers {

    static workers = new Map();

    static register (selector, script, options = {}) {
        let canvas;

        if (typeof selector === 'string') {
            canvas = document.querySelector(selector);
        } else if (selector instanceof HTMLCanvasElement) {
            canvas = selector;
        } else {
            throw new Error('Invalid selector');
        }

        canvas.tabIndex = 0;
        canvas.style.outline = 'none';

        const wid = `worker_${Math.floor(Math.random() * 99999)}`;
        const offscreen = canvas.transferControlToOffscreen();

        script = Workers.scriptToUrl(script);

        const worker = new Worker(script, {type: options.type || 'module'});
        worker.postMessage({
            wid: wid, canvas: offscreen,
            window: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            }
        }, [offscreen]);

        worker.onmessage = event => {
            Workers.#handleMessage(event);
            options?.onmessage?.(event);
        };
        worker.onerror   = error => {
            Workers.#handleError(error);
            options?.onerror?.(error);
        };

        const audio = new AudioManager(wid);
        audio.worker = worker;

        Workers.workers.set(wid, {canvas, offscreen, worker, audio});

        return wid;
    }

    static send (wid, message) {
        if (this.workers.has(wid)) {
            const workerData = this.workers.get(wid);
            workerData.worker.postMessage({wid, ...message});
        }
    }

    static destroy (wid) {
        if (this.workers.has(wid)) {
            const workerData = this.workers.get(wid);
            workerData.audio.cleanup();
            workerData.worker.terminate();
            this.workers.delete(wid);
        }
    }

    static scriptToUrl (script) {
        try {
            new URL(script);
            return script;
        } catch { /* not a full url */ }

        const isFn = v => typeof v === 'function';

        /** Function */
        if (isFn(script))
            script = `${script.toString()}()`;

        /** Path */
        else if (/^(?:\.\/|\.\.\/|\/|[^/]*\.[a-zA-Z0-9]{1,5}$)/.test(script) && !/\s/.test(script))
            return script;

        /** Function Name */
        else if (/^[a-zA-Z_$][\w$]*$/.test(String(script).trim())) {
            const fnName = String(script).trim();
            const fn = globalThis[fnName];
            if (isFn(fn))
                script = `(${fn.toString()})();`; // IIFE
        }

        /** Script */
        else if (/[(){}\[\];=>]/.test(script) || /\b(function|=>|var|let|const|if|for|while|return)\b/.test(script)) {/** Nothing */}

        else throw new Error(`${script} is not valid`);

        const blob = new Blob([script], {type: 'application/javascript'});
        return URL.createObjectURL(blob);
    }

    static #handleMessage (event) {
        const data = event.data;

        if (!this.workers.has(data.wid))
            return;

        const worker_data = this.workers.get(data.wid);

        switch (data.action) {
            case 'ready': {
                worker_data.ready = true;
                this.#setup(data.wid);
                break;
            }
            case 'update_canvas': {
                Object.assign(worker_data.canvas.style, data.props.style);
                break;
            }
            case 'set_resize_target': {
                const target = data.target;
                if (target === 'window') {
                    window.addEventListener('resize', () => {
                        this.send(data.wid, {
                            action: 'resizedTarget',
                            width: window.innerWidth,
                            height: window.innerHeight,
                        })
                    });
                } else if (target === 'document') {
                    document.addEventListener('resize', () => this.send(data.wid, {
                        action: 'resizedTarget',
                        width : document.innerWidth,
                        height: document.innerHeight,
                    }));
                } else {
                    // It's a selector string
                    const element = document.querySelector(target);
                    if (element && ResizeObserver) {
                        new ResizeObserver(() => this.send(data.wid, {
                            action: 'resizedTarget',
                            width : element.offsetWidth,
                            height: element.offsetHeight,
                        })).observe(element);
                    }
                }
                break;
            }
            case 'take_screenshot':
                this.#takeScreenshot(data.wid, data);
                break;
        }

        worker_data.audio._handleWorker(event);
    }

    static #handleError (error) {}

    static #setup (worker) {
        Workers.#setupEventListeners(worker);
    }

    static #setupEventListeners (wid) {
        const worker = this.workers.get(wid);

        // Helper function to extract serializable event data
        const extractEventData = (event, type) => {
            const rect = worker.canvas.getBoundingClientRect();
            return {
                type,
                clientX: event.clientX,
                clientY: event.clientY,
                offsetX: event.offsetX,
                offsetY: event.offsetY,
                canvasRect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                },
                relativeX: event.clientX - rect.left,
                relativeY: event.clientY - rect.top,
                button: event.button,
                buttons: event.buttons,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
                timeStamp: event.timeStamp
            };
        };
        const extractKeyEventData = (event, type) => ({
            type,
            key: event.key,
            code: event.code,
            keyCode: event.keyCode,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            repeat: event.repeat,
            timeStamp: event.timeStamp
        });
        const extractTouchEventData = (event, type) => ({
            type,
            touches: Array.from(event.touches).map(touch => ({
                identifier: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pageX: touch.pageX,
                pageY: touch.pageY,
                screenX: touch.screenX,
                screenY: touch.screenY
            })),
            changedTouches: Array.from(event.changedTouches).map(touch => ({
                identifier: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pageX: touch.pageX,
                pageY: touch.pageY,
                screenX: touch.screenX,
                screenY: touch.screenY
            })),
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            timeStamp: event.timeStamp
        });
        const sendCanvasRect = () => {
            const rect = worker.canvas.getBoundingClientRect();
            this.send(wid, {
                action: 'boundingClientRect',
                rect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    right: rect.right,
                    bottom: rect.bottom
                }
            });
        };

        // Canvas
        sendCanvasRect();
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target === worker.canvas)
                    sendCanvasRect();
            }
        });
        resizeObserver.observe(worker.canvas);
        worker.resizeObserver = resizeObserver;

        // Mouse Events
        worker.canvas.addEventListener('contextmenu', event => {
            event.preventDefault();
            this.send(wid, {
                action: 'canvas_event',
                event: extractEventData(event, 'contextmenu')
            });
        });
        worker.canvas.addEventListener('mousemove', event => {
            this.send(wid, {
                action: 'canvas_event',
                event: extractEventData(event, 'mousemove')
            });
        });
        worker.canvas.addEventListener('mousedown', event => {
            this.send(wid, {
                action: 'canvas_event',
                event: extractEventData(event, 'mousedown')
            });
        });
        worker.canvas.addEventListener('mouseup', event => {
            this.send(wid, {
                action: 'canvas_event',
                event: extractEventData(event, 'mouseup')
            });
        });

        // Keyboard Events
        worker.canvas.addEventListener('keydown', event => {
            event.preventDefault();
            this.send(wid, {
                action: 'canvas_event',
                event: extractKeyEventData(event, 'keydown')
            });
        });
        worker.canvas.addEventListener('keyup', event => {
            event.preventDefault();
            this.send(wid, {
                action: 'canvas_event',
                event: extractKeyEventData(event, 'keyup')
            });
        });

        // Touch Events
        worker.canvas.addEventListener('touchstart', event => {
            event.preventDefault();
            this.send(wid, {
                action: 'canvas_event',
                event: extractTouchEventData(event, 'touchstart')
            });
        });
        worker.canvas.addEventListener('touchmove', event => {
            event.preventDefault();
            this.send(wid, {
                action: 'canvas_event',
                event: extractTouchEventData(event, 'touchmove')
            });
        });
        worker.canvas.addEventListener('touchend', event => {
            event.preventDefault();
            this.send(wid, {
                action: 'canvas_event',
                event: extractTouchEventData(event, 'touchend')
            });
        });
        worker.canvas.addEventListener('touchcancel', event => {
            this.send(wid, {
                action: 'canvas_event',
                event: extractTouchEventData(event, 'touchcancel')
            });
        });

        // Click Event
        worker.canvas.addEventListener('pointerdown', event => {
            this.send(wid, {
                action: 'canvas_event',
                event: extractEventData(event, 'click')
            });
        });

        // Document Events
        document.addEventListener('visibilitychange', () => {
            this.send(wid, {
                action: 'visibility_change',
                hidden: document.hidden
            });
        });

        // Focus Events
        worker.canvas.addEventListener('focus', () => {
            this.send(wid, {
                action: 'canvas_event',
                event: { type: 'focus' }
            });
        });
        worker.canvas.addEventListener('blur', () => {
            this.send(wid, {
                action: 'canvas_event',
                event: { type: 'blur' }
            });
        });
    }

    static #takeScreenshot (wid, options) {
        const {
            format = 'png',
            quality = 1.0,
            backgroundColor = 'transparent',
            download = false,
            filename = `pixalo-screenshot-${Date.now()}`
        } = options;
        const worker = this.workers.get(wid);

        // Create a temporary canvas to handle the screenshot
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Set the dimensions to match the original canvas
        tempCanvas.width = worker.canvas.width;
        tempCanvas.height = worker.canvas.height;

        // Fill background if specified
        if (backgroundColor) {
            tempCtx.fillStyle = backgroundColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Draw the current canvas content
        tempCtx.drawImage(worker.canvas, 0, 0);

        // Convert to data URL
        const mimeType = `image/${format.toLowerCase()}`;
        const dataURL = tempCanvas.toDataURL(mimeType, quality);

        // Convert to Blob
        const blob = Pixalo.dataURLToBlob(dataURL);

        // Create Blob URL
        const blobURL = URL.createObjectURL(blob);

        // Handle download if requested
        if (download) {
            const link = document.createElement('a');
            link.download = `${filename}.${format.toLowerCase()}`;
            link.href = dataURL;
            link.click();
        }

        // Cleanup
        tempCanvas.remove();

        this.send(wid, {
            action: 'screenshot_taken',
            details: {
                dataURL, blob, blobURL,
                width: tempCanvas.width,
                height: tempCanvas.height
            }
        });
    }

}

export default Workers;