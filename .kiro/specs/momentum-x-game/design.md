# Design Document

## Overview

Momentum X is implemented as a single-page HTML5 application using Three.js for 3D WebGL rendering and vanilla JavaScript with a modular architecture. The game employs a standard game loop pattern running at 60fps, with separate systems for 3D player management, obstacle spawning/behavior, time power mechanics, scoring, and 3D rendering. The design emphasizes performance optimization through WebGL acceleration, clean separation of concerns, and extensibility for future 3D enhancements.

## Architecture

### Core Game Loop
The main game loop follows the standard pattern with 3D rendering:
1. **Input Processing** - Handle keyboard events for lane switching, jumping, sliding, and time powers
2. **Update Logic** - Update 3D game state, physics, timers, and 3D object positions
3. **3D Rendering** - Render all 3D elements using Three.js WebGL renderer
4. **Frame Timing** - Use `requestAnimationFrame` for consistent 60fps performance

### 3D Architecture
The game uses a three-lane 3D perspective with:
- **Lane System** - Three parallel lanes at X positions: -4, 0, 4
- **Camera System** - Perspective camera following player lane changes smoothly
- **3D Environment** - Procedurally scrolling cyberpunk cityscape
- **WebGL Rendering** - Hardware-accelerated 3D graphics via Three.js

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
- Initialize Three.js scene, camera, and WebGL renderer
- Manage game states (menu, playing, game over)
- Coordinate between all 3D game systems
- Handle main game loop execution
- Manage 3D environment and lighting

**Key Methods:**
```javascript
class Game {
  init()                    // Initialize Three.js, load assets, setup event listeners
  initThreeJS()             // Create scene, camera, renderer, and lighting
  initialize3DEnvironment() // Setup 3D world, ground plane, lane markers
  start()                   // Begin game loop
  update(deltaTime)         // Update all 3D game systems
  updateCamera(deltaTime)   // Smooth camera following for lane changes
  update3DEnvironment(deltaTime) // Move 3D environment objects
  render()                  // Render 3D scene using Three.js
  handleGameOver()          // Process end game state
  restart()                 // Reset game to initial state
}
```

### Player System (player.js)
**Responsibilities:**
- 3D player character position and lane-based movement
- Lane switching with smooth transitions
- Jumping and sliding mechanics in 3D space
- 3D collision detection with obstacles
- 3D visual representation and animation

**Key Methods:**
```javascript
class Player {
  update(deltaTime)         // Update 3D position, lane transitions, jump/slide states
  switchLane(direction)     // Handle lane switching (-1 left, +1 right)
  jump()                    // Initiate jump with 3D arc trajectory
  slide()                   // Initiate slide with lowered collision box
  checkCollisions(obstacles) // Detect 3D collisions with obstacle array
  render(scene)             // Add/update 3D mesh in Three.js scene
  getCurrentLanePosition()  // Return current X position for camera following
  get3DBounds()             // Return 3D collision boundary box
}
```

### Obstacle System (obstacles.js)
**Responsibilities:**
- Procedural 3D obstacle generation across three lanes
- 3D obstacle movement and behavior
- Time-state-dependent speed modifications
- 3D obstacle types (barriers, spikes, lasers) with different heights

**Key Methods:**
```javascript
class ObstacleManager {
  spawnObstacle()           // Create new 3D obstacle in random lane based on difficulty
  updateObstacles(deltaTime, timeState) // Move 3D obstacles, apply time effects
  removeOffscreenObstacles() // Clean up obstacles that have passed camera
  renderObstacles(scene)    // Add/update 3D obstacle meshes in scene
}

class Obstacle {
  update(deltaTime, speedMultiplier) // Update 3D position with time effects
  render(scene)             // Add/update 3D mesh in Three.js scene
  get3DBounds()             // Return 3D collision boundary box
  getLane()                 // Return which lane (0, 1, 2) obstacle occupies
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
- 3D mathematical helpers (3D collision detection, lane positioning)
- Three.js helper functions (3D box creation, neon materials)
- 3D lighting setup and camera utilities
- Performance monitoring utilities
- 3D constants and configuration values (lane positions, camera settings)

**Key 3D Utilities:**
```javascript
create3DBox(width, height, depth, color)     // Create cyberpunk-styled 3D box
createNeonMaterial(color, intensity)         // Create glowing neon material
getLanePosition(laneIndex)                   // Get X position for lane
check3DCollision(obj1, obj2, size1, size2)   // 3D AABB collision detection
setupCyberpunkLighting(scene)                // Add atmospheric 3D lighting
smoothMove3D(current, target, speed, deltaTime) // Smooth 3D interpolation
```

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
  position: { x: number, y: number, z: number },
  currentLane: number,        // 0, 1, or 2
  targetLane: number,         // For smooth lane transitions
  isJumping: boolean,
  isSliding: boolean,
  jumpStartTime: number,
  slideStartTime: number,
  mesh: THREE.Mesh,           // 3D representation
  size: { width: number, height: number, depth: number }
}
```

### Obstacle Object
```javascript
const obstacle = {
  position: { x: number, y: number, z: number },
  lane: number,               // 0, 1, or 2
  size: { width: number, height: number, depth: number },
  speed: number,
  type: 'barrier' | 'spike' | 'laser',
  mesh: THREE.Mesh,           // 3D representation
  canJumpOver: boolean,       // True for low obstacles
  canSlideUnder: boolean      // True for high obstacles
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

## 3D Rendering System

### Three.js WebGL Pipeline
- **Scene Management:** Three.js scene graph with hierarchical 3D objects
- **Camera System:** Perspective camera with smooth following and lane transitions
- **WebGL Renderer:** Hardware-accelerated rendering with shadows and antialiasing
- **Material System:** Cyberpunk-themed materials with emissive neon effects

### 3D Environment
Dynamic 3D cityscape with procedural elements:
- **Ground Plane:** Textured runway with lane markers
- **Building Generation:** Procedural cyberpunk buildings scrolling past
- **Neon Lighting:** Dynamic point lights creating atmospheric glow
- **Fog Effects:** Distance fog for depth perception

### 3D Lighting Setup
- **Ambient Light:** Low-intensity overall illumination (0x404040, 0.3)
- **Directional Light:** Main moonlight effect with shadows (0x8080ff, 0.8)
- **Cyan Accent Light:** Left-side point light (0x00ffff, position: -20, 10, 0)
- **Magenta Accent Light:** Right-side point light (0xff0080, position: 20, 10, 0)

### HUD Elements (HTML Overlay)
- **Score Display:** HTML overlay, top-left corner
- **Power Cooldown Bars:** HTML overlay, top-right corner with:
  - Visual fill indicating remaining cooldown time
  - Color coding (red = on cooldown, green = ready)
  - Power icons (F, S, D) for identification
- **Debug Overlay:** Development-only performance metrics

### 3D Visual Effects
- **Time State Indicators:** Scene-wide lighting changes during power usage
- **Obstacle Highlighting:** Material emission changes when affected by time powers
- **Smooth 3D Animations:** Interpolated movement for all 3D objects
- **Lane Transition Effects:** Smooth camera following and player movement
- **Jump/Slide Animations:** 3D arc trajectories and collision box changes

## Performance Optimization

### Frame Rate Management
- Use `requestAnimationFrame` for consistent timing
- Implement delta time calculations for frame-rate independent movement
- WebGL hardware acceleration for optimal 3D performance
- Monitor performance and adjust 3D quality settings if needed

### Memory Management
- Object pooling for frequently created/destroyed 3D obstacles
- Efficient Three.js geometry and material reuse
- Regular cleanup of off-screen 3D objects
- Proper disposal of Three.js resources to prevent memory leaks

### 3D Rendering Optimization
- Minimize Three.js material and geometry changes
- Use instanced rendering for repeated 3D elements
- Efficient 3D collision detection algorithms (3D AABB)
- Frustum culling for off-screen 3D objects
- Level-of-detail (LOD) for distant 3D objects

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
- WebGL support for Three.js 3D rendering
- requestAnimationFrame API
- Keyboard event handling
- Local storage for potential future score persistence
- Hardware-accelerated graphics for optimal 3D performance

### Fallback Strategies
- WebGL compatibility detection with fallback messaging
- Alternative timing mechanisms if requestAnimationFrame unavailable
- Reduced 3D quality settings for lower-end hardware
- Canvas 2D fallback for systems without WebGL support (future enhancement)