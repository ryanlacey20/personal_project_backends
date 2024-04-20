const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');

const { getFirestore, Timestamp, FieldValue, Filter, doc } = require('firebase-admin/firestore');

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

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
    const grid = initializeGrid(gridSize);
    const directions = ['horizontal', 'vertical', 'diagonal'];

    const wordPositions = {};

    for (let key in words) {
        let word = words[key];

        let direction = directions[Math.floor(Math.random() * directions.length)];

        let placed = false;
        while (!placed) {
            let startX = Math.floor(Math.random() * gridSize);
            let startY = Math.floor(Math.random() * gridSize);


            if (checkFit(grid, word, startX, startY, direction)) {
                placeWord(grid, word, startX, startY, direction);
                placed = true;


                const endX = startX + (direction === 'horizontal' ? word.length - 1 : 0);
                const endY = startY + (direction === 'vertical' ? word.length - 1 : 0);
                wordPositions[word] = {
                    word: word,
                    direction: direction,
                    startX: startX,
                    startY: startY,
                    endX: endX,
                    endY: endY
                };
            }
        }
    }

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (isEmptyObject(grid[i][j])) {

                grid[i][j] = getRandomLetter();
            }
            grid[i][j] = { letter: grid[i][j], x: i, y: j, belongsTo: null };
        }
    }

    Object.values(wordPositions).forEach(wordPos => {
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

function isEmptyObject(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}


function checkFit(grid, word, startX, startY, direction) {
    const wordLength = word.length;
    gridSize = Object.keys(grid).length


    if (direction === 'horizontal' && startX + wordLength <= gridSize) {
        for (let i = 0; i < wordLength; i++) {

            if (!isEmptyObject(grid[startX + i][startY]) && grid[startX + i][startY] !== word[i]) {
                return false;
            }
        }
        return true;
    }

    if (direction === 'vertical' && startY + wordLength <= gridSize) {
        for (let i = 0; i < wordLength; i++) {
            if (!isEmptyObject(grid[startX][startY + i]) && grid[startX][startY + i] !== word[i]) {
                return false;
            }
        }
        return true;
    }

    if (direction === 'diagonal' && startX + wordLength <= gridSize && startY + wordLength <= gridSize) {
        for (let i = 0; i < wordLength; i++) {
            if (!isEmptyObject(grid[startX + i][startY + i]) && grid[startX + i][startY + i] !== word[i]) {
                return false;
            }
        }
        return true;
    }

    return false;
}

function placeWord(grid, word, startX, startY, direction) {
    const wordLength = word.length;

    if (direction === 'horizontal') {
        for (let i = 0; i < wordLength; i++) {
            grid[startX + i][startY] = word[i];
        }
    }

    if (direction === 'vertical') {
        for (let i = 0; i < wordLength; i++) {
            grid[startX][startY + i] = word[i];
        }
    }

    if (direction === 'diagonal') {
        for (let i = 0; i < wordLength; i++) {
            grid[startX + i][startY + i] = word[i];
        }
    }
}

function gridObj(size) {
    const grid = {};
    for (let i = 0; i < size; i++) {
        grid[i] = {};
        for (let ii = 0; ii < size; ii++) {
            grid[i][ii] = {};
        }
    }

    return grid;
}

function initializeGrid(size) {
    return gridObj(size);
}

function printGrid(gridObject) {
    const grid = gridObject.grid;
    const size = grid.length;
    let output = "";

    for (let i = 0; i < size; i++) {
        output += "|";
        for (let j = 0; j < size; j++) {
            output += ` ${grid[i][j].letter} |`;
        }
        output += "\n";
    }

    console.log(output);
}

function getCurrentDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = String(currentDate.getFullYear()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}

app.post('/api/generate-word-search', (req, res) => {
    const words = req.body;
    const grid = generateGrid(words);
    printGrid(grid); // Uncomment to print grid to console once it has been written

    const currDate = getCurrentDate();
    const currDateDocRef = db.collection("wordsearchs").doc(currDate);

    let rowCount = 0; // Keep track of which row we are on
    for (let row in grid.grid) {
        currDateDocRef.collection("gridData").doc(`row_${rowCount}`).set(grid.grid[rowCount]);
        rowCount += 1;
    }

    for (const currWord of Object.values(grid.wordPositions)) {
        const word = currWord.word;
        const docRef = currDateDocRef.collection("wordPositions").doc(word);
        docRef.set(currWord);
    }

    res.status(200).json({ grid });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} `);
});
