/**
 * Momentum X - Player System
 * Player character with automatic movement and collision detection
 */

class Player {
    constructor(x = GAME_CONFIG.PLAYER_X, y = GAME_CONFIG.PLAYER_Y) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PLAYER_WIDTH;
        this.height = GAME_CONFIG.PLAYER_HEIGHT;
        
        // Movement properties
        this.speed = GAME_CONFIG.PLAYER_SPEED;
        this.baseSpeed = GAME_CONFIG.PLAYER_SPEED;
        
        // Visual properties
        this.color = GAME_CONFIG.COLORS.CYAN;
        this.glowColor = GAME_CONFIG.COLORS.WHITE;
        
        // Animation properties
        this.animationTime = 0;
        this.pulseIntensity = 0;
        
        // State
        this.isActive = true;
    }
    
    /**
     * Update player position and animation
     * @param {number} deltaTime - Time since last update in milliseconds
     * @param {number} speedMultiplier - Current game speed multiplier (from time powers)
     */
    update(deltaTime, speedMultiplier = 1.0) {
        if (!this.isActive) return;
        
        // Update animation time
        this.animationTime += deltaTime;
        
        // Calculate pulse effect for visual feedback
        this.pulseIntensity = Math.sin(this.animationTime * 0.005) * 0.3 + 0.7;
        
        // Automatic left-to-right movement
        const currentSpeed = this.speed * speedMultiplier;
        this.x += currentSpeed * (deltaTime / 1000);
        
        // Keep player within canvas bounds (with some margin)
        this.x = clamp(this.x, 50, GAME_CONFIG.CANVAS_WIDTH - this.width - 50);
    }
    
    /**
     * Render the player to the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (!this.isActive) return;
        
        ctx.save();
        
        // Apply glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 * this.pulseIntensity;
        
        // Draw main player body (placeholder rectangle)
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.pulseIntensity;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw inner highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.glowColor;
        ctx.globalAlpha = 0.3 * this.pulseIntensity;
        ctx.fillRect(
            this.x + 4, 
            this.y + 4, 
            this.width - 8, 
            this.height - 8
        );
        
        // Draw cyberpunk-style details
        this.renderDetails(ctx);
        
        ctx.restore();
    }
    
    /**
     * Render additional visual details for cyberpunk aesthetic
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderDetails(ctx) {
        // Draw energy lines
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6 * this.pulseIntensity;
        
        // Vertical energy lines
        for (let i = 0; i < 3; i++) {
            const lineX = this.x + (this.width / 4) * (i + 1);
            ctx.beginPath();
            ctx.moveTo(lineX, this.y + 10);
            ctx.lineTo(lineX, this.y + this.height - 10);
            ctx.stroke();
        }
        
        // Horizontal energy line
        const centerY = this.y + this.height / 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 8, centerY);
        ctx.lineTo(this.x + this.width - 8, centerY);
        ctx.stroke();
        
        // Draw corner accents
        ctx.fillStyle = GAME_CONFIG.COLORS.MAGENTA;
        ctx.globalAlpha = 0.8 * this.pulseIntensity;
        
        const accentSize = 4;
        // Top-left corner
        ctx.fillRect(this.x, this.y, accentSize, accentSize);
        // Top-right corner
        ctx.fillRect(this.x + this.width - accentSize, this.y, accentSize, accentSize);
        // Bottom-left corner
        ctx.fillRect(this.x, this.y + this.height - accentSize, accentSize, accentSize);
        // Bottom-right corner
        ctx.fillRect(this.x + this.width - accentSize, this.y + this.height - accentSize, accentSize, accentSize);
    }
    
    /**
     * Get collision bounds for the player
     * @returns {Object} - Collision rectangle {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Check collision with another object
     * @param {Object} other - Other object with getBounds() method or bounds object
     * @returns {boolean} - True if collision detected
     */
    checkCollision(other) {
        const otherBounds = typeof other.getBounds === 'function' ? other.getBounds() : other;
        return checkCollision(this.getBounds(), otherBounds);
    }
    
    /**
     * Reset player to initial state
     */
    reset() {
        this.x = GAME_CONFIG.PLAYER_X;
        this.y = GAME_CONFIG.PLAYER_Y;
        this.speed = this.baseSpeed;
        this.animationTime = 0;
        this.pulseIntensity = 1.0;
        this.isActive = true;
    }
    
    /**
     * Set player active state
     * @param {boolean} active - Whether player is active
     */
    setActive(active) {
        this.isActive = active;
    }
    
    /**
     * Get player center position
     * @returns {Object} - Center position {x, y}
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    /**
     * Set player speed (for time power effects)
     * @param {number} speed - New speed value
     */
    setSpeed(speed) {
        this.speed = speed;
    }
    
    /**
     * Get current player speed
     * @returns {number} - Current speed
     */
    getSpeed() {
        return this.speed;
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}