# CHANGELOG

## [1.2.0] - 2025-

### Issues Resolved
- Browser Zoom Interference: From now on, there will be no design issues and browser zoom will not change or disrupt the position of entities in your game logic.

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