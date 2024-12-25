/**
 * @constant {Object} GAME_CONFIG Game configuration parameters
 */
const GAME_CONFIG = {
    CELL_SIZE: 10,
    FRAME_DELAY: 500,
    INITIAL_ALIVE_PROBABILITY: 0.3,
    COLORS: {
        SPARSE: '#9be9a8',  // 1-2 neighbors
        BALANCED: '#40c463', // 3 neighbors
        CROWDED: '#30a14e',  // 4 neighbors
        OVERPOPULATED: '#216e39' // 5+ neighbors
    }
};

/**
 * @typedef {Object} GameState
 * @property {boolean} isRunning - Current game running state
 * @property {boolean[][]} grid - 2D array representing the game grid
 * @property {number} cols - Number of columns in the grid
 * @property {number} rows - Number of rows in the grid
 */
const gameState = {
    isRunning: false,
    grid: [],
    cols: 0,
    rows: 0
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Grid operations
function initializeGrid() {
    gameState.grid = Array(gameState.rows).fill().map(() => 
        Array(gameState.cols).fill().map(() => Math.random() > GAME_CONFIG.INITIAL_ALIVE_PROBABILITY)
    );
}


/**
 * Calculates the number of living neighbors for a cell at the specified coordinates.
 * The function implements a wrapping border, meaning cells on the edges connect to cells on the opposite edge.
 * 
 * @param {number} x - The row coordinate of the cell
 * @param {number} y - The column coordinate of the cell
 * @returns {number} The count of living neighbors (0-8), excluding the cell itself
 */
function getNeighborCount(x, y) {
    let count = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            const row = (x + i + gameState.rows) % gameState.rows;
            const col = (y + j + gameState.cols) % gameState.cols;
            count += gameState.grid[row][col] ? 1 : 0;
        }
    }
    return count - (gameState.grid[x][y] ? 1 : 0);
}

function computeNextGeneration() {
    const nextGrid = gameState.grid.map(arr => [...arr]);
    
    for (let i = 0; i < gameState.rows; i++) {
        for (let j = 0; j < gameState.cols; j++) {
            const neighbors = getNeighborCount(i, j);
            const isAlive = gameState.grid[i][j];
            
            nextGrid[i][j] = isAlive
                ? (neighbors === 2 || neighbors === 3)
                : (neighbors === 3);
        }
    }
    
    gameState.grid = nextGrid;
}

/**
 * @description Determines cell color based on neighbor count
 * @param {number} neighbors - Number of neighboring live cells
 * @returns {string} Hex color code
 */
function getColorForCell(neighbors) {
    if (neighbors <= 2) return GAME_CONFIG.COLORS.SPARSE;
    if (neighbors === 3) return GAME_CONFIG.COLORS.BALANCED;
    if (neighbors === 4) return GAME_CONFIG.COLORS.CROWDED;
    return GAME_CONFIG.COLORS.OVERPOPULATED;
}

function renderGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < gameState.rows; i++) {
        for (let j = 0; j < gameState.cols; j++) {
            if (gameState.grid[i][j]) {
                const neighbors = getNeighborCount(i, j);
                ctx.fillStyle = getColorForCell(neighbors);
                
                ctx.beginPath();
                ctx.roundRect(
                    j * GAME_CONFIG.CELL_SIZE, 
                    i * GAME_CONFIG.CELL_SIZE, 
                    GAME_CONFIG.CELL_SIZE - 1, 
                    GAME_CONFIG.CELL_SIZE - 1,
                    2
                );
                ctx.fill();
            }
        }
    }
}

/**
 * @description Reinitializes the grid with random cell states
 */
function randomize() {
    initializeGrid();
    renderGrid();
}

// 修改事件绑定方式
document.getElementById('toggleButton').addEventListener('click', toggleGame);
document.getElementById('randomButton').addEventListener('click', randomize);

// Game loop
function updateGame() {
    if (gameState.isRunning) {
        computeNextGeneration();
        renderGrid();
        setTimeout(() => requestAnimationFrame(updateGame), GAME_CONFIG.FRAME_DELAY);
    }
}

/**
 * @description Converts mouse coordinates to grid coordinates
 * @param {number} mouseX - Mouse X position
 * @param {number} mouseY - Mouse Y position
 * @returns {Object} Grid coordinates {row, col}
 */
function getGridCoordinates(mouseX, mouseY) {
    const rect = canvas.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;
    return {
        row: Math.floor(y / GAME_CONFIG.CELL_SIZE),
        col: Math.floor(x / GAME_CONFIG.CELL_SIZE)
    };
}

/**
 * @description Handles canvas click events to toggle cells
 * @param {MouseEvent} event - Click event object
 */
function handleCanvasClick(event) {
    const { row, col } = getGridCoordinates(event.clientX, event.clientY);
    if (row >= 0 && row < gameState.rows && col >= 0 && col < gameState.cols) {
        gameState.grid[row][col] = !gameState.grid[row][col];
        renderGrid();
    }
}

function handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);
    
    gameState.cols = Math.floor(width / GAME_CONFIG.CELL_SIZE);
    gameState.rows = Math.floor(height / GAME_CONFIG.CELL_SIZE);
    
    initializeGrid();
    renderGrid();
}

function toggleGame() {
    gameState.isRunning = !gameState.isRunning;
    if (gameState.isRunning) {
        requestAnimationFrame(updateGame);
    }
}

// 修改初始化顺序
function init() {
    // 设置事件监听
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('click', handleCanvasClick);
    
    // 初始化尺寸和网格
    handleResize();
}

// 启动游戏
window.addEventListener('load', init);

// 删除模块导出
// module.exports = {
//     getNeighborCount
// };