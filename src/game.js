/**
 * Momentum X - Main Game Class
 * Core game loop, state management, and system coordination with Three.js 3D rendering
 */

import * as THREE from 'three';
import { Scene } from './scene.js';
import { Player } from './player.js';
import { ObstacleManager } from './obstacles.js';
import { PowerManager } from './powers.js';
import { 
    GAME_CONFIG, 
    GAME_STATES, 
    TIME_STATES, 
    PerformanceMonitor,
    formatTime,
    createParticle,
    updateParticles,
    randomBetween
} from './utils.js';

class Game {
    constructor() {
        // Scene management
        this.sceneManager = null;
        this.container = null;
        
        // Game state
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.timeElapsed = 0;
        this.difficultyLevel = 0;
        this.isRunning = false;
        
        // Game systems (will be initialized later)
        this.player = null;
        this.obstacleManager = null;
        this.powerManager = null;
        
        // Timing for frame-rate independent movement
        this.lastTime = 0;
        this.deltaTime = 0;
        this.performanceMonitor = new PerformanceMonitor();
        
        // Input handling
        this.keys = {};
        this.keyPressed = {};
        
        // UI elements
        this.scoreElement = null;
        this.menuScreen = null;
        this.gameOverScreen = null;
        this.finalScoreElement = null;
        
        // 3D Particle system
        this.particles = [];
        
        // Bind methods to maintain context
        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }
    
    /**
     * Initialize the game - setup Three.js scene, load assets, create game systems
     * Requirement 1.2: Game starts from main menu
     * Requirement 9.6: Consistent 60fps performance in modern browsers
     */
    init() {
        console.log('Initializing Momentum X with Three.js...');
        
        // Get container element
        this.container = document.getElementById('gameCanvas');
        
        if (!this.container) {
            console.error('Failed to get game container');
            return false;
        }
        
        // Initialize scene manager
        this.sceneManager = new Scene();
        if (!this.sceneManager.init(this.container)) {
            console.error('Failed to initialize scene manager');
            return false;
        }
        
        // Get UI elements
        this.scoreElement = document.getElementById('score');
        this.menuScreen = document.getElementById('menuScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup window resize handler
        this.setupResizeHandler();
        
        // Initialize game systems (placeholder for now)
        this.initializeGameSystems();
        
        console.log('Game initialized successfully with Three.js');
        return true;
    }
    
    /**
     * Initialize game systems (player, obstacles, powers)
     */
    initializeGameSystems() {
        // Initialize player (placeholder - will be implemented in task 3)
        this.player = new Player();
        
        // Initialize obstacle manager (placeholder - will be implemented in task 4)
        this.obstacleManager = new ObstacleManager();
        
        // Initialize power manager (placeholder - will be implemented in task 6)
        this.powerManager = new PowerManager();
        
        console.log('Game systems initialized (placeholders)');
    }
    
    /**
     * Setup keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['Space', 'KeyF', 'KeyQ', 'KeyE', 'KeyR', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * Setup window resize handler for responsive 3D rendering
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            if (this.sceneManager) {
                const width = window.innerWidth;
                const height = window.innerHeight;
                this.sceneManager.resize(width, height);
            }
        });
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        this.keys[event.code] = true;
        
        // Handle single key presses
        if (!this.keyPressed[event.code]) {
            this.keyPressed[event.code] = true;
            this.handleKeyPress(event.code);
        }
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        this.keys[event.code] = false;
        this.keyPressed[event.code] = false;
    }
    
    /**
     * Handle single key press events
     * @param {string} keyCode - Key code
     */
    handleKeyPress(keyCode) {
        switch (keyCode) {
            case 'Space':
                if (this.state === GAME_STATES.MENU) {
                    this.start();
                }
                break;
                
            case 'KeyR':
                if (this.state === GAME_STATES.GAME_OVER) {
                    this.restart();
                }
                break;
                
            case 'KeyF':
                if (this.state === GAME_STATES.PLAYING && this.powerManager) {
                    this.powerManager.activateFreeze();
                }
                break;
                
            case 'KeyQ':
                if (this.state === GAME_STATES.PLAYING && this.powerManager) {
                    this.powerManager.activateSlow();
                }
                break;
                
            case 'KeyE':
                if (this.state === GAME_STATES.PLAYING && this.powerManager) {
                    this.powerManager.activateSpeed();
                }
                break;
        }
    }
    

    
    /**
     * Start the game
     * Requirement 1.2: Game starts when player presses Space
     */
    start() {
        console.log('Starting game...');
        
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.timeElapsed = 0;
        this.difficultyLevel = 0;
        
        // Hide menu, show game
        this.menuScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        // Start game loop if not already running
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        }
        
        this.updateUI();
    }
    
    /**
     * Main game loop optimized for 3D rendering at 60fps
     * Requirement 9.6: Consistent 60fps performance
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time for frame-rate independent movement
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update performance monitor
        this.performanceMonitor.update(currentTime);
        
        // Update game systems
        this.update(this.deltaTime);
        
        // Render 3D scene
        this.render();
        
        // Continue loop using requestAnimationFrame for optimal 3D performance
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update all game systems with frame-rate independent movement
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        // Convert deltaTime to seconds for frame-rate independent calculations
        const deltaSeconds = deltaTime / 1000;
        
        // Update time elapsed
        this.timeElapsed += deltaTime;
        
        // Update difficulty
        this.updateDifficulty();
        
        // Update score (time-based)
        this.updateScore(deltaTime);
        
        // Update particles
        updateParticles(this.particles, deltaTime);
        
        // Get current time multiplier for applying time effects
        const timeMultiplier = this.powerManager ? this.powerManager.getCurrentMultiplier() : 1.0;
        const timeState = this.powerManager ? this.powerManager.getCurrentTimeState() : TIME_STATES.NORMAL;
        
        // Update 3D scene environment
        if (this.sceneManager) {
            this.sceneManager.updateEnvironment(deltaSeconds, timeMultiplier);
            this.sceneManager.applyTimeEffects(timeState);
            
            // Update camera to follow player (placeholder target for now)
            const playerTargetX = this.player ? this.player.getCurrentLanePosition() : 0;
            this.sceneManager.updateCamera(deltaSeconds, playerTargetX);
        }
        
        // Update power manager first to get current time multiplier
        if (this.powerManager) {
            this.powerManager.update(deltaTime);
        }
        
        // Update game systems with time effects
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        if (this.obstacleManager) {
            // Apply time effects to obstacle movement
            this.obstacleManager.update(deltaTime, this.timeElapsed, this.difficultyLevel, timeMultiplier);
            
            // Check for collisions using AABB collision detection
            if (this.player) {
                const collidedObstacle = this.obstacleManager.checkCollisions(this.player);
                if (collidedObstacle) {
                    // Add visual feedback for collision
                    this.createCollisionEffect(collidedObstacle);
                    
                    // Immediate game over on collision detection
                    this.handleGameOver();
                    return;
                }
                
                // Check for obstacles passed (for scoring)
                const obstaclesPassed = this.obstacleManager.checkObstaclesPassed(this.player.x);
                if (obstaclesPassed > 0) {
                    // Apply score multiplier during speed power (double score rate)
                    const scoreMultiplier = timeState === TIME_STATES.FAST ? 2.0 : 1.0;
                    this.score += obstaclesPassed * GAME_CONFIG.SCORE_PER_OBSTACLE * scoreMultiplier;
                    console.log(`Player passed ${obstaclesPassed} obstacles! Score: ${Math.floor(this.score)} (${scoreMultiplier}x multiplier)`);
                }
            }
        }
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Update difficulty based on time elapsed
     * Requirement 5.1: Difficulty increases every 20 seconds
     * Requirement 5.4: Maintain smooth 60fps performance during transitions
     */
    updateDifficulty() {
        const newDifficultyLevel = Math.floor(this.timeElapsed / GAME_CONFIG.DIFFICULTY_INTERVAL);
        
        if (newDifficultyLevel > this.difficultyLevel) {
            const previousLevel = this.difficultyLevel;
            this.difficultyLevel = newDifficultyLevel;
            
            // Log difficulty progression with detailed information
            console.log(`Difficulty increased from level ${previousLevel} to ${this.difficultyLevel}`);
            console.log(`Time elapsed: ${formatTime(this.timeElapsed / 1000)}`);
            
            // Monitor performance during difficulty transition
            const frameTimeBefore = this.performanceMonitor.getFrameTime();
            
            // Update obstacle manager with new difficulty
            if (this.obstacleManager) {
                this.obstacleManager.updateDifficultyScaling(this.difficultyLevel);
            }
            
            // Create visual feedback for difficulty increase
            this.createDifficultyTransitionEffect();
            
            // Monitor performance after transition
            const frameTimeAfter = this.performanceMonitor.getFrameTime();
            
            // Log performance impact (requirement 5.4)
            if (frameTimeAfter > frameTimeBefore * 1.2) {
                console.warn(`Performance impact detected during difficulty transition: ${frameTimeBefore.toFixed(2)}ms -> ${frameTimeAfter.toFixed(2)}ms`);
            } else {
                console.log(`Smooth difficulty transition maintained: ${frameTimeBefore.toFixed(2)}ms -> ${frameTimeAfter.toFixed(2)}ms`);
            }
        }
    }
    
    /**
     * Create visual effects for difficulty level transitions
     */
    createDifficultyTransitionEffect() {
        // Create particle burst effect at screen center
        for (let i = 0; i < 15; i++) {
            this.particles.push(createParticle(
                GAME_CONFIG.SCENE_WIDTH / 2 + randomBetween(-50, 50),
                GAME_CONFIG.SCENE_HEIGHT / 2 + randomBetween(-50, 50),
                GAME_CONFIG.COLORS.MAGENTA,
                2500
            ));
        }
        
        // Create additional warning particles
        for (let i = 0; i < 8; i++) {
            this.particles.push(createParticle(
                randomBetween(100, GAME_CONFIG.SCENE_WIDTH - 100),
                randomBetween(100, GAME_CONFIG.SCENE_HEIGHT - 100),
                GAME_CONFIG.COLORS.RED,
                1800
            ));
        }
    }
    
    /**
     * Update score based on time
     * @param {number} deltaTime - Time since last update
     */
    updateScore(deltaTime) {
        // Apply score multiplier during speed power (double score rate)
        const scoreMultiplier = this.powerManager && this.powerManager.getCurrentTimeState() === TIME_STATES.FAST ? 2.0 : 1.0;
        
        // Add time-based score with multiplier
        const timeScore = (deltaTime / 1000) * GAME_CONFIG.SCORE_PER_SECOND * scoreMultiplier;
        this.score += timeScore;
    }
    

    
    /**
     * Render all game elements using Three.js
     * Requirement 6.4: Maintain 60fps performance using Three.js optimization
     */
    render() {
        if (!this.sceneManager) return;
        
        // Render 3D scene using scene manager
        this.sceneManager.render();
        
        // Render debug info in development (overlay on canvas)
        if (window.location.hostname === 'localhost') {
            this.renderDebugInfo();
        }
    }
    

    
    /**
     * Render debug information (overlay on Three.js canvas)
     */
    renderDebugInfo() {
        // Create or update debug overlay
        let debugOverlay = document.getElementById('debugOverlay');
        if (!debugOverlay) {
            debugOverlay = document.createElement('div');
            debugOverlay.id = 'debugOverlay';
            debugOverlay.style.position = 'absolute';
            debugOverlay.style.top = '10px';
            debugOverlay.style.left = '10px';
            debugOverlay.style.color = 'white';
            debugOverlay.style.fontFamily = 'monospace';
            debugOverlay.style.fontSize = '12px';
            debugOverlay.style.pointerEvents = 'none';
            debugOverlay.style.zIndex = '100';
            debugOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
            debugOverlay.style.padding = '10px';
            debugOverlay.style.borderRadius = '5px';
            this.container.appendChild(debugOverlay);
        }
        
        const obstacleStats = this.obstacleManager ? this.obstacleManager.getStats() : {};
        const debugInfo = [
            `FPS: ${this.performanceMonitor.getFPS()}`,
            `Frame Time: ${this.performanceMonitor.getFrameTime().toFixed(2)}ms`,
            `State: ${this.state}`,
            `Score: ${Math.floor(this.score)}`,
            `Time: ${formatTime(this.timeElapsed / 1000)}`,
            `Difficulty: ${this.difficultyLevel}`,
            `Spawn Rate: ${obstacleStats.spawnRate || 0}ms`,
            `Speed Mult: ${obstacleStats.currentSpeedMultiplier ? obstacleStats.currentSpeedMultiplier.toFixed(2) : 1.0}x`,
            `Particles: ${this.particles.length}`,
            `Obstacles: ${this.obstacleManager ? this.obstacleManager.getObstacleCount() : 0}`,
            `Camera: (${this.sceneManager ? this.sceneManager.getCamera().position.x.toFixed(1) : 0}, ${this.sceneManager ? this.sceneManager.getCamera().position.y.toFixed(1) : 0}, ${this.sceneManager ? this.sceneManager.getCamera().position.z.toFixed(1) : 0})`
        ];
        
        debugOverlay.innerHTML = debugInfo.join('<br>');
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${Math.floor(this.score)}`;
        }
    }
    
    /**
     * Create visual feedback for collision events
     * @param {Object} obstacle - The obstacle that was collided with
     */
    createCollisionEffect(obstacle) {
        const playerCenter = this.player.getCenter();
        const obstacleCenter = obstacle.getCenter();
        
        // Create explosion particles at collision point
        const collisionX = (playerCenter.x + obstacleCenter.x) / 2;
        const collisionY = (playerCenter.y + obstacleCenter.y) / 2;
        
        // Create intense particle explosion
        for (let i = 0; i < 30; i++) {
            this.particles.push(createParticle(
                collisionX,
                collisionY,
                Math.random() > 0.5 ? GAME_CONFIG.COLORS.RED : GAME_CONFIG.COLORS.WHITE,
                2000
            ));
        }
        
        // Create additional particles around player
        for (let i = 0; i < 20; i++) {
            this.particles.push(createParticle(
                playerCenter.x + randomBetween(-30, 30),
                playerCenter.y + randomBetween(-30, 30),
                GAME_CONFIG.COLORS.MAGENTA,
                1500
            ));
        }
        
        console.log('Collision detected! Creating visual feedback.');
    }
    
    /**
     * Handle game over
     */
    handleGameOver() {
        console.log('Game Over! Final Score:', Math.floor(this.score));
        
        this.state = GAME_STATES.GAME_OVER;
        
        // Show game over screen
        this.gameOverScreen.classList.remove('hidden');
        
        // Update final score
        if (this.finalScoreElement) {
            this.finalScoreElement.textContent = `Final Score: ${Math.floor(this.score)}`;
        }
        
        // Create explosion particles
        for (let i = 0; i < 50; i++) {
            this.particles.push(createParticle(
                GAME_CONFIG.SCENE_WIDTH / 2,
                GAME_CONFIG.SCENE_HEIGHT / 2,
                Math.random() > 0.5 ? GAME_CONFIG.COLORS.MAGENTA : GAME_CONFIG.COLORS.CYAN,
                3000
            ));
        }
    }
    
    /**
     * Restart the game
     */
    restart() {
        console.log('Restarting game...');
        
        // Reset game state
        this.score = 0;
        this.timeElapsed = 0;
        this.difficultyLevel = 0;
        this.particles = [];
        
        // Reset 3D environment
        if (this.sceneManager) {
            this.sceneManager.initializeEnvironment();
        }
        
        // Reset game systems
        if (this.player) {
            this.player.reset();
        }
        
        if (this.obstacleManager) {
            this.obstacleManager.reset();
        }
        
        if (this.powerManager) {
            this.powerManager.reset();
        }
        
        // Start game
        this.start();
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Validate difficulty scaling implementation
     * Used for testing and verification of requirements
     */
    validateDifficultyScaling() {
        const obstacleStats = this.obstacleManager ? this.obstacleManager.getStats() : {};
        const validation = {
            difficultyLevel: this.difficultyLevel,
            timeElapsed: this.timeElapsed,
            expectedDifficulty: Math.floor(this.timeElapsed / GAME_CONFIG.DIFFICULTY_INTERVAL),
            spawnRate: obstacleStats.spawnRate,
            minSpawnRateRespected: obstacleStats.spawnRate >= GAME_CONFIG.DIFFICULTY_MIN_SPAWN_INTERVAL,
            speedMultiplier: obstacleStats.currentSpeedMultiplier,
            expectedSpeedMultiplier: 1.0 + (this.difficultyLevel * GAME_CONFIG.DIFFICULTY_SPEED_INCREASE),
            fps: this.performanceMonitor.getFPS(),
            performanceAcceptable: this.performanceMonitor.getFPS() >= 50 // Allow some tolerance below 60fps
        };
        
        // Log validation results
        console.log('Difficulty Scaling Validation:', validation);
        
        return validation;
    }
    
    /**
     * Get current game state
     * @returns {Object} - Current game state
     */
    getState() {
        return {
            state: this.state,
            score: this.score,
            timeElapsed: this.timeElapsed,
            difficultyLevel: this.difficultyLevel,
            isRunning: this.isRunning,
            difficultyScaling: this.validateDifficultyScaling()
        };
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    if (game.init()) {
        console.log('Momentum X ready to play!');
        
        // Make game globally accessible for debugging
        window.game = game;
    } else {
        console.error('Failed to initialize game');
    }
});

// Export the Game class
export { Game };