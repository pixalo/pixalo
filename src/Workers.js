/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */
import Pixalo       from './Pixalo.js';
import AudioManager from './AudioManager.js';

class Workers {

    static workers = new Map();

    static async register (selector, script, options = {}) {
        let canvas = this.#handleSelector(selector, options?.appendTo || null);
        const wid = `worker_${Math.floor(Math.random() * 99999)}`;
        const offscreen = canvas.transferControlToOffscreen();
        let blobUrl = null;

        if (options.fetch) {
            try {
                blobUrl = await this.#fetchScript(
                    script, typeof options.fetch === 'object' ? options.fetch : {}
                );
            } catch (error) {
                options.onerror?.({code: 0, text: 'Fetch worker failed', error: error});
                throw error;
            }
        } else {
            script = Pixalo.scriptToUrl(script);
        }

        const worker = new Worker(blobUrl || script, {type: options.type || 'module'});
        worker.postMessage({
            wid: wid,
            canvas: offscreen,
            window: this.#getWindow()
        }, [offscreen]);

        worker.onmessage = event => {
            if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
            Workers.#handleMessage(event);
            options?.onmessage?.(event);
        };
        worker.onerror   = error => {
            if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
            Workers.#handleError(error);
            options?.onerror?.(error);
        };

        const audio = new AudioManager(wid);
        audio.worker = worker;

        Workers.workers.set(wid, {canvas, offscreen, worker, audio});

        return wid;
    }
    static #getWindow () {
        return {
            innerWidth : window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth : window.outerWidth,
            outerHeight: window.outerHeight,
            devicePixelRatio: window.devicePixelRatio
        };
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

    static #handleSelector (selector, appendTo) {
        let canvas = Pixalo._handleCanvasSelector(selector, appendTo);

        canvas.tabIndex = 0;
        canvas.style.outline = 'none';

        return canvas;
    }

    static async #fetchScript (scriptURL, options = {}) {
        const res = await fetch(scriptURL, options);
        if (!res.ok) throw new Error(`fetch failed ${res.status}`);
        const blob = await res.blob();
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
                let target = data.target;

                if (target === 'window' || target === 'document') {
                    window.addEventListener('resize', () => {
                        const result = {
                            action: 'resizedTarget'
                        };

                        if (target === 'window') {
                            result.window = this.#getWindow();
                        } else if (target === 'document') {
                            result.width  = document.documentElement.clientWidth;
                            result.height = document.documentElement.clientHeight;
                        }

                        this.send(data.wid, result);
                    });
                } else {
                    if (typeof target === 'string')
                        target = document.querySelector(target);

                    if (!target instanceof HTMLElement || typeof document === 'undefined' || typeof ResizeObserver === 'undefined')
                        return;

                    new ResizeObserver(() => this.send(data.wid, {
                        action: 'resizedTarget',
                        width : target.offsetWidth,
                        height: target.offsetHeight
                    })).observe(target);
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
            const base = {
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

            if (type === 'wheel') {
                base.deltaX = event.deltaX;
                base.deltaY = event.deltaY;
                base.deltaZ = event.deltaZ;
                base.deltaMode = event.deltaMode;
            }

            return base;
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

        // Wheel Event
        worker.canvas.addEventListener('wheel', event => {
            event.preventDefault();
            this.send(wid, {
                action: 'canvas_event',
                event: extractEventData(event, 'wheel')
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
                action: 'visibilitychange',
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