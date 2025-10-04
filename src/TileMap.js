/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */
import Collision from './Collision.js';
import Entity from './Entity.js';

class TileMap {

    constructor (engine) {
        this.engine = engine;
        this.running = false;

        this.maps = new Map();
        this.activeMap = null;

        this.animatedTiles = new Map();
        this.activeCollisions = new Map();

        this._bindInputEvents();
        this._bindPhysicsEvents();
    }

    create (name, config = {}) {
        if (typeof name !== 'string')
            throw new Error('name must be a non-empty string');

        if (typeof config !== 'object')
            throw new Error('config must be a plain object');

        if (typeof config.tiles !== 'object')
            throw new Error('config.tiles is required and must be a plain object');

        if (typeof config.layers !== 'object')
            throw new Error('config.layers is required and must be a plain object');

        const {layers: layersConfig, tiles: tilesConfig, overlap} = config;
        const tileBaseSize = Number(config.tileBaseSize) || 32;

        const tiles = new Map();
        for (const [symbol, tileConfig] of Object.entries(tilesConfig)) {
            const normalized = (typeof tileConfig === 'string')
                ? {tile: tileConfig}
                : tileConfig;

            tiles.set(symbol, {
                ...normalized,
                tile: normalized.tile ?? tileConfig,
                collision: normalized.collision ?? null
            });
        }

        this.maps.set(name, {
            layers: new Map(),
            tiles,
            tileBaseSize,
            overlap
        });

        this.maps.get(name).layers = this.parseLayersWithWorldCoords(layersConfig, name);

        return this;
    }

    update () {
        if (!this.running || !this.activeMap) return;

        this._updateAnimatedTiles();

        if (this.engine.collisionEnabled && !this.engine.physicsEnabled) {
            // Collision checking for all active entities
            for (const [_, entity] of this.engine.entities) {
                if (entity.collision?.enabled) {
                    this._checkCollisions(entity);
                }
            }
        }
    }

    /** ======== RENDERING ======== */
    render (tileMap) {
        if (!this.maps.has(tileMap))
            throw new Error(`TileMap(${tileMap}) not found`);

        this.clear();

        this.running = true;
        this.activeMap = tileMap;

        this._initializeTileAnimations();
        
        // Add physics entities for tiles with collision
        if (this.engine.physicsEnabled) {
            this._addTilePhysicsEntities();
        }

        // Add tiles to debugger
        this._addTilesToDebugger();
    }
    _renderMap () {
        if (!this.running || !this.activeMap) return;

        const ctx = this.engine.ctx;
        const camera = this.engine.camera;
        const tileSize = this.getTileBaseSize();
        const activeMap = this.maps.get(this.activeMap);

        const overlap = activeMap.overlap ?? 1;
        const cameraLeft = Math.floor(camera.x);
        const cameraTop = Math.floor(camera.y);
        const cameraWidth = this.engine.baseWidth / camera.zoom;
        const cameraHeight = this.engine.baseHeight / camera.zoom;

        const firstTileX = Math.floor(cameraLeft / tileSize) - 1;
        const firstTileY = Math.floor(cameraTop / tileSize) - 1;
        const lastTileX = Math.ceil((cameraLeft + cameraWidth) / tileSize) + 1;
        const lastTileY = Math.ceil((cameraTop + cameraHeight) / tileSize) + 1;

        ctx.imageSmoothingEnabled = false;

        for (const [layerName, grid] of activeMap.layers) {
            const startY = Math.max(0, firstTileY);
            const endY = Math.min(grid.length, lastTileY);

            for (let y = startY; y < endY; y++) {
                const row = grid[y];
                if (!row) continue;
                const startX = Math.max(0, firstTileX);
                const endX = Math.min(row.length, lastTileX);

                for (let x = startX; x < endX; x++) {
                    const tileData = row[x];
                    if (!tileData) continue;

                    const tileConfig = activeMap.tiles.get(tileData.symbol);
                    if (!tileConfig) continue;

                    if (tileConfig.parts) {
                        this._renderCompositeTile(ctx, {
                            ...tileConfig,
                            symbol: tileData.symbol
                        }, tileData.tileX, tileData.tileY, tileSize, overlap, layerName);
                    } else {
                        this._renderSingleTile(ctx, {
                            ...tileConfig,
                            symbol: tileData.symbol
                        }, tileData.tileX, tileData.tileY, tileSize, overlap, layerName);
                    }

                    if (this.engine.debugger?.active) {
                        this._renderTileDebug(ctx, tileConfig, x, y, tileSize);
                    }
                }
            }
        }
    }
    _renderTileDebug (ctx, tileConfig, x, y, tileSize) {
        ctx.save();

        const collision = tileConfig.collision ?? {};
        const bounds = collision?.bounds || [0, 0, tileSize, tileSize];
        const [offsetX, offsetY, width, height] = bounds;

        const tileX = x * tileSize + offsetX;
        const tileY = y * tileSize + offsetY;

        // Text styling
        const fontSize = Math.max(6, 8 / this.engine.camera.zoom);
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const padding = 2;
        let textY = tileY + padding;

        // Collision type
        if (collision.type) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.lineWidth = 0.5;

            const typeText = collision.type;
            ctx.strokeText(typeText, tileX + padding, textY);
            ctx.fillText(typeText, tileX + padding, textY);
            textY += fontSize + 1;
        }

        // Tile coordinates
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';

        const coordText = `${x},${y}`;
        ctx.strokeText(coordText, tileX + padding, textY);
        ctx.fillText(coordText, tileX + padding, textY);

        ctx.restore();
    }
    _renderCompositeTile (ctx, tileConfig, baseX, baseY, tileSize, overlap, layerName) {
        this._renderSingleTile(ctx, {...tileConfig, symbol: tileConfig.symbol}, baseX, baseY, tileSize, overlap, layerName);

        for (const part of tileConfig.parts) {
            const offsetX = part.offsetX || 0;
            const offsetY = part.offsetY || 0;
            const x = baseX + offsetX;
            const y = baseY + offsetY;

            this._renderSingleTile(ctx, part.tile, x, y, tileSize, overlap, layerName);

            if (this.engine.debugger?.active) {
                this._renderTileDebug(ctx, part, x, y, tileSize);
            }
        }
    }
    _renderSingleTile (ctx, tileConfig, x, y, tileSize, overlap, layerName) {
        let tileReference = typeof tileConfig === 'string' ? tileConfig : tileConfig.tile;

        if (typeof tileConfig === 'object' && tileConfig.frames && tileConfig.symbol) {
            // Try to get specific tile frame first
            const specificFrame = layerName ? this.getCurrentTileFrame(tileConfig.symbol, x, y, layerName) : null;
            // Fallback to global frame
            const globalFrame = this.getCurrentTileFrame(tileConfig.symbol);
            const currentFrame = specificFrame || globalFrame;
            if (currentFrame) tileReference = currentFrame;
        }

        const tileInfo = this.getAssetTileInfo(tileReference);
        if (!tileInfo) return;

        const tileAsset = this.engine.getAsset(tileInfo.assetId);
        if (!tileAsset) return;

        const tileCoords = tileAsset.config.tiles[tileInfo.tileName];
        if (!tileCoords) return;

        const renderX = Math.floor(x * tileSize - overlap);
        const renderY = Math.floor(y * tileSize - overlap);
        const renderSize = tileSize + (overlap * 2);

        ctx.save();
        ctx.translate(renderX + renderSize / 2, renderY + renderSize / 2);

        ctx.rotate((tileConfig.rotation || 0) * Math.PI / 180);
        ctx.scale(
            (tileConfig.scaleX ?? tileConfig.scale ?? 1),
            (tileConfig.scaleY ?? tileConfig.scale ?? 1)
        );
        ctx.transform(1, Math.tan((tileConfig.skewY || 0) * Math.PI / 180),
            Math.tan((tileConfig.skewX || 0) * Math.PI / 180), 1, 0, 0);

        ctx.translate(-renderSize / 2, -renderSize / 2);

        ctx.drawImage(
            tileAsset.asset,
            tileCoords.x, tileCoords.y,
            tileCoords.width, tileCoords.height,
            0, 0, renderSize, renderSize
        );

        ctx.restore();
    }
    /** ======== END ======== */

    /** ======== LAYERS HANDLER ======== */
    normalizeLayer (layer) {
        return layer.map(row => {
            if (typeof row === 'string')
                return row.split('').map(char => char === ' ' ? undefined : char);

            return Array.from(row, cell => cell === undefined ? undefined : cell);
        });
    }
    exportLayers (layer) {
        const activeMap = this.maps.get(this.activeMap);
        const exportData = {};

        if (layer !== undefined) {
            if (!activeMap.layers.has(layer)) {
                this.engine.warn(`Layer '${layer}' not found`);
                return JSON.stringify({}, null, 2);
            }

            const grid = activeMap.layers.get(layer);
            const exportGrid = grid.map(row => {
                return row.map(cell => {
                    if (!cell) return ' ';
                    return cell.symbol || ' ';
                }).join('');
            });

            exportData[layer] = exportGrid;
        } else {
            for (const [layerName, grid] of activeMap.layers) {
                const exportGrid = grid.map(row => {
                    return row.map(cell => {
                        if (!cell) return ' ';
                        return cell.symbol || ' ';
                    }).join('');
                });

                exportData[layerName] = exportGrid;
            }
        }

        return JSON.stringify(exportData, null, 2);
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

    /** ======== TILES ======== */
    getAssetTileInfo (tileReference) {
        if (typeof tileReference !== 'string') return null;

        const [assetId, tileName] = tileReference.split('.');
        if (!assetId || !tileName) return null;

        const asset = this.engine.getAsset(assetId);
        if (!asset) return {assetId, tileName, exists: false};

        const tileSize = asset.config?.tileSize || this.getTileBaseSize();
        const tileCoords = asset.config?.tiles?.[tileName];

        return {
            assetId,
            tileName,
            asset,
            tileSize,
            exists: !!tileCoords
        };
    }
    getTileSize (tileReference) {
        const tileInfo = this.getAssetTileInfo(tileReference);
        if (!tileInfo) return this.getTileBaseSize();

        const asset = this.engine.getAsset(tileInfo.assetId);
        return asset?.config.tileSize || this.getTileBaseSize();
    }
    getTileBaseSize (mapName = this.activeMap) {
        return this.maps.get(mapName)?.tileBaseSize ?? 32;
    }

    addTile (layer, symbol, x = 0, y = 0) {
        const activeMap = this.maps.get(this.activeMap);
        const baseTileSize = this.getTileBaseSize();

        x = Math.floor(Number(x));
        y = Math.floor(Number(y));

        if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
            this.engine.warn(`Invalid coordinates: x=${x}, y=${y}. Coordinates must be non-negative integers.`);
            return this;
        }

        if (!activeMap.tiles.has(symbol)) {
            this.engine.warn(`Symbol '${symbol}' not found in tiles configuration`);
            return this;
        }

        if (!activeMap.layers.has(layer)) {
            activeMap.layers.set(layer, []);
            this.engine.log(`Created new layer: ${layer}`);
        }

        const grid = activeMap.layers.get(layer);

        while (grid.length <= y) grid.push([]);
        const row = grid[y];
        while (row.length <= x) row.push(undefined);

        if (row[x]) {
            this.removeTile(layer, x, y);
        }

        const tileConfig = activeMap.tiles.get(symbol);
        const bounds = tileConfig?.collision?.bounds || [0, 0, baseTileSize, baseTileSize];

        const tileData = {
            symbol,
            tileX: x,
            tileY: y,
            worldX: x * baseTileSize + bounds[0],
            worldY: y * baseTileSize + bounds[1]
        };

        row[x] = tileData;

        if (this.running && tileConfig.collision && this.engine.physicsEnabled) {
            const entityTile = this.tileToEntity(
                {config: tileConfig, layer: layer, ...tileData},
                tileData.worldX,
                tileData.worldY
            );

            Promise.resolve().then(() => {
                if (!this.engine.physics.hasEntity(entityTile.id))
                    this.engine.physics.addEntity(entityTile, entityTile.physics ?? {});
            });
        }

        if (tileConfig.collision)
            this.engine.debugger.addItem(`tile_${x}_${y}_${layer}`,
                this._normalizeTileConfig(tileConfig, tileData.worldX, tileData.worldY)
            );

        this.engine.info(`Added tile '${symbol}' to layer '${layer}' at position (${x}, ${y})`);
        return this;
    }
    removeTile (layerName, tileX, tileY) {
        const map = this.maps.get(this.activeMap);
        if (!map) {
            this.engine.warn('No active map');
            return this;
        }

        const grid = map.layers.get(layerName);
        if (!grid) {
            this.engine.warn(`Layer '${layerName}' not found`);
            return this;
        }

        tileX = Math.floor(Number(tileX));
        tileY = Math.floor(Number(tileY));

        if (!Number.isInteger(tileX) || !Number.isInteger(tileY) || tileX < 0 || tileY < 0) {
            this.engine.warn(`Invalid coordinates: x=${tileX}, y=${tileY}`);
            return this;
        }

        if (tileY >= grid.length || !grid[tileY] || tileX >= grid[tileY].length) {
            this.engine.warn(`Tile position (${tileX}, ${tileY}) out of bounds`);
            return this;
        }

        const tileData = grid[tileY][tileX];
        if (!tileData) {
            this.engine.warn(`No tile found at position (${tileX}, ${tileY})`);
            return this;
        }

        // Remove physics entity if exists
        if (this.engine.physicsEnabled) {
            const entityId = `tile_${tileX}_${tileY}_${layerName}`;
            if (this.engine.physics.hasEntity(entityId)) {
                this.engine.physics.removeEntity({id: entityId});
            }
        }

        // Remove animation data if exists
        const animKey = `tile_${tileData.symbol}_${tileX}_${tileY}_${layerName}`;
        if (this.animatedTiles.has(animKey)) {
            this.animatedTiles.delete(animKey);
        }

        // Remove collision data if exists
        const collisionKey = `tile_${tileX}_${tileY}_${layerName}`;
        if (this.activeCollisions.has(collisionKey)) {
            this.activeCollisions.delete(collisionKey);
        }

        const debugId = `tile_${tileX}_${tileY}_${layerName}`;
        this.engine.debugger.removeItem(debugId);

        // Remove from grid
        grid[tileY][tileX] = undefined;

        this.engine.info(`Removed tile '${tileData.symbol}' from layer '${layerName}' at position (${tileX}, ${tileY})`);
        return this;
    }
    getTileInfo (symbol) {
        const map = this.maps.get(this.activeMap);
        if (!map || !symbol) return [];

        const results = [];

        for (const [layerName, grid] of map.layers) {
            for (let y = 0; y < grid.length; y++) {
                const row = grid[y];
                for (let x = 0; x < row.length; x++) {
                    const tileData = row[x];
                    if (tileData && tileData.symbol === symbol) {
                        const config = map.tiles.get(symbol);
                        results.push({
                            ...tileData,
                            config,
                            layer: layerName
                        });
                    }
                }
            }
        }

        return results;
    }
    moveTile (oldLayer, oldX, oldY, newLayer, newX, newY) {
        const map = this.maps.get(this.activeMap);
        if (!map) {
            this.engine.warn('No active map');
            return this;
        }

        oldX = Math.floor(Number(oldX));
        oldY = Math.floor(Number(oldY));
        newX = Math.floor(Number(newX));
        newY = Math.floor(Number(newY));

        if (!Number.isInteger(oldX) || !Number.isInteger(oldY) ||
            !Number.isInteger(newX) || !Number.isInteger(newY)) {
            this.engine.warn('Coordinates must be integer numbers');
            return this;
        }

        const srcGrid = map.layers.get(oldLayer);
        if (!srcGrid || oldY >= srcGrid.length || oldX >= srcGrid[oldY].length) {
            this.engine.warn(`Source tile (${oldX}, ${oldY}) is out of range`);
            return this;
        }

        const tileData = srcGrid[oldY][oldX];
        if (!tileData) {
            this.engine.warn(`No tile found at (${oldX}, ${oldY}, layer:${oldLayer})`);
            return this;
        }

        // Remove physics entity if exists
        if (this.engine.physicsEnabled) {
            const oldEntityId = `tile_${oldX}_${oldY}_${oldLayer}`;
            if (this.engine.physics.hasEntity(oldEntityId)) {
                this.engine.physics.removeEntity({id: oldEntityId});
            }
        }

        // Remove from source
        srcGrid[oldY][oldX] = undefined;

        // Add to destination using addTile (which handles physics entity creation)
        this.addTile(newLayer ?? oldLayer, tileData.symbol, newX, newY);

        return this;
    }
    getTilesAt (x, y) {
        const activeMap = this.maps.get(this.activeMap);
        const baseTileSize = this.getTileBaseSize();

        const tileX = Math.floor(x / baseTileSize);
        const tileY = Math.floor(y / baseTileSize);
        const tilesAtPoint = [];

        if (tileX < 0 || tileY < 0) return tilesAtPoint;

        for (const [layerName, grid] of activeMap.layers) {
            if (grid[tileY] && grid[tileY][tileX]) {
                const tileData = grid[tileY][tileX];
                if (tileData) {
                    const config = activeMap.tiles.get(tileData.symbol);
                    if (config) {
                        tilesAtPoint.push({
                            ...tileData,
                            config,
                            layer: layerName
                        });
                    }
                }
            }
        }

        return tilesAtPoint;
    }
    findTilesIn (wx, wy) {
        const map = this.maps.get(this.activeMap);
        if (!map) return [];

        const ts = this.getTileBaseSize();
        const tx = Math.floor(wx / ts);
        const ty = Math.floor(wy / ts);

        const out = [];

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const cx = tx + dx;
                const cy = ty + dy;
                if (cy < 0 || cx < 0) continue;

                for (const [layerName, grid] of map.layers) {
                    if (cy >= grid.length) continue;

                    const row = grid[cy];
                    if (!row || cx >= row.length) continue;

                    const tileData = row[cx];
                    if (!tileData) continue;

                    const cfg = map.tiles.get(tileData.symbol);
                    if (!cfg) continue;

                    const isPointInTile = this.isPointInTileShape(wx, wy, cx, cy, cfg, ts, layerName);
                    if (!isPointInTile) continue;

                    const tileObj = {
                        ...tileData,
                        config: cfg,
                        layer: layerName
                    };

                    if (cfg.parts) {
                        tileObj.parts = cfg.parts.map(p => ({
                            offsetX: p.offsetX || 0,
                            offsetY: p.offsetY || 0,
                            config: Object.assign(Object.create(null), cfg, p, {isPart: true})
                        }));
                    }
                    out.push(tileObj);
                }
            }
        }
        return out;
    }
    findTileByEntityId (entityId) {
        if (!entityId.startsWith('tile_')) return null;

        const [, tileX, tileY, layer] = entityId.split('_');
        const activeMap = this.maps.get(this.activeMap);
        const grid = activeMap.layers.get(layer);

        if (!grid || !grid[tileY] || !grid[tileY][tileX]) return null;

        const tileData = grid[tileY][tileX];
        const config = activeMap.tiles.get(tileData.symbol);

        return {
            ...tileData,
            config,
            layer
        };
    }
    tileToEntity (tile, worldX, worldY) {
        const tileSize  = this.getTileBaseSize();
        const id = `tile_${tile.tileX || Math.floor(worldX / tileSize)}_${tile.tileY || Math.floor(worldY / tileSize)}_${tile.layer}`;
        return new Entity(id, {
            engine: this.engine,

            hoverable: false,
            clickable: false,
            draggable: false,

            data: {tile},

            ...this._normalizeTileConfig(tile.config, worldX, worldY)
        })
    }
    _normalizeTileConfig (config, worldX, worldY) {
        const tileSize = this.getTileBaseSize();
        const bounds = config?.collision?.bounds || [0, 0, tileSize, tileSize];
        return {
            x: worldX,
            y: worldY,

            width : bounds[2],
            height: bounds[3],

            shape : config?.shape  || 'rectangle',
            scale : config?.scale  || 1,
            scaleX: config?.scaleX || 1,
            scaleY: config?.scaleY || 1,
            skewX : config?.skewX  || 0,
            skewY : config?.skewY  || 0,
            rotation: config?.rotation || 0,
            borderRadius: config?.borderRadius || 0,
            spikes: config?.spikes || 5,

            collision: {
                x: bounds[0], y: bounds[1],
                width : bounds[2],
                height: bounds[3],
                points: null,
                ...(config?.collision || {})
            },

            physics: {
                friction   : 0,
                density    : 0,
                restitution: 0,
                ...(config?.physics || {}),
                bodyType   : 'static',
                sensor     : config?.collision?.type === 'sensor',
            }
        }
    }
    _addTilesToDebugger () {
        const activeMap = this.maps.get(this.activeMap);
        if (!activeMap) return;

        for (const [layerName, grid] of activeMap.layers) {
            for (let y = 0; y < grid.length; y++) {
                const row = grid[y];
                if (!row) continue;

                for (let x = 0; x < row.length; x++) {
                    const tileData = row[x];
                    if (!tileData) continue;

                    const tileConfig = activeMap.tiles.get(tileData.symbol);
                    const debugId = `tile_${tileData.tileX}_${tileData.tileY}_${layerName}`;

                    if (tileConfig?.collision)
                        this.engine.debugger.addItem(debugId,
                            this._normalizeTileConfig(tileConfig, tileData.worldX, tileData.worldY)
                        );
                }
            }
        }
    }
    /** ======== END ======== */

    /** ======== COORDINATES ======== */
    parseLayersWithWorldCoords (layersConfig, mapName) {
        const layers = new Map();
        const map = this.maps.get(mapName);
        const {tiles, tileBaseSize} = map;

        for (const [layerName, layerData] of Object.entries(layersConfig)) {
            const normalizedLayer = Array.isArray(layerData) ?
                this.normalizeLayer(layerData) : layerData;

            // Pre-calculate world coordinates for each tile
            const layerWithCoords = [];
            for (let y = 0; y < normalizedLayer.length; y++) {
                const row = normalizedLayer[y];
                const rowWithCoords = [];
                for (let x = 0; x < row.length; x++) {
                    const symbol = row[x];
                    if (symbol) {
                        const tileConfig = tiles.get(symbol);
                        const bounds = tileConfig?.collision?.bounds || [0, 0, tileBaseSize, tileBaseSize];
                        rowWithCoords.push({
                            symbol,
                            tileX: x,
                            tileY: y,
                            worldX: x * tileBaseSize + bounds[0],
                            worldY: y * tileBaseSize + bounds[1]
                        });
                    } else {
                        rowWithCoords.push(undefined);
                    }
                }
                layerWithCoords.push(rowWithCoords);
            }
            layers.set(layerName, layerWithCoords);
        }

        return layers;
    }
    tileToWorld (tileX, tileY, mapName = this.activeMap) {
        if (!mapName || !this.maps.has(mapName)) {
            this.engine?.warn(`Map '${mapName}' not found`);
            return {worldX: 0, worldY: 0};
        }

        const tileSize = this.getTileBaseSize(mapName);

        return {
            x: tileX * tileSize,
            y: tileY * tileSize
        };
    }
    worldToTile (worldX, worldY, mapName = this.activeMap) {
        if (!mapName || !this.maps.has(mapName)) {
            this.engine?.warn(`Map '${mapName}' not found`);
            return {tileX: 0, tileY: 0};
        }

        const tileSize = this.getTileBaseSize(mapName);

        return {
            x: Math.floor(worldX / tileSize),
            y: Math.floor(worldY / tileSize)
        };
    }
    /** ======== END ======== */

    /** ======== COLLISIONS & PHYSICS ======== */
    isPointInTileShape (worldX, worldY, tileX, tileY, cfg, ts, layerName = 'points') {
        // Get the actual tile data with pre-calculated worldX/worldY
        const map = this.maps.get(this.activeMap);
        const grid = map.layers.get(layerName);
        const tileData = grid?.[tileY]?.[tileX];

        if (!tileData) {
            // Fallback to old calculation if tile data not found
            const bounds = cfg?.collision?.bounds || [0, 0, ts, ts];
            const actualWorldX = tileX * ts + bounds[0];
            const actualWorldY = tileY * ts + bounds[1];
            return worldX >= actualWorldX && worldX <= actualWorldX + bounds[2] &&
                worldY >= actualWorldY && worldY <= actualWorldY + bounds[3];
        }

        if (!cfg.collision?.points && !cfg.styles?.customPath && !cfg.styles?.shape && !cfg.collision?.bounds) {
            const bounds = cfg?.collision?.bounds || [0, 0, ts, ts];
            return worldX >= tileData.worldX && worldX <= tileData.worldX + bounds[2] &&
                worldY >= tileData.worldY && worldY <= tileData.worldY + bounds[3];
        }

        const tileEntity = this.tileToEntity(
            {config: cfg, layer: layerName, ...tileData},
            tileData.worldX,
            tileData.worldY
        );
        const verts = this.engine.collision.getVertices(tileEntity);
        return Collision.isPointInShape(worldX, worldY, verts);
    }
    _bindPhysicsEvents () {
        if (!this.engine.physicsEnabled) return;

        this.engine.on('collisions', data => {
            const {entityA, entityB} = data;
            let tile, entity, side;

            if (entityA.data('tile')) {
                side   = data.sideA;
                tile   = data.entityA;
                entity = data.entityB;
            } else if (entityB.data('tile')) {
                side   = data.sideB;
                tile   = data.entityB;
                entity = data.entityA;
            } else return;

            const tileConfig = tile.data('tile').config;

            data.entityA = tile;
            data.entityB = entity;

            tileConfig?.collision?.onCollide?.(data);

            if (tileConfig?.collision?.type === 'platform') {
                if (tileConfig.collision.side !== undefined && tileConfig.collision.side !== side)
                    return;
                this._applyPlatform(entity, tile, data);
            }
        });

        this.engine.on('collisionEnd', data => {
            let {entityA, entityB} = data;
            let tile, entity;

            if (entityA.data('tile')) {
                tile   = data.entityA;
                entity = data.entityB;
            } else if (entityB.data('tile')) {
                tile   = data.entityB;
                entity = data.entityA;
            } else return;

            const tileConfig = tile.data('tile').config;

            if (tileConfig?.collision?.type === 'platform')
                Promise.resolve().then(() => entity.unset('onGround'));

            data.entityA = tile;
            data.entityB = entity;

            tileConfig?.collision?.onCollisionEnd?.(data);
        });
    }
    _checkCollisions (entity) {
        if (!entity.collision?.enabled) return;

        const newCollisions = this._scanSurroundingTiles(entity);

        for (const [key, oldCol] of this.activeCollisions) {
            if (newCollisions.has(key)) continue;

            if (oldCol.tile.config.collision.type === 'platform') {
                Promise.resolve().then(() => {
                    if (this.engine.physicsEnabled && entity.physics) {
                        const dataGround = entity.data('onGround');
                        this.engine.physics.setBodyType(entity.id, dataGround?.physics?.bodyType || 'dynamic');
                    }
                    oldCol.entity.unset('onGround');
                });
            }

            // Use pre-calculated worldX/worldY from tile data
            oldCol.tile.config.collision.onCollisionEnd?.({
                entity: oldCol.entity,
                tile: oldCol.tile.config,
                position: {
                    x: oldCol.tile.worldX,
                    y: oldCol.tile.worldY
                },
                worldX: oldCol.tile.worldX,
                worldY: oldCol.tile.worldY,
                layer: oldCol.layer
            });
        }

        this.activeCollisions = newCollisions;
    }
    _scanSurroundingTiles (entity) {
        const tileSize = this.getTileBaseSize();
        const padding = tileSize / 2;

        const bounds = {
            left: Math.floor((entity.absoluteX - padding) / tileSize),
            top: Math.floor((entity.absoluteY - padding) / tileSize),
            right: Math.ceil((entity.absoluteX + entity.width + padding) / tileSize),
            bottom: Math.ceil((entity.absoluteY + entity.height + padding) / tileSize)
        };

        const newCollisions = new Map();

        for (let y = bounds.top; y <= bounds.bottom; y++) {
            for (let x = bounds.left; x <= bounds.right; x++) {
                const tilesAtPoint = this.getTilesAt(x * tileSize, y * tileSize);

                for (const tile of tilesAtPoint) {
                    if (!tile.config.collision) continue;

                    const collisionResult = this._checkTileCollision(
                        entity, tile, tile.worldX, tile.worldY
                    );

                    if (!collisionResult?.collides) continue;

                    const key = `tile_${tile.tileX}_${tile.tileY}_${tile.layer}`;
                    const data = {
                        entity, tile,
                        position: {x: tile.worldX, y: tile.worldY},
                        worldX: tile.worldX,
                        worldY: tile.worldY,
                        layer: tile.layer,
                        side: collisionResult.side,
                        amount: collisionResult.amount,
                        collisionType: tile.config.collision.type
                    };

                    newCollisions.set(key, {
                        entity, tile,
                        x: tile.tileX,
                        y: tile.tileY,
                        layer: tile.layer,
                        time: performance.now(),
                        side: collisionResult.side,
                        amount: collisionResult.amount
                    });

                    switch (tile.config.collision.type) {
                        case 'solid':
                            this._applySolid(entity, {...collisionResult, tile});
                            break;
                        case 'platform':
                            if (tile.collision?.side !== undefined) {
                                if (tile.collision.side === collisionResult.side)
                                    this._applyPlatform(entity, tile, collisionResult);
                            } else {
                                this._applyPlatform(entity, tile, collisionResult);
                            }
                            break;
                    }

                    const isNew = !this.activeCollisions.has(key) ||
                        this.activeCollisions.get(key).side !== collisionResult.side;
                    if (isNew) tile.config.collision.onCollide?.(data);
                }
            }
        }
        return newCollisions;
    }
    _checkTileCollision (entity, tile, worldX, worldY) {
        const tileEntity = this.tileToEntity(tile, worldX, worldY);
        const collisionInfo = this.engine.collision.detectCollisionDetailed(entity, tileEntity);

        if (!collisionInfo.colliding)
            return {collides: false};

        const side = this.engine.collision.getSideFromCenters(entity, tileEntity);

        switch (tile.config.collision.type) {
            case 'platform':
                if (side === 'top') {
                    return {
                        collides: true,
                        side: 'top',
                        amount: collisionInfo.overlap
                    };
                }
                return {collides: false};

            case 'sensor':
                return {
                    collides: true,
                    side: side,
                    amount: collisionInfo.overlap,
                    isTrigger: true
                };

            case 'solid':
            default:
                return {
                    collides: true,
                    side: side,
                    amount: collisionInfo.overlap
                };
        }
    }
    _applySolid (entity, resolve) {
        const {side, amount} = resolve;
        let dx = 0, dy = 0;

        switch (side) {
            case 'left':
                dx -= amount;
                break;
            case 'right':
                dx += amount;
                break;
            case 'top':
                dy -= amount;
                break;
            case 'bottom':
                dy += amount;
                break;
        }

        if (dx !== 0 || dy !== 0) {
            if (this.engine.physicsEnabled && entity.physics)
                this.engine.physics.haltBody(entity.id);

            entity.style({
                x: entity.absoluteX + dx,
                y: entity.absoluteY + dy
            });
        }
    }
    _applyPlatform (entity, tile, resolve) {
        if (this.engine.physicsEnabled) {
            entity.data('onGround', tile.data('tile'));
            return this;
        }
        entity.data('onGround', tile);
    }
    _addTilePhysicsEntities () {
        const activeMap = this.maps.get(this.activeMap);
        if (!activeMap) return;

        for (const [layerName, grid] of activeMap.layers) {
            for (let y = 0; y < grid.length; y++) {
                const row = grid[y];
                if (!row) continue;

                for (let x = 0; x < row.length; x++) {
                    const tileData = row[x];
                    if (!tileData) continue;

                    const tileConfig = activeMap.tiles.get(tileData.symbol);
                    if (!tileConfig || !tileConfig.collision) continue;

                    const entityTile = this.tileToEntity(
                        {config: tileConfig, layer: layerName, ...tileData},
                        tileData.worldX,
                        tileData.worldY
                    );

                    if (!this.engine.physics.hasEntity(entityTile.id)) {
                        this.engine.physics.addEntity(entityTile, entityTile.physics ?? {});
                    }
                }
            }
        }
    }
    _removeTilePhysicsEntities () {
        const activeMap = this.maps.get(this.activeMap);
        if (!activeMap) return;

        for (const [layerName, grid] of activeMap.layers) {
            for (let y = 0; y < grid.length; y++) {
                const row = grid[y];
                if (!row) continue;

                for (let x = 0; x < row.length; x++) {
                    const tileData = row[x];
                    if (!tileData) continue;

                    const entityId = `tile_${tileData.tileX}_${tileData.tileY}_${layerName}`;
                    if (this.engine.physics.hasEntity(entityId)) {
                        this.engine.physics.removeEntity({id: entityId});
                    }
                }
            }
        }
    }
    /** ======== END ======== */

    /** ======== ANIMATIONS ======== */
    getCurrentTileFrame (symbol, tileX = null, tileY = null, layer = null) {
        let animKey;

        if (tileX !== null && tileY !== null && layer) {
            animKey = `tile_${symbol}_${tileX}_${tileY}_${layer}`;
        } else {
            animKey = `tile_${symbol}`;
        }

        const animData = this.animatedTiles.get(animKey);

        if (animData && animData.frames) {
            return animData.frames[animData.currentFrame];
        }

        return null;
    }
    playTileAnimation (symbol, tileX = null, tileY = null, layer = null) {
        if (tileX !== null && tileY !== null && layer !== null) {
            const specificKey = `tile_${symbol}_${tileX}_${tileY}_${layer}`;
            const animData = this.animatedTiles.get(specificKey);
            if (animData) {
                animData.playing = true;
                animData.lastFrameTime = performance.now();
            } else {
                this.engine.warn(`Animation data not found for: ${specificKey}`);
            }
        } else {
            for (const [key, animData] of this.animatedTiles) {
                if (key.includes(`tile_${symbol}`)) {
                    animData.playing = true;
                    animData.lastFrameTime = performance.now();
                }
            }
        }
        return this;
    }
    pauseTileAnimation (symbol, tileX = null, tileY = null, layer = null) {
        if (tileX !== null && tileY !== null && layer !== null) {
            const specificKey = `tile_${symbol}_${tileX}_${tileY}_${layer}`;
            const animData = this.animatedTiles.get(specificKey);
            if (animData) {
                animData.playing = false;
            }
        } else {
            for (const [key, animData] of this.animatedTiles) {
                if (key.includes(`tile_${symbol}`)) {
                    animData.playing = false;
                }
            }
        }
        return this;
    }
    stopTileAnimation (symbol, tileX = null, tileY = null, layer = null) {
        if (tileX !== null && tileY !== null && layer !== null) {
            const specificKey = `tile_${symbol}_${tileX}_${tileY}_${layer}`;
            const animData = this.animatedTiles.get(specificKey);
            if (animData) {
                animData.playing = false;
                animData.currentFrame = 0;
            }
        } else {
            for (const [key, animData] of this.animatedTiles) {
                if (key.includes(`tile_${symbol}`)) {
                    animData.playing = false;
                    animData.currentFrame = 0;
                }
            }
        }
        return this;
    }
    setTileAnimationFrame (symbol, frame, tileX = null, tileY = null, layer = null) {
        if (tileX !== null && tileY !== null && layer !== null) {
            const specificKey = `tile_${symbol}_${tileX}_${tileY}_${layer}`;
            const animData = this.animatedTiles.get(specificKey);
            if (animData && frame >= 0 && frame < animData.frames.length) {
                animData.currentFrame = frame;
            }
        } else {
            for (const [key, animData] of this.animatedTiles) {
                if (key.includes(`tile_${symbol}`) && frame >= 0 && frame < animData.frames.length) {
                    animData.currentFrame = frame;
                }
            }
        }
        return this;
    }
    setTileAnimationSpeed (symbol, frameRate, tileX = null, tileY = null, layer = null) {
        if (tileX !== null && tileY !== null && layer !== null) {
            const specificKey = `tile_${symbol}_${tileX}_${tileY}_${layer}`;
            const animData = this.animatedTiles.get(specificKey);
            if (animData) {
                animData.frameRate = frameRate;
            }
        } else {
            for (const [key, animData] of this.animatedTiles) {
                if (key.includes(`tile_${symbol}`)) {
                    animData.frameRate = frameRate;
                }
            }
        }
        return this;
    }
    _initializeTileAnimations () {
        if (!this.running || !this.activeMap) return;
        const activeMap = this.maps.get(this.activeMap);

        for (const [symbol, tileConfig] of activeMap.tiles) {
            if (tileConfig.frames && tileConfig.frames.length > 1) {
                // Create individual animation data for each tile instance
                const tilesWithSymbol = this.getTileInfo(symbol);

                tilesWithSymbol.forEach(tile => {
                    // Include layer in the key
                    const animKey = `tile_${symbol}_${tile.tileX}_${tile.tileY}_${tile.layer}`;
                    this.animatedTiles.set(animKey, {
                        frames: tileConfig.frames,
                        frameRate: tileConfig.frameRate || 8,
                        loop: tileConfig.loop ?? false,
                        currentFrame: 0,
                        playing: tileConfig.playing ?? true,
                        lastFrameTime: performance.now()
                    });
                });

                // Keep global animation for backward compatibility
                const animKey = `tile_${symbol}`;
                this.animatedTiles.set(animKey, {
                    frames: tileConfig.frames,
                    frameRate: tileConfig.frameRate || 8,
                    loop: tileConfig.loop ?? false,
                    currentFrame: 0,
                    playing: tileConfig.playing ?? true,
                    lastFrameTime: performance.now()
                });
            }
        }
    }
    _updateAnimatedTiles () {
        const currentTime = performance.now();

        for (const [key, animData] of this.animatedTiles) {
            if (!animData.frames || animData.frames.length <= 1) continue;
            if (animData.playing === false) continue; // Add this check

            const frameTime = 1000 / animData.frameRate;

            if (currentTime - animData.lastFrameTime >= frameTime) {
                if (animData.loop) {
                    animData.currentFrame = (animData.currentFrame + 1) % animData.frames.length;
                } else {
                    if (animData.currentFrame < animData.frames.length - 1) {
                        animData.currentFrame++;
                    }
                }
                animData.lastFrameTime = currentTime;
            }
        }
    }
    /** ======== END ======== */

    /** ======== EVENTS ======== */
    _bindInputEvents () {
        const px = this.engine;

        px.on('click', e => this.running && this.activeMap && this._onTileClick(e));
        px.on('rightclick', e => this.running && this.activeMap && this._onTileRightClick(e));

        this.lastHoverStack = [];
        px.on('mousemove', e => this.running && this.activeMap && this._onTileHover(e));
    }
    _buildTileEvent (worldX, worldY, tile, originalEvent) {
        return {
            symbol : tile.symbol,
            config : tile.config,
            tileX  : tile.tileX,
            tileY  : tile.tileY,
            worldX : tile.worldX,
            worldY : tile.worldY,
            layer  : tile.layer,
            screenX: originalEvent.screenX,
            screenY: originalEvent.screenY,
            originalEvent,
            stopPropagation () {
                this.__stopped = true
            }
        };
    }

    _onTileHover (e) {
        const currentStack = this.findTilesIn(e.worldX, e.worldY).reverse();
        const prevStack = this.lastHoverStack;

        for (const prev of prevStack) {
            const stillThere = currentStack.some(c =>
                c.layer === prev.layer && c.tileX === prev.tileX && c.tileY === prev.tileY
            );
            if (!stillThere) {
                const ev = this._buildTileEvent(e.worldX, e.worldY, prev, e);
                prev.config?.onHoverOut?.(ev);
            }
        }

        for (const curr of currentStack) {
            const wasThere = prevStack.some(p =>
                p.layer === curr.layer && p.tileX === curr.tileX && p.tileY === curr.tileY
            );
            if (!wasThere) {
                const ev = this._buildTileEvent(e.worldX, e.worldY, curr, e);
                curr.config?.onHover?.(ev);
            }
        }

        this.lastHoverStack = currentStack;
    }
    _onTileClick (e) {
        const tiles = this.findTilesIn(e.worldX, e.worldY).reverse();
        for (const tile of tiles) {
            const ev = this._buildTileEvent(e.worldX, e.worldY, tile, e);
            tile.config?.onClick?.(ev);
            if (ev.__stopped) break;
        }
    }
    _onTileRightClick (e) {
        const tiles = this.findTilesIn(e.worldX, e.worldY).reverse();
        for (const tile of tiles) {
            const ev = this._buildTileEvent(e.worldX, e.worldY, tile, e);
            tile.config?.onRightClick?.(ev);
            if (ev.__stopped) break;
        }
    }
    /** ======== END ======== */

    /** ======== DEBUGGER ======== */
    enableTileDebug () {
        this._addTilesToDebugger();
        return this;
    }
    disableTileDebug () {
        const activeMap = this.maps.get(this.activeMap);
        if (!activeMap) return this;

        // Remove all tile debug items
        for (const [layerName, grid] of activeMap.layers) {
            for (let y = 0; y < grid.length; y++) {
                const row = grid[y];
                if (!row) continue;

                for (let x = 0; x < row.length; x++) {
                    const tileData = row[x];
                    if (!tileData) continue;

                    const debugId = `tile_${tileData.tileX}_${tileData.tileY}_${layerName}`;
                    this.engine.debugger.removeItem(debugId);
                }
            }
        }

        return this;
    }
    /** ======== END ======== */

    /** ======== RESET ======== */
    clear () {
        this.disableTileDebug();

        this.activeCollisions.clear();
        this.animatedTiles.clear();

        if (this.engine.physicsEnabled) {
            this._removeTilePhysicsEntities();
        } else if (this.engine.collisionEnabled) {
            this.engine.collision.decomposedShapes.forEach((value, key) => {
                if (key.startsWith('tile_'))
                    this.engine.collision.decomposedShapes.delete(key);
            });
        }

        this.lastHoverStack = [];
    }
    reset () {
        this.clear();
        this.maps.clear();
        this.activeMap = null;
        this.running = false;
    }
    destroy () {
        this.reset();

        const px = this.engine;
        px.off('click', this._onTileClick);
        px.off('rightclick', this._onTileRightClick);
        px.off('mousemove', this._onTileHover);

        this.engine = null;
        this.maps = null;
        this.activeMap = null;
        this.animatedTiles = null;
        this.activeCollisions = null;
        this.lastHoverStack = null;
    }
    /** ======== END ======== */

}

export default TileMap;
