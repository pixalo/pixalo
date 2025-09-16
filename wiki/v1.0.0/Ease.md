A comprehensive collection of easing functions for smooth animations and transitions.

### Linear
Simple linear interpolation with no acceleration or deceleration.

#### `Pixalo.Ease.linear(t)`
- **Description**: No easing, linear transition
- **Parameters**: `t` (number) - Progress value between 0 and 1
- **Returns**: Same value as input
- **Use case**: Constant speed animations

---

### Quadratic Easing
Quadratic (t²) acceleration and deceleration curves.

#### `Pixalo.Ease.easeInQuad(t)`
- **Description**: Accelerating from zero velocity
- **Animation**: Starts slow, speeds up
- **Formula**: t²

#### `Pixalo.Ease.easeOutQuad(t)`
- **Description**: Decelerating to zero velocity
- **Animation**: Starts fast, slows down
- **Formula**: t(2-t)

#### `Pixalo.Ease.easeInOutQuad(t)`
- **Description**: Acceleration until halfway, then deceleration
- **Animation**: Slow start and end, fast middle

---

### Cubic Easing
Cubic (t³) curves for more pronounced acceleration/deceleration.

#### `Pixalo.Ease.easeInCubic(t)`
- **Description**: Cubic acceleration from zero
- **Animation**: Very slow start, sharp acceleration
- **Formula**: t³

#### `Pixalo.Ease.easeOutCubic(t)`
- **Description**: Cubic deceleration to zero
- **Animation**: Fast start, gentle slowdown
- **Formula**: (t-1)³ + 1

#### `Pixalo.Ease.easeInOutCubic(t)`
- **Description**: Cubic acceleration and deceleration
- **Animation**: Smooth S-curve transition

---

### Quartic Easing
Fourth-power (t⁴) curves for even stronger easing effects.

#### `Pixalo.Ease.easeInQuart(t)`
- **Description**: Quartic acceleration
- **Animation**: Extremely slow start

#### `Pixalo.Ease.easeOutQuart(t)`
- **Description**: Quartic deceleration
- **Animation**: Fast start, very gentle end

#### `Pixalo.Ease.easeInOutQuart(t)`
- **Description**: Combined quartic acceleration and deceleration

---

### Quintic Easing
Fifth-power (t⁵) curves for the strongest polynomial easing.

#### `Pixalo.Ease.easeInQuint(t)`
- **Description**: Quintic acceleration
- **Animation**: Ultra-slow start, dramatic acceleration

#### `Pixalo.Ease.easeOutQuint(t)`
- **Description**: Quintic deceleration
- **Animation**: Dramatic start, ultra-smooth ending

#### `Pixalo.Ease.easeInOutQuint(t)`
- **Description**: Combined quintic acceleration and deceleration

---

### Sinusoidal Easing
Sine wave-based easing for natural, organic motion.

#### `Pixalo.Ease.easeInSine(t)`
- **Description**: Sinusoidal acceleration
- **Animation**: Gentle, natural start
- **Formula**: 1 - cos(t × π/2)

#### `Pixalo.Ease.easeOutSine(t)`
- **Description**: Sinusoidal deceleration
- **Animation**: Natural, gentle ending
- **Formula**: sin(t × π/2)

#### `Pixalo.Ease.easeInOutSine(t)`
- **Description**: Sinusoidal acceleration and deceleration
- **Animation**: Very smooth, wave-like motion

---

### Exponential Easing
Exponential (2ⁿ) curves for dramatic easing effects.

#### `Pixalo.Ease.easeInExpo(t)`
- **Description**: Exponential acceleration
- **Animation**: Extremely slow start, explosive acceleration
- **Special**: Returns 0 when t = 0

#### `Pixalo.Ease.easeOutExpo(t)`
- **Description**: Exponential deceleration
- **Animation**: Explosive start, rapid slowdown
- **Special**: Returns 1 when t = 1

#### `Pixalo.Ease.easeInOutExpo(t)`
- **Description**: Combined exponential acceleration and deceleration
- **Animation**: Dramatic S-curve with explosive middle

---

### Circular Easing
Quarter-circle arc-based easing for smooth, rounded transitions.

#### `Pixalo.Ease.easeInCirc(t)`
- **Description**: Circular acceleration
- **Animation**: Gradual start with increasing curve
- **Formula**: 1 - √(1 - t²)

#### `Pixalo.Ease.easeOutCirc(t)`
- **Description**: Circular deceleration
- **Animation**: Sharp start with gradual curve-out
- **Formula**: √(1 - (t-1)²)

#### `Pixalo.Ease.easeInOutCirc(t)`
- **Description**: Combined circular acceleration and deceleration
- **Animation**: Smooth arc-like motion

---

### Bounce Easing
Simulates bouncing ball physics for playful animations.

#### `Pixalo.Ease.easeInBounce(t)`
- **Description**: Bounce at the beginning
- **Animation**: Bounces before settling into motion

#### `Pixalo.Ease.easeOutBounce(t)`
- **Description**: Bounce at the end
- **Animation**: Bounces after reaching destination
- **Use case**: Button clicks, landing animations

#### `Pixalo.Ease.easeInOutBounce(t)`
- **Description**: Bounces at both start and end
- **Animation**: Playful double-bounce effect

---

### Elastic Easing
Spring-like oscillations for elastic, rubber-band effects.

#### `Pixalo.Ease.easeInElastic(t)`
- **Description**: Elastic pull-back before acceleration
- **Animation**: Oscillates backward then forward
- **Use case**: Slingshot effects

#### `Pixalo.Ease.easeOutElastic(t)`
- **Description**: Elastic overshoot and settle
- **Animation**: Overshoots target and oscillates back
- **Use case**: Spring-loaded animations

#### `Pixalo.Ease.easeInOutElastic(t)`
- **Description**: Elastic effects at both ends
- **Animation**: Pull-back, overshoot, and settle

---

### Step Easing
Discrete step transitions for pixel-perfect or retro animations.

#### `Pixalo.Ease.easeStepStart(t)`
- **Description**: Immediate jump to end value
- **Returns**: 0 if t = 0, otherwise 1
- **Use case**: Instant state changes

#### `Pixalo.Ease.easeStepEnd(t)`
- **Description**: Stay at start until the very end
- **Returns**: 1 if t = 1, otherwise 0
- **Use case**: Delayed state changes

#### `Pixalo.Ease.easeSteps(t, steps)`
- **Description**: Divide animation into discrete steps
- **Parameters**: 
  - `t` - Progress (0 to 1)
  - `steps` - Number of steps (default: 5)
- **Use case**: Pixel art animations, frame-by-frame effects

---

### Back Easing
Overshooting curves that go beyond the target before settling.

#### `Pixalo.Ease.easeInBack(t)`
- **Description**: Pulls back before accelerating forward
- **Animation**: Brief reverse motion, then acceleration
- **Constant**: Uses c1 = 1.70158 for overshoot amount

#### `Pixalo.Ease.easeOutBack(t)`
- **Description**: Overshoots target, then pulls back
- **Animation**: Exceeds destination, then settles back
- **Use case**: Satisfying UI feedback

#### `Pixalo.Ease.easeInOutBack(t)`
- **Description**: Pull-back and overshoot at both ends
- **Animation**: Complex motion with character
- **Constant**: Uses c1 = 1.70158 × 1.525 for balanced effect