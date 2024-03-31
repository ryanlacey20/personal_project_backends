const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

function generateGrid(words) {
    const gridSize = 15;
    const grid = initializeGrid(gridSize); // Initialize an empty grid
    const directions = ['horizontal', 'vertical', 'diagonal'];

    const wordPositions = []; // Array to store word positions

    for (let key in words) {
        let word = words[key];
        let direction = directions[Math.floor(Math.random() * directions.length)]; // Randomly select a direction

        // Try to place the word in the grid until a valid position is found
        let placed = false;
        while (!placed) {
            // Randomly select a starting position for the word
            let startX = Math.floor(Math.random() * gridSize);
            let startY = Math.floor(Math.random() * gridSize);

            // Check if the word fits in the selected direction without overlapping
            if (checkFit(grid, word, startX, startY, direction)) {
                // Place the word in the grid
                placeWord(grid, word, startX, startY, direction);
                placed = true;

                // Store word position
                const endX = startX + (direction === 'horizontal' ? word.length - 1 : 0);
                const endY = startY + (direction === 'vertical' ? word.length - 1 : 0);
                wordPositions.push({
                    word: word,
                    direction: direction,
                    startX: startX,
                    startY: startY,
                    endX: endX,
                    endY: endY
                });
            }
        }
    }

    // Fill in the blank spaces with random letters and add x, y positions
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = getRandomLetter();
            }
            grid[i][j] = { letter: grid[i][j], x: i, y: j, belongsTo: null };
        }
    }

    // Update the "belongsTo" property for each letter to indicate the word it belongs to
    wordPositions.forEach(wordPos => {
        const { word, startX, startY, endX, endY } = wordPos;
        let currX = startX;
        let currY = startY;
        for (let i = 0; i < word.length; i++) {
            grid[currX][currY].belongsTo = word;
            currX += (endX - startX) / (word.length - 1);
            currY += (endY - startY) / (word.length - 1);
        }
    });

    return { grid: grid, wordPositions: wordPositions };
}




function getRandomLetter() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet[randomIndex];
}

function checkFit(grid, word, startX, startY, direction) {
    const wordLength = word.length;
    const gridSize = grid.length;

    // Check if the word fits horizontally
    if (direction === 'horizontal' && startX + wordLength <= gridSize) {
        for (let i = 0; i < wordLength; i++) {
            if (grid[startX + i][startY] !== '' && grid[startX + i][startY] !== word[i]) {
                return false; // Overlapping with existing word
            }
        }
        return true;
    }

    // Check if the word fits vertically
    if (direction === 'vertical' && startY + wordLength <= gridSize) {
        for (let i = 0; i < wordLength; i++) {
            if (grid[startX][startY + i] !== '' && grid[startX][startY + i] !== word[i]) {
                return false; // Overlapping with existing word
            }
        }
        return true;
    }

    // Check if the word fits diagonally (down)
    if (direction === 'diagonal' && startX + wordLength <= gridSize && startY + wordLength <= gridSize) {
        for (let i = 0; i < wordLength; i++) {
            if (grid[startX + i][startY + i] !== '' && grid[startX + i][startY + i] !== word[i]) {
                return false; // Overlapping with existing word
            }
        }
        return true;
    }

    return false;
}

function placeWord(grid, word, startX, startY, direction) {
    const wordLength = word.length;

    // Place the word in the grid based on the selected direction
    if (direction === 'horizontal') {
        for (let i = 0; i < wordLength; i++) {
            grid[startX + i][startY] = word[i];
        }
    }

    // Place the word vertically
    if (direction === 'vertical') {
        for (let i = 0; i < wordLength; i++) {
            grid[startX][startY + i] = word[i];
        }
    }

    // Place the word diagonally (down)
    if (direction === 'diagonal') {
        for (let i = 0; i < wordLength; i++) {
            grid[startX + i][startY + i] = word[i];
        }
    }
}


function initializeGrid(size) {
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid.push(Array(size).fill(''));
    }
    return grid;
}

function printGrid(gridObject) {
    const grid = gridObject.grid;
    const size = grid.length;
    let output = "";

    for (let i = 0; i < size; i++) {
        output += "|";
        for (let j = 0; j < size; j++) {
            output += ` ${grid[i][j].letter} |`; // Access the 'letter' property of each cell object
        }
        output += "\n";
    }

    console.log(output);
}


// Define a route handler for the POST request
app.post('/api/generate-word-search', (req, res) => {
    // Retrieve the dictionary of words from the request body
    const words = req.body;
    console.log("words here:", words)
    // Generate the 15x15 grid with the given words
    const grid = generateGrid(words);
    printGrid(grid)
    // Send the generated grid as a response to the client
    res.status(200).json({ grid });


});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
