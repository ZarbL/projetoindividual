var app = require('./app'),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    { initDb } = require('./db/index'),
    repository = require('./db/repository'),
    GameCollection = require('./games.js').GameCollection;

app.use(require('express').static(__dirname + '/../game'));

function onGameEnd(gameName, winnerSocket, loserSocket) {
  var winnerName = winnerSocket.playerName || winnerSocket.id;
  var loserName = loserSocket.playerName || loserSocket.id;
  repository.finishMatch(gameName, winnerName, loserName).catch(function (err) {
    console.error('Failed to finish match:', err.message);
  });
}

var games = new GameCollection(onGameEnd);

var Responses = {
    SUCCESS: 0,
    GAME_EXISTS: 1,
    GAME_NOT_EXISTS: 2,
    GAME_FULL: 3
  },
  Requests = {
    CREATE_GAME: 'create-game',
    JOIN_GAME: 'join-game'
  };

io.on('connection', function (socket) {
  socket.on(Requests.CREATE_GAME, function (data) {
    var gameName = typeof data === 'object' && data !== null ? data.gameName : data;
    var playerName = typeof data === 'object' && data !== null ? data.playerName : 'Player 1';

    socket.playerName = playerName;

    if (games.createGame(gameName)) {
      games.getGame(gameName).addPlayer(socket);
      repository.createMatch(gameName, 'network', playerName).catch(function (err) {
        console.error('Failed to create match record:', err.message);
      });
      repository.addPlayer(socket.id, playerName, gameName).catch(function (err) {
        console.error('Failed to add player record:', err.message);
      });
      socket.emit('response', Responses.SUCCESS);
    } else {
      socket.emit('response', Responses.GAME_EXISTS);
    }
  });

  socket.on(Requests.JOIN_GAME, function (data) {
    var gameName = typeof data === 'object' && data !== null ? data.gameName : data;
    var playerName = typeof data === 'object' && data !== null ? data.playerName : 'Player 2';

    socket.playerName = playerName;

    var game = games.getGame(gameName);
    if (!game) {
      socket.emit('response', Responses.GAME_NOT_EXISTS);
    } else {
      if (game.addPlayer(socket)) {
        repository.updateMatchPlayer2(gameName, playerName).catch(function (err) {
          console.error('Failed to update match player2:', err.message);
        });
        repository.addPlayer(socket.id, playerName, gameName).catch(function (err) {
          console.error('Failed to add player record:', err.message);
        });
        socket.emit('response', Responses.SUCCESS);
      } else {
        socket.emit('response', Responses.GAME_FULL);
      }
    }
  });
});

initDb()
  .then(function () {
    server.listen(8888, function () {
      console.log('Server running on port 8888');
    });
  })
  .catch(function (err) {
    console.error('Database connection failed:', err.message);
    console.warn('Starting server without database...');
    server.listen(8888, function () {
      console.log('Server running on port 8888 (no database)');
    });
  });
