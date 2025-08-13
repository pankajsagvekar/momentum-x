/**
 * Momentum X - Obstacle System
 * Obstacle spawning, management, and rendering for the cyberpunk endless runner
 */

/**
 * Individual Obstacle Class
 * Represents a single obstacle with position, movement, and rendering
 */
class Obstacle {
    constructor(x, y, type, speed = GAME_CONFIG.OBSTACLE_MIN_SPEED) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Set dimensions based on obstacle type
        this.setDimensionsByType();
        
        // Movement properties
        this.speed = speed;
        this.baseSpeed = speed;
        
        // Visual properties
        this.color = this.getColorByType();
        this.glowColor = GAME_CONFIG.COLORS.WHITE;
        
        // Animation properties
        this.animationTime = 0;
        this.pulseIntensity = 1.0;
        
        // State
        this.isActive = true;
        this.hasBeenPassed = false; // For scoring
    }
    
    /**
     * Set obstacle dimensions based on type
     */
    setDimensionsByType() {
        switch (this.type) {
            case OBSTACLE_TYPES.SPIKE:
                this.width = 30;
                this.height = 80;
                break;
            case OBSTACLE_TYPES.DEBRIS:
                this.width = 50;
                this.height = 50;
                break;
            case OBSTACLE_TYPES.LASER:
                this.width = 15;
                this.height = 120;
                break;
            default:
                this.width = 40;
                this.height = 60;
        }
    }
    
    /**
     * Get color based on obstacle type
     * @returns {string} - Color hex code
     */
    getColorByType() {
        switch (this.type) {
            case OBSTACLE_TYPES.SPIKE:
                return GAME_CONFIG.COLORS.RED;
            case OBSTACLE_TYPES.DEBRIS:
                return GAME_CONFIG.COLORS.PURPLE;
            case OBSTACLE_TYPES.LASER:
                return GAME_CONFIG.COLORS.MAGENTA;
            default:
                return GAME_CONFIG.COLORS.RED;
        }
    }
    
    /**
     * Update obstacle position and animation
     * @param {number} deltaTime - Time since last update in milliseconds
     * @param {number} speedMultiplier - Current game speed multiplier (from time powers)
     */
    update(deltaTime, speedMultiplier = 1.0) {
        if (!this.isActive) return;
        
        // Update animation time
        this.animationTime += deltaTime;
        
        // Calculate pulse effect based on obstacle type
        switch (this.type) {
            case OBSTACLE_TYPES.SPIKE:
                this.pulseIntensity = Math.sin(this.animationTime * 0.008) * 0.2 + 0.8;
                break;
            case OBSTACLE_TYPES.DEBRIS:
                this.pulseIntensity = Math.sin(this.animationTime * 0.005) * 0.3 + 0.7;
                break;
            case OBSTACLE_TYPES.LASER:
                this.pulseIntensity = Math.sin(this.animationTime * 0.012) * 0.4 + 0.6;
                break;
        }
        
        // Move obstacle left (towards player)
        const currentSpeed = this.speed * speedMultiplier;
        this.x -= currentSpeed * (deltaTime / 1000);
    }
    
    /**
     * Render the obstacle to the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (!this.isActive) return;
        
        ctx.save();
        
        // Apply glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8 * this.pulseIntensity;
        
        // Render based on obstacle type
        switch (this.type) {
            case OBSTACLE_TYPES.SPIKE:
                this.renderSpike(ctx);
                break;
            case OBSTACLE_TYPES.DEBRIS:
                this.renderDebris(ctx);
                break;
            case OBSTACLE_TYPES.LASER:
                this.renderLaser(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * Render spike obstacle (triangular spikes)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderSpike(ctx) {
        // Main spike body
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.pulseIntensity;
        
        // Draw triangular spike
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); // Top point
        ctx.lineTo(this.x, this.y + this.height); // Bottom left
        ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
        ctx.closePath();
        ctx.fill();
        
        // Draw inner highlight
        ctx.fillStyle = this.glowColor;
        ctx.globalAlpha = 0.3 * this.pulseIntensity;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 8);
        ctx.lineTo(this.x + 6, this.y + this.height - 8);
        ctx.lineTo(this.x + this.width - 6, this.y + this.height - 8);
        ctx.closePath();
        ctx.fill();
        
        // Draw energy lines
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6 * this.pulseIntensity;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 10);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 10);
        ctx.stroke();
    }
    
    /**
     * Render debris obstacle (rotating square)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderDebris(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate(this.animationTime * 0.003); // Slow rotation
        
        // Main debris body
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.pulseIntensity;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Inner highlight
        ctx.fillStyle = this.glowColor;
        ctx.globalAlpha = 0.3 * this.pulseIntensity;
        ctx.fillRect(-this.width / 2 + 6, -this.height / 2 + 6, this.width - 12, this.height - 12);
        
        // Draw corner accents
        ctx.fillStyle = GAME_CONFIG.COLORS.CYAN;
        ctx.globalAlpha = 0.8 * this.pulseIntensity;
        const accentSize = 6;
        
        // Four corners
        ctx.fillRect(-this.width / 2, -this.height / 2, accentSize, accentSize);
        ctx.fillRect(this.width / 2 - accentSize, -this.height / 2, accentSize, accentSize);
        ctx.fillRect(-this.width / 2, this.height / 2 - accentSize, accentSize, accentSize);
        ctx.fillRect(this.width / 2 - accentSize, this.height / 2 - accentSize, accentSize, accentSize);
    }
    
    /**
     * Render laser obstacle (vertical beam)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderLaser(ctx) {
        // Main laser beam
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.pulseIntensity;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Inner core
        ctx.fillStyle = this.glowColor;
        ctx.globalAlpha = 0.8 * this.pulseIntensity;
        ctx.fillRect(this.x + 4, this.y, this.width - 8, this.height);
        
        // Pulsing center line
        ctx.fillStyle = GAME_CONFIG.COLORS.CYAN;
        ctx.globalAlpha = this.pulseIntensity;
        ctx.fillRect(this.x + this.width / 2 - 1, this.y, 2, this.height);
        
        // Energy particles along the beam
        for (let i = 0; i < 5; i++) {
            const particleY = this.y + (this.height / 5) * i + (Math.sin(this.animationTime * 0.01 + i) * 10);
            ctx.fillStyle = GAME_CONFIG.COLORS.WHITE;
            ctx.globalAlpha = 0.6 * this.pulseIntensity;
            ctx.fillRect(this.x + this.width / 2 - 2, particleY, 4, 4);
        }
    }
    
    /**
     * Get collision bounds for the obstacle
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
     * Check if obstacle is off-screen (to the left)
     * @returns {boolean} - True if obstacle is off-screen
     */
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    /**
     * Check if player has passed this obstacle (for scoring)
     * @param {number} playerX - Player's X position
     * @returns {boolean} - True if player has passed
     */
    hasPlayerPassed(playerX) {
        // Player has "passed" an obstacle when the obstacle has moved past the player
        // Since obstacles move from right to left and player is stationary on the left,
        // we check if the obstacle's right edge has passed the player's position
        return !this.hasBeenPassed && this.x + this.width < playerX;
    }
    
    /**
     * Mark obstacle as passed by player
     */
    markAsPassed() {
        this.hasBeenPassed = true;
    }
    
    /**
     * Set obstacle active state
     * @param {boolean} active - Whether obstacle is active
     */
    setActive(active) {
        this.isActive = active;
    }
    
    /**
     * Get obstacle center position
     * @returns {Object} - Center position {x, y}
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
}

/**
 * Obstacle Manager Class
 * Handles spawning, updating, and managing all obstacles
 */
class ObstacleManager {
    constructor() {
        // Obstacle storage
        this.obstacles = [];
        
        // Spawning properties
        this.lastSpawnTime = 0;
        this.spawnRate = GAME_CONFIG.OBSTACLE_SPAWN_RATE;
        this.minSpawnGap = GAME_CONFIG.OBSTACLE_MIN_GAP;
        
        // Difficulty scaling
        this.difficultyLevel = 0;
        this.baseSpawnRate = GAME_CONFIG.OBSTACLE_SPAWN_RATE;
        this.baseSpeed = GAME_CONFIG.OBSTACLE_MIN_SPEED;
        
        // Statistics
        this.totalSpawned = 0;
        this.totalDestroyed = 0;
    }
    
    /**
     * Update all obstacles and handle spawning
     * @param {number} deltaTime - Time since last update in milliseconds
     * @param {number} timeElapsed - Total game time elapsed
     * @param {number} difficultyLevel - Current difficulty level
     * @param {number} speedMultiplier - Current game speed multiplier (from time powers)
     */
    update(deltaTime, timeElapsed, difficultyLevel, speedMultiplier = 1.0) {
        // Update difficulty level
        this.difficultyLevel = difficultyLevel;
        
        // Update spawn rate based on difficulty
        this.updateSpawnRate();
        
        // Spawn new obstacles
        this.handleSpawning(timeElapsed);
        
        // Update existing obstacles
        this.updateObstacles(deltaTime, speedMultiplier);
        
        // Remove off-screen obstacles
        this.removeOffscreenObstacles();
    }
    
    /**
     * Update spawn rate based on difficulty level
     */
    updateSpawnRate() {
        // Decrease spawn rate (spawn more frequently) as difficulty increases
        this.spawnRate = Math.max(
            this.minSpawnGap,
            this.baseSpawnRate - (this.difficultyLevel * GAME_CONFIG.DIFFICULTY_SPAWN_DECREASE)
        );
    }
    
    /**
     * Handle obstacle spawning logic
     * @param {number} timeElapsed - Total game time elapsed
     */
    handleSpawning(timeElapsed) {
        // Check if enough time has passed since last spawn
        if (timeElapsed - this.lastSpawnTime >= this.spawnRate) {
            this.spawnObstacle();
            this.lastSpawnTime = timeElapsed;
        }
    }
    
    /**
     * Spawn a new obstacle
     */
    spawnObstacle() {
        // Random obstacle type
        const obstacleTypes = Object.values(OBSTACLE_TYPES);
        const randomType = obstacleTypes[randomIntBetween(0, obstacleTypes.length - 1)];
        
        // Calculate spawn position
        const spawnX = GAME_CONFIG.CANVAS_WIDTH + 50; // Off-screen to the right
        const spawnY = this.getSpawnYForType(randomType);
        
        // Calculate speed based on difficulty
        const speed = this.baseSpeed + (this.difficultyLevel * GAME_CONFIG.DIFFICULTY_SPEED_INCREASE * this.baseSpeed);
        
        // Create and add obstacle
        const obstacle = new Obstacle(spawnX, spawnY, randomType, speed);
        this.obstacles.push(obstacle);
        this.totalSpawned++;
        
        console.log(`Spawned ${randomType} obstacle at difficulty level ${this.difficultyLevel}`);
    }
    
    /**
     * Get appropriate Y position for obstacle type
     * @param {string} type - Obstacle type
     * @returns {number} - Y position
     */
    getSpawnYForType(type) {
        const groundLevel = GAME_CONFIG.CANVAS_HEIGHT - 100; // Leave space at bottom
        
        switch (type) {
            case OBSTACLE_TYPES.SPIKE:
                // Spikes spawn on ground
                return groundLevel - 80;
                
            case OBSTACLE_TYPES.DEBRIS:
                // Debris can spawn at various heights
                return randomBetween(200, groundLevel - 50);
                
            case OBSTACLE_TYPES.LASER:
                // Lasers span from top to bottom, positioned to create gaps
                return randomBetween(100, groundLevel - 120);
                
            default:
                return groundLevel - 60;
        }
    }
    
    /**
     * Update all active obstacles
     * @param {number} deltaTime - Time since last update
     * @param {number} speedMultiplier - Current game speed multiplier
     */
    updateObstacles(deltaTime, speedMultiplier) {
        this.obstacles.forEach(obstacle => {
            obstacle.update(deltaTime, speedMultiplier);
        });
    }
    
    /**
     * Remove obstacles that have moved off-screen
     */
    removeOffscreenObstacles() {
        const initialCount = this.obstacles.length;
        
        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.isOffScreen()) {
                this.totalDestroyed++;
                return false;
            }
            return true;
        });
        
        const removedCount = initialCount - this.obstacles.length;
        if (removedCount > 0) {
            console.log(`Removed ${removedCount} off-screen obstacles`);
        }
    }
    
    /**
     * Render all obstacles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        this.obstacles.forEach(obstacle => {
            obstacle.render(ctx);
        });
    }
    
    /**
     * Check collisions with player using AABB collision detection
     * @param {Object} player - Player object with getBounds() method
     * @returns {Object|null} - Collided obstacle object or null if no collision
     */
    checkCollisions(player) {
        const playerBounds = player.getBounds();
        
        for (let obstacle of this.obstacles) {
            if (checkCollision(playerBounds, obstacle.getBounds())) {
                console.log(`Collision detected between player and ${obstacle.type} obstacle`);
                return obstacle;
            }
        }
        
        return null;
    }
    
    /**
     * Check for obstacles passed by player (for scoring)
     * @param {number} playerX - Player's X position
     * @returns {number} - Number of obstacles passed this frame
     */
    checkObstaclesPassed(playerX) {
        let passedCount = 0;
        
        this.obstacles.forEach(obstacle => {
            if (obstacle.hasPlayerPassed(playerX)) {
                obstacle.markAsPassed();
                passedCount++;
            }
        });
        
        return passedCount;
    }
    
    /**
     * Get all active obstacles
     * @returns {Array} - Array of obstacle objects
     */
    getObstacles() {
        return this.obstacles;
    }
    
    /**
     * Get obstacle count
     * @returns {number} - Number of active obstacles
     */
    getObstacleCount() {
        return this.obstacles.length;
    }
    
    /**
     * Reset obstacle manager to initial state
     */
    reset() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.spawnRate = this.baseSpawnRate;
        this.difficultyLevel = 0;
        this.totalSpawned = 0;
        this.totalDestroyed = 0;
        
        console.log('Obstacle manager reset');
    }
    
    /**
     * Get statistics about obstacle management
     * @returns {Object} - Statistics object
     */
    getStats() {
        return {
            active: this.obstacles.length,
            totalSpawned: this.totalSpawned,
            totalDestroyed: this.totalDestroyed,
            spawnRate: this.spawnRate,
            difficultyLevel: this.difficultyLevel
        };
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Obstacle, ObstacleManager };
}