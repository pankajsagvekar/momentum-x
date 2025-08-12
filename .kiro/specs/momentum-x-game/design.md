# Design Document

## Overview

Momentum X is implemented as a single-page HTML5 Canvas application using vanilla JavaScript with a modular architecture. The game employs a standard game loop pattern running at 60fps, with separate systems for player management, obstacle spawning/behavior, time power mechanics, scoring, and rendering. The design emphasizes performance optimization, clean separation of concerns, and extensibility for future enhancements.

## Architecture

### Core Game Loop
The main game loop follows the standard pattern:
1. **Input Processing** - Handle keyboard events for time powers and game controls
2. **Update Logic** - Update game state, physics, timers, and object positions
3. **Rendering** - Draw all visual elements to the canvas
4. **Frame Timing** - Use `requestAnimationFrame` for consistent 60fps performance

### Module Structure
```
src/
├── game.js          # Main game loop, state management, initialization
├── player.js        # Player object, movement, collision detection
├── obstacles.js     # Obstacle spawning, behavior, collision boundaries
├── powers.js        # Time manipulation system, cooldown management
└── utils.js         # Shared utilities, math helpers, constants
```

## Components and Interfaces

### Game Manager (game.js)
**Responsibilities:**
- Initialize canvas and game systems
- Manage game states (menu, playing, game over)
- Coordinate between all game systems
- Handle main game loop execution

**Key Methods:**
```javascript
class Game {
  init()                    // Initialize canvas, load assets, setup event listeners
  start()                   // Begin game loop
  update(deltaTime)         // Update all game systems
  render()                  // Draw all visual elements
  handleGameOver()          // Process end game state
  restart()                 // Reset game to initial state
}
```

### Player System (player.js)
**Responsibilities:**
- Player character position and movement
- Collision detection with obstacles
- Visual representation and animation

**Key Methods:**
```javascript
class Player {
  update(deltaTime)         // Update position based on game speed
  checkCollisions(obstacles) // Detect collisions with obstacle array
  render(ctx)               // Draw player sprite to canvas
  getBounds()               // Return collision boundary rectangle
}
```

### Obstacle System (obstacles.js)
**Responsibilities:**
- Procedural obstacle generation
- Obstacle movement and behavior
- Time-state-dependent speed modifications

**Key Methods:**
```javascript
class ObstacleManager {
  spawnObstacle()           // Create new obstacle based on difficulty
  updateObstacles(deltaTime, timeState) // Move obstacles, apply time effects
  removeOffscreenObstacles() // Clean up obstacles that have passed
  renderObstacles(ctx)      // Draw all active obstacles
}

class Obstacle {
  update(deltaTime, speedMultiplier) // Update position with time effects
  render(ctx)               // Draw obstacle sprite
  getBounds()               // Return collision boundary
}
```

### Time Powers System (powers.js)
**Responsibilities:**
- Manage three time manipulation abilities
- Handle cooldown timers and availability
- Apply time effects to game systems

**Key Methods:**
```javascript
class PowerManager {
  activateFreeze()          // Trigger freeze time effect
  activateSlow()            // Trigger slow time effect  
  activateSpeed()           // Trigger speed time effect
  update(deltaTime)         // Update cooldown timers
  getCurrentMultiplier()    // Return current time speed multiplier
  renderCooldowns(ctx)      // Draw cooldown bars in HUD
}
```

### Utility Functions (utils.js)
**Shared functionality:**
- Mathematical helpers (collision detection, random generation)
- Asset loading and management
- Performance monitoring utilities
- Constants and configuration values

## Data Models

### Game State
```javascript
const gameState = {
  isPlaying: boolean,
  score: number,
  timeElapsed: number,
  difficultyLevel: number,
  currentTimeState: 'normal' | 'frozen' | 'slow' | 'fast'
}
```

### Player Object
```javascript
const player = {
  x: number,
  y: number,
  width: number,
  height: number,
  speed: number,
  sprite: Image
}
```

### Obstacle Object
```javascript
const obstacle = {
  x: number,
  y: number,
  width: number,
  height: number,
  speed: number,
  type: 'spike' | 'debris' | 'laser',
  sprite: Image
}
```

### Power State
```javascript
const powerState = {
  freeze: { cooldown: number, duration: number, active: boolean },
  slow: { cooldown: number, duration: number, active: boolean },
  speed: { cooldown: number, duration: number, active: boolean }
}
```

## Rendering System

### Parallax Background
Three-layer parallax system with different scroll speeds:
- **Layer 1 (Skyline):** 0.2x game speed - distant cyberpunk skyline
- **Layer 2 (Buildings):** 0.5x game speed - mid-ground building silhouettes  
- **Layer 3 (Neon Signs):** 1.0x game speed - foreground neon advertisements

### HUD Elements
- **Score Display:** Top-left corner, large readable font
- **Power Cooldown Bars:** Top-right corner, three horizontal bars with:
  - Visual fill indicating remaining cooldown time
  - Color coding (red = on cooldown, green = ready)
  - Power icons (F, S, D) for identification

### Visual Effects
- **Time State Indicators:** Screen tint/overlay effects during power usage
- **Obstacle Highlighting:** Visual feedback when obstacles are affected by time powers
- **Smooth Animations:** Interpolated movement for all game objects

## Performance Optimization

### Frame Rate Management
- Use `requestAnimationFrame` for consistent timing
- Implement delta time calculations for frame-rate independent movement
- Monitor performance and adjust quality settings if needed

### Memory Management
- Object pooling for frequently created/destroyed obstacles
- Efficient sprite loading and caching
- Regular cleanup of off-screen objects

### Rendering Optimization
- Minimize canvas state changes
- Batch similar drawing operations
- Use efficient collision detection algorithms (AABB)

## Error Handling

### Input Validation
- Validate all user inputs before processing
- Handle edge cases in power activation (cooldown checks)
- Graceful degradation for unsupported browser features

### Asset Loading
- Implement fallback mechanisms for failed asset loads
- Provide placeholder graphics if sprites fail to load
- Handle network timeouts gracefully

### Game State Recovery
- Prevent invalid game states through careful state management
- Implement safeguards against infinite loops or crashes
- Provide clear error messages for debugging

## Testing Strategy

### Unit Testing
- Test individual game systems in isolation
- Validate collision detection accuracy
- Verify power cooldown calculations
- Test scoring system edge cases

### Integration Testing
- Test interaction between game systems
- Validate time power effects on obstacles
- Test difficulty scaling progression
- Verify HUD updates with game state changes

### Performance Testing
- Monitor frame rate consistency across different devices
- Test memory usage over extended play sessions
- Validate smooth gameplay during intensive scenarios
- Test browser compatibility (Chrome, Firefox, Safari, Edge)

### User Experience Testing
- Verify intuitive control responsiveness
- Test visual clarity of HUD elements
- Validate game balance and difficulty progression
- Ensure accessibility considerations are met

## Browser Compatibility

### Target Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Feature Requirements
- HTML5 Canvas support
- requestAnimationFrame API
- Keyboard event handling
- Local storage for potential future score persistence

### Fallback Strategies
- Graceful degradation for older browsers
- Alternative timing mechanisms if requestAnimationFrame unavailable
- Basic sprite rendering if advanced canvas features unsupported