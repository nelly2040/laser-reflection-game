class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}

const DIRECTIONS = {
    'up': new Vector(0, -1),
    'down': new Vector(0, 1),
    'left': new Vector(-1, 0),
    'right': new Vector(1, 0)
};

const MIRROR_REFLECTIONS = {
    'mirror1': { // / mirror
        'right': 'up',
        'left': 'down',
        'up': 'right',
        'down': 'left'
    },
    'mirror2': { // \ mirror
        'right': 'down',
        'left': 'up',
        'up': 'left',
        'down': 'right'
    }
};

function getCellFromCoordinates(canvas, x, y, gridSize) {
    const rect = canvas.getBoundingClientRect();
    const cellSize = canvas.width / gridSize;
    const gridX = Math.floor((x - rect.left) / cellSize);
    const gridY = Math.floor((y - rect.top) / cellSize);
    return { x: gridX, y: gridY };
}

function drawPlanet(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    
    // Planet body
    const gradient = ctx.createRadialGradient(-size*0.3, -size*0.3, 0, 0, 0, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#2d3436');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Planet rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.5, size * 0.3, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
}