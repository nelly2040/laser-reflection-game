class LaserGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentLevel = 0;
        this.selectedTool = null;
        this.isFiring = false;
        this.laserPath = [];
        this.hitTargets = new Set();
        
        this.mirrors = {};
        this.blockers = new Set();
        
        this.cellSize = 0;
        
        this.init();
        this.loadLevel(this.currentLevel);
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedTool = e.target.dataset.tool;
            });
        });
        
        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
        
        // Buttons
        document.getElementById('fire-btn').addEventListener('click', () => this.fireLaser());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetLevel());
        document.getElementById('prev-btn').addEventListener('click', () => this.previousLevel());
        document.getElementById('next-btn').addEventListener('click', () => this.nextLevel());
    }
    
    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.mirrors = {};
        this.blockers = new Set();
        this.hitTargets.clear();
        this.isFiring = false;
        this.laserPath = [];
        
        const level = LEVELS[levelIndex];
        this.level = level;
        this.cellSize = this.canvas.width / level.gridSize;
        
        // Add predefined blockers
        level.blockers.forEach(blocker => {
            this.blockers.add(`${blocker.x},${blocker.y}`);
        });
        
        this.updateUI();
        this.draw();
    }
    
    handleCanvasClick(e) {
        if (this.isFiring) return;
        
        const cell = getCellFromCoordinates(this.canvas, e.clientX, e.clientY, this.level.gridSize);
        const cellKey = `${cell.x},${cell.y}`;
        
        if (cell.x < 0 || cell.x >= this.level.gridSize || 
            cell.y < 0 || cell.y >= this.level.gridSize) return;
        
        // Check if cell is occupied by laser, target, or blocker
        if (this.isCellOccupied(cell)) return;
        
        if (this.selectedTool === 'erase') {
            delete this.mirrors[cellKey];
            this.blockers.delete(cellKey);
        } else if (this.selectedTool && this.selectedTool.startsWith('mirror')) {
            if (this.canPlaceMirror(this.selectedTool)) {
                this.mirrors[cellKey] = this.selectedTool;
            }
        } else if (this.selectedTool === 'blocker') {
            this.blockers.add(cellKey);
        }
        
        this.draw();
    }
    
    handleRightClick(e) {
        e.preventDefault();
        const cell = getCellFromCoordinates(this.canvas, e.clientX, e.clientY, this.level.gridSize);
        const cellKey = `${cell.x},${cell.y}`;
        
        delete this.mirrors[cellKey];
        this.blockers.delete(cellKey);
        this.draw();
    }
    
    isCellOccupied(cell) {
        const cellKey = `${cell.x},${cell.y}`;
        return this.level.laser.x === cell.x && this.level.laser.y === cell.y ||
               this.level.targets.some(target => target.x === cell.x && target.y === cell.y) ||
               this.blockers.has(cellKey);
    }
    
    canPlaceMirror(mirrorType) {
        const mirrorCount = Object.values(this.mirrors).filter(type => type === mirrorType).length;
        return mirrorCount < this.level.availableMirrors[mirrorType];
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
            
            // Check for blockers
            if (this.blockers.has(cellKey)) {
                break;
            }
            
            // Check for mirrors
            if (this.mirrors[cellKey]) {
                currentDir = MIRROR_REFLECTIONS[this.mirrors[cellKey]][currentDir];
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
            <p>All targets destroyed!</p>
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
        
        // Update mirror counts
        document.querySelectorAll('.tool').forEach(tool => {
            if (tool.dataset.tool && this.level.availableMirrors[tool.dataset.tool]) {
                const used = Object.values(this.mirrors).filter(type => type === tool.dataset.tool).length;
                const available = this.level.availableMirrors[tool.dataset.tool];
                tool.textContent = `${tool.dataset.tool === 'mirror1' ? '/' : '\\'} Mirror (${used}/${available})`;
            }
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
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
    
    drawObjects() {
        this.drawBlockers();
        this.drawMirrors();
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
            const color = isHit ? '#ff6b6b' : colors[index % colors.length];
            
            drawPlanet(this.ctx, centerX, centerY, this.cellSize * 0.3, color);
            
            if (isHit) {
                this.ctx.fillStyle = 'rgba(255, 107, 107, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, this.cellSize * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawMirrors() {
        Object.entries(this.mirrors).forEach(([key, type]) => {
            const [x, y] = key.split(',').map(Number);
            const centerX = (x + 0.5) * this.cellSize;
            const centerY = (y + 0.5) * this.cellSize;
            
            this.ctx.strokeStyle = type === 'mirror1' ? '#74b9ff' : '#55efc4';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            if (type === 'mirror1') { // /
                this.ctx.moveTo(centerX - this.cellSize * 0.35, centerY + this.cellSize * 0.35);
                this.ctx.lineTo(centerX + this.cellSize * 0.35, centerY - this.cellSize * 0.35);
            } else { // \
                this.ctx.moveTo(centerX - this.cellSize * 0.35, centerY - this.cellSize * 0.35);
                this.ctx.lineTo(centerX + this.cellSize * 0.35, centerY + this.cellSize * 0.35);
            }
            this.ctx.stroke();
        });
    }
    
    drawBlockers() {
        this.blockers.forEach(key => {
            const [x, y] = key.split(',').map(Number);
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
        
        // Draw laser points
        this.laserPath.forEach(point => {
            const x = (point.x + 0.5) * this.cellSize;
            const y = (point.y + 0.5) * this.cellSize;
            
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
const game = new LaserGame();