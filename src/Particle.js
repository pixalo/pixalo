/**
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo
 * @License: MIT
 */

class Particle {

    constructor () {
        this.reset();
    }

    init (config) {
        this.x = config.x;
        this.y = config.y;
        this.vx = config.velocity.x;
        this.vy = config.velocity.y;
        this.ax = config.acceleration.x;
        this.ay = config.acceleration.y;
        this.size = config.size;
        this.currentSize = config.size;
        this.startColor = config.color.start;
        this.endColor = config.color.end;
        this.startAlpha = config.alpha.start;
        this.endAlpha = config.alpha.end;
        this.rotation = config.rotation;
        this.rotationSpeed = config.rotationSpeed;
        this.lifetime = config.lifetime;
        this.age = 0;
        this.texture = config.texture;
    }

    render (ctx) {
        if (this.isDead()) return;

        const progress = this.age / this.lifetime;

        // Interpolate alpha
        const alpha = this.startAlpha + (this.endAlpha - this.startAlpha) * progress;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);

        if (this.texture) {
            // Render texture if available
            const asset = this.texture; // Assuming texture is already loaded
            ctx.drawImage(asset, -this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            // Render as colored circle
            const color = this.interpolateColor(this.startColor, this.endColor, progress);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    update (deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds

        // Update velocity
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Update rotation
        this.rotation += this.rotationSpeed * dt;

        // Update age
        this.age += deltaTime;
    }

    reset () {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.size = 1;
        this.currentSize = 1;
        this.startColor = '#ffffff';
        this.endColor = '#000000';
        this.startAlpha = 1;
        this.endAlpha = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.lifetime = 1000;
        this.age = 0;
        this.texture = null;
    }

    isDead () {
        return this.age >= this.lifetime;
    }

    interpolateColor (color1, color2, progress) {
        // Simple color interpolation (assumes hex colors)
        const r1 = parseInt(color1.substr(1, 2), 16);
        const g1 = parseInt(color1.substr(3, 2), 16);
        const b1 = parseInt(color1.substr(5, 2), 16);

        const r2 = parseInt(color2.substr(1, 2), 16);
        const g2 = parseInt(color2.substr(3, 2), 16);
        const b2 = parseInt(color2.substr(5, 2), 16);

        const r = Math.round(r1 + (r2 - r1) * progress);
        const g = Math.round(g1 + (g2 - g1) * progress);
        const b = Math.round(b1 + (b2 - b1) * progress);

        return `rgb(${r}, ${g}, ${b})`;
    }

}

export default Particle;