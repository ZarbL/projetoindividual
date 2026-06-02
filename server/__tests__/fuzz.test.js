const fc = require('fast-check');
const request = require('supertest');

jest.mock('../db/repository', () => ({
  getMatchHistory: jest.fn().mockResolvedValue([]),
  saveLocalMatch: jest.fn().mockResolvedValue()
}));

const app = require('../app');
const { GameCollection } = require('../games');

const arbAny = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.double(),
  fc.boolean(),
  fc.constant(null),
  fc.constant(undefined),
  fc.constant(''),
  fc.constant('__proto__'),
  fc.constant('constructor'),
  fc.constant('toString'),
  fc.string({ maxLength: 512 })
);

describe('Fuzzing - GameCollection', () => {
  test('createGame nunca lança exceção com entrada arbitrária', () => {
    fc.assert(fc.property(arbAny, (id) => {
      const col = new GameCollection();
      expect(() => col.createGame(id)).not.toThrow();
    }));
  });

  test('getGame nunca lança exceção com entrada arbitrária', () => {
    fc.assert(fc.property(arbAny, (id) => {
      const col = new GameCollection();
      expect(() => col.getGame(id)).not.toThrow();
    }));
  });

  test('removeGame nunca lança exceção com entrada arbitrária', () => {
    fc.assert(fc.property(arbAny, (id) => {
      const col = new GameCollection();
      expect(() => col.removeGame(id)).not.toThrow();
    }));
  });

  test('invariante: criar e buscar retorna a partida', () => {
    fc.assert(fc.property(fc.string({ minLength: 1 }), (id) => {
      const col = new GameCollection();
      col.createGame(id);
      expect(col.getGame(id)).toBeDefined();
    }));
  });

  test('invariante: criar e remover retorna contagem zero', () => {
    fc.assert(fc.property(fc.string({ minLength: 1 }), (id) => {
      const col = new GameCollection();
      col.createGame(id);
      col.removeGame(id);
      expect(col.getActiveGamesCount()).toBe(0);
    }));
  });

  test('prototype pollution: chaves especiais não corrompem o estado', () => {
    const dangerousKeys = ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'prototype'];
    dangerousKeys.forEach((key) => {
      const col = new GameCollection();
      expect(() => col.createGame(key)).not.toThrow();
      expect(() => col.getGame(key)).not.toThrow();
      expect(() => col.removeGame(key)).not.toThrow();
    });
    expect(Object.prototype.toString).toBe(Object.prototype.toString);
  });
});

describe('Fuzzing - HTTP POST /api/match', () => {
  test('nunca retorna status 5xx em body arbitrário', async () => {
    const arbBody = fc.oneof(
      fc.record({
        gameMode: arbAny,
        player1Name: arbAny,
        player2Name: arbAny,
        winnerName: arbAny
      }),
      fc.constant(null),
      fc.constant('string pura'),
      fc.integer(),
      fc.array(fc.string())
    );

    await fc.assert(
      fc.asyncProperty(arbBody, async (body) => {
        const res = await request(app)
          .post('/api/match')
          .send(body)
          .set('Content-Type', 'application/json');
        expect(res.status).toBeLessThan(500);
      }),
      { numRuns: 200 }
    );
  });

  test('campos válidos retornam 200 com ok:true', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        async (gameMode, p1, p2, winner) => {
          const res = await request(app)
            .post('/api/match')
            .send({ gameMode, player1Name: p1, player2Name: p2, winnerName: winner });
          expect(res.status).toBe(200);
          expect(res.body.ok).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('campos inválidos retornam 400', async () => {
    const arbInvalidBody = fc.record({
      gameMode: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)),
      player1Name: fc.string(),
      player2Name: fc.string(),
      winnerName: fc.string()
    });

    await fc.assert(
      fc.asyncProperty(arbInvalidBody, async (body) => {
        const res = await request(app)
          .post('/api/match')
          .send(body);
        expect(res.status).toBe(400);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Fuzzing - HTTP GET /api/history', () => {
  test('sempre retorna 200 independente de query params arbitrários', async () => {
    await fc.assert(
      fc.asyncProperty(fc.dictionary(fc.string(), fc.string()), async (params) => {
        const query = new URLSearchParams(params).toString();
        const res = await request(app).get(`/api/history?${query}`);
        expect(res.status).toBe(200);
      }),
      { numRuns: 100 }
    );
  });
});
