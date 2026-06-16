# JIUSPEAK BJJ – INVENTÁRIO COMPLETO DO PROJETO

Este documento apresenta o mapeamento completo da arquitetura e estrutura do ecossistema JiuSpeak, cobrindo as camadas de Frontend, Backend, Banco de Dados, Banco em Memória Paralelo e Utilitários de DevOps.

---

## 1. COMPONENTES E PÁGINAS DO FRONTEND (`/src/components` & `/src`)

O frontend é uma SPA (Single Page Application) construída em **React 19**, utilizando **Vite** como empacotador e **Tailwind CSS** para a estilização visual moderna.

### Componentes Principais
- **`AuthPortal.tsx`**: Tela de autenticação unificada (Login, Registro e Recuperação de Senha) com transições visuais dinâmicas.
- **`Sidebar.tsx`**: Menu de navegação lateral responsivo adaptado ao cargo do usuário (Atleta, Professor, Administrador).
- **`Navbar.tsx`**: Barra superior de status, mostrando saldo de JiuTickets (JT), nível do atleta, selo VIP, streak de dias de estudo e barra de XP.
- **`SocialFeed.tsx`**: Feed social interativo que gerencia posts, comentários, curtidas, salvamento de publicações e stories.
- **`AcademiesCommunities.tsx`**: Visualização integrada de Academias BJJ Oficiais (Hierarquias Globais e Filiais IBJJF) e Academias Independentes.
- **`StoreMarket.tsx`**: Aba de Loja Oficial JiuSpeak (venda de Avatares cosméticos por JiuTickets) e o Marketplace P2P (venda e troca de itens entre usuários).
- **`PvPArena.tsx`**: Arena BJJ de simulação tática e simulação conversacional por cartas baseada em energia e estamina comandada por perguntas de inglês instrumental.
- **`Lessons.tsx` / `JiuSpeakAcademy.tsx`**: Módulos acadêmicos categorizados por faixas (Branca à Preta) contendo vídeo-aulas integradas com YouTube e quizzes.
- **`AdminPanel.tsx`**: Portal de diretoria com estatísticas financeiras corporativas, auditoria e controle de itens.
- **`CreatorPanel.tsx`**: Painel para professores parceiros acompanharem alunos, aulas criadas e faturamento sobre assinaturas.
- **`FinancePanel.tsx`**: Gerenciador financeiro para atletas efetuarem PIX Simulador de recarga de JiuTickets e saques.
- **`ProfilePanel.tsx`**: Ajustes de perfil do usuário, upload de fotos e visualização de certificados.
- **`InventoryPanel.tsx`**: Equipamento ativo de avatares com renderização dinâmica.

---

## 2. ARQUITETURA BACKEND E ENDPOINTS DE API (`/server.ts` & `/server`)

O backend é um servidor **Node.js** com **Express**, operando em regime full-stack ou proxy corporativo. Ele possui dupla persistência de banco: tenta se conectar ao PostgreSQL local e, de forma transiente/resiliente, mantém um fallback em memória (`in-memory`) com paridade relacional completa para garantir que o sistema nunca pare se o PostgreSQL estiver indisponível.

### Endpoints Principais de API
- **Autenticação**:
  - `POST /api/auth/register` – Cadastro seguro de novos atletas.
  - `POST /api/auth/login` – Login e emissão de tokens JWT.
  - `GET /api/auth/me` – Estado atual e informações do usuário autenticado.
- **Rede Social**:
  - `GET /api/social/posts` – Lista postagens globais.
  - `POST /api/social/posts` – Criação de postagem no feed.
  - `POST /api/social/posts/:postId/react` – Curtidas e feedbacks visuais em posts.
  - `POST /api/social/posts/:postId/comment` – Insere comentários em discussões de tatame.
  - `GET /api/social/stories` – Listagem de stories ativos.
  - `GET /api/social/network` – Gerencia seguidores e relações de amizade.
- **Portal Acadêmico**:
  - `GET /api/academy/modules` – Busca módulos acadêmicos e lições.
  - `POST /api/academy/progress/complete` – Salva progressão em lições e atribui XP.
- **Financeiro & Assinaturas**:
  - `GET /api/subscriptions/plans` – Planos disponíveis (FREE, VIP, MASTER).
  - `POST /api/finance/pix` – Simulação de faturamento e depósitos via PIX.
- **Loja e Inventário**:
  - `GET /api/store` – Catálogo de itens e avatares premium.
  - `POST /api/store/buy` – Aquisição de avatares com JiuTickets.
  - `GET /api/inventory` – Exibe avatares comprados e equipamentos ativos.

---

## 3. BANCO DE DADOS POSTGRESQL E PRISMA ORM

O JiuSpeak utiliza **Prisma v5** para interação estruturada com o banco PostgreSQL.

### Principais Modelos Prisma (`/prisma/schema.prisma`)
- **`User`**: Dados de autenticação, nível, XP, elo de combate, streak e assinaturas SaaS.
- **`UserProfile`**: Perfil detalhado de atletas com graduações de faixas e conquistas.
- **`GlobalTeam`**: As equipes oficiais mundiais de Jiu-Jitsu regulamentadas pela IBJJF.
- **`AcademyBranch`**: Unidades físicas e filiais oficiais associadas às Equipes Globais estratégicas.
- **`IndependentAcademy`**: Academias independentes cadastradas sem afiliação multinacional.
- **`SocialPost`**, **`Comment`**, **`Like`**: Interações ricas integradas à rede social.
- **`StoreProduct`**, **`UserAsset`**: Gerenciador de colecionáveis digitais da loja de moedas.
- **`Plan`**, **`Subscription`**, **`Payment`**: Infraestrutura de assinaturas recorrentes B2C.

---

## 4. SCRIPTS E SEEDS DO SISTEMA (`/scripts`)

- **`/scripts/seed.ts`**: Centralizador das cargas do banco de dados (SaaS, Perguntas PvP, Módulos).
- **`/scripts/seedAcademies.ts`**: Criação da hierarquia nacional de equipes físicas, filiais oficiais e academias independentes.
- **`/asset-factory/database/prisma/seed.ts`**: Carga de raridades e categorias de assets digitais.
- **`/scripts/backup-db.sh`** & **`/backup.sh`**: Rotinas de backup do postgresql via pg_dump.
- **`/scripts/test-db.ts`**: Validador de conexão inline com o PostgreSQL.
- **`/scripts/test-isconnected.ts`**: Verificador síncrono da flag de conexão real.
