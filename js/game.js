class LaserGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentLevel = 0;
        this.isFiring = false;
        this.laserPaths = [];
        this.hitTargets = new Set();
        this.moveCount = 0;
        
        this.movableMirrors = [];
        this.fixedBlockers = new Set();
        this.emptyCells = new Set();
        
        this.selectedMirror = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.cellSize = 0;
        
        console.log("Game initializing...");
        
        this.init();
    }
    
    init() {
        console.log("Setting up game...");
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);
        this.gameLoop();
    }
    
    setupEventListeners() {
        console.log("Setting up event listeners...");
        
        // Canvas interactions
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Buttons
        document.getElementById('fire-btn').addEventListener('click', () => this.fireLaser());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetLevel());
        document.getElementById('prev-btn').addEventListener('click', () => this.previousLevel());
        document.getElementById('next-btn').addEventListener('click', () => this.nextLevel());
        
        console.log("Event listeners set up");
    }
    
    loadLevel(levelIndex) {
        console.log("Loading level", levelIndex);
        
        this.currentLevel = levelIndex;
        this.movableMirrors = [];
        this.fixedBlockers = new Set();
        this.emptyCells = new Set();
        this.hitTargets.clear();
        this.isFiring = false;
        this.laserPaths = [];
        this.moveCount = 0;
        this.selectedMirror = null;
        this.isDragging = false;
        
        const level = LEVELS[levelIndex];
        this.level = level;
        this.cellSize = this.canvas.width / level.gridSize;
        
        // Load level data
        this.movableMirrors = JSON.parse(JSON.stringify(level.movableMirrors));
        
        level.fixedBlockers.forEach(blocker => {
            this.fixedBlockers.add(`${blocker.x},${blocker.y}`);
        });
        
        level.emptyCells.forEach(cell => {
            this.emptyCells.add(`${cell.x},${cell.y}`);
        });
        
        this.updateUI();
        this.draw();
        
        console.log("Level loaded successfully");
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    handleMouseDown(e) {
        if (this.isFiring) return;
        
        const mousePos = this.getMousePos(e);
        const cell = this.getCellFromPixel(mousePos.x, mousePos.y);
        
        if (cell.x < 0 || cell.x >= this.level.gridSize || 
            cell.y < 0 || cell.y >= this.level.gridSize) return;
        
        const clickedMirror = this.movableMirrors.find(mirror => 
            mirror.x === cell.x && mirror.y === cell.y
        );
        
        if (clickedMirror) {
            this.selectedMirror = clickedMirror;
            this.isDragging = true;
            
            const mirrorCenterX = (clickedMirror.x + 0.5) * this.cellSize;
            const mirrorCenterY = (clickedMirror.y + 0.5) * this.cellSize;
            this.dragOffset.x = mirrorCenterX - mousePos.x;
            this.dragOffset.y = mirrorCenterY - mousePos.y;
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedMirror || this.isFiring) return;
        
        const mousePos = this.getMousePos(e);
        this.updateMirrorPosition(mousePos.x, mousePos.y);
    }
    
    handleMouseUp(e) {
        if (this.isDragging && this.selectedMirror) {
            const mousePos = this.getMousePos(e);
            this.updateMirrorPosition(mousePos.x, mousePos.y, true);
            this.moveCount++;
            this.updateUI();
        }
        this.isDragging = false;
        this.selectedMirror = null;
    }
    
    updateMirrorPosition(pixelX, pixelY, isFinal = false) {
        let gridX = Math.floor((pixelX + this.dragOffset.x) / this.cellSize);
        let gridY = Math.floor((pixelY + this.dragOffset.y) / this.cellSize);
        
        gridX = Math.max(0, Math.min(this.level.gridSize - 1, gridX));
        gridY = Math.max(0, Math.min(this.level.gridSize - 1, gridY));
        
        if (this.isEmptyCell(gridX, gridY)) {
            this.selectedMirror.x = gridX;
            this.selectedMirror.y = gridY;
        }
    }
    
    getCellFromPixel(pixelX, pixelY) {
        const gridX = Math.floor(pixelX / this.cellSize);
        const gridY = Math.floor(pixelY / this.cellSize);
        return { x: gridX, y: gridY };
    }
    
    isEmptyCell(x, y) {
        const cellKey = `${x},${y}`;
        
        if (!this.emptyCells.has(cellKey)) return false;
        
        const isOccupiedByOtherMirror = this.movableMirrors.some(mirror => 
            mirror.x === x && mirror.y === y && mirror !== this.selectedMirror
        );
        
        const hasLaser = this.level.lasers.some(laser => 
            laser.x === x && laser.y === y
        );
        
        const hasBlocker = this.fixedBlockers.has(cellKey);
        const hasTarget = this.level.targets.some(target => 
            target.x === x && target.y === y
        );
        
        return !isOccupiedByOtherMirror && !hasLaser && !hasBlocker && !hasTarget;
    }
    
    fireLaser() {
        if (this.isFiring) return;
        
        this.isFiring = true;
        this.laserPaths = [];
        this.hitTargets.clear();
        
        this.level.lasers.forEach((laser, laserIndex) => {
            this.fireSingleLaser(laser, laserIndex);
        });
        
        setTimeout(() => {
            this.isFiring = false;
            if (this.hitTargets.size === this.level.targets.length) {
                this.showWinMessage();
            }
        }, 2000);
    }
    
    fireSingleLaser(laser, laserIndex) {
        let currentPos = new Vector(laser.x, laser.y);
        let currentDir = laser.direction;
        
        const laserPath = [];
        laserPath.push({ ...currentPos, direction: currentDir, laserIndex });
        
        const maxSteps = 100;
        let steps = 0;
        
        while (steps < maxSteps) {
            const nextPos = currentPos.add(DIRECTIONS[currentDir]);
            
            if (nextPos.x < 0 || nextPos.x >= this.level.gridSize ||
                nextPos.y < 0 || nextPos.y >= this.level.gridSize) {
                break;
            }
            
            laserPath.push({ ...nextPos, direction: currentDir, laserIndex });
            
            const cellKey = `${nextPos.x},${nextPos.y}`;
            
            if (this.fixedBlockers.has(cellKey)) {
                break;
            }
            
            const mirror = this.movableMirrors.find(m => m.x === nextPos.x && m.y === nextPos.y);
            if (mirror) {
                currentDir = MIRROR_REFLECTIONS[mirror.type][currentDir];
            }
            
            this.level.targets.forEach((target, index) => {
                if (nextPos.x === target.x && nextPos.y === target.y) {
                    this.hitTargets.add(index);
                }
            });
            
            currentPos = nextPos;
            steps++;
        }
        
        this.laserPaths.push(laserPath);
    }
    
    showWinMessage() {
        alert(`🎉 Level Complete! 🎉\nMoves: ${this.moveCount}\n\nClick OK for next level`);
        this.nextLevel();
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
        } else {
            alert("🎊 You've completed all levels! 🎊");
            this.loadLevel(0);
        }
    }
    
    updateUI() {
        document.getElementById('level-display').textContent = this.currentLevel + 1;
        document.getElementById('targets-display').textContent = 
            `${this.hitTargets.size}/${this.level.targets.length}`;
        document.getElementById('moves-display').textContent = this.moveCount;
    }
    
    draw() {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawEmptyCells();
        this.drawObjects();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.level.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    drawEmptyCells() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.emptyCells.forEach(cellKey => {
            const [x, y] = cellKey.split(',').map(Number);
            this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        });
    }
    
    drawObjects() {
        this.drawFixedBlockers();
        this.drawTargets();
        this.drawMovableMirrors();
        this.drawLaserSource();
        
        if (this.isFiring) {
            this.drawLaserPath();
        }
    }
    
    drawLaserSource() {
        this.level.lasers.forEach((laser, index) => {
            const { x, y, direction } = laser;
            const centerX = (x + 0.5) * this.cellSize;
            const centerY = (y + 0.5) * this.cellSize;
            
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.cellSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            
            const dirVec = DIRECTIONS[direction].multiply(this.cellSize * 0.4);
            this.ctx.lineTo(centerX + dirVec.x, centerY + dirVec.y);
            this.ctx.stroke();
        });
    }
    
    drawTargets() {
        this.level.targets.forEach((target, index) => {
            const centerX = (target.x + 0.5) * this.cellSize;
            const centerY = (target.y + 0.5) * this.cellSize;
            const isHit = this.hitTargets.has(index);
            
            const color = isHit ? '#00ff00' : '#74b9ff';
            drawPlanet(this.ctx, centerX, centerY, this.cellSize * 0.3, color);
        });
    }
    
    drawMovableMirrors() {
        this.movableMirrors.forEach(mirror => {
            const centerX = (mirror.x + 0.5) * this.cellSize;
            const centerY = (mirror.y + 0.5) * this.cellSize;
            
            const isSelected = this.selectedMirror === mirror;
            
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
            if (mirror.type === 'mirror1') {
                this.ctx.moveTo(centerX - this.cellSize * 0.35, centerY + this.cellSize * 0.35);
                this.ctx.lineTo(centerX + this.cellSize * 0.35, centerY - this.cellSize * 0.35);
            } else {
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
        });
    }
    
    drawLaserPath() {
        if (!this.laserPaths || this.laserPaths.length === 0) return;
        
        const laserColors = ['#ff6b6b', '#74b9ff', '#55efc4'];
        
        this.laserPaths.forEach((laserPath, laserIndex) => {
            if (laserPath.length < 2) return;
            
            const laserColor = laserColors[laserIndex % laserColors.length];
            
            this.ctx.strokeStyle = laserColor;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            laserPath.forEach((point, index) => {
                const x = (point.x + 0.5) * this.cellSize;
                const y = (point.y + 0.5) * this.cellSize;
                
                if (index === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });
            this.ctx.stroke();
        });
    }
    
    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    console.log("Page loaded, starting game...");
    const game = new LaserGame();
    window.game = game; // Make it globally available for debugging
});