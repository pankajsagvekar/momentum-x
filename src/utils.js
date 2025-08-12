/**
 * Momentum X - Utility Functions and Constants
 * Shared functionality for the cyberpunk endless runner game
 */

// Game Constants
const GAME_CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 600,
    
    // Player settings
    PLAYER_WIDTH: 40,
    PLAYER_HEIGHT: 60,
    PLAYER_X: 100, // Fixed position on left side
    PLAYER_Y: 480,
    PLAYER_SPEED: 300, // Not used for horizontal movement, kept for potential future use
    
    // Obstacle settings
    OBSTACLE_MIN_SPEED: 200,
    OBSTACLE_MAX_SPEED: 500,
    OBSTACLE_SPAWN_RATE: 1500, // milliseconds
    OBSTACLE_MIN_GAP: 500, // minimum time between spawns
    
    // Time power settings
    FREEZE_DURATION: 2000,
    FREEZE_COOLDOWN: 5000,
    SLOW_DURATION: 3000,
    SLOW_COOLDOWN: 4000,
    SPEED_DURATION: 1500,
    SPEED_COOLDOWN: 6000,
    
    // Scoring
    SCORE_PER_SECOND: 1,
    SCORE_PER_OBSTACLE: 5,
    
    // Difficulty scaling
    DIFFICULTY_INTERVAL: 20000, // 20 seconds
    DIFFICULTY_SPEED_INCREASE: 0.2,
    DIFFICULTY_SPAWN_DECREASE: 150,
    
    // Background parallax speeds
    PARALLAX_SKYLINE: 0.2,
    PARALLAX_BUILDINGS: 0.5,
    PARALLAX_NEON: 1.0,
    
    // Colors (cyberpunk theme)
    COLORS: {
        CYAN: '#00ffff',
        MAGENTA: '#ff0080',
        PURPLE: '#8000ff',
        GREEN: '#00ff00',
        RED: '#ff4444',
        WHITE: '#ffffff',
        BLACK: '#000000',
        DARK_BLUE: '#0f0f23'
    }
};

// Game States
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Time States
const TIME_STATES = {
    NORMAL: 'normal',
    FROZEN: 'frozen',
    SLOW: 'slow',
    FAST: 'fast'
};

// Obstacle Types
const OBSTACLE_TYPES = {
    SPIKE: 'spike',
    DEBRIS: 'debris',
    LASER: 'laser'
};

/**
 * Utility Functions
 */

/**
 * Check collision between two rectangular objects using AABB
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} - True if collision detected
 */
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Generate random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Convert milliseconds to seconds
 * @param {number} ms - Milliseconds
 * @returns {number} - Seconds
 */
function msToSeconds(ms) {
    return ms / 1000;
}

/**
 * Format time for display (MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Create a simple particle effect data structure
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Particle color
 * @param {number} life - Particle lifetime in ms
 * @returns {Object} - Particle object
 */
function createParticle(x, y, color, life = 1000) {
    return {
        x: x,
        y: y,
        vx: randomBetween(-100, 100),
        vy: randomBetween(-100, 100),
        color: color,
        life: life,
        maxLife: life,
        size: randomBetween(2, 6)
    };
}

/**
 * Update particle system
 * @param {Array} particles - Array of particle objects
 * @param {number} deltaTime - Time since last update in ms
 */
function updateParticles(particles, deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Update position
        particle.x += particle.vx * (deltaTime / 1000);
        particle.y += particle.vy * (deltaTime / 1000);
        
        // Update life
        particle.life -= deltaTime;
        
        // Remove dead particles
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

/**
 * Render particles to canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} particles - Array of particle objects
 */
function renderParticles(ctx, particles) {
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.frameTime = 0;
    }
    
    /**
     * Update performance metrics
     * @param {number} currentTime - Current timestamp
     */
    update(currentTime) {
        this.frameCount++;
        this.frameTime = currentTime - this.lastTime;
        
        // Calculate FPS every second
        if (currentTime - this.lastFpsUpdate > 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
        
        this.lastTime = currentTime;
    }
    
    /**
     * Get current FPS
     * @returns {number} - Frames per second
     */
    getFPS() {
        return this.fps;
    }
    
    /**
     * Get frame time in milliseconds
     * @returns {number} - Frame time
     */
    getFrameTime() {
        return this.frameTime;
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_CONFIG,
        GAME_STATES,
        TIME_STATES,
        OBSTACLE_TYPES,
        checkCollision,
        randomBetween,
        randomIntBetween,
        clamp,
        lerp,
        msToSeconds,
        formatTime,
        createParticle,
        updateParticles,
        renderParticles,
        PerformanceMonitor
    };
}