# JIUSPEAK BJJ – RELATÓRIO DE MOCKS E DADOS SIMULADOS

Este relatório mapeia cirurgicamente e classifica todos os arquivos e variáveis do projeto contendo dados de teste, placeholders ou mocks de simulação para o ecossistema do JiuSpeak.

---

## 1. COMPONENTE SOCIAL E DISCORD FEID SANDBOX (`/src/data.ts`)

- **`INITIAL_SOCIAL_POSTS`**: Um array estático contendo posts simulados iniciais para o feed social, fornecendo aos usuários estreantes um histórico interativo realista sobre técnicas de raspagem, gírias de tatame e cansaço de treinos.
  - **Autor 1**: Lucas Monteiro (Faixa Preta) – Informando sobre Masterclass de Raspagem.
  - **Autor 2**: Bruno Ferreira (Faixa Azul) – Piada sobre rolar de forma leve com faixa preta.
  - **Autor 3**: Juliana Mendes (Faixa Roxa) – Dúvida sobre pegada De la Riva.
  - **Segurança**: **100% SEGURO e PRESERVÁVEL**. Estes posts funcionam apenas como base de semente em memória e como layout de demonstração offline para assegurar que a comunidade nunca apareça deserta em modos sem conexão.

---

## 2. COMPONENTE PVP ARENA (`/src/data.ts`)

- **`OPPONENTS_POOL`**: Array com oponentes de inteligência artificial de várias patentes para simulação tática na Arena de Cartas.
  - **Oponente 1**: Rafael Almeida (Faixa Azul, Peso Médio)
  - **Oponente 2**: João Pedro (Faixa Roxa, Peso Pena)
  - **Oponente 3**: Ana Beatriz (Faixa Roxa, Peso Leve)
  - **Oponente 4**: Matheus Lima (Faixa Marrom, Peso Pesado)
  - **Oponente 5**: Maria Clara (Faixa Preta, Peso Absoluto)
  - **Segurança**: **100% SEGURO e PRESERVÁVEL**. Oponentes virtuais de IA são estruturais para o modo de Jogo Individual contra Inteligência Artificial. Eles não são fakes a serem removidos, mas sim personagens ativos do motor do game.
- **`COMBAT_CARDS`**: Baralho principal das cartas de combate (Puxar para a Guarda, Double Leg, Raspagem de Balão, Posturar, etc.).
  - **Segurança**: **100% REAL e ESTRUTURAL** (mecanismo central do game).

---

## 3. COMPONENTE ACADÊMICO (`/src/data.ts`)

- **`COURSES`**: Conteúdos reais de inglês de tatame, perguntas didáticas, explicações técnicas e dicas do professor John Danaher.
  - **Segurança**: **100% REAL e ESTRUTURAL** (material central de ensino do app).

---

## 4. AUDITORIA FINANCEIRA (`/src/data.ts`)

- **`INITIAL_AUDIT_LOGS`**: Histórico estático de depósitos e saques simulando transações via PIX.
  - **Segurança**: **100% SEGURO e PRESERVÁVEL** (dados decorativos demonstrativos e para testes de layout de auditoria em modo desenvolvimento).

---

## 5. RECONCILIAÇÃO INTEGRADA (REAL VS. IMAGINÁRIO)

| Nome da Variável | Caminho do Arquivo | Função Técnica | Decisão Sênior | Justificativa |
|---|---|---|---|---|
| `COURSES` | `src/data.ts` | Grade Curricular | **PRESERVADO (REAL)** | Conteúdo didático genuíno. |
| `OPPONENTS_POOL` | `src/data.ts` | Elenco da Arena PvP IA | **PRESERVADO (REAL)** | Oponentes simulados necessários para gameplay individual. |
| `COMBAT_CARDS` | `src/data.ts` | Deck de Habilidades | **PRESERVADO (REAL)** | Cartas estruturais do jogo. |
| `INITIAL_SOCIAL_POSTS` | `src/data.ts` | Feed de Boas-Vindas | **PRESERVADO (SIMULADOR)** | Layout estético de demonstração. |
| `INITIAL_AUDIT_LOGS` | `src/data.ts` | Logs de Finanças | **PRESERVADO (SIMULADOR)** | Layout estético de demonstração. |
| `inMemory*` | `server.ts` | Banco Resiliente | **PRESERVADO (FALLBACK)** | Banco em memória transiente ativado se o PostgreSQL ideal falhar, blindando a usabilidade. |
