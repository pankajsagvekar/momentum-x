/**
 * Momentum X - Utility Functions and Constants
 * Shared functionality for the cyberpunk endless runner game with Three.js 3D support
 */

import * as THREE from 'three';

// Game Constants
const GAME_CONFIG = {
    // 3D Scene dimensions
    SCENE_WIDTH: 1200,
    SCENE_HEIGHT: 600,

    // 3D Lane system
    LANE_COUNT: 3,
    LANE_WIDTH: 4,
    LANE_POSITIONS: [-4, 0, 4], // Left, Center, Right lane X positions
    LANE_TRANSITION_SPEED: 0.3, // Seconds for lane transitions

    // 3D Player settings
    PLAYER_SIZE: 1,
    PLAYER_HEIGHT: 2,
    PLAYER_START_Z: -5, // Starting Z position (behind camera)
    PLAYER_FORWARD_SPEED: 20, // Units per second forward movement
    PLAYER_JUMP_HEIGHT: 3,
    PLAYER_JUMP_DURATION: 0.8, // Seconds
    PLAYER_SLIDE_DURATION: 0.6, // Seconds

    // 3D Obstacle settings
    OBSTACLE_SPAWN_DISTANCE: 50, // Distance ahead to spawn obstacles
    OBSTACLE_DESPAWN_DISTANCE: -10, // Distance behind to remove obstacles
    OBSTACLE_SPAWN_RATE: 1500, // milliseconds
    OBSTACLE_MIN_GAP: 500, // minimum time between spawns
    OBSTACLE_HEIGHT: 2,
    OBSTACLE_WIDTH: 1.5,
    OBSTACLE_DEPTH: 1.5,

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
    DIFFICULTY_SPEED_INCREASE: 0.2, // 20% speed increase per level
    DIFFICULTY_SPAWN_DECREASE: 150, // Decrease spawn interval by 150ms per level
    DIFFICULTY_MIN_SPAWN_INTERVAL: 500, // Minimum 0.5 seconds between spawns

    // 3D Camera settings
    CAMERA_FOV: 75,
    CAMERA_NEAR: 0.1,
    CAMERA_FAR: 1000,
    CAMERA_POSITION: { x: 0, y: 3, z: 8 },
    CAMERA_FOLLOW_SPEED: 5, // Speed of camera following player lane changes

    // 3D Environment settings
    ENVIRONMENT_SCROLL_SPEED: 20, // Units per second
    BUILDING_COUNT: 20,
    BUILDING_SPACING: 10,
    NEON_LIGHT_COUNT: 15,

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
 * 3D Utility Functions for Three.js
 */

/**
 * Create a basic 3D box geometry with cyberpunk materials
 * @param {number} width - Box width
 * @param {number} height - Box height  
 * @param {number} depth - Box depth
 * @param {number} color - Hex color
 * @returns {THREE.Mesh} - Three.js mesh object
 */
function create3DBox(width, height, depth, color = 0x00ffff) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2,
        shininess: 100
    });
    return new THREE.Mesh(geometry, material);
}

/**
 * Create cyberpunk-styled neon material
 * @param {number} color - Hex color
 * @param {number} intensity - Emissive intensity (0-1)
 * @returns {THREE.MeshPhongMaterial} - Neon material
 */
function createNeonMaterial(color = 0x00ffff, intensity = 0.5) {
    return new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: intensity,
        shininess: 100,
        transparent: true,
        opacity: 0.8
    });
}

/**
 * Get lane position in 3D space
 * @param {number} laneIndex - Lane index (0, 1, 2)
 * @returns {number} - X position for the lane
 */
function getLanePosition(laneIndex) {
    return GAME_CONFIG.LANE_POSITIONS[clamp(laneIndex, 0, GAME_CONFIG.LANE_COUNT - 1)];
}

/**
 * Check 3D collision between two objects using bounding boxes
 * @param {THREE.Object3D} obj1 - First 3D object
 * @param {THREE.Object3D} obj2 - Second 3D object
 * @param {Object} size1 - Size of first object {width, height, depth}
 * @param {Object} size2 - Size of second object {width, height, depth}
 * @returns {boolean} - True if collision detected
 */
function check3DCollision(obj1, obj2, size1, size2) {
    const pos1 = obj1.position;
    const pos2 = obj2.position;

    return Math.abs(pos1.x - pos2.x) < (size1.width + size2.width) / 2 &&
        Math.abs(pos1.y - pos2.y) < (size1.height + size2.height) / 2 &&
        Math.abs(pos1.z - pos2.z) < (size1.depth + size2.depth) / 2;
}

/**
 * Smooth interpolation for 3D positions
 * @param {THREE.Vector3} current - Current position
 * @param {THREE.Vector3} target - Target position
 * @param {number} speed - Interpolation speed
 * @param {number} deltaTime - Time since last update
 */
function smoothMove3D(current, target, speed, deltaTime) {
    const factor = Math.min(1, speed * deltaTime);
    current.lerp(target, factor);
}

/**
 * Create basic cyberpunk lighting setup
 * @param {THREE.Scene} scene - Three.js scene
 */
function setupCyberpunkLighting(scene) {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Main directional light (moonlight effect)
    const directionalLight = new THREE.DirectionalLight(0x8080ff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Cyan accent light from the left
    const leftLight = new THREE.PointLight(0x00ffff, 1, 50);
    leftLight.position.set(-20, 10, 0);
    scene.add(leftLight);

    // Magenta accent light from the right
    const rightLight = new THREE.PointLight(0xff0080, 1, 50);
    rightLight.position.set(20, 10, 0);
    scene.add(rightLight);

    return { ambientLight, directionalLight, leftLight, rightLight };
}

/**
 * Create a simple 3D ground plane
 * @param {number} width - Ground width
 * @param {number} depth - Ground depth
 * @returns {THREE.Mesh} - Ground mesh
 */
function createGround(width = 100, depth = 200) {
    const geometry = new THREE.PlaneGeometry(width, depth);
    const material = new THREE.MeshPhongMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.8
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -1;
    return ground;
}

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = 0;
        this.lastFpsUpdate = 0;
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

// Export for ES modules
export {
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
    PerformanceMonitor,
    create3DBox,
    createNeonMaterial,
    getLanePosition,
    check3DCollision,
    smoothMove3D,
    setupCyberpunkLighting,
    createGround
};