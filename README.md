# Enhanced Tetris Game

A responsive HTML5 Canvas implementation of the classic Tetris game with enhanced visual effects and mobile support.

## Features

### Core Gameplay
- Complete Tetris gameplay with all seven standard tetrominoes (T, O, L, J, I, S, Z)
- Score tracking system with level progression based on lines cleared
- Next piece preview window
- Game states: Start screen, active gameplay, paused, and game over

### Visual Enhancements
- Line clear animations with particle effects
- Visual feedback when clearing lines
- Mobile-responsive design with optimized layout for different screen sizes
- Clean, modern interface with game information display

### Controls
- **Desktop Controls**:
  - Arrow keys for movement (Left/Right/Down)
  - Up Arrow or W key for rotation
  - Space for hard drop
  - P key to pause/resume

- **Mobile Controls**:
  - On-screen buttons for all actions (move, rotate, hard drop, pause)
  - Touch swipe gestures for movement
  - Responsive button layout optimized for touch

### Responsive Design
- Automatically adapts to both desktop and mobile screens
- Optimized canvas sizing based on device dimensions
- Adjusted controls and UI elements for mobile play
- Full-screen layout on mobile devices

### Technical Features
- HTML5 Canvas-based rendering
- Collision detection and piece rotation system
- CSS3 for responsive layouts and transitions
- Adaptive canvas resizing for different screens
- Clean separation of game logic, styling, and structure

## Code Structure

The game consists of three main files:
- `index.html` - Game structure and UI elements
- `styles.css` - Responsive styling and layout
- `tetris.js` - Game logic and rendering

## New Features Added

- **Vibration/Haptic Feedback** when moving or rotating pieces
- **Dynamic Backgrounds** with animated gradients
- **Enhanced Line Clearing Effects** with improved animations

## How to Play

1. Open `index.html` in any modern web browser
2. Click the "Start Game" button
3. Use keyboard controls on desktop or touch controls on mobile
4. Clear lines to score points and increase your level
5. Game ends when pieces stack to the top of the board

## Game Controls

### Desktop
- **Left/Right Arrow**: Move piece horizontally
- **Down Arrow**: Soft drop
- **Up Arrow**: Rotate piece
- **Space**: Hard drop
- **P**: Pause game

### Mobile
- **Tap directional buttons**: Move and rotate
- **Tap hard drop button (⤓)**: Hard drop
- **Tap pause button (⏸)**: Pause game
- **Swipe gestures**: Move piece
