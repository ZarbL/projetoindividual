const { GameCollection } = require('../games');

function mockSocket(id) {
  return {
    id,
    emit: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn()
  };
}

describe('GameCollection', () => {
  let collection;

  beforeEach(() => {
    collection = new GameCollection();
  });

  test('cria uma nova partida com sucesso', () => {
    expect(collection.createGame('sala1')).toBe(true);
  });

  test('rejeita criação de partida com nome duplicado', () => {
    collection.createGame('sala1');
    expect(collection.createGame('sala1')).toBe(false);
  });

  test('retorna a partida pelo nome', () => {
    collection.createGame('sala1');
    expect(collection.getGame('sala1')).toBeDefined();
  });

  test('retorna undefined para partida inexistente', () => {
    expect(collection.getGame('inexistente')).toBeUndefined();
  });

  test('remove uma partida existente', () => {
    collection.createGame('sala1');
    expect(collection.removeGame('sala1')).toBe(true);
    expect(collection.getGame('sala1')).toBeUndefined();
  });

  test('retorna false ao remover partida inexistente', () => {
    expect(collection.removeGame('inexistente')).toBe(false);
  });

  test('retorna o total de partidas ativas', () => {
    collection.createGame('sala1');
    collection.createGame('sala2');
    expect(collection.getActiveGamesCount()).toBe(2);
  });
});

describe('Game - gerenciamento de jogadores', () => {
  let collection;

  beforeEach(() => {
    collection = new GameCollection();
    collection.createGame('sala1');
  });

  test('aceita o primeiro jogador', () => {
    const game = collection.getGame('sala1');
    expect(game.addPlayer(mockSocket('s1'))).toBe(true);
  });

  test('aceita o segundo jogador', () => {
    const game = collection.getGame('sala1');
    game.addPlayer(mockSocket('s1'));
    expect(game.addPlayer(mockSocket('s2'))).toBe(true);
  });

  test('rejeita terceiro jogador quando a partida está cheia', () => {
    const game = collection.getGame('sala1');
    game.addPlayer(mockSocket('s1'));
    game.addPlayer(mockSocket('s2'));
    expect(game.addPlayer(mockSocket('s3'))).toBe(false);
  });

  test('notifica o primeiro jogador quando o segundo entra', () => {
    const s1 = mockSocket('s1');
    const game = collection.getGame('sala1');
    game.addPlayer(s1);
    game.addPlayer(mockSocket('s2'));
    expect(s1.emit).toHaveBeenCalledWith('player-connected', 0);
  });
});
