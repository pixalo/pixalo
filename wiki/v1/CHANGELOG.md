# CHANGELOG

## [1.2.0] - 2025-10-31

### 🔧 Issues Resolved
- Browser Zoom Interference: From now on, there will be no design issues and browser zoom will not change or disrupt the position of entities in your game logic.
- Optimized ViewPort and Canvas Size settings for better control and to avoid scaling interference
- fix: Stabilize frame timing by optimizing deltaTime calculations and implementing consistent FPS management
- Collision System: Enhanced collision detection accuracy, particularly for rectangle-to-rectangle collision side detection

### ✨ New Features
- The `context` key has been added to the `config` of the `Pixalo` class to fully configure `ContextAttributes`.
- Added `autoResize` key to automatically resize the Canvas tag. If you do not want automatic resizing, set it to `false`. However, the `resize` event will be called if this key is `false` and you can manually set your desired size on the Canvas.
- The `appendTo` key has been added so you can specify where the `canvas` tag should be added.

### 🪄 `Pixalo` class
- Function name `getAllEntities` changed to `getEntities`
- Two new functions have been added to the class: `findDeep` and `findDeepByClass`
- From now on, you can specify whether children detect physical collisions or not by setting the `children` value on the `collision` object.

### 🎭 `Entity` class
- Added new functions: `findDeep`, `findDeepByClass`, `next`, `prev`, `siblings`, `swap`, `parent`, `empty`
- Fixed the problem and optimized the `kill` and `_destroy` functions to prevent memory leaks.

### 💥 `Collision` class
- Added `detect` function: This function calls the same `detectCollisionDetailed` function and was added only for quick and easy access to the `detectCollisionDetailed` function.

### ⚙️ `Debugger` class
- Added `items` value to Debugger settings to specify whether debug shapes should be rendered or not.

---

## [1.1.0] - 2025-10-21

### Keyboards
- Added multi-language keyboard support with physical/logical key distinction
- New `isLogicalKeyPressed()` method for language-specific key detection

### 🎥 Camera System
- **Added `viewPadding` configuration** - Default padding for visibility checks in `inView()` method
- **Enhanced visibility detection** - `inView()` now uses configurable default padding instead of hardcoded values

### 💥 Physics
- **Optimization**: `mouse`/`touch` events
- **Added functions for managing** `Joints`

### ✨ New Features
- **Added `isInteractive()` method** to Entity class for advanced event handling
- **Enhanced event system** with comprehensive mouse/touch event support
- **Fixed "Lost Event" issue** - entities now receive complete event cycles

### 🔧 Event System Improvements
- **Mouse Events**: `mousedown`, `mousemove`, `mouseup`, `wheel` now properly tracked
- **Touch Events**: Multi-touch support with proper `touchstart → touchmove → touchend` cycles
- **Click Events**: Enhanced `click` and `rightclick` detection

### 🐛 Bug Fixes
- Fixed lost `mouseup`/`touchend` events when dragging outside entity
- Resolved event duplication between engine and physics systems

---

**Key Changes**:
- Interactive entities now receive ALL mouse/touch events consistently, solving the "lost event" problem where `mouseup`/`touchend` wouldn't trigger if the pointer moved outside the entity
- Camera visibility checks now use consistent default padding (100px) that can be configured via `camera.viewPadding`