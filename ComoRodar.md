# Como Rodar o Projeto

Este é um jogo de luta simples criado com HTML5 canvas e JavaScript. Ele possui três modos de jogo:
* `Básico` - com um jogador ativo e um inativo.
* `Multijogador` - com dois jogadores ativos em um computador.
* `Rede` - com dois jogadores ativos, jogando pela rede.

### Execução Local (Modo Básico/Multijogador)

Para rodar o jogo localmente, basta abrir o arquivo `game/index.html` em qualquer navegador moderno.

### Execução com Docker

Para subir o ambiente de desenvolvimento completo (aplicação + banco de dados Postgres):

1.  Certifique-se de ter o Docker Desktop instalado e rodando.
2.  Na raiz do projeto, execute:
    ```bash
    docker compose up --build
    ```
3.  Acesse o jogo em `http://localhost:8888`.

Para encerrar:
```bash
docker compose down
```

Para encerrar e remover os dados do banco:
```bash
docker compose down -v
```

---

### Execução em Rede (Servidor Node.js)

Para o jogo em rede, você precisa iniciar o servidor:

1.  Navegue até a pasta do servidor:
    ```bash
    cd server
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor (com hot-reload):
    ```bash
    npm run dev
    ```
    Ou sem hot-reload:
    ```bash
    npm start
    ```

O servidor será iniciado na porta `8888`. Abra o navegador em `http://localhost:8888`. Ambos os jogadores devem inserir o mesmo nome de jogo para se conectarem.

> **Nota:** A porta original do projeto era `55555`, porém essa porta pertence ao range efêmero do macOS (49152–65535), utilizado pelo sistema operacional para conexões de saída. Para evitar conflitos, a porta foi alterada para `8888`.

---

# Configuração Técnica

O `mk.js` pode ser configurado através do objeto de opções passado na inicialização:

*   `arena`: Propriedades da arena (container e tipo).
*   `fighters`: Array com os nomes dos dois jogadores.
*   `game-type`: Define o modo (`network`, `basic`, `multiplayer`).
*   `callbacks`: Funções disparadas em eventos como `attack` ou `game-end`.

# Licença

Este software é distribuído sob os termos da licença MIT.
