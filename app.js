const gameBoard = (function() {
    //2. create a new board array
    function createBoard(fn) {
        this.board = []
        for (let i = 0; i < 3; i++){
            this.board.push([null, null, null])
        }

        //3. select a dom container for game board
        const boardParent = document.querySelector('#board');
        boardParent.innerHTML = ''
        for (let i = 1; i <= 3; i++){
            const cells = `<div class="cell" data-row="${i}" data-column="1"></div>
                            <div class="cell" data-row="${i}" data-column="2"></div>
                            <div class="cell" data-row="${i}" data-column="3"></div>`
            boardParent.insertAdjacentHTML('beforeend', cells)
        }

        //4. add click event listener to cells (go to gameLoop make move)
        document.querySelectorAll('.cell').forEach(el => {
            el.addEventListener('click', fn)
        })
    }

    function updateCell(row, column, letter) {
        this.board[row][column] = letter
    }

    return {createBoard, updateCell}
})();

const domUpdater = (function() {
    function updateBoard(arr) {
        for (let i = 1; i <= 3; i++){
            for (let j = 1; j <= 3; j++){
                const cell = document.querySelector(`[data-row="${i}"][data-column="${j}"]`)
                cell.textContent = arr[i-1][j-1];
            }
        }
    }

    return {updateBoard}
})();


const Player = (name, letter) => {
    const pLetter = letter
    const movesArray = gameBoard.board

    //9. receive row and col values from gameLop
    function makeMove(row, column) {
        //10. will asume is computer move if no row or column (go to Player computerChoice)
        if (isNaN(row) || isNaN(column)) [row, column] = this.computerChoice(gameBoard.board)
        //10b. if is already filled, return
        else if (gameBoard.board[row][column] !== null) return;
        gameBoard.updateCell(row, column, this.pLetter)
    }

    function computerChoice(arr){
        //11. store and check rows, columns and possible plays
        let row = null;
        let column = null;
        let possPlays = [];

        //12. create a random available move
        do {
            row = Math.floor(Math.random() * 3)
            column = Math.floor(Math.random() * 3)
        } while (arr[row][column] !== null)

        //13. add to possible plays
        possPlays.push([row, column])
        
        for (let i = 0; i < 3; i++){
            let rowResult = '';
            let colResult = '';
            let diagResult = '';

            for (let j = 0; j < 3; j++){
                rowResult += arr[i][j]
                colResult += arr[j][i]
            }

            if (i === 0) {
                diagResult = `${arr[0][0]}${arr[1][1]}${arr[2][2]}`;
            } else if (i === 2) {
                diagResult = `${arr[0][2]}${arr[1][1]}${arr[2][0]}`;
            }

            if (rowResult === 'nullOO' || rowResult === 'nullXX') possPlays.push([i, 0, 1])
            if (rowResult === 'OnullO' || rowResult === 'XnullX') possPlays.push([i, 1, 1])
            if (rowResult === 'OOnull' || rowResult === 'XXnull') possPlays.push([i, 2, 1])
            if (colResult === 'nullOO' || colResult === 'nullXX') possPlays.push([0, i, 1])
            if (colResult === 'OnullO' || colResult === 'XnullX') possPlays.push([1, i, 1])
            if (colResult === 'OOnull' || colResult === 'XXnull') possPlays.push([2, i, 1])
            if (diagResult === 'nullOO' || diagResult === 'nullXX') i === 0 ? possPlays.push([0, 0, 1]) : possPlays.push([0, 2, 1]);
            if (diagResult === 'OnullO' || diagResult === 'XnullX') possPlays.push([1, 1, 1])
            if (diagResult === 'OOnull' || diagResult === 'XXnull') i === 0 ? possPlays.push([2, 2, 1]) : possPlays.push([2, 0, 1])
        }

        
        let thisPlay = possPlays[Math.floor(Math.random() * possPlays.length)]
        if (!thisPlay[2]) thisPlay = possPlays[Math.floor(Math.random() * possPlays.length)]
        let juice = arr[thisPlay[0]][thisPlay[1]]
        while (juice !== null){
            thisPlay = possPlays[Math.floor(Math.random() * possPlays.length)]
            juice = arr[thisPlay[0]][thisPlay[1]]
        }
        if (!thisPlay[2]) thisPlay = possPlays[Math.floor(Math.random() * possPlays.length)]
        return thisPlay
    }
    return {name, pLetter, makeMove, computerChoice}
}

const gameLoop = (function() {
    //1. call to create a board array and in dom (go to gameBoard)
    gameBoard.createBoard(makeMove)
    
    //5. set gameMode and player's turn
    let secondPlayer = false
    let pvp = false
    let update = false

    const player1 = Player('Player 1', 'X')
    const player2 = Player('Player 2', 'O')
    const computer = Player('Computer', 'O')
    let hasWinner = false
    let hasMovesLeft = true

    //6. wait for user's click
    function makeMove(e){
        //6b. if user clicked on used cell return
        try {
            if (e.target.textContent) return false;
        } catch {
            
        }
        //7. get cell position from data attributes
        //console.log(e.target.dataset)
        const {row, column} = (function() {
            if (!e) return {row: null, column: null}
            return e.target.dataset
        })()

        //8. check which player's move (go to Player makeMove)
        if (!secondPlayer){
            player1.makeMove(row-1, column-1)
            secondPlayer = true
        } else if (secondPlayer && pvp) {
            player2.makeMove(row-1, column-1)
            secondPlayer = false
        } else {
            if (!hasMovesLeft) return;
            computer.makeMove()
            secondPlayer = false
        }

        domUpdater.updateBoard(gameBoard.board)
        checkWinner(gameBoard.board)
        if (secondPlayer && !pvp && !hasWinner && hasMovesLeft) makeMove();

    }

    document.querySelectorAll('#player-names input').forEach(el => {
        el.addEventListener('change', (e) => {
            if (e.target.id === 'p1-name') return player1.name = el.value
            player2.name = el.value
        })
    })

    document.querySelector('#reset-game').addEventListener('click', resetGame)

    const modeBtn = document.querySelector('#game-mode')
    modeBtn.addEventListener('click', changeMode)

    function changeMode(){
        pvp = !pvp
        modeBtn.innerHTML = pvp ? '<i class="fas fa-user-friends"></i>&nbsp;2P' : '<i class="fas fa-robot"></i>&nbsp;AI'
        resetGame()
    }

    changeMode()

    function checkWinner(arr){
        let diagResult1 = `${arr[0][0]}${arr[1][1]}${arr[2][2]}`;
        let diagResult2 = `${arr[0][2]}${arr[1][1]}${arr[2][0]}`;
        let result;
        // check rows
        for (let i = 0; i < 3; i++){
            result = '';
            for (let j = 0; j < 3; j++){
                result += arr[i][j]
            }
            if (result === 'XXX' || result === 'OOO' || diagResult1 === 'XXX' || diagResult1 === 'OOO') {
                hasWinner = true
                break
            }
            // check columns
            result = ''
            result += arr[0][i]
            result += arr[1][i]
            result += arr[2][i]
            if (result === 'XXX' || result === 'OOO' || diagResult2 === 'XXX' || diagResult2 === 'OOO') {
                hasWinner = true
                break
            }
        }

        // check if moves left
        hasMovesLeft = gameBoard.board.some(arr => arr.includes(null))
        
        if (hasWinner || !hasMovesLeft) {
            document.querySelectorAll('.cell').forEach(el => {
                el.removeEventListener('click', makeMove)
                el.addEventListener('click', resetGame)
            })
        }

        if (hasWinner) {
            const winnerText = secondPlayer ? `${player1.name.toUpperCase()} WINS` : `${pvp ? player2.name.toUpperCase() : 'THE ROBOT'} WINS`
            document.querySelector('#result').textContent = winnerText
            //resetGame()
        } else if (!hasMovesLeft) {
            document.querySelector('#result').textContent = 'TIE'
        }
    }

    function resetGame() {
        document.querySelector('#result').textContent = 'TIC-TAC-TOE (with AI!)'
        hasWinner = false
        hasMovesLeft = true
        secondPlayer = false
        gameBoard.createBoard(makeMove)
        domUpdater.updateBoard(gameBoard.board)
    }

    return {makeMove, checkWinner}
})();
