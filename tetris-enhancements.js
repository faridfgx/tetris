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
  
  // Enable or disable vibration
  enabled: true,
  
  // Toggle vibration on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },
  
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
// Updating the existing LineAnimator class with more dramatic effects
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
        speedX: (Math.random() - 0.5) * 12,  // More spread
        speedY: (Math.random() - 2) * 6,     // More upward motion
        color: `hsl(${Math.random() * 360}, 80%, 60%)`,
        life: 100,
        gravity: 0.2 + Math.random() * 0.1
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
      this.flashEffect.alpha -= 0.06;
      
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
      animation.blocks.forEach(block => {
        ctx.save();
        ctx.translate(
          block.x + block.width / 2,
          block.y + block.height / 2
        );
        
        block.rotation += block.speed * block.direction * 0.05;
        block.scale *= 0.95;
        block.x += block.speed * block.direction;
        
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
      
      // Update and draw particles
      animation.particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.speedY += particle.gravity;
        particle.life -= 2;
        particle.size *= 0.98;
        
        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = (particle.life / 100) * animation.alpha;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      
      // Update animation state
      animation.alpha -= 0.03;
      
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
      particles: []
    };
    
    this.animations.push(animation);
  }
}

// Function to initialize all the new features
function initEnhancedFeatures() {
  // Initialize background manager
  window.backgroundManager = new BackgroundManager();
  
  // Replace the line animator with the enhanced version
  window.lineAnimator = new EnhancedLineAnimator(context, BLOCK_SIZE);
  
  // Set up a toggle button for vibration
  //const controlsDiv = document.querySelector('.controls');
  //const vibrationButton = document.createElement('button');
  //vibrationButton.id = 'toggle-vibration';
  //vibrationButton.innerHTML = '📳';
  //vibrationButton.title = 'Toggle Vibration';
  
  //vibrationButton.addEventListener('click', () => {
    //const enabled = HapticFeedback.toggle();
    //vibrationButton.style.opacity = enabled ? '1' : '0.5';
    // Provide feedback when toggled
   // if (enabled) HapticFeedback.vibrate('move');
  //});
  
  //controlsDiv.appendChild(vibrationButton);
  
  // Check if vibration is supported
  if (!HapticFeedback.isSupported()) {
    vibrationButton.style.display = 'none';
  }
  
  // Modify game loop to update background
  const originalUpdate = window.update;
  window.update = function(time = 0) {
    if (!isGameOver && !isPaused && isGameStarted) {
      window.backgroundManager.update();
    }
    originalUpdate(time);
  };
}

// Update existing functions to use our new features
// =========================================

// Add vibration to playerMove
const originalPlayerMove = window.playerMove;
window.playerMove = function(dir) {
  const initialPos = player.pos.x;
  originalPlayerMove(dir);
  
  // Only vibrate if the piece actually moved
  if (initialPos !== player.pos.x) {
    HapticFeedback.vibrate('move');
  }
};

// Add vibration to playerRotate
const originalPlayerRotate = window.playerRotate;
window.playerRotate = function(dir) {
  originalPlayerRotate(dir);
  HapticFeedback.vibrate('rotate');
};

// Add vibration to playerHardDrop
const originalPlayerHardDrop = window.playerHardDrop;
window.playerHardDrop = function() {
  originalPlayerHardDrop();
  HapticFeedback.vibrate('hardDrop');
};

// Enhanced arenaSweep with new effects and vibration
const originalArenaSweep = window.arenaSweep;
window.arenaSweep = function() {
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
      window.lineAnimator.addLineAnimation(y);
    });
    
    // For multi-line clears, add special effects
    if (rowCount >= 2) {
      // Find center of cleared rows
      const centerY = clearedRows.reduce((a, b) => a + b, 0) / clearedRows.length;
      window.lineAnimator.createShockwave(centerY);
    }
    
    // Vibration feedback
    HapticFeedback.vibrate('lineClear');
    
    // Update score
    const oldLevel = level;
    player.score += rowCount * 100 * level;
    lines += rowCount;
    level = Math.floor(lines / 10) + 1;
    
    // If level increased, change background and add vibration
    if (level > oldLevel) {
      window.backgroundManager.changeBackground();
      HapticFeedback.vibrate('levelUp');
    }
    
    updateScore();
  }
};

// Enhanced game over with vibration
const originalGameOver = window.gameOver;
window.gameOver = function() {
  originalGameOver();
  HapticFeedback.vibrate('gameOver');
};

// Initialize our enhancements when the page loads
document.addEventListener('DOMContentLoaded', initEnhancedFeatures);

// If the page is already loaded, initialize immediately
if (document.readyState === 'complete') {
  initEnhancedFeatures();
}
