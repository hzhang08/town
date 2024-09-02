// Enum for image types
const ImageType = {
    SAND: 'sand',
    ROCK: 'rock',
    GEM: 'gem',
    SHELL: 'shell',
    CONCH: 'conch',
    NAUTILUS: 'nautilus',
    SEASTAR: 'seastar',
    SARAH: 'sarah',
    BUCKET: 'bucket',
    SUCCULENT: 'succulent'
};

// Map image types to file paths
const ImagePaths = {
    [ImageType.SAND]: 'images/beachsand.png',
    [ImageType.ROCK]: 'images/rock.png',
    [ImageType.GEM]: 'images/gem.png',
    [ImageType.SHELL]: 'images/shell.png',
    [ImageType.CONCH]: 'images/conch.png',
    [ImageType.NAUTILUS]: 'images/nautilus.png',
    [ImageType.SEASTAR]: 'images/seastar.png',
    [ImageType.SARAH]: 'images/sarah.png',
    [ImageType.BUCKET]: 'images/bucket.png',
    [ImageType.SUCCULENT]: 'images/plant.png'
};

// Hashmap for next level
const NextLevel = {
    [ImageType.ROCK]: ImageType.GEM,
    [ImageType.GEM]: ImageType.SHELL,
    [ImageType.SHELL]: ImageType.CONCH,
    [ImageType.CONCH]: ImageType.NAUTILUS,
    [ImageType.NAUTILUS]: ImageType.SEASTAR,
    [ImageType.SEASTAR]: ImageType.SARAH
};

// Function to generate a unique cell ID
function getCellId(row, col) {
    return `cell_${row}_${col}`;
}

// Initialize the grid data
function initializeGridData() {
    // Initialize the cells with specific content
    const initialCells = {
        [getCellId(0, 0)]: ImageType.SUCCULENT,
        [getCellId(0, 1)]: ImageType.SUCCULENT,
        [getCellId(0, 3)]: ImageType.SUCCULENT,
        [getCellId(0, 4)]: ImageType.SUCCULENT,
        [getCellId(1, 0)]: ImageType.SUCCULENT,
        [getCellId(1, 6)]: ImageType.SUCCULENT,
        [getCellId(2, 2)]: ImageType.SUCCULENT,
        [getCellId(2, 5)]: ImageType.SUCCULENT,
        [getCellId(5, 0)]: ImageType.SUCCULENT,
        [getCellId(6, 0)]: ImageType.SUCCULENT,
        [getCellId(8, 5)]: ImageType.SUCCULENT,
        [getCellId(8, 6)]: ImageType.SUCCULENT,
        [getCellId(5, 3)]: ImageType.BUCKET,  // New rock at row 5, column 3
    };

    const gridData = {};
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 7; col++) {
            const cellId = getCellId(row, col);
            // Check if the cell is one of the initial cells with specific content
            if (cellId in initialCells) {
                gridData[cellId] = initialCells[cellId];
            } else {
                // Assign sand to all other cells
                gridData[cellId] = ImageType.SAND;
            }
        }
    }
    console.log('Grid data initialized:', gridData);
    return gridData;
}

// Add a function to get row and column from cellId
function getCellPosition(cellId) {
    const [_, row, col] = cellId.split('_');
    return { row: parseInt(row), col: parseInt(col) };
}


// Export the data and functions
export { ImageType, ImagePaths, NextLevel,getCellId, getCellPosition, initializeGridData };