const request = require('supertest');

jest.mock('../db/repository', () => ({
  getMatchHistory: jest.fn().mockResolvedValue([]),
  saveLocalMatch: jest.fn().mockResolvedValue()
}));

const mockQuery = jest.fn();
jest.mock('../db/index', () => ({
  pool: { query: mockQuery }
}));

const app = require('../app');

describe('GET /health', () => {
  test('retorna 200 quando o banco está acessível', async () => {
    mockQuery.mockResolvedValueOnce({});
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('retorna 503 quando o banco não está acessível', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection refused'));
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body.error).toBeDefined();
  });
});
