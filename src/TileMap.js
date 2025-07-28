/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

class TileMap {

    constructor (engine) {
        this.engine = engine;
        this.layers = new Map();
        this.tiles = new Map();
        this.defaultTileSize = 32;
        this.activeCollisions = new Map();
        this.animatedTiles = new Map(); // Maintaining tile animation information
    }

    create (config) {
        const {layers: layersConfig, tiles: tilesConfig} = config;

        // Processing and saving tiles configuration
        this.tiles.clear();
        for (const [symbol, tileConfig] of Object.entries(tilesConfig)) {
            if (typeof tileConfig === 'string') {
                // Simple mode:
                //   Example ('G': 'tiles.grass')
                this.tiles.set(symbol, {
                    tile: tileConfig,
                    type: 'default'
                });
            } else {
                // Advanced mode with collision
                this.tiles.set(symbol, {
                    ...tileConfig,
                    tile: tileConfig.tile,
                    collision: tileConfig.collision || null
                });
            }
        }

        // Processing and saving layers
        this.layers = this.parseLayers(layersConfig);

        // Starting tile animations
        this._initializeTileAnimations({tiles: this.tiles});

        return {
            layers: this.layers,
            tiles: this.tiles
        };
    }

    /** ======== COLLISIONS ======== */
    _checkCollisions (entity) {
        if (!entity.collision?.enabled) return;

        // Maintain previous position for platform collision
        entity.previousX = entity.absoluteX;
        entity.previousY = entity.absoluteY;

        const tileSize = this.defaultTileSize;
        const padding = tileSize / 2;

        const bounds = {
            left: Math.floor((entity.absoluteX - padding) / tileSize),
            top: Math.floor((entity.absoluteY - padding) / tileSize),
            right: Math.ceil((entity.absoluteX + entity.width + padding) / tileSize),
            bottom: Math.ceil((entity.absoluteY + entity.height + padding) / tileSize)
        };

        const newCollisions = new Map();
        let solidCollision = null; // To maintain collision with solid objects

        // Check the boundary around the entity
        for (let y = bounds.top; y <= bounds.bottom; y++) {
            for (let x = bounds.left; x <= bounds.right; x++) {
                const tilesAtPoint = this.getTilesAt(x * tileSize, y * tileSize);

                for (const tile of tilesAtPoint) {
                    if (!tile.config.collision) continue;

                    const collisionResult = this._checkTileCollision(
                        entity, tile,
                        x * tileSize,
                        y * tileSize
                    );

                    if (collisionResult?.collides) {
                        const collisionKey = `${entity.id}_${x}_${y}_${tile.layer}`;

                        // Apply collision based on type
                        switch (tile.config.collision.type) {
                            case 'solid':
                                // Save solid collision to apply position changes
                                solidCollision = {
                                    ...collisionResult,
                                    tile,
                                    x: x * tileSize,
                                    y: y * tileSize
                                };
                                break;
                            case 'platform':
                                if (collisionResult.side === 'bottom') {
                                    // Apply position on the platform
                                    entity.style({
                                        y: y * tileSize - entity.height / 2
                                    });
                                }
                                break;
                        }

                        // Register a new encounter
                        newCollisions.set(collisionKey, {
                            entity, tile, x, y,
                            layer: tile.layer,
                            time: performance.now(),
                            side: collisionResult.side,
                            amount: collisionResult.amount
                        });

                        // Execute new collision or change direction callback
                        if ((!this.activeCollisions.has(collisionKey) || this.activeCollisions.get(collisionKey).side !== collisionResult.side) &&
                            tile.config.collision.onCollide) {

                            tile.config.collision.onCollide({
                                entity,
                                tile: tile.config,
                                position: {x: x * tileSize, y: y * tileSize},
                                layer: tile.layer,
                                collisionType: tile.config.collision.type,
                                side: collisionResult.side,
                                amount: collisionResult.amount
                            });
                        }
                    }
                }
            }
        }

        // Apply solid collision if present
        if (solidCollision) {
            switch (solidCollision.side) {
                case 'left':
                    entity.move({
                        x: -solidCollision.amount,  // Move to the left by the amount of penetration
                        relative: true
                    });
                    break;
                case 'right':
                    entity.move({
                        x: solidCollision.amount,   // Move to the right by the amount of penetration
                        relative: true
                    });
                    break;
                case 'top':
                    entity.move({
                        y: -solidCollision.amount,  // Move upwards by the amount of penetration
                        relative: true
                    });
                    break;
                case 'bottom':
                    entity.move({
                        y: solidCollision.amount,   // Move downwards by the amount of penetration
                        relative: true
                    });
                    break;
            }
        }

        // Checking the end of encounters
        for (const [key, collision] of this.activeCollisions) {
            if (!newCollisions.has(key)) {
                const tile = collision.tile;
                if (tile.config.collision.onCollisionEnd) {
                    tile.config.collision.onCollisionEnd({
                        entity: collision.entity,
                        tile: tile.config,
                        position: {x: collision.x * tileSize, y: collision.y * tileSize},
                        layer: collision.layer
                    });
                }
            }
        }

        // Update active collision list
        this.activeCollisions = newCollisions;
    }
    _checkTileCollision (entity, tile, tileX, tileY) {
        const bounds = tile.config.collision.bounds || [0, 0, this.defaultTileSize, this.defaultTileSize];

        // Tile range
        const tileRect = {
            x: tileX + bounds[0],
            y: tileY + bounds[1],
            width: bounds[2],
            height: bounds[3]
        };

        // Entity scope
        const entityRect = {
            x: entity.absoluteX,
            y: entity.absoluteY,
            width: entity.width,
            height: entity.height
        };

        // Checking the collision type
        switch (tile.config.collision.type) {
            case 'platform':
                // We'll just check the collision from above.
                const entityBottom = entityRect.y + entityRect.height;
                const entityPreviousBottom = entity.previousY + entityRect.height;
                const tileTop = tileRect.y;

                // If she was already on the platform and now she has hit it
                if (entityPreviousBottom <= tileTop && entityBottom >= tileTop) {
                    return {
                        collides: true,
                        side: 'bottom',
                        amount: entityBottom - tileTop
                    };
                }
                return {collides: false};

            case 'trigger':
                // Only collision detection without preventing movement
                const overlap = this._getOverlap(entityRect, tileRect);
                if (overlap.collides) {
                    return {
                        ...overlap,
                        isTrigger: true // Mark as trigger
                    };
                }
                return {collides: false};

            case 'solid':
            default:
                // Complete collision from all directions
                return this._getOverlap(entityRect, tileRect);
        }
    }
    _getOverlap (rect1, rect2) {
        // General collision review
        const hasCollisionX = rect1.x + rect1.width > rect2.x && rect1.x < rect2.x + rect2.width;
        const hasCollisionY = rect1.y + rect1.height > rect2.y && rect1.y < rect2.y + rect2.height;

        if (!hasCollisionX || !hasCollisionY) {
            return {collides: false};
        }

        // Calculating penetration distances in all four directions
        const overlapLeft = (rect1.x + rect1.width) - rect2.x;
        const overlapRight = (rect2.x + rect2.width) - rect1.x;
        const overlapTop = (rect1.y + rect1.height) - rect2.y;
        const overlapBottom = (rect2.y + rect2.height) - rect1.y;

        // Finding the least influence
        const overlaps = [
            {side: 'left', amount: overlapLeft},
            {side: 'right', amount: overlapRight},
            {side: 'top', amount: overlapTop},
            {side: 'bottom', amount: overlapBottom}
        ];

        // Choosing the least amount of penetration
        const minOverlap = overlaps.reduce((min, current) =>
            current.amount < min.amount ? current : min
        );

        return {
            collides: true,
            side: minOverlap.side,
            amount: minOverlap.amount
        };
    }
    /** ======== END ======== */

    /** ======== UPDATE ======== */
    update () {
        if (!this.engine.collisionEnabled) return;

        // Collision checking for all active entities
        for (const [_, entity] of this.engine.entities) {
            if (entity.collision?.enabled) {
                this._checkCollisions(entity);
            }
        }

        // Tile animation update
        this._updateAnimatedTiles();
    }
    _updateAnimatedTiles () {
        const currentTime = performance.now();

        for (const [key, animData] of this.animatedTiles) {
            if (!animData.frames || animData.frames.length <= 1) continue;

            const frameTime = 1000 / animData.frameRate; // Time per frame in milliseconds

            if (currentTime - animData.lastFrameTime >= frameTime) {
                if (animData.loop) {
                    // Infinity ring
                    animData.currentFrame = (animData.currentFrame + 1) % animData.frames.length;
                } else {
                    // Play once
                    if (animData.currentFrame < animData.frames.length - 1) {
                        animData.currentFrame++;
                    }
                }
                animData.lastFrameTime = currentTime;
            }
        }
    }
    /** ======== END ======== */

    /** ======== RENDER ======== */
    render (tilemap) {
        const ctx = this.engine.ctx;
        const camera = this.engine.camera;
        const tileSize = this.defaultTileSize;

        // Increased overlap to better cover gaps
        const overlap = 1;  // Increase from 1 to 2

        // Rounding the camera position to avoid creating gaps in movement
        const cameraLeft = Math.floor(camera.x);
        const cameraTop = Math.floor(camera.y);
        const cameraWidth = this.engine.baseWidth / camera.zoom;
        const cameraHeight = this.engine.baseHeight / camera.zoom;

        // More accurate calculation of tile boundaries
        const firstTileX = Math.floor(cameraLeft / tileSize) - 1;
        const firstTileY = Math.floor(cameraTop / tileSize) - 1;
        const lastTileX = Math.ceil((cameraLeft + cameraWidth) / tileSize) + 1;
        const lastTileY = Math.ceil((cameraTop + cameraHeight) / tileSize) + 1;

        // Pixel-precise rendering
        ctx.imageSmoothingEnabled = false;

        // Layer-by-layer rendering
        for (const [_, grid] of tilemap.layers) {
            const startY = Math.max(0, firstTileY);
            const endY = Math.min(grid.length, lastTileY);

            for (let y = startY; y < endY; y++) {
                const row = grid[y];
                if (!row) continue;

                const startX = Math.max(0, firstTileX);
                const endX = Math.min(row.length, lastTileX);

                for (let x = startX; x < endX; x++) {
                    const symbol = row[x];
                    if (!symbol) continue;

                    const tileConfig = tilemap.tiles.get(symbol);
                    if (!tileConfig) continue;

                    if (tileConfig.parts) {
                        // Rendering a composite tile with all its components
                        this._renderCompositeTile(ctx, {...tileConfig, symbol}, x, y, tileSize, overlap);
                    } else {
                        // Simple tile rendering
                        this._renderSingleTile(ctx, {...tileConfig, symbol}, x, y, tileSize, overlap);
                    }

                    if (this.engine.debugger?.active && tileConfig.collision) {
                        this._renderTileDebug(ctx, tileConfig, x, y, tileSize);
                    }
                }
            }
        }
    }
    _renderTileDebug (ctx, tileConfig, x, y, tileSize) {
        ctx.save();

        const bounds = tileConfig.collision.bounds || [0, 0, tileSize, tileSize];
        const [offsetX, offsetY, width, height] = bounds;

        // Calculating the actual position of the tile
        const tileX = x * tileSize + offsetX;
        const tileY = y * tileSize + offsetY;

        // Rendering a collision rectangle
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.rect(tileX, tileY, width, height);
        ctx.stroke();
        ctx.fill();

        // Show collision type
        if (tileConfig.collision.type) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(tileConfig.collision.type, tileX + 2, tileY + 12);
        }

        // Rendering corner points
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        const corners = [
            [tileX, tileY],                    // top-left
            [tileX + width, tileY],            // top-right
            [tileX + width, tileY + height],   // bottom-right
            [tileX, tileY + height]            // bottom-left
        ];

        corners.forEach(([cornerX, cornerY]) => {
            ctx.beginPath();
            ctx.arc(cornerX, cornerY, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Center point rendering
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(tileX + width / 2, tileY + height / 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
    _renderCompositeTile (ctx, tileConfig, baseX, baseY, tileSize, overlap) {
        // Original tile rendering
        this._renderSingleTile(ctx, {...tileConfig, symbol: tileConfig.symbol}, baseX, baseY, tileSize, overlap);

        // Render additional components
        for (const part of tileConfig.parts) {
            const offsetX = part.offsetX || 0;
            const offsetY = part.offsetY || 0;
            const x = baseX + offsetX;
            const y = baseY + offsetY;

            this._renderSingleTile(ctx, part.tile, x, y, tileSize, overlap);

            // Debug rendering for each part if it has a collision
            if (this.engine.debugger?.active && part.collision) {
                this._renderTileDebug(ctx, part, x, y, tileSize);
            }
        }
    }
    _renderSingleTile (ctx, tileConfig, x, y, tileSize, overlap) {
        let tileReference = typeof tileConfig === 'string' ? tileConfig : tileConfig.tile;

        // Tile animation review
        if (typeof tileConfig === 'object' && tileConfig.frames && tileConfig.symbol) {
            const currentFrame = this.getCurrentTileFrame(tileConfig.symbol);
            if (currentFrame) {
                tileReference = currentFrame;
            }
        }

        const tileInfo = this.getTileInfo(tileReference);
        if (!tileInfo) return;

        const tileAsset = this.engine.getAsset(tileInfo.assetId);
        if (!tileAsset) return;

        const tileCoords = tileAsset.config.tiles[tileInfo.tileName];
        if (!tileCoords) return;

        const renderX = Math.floor(x * tileSize - overlap);
        const renderY = Math.floor(y * tileSize - overlap);
        const renderSize = tileSize + (overlap * 2);

        ctx.drawImage(
            tileAsset.asset,
            tileCoords.x,
            tileCoords.y,
            tileCoords.width,
            tileCoords.height,
            renderX,
            renderY,
            renderSize,
            renderSize
        );
    }
    /** ======== END ======== */

    /** ======== ANIMATION FRAMES ======== */
    _initializeTileAnimations (tilemap) {
        // Starting animations for tiles that have frames
        for (const [symbol, tileConfig] of tilemap.tiles) {
            if (tileConfig.frames && tileConfig.frames.length > 1) {
                const animKey = `tile_${symbol}`;
                this.animatedTiles.set(animKey, {
                    frames: tileConfig.frames,
                    frameRate: tileConfig.frameRate || 8,
                    loop: tileConfig.loop !== false, // Default true
                    currentFrame: 0,
                    lastFrameTime: performance.now()
                });
            }
        }
    }
    getCurrentTileFrame (symbol) {
        const animKey = `tile_${symbol}`;
        const animData = this.animatedTiles.get(animKey);

        if (animData && animData.frames) {
            return animData.frames[animData.currentFrame];
        }

        return null;
    }
    /** ======== END ======== */

    /** ======== TILES ======== */
    addTile (layer, symbol, x = 0, y = 0) {
        // Convert x and y to integers
        x = Math.floor(Number(x));
        y = Math.floor(Number(y));

        // Checking the correctness of x and y values
        if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
            this.engine.warn(`Invalid coordinates: x=${x}, y=${y}. Coordinates must be non-negative integers.`);
            return false;
        }

        // Checking for the presence of a symbol in the tiles list
        if (!this.tiles.has(symbol)) {
            this.engine.warn(`Symbol '${symbol}' not found in tiles configuration`);
            return false;
        }

        // Checking for the existence of a layer
        if (!this.layers.has(layer)) {
            // Create a new layer if it does not exist.
            this.layers.set(layer, []);
            this.engine.log(`Created new layer: ${layer}`);
        }

        const grid = this.layers.get(layer);

        // Expand the grid if needed.
        // Ensure that row y exists
        while (grid.length <= y) {
            grid.push([]);
        }

        // Ensure that column x exists in row y
        const row = grid[y];
        while (row.length <= x) {
            row.push(undefined);
        }

        // Add tile at specified position
        grid[y][x] = symbol;

        this.engine.info(`Added tile '${symbol}' to layer '${layer}' at position (${x}, ${y})`);
        return this;
    }
    getTileInfo (tileReference) {
        if (typeof tileReference === 'string') {
            const [assetId, tileName] = tileReference.split('.');
            return {assetId, tileName};
        }
        return null;
    }
    getTileSize (tileReference) {
        const tileInfo = this.getTileInfo(tileReference);
        if (!tileInfo) return this.defaultTileSize;

        const asset = this.engine.getAsset(tileInfo.assetId);
        return asset?.config.tileSize || this.defaultTileSize;
    }
    getTilesAt (x, y) {
        // Convert coordinates to tile numbers by rounding down
        const tileX = Math.floor(x / this.defaultTileSize);
        const tileY = Math.floor(y / this.defaultTileSize);
        const tilesAtPoint = [];

        // Checking boundaries to prevent errors
        if (tileX < 0 || tileY < 0) return tilesAtPoint;

        // Collect tiles from all layers
        for (const [layerName, grid] of this.layers) {
            // Checking for the existence of rows and columns
            if (grid[tileY] && typeof grid[tileY][tileX] !== 'undefined') {
                const symbol = grid[tileY][tileX];
                if (symbol) { // Valid symbols only
                    const config = this.tiles.get(symbol);
                    if (config) {
                        tilesAtPoint.push({
                            symbol,
                            config,
                            x: tileX,
                            y: tileY,
                            layer: layerName,
                            worldX: tileX * this.defaultTileSize, // Add real coordinates
                            worldY: tileY * this.defaultTileSize
                        });
                    }
                }
            }
        }

        return tilesAtPoint;
    }
    getTileAt (x, y, layer = null) {
        if (layer) {
            // Convert coordinates to tile numbers
            const tileX = Math.floor(x / this.defaultTileSize);
            const tileY = Math.floor(y / this.defaultTileSize);

            const grid = this.layers.get(layer);

            // Checking the boundaries and existence of tiles
            if (!grid || tileX < 0 || tileY < 0 || !grid[tileY] || typeof grid[tileY][tileX] === 'undefined') {
                return null;
            }

            const symbol = grid[tileY][tileX];
            if (!symbol) return null;

            const config = this.tiles.get(symbol);
            if (!config) return null;

            return {
                symbol,
                config,
                x: tileX,
                y: tileY,
                layer,
                worldX: tileX * this.defaultTileSize,
                worldY: tileY * this.defaultTileSize
            };
        }

        // If the layer is not specified, we check all tiles.
        const tiles = this.getTilesAt(x, y);
        return tiles.length > 0 ? tiles[0] : null;
    }
    /** ======== END ======== */

    /** ======== FILL ======== */
    fillBoxWith (symbol) {
        const canvas = this.engine.canvas;
        const tileSize = this.getTileSize();

        const cols = Math.ceil(canvas.width / tileSize);
        const rows = Math.ceil(canvas.height / tileSize);

        const grid = [];
        for (let y = 0; y < rows; y++) {
            const row = new Array(cols).fill(symbol);
            grid.push(row);
        }

        return grid;
    }
    fillWith (symbol, count) {
        return new Array(count).fill(symbol);
    }
    /** ======== END ======== */

    /** ======== LAYERS MANAGEMENT ======== */
    parseLayers (layersConfig) {
        const layers = new Map();

        for (const [layerName, layerData] of Object.entries(layersConfig)) {
            if (Array.isArray(layerData)) {
                layers.set(layerName, this.normalizeLayer(layerData));
            } else {
                layers.set(layerName, layerData);
            }
        }

        return layers;
    }
    normalizeLayer (layer) {
        return layer.map(row => {
            if (typeof row === 'string') {
                return row.split('').map(char => char === ' ' ? undefined : char);
            }
            return Array.from(row, cell => cell === undefined ? undefined : cell);
        });
    }
    exportLayers (layer = undefined) {
        const exportData = {};

        if (layer !== undefined) {
            if (!this.layers.has(layer)) {
                this.engine.warn(`Layer '${layer}' not found`);
                return JSON.stringify({}, null, 2);
            }

            const grid = this.layers.get(layer);
            const exportGrid = grid.map(row => {
                // Convert undefined to whitespace and other values to strings
                return row.map(cell => cell === undefined ? ' ' : cell).join('');
            });

            exportData[layer] = exportGrid;
        } else {
            // Export all layers
            for (const [layerName, grid] of this.layers) {
                // Convert grid to exportable format
                const exportGrid = grid.map(row => {
                    // Convert undefined to whitespace and other values to strings
                    return row.map(cell => cell === undefined ? ' ' : cell).join('');
                });

                exportData[layerName] = exportGrid;
            }
        }

        return JSON.stringify(exportData, null, 2);
    }
    /** ======== END ======== */


}

export default TileMap;