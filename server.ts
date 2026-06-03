import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { authStore, simulatedSentEmails, inMemoryUsers } from "./server/authStore";
import { AuthService, generateAccessToken, generateRefreshToken } from "./server/authService";
import { MatchmakingService } from "./server/pvp/matchmaking";
import { ArenaService } from "./server/pvp/arena";
import { seedQuestionsInDb } from "./server/pvp/questions";
import { getPrisma, assertDatabaseConnection } from "./server/db";

const app = express();
const PORT = 3000;

// Security & Sandbox Hardening Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Rate limit ativado para segurança!" }
});
app.use("/api/", apiRateLimiter);

// Middleware
app.use(express.json());

// Global Auditing Middleware
app.use((req: any, res: any, next: any) => {
  const originalJson = res.json;

  res.json = function (body: any) {
    const status = res.statusCode;

    res.on("finish", async () => {
      // Create audit logs only on successful requests (typically 2xx status)
      if (status >= 400) return;

      try {
        const prisma = getPrisma();
        if (!prisma) return;

        const path = req.path;
        const method = req.method;
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || null;
        const userAgent = req.headers["user-agent"] || null;

        let actorId = req.user?.id || null;
        let action: string | null = null;
        let description = "";
        let amountBRL: number | null = null;
        let amountKC: number | null = null;

        // 1. LOGIN
        if (path === "/api/auth/login" && method === "POST") {
          action = "USER_LOGIN";
          const userEmail = req.body?.email || body?.user?.email || "desconhecido";
          actorId = body?.user?.id || null;
          description = `Login efetuado com sucesso para o usuário ${userEmail}.`;
        }
        
        // 2. CADASTRO
        else if (path === "/api/auth/register" && method === "POST") {
          action = "USER_REGISTER";
          const userEmail = req.body?.email || body?.user?.email || "desconhecido";
          const userName = req.body?.name || body?.user?.name || "atleta";
          actorId = body?.user?.id || null;
          description = `Novo cadastro de atleta efetuado: ${userName} (${userEmail}).`;
        }

        // 3. PIX
        else if (path === "/api/finance/pix" && method === "POST") {
          action = "PIX_DEPOSIT";
          const amount = Number(req.body?.amountBRL || req.body?.amount || body?.amountBRL || 0);
          const kc = Math.round(amount * 1.5);
          amountBRL = amount;
          amountKC = kc;
          description = `Nova intenção de PIX registrada: R$ ${amount.toFixed(2)} (equivalente a ${kc} KC).`;
        }
        else if (path === "/api/finance/pix-webhook" && method === "POST") {
          action = "PIX_DEPOSIT";
          const amount = Number(req.body?.amountBRL || req.body?.amount || 0);
          const email = req.body?.email || req.body?.external_ref || "desconhecido";
          amountBRL = amount;
          amountKC = Math.round(amount * 1.5);
          description = `Depósito PIX compensado com sucesso por webhook: R$ ${amount.toFixed(2)} para o email ${email}.`;
        }
        else if (path.match(/^\/api\/admin\/pix\/([^\/]+)\/action$/) && method === "POST") {
          action = "PIX_DEPOSIT";
          const match = path.match(/^\/api\/admin\/pix\/([^\/]+)\/action$/);
          const pixId = match ? match[1] : "desconhecido";
          const act = req.body?.action || "PROCESSADO";
          description = `Ação administrativa executada no PIX ID "${pixId}". Status de liberação definido como: ${act}.`;
        }

        // 4. SAQUE (WITHDRAWAL)
        else if (path === "/api/finance/withdraw" && method === "POST") {
          action = "WITHDRAW_REQUEST";
          const amount = Number(req.body?.amountBRL || req.body?.amount || 0);
          amountBRL = amount;
          description = `Solicitação de saque requerida pelo atleta no valor de R$ ${amount.toFixed(2)} via chave PIX ${req.body?.pixKey || "não discriminada"}.`;
        }
        else if (path.match(/^\/api\/admin\/withdrawals\/([^\/]+)\/review$/) && method === "POST") {
          action = "WITHDRAW_PROCESS";
          const match = path.match(/^\/api\/admin\/withdrawals\/([^\/]+)\/review$/);
          const withdrawalId = match ? match[1] : "desconhecido";
          const act = req.body?.action || "REVISADO";
          const notes = req.body?.notes || "";
          description = `Solicitação de saque ID "${withdrawalId}" processada administrativamente. Decisão do auditor: ${act}. Notas adicionais: ${notes || "Sem observações"}.`;
        }

        // 5. COMPRA (MARKETPLACE BUY)
        else if (path === "/api/marketplace/buy" && method === "POST") {
          action = "MARKETPLAYCE_BUY";
          const itemId = req.body?.itemId || req.body?.marketplaceItemId || "desconhecido";
          const priceKC = Number(req.body?.priceKC || req.body?.price || 0);
          amountKC = priceKC || null;
          description = `Compra finalizada de item do marketplace (ID anunciante: ${itemId}) no valor total de ${priceKC || "ND"} KC.`;
        }

        // 6. VENDA (MARKETPLACE LIST/REMOVAL/COMPLETION)
        else if (path === "/api/marketplace/list" && method === "POST") {
          action = "MARKETPLAYCE_LIST";
          const title = req.body?.name || req.body?.title || "Item Vitrine";
          const priceKC = Number(req.body?.priceKC || req.body?.price || 0);
          amountKC = priceKC || null;
          description = `Novo anúncio de vendas catalogado no pregão virtual: "${title}" avaliado por ${priceKC} KC.`;
        }
        else if (path.match(/^\/api\/admin\/marketplace\/([^\/]+)\/action$/) && method === "POST") {
          action = "MARKETPLAYCE_LIST";
          const match = path.match(/^\/api\/admin\/marketplace\/([^\/]+)\/action$/);
          const listingId = match ? match[1] : "desconhecido";
          description = `Suspensão administrativa de listagem do marketplace id "${listingId}" com devolução de posse ao vendedor originário.`;
        }
        else if (path === "/api/finance/sale" && method === "POST") {
          action = "MARKETPLAYCE_BUY";
          const amount = Number(req.body?.amount || 0);
          amountBRL = amount;
          description = `Simulação de venda aprovada: "${req.body?.description || "Mentoria Tecnica"}" registrada na vitrine por R$ ${amount.toFixed(2)}.`;
        }
        else if (path === "/api/finance/release" && method === "POST") {
          action = "PIX_DEPOSIT";
          const amount = Number(req.body?.amount || 0);
          amountBRL = amount;
          description = `Simulação de liberação de saldo efetuada: R$ ${amount.toFixed(2)} movidos do saldo pendente para o saldo disponível do atleta.`;
        }

        // 7. ASSINATURA
        else if (path === "/api/subscriptions/checkout" && method === "POST") {
          action = "SYSTEM_SETTING_CHANGE";
          const planId = req.body?.planId || "FREE";
          description = `Fluxo de checkout ou reajuste de assinatura BJJ iniciado. Plano almejado: ${planId}.`;
        }
        else if (path === "/api/subscriptions/pay" && method === "POST") {
          action = "SYSTEM_SETTING_CHANGE";
          const subId = req.body?.subscriptionId || "novo";
          description = `Homologação e ativação definitiva de assinatura VIP concluída. ID transacional: ${subId}.`;
        }
        else if (path === "/api/subscriptions/cancel" && method === "POST") {
          action = "SYSTEM_SETTING_CHANGE";
          description = `Terminação solicitada de plano VIP ativo pelo assinante.`;
        }
        else if (path === "/api/subscriptions/simulate-cron" && method === "POST") {
          action = "SYSTEM_SETTING_CHANGE";
          description = `Operação simuladora síncrona rodada para conciliação automática de renovação de contratos de assinatura.`;
        }
        else if (path.match(/^\/api\/admin\/subscriptions\/([^\/]+)\/action$/) && method === "POST") {
          action = "SYSTEM_SETTING_CHANGE";
          const match = path.match(/^\/api\/admin\/subscriptions\/([^\/]+)\/action$/);
          const subId = match ? match[1] : "desconhecido";
          const act = req.body?.action || "AÇÃO";
          description = `Ação administrativa de assinatura (ID: "${subId}") alterada. Ação: ${act}.`;
        }

        // 8. ADMIN
        else if (path === "/api/admin/change-role" && method === "POST") {
          action = "ACCESS_ROLE_CHANGE";
          const targetId = req.body?.userId || "desconhecido";
          const newRole = req.body?.newRole || "ATHLETE";
          description = `Papel de segurança de lutador reprogramado para o ID de usuário "${targetId}". Novo papel: ${newRole}.`;
        }
        else if (path.match(/^\/api\/admin\/users\/([^\/]+)\/update$/) && method === "POST") {
          action = "ACCESS_ROLE_CHANGE";
          const match = path.match(/^\/api\/admin\/users\/([^\/]+)\/update$/);
          const targetId = match ? match[1] : "desconhecido";
          description = `Dados cadastrais de lutador editados no banco de dados por decisão do administrador para o ID "${targetId}".`;
        }
        else if (path.match(/^\/api\/admin\/rankings\/([^\/]+)\/score$/) && method === "POST") {
          action = "SYSTEM_SETTING_CHANGE";
          const match = path.match(/^\/api\/admin\/rankings\/([^\/]+)\/score$/);
          const targetId = match ? match[1] : "desconhecido";
          const elo = req.body?.elo || 1000;
          description = `Recalibração administrativa de ranqueamento competitiva para ID "${targetId}" definida com sucesso para ELO ${elo}.`;
        }
        else if (path.match(/^\/api\/admin\/reports\/([^\/]+)\/action$/) && method === "POST") {
          action = "SYSTEM_SETTING_CHANGE";
          const match = path.match(/^\/api\/admin\/reports\/([^\/]+)\/action$/);
          const reportId = match ? match[1] : "desconhecido";
          const decision = req.body?.decision || "DISMISS";
          description = `Ação correcional executada. Denúncia ID "${reportId}" resolvida com decisão de mediação: ${decision}.`;
        }

        // Se uma ação auditável foi detectada, grave os dados na tabela AuditLog
        if (action) {
          await prisma.auditLog.create({
            data: {
              actorId,
              action: action as any,
              description,
              ipAddress,
              userAgent,
              amountBRL,
              amountKC
            }
          });
        }
      } catch (err) {
        console.error("Erro na execução interna do middleware de auditoria:", err);
      }
    });

    return originalJson.call(this, body);
  };

  next();
});

const JWT_ACCESS_SECRET = process.env.JWT_SECRET || "super-secret-access-token-key-2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super-secret-refresh-token-key-2026-999";

// =========================================================================
// IN-MEMORY DATA CACHES & CATALOG FOR INTERNAL MARKETPLACE
// =========================================================================
export const ALL_ITEMS_CATALOG: Record<string, any> = {
  "p2p_gi_koral": {
    id: "p2p_gi_koral",
    name: "Kimono Koral Vintage 1998",
    description: "Direto do armário de um faixa preta aposentado. Desgastado na dose certa para assustar adversários.",
    category: "gi",
    price: 4500,
    currency: "KC",
    rarity: "Lendário",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200"
  },
  "p2p_title_canela": {
    id: "p2p_title_canela",
    name: 'Título: "Perna de Borracha"',
    description: "Somente para raspadores flexíveis de laço.",
    category: "title",
    price: 1500,
    currency: "KC",
    rarity: "Épico",
    imageUrl: ""
  },
  "p2p_title_leao": {
    id: "p2p_title_leao",
    name: 'Título: "Caçador de Faixas Pretas"',
    description: "Ostente uma autoconfiança lendária nos saguões virtuais!",
    category: "title",
    price: 6000,
    currency: "KC",
    rarity: "Lendário",
    imageUrl: ""
  },
  "item_gold_gi": {
    id: "item_gold_gi",
    name: "Quimono Imperial Dourado",
    description: "Um quimono de alta costura com costuras em fios de ouro virtual, reservado para os mestres.",
    category: "gi",
    price: 8000,
    currency: "KC",
    rarity: "Lendário",
    imageUrl: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=200"
  },
  "item_purple_belt": {
    id: "item_purple_belt",
    name: "Faixa Roxa Autografada",
    description: "Uma faixa roxa autografada por Royce Gracie.",
    category: "gi",
    price: 3500,
    currency: "KC",
    rarity: "Épico",
    imageUrl: ""
  },
  "item_armor_badge": {
    id: "item_armor_badge",
    name: "Emblema 'Guarda Inabalável'",
    description: "Um emblema que exibe no perfil sua capacidade de resistir a passagens.",
    category: "badge",
    price: 1200,
    currency: "KC",
    rarity: "Raro",
    imageUrl: ""
  }
};

export const inMemoryUserInventories = new Map<string, string[]>();
inMemoryUserInventories.set("user_athlete_test_1", ["item_purple_belt", "item_armor_badge"]);
inMemoryUserInventories.set("user_admin_test_1", ["item_gold_gi", "p2p_title_leao"]);

export let inMemoryMarketplaceItems: any[] = [
  {
    id: "p2p_gi_koral_listing",
    inventoryItemId: "p2p_gi_koral",
    sellerId: "user_4593",
    sellerName: "Mestre_Cascão90",
    priceKC: 4500,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "p2p_title_canela_listing",
    inventoryItemId: "p2p_title_canela",
    sellerId: "user_7733",
    sellerName: "GuardaAranhaGuy",
    priceKC: 1500,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "p2p_title_leao_listing",
    inventoryItemId: "p2p_title_leao",
    sellerId: "user_2288",
    sellerName: "LeãoDoTatame",
    priceKC: 6000,
    active: true,
    createdAt: new Date().toISOString()
  }
];

export let inMemoryMarketplaceSales: any[] = [
  {
    id: "sale_mock_1",
    marketplaceItemId: "p2p_gi_koral_listing",
    buyerId: "user_athlete_test_1",
    buyerName: "Fabio Gurgel Fan (USER)",
    sellerId: "user_4593",
    sellerName: "Mestre_Cascão90",
    pricePaidKC: 4500,
    feePaidKC: 450,
    itemName: "Kimono Koral Vintage 1998",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: "Seguro",
    riskScore: 12,
    securityNotes: "Transação auditada em canais criptografados."
  }
];

// Security trackers
const purchaseVelocityTracker = new Map<string, { count: number; lastTime: number }>();

// Middleware to authenticate JWT Access Token
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing. Please authenticate." });
  }

  jwt.verify(token, JWT_ACCESS_SECRET, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Token expired or invalid." });
    }
    const user = await authStore.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: "User no longer exists." });
    }
    try {
      const userSubscription = await getActiveSubscriptionForUser(decoded.userId);
      (user as any).subscription = userSubscription;
    } catch (subErr) {
      console.warn("Could not attach user subscription:", subErr);
      (user as any).subscription = { type: "FREE", priceBRL: 0, autoRenew: false };
    }

    // Inject marketplace inventory tracking
    if (user && user.id) {
      if (!inMemoryUserInventories.get(user.id)) {
        inMemoryUserInventories.set(user.id, ["item_purple_belt", "item_armor_badge"]);
      }
      (user as any).inventory = inMemoryUserInventories.get(user.id) || [];
      if ((user as any).coins === undefined) {
        (user as any).coins = 600;
      }
    }

    req.user = user;
    next();
  });
};

// Middleware to authorize specific Roles
export const requireRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden. Higher privilege role needed to execute this action.",
      });
    }
    next();
  };
};

// =========================================================================
// API ENDPOINTS FOR SECURE JWT AUTHENTICATION
// =========================================================================

// 1. REGISTER
app.post("/api/auth/register", async (req: any, res: any) => {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields (email, name, password)." });
    }

    // Email format simple check
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const existingUser = await authStore.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "An account already exists with this email address." });
    }

    // Role check - safe register defaulting to ATHLETE unless explicitly admin request
    let selectedRole: "ATHLETE" | "ADMIN" = "ATHLETE";
    if (role === "ADMIN") {
      selectedRole = "ADMIN";
    }

    // Hash password using secure bcrypt configuration
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate Verification Token
    const verificationToken = "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    // Persist User
    const newUser = await authStore.createUser({
      email,
      name,
      passwordHash,
      role: selectedRole,
      verificationToken,
    });

    // Send Simulated Email
    const verificationUrl = `${req.protocol}://${req.get("host")}/verify?token=${verificationToken}`;
    const emailSubject = "🥋 Bem-vindo ao Jiuspeak! Confirme o seu e-mail";
    const emailBody = `Olá ${name},\n\nObrigado por se registrar! Confirme sua conta clicando no link abaixo:\n\n${verificationUrl}\n\nCódigo de Verificação: ${verificationToken}\n\nOss!`;
    
    authStore.logSentEmail(email, emailSubject, emailBody, verificationToken);

    res.status(201).json({
      message: "Registro concluído com sucesso. Um e-mail de confirmação foi enviado.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isEmailVerified: false,
      },
      devMessage: "Em modo de demonstração de produção, utilize o painel de depuração ou logs para visualizar o e-mail de confirmação."
    });
  } catch (error: any) {
    console.error("Error in register endpoint:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 2. LOGIN
app.post("/api/auth/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString();
    const userAgent = req.headers["user-agent"];

    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são campos obrigatórios." });
    }

    // Check brute-force constraints
    const blockCheck = await AuthService.checkBruteForceBlock({ email, ipAddress });
    if (blockCheck.isBlocked) {
      return res.status(429).json({ 
        error: `Múltiplas tentativas de login incorretas registradas. Bloqueio temporário ativo por mais ${blockCheck.remainingMinutes} minutos para proteger sua conta.` 
      });
    }

    const user = await authStore.findByEmail(email);
    if (!user || !user.passwordHash) {
      await AuthService.recordLoginAttempt({ email, ipAddress, success: false });
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Verify Password Hash
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      await AuthService.recordLoginAttempt({ email, ipAddress, success: false });
      
      // Audit failure
      await AuthService.audit({
        actorId: user.id,
        action: "USER_LOGIN",
        description: `Falha de autenticação: entrada de senha incorreta para o login ${email}.`,
        ipAddress,
        userAgent
      });

      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Success login registered
    await AuthService.recordLoginAttempt({ email, ipAddress, success: true });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id!,
      email: user.email!,
      role: user.role!,
    });

    const refreshToken = generateRefreshToken(user.id!);

    // Persist new Refresh Token in Postgres
    await AuthService.registerSession({
      userId: user.id!,
      token: refreshToken,
      ipAddress,
      userAgent
    });

    // Simpler backwards compatibility sync
    await authStore.updateUser(user.id!, { refreshToken });

    // Audit login success
    await AuthService.audit({
      actorId: user.id!,
      action: "USER_LOGIN",
      description: `Autenticação bem-sucedida para o usuário ${user.name} via login principal.`,
      ipAddress,
      userAgent
    });

    res.json({
      message: "Login realizado com sucesso!",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        belt: user.belt,
        stripes: user.stripes,
        xp: user.xp,
        level: user.level,
        elo: user.elo,
        isEmailVerified: user.isEmailVerified,
      }
    });
  } catch (error: any) {
    console.error("Error in login endpoint:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3. REFRESH TOKEN (Roda de Refresh Tokens com rota segura e auto-rotação)
app.post("/api/auth/refresh", async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString();
    const userAgent = req.headers["user-agent"];

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required." });
    }

    try {
      const tokens = await AuthService.rotateToken({
        refreshToken,
        ipAddress,
        userAgent
      });

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        message: "O token de acesso e a sessão foram atualizados com sucesso."
      });
    } catch (rotateErr: any) {
      if (rotateErr.message === "SECURITY_BREACH_DETECTED") {
        return res.status(401).json({ 
          error: "Alerta de Segurança: Tentativa ilegal de reuso de sessão encontrada.",
          advice: "Sua conta foi colocada em quarentena preventiva e todas as sessões ativas foram encerradas de imediato para sua segurança. Por favor, realize um novo login."
        });
      } else if (rotateErr.message === "TOKEN_EXPIRED") {
        return res.status(401).json({ error: "Sua sessão de refresh expirou. Faça login novamente." });
      } else {
        return res.status(401).json({ error: "Sessão inválida ou expirada. Faça login novamente." });
      }
    }
  } catch (error: any) {
    console.error("Error in token refresh endpoint:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4. LOGOUT
app.post("/api/auth/logout", async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.invalidateSession(refreshToken);
    }
    res.json({ message: "Desconectado com sucesso." });
  } catch (error: any) {
    console.error("Error in logout endpoint:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4.1 SESSION RETRIEVAL (Listar sessões de login ativas no banco de dados)
app.get("/api/auth/sessions", authenticateToken, async (req: any, res: any) => {
  try {
    const sessions = await AuthService.getUserSessions(req.user.id);
    res.json({ sessions });
  } catch (error: any) {
    console.error("Error retrieving user sessions:", error);
    res.status(500).json({ error: "Erro ao carregar as sessões ativas." });
  }
});

// 4.2 SESSION REVOCATION (Anulação de sessões ativas adicionais)
app.post("/api/auth/sessions/revoke-all", authenticateToken, async (req: any, res: any) => {
  try {
    await AuthService.revokeAllSessions(req.user.id);
    await AuthService.audit({
      actorId: req.user.id,
      action: "ACCESS_ROLE_CHANGE",
      description: "Usuário revogou todas as suas sessões ativas em outros dispositivos (Global Logoff).",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
    res.json({ message: "Todas as outras sessões foram encerradas com sucesso." });
  } catch (error: any) {
    console.error("Error revoking all sessions:", error);
    res.status(500).json({ error: "Erro ao encerrar as sessões." });
  }
});

app.post("/api/auth/sessions/:id/revoke", authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const prisma = getPrisma();
    
    const sess = await prisma.refreshToken.findUnique({ where: { id } });
    if (!sess || sess.userId !== req.user.id) {
      return res.status(403).json({ error: "Ação não autorizada ou sessão inexistente." });
    }

    await prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true }
    });

    await AuthService.audit({
      actorId: req.user.id,
      action: "ACCESS_ROLE_CHANGE",
      description: `Usuário revogou manualmente uma sessão identificada pelo ID: ${id}.`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({ message: "Sessão individual encerrada com sucesso." });
  } catch (error: any) {
    console.error("Error revoking specific session:", error);
    res.status(500).json({ error: "Erro ao encerrar a sessão selecionada." });
  }
});

// 5. GET ME (Perfil logado)
app.get("/api/auth/me", authenticateToken, (req: any, res: any) => {
  const { passwordHash, refreshToken, resetToken, resetTokenExpires, verificationToken, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// 6. EMAIL CONFIRMATION (Confirmar e-mail de registro)
app.post("/api/auth/verify", async (req: any, res: any) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token de verificação não informado." });
    }

    // Traverse users in DB/fallback to find matched verificationToken
    let matchedId: string | null = null;
    let matchedUser: any = null;

    const prisma = getPrisma();
    if (prisma) {
      const u = await prisma.user.findFirst({ where: { verificationToken: token } });
      if (u) {
        matchedId = u.id;
        matchedUser = u;
      }
    }

    if (!matchedId) {
      for (const u of inMemoryUsers.values()) {
        if (u.verificationToken === token) {
          matchedId = u.id;
          matchedUser = u;
          break;
        }
      }
    }

    if (!matchedId || !matchedUser) {
      return res.status(404).json({ error: "Código de verificação inválido ou já expirado." });
    }

    await authStore.updateUser(matchedId, {
      isEmailVerified: true,
      verificationToken: null,
    });

    res.json({
      success: true,
      message: "E-mail confirmado com sucesso! Bem-vindo oficial ao dojô.",
    });
  } catch (error: any) {
    console.error("Error in email verification:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 7. PASSWORD RECOVERY (Recuperação de Senha - Esqueceu a senha)
app.post("/api/auth/forgot-password", async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Insira o e-mail cadastrado." });
    }

    const user = await authStore.findByEmail(email);
    if (!user) {
      // Security practice: do not leak whether email exists, return 200 message regardless
      return res.json({
        message: "Se a conta existir, um e-mail com instruções para redefinição foi despachado.",
        devNote: "E-mail não localizado na base cadastral."
      });
    }

    // Generate password reset token
    const resetToken = "reset_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(2, 6);
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    await authStore.updateUser(user.id!, {
      resetToken,
      resetTokenExpires,
    });

    // Send Simulated Email
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;
    const emailSubject = "🔑 Recuperação de senha - Jiuspeak";
    const emailBody = `Olá ${user.name},\n\nRecebemos uma solicitação para redefinir a de senha de sua conta.\nUtilize o link abaixo ou o token direto no formulário para concluir o procedimento:\n\n${resetUrl}\n\nToken de Redefinição: ${resetToken}\n\nNota: Este código expira em 1 hora.\nSe você não solicitou isso, desconsidere este e-mail.`;

    authStore.logSentEmail(user.email!, emailSubject, emailBody, resetToken);

    res.json({
      message: "Se a conta existir, um e-mail com instruções para redefinição foi despachado.",
      devMessage: "Em modo de demonstração de produção, verifique a pasta de saída/logs de e-mail ou utilize o painel dev."
    });
  } catch (error: any) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 8. RESET PASSWORD (Redefinição final)
app.post("/api/auth/reset-password", async (req: any, res: any) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token e nova senha são mandatórios." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "A nova senha precisa ter ao menos 6 caracteres." });
    }

    // Locate user by reset token
    let matchedId: string | null = null;
    let matchedTokenExpires: Date | null = null;

    const prisma = getPrisma();
    if (prisma) {
      const u = await prisma.user.findFirst({ where: { resetToken: token } });
      if (u) {
        matchedId = u.id;
        matchedTokenExpires = u.resetTokenExpires;
      }
    }

    if (!matchedId) {
      for (const u of inMemoryUsers.values()) {
        if (u.resetToken === token) {
          matchedId = u.id;
          matchedTokenExpires = u.resetTokenExpires;
          break;
        }
      }
    }

    if (!matchedId || !matchedTokenExpires) {
      return res.status(400).json({ error: "Token de redefinição de senha inválido ou expirado." });
    }

    // Verify expiration dating
    if (new Date() > new Date(matchedTokenExpires)) {
      return res.status(400).json({ error: "Este token de redefinição expirou. Solicite um novo." });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Save properties
    await authStore.updateUser(matchedId, {
      passwordHash: newPasswordHash,
      resetToken: null,
      resetTokenExpires: null,
    });

    res.json({
      success: true,
      message: "Senha redefinida com sucesso! Você já pode realizar o login com as suas novas credenciais.",
    });
  } catch (error: any) {
    console.error("Error in reset-password endpoint:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 9. OUTBOX MONITOR (For Sandbox UX Testing)
app.get("/api/dev/emails", (req: any, res: any) => {
  res.json({ emails: simulatedSentEmails });
});

app.post("/api/dev/emails/clear", (req: any, res: any) => {
  simulatedSentEmails.length = 0;
  res.json({ status: "cleared" });
});

// 10. ADMIN & USERS LIST (Demonstrates Roles / ADMIN route)
app.get("/api/admin/users", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    // Collect from real database or local in memory lists
    const usersList: any[] = [];
    const prisma = getPrisma();
    if (prisma) {
      try {
        const list = await prisma.user.findMany({
          orderBy: { createdAt: "desc" },
        });
        list.forEach((u: any) => {
          usersList.push({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            belt: u.belt,
            stripes: u.stripes,
            level: u.level,
            elo: u.elo,
            isEmailVerified: u.isEmailVerified,
            createdAt: u.createdAt,
          });
        });
      } catch (err) {
        console.error("Failed to query prisma list, will use in memory", err);
      }
    }

    if (usersList.length === 0) {
      for (const u of inMemoryUsers.values()) {
        usersList.push({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          belt: u.belt,
          stripes: u.stripes,
          level: u.level,
          elo: u.elo,
          isEmailVerified: u.isEmailVerified,
          createdAt: u.resetTokenExpires || new Date(),
        });
      }
    }

    res.json({ users: usersList });
  } catch (error: any) {
    console.error("Admin user list fetch error:", error);
    res.status(500).json({ error: "Server failed to fetch list." });
  }
});

// 11. ADMIN PROMOTE USER (Elevates user status, demonstrates ADMIN privilege)
app.post("/api/admin/change-role", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({ error: "Missing required parameters (userId, newRole)." });
    }

    if (!["ATHLETE", "INSTRUCTOR", "ADMIN"].includes(newRole)) {
      return res.status(400).json({ error: "Plano de role inválido." });
    }

    const updated = await authStore.updateUser(userId, { role: newRole as any });
    if (!updated) {
      return res.status(404).json({ error: "Usuário não localizado." });
    }

    res.json({
      success: true,
      message: `Role do usuário foi reconfigurado com sucesso para ${newRole}.`,
    });
  } catch (error: any) {
    console.error("Admin change role error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// =========================================================================
// SOCIAL COMPLAINTS & ABUSE REPORTS DATABASE (DENÚNCIAS ENGINES & ACTIONS)
// =========================================================================
export let inMemoryDenuncias: any[] = [
  {
    id: "rep_initial_1",
    reporterName: "Thiago Filho do Vento",
    reporterEmail: "thiago@filhovento.com",
    reportedUserName: "Guilherme Faixa Azul",
    contentType: "POST",
    reason: "Publicação inadequada / Desrespeito à hierarquia",
    contentPreview: "Aquele momento em que o faixa preta diz 'vamos dar um rolinho leve', você aceita e seu corpo vira origami em 3 minutos...",
    status: "PENDING", // PENDING, RESOLVED_DELETE, DISMISSED
    referenceId: "post_initial_2", // Matches Guilherme's post
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    id: "rep_initial_2",
    reporterName: "Fabrícia Guardeira",
    reporterEmail: "guardeira@gmail.com",
    reportedUserName: "Claudio Chave de Pé",
    contentType: "COMMENT",
    reason: "Comportamento nocivo",
    contentPreview: "Tente fazer pegada de concha (gancho com 4 dedos para dentro sem torcer) em vez de estrangular o pano do quimono.",
    status: "PENDING",
    referenceId: "c_initial_3", // Matches comment on post initial 3
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

// 12. GET ADMIN DASHBOARD CENTRALIZED STATS
app.get("/api/admin/dashboard-stats", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    let totalUsers = 0;
    let activeSubscriptions = 0;
    let totalPixVolume = 0.00;
    let pendingWithdrawalsVolume = 0.00;
    let activeMarketItems = 0;
    
    // 1. Gather Users
    try { 
      totalUsers = await prisma.user.count(); 
    } catch(err) {
      console.error("Error drawing user statistics counts:", err);
    }

    // 2. Gather Subscriptions
    try { 
      activeSubscriptions = await prisma.subscription.count({ where: { status: "ACTIVE" } }); 
    } catch(err) {
      console.error("Error drawing subscription counts:", err);
    }

    // 3. PIX Deposits Completed
    try {
      const ag = await prisma.pixPayment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amountBRL: true }
      });
      totalPixVolume = Number(ag._sum.amountBRL || 0);
    } catch(err) {
      console.error("Error drawing pix volume calculations:", err);
    }

    // 4. Pending Cashouts Volume
    try {
      const ag = await prisma.withdrawal.aggregate({
        where: { status: "PENDING" },
        _sum: { amountBRL: true }
      });
      pendingWithdrawalsVolume = Number(ag._sum.amountBRL || 0);
    } catch(err) {
      console.error("Error drawing pending withdrawals calculations:", err);
    }

    // 5. Active Marketplace count
    try { 
      activeMarketItems = await prisma.marketplaceItem.count({ where: { active: true } }); 
    } catch(err) {
      console.error("Error drawing active marketplace items:", err);
    }

    const pendingReports = inMemoryDenuncias.filter(r => r.status === "PENDING").length;

    res.json({
      stats: {
        totalUsers,
        activeSubscriptions,
        totalPixVolume,
        pendingWithdrawalsVolume,
        activeMarketItems,
        pendingReports,
        serverTime: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV || "development"
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao compilar métricas analíticas e operacionais." });
  }
});

// 13. ADMIN COMPREHENSIVE USER UPDATE (BRL, ELO, LEVEL, BEILT, VIRTUAL COINS, BAN STATE)
app.post("/api/admin/users/:id/update", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, email, level, belt, stripes, coins, balanceBRL, elo, role } = req.body;

    const userObj = await authStore.findById(id);
    if (!userObj) {
      return res.status(404).json({ error: "Lutador não localizado no banco." });
    }

    // Core attributes update
    const updatePayload: any = {};
    if (name !== undefined) updatePayload.name = name;
    if (email !== undefined) updatePayload.email = email;
    if (level !== undefined) updatePayload.level = Number(level);
    if (belt !== undefined) updatePayload.belt = belt;
    if (stripes !== undefined) updatePayload.stripes = Number(stripes);
    if (elo !== undefined) updatePayload.elo = Number(elo);
    if (role !== undefined) updatePayload.role = role;

    // Coins & Balance are stored in wallet or local user structure
    if (coins !== undefined) {
      updatePayload.coins = Number(coins);
    }
    if (balanceBRL !== undefined) {
      updatePayload.balanceAvailableBRL = Number(balanceBRL);
    }

    const updated = await authStore.updateUser(id, updatePayload);

    // If there is real database connection, sync parameters to user's wallet table if applicable
    const prisma = getPrisma();
    if (prisma) {
      try {
        const userWallet = await prisma.wallet.findUnique({ where: { userId: id } });
        if (userWallet) {
          await prisma.wallet.update({
            where: { id: userWallet.id },
            data: {
              balanceKC: coins !== undefined ? Number(coins) : undefined,
              balanceBRL: balanceBRL !== undefined ? Number(balanceBRL) : undefined,
              balanceAvailable: balanceBRL !== undefined ? Number(balanceBRL) : undefined
            }
          });
        }
      } catch (err) {
        console.warn("Prisma wallet adjustment sync ignored:", err);
      }
    }

    res.json({
      success: true,
      message: `Ficha cadastral do lutador ${userObj ? userObj.name : ''} foi atualizada com sucesso!`,
      user: updated
    });
  } catch (error) {
    res.status(500).json({ error: "Não foi possível regravar parâmetros do usuário." });
  }
});

// 14. GET ALL SUBSCRIPTIONS FOR REVIEW IN THE SYSTEM
app.get("/api/admin/subscriptions", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    let resultList: any[] = [];

    if (prisma) {
      try {
        const subs = await prisma.subscription.findMany({
          include: {
            user: { select: { id: true, name: true, email: true } },
            plan: true
          },
          orderBy: { createdAt: "desc" }
        });
        resultList = subs.map((s: any) => ({
          id: s.id,
          userId: s.userId,
          subscriberName: s.user?.name || "Desconhecido",
          subscriberEmail: s.user?.email || "unknown@jiuspeak.com",
          planId: s.planId,
          planName: s.plan?.name || "Premium",
          amountBRL: Number(s.plan?.priceBRL || 49.90),
          status: s.status,
          startDate: s.startDate.toISOString(),
          endDate: s.endDate.toISOString(),
          canceledAt: s.canceledAt ? s.canceledAt.toISOString() : null,
          createdAt: s.createdAt.toISOString()
        }));
      } catch (err) {
        console.warn("DB subscription aggregate fallback triggered:", err);
      }
    }

    // Merge Mock / In-Memory Subscriptions
    const list = [...resultList];
    for (const sub of inMemorySubscriptions) {
      if (!list.some(s => s.id === sub.id)) {
        const matchedUser = inMemoryUsers.get(sub.userId);
        const matchedPlan = inMemoryPlans.find(p => p.id === sub.planId);
        list.push({
          id: sub.id,
          userId: sub.userId,
          subscriberName: matchedUser ? matchedUser.name : "Simulador Local",
          subscriberEmail: matchedUser ? matchedUser.email : "sim@jiuspeak.com",
          planId: sub.planId,
          planName: matchedPlan ? matchedPlan.name : "Faixa Preta Premium",
          amountBRL: matchedPlan ? Number(matchedPlan.priceBRL) : 49.90,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          canceledAt: sub.canceledAt || null,
          createdAt: sub.createdAt || new Date().toISOString()
        });
      }
    }

    res.json({ subscriptions: list });
  } catch (error) {
    res.status(500).json({ error: "Erro ao coletar faturamento das assinaturas." });
  }
});

// 15. TOGGLE/REVIEW SUBSCRIPTION ACTION (CANCEL OR RE-ACTIVATE)
app.post("/api/admin/subscriptions/:id/action", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // CANCEL or REACTIVATE

    if (action !== "CANCEL" && action !== "REACTIVATE") {
      return res.status(400).json({ error: "Ação de assinatura inválida." });
    }

    let updated = false;

    // Try modifying in-memory table first
    const memIdx = inMemorySubscriptions.findIndex(s => s.id === id);
    if (memIdx !== -1) {
      if (action === "CANCEL") {
        inMemorySubscriptions[memIdx].status = "CANCELED";
        inMemorySubscriptions[memIdx].canceledAt = new Date().toISOString();
      } else {
        inMemorySubscriptions[memIdx].status = "ACTIVE";
        inMemorySubscriptions[memIdx].canceledAt = undefined;
        inMemorySubscriptions[memIdx].endDate = new Date(Date.now() + 86400000 * 30).toISOString();
      }
      updated = true;
    }

    const prisma = getPrisma();
    if (prisma) {
      try {
        const target = await prisma.subscription.findUnique({ where: { id } });
        if (target) {
          await prisma.subscription.update({
            where: { id },
            data: {
              status: action === "CANCEL" ? "CANCELED" : "ACTIVE",
              canceledAt: action === "CANCEL" ? new Date() : null,
              endDate: action === "REACTIVATE" ? new Date(Date.now() + 86400000 * 30) : undefined
            }
          });
          updated = true;
        }
      } catch (err) {
        console.warn("DB subscription status review ignored:", err);
      }
    }

    if (!updated) {
      return res.status(404).json({ error: "Assinatura de plano não encontrada no sistema." });
    }

    res.json({
      success: true,
      message: action === "CANCEL" 
        ? "Plano de assinatura do lutador rescindido administrativamente." 
        : "Contrato Premium do lutador restabelecido com sucesso!"
    });
  } catch (error) {
    res.status(500).json({ error: "Fracasso ao atualizar status da assinatura." });
  }
});

// 16. GET ALL PIX DEPOSITS EXPENDITURES
app.get("/api/admin/pix", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    let resultList: any[] = [];

    if (prisma) {
      try {
        const dbPix = await prisma.pixPayment.findMany({
          include: {
            transaction: {
              include: {
                wallet: {
                  include: { user: { select: { name: true, email: true } } }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        });

        resultList = dbPix.map((p: any) => ({
          id: p.id,
          txid: p.txid,
          userName: p.transaction?.wallet?.user?.name || "Atleta Externo",
          userEmail: p.transaction?.wallet?.user?.email || "external@atleta.com",
          amountBRL: Number(p.amountBRL),
          status: p.status,
          createdAt: p.createdAt.toISOString(),
          expiresAt: p.expiresAt.toISOString(),
          paidAt: p.paidAt ? p.paidAt.toISOString() : null,
          type: "DEPÓSITO WALLET"
        }));
      } catch (_) {}
    }

    // Merge In-Memory
    const combined = [...resultList];
    for (const mem of inMemoryPixPayments) {
      if (!combined.some(c => c.txid === mem.txid)) {
        const u = inMemoryUsers.get(mem.userId);
        combined.push({
          id: mem.txid,
          txid: mem.txid,
          userName: u ? u.name : "Simulador Local",
          userEmail: u ? u.email : "sim@jiuspeak.com",
          amountBRL: Number(mem.amountBRL),
          status: mem.status,
          createdAt: mem.createdAt || new Date(Date.now() - 3600 * 2000).toISOString(),
          expiresAt: mem.expiresAt || new Date(Date.now() + 3600 * 5000).toISOString(),
          paidAt: mem.paidAt || null,
          type: mem.type === "WALLET_DEPOSIT" ? "CRÉDITO AVULSO" : "PLANO PREMIUM"
        });
      }
    }

    res.json({ pixPayments: combined });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter transações PIX." });
  }
});

// 17. MANUALLY SET PIX TRANSACTION PAYMENT AS PAID OR EXPIRED
app.post("/api/admin/pix/:id/action", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params; // this can be either id or txid
    const { action } = req.body; // APPROVE or EXPIRE

    if (action !== "APPROVE" && action !== "EXPIRE") {
      return res.status(400).json({ error: "Ação de depósitos PIX inválida. Opte por APPROVE ou EXPIRE." });
    }

    // Let's call our existing internal webhook processing block to sync wallets correctly!
    // We already have a "/api/finance/pix-webhook" which has robust logic for crediting wallets and updating DBs.
    // Let's perform a redirection or call our business rules on the same script dynamically!
    let txidToUse = id;
    
    // Find the txid from in memory or DB first if we were passed a simpler id
    const matchedPayment = inMemoryPixPayments.find(p => p.txid === id || p.id === id);
    if (matchedPayment) {
      txidToUse = matchedPayment.txid;
    }

    if (action === "APPROVE") {
      // Trigger simulating payment processing webhook!
      const webhookCallbackUrl = `/api/finance/pix-webhook`;
      // Direct execute: Simulate payment notification from BACEN
      try {
        const host = req.get('host');
        await fetch(`http://${host || 'localhost:3000'}/api/finance/pix-webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: "pix.received",
            pix: [
              {
                txid: txidToUse,
                valor: matchedPayment ? matchedPayment.amountBRL : 100.00,
                horario: new Date().toISOString()
              }
            ]
          })
        });
      } catch (localHookErr) {
        // Fallback manually updating memory databases if fetch fails
        console.warn("Direct webhook callback failed, resolving fallback update:", localHookErr);
        const idx = inMemoryPixPayments.findIndex(p => p.txid === txidToUse);
        if (idx !== -1) {
          inMemoryPixPayments[idx].status = "COMPLETED";
          inMemoryPixPayments[idx].paidAt = new Date().toISOString();
          
          // Credit user coins manually!
          const uId = inMemoryPixPayments[idx].userId;
          const uObj = inMemoryUsers.get(uId);
          if (uObj) {
            uObj.balanceAvailableBRL = Number(uObj.balanceAvailableBRL || 0) + Number(inMemoryPixPayments[idx].amountBRL);
            uObj.coins = Number(uObj.coins || 0) + Math.round(Number(inMemoryPixPayments[idx].amountBRL) * 1.5);
            await authStore.updateUser(uId, {
              balanceAvailableBRL: uObj.balanceAvailableBRL,
              coins: uObj.coins
            });
          }
        }
      }
    } else {
      // Expire transaction
      const idx = inMemoryPixPayments.findIndex(p => p.txid === txidToUse);
      if (idx !== -1) {
        inMemoryPixPayments[idx].status = "EXPIRED";
      }
      
      const prisma = getPrisma();
      if (prisma) {
        try {
          await prisma.pixPayment.update({
            where: { txid: txidToUse },
            data: { status: "EXPIRED" }
          });
        } catch (_) {}
      }
    }

    res.json({ success: true, message: `Status do PIX administrativamente alterado para ${action === "APPROVE" ? "Pago (Aprovado)" : "Expirado"}` });
  } catch (error) {
    res.status(500).json({ error: "Erro ao modificar conciliação de PIX." });
  }
});

// 18. GET ALL P2P MARKETPLACE TRANSACTIONS FOR MONITORING
app.get("/api/admin/marketplace", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const list: any[] = [];
    
    // Convert active listings
    inMemoryMarketplaceItems.forEach(item => {
      const seller = inMemoryUsers.get(item.sellerId);
      list.push({
        id: item.id,
        name: item.name,
        priceKC: item.priceKC,
        active: item.active,
        rarity: item.rarity || "COMMON",
        sellerName: seller ? seller.name : "Atleta Vendedor",
        sellerEmail: seller ? seller.email : "des@vendedor.com",
        createdAt: item.createdAt || new Date().toISOString(),
        inventoryItemId: item.inventoryItemId,
        status: item.active ? "ATIVO À VENDA" : "VENDIDO / CANCELADO"
      });
    });

    res.json({ marketplace: list, sales: inMemoryMarketplaceSales });
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar dados do comércio interno." });
  }
});

// 19. ADMIN REMOVE BLOCK MARKET LISTING SPAM
app.post("/api/admin/marketplace/:id/action", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params; // Listing id
    const listingsIdx = inMemoryMarketplaceItems.findIndex(li => li.id === id);
    
    if (listingsIdx === -1) {
      return res.status(404).json({ error: "Anúncio do Marketplace não localizado para suspensão." });
    }

    // Set active = false and return back to seller inventory
    const item = inMemoryMarketplaceItems[listingsIdx];
    item.active = false;
    
    const sellerId = item.sellerId;
    const invItemId = item.inventoryItemId;
    
    // Return to inventory
    const buyerInv = inMemoryUserInventories.get(sellerId) || [];
    if (!buyerInv.includes(invItemId)) {
      inMemoryUserInventories.set(sellerId, [...buyerInv, invItemId]);
    }

    res.json({ success: true, message: "Anúncio suspenso com sucesso. Objeto foi removido do pregão e estornado ao inventário do vendedor!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cancelar pregão." });
  }
});

// 20. GET REALTIME PLATFORM-WIDE AUDIT LOGS
app.get("/api/admin/audit-logs", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    let queryLogs: any[] = [];

    if (prisma) {
      try {
        const dbLogs = await prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          include: { actor: { select: { name: true, email: true } } }
        });
        queryLogs = dbLogs.map((l: any) => ({
          id: l.id,
          timestamp: l.createdAt.toISOString(),
          type: String(l.action).toLowerCase(),
          description: l.description,
          actorName: l.actor?.name || "Plataforma"
        }));
      } catch (_) {}
    }

    res.json({ logs: queryLogs });
  } catch (error) {
    res.status(500).json({ error: "Mecanismo indisponível para depurar logs gerais." });
  }
});

// 21. UPDATE LEADERBOARDS AND PVP RATINGS OF A FIGHTER
app.post("/api/admin/rankings/:id/score", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { elo, wins, losses } = req.body;

    const athleteObj = await authStore.findById(id);
    if (!athleteObj) {
      return res.status(404).json({ error: "Lutador do ranking não localizado." });
    }

    const payload: any = {};
    if (elo !== undefined) payload.elo = Number(elo);
    if (wins !== undefined) payload.winCount = Number(wins);
    if (losses !== undefined) payload.lossCount = Number(losses);

    // If stats are updated, sync standard maps or Prisma rankings
    const updated = await authStore.updateUser(id, payload);

    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.rank.upsert({
          where: { userId: id },
          update: { points: elo !== undefined ? Number(elo) : undefined },
          create: { userId: id, points: elo !== undefined ? Number(elo) : 1000 }
        });
      } catch (_) {}
    }

    res.json({ success: true, message: `Rankings e dados PvP do lutador reparametrizados. Elo definido para ${elo !== undefined ? elo : athleteObj.elo}!` });
  } catch (error) {
    res.status(500).json({ error: "Falha na recalibração de resultados PvP." });
  }
});

// 22. GET REVIEWS / CONTENT ABUSE REPORTS FOR MODERATORS
app.get("/api/admin/reports", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    res.json({ reports: inMemoryDenuncias });
  } catch (error) {
    res.status(500).json({ error: "Fracasso ao extrair painel de relatórios de abusos." });
  }
});

// 23. EXECUTE ADMIN ACTION FOR CONTENT REPORT (DISMISS OR DELETE CONFLICT CONTENT)
app.post("/api/admin/reports/:id/action", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // "DISMISS" or "DELETE_CONTENT"

    if (decision !== "DISMISS" && decision !== "DELETE_CONTENT") {
      return res.status(400).json({ error: "Decisão de recurso sobre denúncia inválida." });
    }

    const repIdx = inMemoryDenuncias.findIndex(r => r.id === id);
    if (repIdx === -1) {
      return res.status(404).json({ error: "Caso de denúncia não localizado." });
    }

    const report = inMemoryDenuncias[repIdx];
    
    if (decision === "DISMISS") {
      report.status = "DISMISSED";
    } else {
      // DELETE_CONTENT action
      report.status = "RESOLVED_DELETE";
      const referenceId = report.referenceId;

      const prisma = getPrisma();
      if (report.contentType === "POST") {
        try {
          await prisma.socialPost.delete({ where: { id: referenceId } });
        } catch (_) {}
      } else {
        try {
          await prisma.comment.delete({ where: { id: referenceId } });
        } catch (_) {}
      }
    }

    res.json({ success: true, message: `Denúncia encerrada com êxito. Decisão tomada: ${decision === "DISMISS" ? "Ignorar denúncia" : "Conteúdo excluído do Tatame Conectado"}` });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao processar recurso de abuso de conteúdo." });
  }
});

// =========================================================================
// PVP PLATFORM API ENDPOINTS
// =========================================================================
app.get("/api/pvp/leaderboard", async (req: any, res: any) => {
  try {
    const list: any[] = [];
    const prisma = getPrisma();
    if (prisma) {
      try {
        const queryUsers = await prisma.user.findMany({
          orderBy: { elo: "desc" },
          take: 10,
        });
        queryUsers.forEach((u: any) => {
          list.push({
            id: u.id,
            name: u.name,
            elo: u.elo,
            belt: u.belt,
            level: u.level,
            avatar: u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`
          });
        });
      } catch (err) {
        console.error("Failed to query prisma leaderboard:", err);
      }
    }

    res.json({ leaderboard: list });
  } catch (error: any) {
    res.status(500).json({ error: "Falha ao coletar dados do ranking PvP." });
  }
});

// =========================================================================
// API ENDPOINTS FOR THE COMPLETE FINANCIAL SYSTEM (WALLET)
// =========================================================================

// 1. GET current wallet fields
app.get("/api/finance/wallet", authenticateToken, async (req: any, res: any) => {
  try {
    const user = await authStore.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.json({
      balanceAvailableBRL: user.balanceAvailableBRL ?? 420.00,
      balancePendingBRL: user.balancePendingBRL ?? 155.00,
      totalEarnedBRL: user.totalEarnedBRL ?? 575.00,
      totalWithdrawnBRL: user.totalWithdrawnBRL ?? 0.00,
    });
  } catch (err: any) {
    console.error("Erro ao obter carteira:", err);
    res.status(500).json({ error: "Erro interno ao consultar carteira financeira." });
  }
});

// 1.1 GET regular user's own withdrawal history
app.get("/api/finance/withdrawals", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const prisma = getPrisma();
    let dbResults: any[] = [];
    
    if (prisma) {
      try {
        const withdraws = await prisma.withdrawal.findMany({
          where: {
            wallet: { userId }
          },
          orderBy: { createdAt: "desc" }
        });
        dbResults = withdraws.map((w: any) => ({
          id: w.id,
          walletId: w.walletId,
          userId: userId,
          userEmail: req.user.email || "usuario@jiuspeak.com",
          userName: req.user.name || "Usuário",
          amountBRL: Number(w.amountBRL),
          status: w.status,
          pixKey: w.pixKey,
          pixKeyType: w.pixKeyType,
          notes: w.notes,
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString()
        }));
      } catch (dbErr) {
        console.warn("DB user withdrawals list error, falling back:", dbErr);
      }
    }

    // Merge with in-memory filtered by user
    const filteredInMemory = inMemoryWithdrawals.filter(w => w.userId === userId);
    const mergedList = [...dbResults];
    for (const inMem of filteredInMemory) {
      if (!mergedList.some(m => m.id === inMem.id)) {
        mergedList.push(inMem);
      }
    }

    // Sort by Date Desc
    mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ withdrawals: mergedList });
  } catch (err) {
    res.status(500).json({ error: "Erro ao obter histórico de saques." });
  }
});

// 2. Simular venda aprovada -> goes to saldo pendente and increases total ganho
app.post("/api/finance/sale", authenticateToken, async (req: any, res: any) => {
  try {
    const { amount, description } = req.body;
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: "Valor de venda inválido." });
    }

    const user = await authStore.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const currentPending = user.balancePendingBRL ?? 0;
    const currentEarned = user.totalEarnedBRL ?? 0;

    const newPending = Number((currentPending + value).toFixed(2));
    const newEarned = Number((currentEarned + value).toFixed(2));

    await authStore.updateUser(user.id!, {
      balancePendingBRL: newPending,
      totalEarnedBRL: newEarned,
    });

    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id!,
            action: "MARKETPLAYCE_BUY",
            description: `Venda Aprovada: "${description || "Mentoria Tecnica"}" registrada na vitrine por R$ ${value.toFixed(2)}. Saldo pendente atualizado.`,
            amountBRL: value,
          }
        });
      } catch (e) {
        console.warn("Failed creating DB audit log for sale:", e);
      }
    }

    res.json({
      message: "Venda aprovada com sucesso! O valor foi adicionado ao seu Saldo Pendente.",
      wallet: {
        balanceAvailableBRL: user.balanceAvailableBRL ?? 420.00,
        balancePendingBRL: newPending,
        totalEarnedBRL: newEarned,
        totalWithdrawnBRL: user.totalWithdrawnBRL ?? 0.00,
      }
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Falha ao processar venda aprovada." });
  }
});

// 3. Simular liberação de saldo pendente -> goes from saldo pendente to saldo disponível
app.post("/api/finance/release", authenticateToken, async (req: any, res: any) => {
  try {
    const { amount } = req.body;
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: "Valor de liberação inválido." });
    }

    const user = await authStore.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const currentPending = user.balancePendingBRL ?? 0;
    const currentAvailable = user.balanceAvailableBRL ?? 0;

    if (currentPending < value) {
      return res.status(400).json({ error: "Saldo pendente insuficiente para liberação deste valor." });
    }

    const newPending = Number((currentPending - value).toFixed(2));
    const newAvailable = Number((currentAvailable + value).toFixed(2));

    await authStore.updateUser(user.id!, {
      balanceAvailableBRL: newAvailable,
      balancePendingBRL: newPending,
    });

    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id!,
            action: "PIX_DEPOSIT",
            description: `Liberação de Saldo: Compensação de R$ ${value.toFixed(2)} liberados do saldo pendente para o saldo disponível.`,
            amountBRL: value,
          }
        });
      } catch (e) {}
    }

    res.json({
      message: "Saldo pendente liberado com sucesso! Os fundos já estão disponíveis para saque.",
      wallet: {
        balanceAvailableBRL: newAvailable,
        balancePendingBRL: newPending,
        totalEarnedBRL: user.totalEarnedBRL ?? 0.00,
        totalWithdrawnBRL: user.totalWithdrawnBRL ?? 0.00,
      }
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Falha ao liberar saldo pendente." });
  }
});

// =========================================================================
// PROFESSIONAL WITHDRAWAL SYSTEM WORKFLOWS & ADMIN CONTROLS (DUAL-ENGINE)
// =========================================================================

export interface WithdrawalRecord {
  id: string;
  walletId: string;
  userId: string;
  userEmail: string;
  userName: string;
  amountBRL: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  pixKey: string;
  pixKeyType: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalAuditRecord {
  id: string;
  withdrawalId: string;
  action: 'REQUEST' | 'BLOCKED_BALANCE' | 'ADMIN_APPROVE' | 'PIX_DISPATCHED' | 'ADMIN_REJECT' | 'RESTORED_BALANCE';
  actorId: string | null;
  actorName: string | null;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}

// In-memory dual-engine fallback tables
let inMemoryWithdrawals: WithdrawalRecord[] = [
  {
    id: "with_initial_pending_example_1",
    walletId: "wallet_athlete_1",
    userId: "user_athlete_test_1",
    userEmail: "usuario@jiuspeak.com",
    userName: "Fabio Gurgel Fan (USER)",
    amountBRL: 80.00,
    status: "PENDING",
    pixKey: "usuario@jiuspeak.com",
    pixKeyType: "Email",
    notes: "Aguardando verificação manual de fraudes.",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: "with_initial_completed_example_2",
    walletId: "wallet_athlete_1",
    userId: "user_athlete_test_1",
    userEmail: "usuario@jiuspeak.com",
    userName: "Fabio Gurgel Fan (USER)",
    amountBRL: 150.00,
    status: "COMPLETED",
    pixKey: "123.456.789-00",
    pixKeyType: "CPF",
    notes: "Aprovado por Mestre Carlos - PIX liquidado.",
    createdAt: new Date(Date.now() - 172800 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800 * 1000).toISOString()
  }
];

let inMemoryWithdrawalAudits: WithdrawalAuditRecord[] = [
  {
    id: "audit_w_1",
    withdrawalId: "with_initial_pending_example_1",
    action: "REQUEST",
    actorId: "user_athlete_test_1",
    actorName: "Fabio Gurgel Fan (USER)",
    details: "Solicitação de saque PIX de R$ 80.00 iniciada.",
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: "audit_w_2",
    withdrawalId: "with_initial_pending_example_1",
    action: "BLOCKED_BALANCE",
    actorId: "system",
    actorName: "Sistema Contábil",
    details: "R$ 80.00 subtraídos do saldo disponível e reservados em bloqueio antifraude.",
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: "audit_w_3",
    withdrawalId: "with_initial_completed_example_2",
    action: "REQUEST",
    actorId: "user_athlete_test_1",
    actorName: "Fabio Gurgel Fan (USER)",
    details: "Solicitação de saque PIX de R$ 150.00 iniciada.",
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 172800 * 1000).toISOString()
  },
  {
    id: "audit_w_4",
    withdrawalId: "with_initial_completed_example_2",
    action: "ADMIN_APPROVE",
    actorId: "user_admin_test_1",
    actorName: "Mestre Carlos (ADMIN)",
    details: "Saque aprovado em lote administrativo.",
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 172700 * 1000).toISOString()
  },
  {
    id: "audit_w_5",
    withdrawalId: "with_initial_completed_example_2",
    action: "PIX_DISPATCHED",
    actorId: "system",
    actorName: "Banco Inter Gateway",
    details: "Transferência eletrônica PIX despachada com sucesso. Comprovante #771239.",
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 172700 * 1000).toISOString()
  }
];

// Helper to push audit logs easily
const logWithdrawalAudit = async (withdrawalId: string, action: any, actorId: string | null, actorName: string | null, details: string, ipAddress?: string) => {
  const audit: WithdrawalAuditRecord = {
    id: `w_audit_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
    withdrawalId,
    action,
    actorId,
    actorName,
    details,
    ipAddress: ipAddress || "127.0.0.1",
    createdAt: new Date().toISOString()
  };
  inMemoryWithdrawalAudits.unshift(audit);

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.withdrawalAudit.create({
        data: {
          withdrawalId,
          action,
          actorId,
          actorName,
          details,
          ipAddress: ipAddress || "127.0.0.1"
        }
      }).catch((dbErr: any) => console.warn("Failed recording db WithdrawalAudit log:", dbErr));
    } catch (_) {}
  }
};

// 1. User Requests Withdrawal
app.post("/api/finance/withdraw", authenticateToken, async (req: any, res: any) => {
  try {
    const { amount, pixKey, keyType } = req.body;
    const value = parseFloat(amount);
    
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: "Valor de saque de comissões inválido." });
    }

    const user = await authStore.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const clientIp = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";

    // ---------------- ANTI-FRAUD VALIDATION 1: Minimum & Maximum boundaries ----------------
    const MIN_WITHDRAW = 10.00;
    const MAX_WITHDRAW = 5000.00;
    if (value < MIN_WITHDRAW) {
      return res.status(400).json({ error: `O valor mínimo para saques de comissão é de R$ ${MIN_WITHDRAW.toFixed(2)}.` });
    }
    if (value > MAX_WITHDRAW) {
      return res.status(400).json({ error: `O limite máximo por transação PIX individual é de R$ ${MAX_WITHDRAW.toFixed(2)} para sua segurança financeira.` });
    }

    // ---------------- ANTI-FRAUD VALIDATION 2: Check available balance ----------------
    const currentAvailable = user.balanceAvailableBRL ?? 0;
    if (currentAvailable < value) {
      return res.status(400).json({ 
        error: `Saldo disponível insuficiente! Seu saldo atual de livre movimentação é R$ ${currentAvailable.toFixed(2)}, mas você tentou sacar R$ ${value.toFixed(2)}.` 
      });
    }

    // ---------------- ANTI-FRAUD VALIDATION 3: Rate limit / Locked outstanding requests ----------------
    // Users can only have at most 1 pending/processing withdrawal request at a time to prevent duplicate clicks and state spamming.
    const allUserWithdrawals = inMemoryWithdrawals.filter(w => w.userId === user.id);
    
    // Attempt DB matching as well
    let hasDbPending = false;
    const prisma = getPrisma();
    if (prisma) {
      try {
        const dbPending = await prisma.withdrawal.findFirst({
          where: {
            wallet: { userId: user.id },
            status: "PENDING"
          }
        });
        if (dbPending) hasDbPending = true;
      } catch (_) {}
    }

    const inMemoryPending = allUserWithdrawals.some(w => w.status === "PENDING" || w.status === "PROCESSING");
    if (inMemoryPending || hasDbPending) {
      return res.status(422).json({ 
        error: "Bloqueio Antifraude: Já existe uma solicitação de saque em andamento para a sua conta. Aguarde aprovação ou cancelamento antes de emitir um novo saque." 
      });
    }

    // ---------------- ANTI-FRAUD VALIDATION 4: Daily Cumulative Limit (Max R$ 10.000,00 per 24 hours) ----------------
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const pastDayAmount = allUserWithdrawals
      .filter(w => new Date(w.createdAt).getTime() > oneDayAgo && w.status !== "REJECTED")
      .reduce((sum, w) => sum + w.amountBRL, 0);

    if (pastDayAmount + value > 10000.00) {
      return res.status(400).json({
        error: `Excesso de Limite Diário: Você já movimentou R$ ${pastDayAmount.toFixed(2)} nas últimas 24 horas. O sistema permite no máximo R$ 10.000,00 diários via PIX.`
      });
    }

    // ---------------- STEP A: BLOQUEIO DO SALDO (Available Balance lock) ----------------
    // Subtract immediately from available, but DO NOT increase total sacado yet (only on approval done).
    const newAvailable = Number((currentAvailable - value).toFixed(2));
    await authStore.updateUser(user.id!, {
      balanceAvailableBRL: newAvailable
    });

    const withdrawalId = `with_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const newWithdrawal: WithdrawalRecord = {
      id: withdrawalId,
      walletId: `wallet_${user.id}`,
      userId: user.id!,
      userEmail: user.email!,
      userName: user.name!,
      amountBRL: value,
      status: "PENDING",
      pixKey: pixKey || "chavePix",
      pixKeyType: keyType || "CPF",
      notes: "Aguardando homologação e conferência contra fraudes pelo Administrador.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    inMemoryWithdrawals.unshift(newWithdrawal);

    // ---------------- STEP B: DB PERSIST AND RELATION LINKING ----------------
    if (prisma) {
      try {
        let wallet = await prisma.wallet.findUnique({ where: { userId: user.id! } });
        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: {
              userId: user.id!,
              balanceKC: 0,
              balanceAvailable: newAvailable,
              balanceBRL: newAvailable,
              balancePending: user.balancePendingBRL ?? 0,
              totalEarned: user.totalEarnedBRL ?? 0,
              totalWithdrawn: user.totalWithdrawnBRL ?? 0
            }
          });
        } else {
          // Sync wallet balance
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { 
              balanceAvailable: newAvailable,
              balanceBRL: newAvailable
            }
          });
        }

        let bankAcc = await prisma.bankAccount.findFirst({ where: { userId: user.id! } });
        if (!bankAcc) {
          bankAcc = await prisma.bankAccount.create({
            data: {
              userId: user.id!,
              bankName: "Banco do Brasil (Simulado)",
              agency: "1234",
              accountNumber: "98765-4",
              accountType: "Corrente",
              pixKey: pixKey || "chavePix",
              pixKeyType: keyType || "CPF",
            }
          });
        }

        const dbWithdraw = await prisma.withdrawal.create({
          data: {
            id: withdrawalId, // Use the same unique ID for correlation
            walletId: wallet.id,
            bankAccountId: bankAcc.id,
            amountBRL: value,
            status: "PENDING",
            pixKey: pixKey || "chavePix",
            pixKeyType: keyType || "CPF",
            notes: "Aguardando liberação de auditoria de saques."
          }
        });

        await prisma.auditLog.create({
          data: {
            actorId: user.id!,
            action: "WITHDRAW_PROCESS",
            description: `Solicitação de Saque Iniciada: R$ ${value.toFixed(2)} retidos em análise (ID: ${withdrawalId}). Chave PIX: ${pixKey}.`,
            amountBRL: value,
          }
        });
      } catch (e) {
        console.warn("Prisma error persisting PENDING withdrawal, fallback used:", e);
      }
    }

    // ---------------- STEP C: RECORD DETAILED AUDIT STATEMENTS ----------------
    await logWithdrawalAudit(
      withdrawalId,
      "REQUEST",
      user.id!,
      user.name!,
      `Atleta solicitou resgate de R$ ${value.toFixed(2)} para a chave PIX (${keyType}: ${pixKey}).`,
      clientIp
    );

    await logWithdrawalAudit(
      withdrawalId,
      "BLOCKED_BALANCE",
      "system",
      "Sistema de Prevenção a Fraudes",
      `Controle Contábil: Saldo disponível reduzido de R$ ${currentAvailable.toFixed(2)} para R$ ${newAvailable.toFixed(2)} para proteção de resgate duplo.`,
      clientIp
    );

    res.json({
      message: `Saque de R$ ${value.toFixed(2)} registrado com sucesso! O valor foi bloqueado e nossa equipe administrativa irá revisar a transferência PIX.`,
      withdrawal: newWithdrawal,
      wallet: {
        balanceAvailableBRL: newAvailable,
        balancePendingBRL: user.balancePendingBRL ?? 0.00,
        totalEarnedBRL: user.totalEarnedBRL ?? 0.00,
        totalWithdrawnBRL: user.totalWithdrawnBRL ?? 0.00
      }
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Falha catastrófica ao processar solicitação de saque." });
  }
});

// 2. Admin fetches all withdrawal requests
app.get("/api/admin/withdrawals", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    let dbResults: any[] = [];
    if (prisma) {
      try {
        const withdraws = await prisma.withdrawal.findMany({
          include: {
            wallet: {
              include: { user: true }
            }
          },
          orderBy: { createdAt: "desc" }
        });
        dbResults = withdraws.map((w: any) => ({
          id: w.id,
          walletId: w.walletId,
          userId: w.wallet?.userId || "unknown",
          userEmail: w.wallet?.user?.email || "unknown@jiuspeak.com",
          userName: w.wallet?.user?.name || "Instrutor Associado",
          amountBRL: Number(w.amountBRL),
          status: w.status,
          pixKey: w.pixKey,
          pixKeyType: w.pixKeyType,
          notes: w.notes,
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString()
        }));
      } catch (dbErr) {
        console.warn("DB withdrawals listing fallback triggered:", dbErr);
      }
    }

    // Merge databases
    const mergedList = [...dbResults];
    for (const inMem of inMemoryWithdrawals) {
      if (!mergedList.some(m => m.id === inMem.id)) {
        mergedList.unshift(inMem);
      }
    }

    // Sort by Date Desc
    mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ withdrawals: mergedList });
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar faturamento de retiradas." });
  }
});

// 3. Admin review/approve audit trails
app.get("/api/admin/withdrawals/:id/audits", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const prisma = getPrisma();
    let dbAudits: any[] = [];

    if (prisma) {
      try {
        const dbList = await prisma.withdrawalAudit.findMany({
          where: { withdrawalId: id },
          orderBy: { createdAt: "asc" }
        });
        dbAudits = dbList.map((a: any) => ({
          id: a.id,
          withdrawalId: a.withdrawalId,
          action: a.action,
          actorId: a.actorId,
          actorName: a.actorName,
          details: a.details,
          ipAddress: a.ipAddress,
          createdAt: a.createdAt.toISOString()
        }));
      } catch (_) {}
    }

    const filteredInMemory = inMemoryWithdrawalAudits.filter(a => a.withdrawalId === id);
    const merged = [...dbAudits];
    for (const item of filteredInMemory) {
      if (!merged.some(m => m.id === item.id)) {
        merged.push(item);
      }
    }

    merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    res.json({ audits: merged });
  } catch (err) {
    res.status(500).json({ error: "Erro ao obter trilhas de auditoria do saque." });
  }
});

// 4. Admin Executes review decision (APPROVE or REJECT)
app.post("/api/admin/withdrawals/:id/review", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // e.g: APPROVE or REJECT
    const administrator = req.user;

    if (action !== "APPROVE" && action !== "REJECT") {
      return res.status(400).json({ error: "Decisão administrativa inválida. Escolha APPROVE ou REJECT." });
    }

    // Look in memory fallback table first
    const memoryIdx = inMemoryWithdrawals.findIndex(w => w.id === id);
    let targetUserId = "";
    let walletId = "";
    let amountBRL = 0;
    let pixKey = "";
    let pixKeyType = "";
    let currentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' = "PENDING";

    if (memoryIdx !== -1) {
      targetUserId = inMemoryWithdrawals[memoryIdx].userId;
      amountBRL = inMemoryWithdrawals[memoryIdx].amountBRL;
      walletId = inMemoryWithdrawals[memoryIdx].walletId;
      pixKey = inMemoryWithdrawals[memoryIdx].pixKey;
      pixKeyType = inMemoryWithdrawals[memoryIdx].pixKeyType;
      currentStatus = inMemoryWithdrawals[memoryIdx].status;
    }

    // Try DB load
    const prisma = getPrisma();
    if (prisma) {
      try {
        const dbW = await prisma.withdrawal.findUnique({
          where: { id },
          include: { wallet: true }
        });
        if (dbW) {
          targetUserId = dbW.wallet.userId;
          amountBRL = Number(dbW.amountBRL);
          walletId = dbW.walletId;
          pixKey = dbW.pixKey;
          pixKeyType = dbW.pixKeyType;
          currentStatus = dbW.status as any;
        }
      } catch (_) {}
    }

    if (!targetUserId) {
      return res.status(404).json({ error: "Solicitação de saque de comissão não localizada nos arquivos ativos." });
    }

    // ---------------- IDEMPOTENCY CHECK (Prevents duplicate triggers/double approval) ----------------
    if (currentStatus !== "PENDING" && currentStatus !== "PROCESSING") {
      return res.status(409).json({ 
        error: `Conflito de Estado: Este saque já foi avaliado anteriormente com status "${currentStatus}". Nenhuma ação foi processada.` 
      });
    }

    const reviewStatus = action === "APPROVE" ? "COMPLETED" : "REJECTED";
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";

    const applicant = await authStore.findById(targetUserId);
    if (!applicant) {
      return res.status(404).json({ error: "Beneficiário do saque não localizado." });
    }

    let nextAvailable = applicant.balanceAvailableBRL ?? 0;
    let nextWithdrawn = applicant.totalWithdrawnBRL ?? 0;

    if (action === "APPROVE") {
      // ---------------- CASE: ADMIN APPROVES -> PIX IS DISPATCHED ----------------
      // Increment total withdrawn. Available balance was already subtracted during initial request (lock state).
      nextWithdrawn = Number((nextWithdrawn + amountBRL).toFixed(2));
      await authStore.updateUser(targetUserId, {
        totalWithdrawnBRL: nextWithdrawn
      });

      // Update Database wallet totals
      if (prisma) {
        try {
          await prisma.wallet.update({
            where: { userId: targetUserId },
            data: { totalWithdrawn: nextWithdrawn }
          });
        } catch (_) {}
      }

      await logWithdrawalAudit(
        id,
        "ADMIN_APPROVE",
        administrator.id,
        administrator.name,
        `Administrador analisou as dependências de faturamento e aprovou o saque manualmente. Comentários: ${notes || "Sem observações."}`,
        clientIp
      );

      await logWithdrawalAudit(
        id,
        "PIX_DISPATCHED",
        "system",
        "Banco Central PIX Gateway",
        `Transferência Bancária Concluída: R$ ${amountBRL.toFixed(2)} creditados em tempo de execução via gateway para a chave judicial ${pixKey}. Sincronização OK.`,
        clientIp
      );

      // Save system-wide Audit Log
      if (prisma) {
        try {
          await prisma.auditLog.create({
            data: {
              actorId: administrator.id,
              action: "WITHDRAW_PROCESS",
              description: `Saque Manual Aprovado: Administrador ${administrator.name} liberou R$ ${amountBRL.toFixed(2)} para ${applicant.name}. PIX enviado.`,
              amountBRL: amountBRL
            }
          }).catch(() => {});
        } catch (_) {}
      }

    } else {
      // ---------------- CASE: ADMIN REJECTS -> BALANCE IS UNLOCKED & REFUNDED ----------------
      // Restore the blocked amount back to the candidate's balanceAvailableBRL.
      nextAvailable = Number((nextAvailable + amountBRL).toFixed(2));
      await authStore.updateUser(targetUserId, {
        balanceAvailableBRL: nextAvailable
      });

      if (prisma) {
        try {
          await prisma.wallet.update({
            where: { userId: targetUserId },
            data: { 
              balanceAvailable: nextAvailable,
              balanceBRL: nextAvailable
            }
          });
        } catch (_) {}
      }

      await logWithdrawalAudit(
        id,
        "ADMIN_REJECT",
        administrator.id,
        administrator.name,
        `Retirada RECUSADA pelo Administrador. Motivo alegado: ${notes || "Documentação ou chave sob suspeita de inconsistência física."}`,
        clientIp
      );

      await logWithdrawalAudit(
        id,
        "RESTORED_BALANCE",
        "system",
        "Estorno Contábil Automático",
        `Garantia Antifraude: O valor retido de R$ ${amountBRL.toFixed(2)} foi restituído integralmente ao Saldo Disponível de ${applicant.name}.`,
        clientIp
      );

      if (prisma) {
        try {
          await prisma.auditLog.create({
            data: {
              actorId: administrator.id,
              action: "WITHDRAW_PROCESS",
              description: `Saque Rejeitado e Estornado: R$ ${amountBRL.toFixed(2)} devolvidos à carteira de ${applicant.name}. Motivo: ${notes || "não especificado."}`,
              amountBRL: amountBRL
            }
          }).catch(() => {});
        } catch (_) {}
      }
    }

    // Sync Memory structure
    if (memoryIdx !== -1) {
      inMemoryWithdrawals[memoryIdx].status = reviewStatus;
      inMemoryWithdrawals[memoryIdx].notes = notes || null;
      inMemoryWithdrawals[memoryIdx].updatedAt = new Date().toISOString();
    }

    // Sync Database structure
    if (prisma) {
      try {
        await prisma.withdrawal.update({
          where: { id },
          data: {
            status: reviewStatus,
            notes: notes || `Análise pelo Administrador finalizada: ${action === 'APPROVE' ? 'Aprovado' : 'Rejeitado e Estornado'}`
          }
        });
      } catch (dbErr) {
        console.warn("Prisma error committing withdrawal review status:", dbErr);
      }
    }

    res.json({
      success: true,
      message: `A solicitação de saque de R$ ${amountBRL.toFixed(2)} foi ${action === "APPROVE" ? "aprovada e liberada via PIX" : "recusada e estornada"} com sucesso.`,
      status: reviewStatus,
      wallet: {
        userId: targetUserId,
        balanceAvailableBRL: nextAvailable,
        totalWithdrawnBRL: nextWithdrawn
      }
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro interno ao processar julgamento administrativo de saque." });
  }
});

// =========================================================================
// SAAS SUBSCRIPTION CORE SERVICES & ENDPOINTS
// =========================================================================

export interface InMemoryPlan {
  id: string;
  name: string;
  description: string;
  priceBRL: number;
  interval: string;
  features: string[];
  active: boolean;
}

export interface InMemorySubscription {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  startDate: string;
  endDate: string;
  canceledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  autoRenew: boolean;
}

export interface InMemorySubscriptionPayment {
  id: string;
  subscriptionId: string;
  amountBRL: number;
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "REFUNDED";
  txid: string;
  qrCode: string;
  qrCodeCopyPaste: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export let inMemoryPlans: InMemoryPlan[] = [
  {
    id: "plan-free-id",
    name: "FREE",
    description: "Acesso a conteúdos básicos de Jiu-Jitsu, fórum comum e testes elementares.",
    priceBRL: 0.00,
    interval: "monthly",
    features: ["Acesso a conteúdos básicos", "Fórum comum de Jiu-Jitsu", "Perfil de atleta básico"],
    active: true
  },
  {
    id: "plan-pro-id",
    name: "PRO",
    description: "Para atletas dedicados! Tenha acesso completo a lições avançadas, geradores inteligentes de treinos e ferramentas completas de carteira.",
    priceBRL: 29.90,
    interval: "monthly",
    features: ["Todas as lições completas", "Gerador Inteligente de Treinos (Gemini AI)", "Histórico financeiro profissional", "Suporte prioritário via tatame", "Selo Pro de destaque"],
    active: true
  },
  {
    id: "plan-master-id",
    name: "MASTER",
    description: "O nível definitivo do Mestre! Tenha todas as vantagens do PRO e libere a Arena PvP inteligente de perguntas sem limites, simulações ilimitadas e cosméticos raros.",
    priceBRL: 59.90,
    interval: "monthly",
    features: ["Tudo incluído do plano PRO", "Arena PvP ilimitada 🥋", "Simulador ilimitado de Pix", "Insígnias lendárias personalizadas", "Relatório de desempenho em tempo-real"],
    active: true
  }
];

export let inMemorySubscriptions: InMemorySubscription[] = [];
export let inMemorySubscriptionPayments: InMemorySubscriptionPayment[] = [];

export async function getActiveSubscriptionForUser(userId: string) {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const sub = await prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE"
        },
        include: {
          plan: true
        },
        orderBy: {
          endDate: "desc"
        }
      });
      if (sub) {
        return {
          type: sub.plan.name as any, // FREE, PRO, MASTER
          expiresAt: sub.endDate.toISOString(),
          priceBRL: Number(sub.plan.priceBRL),
          autoRenew: sub.canceledAt === null
        };
      }
    } catch (err) {
      console.warn("Error getting active DB subscription:", err);
    }
  }

  // Default to FREE with no expiry (Strict Database Engine)
  return {
    type: "FREE" as const,
    priceBRL: 0,
    autoRenew: false
  };
}

export async function seedPlansInDb() {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    const count = await prisma.plan.count();
    if (count > 0) return;

    await prisma.plan.create({
      data: {
        id: "plan-free-id",
        name: "FREE",
        description: "Acesso a conteúdos básicos de Jiu-Jitsu, fórum comum e testes elementares.",
        priceBRL: 0.00,
        interval: "monthly",
        features: ["Acesso a conteúdos básicos", "Fórum comum", "Perfil básico de jiu-jitsu"],
        active: true
      }
    });

    await prisma.plan.create({
      data: {
        id: "plan-pro-id",
        name: "PRO",
        description: "Acesso completo a lições avançadas, geradores inteligentes de treinos e carteira.",
        priceBRL: 29.90,
        interval: "monthly",
        features: ["Todas as lições completas", "Gerador Inteligente de Treinos (Gemini AI)", "Histórico financeiro profissional", "Suporte prioritário via tatame", "Selo Pro de destaque"],
        active: true
      }
    });

    await prisma.plan.create({
      data: {
        id: "plan-master-id",
        name: "MASTER",
        description: "Todas as vantagens do PRO, Arena PvP sem limites e simuladores avançados.",
        priceBRL: 59.90,
        interval: "monthly",
        features: ["Tudo incluído do plano PRO", "Arena PvP ilimitada 🥋", "Simulador ilimitado de Pix", "Insígnias lendárias personalizadas", "Relatório de desempenho em tempo-real"],
        active: true
      }
    });

    console.log("🌱 Database seeding of SaaS Plans completed.");
  } catch (err) {
    console.error("Error seeding plans:", err);
  }
}

// 1. GET ALL PLANS
app.get("/api/subscriptions/plans", async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const plans = await prisma.plan.findMany({ where: { active: true } });
    const mapped = plans.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceBRL: Number(p.priceBRL),
      interval: p.interval,
      features: p.features,
      active: p.active
    }));
    res.json({ plans: mapped });
  } catch (error) {
    console.error("Critical database error in subscriptions plans endpoint:", error);
    res.status(500).json({ error: "Erro ao carregar os planos disponíveis." });
  }
});

// 2. GET CURRENT SUBSCRIPTION
app.get("/api/subscriptions/current", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const prisma = getPrisma();
    
    if (prisma) {
      try {
        const subs = await prisma.subscription.findMany({
          where: { userId },
          include: { plan: true, payments: true },
          orderBy: { createdAt: "desc" }
        });
        if (subs.length > 0) {
          const current = subs[0];
          return res.json({
            subscription: {
              id: current.id,
              userId: current.userId,
              planId: current.planId,
              planName: current.plan.name,
              status: current.status,
              startDate: current.startDate.toISOString(),
              endDate: current.endDate.toISOString(),
              canceledAt: current.canceledAt ? current.canceledAt.toISOString() : null,
              autoRenew: current.canceledAt === null
            },
            payments: current.payments.map(p => ({
              id: p.id,
              subscriptionId: p.subscriptionId,
              amountBRL: Number(p.amountBRL),
              status: p.status,
              txid: p.txid,
              qrCode: p.qrCode,
              paidAt: p.paidAt ? p.paidAt.toISOString() : null,
              createdAt: p.createdAt.toISOString()
            }))
          });
        }
      } catch (err) {
        console.error("Critical database error in user subscription retrieval:", err);
      }
    }

    res.json({ subscription: null, payments: [] });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter detalhes da assinatura ativa." });
  }
});

// 3. CHECKOUT SUBSCRIPTION OR DEVIATE/SWITCH
app.post("/api/subscriptions/checkout", authenticateToken, async (req: any, res: any) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    if (!planId) return res.status(400).json({ error: "Necessário informar o plano pretendido." });

    let targetPlan: any = null;
    const prisma = getPrisma();

    if (prisma) {
      try {
        targetPlan = await prisma.plan.findUnique({ where: { id: planId } });
      } catch (err) {
        console.warn("Plan parsing DB err:", err);
      }
    }

    if (!targetPlan) {
      targetPlan = inMemoryPlans.find(p => p.id === planId);
    }
    if (!targetPlan) return res.status(404).json({ error: "Plano solicitado não existe no sistema." });

    const price = Number(targetPlan.priceBRL);

    // If FREE plan, activate immediately
    if (price === 0.0) {
      if (prisma) {
        try {
          // Cancel active ones
          await prisma.subscription.updateMany({
            where: { userId, status: "ACTIVE" },
            data: { status: "CANCELED", canceledAt: new Date() }
          });
          // Create new FREE subscription
          const freeSub = await prisma.subscription.create({
            data: {
              userId,
              planId: targetPlan.id,
              status: "ACTIVE",
              startDate: new Date(),
              endDate: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000) // 10 years for Free
            }
          });
          // Log payment
          await prisma.subscriptionPayment.create({
            data: {
              subscriptionId: freeSub.id,
              amountBRL: 0.0,
              status: "COMPLETED",
              paidAt: new Date()
            }
          });
          return res.json({ activated: true, message: "Plano grátis (FREE) ativado!" });
        } catch (dbErr) {
          console.warn("DB free sub error:", dbErr);
        }
      }

      // Memory free activation
      inMemorySubscriptions = inMemorySubscriptions.map(s => s.userId === userId && s.status === "ACTIVE" ? { ...s, status: "CANCELED", canceledAt: new Date().toISOString() } : s);
      const subId = "sub_" + Math.random().toString(36).substring(2, 10);
      inMemorySubscriptions.push({
        id: subId,
        userId,
        planId: targetPlan.id,
        status: "ACTIVE",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
        canceledAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoRenew: true
      });
      inMemorySubscriptionPayments.push({
        id: "sp_" + Math.random().toString(36).substring(2, 10),
        subscriptionId: subId,
        amountBRL: 0,
        status: "COMPLETED",
        txid: "free_" + Date.now(),
        qrCode: "free",
        qrCodeCopyPaste: "free",
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return res.json({ activated: true, message: "Plano grátis (FREE) ativado!" });
    }

    // Generate random Pix specs for paid plans
    const txid = "tx_sub_" + Math.random().toString(36).substring(2, 10) + Date.now();
    const qrText = `00020126580014BR.GOV.BCB.PIX0136e0886bd6-8aab-4bef-811c-a1c2293816jiuspeakqrcodepixprod52040000530398654054${price.toFixed(2)}5802BR5925JiuSpeak%20Saas%20Gamificado6009SAO%20PAULO62070503***6304ED24`;
    
    let subId = "sub_" + Math.random().toString(36).substring(2, 10);
    let paymentId = "sp_" + Math.random().toString(36).substring(2, 10);

    if (prisma) {
      try {
        const dbSub = await prisma.subscription.create({
          data: {
            id: subId,
            userId,
            planId: targetPlan.id,
            status: "PAST_DUE",
            startDate: new Date(),
            endDate: new Date()
          }
        });
        const payment = await prisma.subscriptionPayment.create({
          data: {
            id: paymentId,
            subscriptionId: dbSub.id,
            amountBRL: price,
            status: "PENDING",
            txid,
            qrCode: qrText,
            qrCodeCopyPaste: qrText
          }
        });
        return res.json({
          activated: false,
          subscriptionId: dbSub.id,
          paymentId: payment.id,
          txid,
          qrCode: qrText,
          qrCodeCopyPaste: qrText,
          amountBRL: price,
          planName: targetPlan.name
        });
      } catch (dbErr) {
        console.warn("DB paid checkout error, fallback:", dbErr);
      }
    }

    // Fallback in memory setup
    inMemorySubscriptions.push({
      id: subId,
      userId,
      planId: targetPlan.id,
      status: "PAST_DUE",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      canceledAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoRenew: true
    });

    inMemorySubscriptionPayments.push({
      id: paymentId,
      subscriptionId: subId,
      amountBRL: price,
      status: "PENDING",
      txid,
      qrCode: qrText,
      qrCodeCopyPaste: qrText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      activated: false,
      subscriptionId: subId,
      paymentId,
      txid,
      qrCode: qrText,
      qrCodeCopyPaste: qrText,
      amountBRL: price,
      planName: targetPlan.name
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao iniciar o checkout da assinatura." });
  }
});

// 4. APPROVE/PAY FOR A SUBSCRIPTION (SIMULATING PAYMENT SETTLEMENT)
app.post("/api/subscriptions/pay", authenticateToken, async (req: any, res: any) => {
  try {
    const { paymentId, txid } = req.body;
    const userId = req.user.id;
    const prisma = getPrisma();

    if (prisma) {
      try {
        let payment = await prisma.subscriptionPayment.findFirst({
          where: {
            OR: [
              { id: paymentId },
              { txid }
            ]
          },
          include: { subscription: true }
        });

        if (payment) {
          if (payment.status === "COMPLETED") {
            return res.json({ success: true, message: "Pagamento já foi processado anteriormente." });
          }

          // Deactivate prior subscriptions
          await prisma.subscription.updateMany({
            where: { userId, status: "ACTIVE" },
            data: { status: "CANCELED", canceledAt: new Date() }
          });

          // Confirm active
          await prisma.subscriptionPayment.update({
            where: { id: payment.id },
            data: { status: "COMPLETED", paidAt: new Date() }
          });

          const sub = await prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: {
              status: "ACTIVE",
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            include: { plan: true }
          });

          // Audit log
          await prisma.auditLog.create({
            data: {
              actorId: userId,
              action: "PIX_DEPOSIT",
              description: `Assinatura de SaaS: Pagamento do plano "${sub.plan.name}" compensado. Assinatura ativa!`,
              amountBRL: payment.amountBRL
            }
          });

          return res.json({
            success: true,
            message: `Pagamento recebido! Obrigado por assinar o JiuSpeak ${sub.plan.name}!`,
            activeSubscription: {
              type: sub.plan.name,
              expiresAt: sub.endDate.toISOString(),
              priceBRL: Number(sub.plan.priceBRL),
              autoRenew: true
            }
          });
        }
      } catch (err) {
        console.warn("DB pay simulation error:", err);
      }
    }

    // Memory fallback find
    const memPayment = inMemorySubscriptionPayments.find(p => p.id === paymentId || p.txid === txid);
    if (memPayment) {
      if (memPayment.status === "COMPLETED") {
        return res.json({ success: true, message: "Pagamento já foi processado anteriormente." });
      }

      memPayment.status = "COMPLETED";
      memPayment.paidAt = new Date().toISOString();

      // Deactivate other sub
      inMemorySubscriptions = inMemorySubscriptions.map(s => s.userId === userId && s.status === "ACTIVE" ? { ...s, status: "CANCELED", canceledAt: new Date().toISOString() } : s);

      // Active
      const linkedSub = inMemorySubscriptions.find(s => s.id === memPayment.subscriptionId);
      if (linkedSub) {
        linkedSub.status = "ACTIVE";
        linkedSub.startDate = new Date().toISOString();
        linkedSub.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        linkedSub.autoRenew = true;

        const plan = inMemoryPlans.find(p => p.id === linkedSub.planId);
        
        return res.json({
          success: true,
          message: `Pagamento recebido! Obrigado por assinar o JiuSpeak ${plan ? plan.name : "Premium"}!`,
          activeSubscription: {
            type: plan ? plan.name : "PRO",
            expiresAt: linkedSub.endDate,
            priceBRL: plan ? Number(plan.priceBRL) : 29.9,
            autoRenew: true
          }
        });
      }
    }

    res.status(404).json({ error: "Ordem de pagamento de assinatura não encontrada." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar processamento lógico do PIX." });
  }
});

// 5. CANCEL SUBSCRIPTION (STOP AUTORENEW)
app.post("/api/subscriptions/cancel", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const prisma = getPrisma();

    if (prisma) {
      try {
        const sub = await prisma.subscription.findFirst({
          where: { userId, status: "ACTIVE" }
        });
        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { canceledAt: new Date() }
          });
          return res.json({
            success: true,
            message: "Sua renovação automática de comissão SaaS foi suspensa. Você manterá os privilégios até o vencimento da fatura."
          });
        }
      } catch (err) {
        console.warn("DB sub cancel error:", err);
      }
    }

    const sub = inMemorySubscriptions.find(s => s.userId === userId && s.status === "ACTIVE");
    if (sub) {
      sub.autoRenew = false;
      sub.canceledAt = new Date().toISOString();
      return res.json({
        success: true,
        message: "Sua renovação de comissão SaaS foi cancelada com sucesso na memória."
      });
    }

    res.status(404).json({ error: "Você não possui nenhuma assinatura ativa a ser cancelada." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao solicitar cancelamento da assinatura." });
  }
});

// 6. SIMULATE BACKGROUND CRON JOB (RENEWALS AND AUTOMATE EXPIRATION HANDLERS)
app.post("/api/subscriptions/simulate-cron", async (req: any, res: any) => {
  try {
    const logs: string[] = [];
    const now = new Date();
    const prisma = getPrisma();

    if (prisma) {
      try {
        const expiredSubs = await prisma.subscription.findMany({
          where: {
            status: "ACTIVE",
            endDate: { lt: now }
          },
          include: {
            plan: true,
            user: { include: { wallet: true } }
          }
        });

        logs.push(`🔍 Encontradas ${expiredSubs.length} assinaturas com data de faturamento vencida na base SQL.`);

        for (const sub of expiredSubs) {
          const userWallet = sub.user.wallet;
          const userBalance = userWallet ? Number(userWallet.balanceAvailable) : 0;
          const planCost = Number(sub.plan.priceBRL);

          const isAutoRenew = sub.canceledAt === null;

          if (isAutoRenew) {
            if (userWallet && userBalance >= planCost) {
              const nextAvailable = userBalance - planCost;
              await prisma.wallet.update({
                where: { id: userWallet.id },
                data: { balanceAvailable: nextAvailable }
              });

              const newEndDate = new Date(sub.endDate.getTime() + 30 * 24 * 60 * 60 * 1000);
              await prisma.subscription.update({
                where: { id: sub.id },
                data: { endDate: newEndDate }
              });

              await prisma.subscriptionPayment.create({
                data: {
                  subscriptionId: sub.id,
                  amountBRL: planCost,
                  status: "COMPLETED",
                  paidAt: new Date()
                }
              });

              await prisma.auditLog.create({
                data: {
                  actorId: sub.userId,
                  action: "PIX_DEPOSIT",
                  description: `Renovação Automática: Cobrança recorrente de R$ ${planCost.toFixed(2)} debitada do saldo para o plano "${sub.plan.name}". Assinatura prorrogada por mais 30 dias.`
                }
              });

              logs.push(`🔄 RENOVAÇÃO AUTOMÁTICA COMPENSADA: Usuário "${sub.user.name}" (${sub.user.email}) teve o plano "${sub.plan.name}" renovado por débito em saldo.`);
            } else {
              await prisma.subscription.update({
                where: { id: sub.id },
                data: { status: "EXPIRED" }
              });
              logs.push(`⚠️ FALHA NA RENOVAÇÃO (Saldo de R$ ${userBalance.toFixed(2)} insuficiente para cobrir R$ ${planCost.toFixed(2)}): Assinatura do usuário "${sub.user.name}" foi alterada para EXPIRADA.`);
            }
          } else {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: "EXPIRED" }
            });
            logs.push(`⌛ EXPIRAÇÃO AMIGÁVEL: Assinatura do usuário "${sub.user.name}" encerrou o ciclo regular e foi desativada amigavelmente.`);
          }
        }
      } catch (dbErr) {
        console.warn("DB Cron simulation error:", dbErr);
        logs.push(`⚠️ Erro na auditoria SQL de Cron, processando memória...`);
      }
    }

    const memExpiredSubs = inMemorySubscriptions.filter(s => s.status === "ACTIVE" && new Date(s.endDate) < now);
    logs.push(`🔍 Encontradas ${memExpiredSubs.length} assinaturas vencidas na memória de fallback.`);

    for (const sub of memExpiredSubs) {
      const plan = inMemoryPlans.find(p => p.id === sub.planId);
      const planCost = plan ? Number(plan.priceBRL) : 0;
      const userCache = inMemoryUsers.get(sub.userId);
      const userBalance = userCache?.balanceAvailableBRL || 0;

      if (sub.autoRenew) {
        if (userCache && userBalance >= planCost) {
          userCache.balanceAvailableBRL = userBalance - planCost;
          sub.endDate = new Date(new Date(sub.endDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
          
          logs.push(`🔄 RENOVAÇÃO MEMÓRIA OK: Integrado debito de R$ ${planCost.toFixed(2)} para usuário id ${sub.userId}.`);
        } else {
          sub.status = "EXPIRED";
          logs.push(`⚠️ FALHA RENOVAÇÃO MEMÓRIA (Saldo de R$ ${userBalance.toFixed(2)} insuficiente): Assinatura expirada.`);
        }
      } else {
        sub.status = "EXPIRED";
        logs.push(`⌛ EXPIRAÇÃO MEMÓRIA AMIGÁVEL: Assinatura expirada conforme solicitação prévia.`);
      }
    }

    res.json({
      success: true,
      timestamp: now.toISOString(),
      logs
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao executar cron de faturamento recorrente." });
  }
});

// =========================================================================
// PROFESSIONAL PIX PAYMENT GATEWAYS & WEBHOOK ENDPOINTS
// =========================================================================

// In-memory fallback tracking for seamless preview operations if db table query fails or is empty
let inMemoryPixPayments: any[] = [];

// 1. GET all PIX payments for the user
app.get("/api/finance/pix", authenticateToken, async (req: any, res: any) => {
  try {
    const user = await authStore.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const prisma = getPrisma();
    if (prisma) {
      try {
        const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
        if (wallet) {
          const payments = await prisma.pixPayment.findMany({
            where: {
              transaction: {
                walletId: wallet.id
              }
            },
            include: {
              transaction: true
            },
            orderBy: {
              createdAt: "desc"
            }
          });

          // Map from Prisma structure to standard API response
          const dbResults = payments.map((p: any) => ({
            id: p.id,
            txid: p.txid,
            amountBRL: Number(p.amountBRL),
            status: p.status, // e.g. PENDING, COMPLETED, EXPIRED
            qrCode: p.qrCode,
            qrCodeCopyPaste: p.qrCodeCopyPaste,
            createdAt: p.createdAt,
            expiresAt: p.expiresAt,
            paidAt: p.paidAt,
            type: p.transaction?.type || "DEPOSIT",
            description: p.transaction?.description || "Depósito via PIX"
          }));

          // Merge any in-memory simulations for this user just in case
          const userInMemory = inMemoryPixPayments.filter(p => p.userId === user.id);
          const merged = [...dbResults];
          for (const item of userInMemory) {
            if (!merged.some(m => m.txid === item.txid)) {
              merged.unshift(item);
            }
          }
          return res.json({ payments: merged });
        }
      } catch (dbErr) {
        console.warn("DB Pix query fallback:", dbErr);
      }
    }

    // Fallback to in-memory only
    const userInMemory = inMemoryPixPayments.filter(p => p.userId === user.id);
    res.json({ payments: userInMemory });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter pagamentos PIX." });
  }
});

// 2. CREATE a new PIX payment
app.post("/api/finance/pix", authenticateToken, async (req: any, res: any) => {
  try {
    const { amount, type, description } = req.body;
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: "Valor de pagamento PIX inválido." });
    }

    const paymentType = type === "MARKETPLACE_SELL" ? "MARKETPLACE_SELL" : "DEPOSIT";

    const user = await authStore.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

    const txid = `TXIDPIX${Math.random().toString(36).substring(2, 11).toUpperCase()}${Date.now().toString().slice(-4)}`;
    const qrCodeMock = `00020101021226830014br.gov.bcb.pix2561api.jiuspeak.com/pix/v2/${txid}5204000053039865405${value.toFixed(2).replace('.', '')}5802BR5915JiuSpeak%20SaaS6009Sao%2520Paulo62070503${txid.slice(0, 10)}6304`;
    const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeMock)}`;

    const responsePayload = {
      txid,
      amountBRL: value,
      status: "PENDING",
      qrCode: qrCodeBase64,
      qrCodeCopyPaste: qrCodeMock,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      paidAt: null,
      type: paymentType,
      description: description || (paymentType === "MARKETPLACE_SELL" ? "Venda de Curso BJJ" : "Recarga de Saldo via PIX")
    };

    // Store in-memory as safety fallback
    inMemoryPixPayments.unshift({ ...responsePayload, userId: user.id });

    // Persist to Database if available
    const prisma = getPrisma();
    if (prisma) {
      try {
        let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: {
              userId: user.id,
              balanceKC: 0,
              balanceAvailable: user.balanceAvailableBRL || 0,
              balanceBRL: user.balanceAvailableBRL || 0,
              balancePending: user.balancePendingBRL || 0,
              totalEarned: user.totalEarnedBRL || 0,
              totalWithdrawn: user.totalWithdrawnBRL || 0
            }
          });
        }

        const trans = await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            amountBRL: value,
            type: paymentType === "MARKETPLACE_SELL" ? "MARKETPLACE_SELL" : "DEPOSIT",
            status: "PENDING",
            description: responsePayload.description,
            referenceId: txid
          }
        });

        await prisma.pixPayment.create({
          data: {
            transactionId: trans.id,
            qrCode: responsePayload.qrCode,
            qrCodeCopyPaste: responsePayload.qrCodeCopyPaste,
            txid: txid,
            amountBRL: value,
            status: "PENDING",
            expiresAt: new Date(responsePayload.expiresAt)
          }
        });

        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: paymentType === "MARKETPLACE_SELL" ? "MARKETPLAYCE_LIST" : "PIX_DEPOSIT",
            description: `PIX Emitido: Cobrança de R$ ${value.toFixed(2)} gerada com status PENDENTE (IDTransação: ${trans.id}). Aguardando confirmação.`,
            amountBRL: value
          }
        });
      } catch (dbErr) {
        console.warn("Could not save new PIX record in Database:", dbErr);
      }
    }

    res.json({
      message: "Cobrança profissional PIX gerada com sucesso!",
      payment: responsePayload
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Falha ao gerar cobrança PIX." });
  }
});

// 3. PIX WEBHOOK Simulation
app.post("/api/finance/pix-webhook", async (req: any, res: any) => {
  try {
    const { txid, status } = req.body;
    if (!txid) {
      return res.status(400).json({ error: "O parâmetro txid é obrigatório para identificação." });
    }

    if (status !== "approved") {
      // Just flag as expired/refused in memory
      const idx = inMemoryPixPayments.findIndex(p => p.txid === txid);
      if (idx !== -1) {
        inMemoryPixPayments[idx].status = "EXPIRED";
      }

      const prisma = getPrisma();
      if (prisma) {
        try {
          const pp = await prisma.pixPayment.findUnique({ where: { txid } });
          if (pp) {
            await prisma.pixPayment.update({
              where: { txid },
              data: { status: "EXPIRED" }
            });
            await prisma.transaction.update({
              where: { id: pp.transactionId },
              data: { status: "FAILED" }
            });
          }
        } catch (dbErr) {}
      }

      return res.json({ message: "Webhook recebido: Pagamento PIX marcado como cancelado/expirado." });
    }

    // Step A. Query/update in memory
    const inMemIdx = inMemoryPixPayments.findIndex(p => p.txid === txid);
    let mockUserObj: any = null;
    let paymentAmount = 0;
    let paymentType = "DEPOSIT";

    if (inMemIdx !== -1) {
      if (inMemoryPixPayments[inMemIdx].status === "COMPLETED") {
        return res.json({ message: "Aviso: Este pagamento PIX já havia sido processado e creditado anteriormente (Idempotência)." });
      }
      inMemoryPixPayments[inMemIdx].status = "COMPLETED";
      inMemoryPixPayments[inMemIdx].paidAt = new Date().toISOString();
      paymentAmount = inMemoryPixPayments[inMemIdx].amountBRL;
      paymentType = inMemoryPixPayments[inMemIdx].type;
      mockUserObj = await authStore.findById(inMemoryPixPayments[inMemIdx].userId);
    }

    let isDbProcessed = false;

    // Step B. Query/update Database
    const prisma = getPrisma();
    if (prisma) {
      try {
        const pixPayment = await prisma.pixPayment.findUnique({
          where: { txid },
          include: { transaction: { include: { wallet: true } } }
        });

        if (pixPayment) {
          paymentAmount = Number(pixPayment.amountBRL);
          paymentType = pixPayment.transaction.type;
          const userWallet = pixPayment.transaction.wallet;
          const userId = userWallet.userId;

          if (pixPayment.status === "COMPLETED") {
            return res.json({ message: "Aviso: Este pagamento PIX já se encontra liquidado no Banco de Dados (Idempotência)." });
          }

          // DB execution under confirmation check:
          // Update PixPayment status to COMPLETED
          await prisma.pixPayment.update({
            where: { id: pixPayment.id },
            data: { 
              status: "COMPLETED",
              paidAt: new Date()
            }
          });

          // Update Transaction status to COMPLETED
          await prisma.transaction.update({
            where: { id: pixPayment.transactionId },
            data: { status: "COMPLETED" }
          });

          // Fetch the current user profile state
          const u = await authStore.findById(userId);
          if (u) {
            let nextAvailable = u.balanceAvailableBRL ?? 0;
            let nextPending = u.balancePendingBRL ?? 0;
            let nextEarned = u.totalEarnedBRL ?? 0;

            if (paymentType === "MARKETPLACE_SELL") {
              const prevPending = Number(userWallet.balancePending);
              const prevEarned = Number(userWallet.totalEarned);
              
              nextPending = Number((prevPending + paymentAmount).toFixed(2));
              nextEarned = Number((prevEarned + paymentAmount).toFixed(2));

              // Never calculate balance dynamically by query! Increment column values directly!
              await prisma.wallet.update({
                where: { id: userWallet.id },
                data: {
                  balancePending: nextPending,
                  totalEarned: nextEarned
                }
              });
            } else {
              const prevAvailable = Number(userWallet.balanceAvailable);
              nextAvailable = Number((prevAvailable + paymentAmount).toFixed(2));

              await prisma.wallet.update({
                where: { id: userWallet.id },
                data: {
                  balanceAvailable: nextAvailable,
                  balanceBRL: nextAvailable // keep legacy balance in sync
                }
              });
            }

            // Sync authStore state too
            await authStore.updateUser(userId, {
              balanceAvailableBRL: nextAvailable,
              balancePendingBRL: nextPending,
              totalEarnedBRL: nextEarned,
            });

            mockUserObj = u;
          }

          // Generate confirming entries of AuditLog table
          await prisma.auditLog.create({
            data: {
              actorId: userId,
              action: "PIX_DEPOSIT",
              description: `PIX Webhook Confirmado [Sucesso]: Recebido retorno do banco parceiro. Transação ${txid} processada com sucesso no valor de R$ ${paymentAmount.toFixed(2)}. Saldo creditado e consolidado na carteira física.`,
              amountBRL: paymentAmount
            }
          });

          isDbProcessed = true;
        }
      } catch (dbErr) {
        console.warn("DB update failure inside Webhook process. Relying on fallback:", dbErr);
      }
    }

    // Step C: Fallback updates if db layer did not fully process it but we have in-memory users
    if (!isDbProcessed && mockUserObj) {
      let nextAvailable = mockUserObj.balanceAvailableBRL ?? 0;
      let nextPending = mockUserObj.balancePendingBRL ?? 0;
      let nextEarned = mockUserObj.totalEarnedBRL ?? 0;

      if (paymentType === "MARKETPLACE_SELL") {
        nextPending = Number((nextPending + paymentAmount).toFixed(2));
        nextEarned = Number((nextEarned + paymentAmount).toFixed(2));
      } else {
        nextAvailable = Number((nextAvailable + paymentAmount).toFixed(2));
      }

      await authStore.updateUser(mockUserObj.id!, {
        balanceAvailableBRL: nextAvailable,
        balancePendingBRL: nextPending,
        totalEarnedBRL: nextEarned,
      });
    }

    res.json({
      success: true,
      message: `Webhook PIX processado com total êxito! Valor: R$ ${paymentAmount.toFixed(2)}.`,
      txid,
      paymentType,
      creditedAmount: paymentAmount,
      wallet: mockUserObj ? {
        balanceAvailableBRL: mockUserObj.balanceAvailableBRL ?? 0,
        balancePendingBRL: mockUserObj.balancePendingBRL ?? 0,
        totalEarnedBRL: mockUserObj.totalEarnedBRL ?? 0,
        totalWithdrawnBRL: mockUserObj.totalWithdrawnBRL ?? 0
      } : null
    });
  } catch (err: any) {
    console.error("Webhook processing crash:", err);
    res.status(500).json({ error: "Erro interno no servidor contábil ao processar o Webhook." });
  }
});

// =========================================================================
// ENDPOINTS DO MARKETPLACE INTERNO DA COMUNIDADE (P2P TRADING CORE)
// =========================================================================

// 1. OBTEM TODOS OS ANÚNCIOS ATIVOS DO MERCADO
app.get("/api/marketplace/items", async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const dbListings = await prisma.marketplaceItem.findMany({
          where: { active: true },
          include: { inventoryItem: true, seller: true }
        });
        
        const items = dbListings.map((list: any) => ({
          id: list.id,
          inventoryItemId: list.inventoryItemId,
          sellerId: list.sellerId,
          sellerName: list.seller?.name || "Desconhecido",
          price: list.priceKC,
          currency: 'KC',
          name: list.inventoryItem?.name || "Item Especial",
          description: list.inventoryItem?.description || "",
          category: (list.inventoryItem?.category || "gi").toLowerCase(),
          rarity: list.inventoryItem?.rarity || "Comum",
          imageUrl: list.inventoryItem?.imageUrl || ""
        }));
        return res.json({ items });
      } catch (dbErr) {
        console.warn("Prisma failed to load marketplace, using fallback:", dbErr);
      }
    }

    // Falls back to in-memory listings
    const items = inMemoryMarketplaceItems.filter(li => li.active).map(li => {
      const details = ALL_ITEMS_CATALOG[li.inventoryItemId] || {
        id: li.inventoryItemId,
        name: "Equipamento de Competição",
        description: "Equipamento oficial de torneios.",
        category: "gi",
        price: li.priceKC,
        rarity: "Comum",
        imageUrl: ""
      };
      return {
        id: li.id,
        inventoryItemId: li.inventoryItemId,
        sellerId: li.sellerId,
        sellerName: li.sellerName || "Atleta Virtual",
        price: li.priceKC,
        currency: 'KC',
        name: details.name,
        description: details.description,
        category: details.category,
        rarity: details.rarity,
        imageUrl: details.imageUrl
      };
    });

    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter itens do marketplace." });
  }
});

// 2. CRIA UM NOVO ANÚNCIO DE PRODUTO
app.post("/api/marketplace/list", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name;
    const { inventoryItemId, priceKC, name, description, category, rarity } = req.body;

    const price = parseInt(priceKC);

    // ANTI-FRAUD PRICE CHECKS
    if (isNaN(price) || price < 50 || price > 50000) {
      const prisma = getPrisma();
      if (prisma) {
        try {
          await prisma.auditLog.create({
            data: {
              actorId: userId,
              action: "SYSTEM_SETTING_CHANGE",
              description: `ALERTA DE SEGURANÇA ANTIFRAUDE: Tentativa de listagem fraudulenta com preço irregular de ${priceKC} KC pelo usuário "${userName}". Bloqueado.`,
            }
          });
        } catch (e) {}
      }

      return res.status(400).json({ 
        error: "Limites Regulatórios Antifraude: O preço deve estar obrigatoriamente entre 50 KC e 50.000 KC para impedir colisão e transbordamento." 
      });
    }

    // Determine item identity
    let finalItemId = inventoryItemId;
    let finalItemDetails: any = null;

    if (!finalItemId && name) {
      // Custom item creation and direct listing
      finalItemId = `custom_${Date.now()}`;
      finalItemDetails = {
        id: finalItemId,
        name,
        description: description || "Custom item listed by community seller.",
        category: category || "gi",
        rarity: rarity || "Comum",
        price,
        imageUrl: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=200"
      };

      // Add to catalog so other users can resolve details
      ALL_ITEMS_CATALOG[finalItemId] = finalItemDetails;
      
      // Add to this user's inventory
      const currentInv = inMemoryUserInventories.get(userId) || [];
      inMemoryUserInventories.set(userId, [...currentInv, finalItemId]);

    } else {
      // Existing item list
      finalItemDetails = ALL_ITEMS_CATALOG[finalItemId];
      if (!finalItemDetails) {
        return res.status(404).json({ error: "Item de origem não localizado no catálogo global." });
      }

      // Check ownership
      const userInv = inMemoryUserInventories.get(userId) || [];
      if (!userInv.includes(finalItemId)) {
        return res.status(403).json({ error: "Você não possui a propriedade deste item para listagem de venda." });
      }
    }

    // Add listing to memory
    const listingId = `list_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newListing = {
      id: listingId,
      inventoryItemId: finalItemId,
      sellerId: userId,
      sellerName: userName,
      priceKC: price,
      active: true,
      createdAt: new Date().toISOString()
    };
    inMemoryMarketplaceItems.unshift(newListing);

    // Temporarily remove/lock item from active inventory so user doesn't double-sell
    const currentInv = inMemoryUserInventories.get(userId) || [];
    inMemoryUserInventories.set(userId, currentInv.filter(id => id !== finalItemId));

    // Log to standard security auditor
    const prisma = getPrisma();
    const logDesc = `Mercado P2P: Criou anúncio do item "${finalItemDetails.name}" sob ID "${listingId}" por ${price} KC. Inspeção de integridade ativa.`;
    if (prisma) {
      try {
        await prisma.marketplaceItem.create({
          data: {
            id: listingId,
            inventoryItemId: finalItemId,
            sellerId: userId,
            priceKC: price,
            active: true
          }
        });

        await prisma.auditLog.create({
          data: {
            actorId: userId,
            action: "MARKETPLAYCE_LIST",
            description: logDesc,
            amountKC: price
          }
        });
      } catch (dbErr) {
        console.warn("Prisma error inserting list log, using memory fallback:", dbErr);
      }
    }

    res.json({ 
      success: true, 
      message: `O anúncio para "${finalItemDetails.name}" foi publicado e as garantias de custódia securitária estão operando!`,
      item: {
        id: listingId,
        name: finalItemDetails.name,
        price,
        rarity: finalItemDetails.rarity
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao publicar anúncio de venda." });
  }
});

// 3. EXECUTA A COMPRA DE UM ITEM (COM SISTEMA ANTIFRAUDE E COMISSÃO DE 10%)
app.post("/api/marketplace/buy", authenticateToken, async (req: any, res: any) => {
  try {
    const buyerId = req.user.id;
    const buyerName = req.user.name;
    const { marketplaceItemId } = req.body;

    if (!marketplaceItemId) {
      return res.status(400).json({ error: "Identificação da listagem ausente no request." });
    }

    // Find listing
    let listing = inMemoryMarketplaceItems.find(li => li.id === marketplaceItemId && li.active);
    const prisma = getPrisma();

    if (prisma) {
      try {
        const dbListing = await prisma.marketplaceItem.findFirst({
          where: { id: marketplaceItemId, active: true },
          include: { inventoryItem: true, seller: true }
        });
        if (dbListing) {
          listing = {
            id: dbListing.id,
            inventoryItemId: dbListing.inventoryItemId,
            sellerId: dbListing.sellerId,
            sellerName: dbListing.seller?.name || "Lutador",
            priceKC: dbListing.priceKC,
            active: dbListing.active,
          };
        }
      } catch (dbErr) {
        console.warn("Prisma locate listing error, fallback to memory:", dbErr);
      }
    }

    if (!listing) {
      return res.status(404).json({ error: "Esta oferta não está mais disponível ou foi finalizada por outro atleta." });
    }

    const { sellerId, sellerName, priceKC, inventoryItemId } = listing;

    // A. ANTI-FRAUD: Self-Buying Prevention
    if (sellerId === buyerId) {
      if (prisma) {
        try {
          await prisma.auditLog.create({
            data: {
              actorId: buyerId,
              action: "SYSTEM_SETTING_CHANGE",
              description: `BLOQUEIO DE FRAUDE: Usuário "${buyerName}" tentou praticar auto-compra de seu próprio anúncio ID "${marketplaceItemId}". Bloqueado.`,
            }
          });
        } catch (e) {}
      }
      return res.status(400).json({ 
        error: "Tentativa de Autocompra (Self-Buying): Você não pode adquirir seus próprios anúncios sob as regras de auditoria e segurança antifraude." 
      });
    }

    // B. ANTI-FRAUD: Multi-Session Velocity Rate Limit (3 transações por minuto)
    const nowMs = Date.now();
    const velocity = purchaseVelocityTracker.get(buyerId) || { count: 0, lastTime: nowMs };
    if (nowMs - velocity.lastTime < 60000) {
      if (velocity.count >= 3) {
        return res.status(429).json({ 
          error: "Bloqueio Velocidade Antifraude: Suspeita de script bot ou evasão de moedas. Aguarde 60 segundos antes de efetuar novas transações." 
        });
      }
      velocity.count += 1;
    } else {
      velocity.count = 1;
      velocity.lastTime = nowMs;
    }
    purchaseVelocityTracker.set(buyerId, velocity);

    // C. LOAD SELLER AND BUYER OBJECTS
    const buyerObj = await authStore.findById(buyerId);
    const sellerObj = await authStore.findById(sellerId);

    if (!buyerObj) return res.status(400).json({ error: "Perfil comprador inexistente." });
    
    const buyerCoins = buyerObj.coins ?? 0;
    if (buyerCoins < priceKC) {
      return res.status(400).json({ 
        error: `Saldo insuficiente! Você tem ${buyerCoins} KC e este item custa ${priceKC} KC.` 
      });
    }

    // Get item detail to recover name
    const itemDetails = ALL_ITEMS_CATALOG[inventoryItemId] || { name: "Equipamento Especial BJJ", rarity: "Comum" };

    // D. SYSTEM COMMISSION CHARGES / COMMISSION ENGINE
    // Platform takes 10% commission on P2P trading activity
    const commissionRate = 0.10;
    const feePaidKC = Math.ceil(priceKC * commissionRate);
    const sellerNetKC = priceKC - feePaidKC;

    // E. ASSESS RISK SCORE & COLLUSION ENGINE (RISK METRICS)
    let riskScore = 15;
    let securityNotes = "Garantias operacionais normais aplicadas.";
    let saleStatus: 'Seguro' | 'Suspeito' | 'Analise_Manual' | 'Bloqueado' = 'Seguro';

    if (priceKC > 15000) {
      riskScore = 80;
      securityNotes = "Valor extremamente elevado para bens cosméticos virtuais. Registrado para análise de integridade.";
      saleStatus = 'Suspeito';
    } else if (priceKC > 6000) {
      riskScore = 45;
      securityNotes = "Valor acima da média do tatame. Commissionamento retido para compensação posterior.";
      saleStatus = 'Suspeito';
    }

    // F. EXECUTE THE P2P TRANSFER
    const updatedBuyerCoins = buyerCoins - priceKC;
    await authStore.updateUser(buyerId, { coins: updatedBuyerCoins });

    if (sellerObj) {
      const updatedSellerCoins = (sellerObj.coins ?? 0) + sellerNetKC;
      await authStore.updateUser(sellerId, { coins: updatedSellerCoins });
    }

    // Transfer inventory IDs
    const buyerInv = inMemoryUserInventories.get(buyerId) || [];
    inMemoryUserInventories.set(buyerId, [...buyerInv, inventoryItemId]);

    // Deactivate Listing
    listing.active = false;
    const memListing = inMemoryMarketplaceItems.find(li => li.id === marketplaceItemId);
    if (memListing) memListing.active = false;

    // G. RECORD SALE ENTITY
    const saleId = `sale_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newSale = {
      id: saleId,
      marketplaceItemId,
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      pricePaidKC: priceKC,
      feePaidKC,
      itemName: itemDetails.name,
      createdAt: new Date().toISOString(),
      status: saleStatus,
      riskScore,
      securityNotes
    };
    inMemoryMarketplaceSales.unshift(newSale);

    // H. AUDITING AND LOGGING DISPATCH
    const auditText = `Mercado P2P: Atleta "${buyerName}" adquiriu "${itemDetails.name}" de "${sellerName}" por ${priceKC} KC. Comissão de 10% cobrada: ${feePaidKC} KC (Plataforma). Vended net: ${sellerNetKC} KC. Risco: ${riskScore}% (${saleStatus}).`;
    
    if (prisma) {
      try {
        await prisma.marketplaceSale.create({
          data: {
            id: saleId,
            marketplaceItemId,
            buyerId,
            pricePaidKC: priceKC,
            feePaidKC
          }
        });

        await prisma.marketplaceItem.update({
          where: { id: marketplaceItemId },
          data: { active: false }
        });

        await prisma.auditLog.create({
          data: {
            actorId: buyerId,
            action: "MARKETPLAYCE_BUY",
            description: auditText,
            amountKC: priceKC
          }
        });
      } catch (dbErr) {
        console.warn("Prisma sales audit insertion failed, index in cache:", dbErr);
      }
    }

    res.json({
      success: true,
      message: `Negócio fechado! O item "${itemDetails.name}" foi transferido sob a supervisão do motor antifraude.`,
      commission: {
        paidKC: feePaidKC,
        rate: "10%",
        sellerReceived: sellerNetKC
      },
      sale: newSale
    });

  } catch (error) {
    console.error("Crash in marketplace buy endpoint:", error);
    res.status(500).json({ error: "Erro interno no servidor contábil ao processar compra." });
  }
});

// 4. RETORNA DETALHES DE VENDAS CONCLUÍDAS DO MARKETPLACE
app.get("/api/marketplace/sales", async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const dbSales = await prisma.marketplaceSale.findMany({
          include: { 
            buyer: true, 
            marketplaceItem: { 
              include: { inventoryItem: true, seller: true } 
            } 
          },
          orderBy: { createdAt: "desc" }
        });

        const sales = dbSales.map((sa: any) => {
          const mItem = sa.marketplaceItem;
          const name = mItem?.inventoryItem?.name || "Equipamento BJJ";
          return {
            id: sa.id,
            marketplaceItemId: sa.marketplaceItemId,
            buyerId: sa.buyerId,
            buyerName: sa.buyer?.name || "Comprador",
            sellerId: mItem?.sellerId || "Sistema",
            sellerName: mItem?.seller?.name || "Vendedor",
            pricePaidKC: sa.pricePaidKC,
            feePaidKC: sa.feePaidKC,
            itemName: name,
            createdAt: sa.createdAt.toISOString(),
            status: sa.pricePaidKC > 15000 ? "Suspeito" : "Seguro",
            riskScore: sa.pricePaidKC > 15000 ? 80 : 15,
            securityNotes: sa.pricePaidKC > 15000 ? "Investigaço antifraude em faturamento pendente." : "Consistente com tabelas de referência."
          };
        });
        return res.json({ sales });
      } catch (e) {
        console.warn("DB sales query fallback:", e);
      }
    }

    res.json({ sales: inMemoryMarketplaceSales });
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar auditoria contábil de vendas." });
  }
});

// 5. RETORNA ALERTA LOG DE SEGURANÇA E ANTIFRAUDE ESPECIALIZADO
app.get("/api/marketplace/audit", async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    let securityLogs = [];

    if (prisma) {
      try {
        const dbAudit = await prisma.auditLog.findMany({
          where: {
            action: {
              in: ["MARKETPLAYCE_LIST", "MARKETPLAYCE_BUY", "SYSTEM_SETTING_CHANGE"]
            }
          },
          orderBy: { createdAt: "desc" },
          take: 50
        });
        securityLogs = dbAudit.map((lg: any) => ({
          id: lg.id,
          description: lg.description,
          action: lg.action,
          amountKC: lg.amountKC,
          createdAt: lg.createdAt.toISOString()
        }));
      } catch (e) {
        console.warn("No DB audit logs found.", e);
      }
    }

    res.json({ logs: securityLogs });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter dados de auditoria." });
  }
});

// =========================================================================
// SOCIAL INTERNAL NETWORK ENDPOINTS (POSTS, LIKES, COMMENTS, FOLLOWS, NOTIFS)
// =========================================================================

// Fallback memory databases
export let inMemorySocialPosts: any[] = [
  {
    id: "post_initial_1",
    authorId: "prof_gracie",
    authorName: "Sensei Roger Gracie",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    authorBelt: "Preto",
    category: "Treino",
    content: "Hoje às 19h teremos uma masterclass online aqui na JiuSpeak focada na transição da Guarda Fechada para a Raspagem de Tesoura. Não faltem aos treinos mentais, oss!",
    upvotes: 42,
    hasUpvoted: false,
    timestamp: "2 horas atrás",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    comments: [
      {
        id: "c_initial_1",
        authorName: 'Thiago "Filho do Vento"',
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        authorBelt: "Azul",
        content: "Estarei lá com certeza Mestre! Minha raspagem está travando na altura do joelho dele, preciso de ajuda com a alavanca.",
        timestamp: "1 hora atrás",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "c_initial_2",
        authorName: "Mestre_Cascão90",
        authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        authorBelt: "Preto",
        content: "Maravilha Roger! Essa aula vale ouro. Os detalhes desse quadril salvam qualquer jogo.",
        timestamp: "45 min atrás",
        createdAt: new Date(Date.now() - 2700000).toISOString()
      }
    ]
  },
  {
    id: "post_initial_2",
    authorId: "user_4593",
    authorName: "Guilherme Faixa Azul",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    authorBelt: "Azul",
    category: "Meme",
    content: "Aquele momento em que o faixa preta diz 'vamos dar um rolinho leve', você aceita e seu corpo vira origami em 3 minutos de massacre 😂",
    upvotes: 89,
    hasUpvoted: false,
    timestamp: "5 horas atrás",
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    comments: []
  },
  {
    id: "post_initial_3",
    authorId: "user_1199",
    authorName: "Fabrícia Guardeira",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    authorBelt: "Roxa",
    category: "Dúvida",
    content: "Alguém mais sente muita fadiga no antebraço ao fazer pegadas na manga na Guarda De la Riva? Algum ajuste postural evita essa força excessiva dos dedos?",
    upvotes: 18,
    hasUpvoted: false,
    timestamp: "1 dia atrás",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    comments: [
      {
        id: "c_initial_3",
        authorName: "Claudio Chave de Pé",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        authorBelt: "Marrom",
        content: "Tente fazer pegada de concha (gancho com 4 dedos para dentro sem torcer) em vez de estrangular o pano do quimono. Use o osso do antebraço como gancho anatômico.",
        timestamp: "18 horas atrás",
        createdAt: new Date(Date.now() - 64800000).toISOString()
      }
    ]
  }
];

export let inMemoryFollowers: any[] = [];
export let inMemorySocialNotifications: any[] = [];

// Helper to format dynamic relative time
function getRelativeTime(timestampStr: string | Date): string {
  try {
    const date = new Date(timestampStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Agora mesmo";
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Agora mesmo";
    if (diffMin < 60) return `Há ${diffMin} min`;
    if (diffHr < 24) return `Há ${diffHr} hora${diffHr > 1 ? "s" : ""}`;
    return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  } catch (err) {
    return "Recentemente";
  }
}

// 1. GET ALL SOCIAL POSTS
app.get("/api/social/posts", authenticateToken, async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const userId = req.user.id;

    const dbPosts = await prisma.socialPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, belt: true }
        },
        likes: true,
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, avatar: true, belt: true }
            }
          }
        }
      }
    });

    const mappedPosts = dbPosts.map((post: any) => {
      const hasLiked = post.likes.some((lk: any) => lk.userId === userId);
      return {
        id: post.id,
        authorId: post.authorId,
        authorName: post.author?.name || "Atleta Anônimo",
        authorAvatar: post.author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
        authorBelt: post.author?.belt || "WHITE",
        category: post.category,
        content: post.content,
        upvotes: post.likes.length,
        hasUpvoted: hasLiked,
        timestamp: getRelativeTime(post.createdAt),
        comments: post.comments.map((comm: any) => ({
          id: comm.id,
          authorName: comm.author?.name || "Comentador",
          authorAvatar: comm.author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
          authorBelt: comm.author?.belt || "WHITE",
          content: comm.content,
          timestamp: getRelativeTime(comm.createdAt)
        }))
      };
    });

    res.json({ posts: mappedPosts });
  } catch (error) {
    console.error("Critical database error in social feed retrieval:", error);
    res.status(500).json({ error: "Erro ao obter lista de publicações." });
  }
});

// 2. CREATE A SOCIAL POST
app.post("/api/social/posts", authenticateToken, async (req: any, res: any) => {
  try {
    const { content, category, imageUrl } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "O conteúdo da publicação não pode ser vazio." });
    }

    const targetCategory = category || "Treino";
    const prisma = getPrisma();
    let savedPost: any = null;

    if (prisma) {
      try {
        const created = await prisma.socialPost.create({
          data: {
            authorId: userId,
            content: content.trim(),
            category: targetCategory,
            imageUrl: imageUrl || null
          },
          include: {
            author: {
              select: { id: true, name: true, avatar: true, belt: true }
            }
          }
        });

        // Trigger dynamic system notifications to followers
        try {
          const followersList = await prisma.follower.findMany({
            where: { followingId: userId },
            select: { followerId: true }
          });

          for (const followObj of followersList) {
            await prisma.notification.create({
              data: {
                userId: followObj.followerId,
                title: "Nova publicação de atleta",
                content: `${req.user.name} publicou um novo post no canal #${targetCategory.toLowerCase()}`,
                type: "SOCIAL_INTERACTION",
                linkTo: "social"
              }
            });
          }
        } catch (notifErr) {
          console.warn("Follower notification failed for new post:", notifErr);
        }

        savedPost = {
          id: created.id,
          authorId: created.authorId,
          authorName: created.author?.name || req.user.name,
          authorAvatar: created.author?.avatar || req.user.avatar,
          authorBelt: created.author?.belt || req.user.belt,
          category: created.category,
          content: created.content,
          upvotes: 0,
          hasUpvoted: false,
          timestamp: "Agora mesmo",
          comments: []
        };
      } catch (dbErr) {
        console.warn("Prisma social post insertion failed, falling back to memory:", dbErr);
      }
    }

    if (!savedPost) {
      // Memory fallback insertion
      const mockPost = {
        id: `post_mem_${Date.now()}`,
        authorId: userId,
        authorName: req.user.name,
        authorAvatar: req.user.avatar,
        authorBelt: req.user.belt,
        category: targetCategory,
        content: content.trim(),
        upvotes: 0,
        hasUpvoted: false,
        timestamp: "Agora mesmo",
        createdAt: new Date().toISOString(),
        likedByUsers: [],
        comments: []
      };
      inMemorySocialPosts.unshift(mockPost);
      savedPost = mockPost;

      // Notify memory followers
      const followersToNotify = inMemoryFollowers.filter(f => f.followingId === userId);
      for (const f of followersToNotify) {
        inMemorySocialNotifications.unshift({
          id: `notif_${Date.now()}_${Math.random()}`,
          userId: f.followerId,
          title: "Nova publicação de atleta",
          content: `${req.user.name} publicou um novo post no canal #${targetCategory.toLowerCase()}`,
          type: "SOCIAL_INTERACTION",
          isRead: false,
          linkTo: "social",
          createdAt: new Date().toISOString()
        });
      }
    }

    res.status(201).json({ message: "Conteúdo publicado com sucesso!", post: savedPost });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao cadastrar postagem." });
  }
});

// 3. TOGGLE UPVOTE / LIKE ON A POST
app.post("/api/social/posts/:postId/like", authenticateToken, async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const prisma = getPrisma();
    let isLikedNow = false;
    let upvoteCount = 0;

    if (prisma) {
      try {
        const existingLike = await prisma.like.findFirst({
          where: { postId, userId }
        });

        const postObj = await prisma.socialPost.findUnique({
          where: { id: postId }
        });

        if (postObj) {
          if (existingLike) {
            await prisma.like.delete({
              where: { id: existingLike.id }
            });
            isLikedNow = false;
          } else {
            await prisma.like.create({
              data: { postId, userId }
            });
            isLikedNow = true;

            // Notify author of post
            if (postObj.authorId !== userId) {
              await prisma.notification.create({
                data: {
                  userId: postObj.authorId,
                  title: "Sua publicação recebeu uma curtida!",
                  content: `${req.user.name} curtiu seu post no canal #${postObj.category.toLowerCase()}`,
                  type: "SOCIAL_INTERACTION",
                  linkTo: "social"
                }
              });
            }
          }

          const updatedLikes = await prisma.like.count({
            where: { postId }
          });

          // Sync count to socialPost too
          await prisma.socialPost.update({
            where: { id: postId },
            data: { upvotesCount: updatedLikes }
          });

          upvoteCount = updatedLikes;
          return res.json({ hasUpvoted: isLikedNow, upvotes: upvoteCount });
        }
      } catch (dbErr) {
        console.warn("Prisma like toggling failed, falling back to memory:", dbErr);
      }
    }

    // Memory Fallback
    const targetPost = inMemorySocialPosts.find(p => p.id === postId);
    if (!targetPost) {
      return res.status(404).json({ error: "Postagem não localizada." });
    }

    if (!targetPost.likedByUsers) {
      targetPost.likedByUsers = [];
    }

    const idx = targetPost.likedByUsers.indexOf(userId);
    if (idx > -1) {
      targetPost.likedByUsers.splice(idx, 1);
      targetPost.upvotes = Math.max(0, targetPost.upvotes - 1);
      isLikedNow = false;
    } else {
      targetPost.likedByUsers.push(userId);
      targetPost.upvotes += 1;
      isLikedNow = true;

      // Notify memory author
      if (targetPost.authorId !== userId) {
        inMemorySocialNotifications.unshift({
          id: `notif_${Date.now()}_${Math.random()}`,
          userId: targetPost.authorId,
          title: "Sua publicação recebeu uma curtida!",
          content: `${req.user.name} curtiu seu post no canal #${targetPost.category.toLowerCase()}`,
          type: "SOCIAL_INTERACTION",
          isRead: false,
          linkTo: "social",
          createdAt: new Date().toISOString()
        });
      }
    }

    upvoteCount = targetPost.upvotes;
    res.json({ hasUpvoted: isLikedNow, upvotes: upvoteCount });
  } catch (error) {
    res.status(500).json({ error: "Erro ao alternar curtida da postagem." });
  }
});

// 4. ADD COMMENT TO A POST
app.post("/api/social/posts/:postId/comment", authenticateToken, async (req: any, res: any) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "O comentário não pode ser em branco." });
    }

    const prisma = getPrisma();
    let commentResponse: any = null;

    if (prisma) {
      try {
        const postObj = await prisma.socialPost.findUnique({
          where: { id: postId }
        });

        if (postObj) {
          const createdComment = await prisma.comment.create({
            data: {
              postId,
              authorId: userId,
              content: content.trim()
            },
            include: {
              author: {
                select: { name: true, avatar: true, belt: true }
              }
            }
          });

          // Notify author of post
          if (postObj.authorId !== userId) {
            await prisma.notification.create({
              data: {
                userId: postObj.authorId,
                title: "Novo comentário no seu post",
                content: `${req.user.name} respondeu: "${content.trim().length > 30 ? content.trim().slice(0, 30) + '...' : content.trim()}"`,
                type: "SOCIAL_INTERACTION",
                linkTo: "social"
              }
            });
          }

          commentResponse = {
            id: createdComment.id,
            authorName: createdComment.author?.name || req.user.name,
            authorAvatar: createdComment.author?.avatar || req.user.avatar,
            authorBelt: createdComment.author?.belt || req.user.belt,
            content: createdComment.content,
            timestamp: "Agora mesmo"
          };
        }
      } catch (dbErr) {
        console.warn("Prisma comment creation failed, falling back to memory:", dbErr);
      }
    }

    if (!commentResponse) {
      // Memory Fallback
      const targetPost = inMemorySocialPosts.find(p => p.id === postId);
      if (!targetPost) {
        return res.status(404).json({ error: "Postagem não localizada." });
      }

      const mockComment = {
        id: `comment_mem_${Date.now()}`,
        authorName: req.user.name,
        authorAvatar: req.user.avatar,
        authorBelt: req.user.belt,
        content: content.trim(),
        timestamp: "Agora mesmo",
        createdAt: new Date().toISOString()
      };
      
      if (!targetPost.comments) {
        targetPost.comments = [];
      }
      targetPost.comments.push(mockComment);
      commentResponse = mockComment;

      // Notify memory author
      if (targetPost.authorId !== userId) {
        inMemorySocialNotifications.unshift({
          id: `notif_${Date.now()}_${Math.random()}`,
          userId: targetPost.authorId,
          title: "Novo comentário no seu post",
          content: `${req.user.name} respondeu: "${content.trim().length > 30 ? content.trim().slice(0, 30) + '...' : content.trim()}"`,
          type: "SOCIAL_INTERACTION",
          isRead: false,
          linkTo: "social",
          createdAt: new Date().toISOString()
        });
      }
    }

    res.status(201).json({ message: "Comentário publicado!", comment: commentResponse });
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao salvar comentário." });
  }
});

// 5. GET NETWORK - USERS LIST AND CORRESPONDING FOLLOWERS METRICS
app.get("/api/social/network", authenticateToken, async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const currentUserId = req.user.id;
    let usersNetwork: any[] = [];

    if (prisma) {
      try {
        const dbUsers = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            avatar: true,
            belt: true,
            role: true,
            level: true,
            followers: true,
            following: true
          }
        });

        usersNetwork = dbUsers.map((u: any) => {
          const isFollowedByMe = u.followers.some((f: any) => f.followerId === currentUserId);
          return {
            id: u.id,
            name: u.name,
            avatar: u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
            belt: u.belt,
            role: u.role,
            level: u.level || 1,
            followersCount: u.followers.length,
            followingCount: u.following.length,
            isFollowing: isFollowedByMe
          };
        });
      } catch (dbErr) {
        console.warn("Prisma network query failed, falling back to memory:", dbErr);
      }
    }

    if (usersNetwork.length === 0) {
      // Memory Fallback
      const itemsList: any[] = Array.from(inMemoryUsers.values());
      
      if (itemsList.length < 5) {
        itemsList.push({ id: "prof_gracie", name: "Sensei Roger Gracie", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", belt: "BLACK", role: "INSTRUCTOR", level: 82 });
        itemsList.push({ id: "user_4593", name: "Guilherme Faixa Azul", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150", belt: "BLUE", role: "ATHLETE", level: 12 });
        itemsList.push({ id: "user_1199", name: "Fabrícia Guardeira", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", belt: "PURPLE", role: "ATHLETE", level: 27 });
      }

      usersNetwork = itemsList.map((u: any) => {
        const isFollowedByMe = inMemoryFollowers.some(f => f.followerId === currentUserId && f.followingId === u.id);
        const followersCount = inMemoryFollowers.filter(f => f.followingId === u.id).length;
        const followingCount = inMemoryFollowers.filter(f => f.followerId === u.id).length;

        return {
          id: u.id,
          name: u.name,
          avatar: u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150",
          belt: u.belt || "WHITE",
          role: u.role || "ATHLETE",
          level: u.level || 1,
          followersCount: followersCount,
          followingCount: followingCount,
          isFollowing: isFollowedByMe
        };
      });
    }

    // Filter out current user from the recommendations/list to avoid following yourself
    res.json({ network: usersNetwork.filter(item => item.id !== currentUserId) });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter rede social de atletas." });
  }
});

// 6. TOGGLE FOLLOW OF ANOTHER PROFILE
app.post("/api/social/users/:userId/follow", authenticateToken, async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const prisma = getPrisma();
    let isFollowingNow = false;

    if (currentUserId === userId) {
      return res.status(400).json({ error: "Você não pode seguir a si mesmo!" });
    }

    if (prisma) {
      try {
        const existingFollow = await prisma.follower.findFirst({
          where: { followerId: currentUserId, followingId: userId }
        });

        if (existingFollow) {
          await prisma.follower.delete({
            where: { id: existingFollow.id }
          });
          isFollowingNow = false;
        } else {
          await prisma.follower.create({
            data: { followerId: currentUserId, followingId: userId }
          });
          isFollowingNow = true;

          // Notify target user
          await prisma.notification.create({
            data: {
              userId: userId,
              title: "Novo Seguidor!",
              content: `${req.user.name} começou a seguir seu perfil e treinos.`,
              type: "FOLLOWER",
              linkTo: "social"
            }
          });
        }

        return res.json({ isFollowing: isFollowingNow, message: isFollowingNow ? "Você começou a seguir este atleta!" : "Você parou de seguir este atleta." });
      } catch (dbErr) {
        console.warn("Prisma follow execution failed, falling back to memory:", dbErr);
      }
    }

    // Memory Fallback
    const existingIdx = inMemoryFollowers.findIndex(f => f.followerId === currentUserId && f.followingId === userId);
    if (existingIdx > -1) {
      inMemoryFollowers.splice(existingIdx, 1);
      isFollowingNow = false;
    } else {
      inMemoryFollowers.push({
        id: `follow_${Date.now()}`,
        followerId: currentUserId,
        followingId: userId,
        createdAt: new Date().toISOString()
      });
      isFollowingNow = true;

      // Notify memory target user
      inMemorySocialNotifications.unshift({
        id: `notif_${Date.now()}_${Math.random()}`,
        userId: userId,
        title: "Novo Seguidor!",
        content: `${req.user.name} começou a seguir seu perfil e treinos.`,
        type: "FOLLOWER",
        isRead: false,
        linkTo: "social",
        createdAt: new Date().toISOString()
      });
    }

    res.json({ isFollowing: isFollowingNow, message: isFollowingNow ? "Você começou a seguir este atleta!" : "Você parou de seguir este atleta." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar relacionamento de seguidor." });
  }
});

// 7. GET NOTIFICATIONS
app.get("/api/social/notifications", authenticateToken, async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const userId = req.user.id;
    let list: any[] = [];

    if (prisma) {
      try {
        const dbNotifs = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 50
        });
        list = dbNotifs.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          type: n.type,
          isRead: n.isRead,
          linkTo: n.linkTo,
          createdAt: n.createdAt.toISOString()
        }));
      } catch (dbErr) {
        console.warn("Prisma notifications query failed, falling back to memory:", dbErr);
      }
    }

    if (list.length === 0) {
      // Memory Fallback
      list = inMemorySocialNotifications.filter(n => n.userId === userId);
    }

    res.json({ notifications: list });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter notificações." });
  }
});

// 8. MARK ALL NOTIFICATIONS AS READ
app.post("/api/social/notifications/read", authenticateToken, async (req: any, res: any) => {
  try {
    const prisma = getPrisma();
    const userId = req.user.id;

    if (prisma) {
      try {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true }
        });
      } catch (dbErr) {
        console.warn("Prisma notifications read failed:", dbErr);
      }
    }

    // Always do memory fallback sync
    inMemorySocialNotifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });

    res.json({ message: "Todas as notificações lidas." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status de notificações." });
  }
});

// =========================================================================
// VITE DEV SERVER ENGINE INTEGRATION & SOCKET.IO SERVICES
// =========================================================================
async function startServer() {
  // Assert PostgreSQL connectivity immediately, failing hard if offline
  await assertDatabaseConnection();

  const server = http.createServer(app);
  
  // Attach Socket.IO to HTTP server allowing same-port ingestion
  const io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Initialize companion engines
  ArenaService.init(io);
  MatchmakingService.init();

  // Try database seeding
  await seedQuestionsInDb();
  await seedPlansInDb();

  // Socket.IO Events Orchestrator
  io.on("connection", (socket) => {
    console.log(`🔌 Novo socket conectado: ${socket.id}`);

    // Dynamic JWT verify of active connection
    socket.on("auth:register", async ({ token }) => {
      try {
        if (!token) return;
        const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
        const user = await authStore.findById(decoded.userId);
        if (!user) {
          socket.emit("auth:error", { message: "Usuário não localizado." });
          return;
        }

        socket.data.userId = user.id;
        socket.data.userProfile = user;
        console.log(`🔑 Socket ${socket.id} autenticado como: ${user.name} (ELO: ${user.elo})`);

        socket.emit("auth:success", {
          userId: user.id,
          name: user.name,
          elo: user.elo || 1000
        });
      } catch (err) {
        socket.emit("auth:error", { message: "Sessão expirada do socket." });
      }
    });

    // Enter Match Queue
    socket.on("matchmaking:join", async () => {
      const userId = socket.data.userId;
      const profile = socket.data.userProfile;
      if (!userId || !profile) {
        socket.emit("matchmaking:error", { error: "Requer autenticação JWT." });
        return;
      }

      // Re-fetch profile to pick latest Elo and updates
      const updatedProfile = await authStore.findById(userId);
      if (updatedProfile) {
        socket.data.userProfile = updatedProfile;
      }

      const activeProfile = updatedProfile || profile;

      await MatchmakingService.enterQueue({
        userId,
        name: activeProfile.name || "Atleta Anônimo",
        avatar: activeProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        elo: activeProfile.elo || 1000,
        socketId: socket.id,
        joinedAt: Date.now()
      });

      socket.emit("matchmaking:queued", {
        status: "QUEUED",
        elo: activeProfile.elo || 1000
      });
    });

    // Cancel matching search
    socket.on("matchmaking:leave", async () => {
      const userId = socket.data.userId;
      if (!userId) return;
      await MatchmakingService.leaveQueue(userId);
      socket.emit("matchmaking:unqueued");
    });

    // Trigger instant Bot challenge
    socket.on("matchmaking:fast_bot_join", async (data?: { belt?: string }) => {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("matchmaking:error", { error: "Não autenticado." });
        return;
      }
      try {
        const belt = data?.belt;
        const matchId = await MatchmakingService.spawnBotMatch(userId, belt);
        socket.emit("matchmaking:bot_matched", { matchId });
      } catch (err: any) {
        socket.emit("matchmaking:error", { error: err.message });
      }
    });

    // Player inputs active choice card
    socket.on("arena:submit_answer", ({ matchId, selectedOption, responseTimeMs }) => {
      const userId = socket.data.userId;
      if (!userId || !matchId) return;

      ArenaService.handlePlayerSubmit(matchId, userId, selectedOption, responseTimeMs);
    });

    // Disconnect event cleanup checks
    socket.on("disconnect", async () => {
      const userId = socket.data.userId;
      if (userId) {
        await MatchmakingService.leaveQueue(userId);
        ArenaService.handlePlayerDisconnect(userId);
      }
      console.log(`🔌 Conexão de socket desfeita: ${socket.id}`);
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MULTIPLAYER PVP AUTH SERVER BOOTED: Running on port ${PORT}`);
  });
}

startServer();
