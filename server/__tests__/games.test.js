const { GameCollection } = require('../games');

function mockSocket(id) {
  const handlers = {};
  return {
    id,
    emit: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn((event, cb) => { handlers[event] = cb; }),
    trigger: (event, data) => handlers[event] && handlers[event](data)
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

  test('getId retorna o identificador da partida', () => {
    const game = collection.getGame('sala1');
    expect(game.getId()).toBe('sala1');
  });
});

describe('Game - encerramento de partida', () => {
  let collection;
  let onGameEnd;

  beforeEach(() => {
    onGameEnd = jest.fn();
    collection = new GameCollection(onGameEnd);
    collection.createGame('sala1');
  });

  test('endGame chama o callback com id, vencedor e perdedor', () => {
    const s1 = mockSocket('s1');
    const s2 = mockSocket('s2');
    const game = collection.getGame('sala1');
    game.addPlayer(s1);
    game.addPlayer(s2);
    game.endGame(0);
    expect(onGameEnd).toHaveBeenCalledWith('sala1', s2, s1);
  });

  test('endGame desconecta o vencedor', () => {
    const s1 = mockSocket('s1');
    const s2 = mockSocket('s2');
    const game = collection.getGame('sala1');
    game.addPlayer(s1);
    game.addPlayer(s2);
    game.endGame(1);
    expect(s1.disconnect).toHaveBeenCalled();
  });

  test('endGame remove a partida da coleção', () => {
    const game = collection.getGame('sala1');
    game.addPlayer(mockSocket('s1'));
    game.addPlayer(mockSocket('s2'));
    game.endGame(0);
    expect(collection.getGame('sala1')).toBeUndefined();
  });

  test('endGame não faz nada se chamado sem jogadores', () => {
    const game = collection.getGame('sala1');
    expect(() => game.endGame(0)).not.toThrow();
    expect(onGameEnd).not.toHaveBeenCalled();
  });
});

describe('Game - encaminhamento de eventos entre jogadores', () => {
  let collection;

  beforeEach(() => {
    collection = new GameCollection();
    collection.createGame('sala1');
  });

  test('evento do p1 é encaminhado para p2', () => {
    const s1 = mockSocket('s1');
    const s2 = mockSocket('s2');
    const game = collection.getGame('sala1');
    game.addPlayer(s1);
    game.addPlayer(s2);
    s1.trigger('event', { key: 'left' });
    expect(s2.emit).toHaveBeenCalledWith('event', { key: 'left' });
  });

  test('evento do p2 é encaminhado para p1', () => {
    const s1 = mockSocket('s1');
    const s2 = mockSocket('s2');
    const game = collection.getGame('sala1');
    game.addPlayer(s1);
    game.addPlayer(s2);
    s2.trigger('life-update', { life: 50 });
    expect(s1.emit).toHaveBeenCalledWith('life-update', { life: 50 });
  });

  test('desconexão do p1 encerra a partida', () => {
    const s1 = mockSocket('s1');
    const s2 = mockSocket('s2');
    const game = collection.getGame('sala1');
    game.addPlayer(s1);
    game.addPlayer(s2);
    s1.trigger('disconnect');
    expect(collection.getGame('sala1')).toBeUndefined();
  });

  test('desconexão do p2 encerra a partida', () => {
    const s1 = mockSocket('s1');
    const s2 = mockSocket('s2');
    const game = collection.getGame('sala1');
    game.addPlayer(s1);
    game.addPlayer(s2);
    s2.trigger('disconnect');
    expect(collection.getGame('sala1')).toBeUndefined();
  });
});
