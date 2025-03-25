# Enhanced Tetris Game

A responsive HTML5 Canvas implementation of the classic Tetris game with enhanced visual effects, mobile support, and Progressive Web App (PWA) functionality.

## Features

### Core Gameplay
- Complete Tetris gameplay with all seven standard tetrominoes (T, O, L, J, I, S, Z)
- Two game modes:
  - **Survival Mode**: Speed continuously increases with each level
  - **Regular Mode**: Speed caps at level 4 for more relaxed gameplay
- Score tracking system with level progression based on lines cleared
- Next piece preview window
- Game states: Start screen, active gameplay, paused, and game over
- High score persistence across sessions

### Visual Enhancements
- Line clear animations with particle effects
- Visual feedback when clearing lines
- Dynamic background effects that change with level progression
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

### Sound & Feedback
- **Sound Effects** for movements, rotations, and line clears
- **Vibration/Haptic Feedback** when moving or rotating pieces
- Toggle controls for sound and vibration preferences

### Progressive Web App (PWA) Features
- **Installable** on desktop and mobile devices
- **Offline Functionality** - play without an internet connection
- **Home Screen Launch** - open directly from your device's home screen
- **Full-screen Experience** without browser UI when installed

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
- Service worker for offline caching and functionality

## Code Structure
The game consists of these main files:
- `index.html` - Game structure and UI elements
- `styles.css` - Responsive styling and layout
- `tetris.js` - Game logic and rendering
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline functionality
- `pwa-install.js` - Installation handler

## How to Play

### Online
1. Visit [https://faridfgx.github.io/tetris/](https://faridfgx.github.io/tetris/)
2. Select game mode (Survival or Regular)
3. Click the "Start Game" button
4. Use keyboard controls on desktop or touch controls on mobile
5. Clear lines to score points and increase your level
6. Game ends when pieces stack to the top of the board

### Install as App
1. Visit the game URL in a supported browser (Chrome, Edge, Safari)
2. Click the "Install App" button that appears
3. Follow browser prompts to install
4. Launch from your desktop or home screen like any other app

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

## Game Modes
- **Survival Mode**: Traditional Tetris with speed increasing with each level
- **Regular Mode**: Speed increases until level 4, then remains constant for more casual gameplay

## Installation
The game can be installed as a Progressive Web App:

### On Android/Chrome
- Visit the game URL
- Click the "Install App" button, or
- Use Chrome's menu and select "Install App"

### On iOS/Safari
- Visit the game URL
- Tap the Share button
- Select "Add to Home Screen"
- Tap "Add"
