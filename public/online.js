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
    document.querySelectorAll('.x').forEach((el) => {
        el.classList.remove('x');
    });
    document.querySelectorAll('.o').forEach((el) => {
        el.classList.remove('o');
    });
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