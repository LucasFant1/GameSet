# GameSet

Um "Letterboxd de jogos": avalie jogos, escreva reviews, monte tier lists
e acompanhe o que a comunidade está jogando.

Feito só com **HTML, CSS e JavaScript puro** — sem framework, sem build.

---

## Como rodar

Abra o `index.html` no navegador. Só isso.

Pra evitar qualquer problema com caminhos de arquivo, o ideal é servir a
pasta por um servidor local simples:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

---

## Deploy no GitHub Pages

1. Suba todos os arquivos na raiz do repositório
2. Vá em **Settings → Pages**
3. Em "Source", escolha a branch (`main`) e a pasta `/ (root)`
4. Salve — em alguns minutos o site estará no ar

Os arquivos `.css`, `.js` e a logo já vão com uma versão no final da URL
(`?v=...`) pra forçar o navegador a baixar a versão nova em vez de usar
uma antiga guardada em cache.

> **Se você editar algum arquivo depois:** troque esse número de versão
> nos `<link>` e `<script>` das páginas (ou rode de novo o script de
> cache-busting), senão quem já visitou o site pode continuar vendo a
> versão velha.

---

## Como os dados funcionam

Este é um site **só de front-end**, sem banco de dados. Tudo que a pessoa
cria (reviews, tier lists, comentários, curtidas, perfil, favoritos) fica
salvo no `localStorage` do próprio navegador dela.

Na prática isso significa:

- Cada visitante começa com a conta vazia e vê só o que ele mesmo criou
- Os dados somem se a pessoa limpar os dados do navegador
- Nada é compartilhado entre pessoas diferentes

O conteúdo que aparece "de outras pessoas" (reviews na aba Comunidade,
tier lists da comunidade, sugestões de amigos) é conteúdo de demonstração
fixo, definido em `api.js` e `tierlists-data.js`.

Pra virar um site de verdade, seria preciso um backend. Os pontos de
troca já estão isolados nessas funções do `api.js`:

| Função                                   | Viraria           |
|------------------------------------------|-------------------|
| `getAllReviews` / `saveReview`            | `GET/POST /reviews` |
| `getEngagement` / `toggleLike` / `addReply` | `GET/POST /engagement` |
| `getOwnTierLists` / `upsertOwnTierList`   | `GET/POST /tierlists` |
| `getFollowing` / `toggleFollow`           | `GET/POST /follows` |
| `getMyProfile` / `saveMyProfile`          | `GET/PUT /me`     |

---

## API de jogos

Os jogos vêm da [RAWG](https://rawg.io/apidocs). A chave está no topo do
`api.js`:

```js
const RAWG_API_KEY = "sua-chave-aqui";
```

⚠️ **Atenção:** como o site é só front-end, essa chave fica visível pra
qualquer pessoa que abrir o código-fonte. Pra um projeto de teste isso é
normal, mas se o site crescer, mova essa chamada pra um backend seu — do
contrário alguém pode usar a sua cota de requisições.

Sem chave configurada, o site cai automaticamente num **modo demo** com
uma lista fixa de jogos, e continua funcionando normalmente.

---

## Estrutura dos arquivos

**Páginas**
- `index.html` — home, com gráficos, carrosséis e destaques
- `community.html` — feed de reviews da comunidade
- `games.html` — catálogo com filtros e ordenação
- `game.html` — página de um jogo, onde se avalia
- `tierlists.html` / `tierlist-editor.html` — galeria e editor de tier lists
- `donate.html`, `perfil.html`, `amigos.html`, `atividade.html`,
  `reviews.html`, `comentarios.html`, `configuracoes.html`
- `contato.html`, `termos.html`, `privacidade.html`, `sobre.html`

**Scripts compartilhados**
- `api.js` — chamadas à RAWG, armazenamento local, curtidas/respostas
- `common.js` — cabeçalho: busca, perfil, notificações, denúncias
- `tierlists-data.js` — tiers, sugestões prontas e tier lists de demo

**Scripts por página**
- `script.js` (home), `game.js`, `community.js`, `games.js`,
  `donate.js`, `tierlists.js`, `tierlist-editor.js`, `profile.js`,
  `friends.js`, `activity.js`, `reviews-page.js`, `comments-page.js`,
  `settings.js`

**Outros**
- `styles.css` — todo o visual do site
- `logo.png` — logo usada no cabeçalho
