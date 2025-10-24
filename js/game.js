class LaserGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentLevel = 0;
        this.isFiring = false;
        this.laserPath = [];
        this.hitTargets = new Set();
        
        this.movableMirrors = [];
        this.fixedBlockers = new Set();
        this.emptyCells = new Set();
        
        this.selectedMirror = null;
        this.dragOffset = { x: 0, y: 0 };
        this.cellSize = 0;
        
        this.init();
        this.loadLevel(this.currentLevel);
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Canvas interactions for dragging mirrors
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Buttons
        document.getElementById('fire-btn').addEventListener('click', () => this.fireLaser());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetLevel());
        document.getElementById('prev-btn').addEventListener('click', () => this.previousLevel());
        document.getElementById('next-btn').addEventListener('click', () => this.nextLevel());
    }
    
    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.movableMirrors = [];
        this.fixedBlockers = new Set();
        this.emptyCells = new Set();
        this.hitTargets.clear();
        this.isFiring = false;
        this.laserPath = [];
        this.selectedMirror = null;
        
        const level = LEVELS[levelIndex];
        this.level = level;
        this.cellSize = this.canvas.width / level.gridSize;
        
        // Load movable mirrors
        this.movableMirrors = JSON.parse(JSON.stringify(level.movableMirrors));
        
        // Load fixed blockers
        level.fixedBlockers.forEach(blocker => {
            this.fixedBlockers.add(`${blocker.x},${blocker.y}`);
        });
        
        // Load empty cells
        level.emptyCells.forEach(cell => {
            this.emptyCells.add(`${cell.x},${cell.y}`);
        });
        
        this.updateUI();
        this.draw();
    }
    
    handleMouseDown(e) {
        if (this.isFiring) return;
        
        const cell = getCellFromCoordinates(this.canvas, e.clientX, e.clientY, this.level.gridSize);
        
        if (cell.x < 0 || cell.x >= this.level.gridSize || 
            cell.y < 0 || cell.y >= this.level.gridSize) return;
        
        // Check if clicking on a movable mirror
        const clickedMirror = this.movableMirrors.find(mirror => 
            mirror.x === cell.x && mirror.y === cell.y
        );
        
        if (clickedMirror) {
            this.selectedMirror = clickedMirror;
            const centerX = (cell.x + 0.5) * this.cellSize;
            const centerY = (cell.y + 0.5) * this.cellSize;
            this.dragOffset.x = centerX - e.clientX + this.canvas.getBoundingClientRect().left;
            this.dragOffset.y = centerY - e.clientY + this.canvas.getBoundingClientRect().top;
        }
    }
    
    handleMouseMove(e) {
        if (!this.selectedMirror || this.isFiring) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const cellSize = this.canvas.width / this.level.gridSize;
        const gridX = Math.floor((e.clientX - rect.left + this.dragOffset.x) / cellSize);
        const gridY = Math.floor((e.clientY - rect.top + this.dragOffset.y) / cellSize);
        
        // Only allow moving to empty cells
        if (gridX >= 0 && gridX < this.level.gridSize && 
            gridY >= 0 && gridY < this.level.gridSize &&
            this.isEmptyCell(gridX, gridY)) {
            
            this.selectedMirror.x = gridX;
            this.selectedMirror.y = gridY;
        }
        
        this.draw();
    }
    
    handleMouseUp(e) {
        this.selectedMirror = null;
    }
    
    isEmptyCell(x, y) {
        const cellKey = `${x},${y}`;
        
        // Check if cell is empty AND not occupied by another mirror
        const isOccupiedByMirror = this.movableMirrors.some(mirror => 
            mirror.x === x && mirror.y === y && mirror !== this.selectedMirror
        );
        
        return this.emptyCells.has(cellKey) && !isOccupiedByMirror &&
               !this.fixedBlockers.has(cellKey) &&
               !(this.level.laser.x === x && this.level.laser.y === y) &&
               !this.level.targets.some(target => target.x === x && target.y === y);
    }
    
    fireLaser() {
        if (this.isFiring) return;
        
        this.isFiring = true;
        this.laserPath = [];
        this.hitTargets.clear();
        
        let currentPos = new Vector(this.level.laser.x, this.level.laser.y);
        let currentDir = this.level.laser.direction;
        
        this.laserPath.push({ ...currentPos, direction: currentDir });
        
        const maxSteps = this.level.gridSize * this.level.gridSize * 2;
        let steps = 0;
        
        while (steps < maxSteps) {
            const nextPos = currentPos.add(DIRECTIONS[currentDir]);
            
            // Check bounds
            if (nextPos.x < 0 || nextPos.x >= this.level.gridSize ||
                nextPos.y < 0 || nextPos.y >= this.level.gridSize) {
                break;
            }
            
            this.laserPath.push({ ...nextPos, direction: currentDir });
            
            const cellKey = `${nextPos.x},${nextPos.y}`;
            
            // Check for fixed blockers
            if (this.fixedBlockers.has(cellKey)) {
                break;
            }
            
            // Check for mirrors (both types)
            const mirror = this.movableMirrors.find(m => m.x === nextPos.x && m.y === nextPos.y);
            if (mirror) {
                currentDir = MIRROR_REFLECTIONS[mirror.type][currentDir];
            }
            
            // Check for targets
            this.level.targets.forEach((target, index) => {
                if (nextPos.x === target.x && nextPos.y === target.y) {
                    this.hitTargets.add(index);
                }
            });
            
            currentPos = nextPos;
            steps++;
        }
        
        this.draw();
        
        // Check win condition
        if (this.hitTargets.size === this.level.targets.length) {
            setTimeout(() => this.showWinMessage(), 500);
        }
        
        setTimeout(() => {
            this.isFiring = false;
        }, 2000);
    }
    
    showWinMessage() {
        const message = document.createElement('div');
        message.className = 'win-message';
        message.innerHTML = `
            <h2>Level Complete!</h2>
            <p>All targets hit! Great job!</p>
            ${this.currentLevel < LEVELS.length - 1 ? 
                '<button onclick="game.nextLevel()">Next Level</button>' : 
                '<button onclick="game.resetGame()">Play Again</button>'
            }
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 5000);
    }
    
    resetLevel() {
        this.loadLevel(this.currentLevel);
    }
    
    previousLevel() {
        if (this.currentLevel > 0) {
            this.loadLevel(this.currentLevel - 1);
        }
    }
    
    nextLevel() {
        if (this.currentLevel < LEVELS.length - 1) {
            this.loadLevel(this.currentLevel + 1);
        }
    }
    
    resetGame() {
        this.loadLevel(0);
    }
    
    updateUI() {
        document.getElementById('level-display').textContent = this.currentLevel + 1;
        document.getElementById('targets-display').textContent = 
            `${this.hitTargets.size}/${this.level.targets.length}`;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawEmptyCells();
        this.drawObjects();
        this.updateUI();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.level.gridSize; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    drawEmptyCells() {
        this.emptyCells.forEach(cellKey => {
            const [x, y] = cellKey.split(',').map(Number);
            const centerX = (x + 0.5) * this.cellSize;
            const centerY = (y + 0.5) * this.cellSize;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            
            // Draw subtle dot to indicate movable area
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawObjects() {
        this.drawFixedBlockers();
        this.drawMovableMirrors();
        this.drawTargets();
        this.drawLaserSource();
        
        if (this.isFiring) {
            this.drawLaserPath();
        }
    }
    
    drawLaserSource() {
        const { x, y, direction } = this.level.laser;
        const centerX = (x + 0.5) * this.cellSize;
        const centerY = (y + 0.5) * this.cellSize;
        
        // Laser base
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.cellSize * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Direction indicator
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        
        const dirVec = DIRECTIONS[direction].multiply(this.cellSize * 0.4);
        this.ctx.lineTo(centerX + dirVec.x, centerY + dirVec.y);
        this.ctx.stroke();
    }
    
    drawTargets() {
        this.level.targets.forEach((target, index) => {
            const centerX = (target.x + 0.5) * this.cellSize;
            const centerY = (target.y + 0.5) * this.cellSize;
            const isHit = this.hitTargets.has(index);
            
            const colors = ['#74b9ff', '#55efc4', '#a29bfe', '#fd79a8'];
            const color = isHit ? '#00ff00' : colors[index % colors.length];
            
            drawPlanet(this.ctx, centerX, centerY, this.cellSize * 0.3, color);
            
            if (isHit) {
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, this.cellSize * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawMovableMirrors() {
        this.movableMirrors.forEach(mirror => {
            const centerX = (mirror.x + 0.5) * this.cellSize;
            const centerY = (mirror.y + 0.5) * this.cellSize;
            
            const isSelected = this.selectedMirror === mirror;
            
            // Highlight selected mirror
            if (isSelected) {
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                this.ctx.fillRect(
                    mirror.x * this.cellSize, 
                    mirror.y * this.cellSize, 
                    this.cellSize, 
                    this.cellSize
                );
            }
            
            this.ctx.strokeStyle = mirror.type === 'mirror1' ? '#74b9ff' : '#55efc4';
            this.ctx.lineWidth = isSelected ? 6 : 4;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            if (mirror.type === 'mirror1') { // /
                this.ctx.moveTo(centerX - this.cellSize * 0.35, centerY + this.cellSize * 0.35);
                this.ctx.lineTo(centerX + this.cellSize * 0.35, centerY - this.cellSize * 0.35);
            } else { // \
                this.ctx.moveTo(centerX - this.cellSize * 0.35, centerY - this.cellSize * 0.35);
                this.ctx.lineTo(centerX + this.cellSize * 0.35, centerY + this.cellSize * 0.35);
            }
            this.ctx.stroke();
        });
    }
    
    drawFixedBlockers() {
        this.fixedBlockers.forEach(cellKey => {
            const [x, y] = cellKey.split(',').map(Number);
            const centerX = (x + 0.5) * this.cellSize;
            const centerY = (y + 0.5) * this.cellSize;
            
            this.ctx.fillStyle = '#636e72';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.cellSize * 0.25, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#2d3436';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.cellSize * 0.25, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }
    
    drawLaserPath() {
        if (this.laserPath.length < 2) return;
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        // Draw laser beam with glow effect
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        this.laserPath.forEach((point, index) => {
            const x = (point.x + 0.5) * this.cellSize;
            const y = (point.y + 0.5) * this.cellSize;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    
    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
const game = new LaserGame();