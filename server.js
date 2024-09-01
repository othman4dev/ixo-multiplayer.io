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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
    socket.on('createGame', (callback) => {
        const gameId = generateGameId();
        const query = 'INSERT INTO games (game_id, player1_id, current_turn, status) VALUES (?, ?, ?, ?)';
        db.query(query, [gameId, socket.id, socket.id, 'ongoing'], (err, result) => {
            if (err) throw err;
            callback({ success: true, gameId, playerId: socket.id });
        });
    });

    socket.on('resigned', (gameId, player_resigned_id) => {
        let info = 'SELECT * FROM games WHERE game_id = ?';
        db.query(info, [gameId], (err, results) => {
            if (err) throw err;
            let query = 'UPDATE games SET status = ? WHERE game_id = ?';
            db.query(query, ['finished', gameId], (err) => {
                if (err) throw err;
            });
            let query2 = 'UPDATE games SET winner_id = ? WHERE game_id = ?';
            db.query(query2, [player_resigned_id, gameId], (err) => {
                if (err) throw err;
            });
            io.to(gameId).emit('playerResigned', { playerId: player_resigned_id });
        });
    })

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

    socket.on('playerMove', ({ gameIdLocal, x, y, mark, win }) => {
        if (win) {
            if (mark == 'x') {
                let winnerQuery = 'SELECT * FROM games WHERE game_id = ?';
                db.query(winnerQuery, [gameIdLocal], (err, winner_info) => {
                    if (err) throw err;
                    let winQuery = "UPDATE games SET status = 'finished' WHERE game_id = ?";
                    let winQuery2 = 'UPDATE games SET winner_id = ? WHERE game_id = ?';
                    db.query(winQuery, [gameIdLocal]);
                    db.query(winQuery2, [winner_info[0].player1_id,gameIdLocal]);
                });
            } else {
                let winnerQuery = 'SELECT * FROM games WHERE game_id = ?';
                db.query(winnerQuery, [gameIdLocal], (err, winner_info) => {
                    if (err) throw err;
                    let winQuery = "UPDATE games SET status = 'finished' WHERE game_id = ?";
                    let winQuery2 = 'UPDATE games SET winner_id = ? WHERE game_id = ?';
                    db.query(winQuery, [gameIdLocal]);
                    db.query(winQuery2, [winner_info[0].player2_id,gameIdLocal]);
                });
            }
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
        });
        socket.emit('showMove', { x, y, mark });
    });

    socket.on('rematchGame', (gameIdLocal) => {
        var rematches = 0;
        let p1_id = '';
        let p2_id = '';
        let queryx = 'SELECT * FROM games WHERE game_id = ?';
        db.query(queryx, gameIdLocal, (err,resultx) => {
            if (err) throw err;
            p1_id = resultx[0].player1_id;
            p2_id = resultx[0].player2_id;
            rematches = resultx[0].rematches;
            rematches = rematches + 1;
            let query3 = 'UPDATE games SET rematches = ? WHERE game_id = ?';
            db.query(query3, [rematches, gameIdLocal], (err) => {
                if (err) throw err;
                if (rematches == 2) {
                    const gameId = generateGameId();
                    let query2 = 'INSERT INTO games (game_id, player1_id, player2_id,current_turn, status) VALUES (?, ?, ?, ?, ?)';
                    db.query(query2, [gameId, p1_id, p2_id, p1_id, 'ongoing'], (err, result) => {
                        if (err) throw err;
                    });
                    io.to(p1_id).emit('AddOneRematchRequest', { gameId: gameIdLocal });
                    io.to(p2_id).emit('AddOneRematchRequest', { gameId: gameIdLocal });
                    io.to(p1_id).emit('gameStart', { gameId, player1Id: p1_id, player2Id: p2_id });
                    io.to(p2_id).emit('gameStart', { gameId, player1Id: p1_id, player2Id: p2_id });
                } else {
                    io.to(p1_id).emit('AddOneRematchRequest', { gameId: gameIdLocal });
                    io.to(p2_id).emit('AddOneRematchRequest', { gameId: gameIdLocal });
                }
            })
        })
    })

    socket.on('disconnect', () => {
        let p2;
        let search = "SELECT * FROM games WHERE status = ? AND player1_id = ?";
        let search2 = "SELECT * FROM games WHERE status = ? AND player2_id = ?";
        let updateQuery = "UPDATE games SET status = 'finished' WHERE player1_id = ?";
        let updateQuery2 = "UPDATE games SET status = 'finished' WHERE player2_id = ?";
        let winnerQuery = "UPDATE games SET winner_id = ? WHERE player1_id = ?";
        let winnerQuery2 = "UPDATE games SET winner_id = ? WHERE player2_id = ?";
        db.query(search, ['ongoing', socket.id], (err,result) => {
            if (err) throw err;
            if (result.length !== 0) {
                // just disconnect the player
            } else
            if (result[0]) {
                io.to(result[0].player2_id).emit('opponentResigned');
                db.query(updateQuery, [socket.id], (err2) => {
                    if (err2) throw err2;
                });
                db.query(winnerQuery, [result[0].player2_id,socket.id], (err3) => {
                    if (err3) throw err3;
                });
            } else {
                db.query(search2, ['ongoing',socket.id], (err4,result2) => {
                    if (err4) throw err4;
                    if (result2[0]) {
                        io.to(result2[0].player1_id).emit('opponentResigned');
                        db.query(updateQuery2, [socket.id], (err5) => {
                            if (err5) throw err5;
                        });
                        db.query(winnerQuery2, [result2[0].player2_id,socket.id], (err6) => {
                            if (err6) throw err6;
                        });
                    }
                });
            }
        })
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