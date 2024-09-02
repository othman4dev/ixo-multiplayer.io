# iox.io

<br><img src="./public/images/logo.webp" width="50"><br>

An X-O game where players need to align 5 successive symbols to score points.

## Game Description
iox.io is a web-based game where two players take turns marking spaces in a grid. The objective is to be the first to align 5 successive symbols (either X or O) horizontally, vertically, or diagonally.

## Technologies Used
- HTML
- CSS
- JavaScript
- Bootstrap Icons
- Node js ( Express js, socketIo )

## How to install

First, clone the repository :

```md
    git clone https://github.com/othman4dev/iox.io.git
```
Get to the repository folder :

```md
    cd iox.io
```
Open folder in Visual Studio Code :

```md
    code .
```
Now start your node server
```md
    node server.js
```
Now navigate to [http://localhost:3000/](http://localhost:3000/)

### Or simply navigate to [The game online](https://tictactoe.otmankharbouch.live) .

## How to Play
1. The game is played on a grid 20x20.
2. Players take turns to place their symbol (X or O) in an empty cell.
3. The first player to align 5 successive symbols in any direction (horizontal, vertical, or diagonal) wins the game.
4. If all cells are filled and no player has aligned 5 symbols, the game ends in a draw.

## Documentation

- This game was written in JavaScript for web single-play and multi-play.
- This game uses the webSockets by SocketIo package technology to maintain real time communication between the client-side and server-side.

### Project Structure

```plaintext
ixo_multiplayer.io/
├── node_modules/
├── public/
│   ├── images/
│   ├── index.html
│   ├── script.js
│   ├── online.js
│   ├── online.html
│   └── style.css
├── README.md
├── .env
├── .env-online
├── package.json
└── package-lock.json
```

| Directory/File     | Description                                      |
|--------------------|--------------------------------------------------|
| `node_modules/`     | Contains npm dependencies                        |
| `public/`           | Front-end assets and HTML files                  |
| `public/images/`    | Images used in the project                       |
| `public/index.html` | Main HTML file                                   |
| `public/script.js`  | Client-side JavaScript                           |
| `public/style.css`  | Main stylesheet                                  |
| `.env`              | Development environment variables                |
| `.env-online`       | Production environment variables                 |
| `package.json`      | Project metadata and npm scripts                 |
| `README.md`         | Project documentation                            |

## Links
- [Play the Game](https://tictactoe.otmankharbouch.live)
- [GitHub Repository](https://github.com/othman4dev/iox.io)
- [Developer's Portfolio](http://otmankharbouch.live)

