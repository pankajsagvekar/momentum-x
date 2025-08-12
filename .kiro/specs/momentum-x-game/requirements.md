# Requirements Document

## Introduction

Momentum X is a cyberpunk-themed 2D endless runner game where players manipulate time to survive increasingly difficult obstacles. The game features three distinct time powers (freeze, slow, speed up) that affect gameplay mechanics differently, creating strategic depth in an otherwise simple runner format. Built with HTML5 Canvas and vanilla JavaScript, the game targets web browsers and emphasizes smooth 60fps performance with procedural difficulty scaling.

## Requirements

### Requirement 1

**User Story:** As a player, I want to control a character that runs automatically through a cyberpunk cityscape, so that I can focus on timing my actions and using time powers strategically.

#### Acceptance Criteria

1. WHEN the game starts THEN the player character SHALL move automatically from left to right at a consistent base speed
2. WHEN the player presses Space THEN the game SHALL start from the main menu
3. WHEN the player collides with any obstacle THEN the game SHALL end immediately and display a game over screen
4. WHEN the game is over THEN the player SHALL be able to restart by pressing R

### Requirement 2

**User Story:** As a player, I want three distinct time manipulation powers with different effects and cooldowns, so that I can strategically choose which power to use in different situations.

#### Acceptance Criteria

1. WHEN the player presses F AND freeze power is not on cooldown THEN the game SHALL freeze all obstacles for 2 seconds with a 5-second cooldown
2. WHEN the player presses S AND slow power is not on cooldown THEN the game SHALL reduce all game element speeds by 50% for 3 seconds with a 4-second cooldown
3. WHEN the player presses D AND speed power is not on cooldown THEN the game SHALL double all game speeds for 1.5 seconds AND double the score rate with a 6-second cooldown
4. WHEN a power is on cooldown THEN the system SHALL prevent activation and display the remaining cooldown time
5. WHEN a power is active THEN the system SHALL provide visual feedback indicating which power is currently active

### Requirement 3

**User Story:** As a player, I want to encounter various obstacles that behave differently based on the current time state, so that each time power creates unique strategic opportunities.

#### Acceptance Criteria

1. WHEN obstacles spawn THEN the system SHALL randomly select from moving spikes, falling debris, and laser beams
2. WHEN freeze time is active THEN all obstacles SHALL stop moving completely
3. WHEN slow time is active THEN all obstacles SHALL move at 50% of their normal speed
4. WHEN speed time is active THEN all obstacles SHALL move at 200% of their normal speed
5. WHEN the player passes an obstacle without collision THEN the system SHALL award 5 points

### Requirement 4

**User Story:** As a player, I want a scoring system that rewards both survival time and obstacle avoidance, so that I have multiple ways to achieve high scores.

#### Acceptance Criteria

1. WHEN the game is running THEN the system SHALL award 1 point per second of survival
2. WHEN the player successfully passes an obstacle THEN the system SHALL award 5 points
3. WHEN speed time power is active THEN the system SHALL double the rate of all score gains
4. WHEN the game ends THEN the system SHALL display the final score prominently
5. WHEN the score changes THEN the system SHALL update the display in real-time

### Requirement 5

**User Story:** As a player, I want the game difficulty to increase progressively over time, so that the challenge remains engaging as I improve.

#### Acceptance Criteria

1. WHEN 20 seconds have elapsed THEN the system SHALL increase the difficulty level by 1
2. WHEN difficulty increases THEN obstacle spawn rate SHALL increase (minimum 0.5 seconds between spawns)
3. WHEN difficulty increases THEN obstacle movement speed SHALL increase by 0.2x per level
4. WHEN difficulty increases THEN the system SHALL maintain smooth 60fps performance
5. IF the game has been running for multiple difficulty cycles THEN the system SHALL continue scaling appropriately

### Requirement 6

**User Story:** As a player, I want an immersive cyberpunk visual experience with parallax scrolling backgrounds, so that the game feels polished and engaging.

#### Acceptance Criteria

1. WHEN the game is running THEN the system SHALL display three parallax background layers
2. WHEN the background scrolls THEN the skyline layer SHALL move slowest, buildings medium, and neon signs fastest
3. WHEN time powers are active THEN background scrolling speed SHALL adjust accordingly
4. WHEN the game renders THEN the system SHALL maintain 60fps performance
5. WHEN visual elements are displayed THEN they SHALL follow a consistent cyberpunk aesthetic

### Requirement 7

**User Story:** As a player, I want a clear HUD that shows my score and power cooldowns, so that I can make informed decisions about when to use my abilities.

#### Acceptance Criteria

1. WHEN the game is running THEN the system SHALL display the current score in the top-left corner
2. WHEN the game is running THEN the system SHALL display three power cooldown bars in the top-right corner
3. WHEN a power is on cooldown THEN the corresponding bar SHALL show the remaining time visually
4. WHEN a power is available THEN the corresponding bar SHALL indicate readiness clearly
5. WHEN the HUD updates THEN the system SHALL use smooth animations for visual feedback

### Requirement 8

**User Story:** As a developer, I want the codebase to be well-structured and documented, so that it can be easily maintained and extended.

#### Acceptance Criteria

1. WHEN the project is structured THEN it SHALL separate concerns into player.js, obstacles.js, powers.js, game.js, and utils.js files
2. WHEN code is written THEN each function SHALL include clear comments explaining its purpose
3. WHEN the project is delivered THEN it SHALL include placeholder assets for sprites and backgrounds
4. WHEN the project is delivered THEN it SHALL include a comprehensive README with setup instructions
5. WHEN the code runs THEN it SHALL achieve consistent 60fps performance in modern browsers