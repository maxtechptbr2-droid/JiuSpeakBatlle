# SYSTEM DE GERAÇÃO JIUSPEAK ASSET FACTORY V3 (AAA)

Bem-vindo ao centro oficial de engenharia de cosméticos digitais do ecossistema **JiuSpeak**. Este módulo implementa uma fábrica robótica e automatizada configurada para gerar, lapidar, organizar, catalogar e publicar assets cosméticos AAA para o JiuVerse MMORPG, website, aplicativo móvel e marketplace de JiuTickets (JT).

---

## 🛠️ Stack Tecnológica

O sistema utiliza as tecnologias mais robustas do mercado para processamento multimídia de alta eficiência:
- **Runtime**: Node.js 22+ & TypeScript
- **Machine Learning & Image Generation**:
  1. **Google Imagen 4** (Principal - Modelo `imagen-4.0-generate-001`) via `@google/genai`
  2. **Google Gemini Native Image** (Segundo - Modelo `gemini-3.1-flash-image`)
  3. **Flux Dev** (Terceiro - Integração via API FalAI)
  4. **Procedural Local Vector SVG** (Quarto - Motor geométrico offline com 100% de estabilidade)
- **Manipulação de Imagem**: Sharp (Processador nativo C++) com Lanczos kernel resampling para upscaling super-resolution.
- **Armazenamento e CDN**: Cloudflare R2 utilizando a API S3 da AWS.
- **Banco de Dados**: PostgreSQL & Prisma ORM.
- **Pacotes**: Archiver (Definição máxima Zlib 9) para criação do arquivo central compactado.

---

## 📂 Arquitetura de Pastas

```text
/asset-factory
├── database/
│   ├── client/          # Client Prisma exclusivo gerado automaticamente
│   └── prisma/
│       ├── schema.prisma # Schema isolado de banco relatando cosméticos
│       └── seed.ts       # Seeder para categorias de Kimono, Medalhas, etc.
├── scripts/
│   ├── generate-assets.ts    # Orquestrador do fluxo sequencial de 10 passos
│   ├── remove-background.ts # Processador chroma-key e de bordas alfa
│   ├── upscale-assets.ts    # Algoritmo de upscaling super-resolution 4x (4096px)
│   ├── generate-thumbnails.ts # Renderizador multi-resolução (128px, 256px, 512px)
│   ├── optimize-assets.ts   # Compressor de transferência rápida (.webp)
│   ├── upload-cdn.ts        # Receptor de arquivos para o Cloudflare R2 CDN
│   ├── sync-postgresql.ts   # Sincronizador de registros de produtos para o banco
│   ├── create-manifest.ts   # Compilador de dados estáticos para o catálogo JSON
│   └── create-zip.ts        # Compactador premium de arquivos com nível 9 Zlib
├── providers/
│   ├── imagen.provider.ts # Comunicador nativo da API oficial Imagen 4
│   ├── gemini.provider.ts # Comunicador de imagens do Gemini 3.1 Flash Image
│   ├── flux.provider.ts   # Integrador API FalAI Flux Dev
│   └── local.provider.ts  # Gerador procedimental geométrico vetorial do Arquiteto
├── assets/                 # Pasta de saída dos assets processados localmente
├── output/                 # Pasta contendo o pacote JiuSpeak_Assets_AAA.zip
├── logs/                   # Histórico persistente detalhado de geração de assets
└── README.md              # Este manual de especificação técnica sênior
```

---

## ⚙️ Configuração das Variáveis de Ambiente (.env)

Certifique-se de configurar as chaves necessárias no seu arquivo `.env`:

```env
# Conexão PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/jiuspeak_db?schema=public"

# Inteligência Artificial Generativa
GEMINI_API_KEY="sua-chave-api-do-google-ai-studio"
FLUX_API_KEY="sua-chave-fal-ai-opcional"

# Provedor Cloudflare R2 (CDN)
R2_BUCKET_NAME="jiuspeak-assets-production"
R2_ENDPOINT="https://seu-id-de-conta-cloudflare.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="sua-chave-de-acesso"
R2_SECRET_ACCESS_KEY="sua-chave-secreta"
R2_PUBLIC_URL="https://cdn.jiuspeak.com"
```

---

## 🚀 Como Executar

A fábrica funciona com total automação. Para rodar a orquestração completa das 43 peças cosméticas:

```bash
# Instalar dependências da aplicação
npm install

# Executar a fábrica robótica de assets
npm run generate
```

Ao rodar esse script, o terminal orquestrará a pipeline sequencial que processa, otimiza e empacota tudo sob `/asset-factory/output/JiuSpeak_Assets_AAA.zip`.

---

## 📈 Pipeline de Geração: Fluxo de 10 Passos por Asset

Cada um dos 43 modelos é processado usando a seguinte trilha de processamento:

1. **Passo 1 (Gerar Imagem)**: Dispara a geração pela IA seguindo os padrões visuais AAA (Imagen 4 -> Gemini Native -> Flux -> Fallback Procedural).
2. **Passo 2 (Remover Fundo)**: Detecta e remove pixels de fundo brilhante ou preto-sólido opaco de estúdio, gerando canal alfa de transparência integral.
3. **Passo 3 (Limpar Bordas)**: Executa corte de delimitação de bordas (trim automático) e suavização (feathering) para remover resíduos indesejados.
4. **Passo 4 (Upscale 4x)**: Redimensiona via kernel Lanczos de alto desempenho para a resolução premium **4096x4096px**, seguido de unsharp mask para refinar texturas.
5. **Passo 5 (Gerar Miniaturas)**: Gera versões multi-grade nos tamanhos de exibição rápida: **128x128px**, **256x256px** e **512x512px**.
6. **Passo 6 (Converter para WebP)**: Exporta texturas compactas de transferência rápida usando o codec WebP com amostragem inteligente de cores.
7. **Passo 7 (Fazer Upload para CDN)**: Transmite o WebP otimizado em lote direto para os servidores Cloudflare R2 com permissões de leitura pública.
8. **Passo 8 (Registrar no Manifest)**: Adiciona os metadados do asset, URLs finais, tamanhos e preços JT no arquivo central estruturado `/assets/manifest.json`.
9. **Passo 9 (Sincronizar PostgreSQL)**: Conecta via Prisma e registra de forma limpa cada asset, marca de raridade e categoria direto na tabela do banco de dados pós-geração.
10. **Passo 10 (Compactar para ZIP)**: Envia todas as texturas processadas à compactação final no arquivo centralizado `/output/JiuSpeak_Assets_AAA.zip`.

---

## 🥋 Guia de Customização e Operação Sênior

### 1. Como Criar Novos Assets
Para adicionar um novo cosmético na lista de geração automática da fábrica, abra o arquivo `/asset-factory/scripts/generate-assets.ts` e insira um novo objeto descritivo no vetor `COSMETIC_ASSETS`:

```typescript
{
  id: uuidv4(),
  name: 'Seu Kimono Elite',
  category: 'kimonos',
  rarity: 'MYTHIC',
  description: 'Um novo kimono espetacular em preto e ouro com auras cintilantes.'
}
```

### 2. Como Adicionar Novas Categorias
Novas coleções ou divisões podem ser criadas facilmente:
1. Adicione a categoria no arquivo `/asset-factory/database/prisma/seed.ts` sob o vetor `categories`:
   ```typescript
   { name: 'Cinturões Imperiais', slug: 'cinturoes', description: 'Cinturões históricos de ranking global' }
   ```
2. No orquestrador `/asset-factory/scripts/generate-assets.ts`, inclua o novo slug no array de pastas de inicialização:
   ```typescript
   const categories = ['kimonos', 'rashguards', 'medalhas', 'molduras', 'avatares', 'icones', 'thumbnails', 'cinturoes'];
   ```

### 3. Como Alterar Preços de JiuTickets (JT)
Os preços são atribuídos à categoria e raridade no orquestrador. Abra o arquivo `/asset-factory/scripts/generate-assets.ts` e ajuste a função `getPriceByRarity` de acordo com o desejado:

```typescript
function getPriceByRarity(r: string): number {
  if (r === 'UNCOMMON') return 800;
  if (r === 'RARE') return 1500;
  if (r === 'EPIC') return 2500;
  if (r === 'LEGENDARY') return 4500;
  if (r === 'MYTHIC') return 8000;
  return 500; // COMMON por padrão
}
```

### 4. Como Adicionar Novas Raridades
1. Abra o arquivo `/asset-factory/database/prisma/seed.ts` e insira as novas raridades na matriz `rarities`, associando seu código hexadecimal e multiplicador de preço:
   ```typescript
   { name: 'GODLIKE', colorHex: '#FF00FF', priceMult: 25.0 }
   ```
2. Certifique-se de contemplar o correspondente tratamento de cores dentro de `/asset-factory/providers/local.provider.ts` para que o fallback geográfico crie a moldura vetorial correspondente.

### 5. Como Publicar Novos Assets em Produção
Uma vez gerados, os assets serão automaticamente gravados no banco PostgreSQL de produção e hospedados no R2 CDN. O seu marketplace principal de JiuTickets lerá a tabela `Asset` ou o arquivo e carregará os produtos diretamente no inventário de cada usuário conectado, sem a necessidade de novos códigos ou scripts auxiliares!

---
Desenvolvido com excelência por **JiuSpeak Software Architecture (AAA)**.
