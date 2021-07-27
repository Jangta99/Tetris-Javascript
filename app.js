document.addEventListener('DOMContentLoaded', () => {
    
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const linesDisplay = document.querySelector('#lines');
    const levelDisplay = document.querySelector('#level');
    const startBtn = document.querySelector('#start-button');
    const width = 10;
    const perLevel = 10; // 10 lines per level
    let timerId;
    let score = 0;
    let lines = 0;
    let level = 1;
    let levelSpeed = 1000;
    let nextRandom = 0;
    let firstStarted = false;
    let isGameOver = false;
    let isPaused = false;
    let prevPositionFactor = 0;
    const numOfBlocks = 199;
    const colors = [
        'orange',
        'red',
        'purple',
        'green',
        'blue'
    ]

    // Starts the game by creating 210 rows in a loop.
    // This represents the game board.
    /*
    let newGrid = document.getElementsByClassName('grid')[0];
    for (let i = 0; i < 210; i++) {
        let element = document.createElement('div');
        if (i >= 200) {
            element.classList.add('taken');
        }
        newGrid.appendChild(element);
    }
*/

    // The Tetrominoes
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2], 
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width *2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1], // horizontal
        [width, width + 1, width + 2, width + 3],     // vertical
        [1, width + 1, width * 2 + 1, width * 3 + 1], // horizontal
        [width, width + 1, width + 2, width + 3]      // vertical
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    // Randomly select a tetromino
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // Draw the tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        });
    }

    //Undraw the tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';
        });
    }

    // Assign keycodes to move the tetromino
    function control(e) {

        // If the user hits the pause button AND the game is not over
        // then the player can still use the controls.
        // If the game is paused OR the game is over, disable the controls.
        if((isPaused === false) && (isGameOver === false))
        {
            if(e.keyCode === 37) {
                moveLeft();
            }
            else if(e.keyCode === 38) {
                rotate();
            }
            else if(e.keyCode === 39) {
                moveRight();
            }
            else if(e.keyCode === 40) {
                moveDown();
            }
        }
    }
    document.addEventListener('keydown', control);

    // Move down function
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Freeze function
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))

            // Starts a new tetromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4;
            addScore();
            draw();
            displayShape();
            gameOver();
        }
    }

    // Move the tetromino left
    function moveLeft() {
        undraw();

        // Checks the boundary to the left most edge, so the shape cannot go all the way left
        // Example: The tetromino cannot enter an index position of 0, 10, 20, 30, etc.
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if(!isAtLeftEdge) {
            currentPosition -= 1;
        }

        // If the area the tetromino is moving to is already taken, force the teromino back to its previous state.
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }

        draw();
    }

    function moveRight() {
        undraw();

        // Checks the boundary to the right most edge, so the shape cannot go all the way left
        // If the tetromino tries to go past the right edge, the program will push it back 1 square left.
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

        if(!isAtRightEdge) {
            currentPosition += 1;
        }

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }

        draw();

    }

    // Rotate the tetromino
    function rotate() {

        // If the current tetromino is NOT at one of the edges AND NOT the L-shaped tetromino.
        //if (!(isAtLeftEdge || isAtRightEdge) && !(theTetrominoes[random] === theTetrominoes[4]))
        //if (!(isAtLeftEdge || isAtRightEdge))
        //{

            undraw();

            // Checks all the tetromino edge cases
            checkTetrominoEdgeCases(); 

            currentRotation ++;

            // If the currentRotation's number is greater than the number of rotations in a tetromino array (4), reset back to the beginning (0)
            if(currentRotation === current.length) {
                currentRotation = 0;
            }
            current = theTetrominoes[random][currentRotation];
         //}
         draw ();

    }

    function checkTetrominoEdgeCases() {

        // Checks to see if at the left or right edge and keeps the shape rotation from spilling past either edge.
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === (width - 1));
        const isAtRightEdge2 = current.some(index => (currentPosition + index) % width === (width - 2)); // This is for the long tetromino

       // If it's the long stick tetromino
       if(theTetrominoes[random] === theTetrominoes[4]) {
        // If the tetromino is at the rightmost edge
        // prevPositionFactor is the past position of the long stick tetromino
        // When it rotates back to a vertical position, it will return the original position by adding either 1 or 2 back to its position.
        
            if(currentRotation === 0 || currentRotation === 2) {
                if(isAtLeftEdge) {
                    prevPositionFactor = 1;
                    currentPosition += prevPositionFactor;
                }
                else if(isAtRightEdge) {
                    prevPositionFactor = 2;
                    currentPosition -= prevPositionFactor;
                }    
                else if(isAtRightEdge2){
                    prevPositionFactor = 1;
                    currentPosition -= prevPositionFactor;
                }

            }
            //Otherwise, it's horizontal
            
            else {
                if(isAtRightEdge) {
                    //console.log("At right edge at " + (width - 1));
                    currentPosition += prevPositionFactor;
                }
                else if(isAtRightEdge2){
                    //console.log("At right edge 2 at " + (width - 2));
                    currentPosition += prevPositionFactor;
                }
            }
            

      }

    }

    // Shows the 'Next Up' tetromino in the mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;

    // The tetrominos without rotations for Next Up
    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], // lTetromino
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
        [0, 1, displayWidth, displayWidth + 1], //oTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] //iTetromino
    ]

    // Displays the next shape in the Next Up mini-grid display
    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = '';
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        })
    }

    // Add functionality to the function
    startBtn.addEventListener('click', () => {

        // Starts new game
        /*
        if(isGameOver === true) {
            startNewGame();
        }
        */
        // Pauses the game
        if(timerId) {
            clearInterval(timerId);
            timerId = null;
            isPaused = true;
            startBtn.innerHTML = "Resume Game";        
        }
        // Unpauses / Starts the game for the first time
        else {
            isPaused = false;
            draw();
            timerId = setInterval(moveDown, levelSpeed);
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            startBtn.innerHTML = "Pause Game";        

            // If the player hits the "Start" button for the very first time, show the Next Block too.
            // The reason we set firstStarted to true is to prevent players from start/pausing, changing the next block on every pause.
            if (firstStarted === false)
            {
                displayShape();
                firstStarted = true;
            }

        }

    })

    // Adds score to the score total
    function addScore() {

        // Calculates how many lines a player gets now.
        // This is to determine a single, double, triple, or Tetris lines
        // to calculate score
        let linesNow = 0;
        let scoreNow = 0;

        for (let i = 0; i < numOfBlocks; i +=width) {

            // This is if an entire row is filled, remove that row and add score (like in Tetris!)
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];

            if(row.every(index => squares[index].classList.contains('taken'))) {

                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                })

                // Removes the completed row
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);

                // Adds a new row to replace the completed (and deleted) row.
                squares.forEach(cell => grid.appendChild(cell))

                // Adds the line completed to the line total.
                linesNow +=1;

            }

        }

        // If there was a score and line change
        if(linesNow > 0) {
            lines += linesNow;
            linesDisplay.innerHTML = lines;

            scoreNow = calculateLineScore(linesNow);

            score +=scoreNow;
            scoreDisplay.innerHTML = score;

            levelUp();
        }


    }

    // Game over function
    function gameOver() {
        // If some of the cells in each row in the invisible buffer zone (lines 200-209) are 'taken', then the game
        // will be over.
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            gameStatus.innerHTML = 'Game Over!';
            startBtn.innerHTML = "Play New Game";     
            isGameOver = true; // Sets this to true and shows a 'Play New Game' button
            clearInterval(timerId); // Stops the automatic dropdown
        }
    }

    // Clears the score and the board to start a new game
    function startNewGame() {

        for (let i = 0; i < numOfBlocks; i +=width) {

            // Removes the completed row
            const squaresRemoved = squares.splice(i, width);
            squares = squaresRemoved.concat(squares);

            // Adds a new row to replace the completed (and deleted) row.
            squares.forEach(cell => grid.appendChild(cell))

        }

        isGameOver = false;
        isPaused = false;
        scoreDisplay.innerHTML = 0;
    }

    // Increases the level by 1 (the speed goes up too)
    function levelUp() {

        // +1 the level since level starts at 0.
        let nextLevel = level * perLevel;

        if(lines >= nextLevel){
            // If the current lines is over the next level, ex: 21 lines is over 20 for next level,
            // and it's not level 0 (lines less than 10), then increase the level.
            level +=1;

            // Caps the speed at 100 ms at level 10
            if (levelSpeed > 100) {
                levelSpeed -= 100;
            }

            levelDisplay.innerHTML = level;
            clearInterval(timerId);
            timerId = setInterval(moveDown, levelSpeed);
            //console.log("Level speed is currently: " + levelSpeed);
        }

    }

    function calculateLineScore(linesNow) {

        let scoreNow = 0;

        switch(linesNow) {
            case 1: // Single
                scoreNow = 100 * level;
                break;
            case 2: // Double
                scoreNow = 300 * level;
                break;
            case 3: // Triple
                scoreNow = 500 * level;
                break;
            case 4: // Tetris
                scoreNow = 1000 * level;
                break;
            default:
                scoreNow = 0;
        }

        return scoreNow;

    }

})