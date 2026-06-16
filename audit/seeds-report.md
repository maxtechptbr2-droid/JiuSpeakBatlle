# JIUSPEAK BJJ – RELATÓRIO INDISTRUTÍVEL DE AUDITORIA DE SEEDS

Este relatório apresenta um rastreamento cirúrgico de todas as operações de banco (`upsert`, `create`, `createMany`) originadas por scripts de seed no projeto JiuSpeak, analisando o impacto real vs. fakes.

---

## 1. ANÁLISE DE `/scripts/seed.ts`

Este script atua como o ponto focal de preparação do banco de dados corporativo do JiuSpeak. Ele é estruturado sequencialmente e executa as seguintes operações:

### A. Semeamento de Planos e Metadados SaaS
- **Instruções Identificadas**: `prisma.plan.upsert()`
- **Registros Criados/Atualizados**:
  1. `plan-free-id`: Plano **FREE** (Acesso básico, fórum comum). Preço: R$ 0.00.
  2. `plan-pro-id`: Plano **VIP** (Selo de verificação, multiplicador de XP, Mentor Inteligente IA). Preço: R$ 29.90.
  3. `plan-master-id`: Plano **MASTER** (Cursos liberados, bônus de 2000 JT, Kimono Imperial Digital). Preço: R$ 49.90.
- **Classificação**: **REAL** (Infraestrutura obrigatória do modelo de faturamento SaaS).

### B. Catálogo de Cosméticos e Avatares Premium
- **Instruções Identificadas**: `prisma.storeProduct.upsert()` via `seedStoreProducts()`
- **Registros Criados/Atualizados**:
  - Loop combinatorial cruzando 3 personagens base (`bjj_samurai`, `bjj_leao`, `bjj_pitbull`) com 12 faixas oficiais (`white` à `red_white`) gerando **36 avatares premium** na vitrine com precificação dinâmica em JiuTickets (JT) e imagens dinâmicas.
- **Classificação**: **REAL** (Itens estéticos centrais da gamificação de auto-imagem).

### C. Conteúdo Acadêmico de Vídeo-Aulas e Quizzes
- **Instruções Identificadas**: `prisma.academyModule.create()` e `prisma.academyLesson.create()` via `seedAcademyInDb()`
- **Registros Criados/Atualizados**:
  - **Módulos**: 5 módulos de progresso educacional (`mod_white`, `mod_blue`, `mod_purple`, `mod_brown`, `mod_black`).
  - **Lições**: Lições de Jiu-Jitsu associadas (por exemplo, `less_white_1` a `less_white_10`, `less_blue_1`, etc.), incluindo canais oficiais de aulas do YouTube e prêmios de recompensa por execução.
- **Classificação**: **REAL** (Grade pedagógica central dos cursos virtuais).

---

## 2. ANÁLISE DE `/scripts/seedAcademies.ts`

Este script estrutura o mapa nacional e mundial do Jiu-Jitsu no JiuSpeak.

### A. Equipes Globais Oficiais da IBJJF
- **Instruções Identificadas**: `prisma.globalTeam.upsert()`
- **Registros Criados**:
  - 10 equipes consagradas do cenário competitivo: **Gracie Barra**, **Checkmat**, **Alliance**, **GF Team**, **Atos**, **Dream Art**, **AOJ**, **Fratres**, **Nova União**, e **Carlson Gracie**.
- **Classificação**: **REAL** (Equipes oficiais regulamentadas em federações reais de combate).

### B. Filiais e Academias Oficiais Autorizadas
- **Instruções Identificadas**: `prisma.academyBranch.upsert()`
- **Registros Criados**:
  - Sedes e filiais reais oficiais associadas às equipes em múltiplos eixos geográficos (São Paulo, Rio de Janeiro, Curitiba, Brasília, Orlando, Irvine, San Diego, Londres, Dubai, etc.).
- **Classificação**: **REAL** (Academias físicas operantes no cenário geográfico real).

### C. Escolas Independentes Reais
- **Instruções Identificadas**: `prisma.independentAcademy.upsert()`
- **Registros Criados**:
  - `independent-id-0`: Suave Arte Dojo São Paulo.
  - `independent-id-1`: Golden Belt Academy Curitiba.
  - `independent-id-2`: Iron Guard Dojo Miami.
- **Classificação**: **REAL** (Representações reais de academias independentes).

---

## 3. ANÁLISE DE `/asset-factory/database/prisma/seed.ts`

Este script atua na fábrica produtora de colecionáveis do ecossistema.

### A. Categorias e Raridades de Equipamentos
- **Instruções Identificadas**: `prisma.assetCategory.upsert()` e `prisma.assetRarity.upsert()`
- **Registros Criados**:
  - Categorias: Kimonos, Rashguards, Medalhas, Molduras, Ícones, etc.
  - Raridades: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC com cores hexadecimais de status e fatores multiplicadores reais.
- **Classificação**: **REAL** (Estrutura de tipagem básica do motor de dados de inventário).

---

## RESUMO DA AUDITORIA DE SEEDS
Todos os seeds presentes nas cargas oficiais são estruturais (**REAL**), necessários para o funcionamento básico das lições, planos contratuais, itens da loja oficial e hierarquias competitivas reais da IBJJF. **Nenhum dado mockado fútil, usuário dummy descartável ou postagem fake é gerado por estes scripts.**
