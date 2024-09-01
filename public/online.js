let turn = 1;
let win = false;
let playerName = '';
let opponentName = '';
let lastMove = 'p2';
let color = '';
let red = 'rgb(203, 36, 24)';
let blue = 'rgb(24, 111, 203)';
let wins = 0;
let losses = 0;

function removeEventListeners() {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    window.removeEventListener('unload', unloadHandler);
    window.removeEventListener('load', loadHandler);
}

function setScore() {
    localStorage.setItem('wins', wins);
    localStorage.setItem('losses', losses);
}

function getScore() {
    if (!localStorage.getItem('wins')) {
        localStorage.setItem('wins', 0);
    } else {
        wins = localStorage.getItem('wins');
    }
    if (!localStorage.getItem('losses')) {
        localStorage.setItem('losses', 0);
    } else {
        losses = localStorage.getItem('losses');
    }
    updateScore();
}
getScore();
function updateScore() {    
    document.getElementById('count1').innerText = wins;
    document.getElementById('count2').innerText = losses;
}

const elements = document.querySelectorAll('.case');

elements.forEach((element, index) => {
    const row = Math.floor(index / 20);
    const col = index % 20;
    element.dataset.row = row;
    element.dataset.col = col;
});
function showTurn() {
    modifyHoverStyle('.case', `background-color: ${color};`);
    if (lastMove == 'p1') {
        if (lastMove !== playerName) {
            document.getElementById('turn-message').innerText = `Your turn`;
        } else {
            document.getElementById('turn-message').innerText = `Player 2 's turn`;
        }
    } else {
        if (lastMove !== playerName) {
            document.getElementById('turn-message').innerText = `Your turn`;
        } else {
            document.getElementById('turn-message').innerText = `Player 1 's turn`;
        }
    }
    document.getElementById('turns').style.display = 'flex';
    document.getElementById('turns').style.animationName = 'popup';
    document.getElementById('turns').style.backgroundColor = color;
    document.getElementById('main').style.backgroundColor = color;
    setTimeout(() => {
        document.getElementById('turns').style.display = 'none';
        document.getElementById('turns').style.animationName = 'none';
    }, 805);
}
function checkWin(el) {
    const mark = el.classList[el.classList.length - 1];
    const row = parseInt(el.dataset.row);
    const col = parseInt(el.dataset.col);
    let checked = [];

    function checkHorizontal() {
        let count = 0;
        for (let i = -4; i <= 4; i++) {
            const c = col + i;
            const cell = document.querySelector(`[data-row='${row}'][data-col='${c}']`);
            if (cell && cell.classList.contains(mark)) {
                checked.push(cell);
                count++;
                if (count === 5) return checked;
            } else {
                checked = [];
                count = 0;
            }
        }
        return false;
    }

    function checkVertical() {
        let count = 0;
        for (let i = -4; i <= 4; i++) {
            const r = row + i;
            const cell = document.querySelector(`[data-row='${r}'][data-col='${col}']`);
            if (cell && cell.classList.contains(mark)) {
                checked.push(cell);
                count++;
                if (count === 5) return checked;
            } else {
                checked = [];
                count = 0;
            }
        }
        return false;
    }

    function checkDiagonal1() {
        let count = 0;
        for (let i = -4; i <= 4; i++) {
            const r = row + i;
            const c = col + i;
            const cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            if (cell && cell.classList.contains(mark)) {
                checked.push(cell);
                count++;
                if (count === 5) return checked;
            } else {
                checked = [];
                count = 0;
            }
        }
        return false;
    }

    function checkDiagonal2() {
        let count = 0;
        for (let i = -4; i <= 4; i++) {
            const r = row + i;
            const c = col - i;
            const cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            if (cell && cell.classList.contains(mark)) {
                checked.push(cell);
                count++;
                if (count === 5) return checked;
            } else {
                checked = [];
                count = 0;
            }
        }
        return false;
    }

    if (checkHorizontal() || checkVertical() || checkDiagonal1() || checkDiagonal2()) {
        showWin(checked);
        return true;
    } else {
        return false;
    }
}


function info(message) {
    document.getElementById('info-message').innerText = message;
    document.getElementById('info-pop').style.display = 'flex';
    document.getElementById('info-pop').style.animationName = 'popup';
    setTimeout(() => {
        document.getElementById('info-pop').style.display = 'none';
        document.getElementById('info-pop').style.animationName = 'none';
    }, 805);
}

function showWin(list) {
    showHideProtection('show');
    let timeout = 0;
    list.forEach(element => {
        if (lastMove == 'p2') {
            setTimeout(() => {
                element.style.boxShadow = `0 0 0 20px inset rgb(255, 174, 168)`;
                element.style.borderColor = red;
            }, timeout);
        } else {
            setTimeout(() => {
                element.style.boxShadow = `0 0 0 20px inset rgb(168, 210, 255)`;
                element.style.borderColor = blue;
            }, timeout);
        }
        timeout += 200;
    });
    setTimeout(() => {
        showWinner();
    }, timeout + 1000);
    document.querySelectorAll('.case').forEach((el) => {
        el.onclick = null;
        el.style.cursor = 'default';
    });
}

function youWin() {
    wins++;
    document.getElementById('rematch-btn').style.display = 'none';
    showHideProtection('show');
    document.getElementById('main').style.backgroundColor = 'rgb(24, 111, 203)';
    document.getElementById('winner').style.display = 'flex';
    document.getElementById('winner-message').innerText = 'You Won By Resign';
    setScore();
    updateScore();
    removeEventListeners();
}

function showWinner() {
    removeEventListeners();
    showHideProtection('show');
    let winner = lastMove;
    if (winner == playerName) {
        wins++;
        document.getElementById('main').style.backgroundColor = 'rgb(24, 111, 203)';
        document.getElementById('winner').style.display = 'flex';
        document.getElementById('winner-message').innerText = 'You Won';
    } else {
        losses++;
        document.getElementById('main').style.backgroundColor = 'rgb(203, 36, 24)';
        document.getElementById('winner').style.display = 'flex';
        document.getElementById('winner-message').innerText = 'You Lost';
    }
    setScore();
    updateScore();
}

function continueGame() {
    showHideProtection('hide');
    document.getElementById('winner').style.display = 'none';
    document.getElementById('main').style.backgroundColor = color;
    document.querySelectorAll('.case').forEach((el) => {
        el.innerHTML = '';
        modifyHoverStyle('.case', `background-color: ${color};`);
        el.style.cursor = 'pointer';
        el.classList.remove('x');
        el.classList.remove('o');
        el.style.boxShadow = 'none';
        el.style.border = 'solid 1px #0000007c';
    });
    turn = 1;
    color = blue;
    showTurn();
}

function clearCounter() {
    showHideProtection('hide');
    wins = 0;
    losses = 0;
    setScore();
    updateScore();
    continueGame();
}

function modifyHoverStyle(selector, newStyle) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `${selector}:hover { ${newStyle} }`;
    document.head.appendChild(style);
}

function showHideProtection(choice) {
    if (choice == 'hide') {
        document.getElementById('protection').style.display = 'none';
    } else {
        document.getElementById('protection').style.display = 'flex';
    }
}

function showGameIDInput() {
    document.getElementById('game-id').style.display = 'flex';
}

function alertForm(message) {
    document.getElementById('form-message').style.display = 'block';
    document.getElementById('form-message').innerText = message;
}



function copyToClipBoard(el) {
    let text =document.getElementById('id-share').innerText;
    navigator.clipboard.writeText(text).then(function() {
        el.innerHTML = `<i class="bi bi-clipboard-check"></i>`;
    }, function(err) {
        el.innerHTML = `<i class="bi bi-clipboard-x"></i>`;
    });
}

function clickCaseOnline(el) {
    Socket.emit('played', el.id);
}