var { Pool } = require('pg');
var fs = require('fs');
var path = require('path');

var poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'mkjs'
    };

var pool = new Pool(poolConfig);

async function initDb() {
  var schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
}

module.exports = { pool, initDb };
