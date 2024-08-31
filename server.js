const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public'))); // 'public' is the folder where your HTML and other assets are

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected...');
});

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Handle game creation
    socket.on('createGame', (callback) => {
        const gameId = generateGameId();
        const query = 'INSERT INTO games (game_id, player1_id, current_turn, status) VALUES (?, ?, ?, ?)';
        db.query(query, [gameId, socket.id, socket.id, 'ongoing'], (err, result) => {
            if (err) throw err;
            callback({ success: true, gameId, playerId: socket.id });
        });
    });

    // Handle joining a game
    socket.on('joinGame', (gameId,callback) => {
        const query2 = 'SELECT * FROM games WHERE game_id = ?';
        const query = 'SELECT player2_id FROM games WHERE game_id = ?';
        db.query(query, [gameId], (err, results) => {
            if (err) throw err;
            if (results.length === 0) {
                callback({ success: false, message: 'Game does not exist' });
            } else if (results[0].player2_id) {
                callback({ success: false, message: 'Game is full' });
            } else {
                const updateQuery = 'UPDATE games SET player2_id = ? WHERE game_id = ?';
                db.query(updateQuery, [socket.id, gameId], (updateErr) => {
                    if (updateErr) throw updateErr;
                    callback({ success: true, gameId, playerId: socket.id });
                    db.query(query2, [gameId], (err, results2) => {
                        if (err) throw err;
                        io.to(results2[0].player1_id).emit('gameStart', { gameId, player1Id: results2[0].player1_id, player2Id: socket.id });
                        io.to(socket.id).emit('gameStart', { gameId, player1Id: results2[0].player2_id, player2Id: socket.id });
                    });
                });
            }
        });
    });

    // Handle player moves
    socket.on('playerMove', ({ gameIdLocal, x, y, mark, win }) => {
        if (win) {
            let winner;
            let winner_id = '';
            let winnerQuery = 'SELECT * FROM games WHERE game_id = ?';
            db.query(winnerQuery, [gameIdLocal], (err, winner_info) => {
                if (err) throw err;
                winner_id = winner_info[0].winner_id;
                winner = winner_info;
            });
            console.log(`Player  with ${mark.toUpperCase} wins`);
            let winQuery = "UPDATE game SET status = 'finished' WHERE game_id = ?";
            let winQuery2 = 'UPDATE game SET winner_id = ?';
            db.query(winQuery, [gameIdLocal]);
            db.query(winQuery2, [socket.id]);
            if (winner_id[0].player1_id == winner) {
                
            }
            io.to(results3[0].player2_id).emit('playerMoved', { playerId: results3[0].player1_id, x, y, mark });
        }
        const query = 'INSERT INTO moves (game_id, player_id, x_coordinate, y_coordinate, mark) VALUES (?, ?, ?, ?, ?)';
        const query2 = 'SELECT * FROM games WHERE game_id = ?';
        db.query(query, [gameIdLocal, socket.id, x, y, mark], (err, result) => {
            if (err) throw err;
            db.query(query2, [gameIdLocal], (err,results3) => {
                if (err) throw err;
                if (results3[0].current_turn == results3[0].player1_id) {
                    io.to(results3[0].player2_id).emit('playerMoved', { playerId: results3[0].player1_id, x, y, mark });
                    let query4 = 'UPDATE games SET current_turn = ? WHERE game_id = ?';
                    socket.emit('playerMove' , { playerId: results3[0].player1_id, x, y, mark })
                    db.query(query4, [results3[0].player2_id, gameIdLocal], (err) => {
                        if (err) throw err;
                    });
                } else {
                    io.to(results3[0].player1_id).emit('playerMoved', { playerId: results3[0].player2_id, x, y, mark });
                    let query4 = 'UPDATE games SET current_turn = ? WHERE game_id = ?';
                    socket.emit('playerMove', { playerId: results3[0].player2_id, x, y, mark });
                    db.query(query4, [results3[0].player1_id, gameIdLocal], (err) => {
                        if (err) throw err;
                    });
                }
            });
            if (win) {
                
            }
        });
        socket.emit('showMove', { x, y, mark });
    });

    socket.on('rematchGame', (gameIdLocal) => {
        let rematches = 0;
        let p1_id = '';
        let p2_id = '';
        let queryx = 'SELECT * FROM games WHERE game_id = ?';
        db.query(queryx, [gameIdLocal], (err,resultx) => {
            if (err) throw err;
            p1_id = resultx.player1_id;
            p2_id = resultx.player2_id;
            rematches = resultx.rematches;
        })
        let query = 'UPDATE games SET rematches = ? WHERE game_id = ?';
            db.query(query, [rematches + 1,gameIdLocal], (err) => {
                if (err) throw err;
                rematches++;
        })
        if (rematches >= 2) {
            io.to(p1_id).emit('startGameFirst', { gameId: gameIdLocal, player1Id: p1_id, player2Id: p2_id });
            io.to(p2_id).emit('startGameSecond', { gameId: gameIdLocal, player1Id: p1_id, player2Id: p2_id });
        } else {
            io.to(p1_id).emit('AddOneRematchRequest', { gameId: gameIdLocal });
            io.to(p2_id).emit('AddOneRematchRequest', { gameId: gameIdLocal });
        }
    })

    // Handle disconnects
    socket.on('disconnect', () => {
        let disconnectQuery = "UPDATE games SET status = 'finished' WHERE player1_id = ? or player2_id = ?";
        db.query(disconnectQuery, [socket.id, socket.id], (err) => {
            if (err) throw err;
        });
        console.log('Player disconnected:', socket.id);
    });
});

function generateGameId() {
    let chars = '0123456789';
    let gameId = '';
    for (let i = 0; i < 5; i++) {
        gameId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return gameId;
}

function checkForWin(gameId, playerId, x, y, mark) {
    
}

function showWins(list,gameId, playerId) {
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
        showWinnerOnline(gameId, playerId);
    }, timeout + 1000);
    document.querySelectorAll('.case').forEach((el) => {
        el.onclick = null;
        el.style.cursor = 'default';
    });
}

function showWinnerOnline(gameId, playerId) {
    const query = 'UPDATE games SET status = ? WHERE game_id = ?';
    db.query(query, ['finished', gameId], (err, result) => {
        if (err) throw err;
        io.to(gameId).emit('gameOver', { winnerId: playerId });
    });
    db
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});