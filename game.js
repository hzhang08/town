import { ImageType, ImagePaths, NextLevel, getCellId, getCellPosition, initializeGridData } from './gameData.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define grid dimensions
const GRID_ROWS = 9;
const GRID_COLS = 7;
const CELL_SIZE = 80;

// Define base grid dimensions
const BASE_GRID_ROWS = 9;
const BASE_GRID_COLS = 7;
const BASE_CELL_SIZE = 80;

// Calculate grid size
const GRID_WIDTH = CELL_SIZE * GRID_COLS;
const GRID_HEIGHT = CELL_SIZE * GRID_ROWS;

// Set canvas size (make it wider and taller than the grid)
const HORIZONTAL_BUFFER = 100; // Buffer on each side
canvas.width = GRID_WIDTH + (HORIZONTAL_BUFFER * 2);
canvas.height = GRID_HEIGHT + 200; // Add extra space at the top

// Calculate grid position (centered horizontally, at the bottom vertically)
const GRID_X = HORIZONTAL_BUFFER;
const GRID_Y = canvas.height - GRID_HEIGHT;

// Create a new Image object for the background
const backgroundImage = new Image();
backgroundImage.src = 'images/beach.jpeg';

// Create an object to store cell images
const cellImages = {};

let isGameWon = false;
// Add these variables at the top of your file
let touchStartX, touchStartY;

// Initialize grid data
const gridData = initializeGridData();

// Get initial dimensions
let { cellSize, gridWidth, gridHeight, gridX, gridY } = calculateDimensions();

// Function to calculate dimensions based on screen size
function calculateDimensions() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate the maximum cell size that fits the screen height
    const maxCellSizeForHeight = Math.floor(screenHeight / BASE_GRID_ROWS);
    
    // Calculate the maximum cell size that fits the screen width
    const maxCellSizeForWidth = Math.floor(screenWidth / BASE_GRID_COLS);
    
    // Use the smaller of the two to ensure it fits both dimensions
    const cellSize = Math.min(maxCellSizeForHeight, maxCellSizeForWidth);
    
    // Calculate grid dimensions
    const gridWidth = cellSize * BASE_GRID_COLS;
    const gridHeight = cellSize * BASE_GRID_ROWS;
    
    // Adjust canvas size
    canvas.width = screenWidth;  // Set canvas width to screen width
    canvas.height = gridHeight;
    
    // Calculate grid position (centered horizontally within the canvas)
    const gridX = (canvas.width - gridWidth) / 2;
    const gridY = 0;  // Grid starts at the top of the canvas
    
    return { cellSize, gridWidth, gridHeight, gridX, gridY };
}

function loadCellImages() {
    Object.values(ImageType).forEach(type => {
        const img = new Image();
        img.src = ImagePaths[type];
        img.onload = () => console.log(`Loaded image for ${type}`);
        img.onerror = (e) => console.error(`Failed to load image for ${type}:`, e);
        cellImages[type] = img;
    });
}

// Add this function to get random sand cells
function getRandomSandCells(count) {
    const sandCells = Object.entries(gridData)
        .filter(([cellId, type]) => type === ImageType.SAND)
        .map(([cellId]) => cellId);
    
    const selectedCells = [];
    for (let i = 0; i < count && sandCells.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * sandCells.length);
        selectedCells.push(sandCells.splice(randomIndex, 1)[0]);
    }
    
    return selectedCells;
}
// Modify the handleDoubleClick function to check for a win after adding rocks
function handleDoubleClick(cellId) {
    const cellType = gridData[cellId];
    if (cellType === ImageType.BUCKET) {
        const sandCells = getRandomSandCells(2);
        sandCells.forEach(sandCellId => {
            gridData[sandCellId] = ImageType.ROCK;
        });
        checkForWin(); // Check for a win after adding rocks
    }
}


// Add event listeners for drag and drop
let isDragging = false;
let dragStartCell = null;
let draggedImage = null;
let draggedImagePos = { x: 0, y: 0 };
let draggedImageType = null;

// Modify getMousePos to work with touch events as well
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.clientX || (evt.touches && evt.touches[0] ? evt.touches[0].clientX : evt.changedTouches[0].clientX);
    const clientY = evt.clientY || (evt.touches && evt.touches[0] ? evt.touches[0].clientY : evt.changedTouches[0].clientY);
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Update getCellFromMousePos function
function getCellFromMousePos(mousePos) {
    const col = Math.floor((mousePos.x - gridX) / cellSize);
    const row = Math.floor((mousePos.y - gridY) / cellSize);
    if (row >= 0 && row < BASE_GRID_ROWS && col >= 0 && col < BASE_GRID_COLS) {
        return getCellId(row, col);
    }
    return null;
}

// Remove this function
// function startDrag(cellId, mousePos) {
//     if (gridData[cellId] in NextLevel) {
//         isDragging = true;
//         dragStartCell = cellId;
//         draggedImage = cellImages[gridData[cellId]];
//         draggedImageType = gridData[cellId];
//         draggedImagePos = {
//             x: mousePos.x - CELL_SIZE / 2,
//             y: mousePos.y - CELL_SIZE / 2
//         };
//         // Temporarily set the cell to sand during dragging
//         gridData[cellId] = ImageType.SAND;
//     }
// }

// Modify the endDrag function to check for a win after a successful move
function endDrag(e) {
    if (isDragging) {
        const mousePos = getMousePos(canvas, e);
        const endCellId = getCellFromMousePos(mousePos);
        
        if (endCellId && dragStartCell !== endCellId && gridData[endCellId] === draggedImageType) {
            const currentType = gridData[endCellId];
            if (currentType in NextLevel) {
                // Combine into next level
                gridData[endCellId] = NextLevel[currentType];
                gridData[dragStartCell] = ImageType.SAND;
                checkForWin(); // Check for a win after a successful move
            }
        } else {
            // Return the item to its original position
            gridData[dragStartCell] = draggedImageType;
        }
        
        isDragging = false;
        dragStartCell = null;
        draggedImage = null;
        draggedImageType = null;
    }
}

// Add this function to check for a GEM and show the popover
function checkForWin() {
    if (isGameWon) return; // Don't check if the game is already won

    const hasSarah = Object.values(gridData).some(cellType => cellType === ImageType.SARAH);
    if (hasSarah) {
        isGameWon = true;
        showWinPopover();
    }
}

// Function to show the "You Won!" popover
function showWinPopover() {
    const popover = document.createElement('div');
    popover.style.position = 'absolute';
    popover.style.top = '50%';
    popover.style.left = '50%';
    popover.style.transform = 'translate(-50%, -50%)';
    popover.style.padding = '20px';
    popover.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    popover.style.border = '2px solid #000';
    popover.style.borderRadius = '10px';
    popover.style.fontSize = '24px';
    popover.style.fontWeight = 'bold';
    popover.style.zIndex = '1000';
    popover.style.cursor = 'pointer'; // Add cursor style to indicate it's clickable
    popover.textContent = 'You Won!';

    // Add click event listener to change text
    popover.addEventListener('click', () => {
        popover.textContent = 'Sarah says Hi!';
    });

    document.body.appendChild(popover);
}

// Modify the canvas style to position it correctly
function updateCanvasPosition() {
    canvas.style.position = 'absolute';
    canvas.style.left = '0';  // Align canvas to the left edge of the screen
    canvas.style.bottom = '0';  // Align canvas to the bottom of the screen
}

// Call this function after calculating dimensions and on resize
updateCanvasPosition();
window.addEventListener('resize', updateCanvasPosition);

// Modify the double-click event listener
canvas.addEventListener('dblclick', (e) => {
    const mousePos = getMousePos(canvas, e);
    const cellId = getCellFromMousePos(mousePos);
    if (cellId) handleDoubleClick(cellId);
});

// Modify the existing mousedown event listener to prevent starting a drag on double-click
let lastClickTime = 0;
// Modify the existing event listeners and add touch event listeners
canvas.addEventListener('mousedown', startDragOrClick);
canvas.addEventListener('mousemove', drag);
canvas.addEventListener('mouseup', endDrag);

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd);


function startDragOrClick(e) {
    const currentTime = new Date().getTime();
    const mousePos = getMousePos(canvas, e);
    const cellId = getCellFromMousePos(mousePos);
    
    if (currentTime - lastClickTime < 300) {
        // Double-click detected
        e.preventDefault();
        if (cellId) handleDoubleClick(cellId);
    } else if (cellId && gridData[cellId] in NextLevel) {
        isDragging = true;
        dragStartCell = cellId;
        draggedImage = cellImages[gridData[cellId]];
        draggedImageType = gridData[cellId];
        draggedImagePos = {
            x: mousePos.x - cellSize / 2,
            y: mousePos.y - cellSize / 2
        };
        gridData[cellId] = ImageType.SAND;
    }
    
    lastClickTime = currentTime;
}

// Update drag function
function drag(e) {
    if (isDragging) {
        const mousePos = getMousePos(canvas, e);
        draggedImagePos = {
            x: mousePos.x - cellSize / 2,
            y: mousePos.y - cellSize / 2
        };
    }
}

let lastTapTime = 0;
const doubleTapDelay = 300; // milliseconds

// Modify the handleTouchStart function
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    const mousePos = getMousePos(canvas, touch);
    const cellId = getCellFromMousePos(mousePos);

    if (tapLength < doubleTapDelay && tapLength > 0) {
        // Double tap detected
        if (cellId) handleDoubleClick(cellId);
    } else {
        // Single tap - start drag if applicable
        if (cellId && gridData[cellId] in NextLevel) {
            isDragging = true;
            dragStartCell = cellId;
            draggedImage = cellImages[gridData[cellId]];
            draggedImageType = gridData[cellId];
            draggedImagePos = {
                x: mousePos.x - CELL_SIZE / 2,
                y: mousePos.y - CELL_SIZE / 2
            };
            gridData[cellId] = ImageType.SAND;
        }
    }

    lastTapTime = currentTime;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (isDragging) {
        const touch = e.touches[0];
        drag(touch);
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    endDrag(touch);
}

// Update drawing functions to use gridX
function drawCellImages() {
    for (let row = 0; row < BASE_GRID_ROWS; row++) {
        for (let col = 0; col < BASE_GRID_COLS; col++) {
            const cellId = getCellId(row, col);
            let imageType = gridData[cellId];
            const image = cellImages[imageType];
            if (image && image.complete && image.naturalWidth !== 0) {
                ctx.drawImage(
                    image,
                    gridX + col * cellSize,
                    gridY + row * cellSize,
                    cellSize,
                    cellSize
                );
            } else {
                console.warn(`Image not ready or broken for cell ${cellId}, type ${imageType}`);
            }
        }
    }
    
    // Draw the dragged image last, so it appears on top
    if (isDragging && draggedImage && draggedImage.complete && draggedImage.naturalWidth !== 0) {
        ctx.drawImage(
            draggedImage,
            draggedImagePos.x,
            draggedImagePos.y,
            cellSize,
            cellSize
        );
    }
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    clear();
    drawBackground();
    drawCellImages();
    drawGrid();
    if (!isGameWon) {
        requestAnimationFrame(gameLoop);
    }
}

// Load images and start the game loop
preloadImages()
    .then(() => {
        console.log('All images loaded successfully');
        gameLoop();
    })
    .catch(error => {
        console.error('Failed to load all images:', error);
    });

function preloadImages() {
    return new Promise((resolve, reject) => {
        let loadedCount = 0;
        const totalImages = Object.keys(ImagePaths).length;
        
        Object.values(ImageType).forEach(type => {
            const img = new Image();
            img.src = ImagePaths[type];
            img.onload = () => {
                console.log(`Loaded image for ${type}`);
                loadedCount++;
                if (loadedCount === totalImages) resolve();
            };
            img.onerror = (e) => {
                console.error(`Failed to load image for ${type}:`, e);
                reject(e);
            };
            cellImages[type] = img;
        });
    });
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= gridWidth; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(gridX + x, gridY);
        ctx.lineTo(gridX + x, gridY + gridHeight);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= gridHeight; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(gridX, gridY + y);
        ctx.lineTo(gridX + gridWidth, gridY + y);
        ctx.stroke();
    }
}