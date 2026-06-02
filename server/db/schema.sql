CREATE TABLE IF NOT EXISTS players (
    id          SERIAL PRIMARY KEY,
    socket_id   VARCHAR(100),
    player_name VARCHAR(100) NOT NULL,
    game_name   VARCHAR(100) NOT NULL,
    joined_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
    id              SERIAL PRIMARY KEY,
    game_name       VARCHAR(100) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'in_progress',
    created_at      TIMESTAMP DEFAULT NOW(),
    ended_at        TIMESTAMP
);

ALTER TABLE matches ADD COLUMN IF NOT EXISTS game_mode    VARCHAR(20)  NOT NULL DEFAULT 'network';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS player1_name VARCHAR(100);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS player2_name VARCHAR(100);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS winner_name  VARCHAR(100);
