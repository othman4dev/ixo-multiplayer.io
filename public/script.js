let turn = 1;
let win = false;
let color = '';
let red = 'rgb(203, 36, 24)';
let blue = 'rgb(24, 111, 203)';
let player1 = 0;
let player2 = 0;



function setScore() {
    localStorage.setItem('player1', player1);
    localStorage.setItem('player2', player2);
}

function getScore() {
    player1 = localStorage.getItem('player1') || 0;
    player2 = localStorage.getItem('player2') || 0;
    updateScore();
}
getScore();
function updateScore() {
    document.getElementById('count1').innerText = player1;
    document.getElementById('count2').innerText = player2;
}

const elements = document.querySelectorAll('.case');

elements.forEach((element, index) => {
    const row = Math.floor(index / 20);
    const col = index % 20;
    element.dataset.row = row;
    element.dataset.col = col;
});

function clickCase(el) {
    if (document.querySelectorAll('.case').length == document.querySelectorAll('.x').length + document.querySelectorAll('.o').length) {
        showHideProtection('show');
        document.getElementById('main').style.backgroundColor = 'rgb(24, 111, 203)';
        document.getElementById('winner').style.display = 'flex';
        document.getElementById('winner-message').innerText = 'Draw';
        return;
    }
    if (turn === 1) {
        el.innerHTML = `<i class="bi bi-x-lg" style="color: rgb(24, 111, 203)"></i>`;
        el.classList.add('x');
        el.onclick = null;
        turn = 2;
        color = red;
        showTurn();
    } else {
        el.innerHTML = `<i class="bi bi-circle" style="color: rgb(203, 36, 24)"></i>`;
        turn = 1;
        color = blue;
        el.classList.add('o');
        el.onclick = null;
        showTurn();
    }
    checkWin(el);
}
function showTurn() {
    modifyHoverStyle('.case', `background-color: ${color};`);
    if (turn === 2) {
        document.getElementById('turn-message').innerText = `Player 2 's turn`;
    } else {
        document.getElementById('turn-message').innerText = `Player 1 's turn`;
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
    }
}
function showWin(list) {
    let timeout = 0;
    list.forEach(element => {
        if (turn == 1) {
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
    console.log(list);
    setTimeout(() => {
        showWinner();
    }, timeout + 1000);
    document.querySelectorAll('.case').forEach((el) => {
        el.onclick = null;
        el.style.cursor = 'default';
    });
}
function showWinner() {
    showHideProtection('show');
    if (turn == 2) {
        player1++;
        console.log('Player 1 wins');
        document.getElementById('main').style.backgroundColor = 'rgb(24, 111, 203)';
        document.getElementById('winner').style.display = 'flex';
        document.getElementById('winner-message').innerText = 'Player 1 wins';
    } else {
        player2++;
        console.log('Player 2 wins');
        document.getElementById('main').style.backgroundColor = 'rgb(203, 36, 24)';
        document.getElementById('winner').style.display = 'flex';
        document.getElementById('winner-message').innerText = 'Player 2 wins';
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
        el.onclick = function () {
            clickCase(el);
        };
        
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
    player1 = 0;
    player2 = 0;
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