/**
 * Momentum X - Main Game Class
 * Core game loop, state management, and system coordination
 */

class Game {
    constructor() {
        // Canvas and context
        this.canvas = null;
        this.ctx = null;
        
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
        
        // Timing
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
        
        // Background layers for parallax
        this.backgroundLayers = [];
        
        // Particle system
        this.particles = [];
        
        // Bind methods to maintain context
        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }
    
    /**
     * Initialize the game - setup canvas, load assets, create game systems
     */
    init() {
        console.log('Initializing Momentum X...');
        
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            console.error('Failed to get canvas or context');
            return false;
        }
        
        // Get UI elements
        this.scoreElement = document.getElementById('score');
        this.menuScreen = document.getElementById('menuScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize background layers
        this.initializeBackground();
        
        // Initialize game systems (placeholder for now)
        this.initializeGameSystems();
        
        console.log('Game initialized successfully');
        return true;
    }
    
    /**
     * Setup keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['Space', 'KeyF', 'KeyS', 'KeyD', 'KeyR'].includes(e.code)) {
                e.preventDefault();
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
                    this.startGame();
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
                
            case 'KeyS':
                if (this.state === GAME_STATES.PLAYING && this.powerManager) {
                    this.powerManager.activateSlow();
                }
                break;
                
            case 'KeyD':
                if (this.state === GAME_STATES.PLAYING && this.powerManager) {
                    this.powerManager.activateSpeed();
                }
                break;
        }
    }
    
    /**
     * Initialize background layers for parallax effect
     */
    initializeBackground() {
        this.backgroundLayers = [
            {
                name: 'skyline',
                x: 0,
                speed: GAME_CONFIG.PARALLAX_SKYLINE,
                color: GAME_CONFIG.COLORS.DARK_BLUE
            },
            {
                name: 'buildings',
                x: 0,
                speed: GAME_CONFIG.PARALLAX_BUILDINGS,
                color: GAME_CONFIG.COLORS.PURPLE
            },
            {
                name: 'neon',
                x: 0,
                speed: GAME_CONFIG.PARALLAX_NEON,
                color: GAME_CONFIG.COLORS.CYAN
            }
        ];
    }
    
    /**
     * Initialize game systems
     */
    initializeGameSystems() {
        // Initialize player
        this.player = new Player();
        
        // Initialize obstacle manager
        this.obstacleManager = new ObstacleManager();
        
        // Other systems will be initialized in later tasks
        // this.powerManager = new PowerManager();
        
        console.log('Game systems initialized');
    }
    
    /**
     * Start the game
     */
    startGame() {
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
     * Main game loop
     * @param {number} currentTime - Current timestamp
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update performance monitor
        this.performanceMonitor.update(currentTime);
        
        // Update game systems
        this.update(this.deltaTime);
        
        // Render everything
        this.render();
        
        // Continue loop
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update all game systems
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        // Update time elapsed
        this.timeElapsed += deltaTime;
        
        // Update difficulty
        this.updateDifficulty();
        
        // Update score (time-based)
        this.updateScore(deltaTime);
        
        // Update background
        this.updateBackground(deltaTime);
        
        // Update particles
        updateParticles(this.particles, deltaTime);
        
        // Update game systems
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        if (this.obstacleManager) {
            this.obstacleManager.update(deltaTime, this.timeElapsed, this.difficultyLevel);
            
            // Check for collisions using AABB collision detection
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
                this.score += obstaclesPassed * GAME_CONFIG.SCORE_PER_OBSTACLE;
                console.log(`Player passed ${obstaclesPassed} obstacles! Score: ${Math.floor(this.score)}`);
            }
        }
        
        // this.powerManager.update(deltaTime);
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Update difficulty based on time elapsed
     */
    updateDifficulty() {
        const newDifficultyLevel = Math.floor(this.timeElapsed / GAME_CONFIG.DIFFICULTY_INTERVAL);
        
        if (newDifficultyLevel > this.difficultyLevel) {
            this.difficultyLevel = newDifficultyLevel;
            console.log(`Difficulty increased to level ${this.difficultyLevel}`);
            
            // Create particle effect for difficulty increase
            for (let i = 0; i < 10; i++) {
                this.particles.push(createParticle(
                    this.canvas.width / 2,
                    this.canvas.height / 2,
                    GAME_CONFIG.COLORS.MAGENTA,
                    2000
                ));
            }
        }
    }
    
    /**
     * Update score based on time
     * @param {number} deltaTime - Time since last update
     */
    updateScore(deltaTime) {
        // Add time-based score
        const timeScore = (deltaTime / 1000) * GAME_CONFIG.SCORE_PER_SECOND;
        this.score += timeScore;
    }
    
    /**
     * Update background parallax layers
     * @param {number} deltaTime - Time since last update
     */
    updateBackground(deltaTime) {
        const baseSpeed = 100; // Base scrolling speed
        
        this.backgroundLayers.forEach(layer => {
            layer.x -= baseSpeed * layer.speed * (deltaTime / 1000);
            
            // Reset position when layer has scrolled completely
            if (layer.x <= -this.canvas.width) {
                layer.x = 0;
            }
        });
    }
    
    /**
     * Render all game elements
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background
        this.renderBackground();
        
        // Render game objects
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        if (this.obstacleManager) {
            this.obstacleManager.render(this.ctx);
        }
        
        // Render particles
        renderParticles(this.ctx, this.particles);
        
        // Render debug info in development
        if (window.location.hostname === 'localhost') {
            this.renderDebugInfo();
        }
    }
    
    /**
     * Render parallax background layers
     */
    renderBackground() {
        this.backgroundLayers.forEach((layer, index) => {
            this.ctx.save();
            
            // Set layer-specific styling
            this.ctx.fillStyle = layer.color;
            this.ctx.globalAlpha = 0.3 - (index * 0.1);
            
            // Draw simple geometric shapes for each layer
            const layerHeight = this.canvas.height / 3;
            const y = index * layerHeight;
            
            // Draw repeating pattern
            for (let x = layer.x; x < this.canvas.width + 200; x += 200) {
                this.drawLayerElement(x, y, layerHeight, layer.name);
            }
            
            this.ctx.restore();
        });
    }
    
    /**
     * Draw individual elements for background layers
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} height - Layer height
     * @param {string} layerName - Name of the layer
     */
    drawLayerElement(x, y, height, layerName) {
        switch (layerName) {
            case 'skyline':
                // Draw distant buildings
                this.ctx.fillRect(x, y + height - 50, 150, 50);
                this.ctx.fillRect(x + 50, y + height - 80, 100, 80);
                break;
                
            case 'buildings':
                // Draw mid-ground buildings
                this.ctx.fillRect(x, y + height - 100, 120, 100);
                this.ctx.fillRect(x + 80, y + height - 150, 80, 150);
                break;
                
            case 'neon':
                // Draw foreground neon signs
                this.ctx.fillRect(x, y + height - 20, 180, 20);
                this.ctx.fillRect(x + 20, y + height - 40, 20, 40);
                break;
        }
    }
    
    /**
     * Render debug information
     */
    renderDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = GAME_CONFIG.COLORS.WHITE;
        this.ctx.font = '12px monospace';
        
        const debugInfo = [
            `FPS: ${this.performanceMonitor.getFPS()}`,
            `Frame Time: ${this.performanceMonitor.getFrameTime().toFixed(2)}ms`,
            `State: ${this.state}`,
            `Score: ${Math.floor(this.score)}`,
            `Time: ${formatTime(this.timeElapsed / 1000)}`,
            `Difficulty: ${this.difficultyLevel}`,
            `Particles: ${this.particles.length}`,
            `Obstacles: ${this.obstacleManager ? this.obstacleManager.getObstacleCount() : 0}`
        ];
        
        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 10, this.canvas.height - 100 + (index * 15));
        });
        
        this.ctx.restore();
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
                this.canvas.width / 2,
                this.canvas.height / 2,
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
        
        // Reset background
        this.initializeBackground();
        
        // Reset game systems
        if (this.player) {
            this.player.reset();
        }
        
        if (this.obstacleManager) {
            this.obstacleManager.reset();
        }
        
        // this.powerManager.reset();
        
        // Start game
        this.startGame();
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
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
            isRunning: this.isRunning
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