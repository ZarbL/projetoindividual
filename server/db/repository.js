var { pool } = require('./index');

async function createMatch(gameName, gameMode, player1Name) {
  await pool.query(
    'INSERT INTO matches (game_name, game_mode, player1_name) VALUES ($1, $2, $3)',
    [gameName, gameMode, player1Name]
  );
}

async function updateMatchPlayer2(gameName, player2Name) {
  await pool.query(
    'UPDATE matches SET player2_name = $2 WHERE game_name = $1 AND status = $3',
    [gameName, player2Name, 'in_progress']
  );
}

async function finishMatch(gameName, winnerName, loserName) {
  await pool.query(
    `UPDATE matches
     SET status = 'finished', winner_name = $2, player2_name = COALESCE(player2_name, $3), ended_at = NOW()
     WHERE game_name = $1 AND status = 'in_progress'`,
    [gameName, winnerName, loserName]
  );
}

async function saveLocalMatch(gameMode, player1Name, player2Name, winnerName) {
  await pool.query(
    `INSERT INTO matches (game_name, game_mode, player1_name, player2_name, status, winner_name, ended_at)
     VALUES ($1, $2, $3, $4, 'finished', $5, NOW())`,
    ['local_' + Date.now(), gameMode, player1Name, player2Name, winnerName]
  );
}

async function addPlayer(socketId, playerName, gameName) {
  await pool.query(
    'INSERT INTO players (socket_id, player_name, game_name) VALUES ($1, $2, $3)',
    [socketId, playerName, gameName]
  );
}

async function getMatchHistory() {
  var result = await pool.query(
    `SELECT id, game_mode, player1_name, player2_name, winner_name, status, created_at, ended_at
     FROM matches
     ORDER BY created_at DESC
     LIMIT 20`
  );
  return result.rows;
}

module.exports = { createMatch, updateMatchPlayer2, finishMatch, saveLocalMatch, addPlayer, getMatchHistory };
