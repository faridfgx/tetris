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

// Sound effects with fallback
const AUDIO = {
    lineClear: new Audio('data:audio/wav;base64,AAA'),
    move: new Audio('data:audio/wav;base64,AAA'),
    rotate: new Audio('data:audio/wav;base64,AAA')
};

// Audio manager to handle sound effects safely
const AudioManager = {
    init() {
        Object.values(AUDIO).forEach(audio => {
            if (audio) {
                audio.volume = 0.3;
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

// Line clear animation class
class LineAnimator {
    constructor(context, blockSize) {
        this.context = context;
        this.blockSize = blockSize;
        this.animations = [];
    }

    addLineAnimation(y) {
        const animation = {
            y: y,
            alpha: 1,
            particles: this.createParticles(y)
        };
        this.animations.push(animation);
    }

    createParticles(y) {
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * (BOARD_WIDTH * this.blockSize),
                y: y * this.blockSize,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 2) * 5,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 360}, 80%, 60%)`
            });
        }
        return particles;
    }

    update() {
        this.animations = this.animations.filter(animation => {
            animation.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.2; // gravity
            });

            animation.alpha -= 0.05;
            
            this.context.fillStyle = `rgba(255, 255, 255, ${animation.alpha})`;
            this.context.fillRect(
                0,
                animation.y * this.blockSize,
                BOARD_WIDTH * this.blockSize,
                this.blockSize
            );

            animation.particles.forEach(particle => {
                this.context.fillStyle = particle.color;
                this.context.globalAlpha = animation.alpha;
                this.context.beginPath();
                this.context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.context.fill();
            });
            
            this.context.globalAlpha = 1;
            
            return animation.alpha > 0;
        });
        
        return this.animations.length > 0;
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
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const nextPieceCanvas = document.getElementById('next-piece-canvas');
const nextPieceContext = nextPieceCanvas.getContext('2d');

// Initialize the line animator
const lineAnimator = new LineAnimator(context, BLOCK_SIZE);

// Game objects
const arena = createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    nextPiece: null
};

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function draw() {
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
    nextPieceContext.fillStyle = '#000';
    nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    if (player.nextPiece) {
        const previewBlock = nextPieceCanvas.width / 4;
        const offsetX = (nextPieceCanvas.width - (player.nextPiece[0].length * previewBlock)) / 2;
        const offsetY = (nextPieceCanvas.height - (player.nextPiece.length * previewBlock)) / 2;
        
        drawPreviewPiece(player.nextPiece, offsetX, offsetY, previewBlock);
    }
}

function drawGrid() {
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
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    } else {
        AudioManager.play('move');
    }
}

function playerRotate(dir) {
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
}

function playerReset() {
    if (!player.nextPiece) {
        player.nextPiece = createRandomPiece();
    }
    
    player.matrix = player.nextPiece;
    player.nextPiece = createRandomPiece();
    player.pos.y = 0;
    player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
    
    if (collide(arena, player)) {
        gameOver();
    }
}

function createRandomPiece() {
    const pieces = 'TJLOSZI';
    return PIECES[pieces[pieces.length * Math.random() | 0]];
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
        AudioManager.play('lineClear');
        
        clearedRows.forEach(y => {
            lineAnimator.addLineAnimation(y);
        });
        
        player.score += rowCount * 100 * level;
        lines += rowCount;
        level = Math.floor(lines / 10) + 1;
        updateScore();
    }
}

function updateScore() {
    document.getElementById('score').innerText = `Score: ${player.score}`;
    document.getElementById('level').innerText = `Level: ${level}`;
    document.getElementById('lines').innerText = `Lines: ${lines}`;
}

function gameOver() {
    isGameOver = true;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = player.score;
}

function resetGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    level = 1;
    lines = 0;
    isGameOver = false;
    document.getElementById('game-over-screen').classList.add('hidden');
    updateScore();
    playerReset();
}

function togglePause() {
    if (isGameStarted && !isGameOver) {
        isPaused = !isPaused;
        document.getElementById('pause-screen').classList.toggle('hidden');
    }
}

function startGame() {
    isGameStarted = true;
    document.getElementById('start-screen').classList.add('hidden');
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
        
        draw();
        lineAnimator.update();
    }
    requestAnimationFrame(update);
}

// Event listeners
document.addEventListener('keydown', event => {
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
            case 'KeyQ':
                playerRotate(-1);
                break;
            case 'KeyW':
                playerRotate(1);
                break;
        }
    }
});

// Mobile controls initialization
function initMobileControls() {
    document.getElementById('move-left').addEventListener('click', () => {
        if (!isPaused && !isGameOver && isGameStarted) playerMove(-1);
    });
    
    document.getElementById('move-right').addEventListener('click', () => {
        if (!isPaused && !isGameOver && isGameStarted) playerMove(1);
    });
    
    document.getElementById('move-down').addEventListener('click', () => {
        if (!isPaused && !isGameOver && isGameStarted) playerDrop();
    });
    
    document.getElementById('rotate-left').addEventListener('click', () => {
        if (!isPaused && !isGameOver && isGameStarted) playerRotate(-1);
    });
    
    document.getElementById('rotate-right').addEventListener('click', () => {
        if (!isPaused && !isGameOver && isGameStarted) playerRotate(1);
    });
    
    document.getElementById('hard-drop').addEventListener('click', () => {
        if (!isPaused && !isGameOver && isGameStarted) playerHardDrop();
    });
    
    document.getElementById('pause').addEventListener('click', () => {
        if (isGameStarted) togglePause();
    });
}

// Touch event handling for mobile
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


// Add this function to handle canvas resizing
function resizeCanvas() {
    const maxHeight = window.innerHeight * 0.8;
    const maxWidth = window.innerWidth * 0.4;
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

// Add resize event listener
window.addEventListener('resize', resizeCanvas);

// Call once at start
resizeCanvas();

// Initialize button listeners
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('restart-button').addEventListener('click', resetGame);

// Initialize mobile controls
initMobileControls();

// Start the game loop
draw();
update();