var express = require('express');
var rateLimit = require('express-rate-limit');
var app = express();
var repository = require('./db/repository');

app.use(express.json());

var apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
app.use('/health', apiLimiter);

app.get('/health', async function (req, res) {
  try {
    var { pool } = require('./db/index');
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.get('/api/history', async function (req, res) {
  try {
    var history = await repository.getMatchHistory();
    res.json(history);
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/match', async function (req, res) {
  var body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'invalid body' });
  }
  var gameMode = body.gameMode;
  var player1Name = body.player1Name;
  var player2Name = body.player2Name;
  var winnerName = body.winnerName;
  if (
    typeof gameMode !== 'string' ||
    typeof player1Name !== 'string' ||
    typeof player2Name !== 'string' ||
    typeof winnerName !== 'string'
  ) {
    return res.status(400).json({ error: 'invalid fields' });
  }
  try {
    await repository.saveLocalMatch(gameMode, player1Name, player2Name, winnerName);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
