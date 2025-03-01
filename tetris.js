// Game constants
const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const COLORS = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // O
    '#0DFF72', // L
    '#F538FF', // J
    '#FF8E0D', // I
    '#FFE138', // S
    '#3877FF'  // Z
];

// High score variable - declared at global scope
let highScore = 0;

// Sound effects with actual sound files
const AUDIO = {
    lineClear: new Audio('scoreline.wav'),
    move: new Audio('rotate.wav'),
    rotate: new Audio('rotate.wav'),
    gameOver: new Audio('gameover.wav')
};

// Audio manager to handle sound effects safely
const AudioManager = {
    init() {
        Object.values(AUDIO).forEach(audio => {
            if (audio) {
                audio.volume = 0.3;
                // Preload sounds
                audio.load();
            }
        });
    },

    play(soundName) {
        const audio = AUDIO[soundName];
        if (audio) {
            try {
                const sound = audio.cloneNode();
                sound.play().catch(e => {
                    console.warn(`Failed to play ${soundName} sound:`, e);
                });
            } catch (e) {
                console.warn(`Error playing ${soundName} sound:`, e);
            }
        }
    }
};

// Initialize audio
AudioManager.init();

const PIECES = {
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'O': [
        [2, 2],
        [2, 2]
    ],
    'L': [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    'J': [
        [4, 0, 0],
        [4, 4, 4],
        [0, 0, 0]
    ],
    'I': [
        [0, 0, 0, 0],
        [5, 5, 5, 5],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'S': [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0]
    ],
    'Z': [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
};

// 1. VIBRATION FEATURE
// This function will handle device vibration for different game actions
const HapticFeedback = {
    // Default vibration patterns in milliseconds
    patterns: {
        move: 20,
        rotate: 30,
        hardDrop: [20, 30, 50],
        lineClear: [50, 30, 50, 30],
        levelUp: [100, 50, 100],
        gameOver: [200, 100, 200, 100, 400]
    },
    
    // Check if vibration is supported
    isSupported() {
        return 'vibrate' in navigator;
    },
    
    // Enable vibration by default
    enabled: true,
    
    // Vibrate with specified pattern
    vibrate(type) {
        if (!this.enabled || !this.isSupported()) return;
        
        try {
            const pattern = this.patterns[type] || this.patterns.move;
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn('Vibration failed:', e);
        }
    }
};

// 2. DYNAMIC BACKGROUNDS
// This class will handle background animations and effects
class BackgroundManager {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.gradients = [
            { start: '#1a2a6c', end: '#b21f1f' },  // Deep blue to red
            { start: '#2C3E50', end: '#4CA1AF' },  // Dark blue to teal
            { start: '#aa4b6b', end: '#3b8d99' },  // Rose to teal
            { start: '#7F00FF', end: '#E100FF' },  // Violet to pink
            { start: '#11998e', end: '#38ef7d' }   // Teal to green
        ];
        
        this.currentGradient = 0;
        this.targetGradient = 0;
        this.gradientTransition = 0;
        this.transitionSpeed = 0.01;
        
        this.initialize();
    }
    
    initialize() {
        const container = document.querySelector('.game-container');
        if (!container) {
            console.warn('Game container not found');
            return;
        }
        
        this.canvas.classList.add('background-canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.transition = 'opacity 0.5s';
        
        // Insert before the first child
        container.insertBefore(this.canvas, container.firstChild);
        
        // Add CSS to document if needed
        const style = document.createElement('style');
        style.textContent = `
            .background-canvas {
                pointer-events: none;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
        this.createParticles(30);
    }
    
    resizeCanvas() {
        const container = document.querySelector('.game-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    createParticles(count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Wrap around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
        });
    }
    
    drawBackground() {
        const ctx = this.ctx;
        
        // Create gradient
        const currentColor = this.gradients[this.currentGradient];
        const targetColor = this.gradients[this.targetGradient];
        
        // Interpolate colors
        const startColor = this.interpolateColor(
            currentColor.start, 
            targetColor.start, 
            this.gradientTransition
        );
        const endColor = this.interpolateColor(
            currentColor.end, 
            targetColor.end, 
            this.gradientTransition
        );
        
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        
        // Apply gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Update gradient transition
        if (this.currentGradient !== this.targetGradient) {
            this.gradientTransition += this.transitionSpeed;
            if (this.gradientTransition >= 1) {
                this.currentGradient = this.targetGradient;
                this.gradientTransition = 0;
            }
        }
    }
    
    // Helper function to interpolate between two colors
    interpolateColor(color1, color2, factor) {
        const result = color1.replace(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, (m, r, g, b) => {
            const r1 = parseInt(r, 16);
            const g1 = parseInt(g, 16);
            const b1 = parseInt(b, 16);
            
            const r2 = parseInt(color2.substr(1, 2), 16);
            const g2 = parseInt(color2.substr(3, 2), 16);
            const b2 = parseInt(color2.substr(5, 2), 16);
            
            const r3 = Math.round(r1 + factor * (r2 - r1));
            const g3 = Math.round(g1 + factor * (g2 - g1));
            const b3 = Math.round(b1 + factor * (b2 - b1));
            
            return `rgb(${r3}, ${g3}, ${b3})`;
        });
        
        return result;
    }
    
    update() {
        this.updateParticles();
        this.drawBackground();
    }
    
    // Change background on level change or other events
    changeBackground() {
        this.targetGradient = (this.targetGradient + 1) % this.gradients.length;
    }
    
    // Add particles burst effect for special events
    addParticleBurst(x, y, count = 20, color = null) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            const size = Math.random() * 4 + 2;
            
            this.particles.push({
                x: x || this.canvas.width / 2,
                y: y || this.canvas.height / 2,
                size: size,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                opacity: 1,
                color: color || `hsl(${Math.random() * 360}, 80%, 60%)`,
                life: 100,
                isEffect: true
            });
        }
    }
}

// 3. ENHANCED LINE ANIMATION
class EnhancedLineAnimator {
    constructor(context, blockSize) {
        this.context = context;
        this.blockSize = blockSize;
        this.animations = [];
        this.flashEffect = { active: false, alpha: 0 };
    }
    
    addLineAnimation(y) {
        // Add flash effect
        this.flashEffect = { active: true, alpha: 0.8 };
        
        // Set up block animations
        const animation = {
            y: y,
            alpha: 1,
            blocks: this.createBlocksEffect(y),
            particles: this.createParticles(y)
        };
        
        this.animations.push(animation);
        
        // Add particle burst to background
        if (window.backgroundManager) {
            window.backgroundManager.addParticleBurst(
                BOARD_WIDTH * this.blockSize / 2,
                y * this.blockSize,
                25
            );
        }
    }
    
    createBlocksEffect(y) {
        const blocks = [];
        
        // Create a block effect for each position in the row
        for (let x = 0; x < BOARD_WIDTH; x++) {
            blocks.push({
                x: x * this.blockSize,
                y: y * this.blockSize,
                width: this.blockSize,
                height: this.blockSize,
                rotation: 0,
                scale: 1,
                speed: Math.random() * 5 + 5,
                direction: Math.random() > 0.5 ? 1 : -1,
                color: COLORS[Math.floor(Math.random() * (COLORS.length - 1)) + 1]
            });
        }
        
        return blocks;
    }
    
    createParticles(y) {
        const particles = [];
        const particleCount = 40;  // Increased particle count
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * (BOARD_WIDTH * this.blockSize),
                y: y * this.blockSize,
                size: Math.random() * 5 + 2,
                speedX: (Math.random() - 0.5) * 8,  // Reduced from 12 for slower movement
                speedY: (Math.random() - 2) * 4,    // Reduced from 6 for slower movement
                color: `hsl(${Math.random() * 360}, 80%, 60%)`,
                life: 150,  // Increased from 100 for longer lifetime
                gravity: 0.15 + Math.random() * 0.08  // Reduced from 0.2 for slower falling
            });
        }
        
        return particles;
    }
    
    update() {
        const ctx = this.context;
        let hasActiveAnimations = false;
        
        // Update flash effect
        if (this.flashEffect.active) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashEffect.alpha})`;
            ctx.fillRect(0, 0, BOARD_WIDTH * this.blockSize, BOARD_HEIGHT * this.blockSize);
            // Slow down the flash fade-out by decreasing the decrement value
            this.flashEffect.alpha -= 0.03; // Changed from 0.06
            
            if (this.flashEffect.alpha <= 0) {
                this.flashEffect.active = false;
            } else {
                hasActiveAnimations = true;
            }
        }
        
        // Update line animations
        this.animations = this.animations.filter(animation => {
            // Apply a white flash on the row
            ctx.fillStyle = `rgba(255, 255, 255, ${animation.alpha * 0.7})`;
            ctx.fillRect(
                0,
                animation.y * this.blockSize,
                BOARD_WIDTH * this.blockSize,
                this.blockSize
            );
            
            // Animate blocks spinning and flying off
            if (animation.blocks && Array.isArray(animation.blocks)) {
                animation.blocks.forEach(block => {
                    ctx.save();
                    ctx.translate(
                        block.x + block.width / 2,
                        block.y + block.height / 2
                    );
                    
                    // Slow down rotation and scaling for a more visible effect
                    block.rotation += block.speed * block.direction * 0.02; // Changed from 0.05
                    block.scale *= 0.98; // Changed from 0.95 for slower shrinking
                    block.x += block.speed * block.direction * 0.6; // Added multiplier to slow movement
                    
                    ctx.rotate(block.rotation);
                    ctx.scale(block.scale, block.scale);
                    
                    ctx.fillStyle = block.color;
                    ctx.fillRect(
                        -block.width / 2,
                        -block.height / 2,
                        block.width,
                        block.height
                    );
                    
                    ctx.restore();
                });
            }
            
            // Update and draw particles
            if (animation.particles && Array.isArray(animation.particles)) {
                animation.particles.forEach(particle => {
                    particle.x += particle.speedX * 0.7; // Slowed down horizontal movement
                    particle.y += particle.speedY * 0.7; // Slowed down vertical movement
                    particle.speedY += particle.gravity * 0.7; // Reduced gravity effect
                    particle.life -= 1; // Reduced life decrement from 2 to 1
                    particle.size *= 0.99; // Slower shrinking
                    
                    ctx.beginPath();
                    ctx.fillStyle = particle.color;
                    ctx.globalAlpha = (particle.life / 100) * animation.alpha;
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            
            ctx.globalAlpha = 1;
            
            // Update animation state - slower alpha decrease for longer visibility
            animation.alpha -= 0.015; // Changed from 0.03
            
            return animation.alpha > 0;
        });
        
        return this.animations.length > 0 || hasActiveAnimations;
    }
    
    // Create shockwave effect for multi-line clears
    createShockwave(centerY) {
        const shockwave = {
            x: BOARD_WIDTH * this.blockSize / 2,
            y: centerY * this.blockSize,
            radius: 10,
            maxRadius: BOARD_WIDTH * this.blockSize * 0.8,
            alpha: 1,
            color: 'rgba(255, 255, 255, 0.8)'
        };
        
        const animation = {
            y: centerY,
            alpha: 1,
            shockwave: shockwave,
            particles: [],
            blocks: [] // Initialize empty blocks array
        };
        
        this.animations.push(animation);
    }
}

// Game state
let isPaused = false;
let isGameOver = false;
let isGameStarted = false;
let dropCounter = 0;
let lastTime = 0;
let level = 1;
let lines = 0;

// Canvas setup
let canvas;
let context;
let nextPieceCanvas;
let nextPieceContext;

// Initialize background manager and line animator
let backgroundManager;
let lineAnimator;

// Game objects
let arena;
let player;

// Initialize all DOM elements and game objects
function initializeGameElements() {
    // Get canvas elements
    canvas = document.getElementById('tetris');
    if (!canvas) {
        console.error('Tetris canvas not found!');
        return false;
    }
    
    context = canvas.getContext('2d');
    
    nextPieceCanvas = document.getElementById('next-piece-canvas');
    if (!nextPieceCanvas) {
        console.error('Next piece canvas not found!');
        return false;
    }
    
    nextPieceContext = nextPieceCanvas.getContext('2d');
    
    // Create game arena and player
    arena = createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
    player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        score: 0,
        nextPiece: null
    };
    
    return true;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function draw() {
    if (!context || !canvas) return;
    
    // Clear main canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game grid
    drawGrid();
    
    // Draw main game pieces
    drawMatrix(arena, { x: 0, y: 0 });
    if (player.matrix) {
        drawMatrix(player.matrix, player.pos);
    }
    
    // Clear and draw next piece preview
    if (nextPieceContext && nextPieceCanvas) {
        nextPieceContext.fillStyle = '#000';
        nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        if (player.nextPiece) {
            const previewBlock = nextPieceCanvas.width / 4;
            const offsetX = (nextPieceCanvas.width - (player.nextPiece[0].length * previewBlock)) / 2;
            const offsetY = (nextPieceCanvas.height - (player.nextPiece.length * previewBlock)) / 2;
            
            drawPreviewPiece(player.nextPiece, offsetX, offsetY, previewBlock);
        }
    }
}

function drawGrid() {
    if (!context || !canvas) return;
    
    context.strokeStyle = '#333';
    context.lineWidth = 1;
    
    for (let x = 0; x <= BOARD_WIDTH; x++) {
        context.beginPath();
        context.moveTo(x * BLOCK_SIZE, 0);
        context.lineTo(x * BLOCK_SIZE, canvas.height);
        context.stroke();
    }
    
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
        context.beginPath();
        context.moveTo(0, y * BLOCK_SIZE);
        context.lineTo(canvas.width, y * BLOCK_SIZE);
        context.stroke();
    }
}

function drawMatrix(matrix, offset) {
    if (!context) return;
    
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = COLORS[value];
                context.fillRect(
                    (x + offset.x) * BLOCK_SIZE,
                    (y + offset.y) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
                
                context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                context.lineWidth = 1;
                context.strokeRect(
                    (x + offset.x) * BLOCK_SIZE,
                    (y + offset.y) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        });
    });
}

function drawPreviewPiece(matrix, offsetX, offsetY, blockSize) {
    if (!nextPieceContext) return;
    
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                nextPieceContext.fillStyle = COLORS[value];
                nextPieceContext.fillRect(
                    offsetX + x * blockSize,
                    offsetY + y * blockSize,
                    blockSize,
                    blockSize
                );
                
                nextPieceContext.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                nextPieceContext.lineWidth = 1;
                nextPieceContext.strokeRect(
                    offsetX + x * blockSize,
                    offsetY + y * blockSize,
                    blockSize,
                    blockSize
                );
            }
        });
    });
}

function collide(arena, player) {
    // Safety check to prevent null errors
    if (!player || !player.matrix || !player.pos) return true;
    
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    // Safety check
    if (!player || !player.matrix || !player.pos) return;
    
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    
    // Add haptic feedback
    HapticFeedback.vibrate('hardDrop');
}

function playerMove(dir) {
    const initialPos = player.pos.x;
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    } else {
        AudioManager.play('move');
        
        // Only vibrate if the piece actually moved
        if (initialPos !== player.pos.x) {
            HapticFeedback.vibrate('move');
        }
    }
}

function playerRotate(dir) {
    // Safety check
    if (!player || !player.matrix) return;
    
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
    
    AudioManager.play('rotate');
    HapticFeedback.vibrate('rotate');
}

function playerReset() {
    // Initialize nextPiece if it doesn't exist
    if (!player.nextPiece) {
        player.nextPiece = createRandomPiece();
    }
    
    player.matrix = player.nextPiece;
    player.nextPiece = createRandomPiece();
    
    // Reset position
    player.pos.y = 0;
    player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
    
    // Check for collision immediately after spawning a new piece
    if (collide(arena, player)) {
        gameOver();
    }
}

function createRandomPiece() {
    const pieces = 'TJLOSZI';
    const pieceType = pieces[pieces.length * Math.random() | 0];
    const piece = PIECES[pieceType];
    if (!piece) {
        console.error('Invalid piece type:', pieceType);
        // Fallback to a simple piece if something goes wrong
        return [[1, 1], [1, 1]];
    }
    
    // Create a deep copy of the piece to prevent shared reference
    return piece.map(row => [...row]);
}

function arenaSweep() {
    let rowCount = 0;
    let clearedRows = [];
    
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        
        clearedRows.push(y);
        rowCount++;
    }
    
    if (rowCount > 0) {
        // Play sound effect
        AudioManager.play('lineClear');
        
        // Add enhanced animations for line clears
        clearedRows.forEach(y => {
            lineAnimator.addLineAnimation(y);
        });
        
        // For multi-line clears, add special effects
        if (rowCount >= 2) {
            // Find center of cleared rows
            const centerY = clearedRows.reduce((a, b) => a + b, 0) / clearedRows.length;
            lineAnimator.createShockwave(centerY);
        }
        
        // Vibration feedback
        HapticFeedback.vibrate('lineClear');
        
        // Update score
        const oldLevel = level;
        player.score += rowCount * 100 * level;
        lines += rowCount;
        level = Math.floor(lines / 10) + 1;
        
        // If level increased, change background and add vibration
        if (level > oldLevel && backgroundManager) {
            backgroundManager.changeBackground();
            HapticFeedback.vibrate('levelUp');
        }
        
        updateScore();
    }
}

// Local storage functions for high score
function saveHighScore() {
    try {
        localStorage.setItem('tetrisHighScore', highScore.toString());
    } catch (e) {
        console.warn('Unable to save high score to local storage:', e);
    }
}

function loadHighScore() {
    try {
        const savedScore = localStorage.getItem('tetrisHighScore');
        if (savedScore) {
            highScore = parseInt(savedScore, 10);
            const highScoreElement = document.getElementById('high-score');
            if (highScoreElement) {
                highScoreElement.innerText = `High Score: ${highScore}`;
            }
        }
    } catch (e) {
        console.warn('Unable to load high score from local storage:', e);
    }
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');
    const highScoreElement = document.getElementById('high-score');
    
    if (scoreElement) scoreElement.innerText = `Score: ${player.score}`;
    if (levelElement) levelElement.innerText = `Level: ${level}`;
    if (linesElement) linesElement.innerText = `Lines: ${lines}`;
    
    // Update high score if current score is higher
    if (player.score > highScore) {
        highScore = player.score;
        if (highScoreElement) {
            highScoreElement.innerText = `High Score: ${highScore}`;
            // Save high score to local storage
            saveHighScore();
            
            // Add highlight animation
            highScoreElement.classList.add('highlight');
            setTimeout(() => {
                highScoreElement.classList.remove('highlight');
            }, 1000);
        }
    }
}

function resetGame() {
    if (!arena) return;
    
    arena.forEach(row => row.fill(0));
    player.score = 0;
    level = 1;
    lines = 0;
    isGameOver = false;
    
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
        gameOverScreen.classList.add('hidden');
    }
    
    updateScore();
    playerReset();
}

function gameOver() {
    isGameOver = true;
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreElement = document.getElementById('final-score');
    const gameOverHighScoreElement = document.getElementById('game-over-high-score');
    const newHighScoreMessage = document.getElementById('new-high-score-message');
    
    if (gameOverScreen) {
        gameOverScreen.classList.remove('hidden');
    }
    
    if (finalScoreElement) {
        finalScoreElement.innerText = player.score;
    }
    
    // Display high score on game over screen
    if (gameOverHighScoreElement) {
        gameOverHighScoreElement.innerText = highScore;
    }
    
    // If this is a new high score, show the message
    if (newHighScoreMessage) {
        if (player.score >= highScore && player.score > 0) {
            newHighScoreMessage.classList.remove('hidden');
        } else {
            newHighScoreMessage.classList.add('hidden');
        }
    }
    
    // Play game over sound
    AudioManager.play('gameOver');
    HapticFeedback.vibrate('gameOver');
}

function togglePause() {
    if (isGameStarted && !isGameOver) {
        isPaused = !isPaused;
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) {
            pauseScreen.classList.toggle('hidden');
        }
    }
}

function startGame() {
    isGameStarted = true;
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.classList.add('hidden');
    }
    resetGame();
}

function update(time = 0) {
    if (!isGameOver && !isPaused && isGameStarted) {
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > 1000 / level) {
            playerDrop();
        }
        
        // Update background effects
        if (backgroundManager) {
            backgroundManager.update();
        }
        
        draw();
        
        // Update line clear animations
        if (lineAnimator) {
            lineAnimator.update();
        }
    }
    requestAnimationFrame(update);
}

function resizeCanvas() {
    if (!canvas) return;
    
    const isMobile = window.innerWidth <= 768;
    const containerHeight = window.innerHeight;
    const containerWidth = window.innerWidth;
    
    if (isMobile) {
        // On mobile, use most of the screen height minus space for controls
        const maxHeight = containerHeight - 220; // Space for controls and info
        const maxWidth = containerWidth * 0.95; // 95% of screen width
        const aspectRatio = canvas.width / canvas.height;
        
        let newWidth = maxHeight * aspectRatio;
        let newHeight = maxHeight;
        
        // If width is too wide, scale down proportionally
        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = maxWidth / aspectRatio;
        }
        
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    } else {
        // Desktop sizing
        const maxHeight = containerHeight * 0.8;
        const maxWidth = containerWidth * 0.4;
        const aspectRatio = canvas.width / canvas.height;
        
        let newWidth = maxHeight * aspectRatio;
        let newHeight = maxHeight;
        
        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = maxWidth / aspectRatio;
        }
        
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    }
}

function initTouchEvents() {
    if (!canvas) return;
    
    let touchStartX = null;
    let touchStartY = null;
    const SWIPE_THRESHOLD = 30;
    
    document.addEventListener('touchstart', (e) => {
        if (!isPaused && !isGameOver && isGameStarted) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            if (deltaX > 0) {
                playerMove(1);
            } else {
                playerMove(-1);
            }
            touchStartX = touchEndX;
        }
        
        if (deltaY > SWIPE_THRESHOLD) {
            playerDrop();
            touchStartY = touchEndY;
        }
        
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
        touchStartX = null;
        touchStartY = null;
    });
    
    // Add tap-to-rotate functionality
    canvas.addEventListener('click', (e) => {
        if (!isPaused && !isGameOver && isGameStarted) {
            // Simple tap on the canvas will rotate the piece
            playerRotate(1);
        }
    });
}

function initMobileControls() {
    const moveLeft = document.getElementById('move-left');
    const moveRight = document.getElementById('move-right');
    const moveDown = document.getElementById('move-down');
    const rotate = document.getElementById('rotate');
    const hardDrop = document.getElementById('hard-drop');
    const pause = document.getElementById('pause');
    
    if (moveLeft) {
        moveLeft.addEventListener('click', () => {
            if (!isPaused && !isGameOver && isGameStarted) playerMove(-1);
        });
    }
    
    if (moveRight) {
        moveRight.addEventListener('click', () => {
            if (!isPaused && !isGameOver && isGameStarted) playerMove(1);
        });
    }
    
    if (moveDown) {
        moveDown.addEventListener('click', () => {
            if (!isPaused && !isGameOver && isGameStarted) playerDrop();
        });
    }
    
    if (rotate) {
        rotate.addEventListener('click', () => {
            if (!isPaused && !isGameOver && isGameStarted) playerRotate(1);
        });
    }
    
    if (hardDrop) {
        hardDrop.addEventListener('click', () => {
            if (!isPaused && !isGameOver && isGameStarted) playerHardDrop();
        });
    }
    
    if (pause) {
        pause.addEventListener('click', () => {
            if (isGameStarted) togglePause();
        });
    }
}

function handleKeyPress(event) {
    if (!isGameStarted) {
        if (event.code === 'Enter' || event.code === 'Space') {
            startGame();
        }
        return;
    }
    
    if (isGameOver) {
        if (event.code === 'KeyR') {
            resetGame();
        }
        return;
    }
    
    if (event.code === 'KeyP') {
        togglePause();
        return;
    }
    
    if (!isPaused) {
        switch (event.code) {
            case 'ArrowLeft':
                playerMove(-1);
                break;
            case 'ArrowRight':
                playerMove(1);
                break;
            case 'ArrowDown':
                playerDrop();
                break;
            case 'Space':
                playerHardDrop();
                break;
            case 'ArrowUp':
            case 'KeyW':
                playerRotate(1);
                break;
        }
    }
}

// Initialize the game and all enhancements
function initGame() {
    // First initialize all DOM elements and game objects
    if (!initializeGameElements()) {
        console.error('Failed to initialize game elements');
        return;
    }
    
    // Load high score from local storage
    loadHighScore();
    
    // Initialize background manager
    backgroundManager = new BackgroundManager();
    
    // Initialize line animator
    lineAnimator = new EnhancedLineAnimator(context, BLOCK_SIZE);
    
    // Initialize touch events
    initTouchEvents();
    
    // Initialize button listeners
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', resetGame);
    }
    
    initMobileControls();
    
    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    // Add resize event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Set initial canvas size
    resizeCanvas();
    
    // Start the game loop
    draw();
    update();
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short time to ensure all elements are loaded
    setTimeout(initGame, 100);
});

// If the page is already loaded, initialize immediately
if (document.readyState === 'complete') {
    initGame();
}