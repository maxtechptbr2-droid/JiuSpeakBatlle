import { describe, it, expect, vi } from "vitest";

// =========================================================================
// DOMAIN MODELS & LOGIC EMULATED (REPLICATED FROM SERVER.TS / AUTHSTORE.TS)
// =========================================================================

// 1. LOGIN & USER CREATING LOGIC
export interface MockUserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "USER" | "ATHLETE" | "TEACHER" | "ADMIN";
  belt: string;
  isVerified: boolean;
  jiuTicketsBalance: number;
}

export class LoginEngine {
  public static async hashPassword(password: string): Promise<string> {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    // Simple deterministic hash matching test-level security bounds
    return `hash_sim_${password}_verified`;
  }

  public static verifyPassword(password: string, hash: string): boolean {
    return hash === `hash_sim_${password}_verified`;
  }

  public static validateEmail(email: string): boolean {
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return rx.test(email);
  }

  public static processLogin(user: MockUserEntity, inputPass: string) {
    if (!this.verifyPassword(inputPass, user.passwordHash)) {
      throw new Error("Credenciais inválidas de acesso.");
    }
    if (!user.isVerified && user.role === "TEACHER") {
      throw new Error("Conta de instrutor pendente de verificação cadastral.");
    }
    return {
      success: true,
      userPayload: {
        id: user.id,
        email: user.email,
        role: user.role,
        belt: user.belt
      }
    };
  }
}

// 2. JWT TOKEN SECURITY ENGINE
export interface MockJwtClaims {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export class JwtEngine {
  public static sign(payload: Omit<MockJwtClaims, "exp">, secret: string, expiresInSeconds: number = 3600): string {
    if (!secret || secret.trim() === "") {
      throw new Error("JWT Secret cannot be empty.");
    }
    const signature = `jwt_sig_with_${secret}`;
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const claims = { ...payload, exp };
    return Buffer.from(JSON.stringify(claims)).toString("base64") + "." + signature;
  }

  public static verify(token: string, secret: string): MockJwtClaims {
    if (!token || !token.includes(".")) {
      throw new Error("Token malformado ou inválido.");
    }
    const [payloadB64, signature] = token.split(".");
    if (signature !== `jwt_sig_with_${secret}`) {
      throw new Error("Assinatura de token JWT inválida.");
    }
    const claims: MockJwtClaims = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf-8"));
    const currentUnix = Math.floor(Date.now() / 1000);
    if (claims.exp < currentUnix) {
      throw new Error("Token JWT expirado. Faça login novamente.");
    }
    return claims;
  }
}

// 3. MERCADO PAGO INTEGRATION
export interface MercadoPagoPreferenceInput {
  productId: string;
  title: string;
  quantity: number;
  unitPriceBRL: number;
  payerEmail: string;
  externalReference: string;
}

export class MercadoPagoMockService {
  public static createPreference(input: MercadoPagoPreferenceInput, accessToken: string) {
    if (!accessToken.startsWith("APP_USR-")) {
      throw new Error("Token de acesso inválido do integrador Mercado Pago.");
    }
    if (input.unitPriceBRL <= 0) {
      throw new Error("Preço unitário em BRL deve ser estritamente positivo.");
    }
    if (!input.payerEmail.includes("@")) {
      throw new Error("E-mail do pagador inválido para conciliação.");
    }
    return {
      id: "PREF_" + Math.random().toString(36).substr(2, 9),
      init_point: `https://www.mercadopago.com.br/sandbox/pay?pref_id=PREF_${input.productId}`,
      external_reference: input.externalReference,
      sandbox_mode: true
    };
  }

  public static processWebhook(payload: any, signatureHeader: string, clientSecret: string) {
    if (!signatureHeader || signatureHeader !== `hash_${clientSecret}`) {
      throw new Error("Assinatura de Webhook Mercado Pago inválida.");
    }
    if (payload.action === "payment.created" || payload.action === "payment.updated") {
      const paymentId = payload.data?.id;
      const status = payload.status || "approved"; // approved, pending, rejected
      return {
        paymentId,
        status,
        externalReference: payload.external_reference,
        amountBRL: payload.transaction_amount
      };
    }
    return { status: "ignored" };
  }
}

// 4. JIU_TICKETS SYSTEM (JT)
export class JiuTicketsLedger {
  public static readonly BRL_TO_JT_RATE = 10; // R$ 1.00 = 10 JT

  public static convertBRLToJT(amountBRL: number): number {
    if (amountBRL <= 0) return 0;
    return Math.floor(amountBRL * this.BRL_TO_JT_RATE);
  }

  public static deductTickets(user: MockUserEntity, amount: number): MockUserEntity {
    if (amount <= 0) {
      throw new Error("Quantidade de JiuTickets para debitar deve ser positiva.");
    }
    if (user.jiuTicketsBalance < amount) {
      throw new Error(`Saldo de JiuTickets insuficiente. Necessita: ${amount}, Possui: ${user.jiuTicketsBalance}`);
    }
    return {
      ...user,
      jiuTicketsBalance: user.jiuTicketsBalance - amount
    };
  }

  public static addTickets(user: MockUserEntity, amount: number): MockUserEntity {
    if (amount <= 0) {
      throw new Error("Quantidade de JiuTickets para creditar deve ser positiva.");
    }
    return {
      ...user,
      jiuTicketsBalance: user.jiuTicketsBalance + amount
    };
  }
}

// 5. MARKETPLACE ENGINE WITH ESCROW
export interface MockMarketplaceItem {
  id: string;
  title: string;
  priceJT: number;
  sellerId: string;
  status: "ACTIVE" | "PAUSED" | "SOLD" | "ESCROW_LOCKED";
}

export interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  amountJT: number;
  commissionBRL: number;
  sellerNetBRL: number;
  status: "LOCKED" | "RELEASED" | "REFUNDED";
  createdAt: number;
}

export class MarketplaceEscrowEngine {
  public static purchaseItem(
    buyer: MockUserEntity,
    item: MockMarketplaceItem,
    conversionRate: number,
    commissionPct: number
  ): { updatedBuyer: MockUserEntity; escrowTx: EscrowTransaction } {
    if (item.status !== "ACTIVE") {
      throw new Error("Este item do Marketplace não está disponível.");
    }
    if (buyer.id === item.sellerId) {
      throw new Error("Você não pode comprar seu próprio item listado.");
    }
    
    // Deduct JT from buyer
    const updatedBuyer = JiuTicketsLedger.deductTickets(buyer, item.priceJT);
    
    // Calculate conversions
    const totalBRL = Number((item.priceJT * conversionRate).toFixed(2));
    const commissionBRL = Number(((totalBRL * commissionPct) / 100).toFixed(2));
    const sellerNetBRL = Number((totalBRL - commissionBRL).toFixed(2));

    const escrowTx: EscrowTransaction = {
      id: "ESCROW_" + Math.random().toString(36).substr(2, 9),
      buyerId: buyer.id,
      sellerId: item.sellerId,
      itemId: item.id,
      amountJT: item.priceJT,
      commissionBRL,
      sellerNetBRL,
      status: "LOCKED",
      createdAt: Date.now()
    };

    return { updatedBuyer, escrowTx };
  }

  public static releaseEscrow(escrow: EscrowTransaction, seller: MockUserEntity): { updatedSeller: MockUserEntity; completedEscrow: EscrowTransaction } {
    if (escrow.status !== "LOCKED") {
      throw new Error("A transação de garantia já foi liberada ou reembolsada.");
    }
    
    // Credit JT to seller
    const updatedSeller = JiuTicketsLedger.addTickets(seller, escrow.amountJT);
    const completedEscrow: EscrowTransaction = {
      ...escrow,
      status: "RELEASED"
    };

    return { updatedSeller, completedEscrow };
  }
}

// 6. FOLLOWERS MANAGEMENT SYSTEM
export interface MockFollower {
  followerId: string;
  followingId: string;
}

export class SocialFollowNetwork {
  private relations: MockFollower[] = [];

  public follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error("Você não pode seguir a si mesmo.");
    }
    const alreadyFollowing = this.isFollowing(followerId, followingId);
    if (alreadyFollowing) {
      return false; // Already following
    }
    this.relations.push({ followerId, followingId });
    return true;
  }

  public unfollow(followerId: string, followingId: string) {
    const originalLen = this.relations.length;
    this.relations = this.relations.filter(
      r => !(r.followerId === followerId && r.followingId === followingId)
    );
    return this.relations.length < originalLen;
  }

  public isFollowing(followerId: string, followingId: string): boolean {
    return this.relations.some(r => r.followerId === followerId && r.followingId === followingId);
  }

  public getFollowingCount(userId: string): number {
    return this.relations.filter(r => r.followerId === userId).length;
  }

  public getFollowersCount(userId: string): number {
    return this.relations.filter(r => r.followingId === userId).length;
  }

  public isMutual(userA: string, userB: string): boolean {
    return this.isFollowing(userA, userB) && this.isFollowing(userB, userA);
  }

  public getRecommendations(userId: string, allUserIds: string[]): string[] {
    // Recommends users that the user is not following yet (limited to top recommendations)
    return allUserIds.filter(id => id !== userId && !this.isFollowing(userId, id));
  }
}

// 7. CONTENT MANAGEMENT SYSTEM (CMS)
export interface MockLesson {
  id: string;
  moduleId: string;
  title: string;
  videoUrl: string;
  isPublished: boolean;
  isArchived: boolean;
}

export interface MockQuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export class CmsManager {
  private lessons: MockLesson[] = [];
  private quizQuestions: MockQuizQuestion[] = [];

  public createLesson(lesson: Omit<MockLesson, "isPublished" | "isArchived">): MockLesson {
    if (!lesson.title || lesson.title.trim() === "") {
      throw new Error("O título da aula é obrigatório.");
    }
    const newLesson: MockLesson = {
      ...lesson,
      isPublished: false,
      isArchived: false
    };
    this.lessons.push(newLesson);
    return newLesson;
  }

  public addQuiz(question: MockQuizQuestion) {
    if (!this.lessons.some(l => l.id === question.lessonId)) {
      throw new Error("Aula associada inexistente.");
    }
    this.quizQuestions.push(question);
  }

  public publishLesson(lessonId: string) {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson) throw new Error("Aula não encontrada.");
    lesson.isPublished = true;
  }

  public archiveLesson(lessonId: string) {
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson) throw new Error("Aula não encontrada.");
    lesson.isArchived = true;
    lesson.isPublished = false;
  }

  public evaluateQuiz(lessonId: string, answers: { [key: string]: string }): { scorePercent: number; passed: boolean } {
    const questions = this.quizQuestions.filter(q => q.lessonId === lessonId);
    if (questions.length === 0) return { scorePercent: 100, passed: true };

    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercent = (correctCount / questions.length) * 100;
    return {
      scorePercent,
      passed: scorePercent >= 70 // Passing threshold is 70%
    };
  }

  public getLessonsForModule(moduleId: string) {
    return this.lessons.filter(l => l.moduleId === moduleId && !l.isArchived);
  }
}

// =========================================================================
// TEST SUITES
// =========================================================================

describe("JiuSpeak Battle Production Preparation Test Suite (FASE 1)", () => {

  describe("1. Login Engine Tests", () => {
    it("should hash and verify passwords correctly", async () => {
      const raw = "98922678aA";
      const hash = await LoginEngine.hashPassword(raw);
      expect(LoginEngine.verifyPassword(raw, hash)).toBe(true);
      expect(LoginEngine.verifyPassword("wrongpass", hash)).toBe(false);
    });

    it("should reject passwords that are too short", async () => {
      await expect(LoginEngine.hashPassword("123")).rejects.toThrowError("Password must be at least 6 characters.");
    });

    it("should validate safe and proper email expressions", () => {
      expect(LoginEngine.validateEmail("atleta@jiuspeak.com")).toBe(true);
      expect(LoginEngine.validateEmail("invalid-email")).toBe(false);
    });

    it("should execute successful login processing", async () => {
      const passwordHash = await LoginEngine.hashPassword("98922678aA");
      const testUser: MockUserEntity = {
        id: "usr_athlete_1",
        email: "carlos@jiuspeak.com",
        passwordHash,
        name: "Carlos Gracie Jr",
        role: "USER",
        belt: "Marrom",
        isVerified: true,
        jiuTicketsBalance: 500
      };

      const result = LoginEngine.processLogin(testUser, "98922678aA");
      expect(result.success).toBe(true);
      expect(result.userPayload.role).toBe("USER");
    });

    it("should throw error on incorrect credentials", async () => {
      const passwordHash = await LoginEngine.hashPassword("98922678aA");
      const testUser: MockUserEntity = {
        id: "usr_athlete_1",
        email: "carlos@jiuspeak.com",
        passwordHash,
        name: "Carlos Gracie Jr",
        role: "USER",
        belt: "Marrom",
        isVerified: true,
        jiuTicketsBalance: 500
      };

      expect(() => LoginEngine.processLogin(testUser, "wrongSecret")).toThrowError("Credenciais inválidas de acesso.");
    });

    it("should check unverified teacher login restriction", async () => {
      const passwordHash = await LoginEngine.hashPassword("98922678aA");
      const pendingInstructor: MockUserEntity = {
        id: "inst_new",
        email: "instructor@jiuspeak.com",
        passwordHash,
        name: "Professor Desconhecido",
        role: "TEACHER",
        belt: "Preto",
        isVerified: false,
        jiuTicketsBalance: 0
      };

      expect(() => LoginEngine.processLogin(pendingInstructor, "98922678aA")).toThrowError(
        "Conta de instrutor pendente de verificação cadastral."
      );
    });
  });

  describe("2. JWT Authentication and Token Tests", () => {
    const mockSecret = "super-hex-secret-jiuspeak-tatame-2026-battle-mode";

    it("should sign a valid JWT token", () => {
      const token = JwtEngine.sign(
        { userId: "usr_001", email: "atleta@corp.com", role: "USER" },
        mockSecret
      );
      expect(token).toBeDefined();
      expect(token).toContain("jwt_sig_with_");
    });

    it("should sign and verify valid token claims", () => {
      const claims = { userId: "usr_001", email: "atleta@corp.com", role: "USER" };
      const token = JwtEngine.sign(claims, mockSecret);
      const verified = JwtEngine.verify(token, mockSecret);

      expect(verified.userId).toBe("usr_001");
      expect(verified.role).toBe("USER");
      expect(verified.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it("should throw error on invalid signature", () => {
      const claims = { userId: "usr_001", email: "atleta@corp.com", role: "USER" };
      const token = JwtEngine.sign(claims, "differentSecret");
      expect(() => JwtEngine.verify(token, mockSecret)).toThrowError("Assinatura de token JWT inválida.");
    });

    it("should throw error on malformed tokens", () => {
      expect(() => JwtEngine.verify("no-dots-here", mockSecret)).toThrowError("Token malformado ou inválido.");
    });

    it("should throw error on expired token validation check", () => {
      const claims = { userId: "usr_001", email: "atleta@corp.com", role: "USER" };
      // Expire immediately 
      const token = JwtEngine.sign(claims, mockSecret, -10);
      expect(() => JwtEngine.verify(token, mockSecret)).toThrowError("Token JWT expirado. Faça login novamente.");
    });
  });

  describe("3. Mercado Pago Payment Gateway Tests", () => {
    const mockAccessToken = "APP_USR-789312984-ACCESS-TOKEN";

    it("should successfully generate payment preference structure", () => {
      const prefInput: MercadoPagoPreferenceInput = {
        productId: "prod_pack_bjj_elite",
        title: "Kit Faixa Preta - 500 JiuTickets",
        quantity: 1,
        unitPriceBRL: 49.90,
        payerEmail: "atleta@combat.com",
        externalReference: "BATTLE_PAY_982"
      };

      const result = MercadoPagoMockService.createPreference(prefInput, mockAccessToken);
      expect(result.id).toBeDefined();
      expect(result.external_reference).toBe("BATTLE_PAY_982");
      expect(result.sandbox_mode).toBe(true);
    });

    it("should enforce BRL minimum prices limits on MP preference creation", () => {
      const badInput: MercadoPagoPreferenceInput = {
        productId: "prod_free",
        title: "Free Pack",
        quantity: 1,
        unitPriceBRL: -5.00,
        payerEmail: "scammer@combat.com",
        externalReference: "SCAM"
      };

      expect(() => MercadoPagoMockService.createPreference(badInput, mockAccessToken)).toThrowError(
        "Preço unitário em BRL deve ser estritamente positivo."
      );
    });

    it("should process authorized webhook notifications", () => {
      const webhookPayload = {
        action: "payment.created",
        data: { id: "9823102" },
        status: "approved",
        external_reference: "BATTLE_PAY_982",
        transaction_amount: 49.90
      };

      const parsed = MercadoPagoMockService.processWebhook(
        webhookPayload,
        "hash_web_secret_123",
        "web_secret_123"
      );

      expect(parsed.paymentId).toBe("9823102");
      expect(parsed.status).toBe("approved");
      expect(parsed.externalReference).toBe("BATTLE_PAY_982");
      expect(parsed.amountBRL).toBe(49.90);
    });

    it("should reject malicious or altered webhook signatures", () => {
      const webhookPayload = { action: "payment.created" };
      expect(() => MercadoPagoMockService.processWebhook(
        webhookPayload,
        "compromised_hash",
        "web_secret_123"
      )).toThrowError("Assinatura de Webhook Mercado Pago inválida.");
    });
  });

  describe("4. JiuTickets Ledger & Conversion System (JT)", () => {
    it("should convert BRL deposits to JiuTickets with 1:10 premium ratio", () => {
      expect(JiuTicketsLedger.convertBRLToJT(1.00)).toBe(10);
      expect(JiuTicketsLedger.convertBRLToJT(49.90)).toBe(499);
      expect(JiuTicketsLedger.convertBRLToJT(0)).toBe(0);
    });

    it("should execute accurate wallet deductions", () => {
      const user: MockUserEntity = {
        id: "usr_carlos",
        email: "carlos@gracie.com",
        passwordHash: "",
        name: "Carlos",
        role: "USER",
        belt: "Azul",
        isVerified: true,
        jiuTicketsBalance: 350
      };

      const updated = JiuTicketsLedger.deductTickets(user, 150);
      expect(updated.jiuTicketsBalance).toBe(200);
    });

    it("should block wallet deductions that would cause deficit overflow", () => {
      const user: MockUserEntity = {
        id: "usr_carlos",
        email: "carlos@gracie.com",
        passwordHash: "",
        name: "Carlos",
        role: "USER",
        belt: "Azul",
        isVerified: true,
        jiuTicketsBalance: 50
      };

      expect(() => JiuTicketsLedger.deductTickets(user, 100)).toThrowError(
        "Saldo de JiuTickets insuficiente. Necessita: 100, Possui: 50"
      );
    });

    it("should block non-positive wallet change increments or decrements", () => {
      const user: MockUserEntity = {
        id: "usr_carlos",
        email: "carlos@gracie.com",
        passwordHash: "",
        name: "Carlos",
        role: "USER",
        belt: "Azul",
        isVerified: true,
        jiuTicketsBalance: 100
      };

      expect(() => JiuTicketsLedger.deductTickets(user, -20)).toThrowError(
        "Quantidade de JiuTickets para debitar deve ser positiva."
      );
      expect(() => JiuTicketsLedger.addTickets(user, 0)).toThrowError(
        "Quantidade de JiuTickets para creditar deve ser positiva."
      );
    });
  });

  describe("5. Marketplace & Safe Escrow Lock Engine", () => {
    const conversionRate = 0.10; // 1 JT = R$ 0.10
    const commissionPct = 20;    // 20% commission on items

    it("should complete marketplace purchase and generate escrow transaction", () => {
      const buyer: MockUserEntity = {
        id: "usr_buyer_carlos",
        email: "buyer@jiuspeak.com",
        passwordHash: "",
        name: "Carlos Gracie Jr",
        role: "USER",
        belt: "Branco",
        isVerified: true,
        jiuTicketsBalance: 800
      };

      const item: MockMarketplaceItem = {
        id: "item_jiu_video_1",
        title: "Raspagem De La Riva de Elite",
        priceJT: 500,
        sellerId: "usr_seller_heloisa",
        status: "ACTIVE"
      };

      const { updatedBuyer, escrowTx } = MarketplaceEscrowEngine.purchaseItem(
        buyer,
        item,
        conversionRate,
        commissionPct
      );

      expect(updatedBuyer.jiuTicketsBalance).toBe(300); // 800 - 500
      expect(escrowTx.buyerId).toBe("usr_buyer_carlos");
      expect(escrowTx.sellerId).toBe("usr_seller_heloisa");
      expect(escrowTx.amountJT).toBe(500);
      expect(escrowTx.commissionBRL).toBe(10.00); // (500 * 0.10) * 0.20 = 50 * 0.20 = 10 BRL
      expect(escrowTx.sellerNetBRL).toBe(40.00);   // 50 - 10 = 40 BRL
      expect(escrowTx.status).toBe("LOCKED");
    });

    it("should block purchase if buyer has insufficient JiuTickets balance", () => {
      const brokeBuyer: MockUserEntity = {
        id: "usr_broke",
        email: "broke@combat.com",
        passwordHash: "",
        name: "Atleta Zerado",
        role: "USER",
        belt: "Branco",
        isVerified: true,
        jiuTicketsBalance: 100
      };

      const item: MockMarketplaceItem = {
        id: "item_expensive",
        title: "Mega Curso Triângulo Completo",
        priceJT: 1000,
        sellerId: "usr_teacher",
        status: "ACTIVE"
      };

      expect(() => MarketplaceEscrowEngine.purchaseItem(
        brokeBuyer,
        item,
        conversionRate,
        commissionPct
      )).toThrowError("Saldo de JiuTickets insuficiente.");
    });

    it("should release escrow funds to seller wallet on order completion", () => {
      const seller: MockUserEntity = {
        id: "usr_seller",
        email: "seller@jiuspeak.com",
        passwordHash: "",
        name: "Prof Wesley",
        role: "TEACHER",
        belt: "Preto",
        isVerified: true,
        jiuTicketsBalance: 0
      };

      const escrow: EscrowTransaction = {
        id: "escrow_temp_123",
        buyerId: "usr_buyer",
        sellerId: "usr_seller",
        itemId: "item_course_1",
        amountJT: 300,
        commissionBRL: 6.00,
        sellerNetBRL: 24.00,
        status: "LOCKED",
        createdAt: Date.now()
      };

      const { updatedSeller, completedEscrow } = MarketplaceEscrowEngine.releaseEscrow(escrow, seller);

      expect(updatedSeller.jiuTicketsBalance).toBe(300);
      expect(completedEscrow.status).toBe("RELEASED");
    });

    it("should block duplicate release of locking escrows", () => {
      const seller: MockUserEntity = {
        id: "usr_seller",
        email: "seller@jiuspeak.com",
        passwordHash: "",
        name: "Prof Wesley",
        role: "TEACHER",
        belt: "Preto",
        isVerified: true,
        jiuTicketsBalance: 300
      };

      const alreadyReleasedEscrow: EscrowTransaction = {
        id: "escrow_temp_123",
        buyerId: "usr_buyer",
        sellerId: "usr_seller",
        itemId: "item_course_1",
        amountJT: 300,
        commissionBRL: 6.00,
        sellerNetBRL: 24.00,
        status: "RELEASED",
        createdAt: Date.now()
      };

      expect(() => MarketplaceEscrowEngine.releaseEscrow(alreadyReleasedEscrow, seller)).toThrowError(
        "A transação de garantia já foi liberada ou reembolsada."
      );
    });
  });

  describe("6. Social Followers Management Network", () => {
    it("should enable users to follow other athletes and verify network counts", () => {
      const network = new SocialFollowNetwork();
      const me = "usr_bjj_warrior_1";
      const opponent = "usr_bjj_elite_champion";

      expect(network.isFollowing(me, opponent)).toBe(false);
      
      const success = network.follow(me, opponent);
      expect(success).toBe(true);
      expect(network.isFollowing(me, opponent)).toBe(true);

      expect(network.getFollowingCount(me)).toBe(1);
      expect(network.getFollowersCount(opponent)).toBe(1);
    });

    it("should accurately capture mutual friend/follower states", () => {
      const network = new SocialFollowNetwork();
      const me = "usr_me";
      const peer = "usr_peer";

      network.follow(me, peer);
      expect(network.isMutual(me, peer)).toBe(false);

      network.follow(peer, me);
      expect(network.isMutual(me, peer)).toBe(true);
    });

    it("should cleanly allow unfollowing and decrease appropriate counts", () => {
      const network = new SocialFollowNetwork();
      const me = "usr_me";
      const peer = "usr_peer";

      network.follow(me, peer);
      expect(network.getFollowingCount(me)).toBe(1);

      const unfollowed = network.unfollow(me, peer);
      expect(unfollowed).toBe(true);
      expect(network.getFollowingCount(me)).toBe(0);
      expect(network.getFollowersCount(peer)).toBe(0);
    });

    it("should prevent players from following their own identities", () => {
      const network = new SocialFollowNetwork();
      expect(() => network.follow("usr_me", "usr_me")).toThrowError("Você não pode seguir a si mesmo.");
    });
  });

  describe("7. CMS Course Technique Management and Quizzes", () => {
    it("should support the creation of custom técnica lessons on CMS", () => {
      const cms = new CmsManager();
      const les = cms.createLesson({
        id: "les_closed_guard_1",
        moduleId: "mod_guard_fechada",
        title: "Posture Control in Deep Closed Guard",
        videoUrl: "https://youtube.com/watch?v=closed_guard_posture"
      });

      expect(les.id).toBe("les_closed_guard_1");
      expect(les.isPublished).toBe(false);
      expect(les.isArchived).toBe(false);
    });

    it("should publish techniques and fetch them filtered safely by module", () => {
      const cms = new CmsManager();
      cms.createLesson({
        id: "les_1",
        moduleId: "mod_1",
        title: "Armbar Setup",
        videoUrl: "https://youtube.com"
      });
      cms.createLesson({
        id: "les_2",
        moduleId: "mod_1",
        title: "Choke Finish",
        videoUrl: "https://youtube.com"
      });

      cms.publishLesson("les_1");
      
      const moduleLessons = cms.getLessonsForModule("mod_1");
      expect(moduleLessons.length).toBe(2);
      expect(moduleLessons.find(l => l.id === "les_1")?.isPublished).toBe(true);
    });

    it("should evaluate interactive technique quizzes accurately", () => {
      const cms = new CmsManager();
      cms.createLesson({
        id: "les_1",
        moduleId: "mod_1",
        title: "Single Leg",
        videoUrl: "https://youtube.com"
      });

      cms.addQuiz({
        id: "q1",
        lessonId: "les_1",
        question: "Qual o principal erro na postura do Single Leg?",
        options: ["Deixar a cabeça baixa", "Manter a coluna reta", "Colar o quadril"],
        correctAnswer: "Deixar a cabeça baixa"
      });

      cms.addQuiz({
        id: "q2",
        lessonId: "les_1",
        question: "Qual o ponto de pressão mecânica principal?",
        options: ["Sola do pé", "Ombro no quadril do oponente", "Cotovelo solto"],
        correctAnswer: "Ombro no quadril do oponente"
      });

      // Pass scenario: All correct (100%)
      const resultPass = cms.evaluateQuiz("les_1", {
        "q1": "Deixar a cabeça baixa",
        "q2": "Ombro no quadril do oponente"
      });
      expect(resultPass.scorePercent).toBe(100);
      expect(resultPass.passed).toBe(true);

      // Fail scenario: Partial correct (50% < 70% passing threshold)
      const resultFail = cms.evaluateQuiz("les_1", {
        "q1": "Deixar a cabeça baixa",
        "q2": "Cotovelo solto"
      });
      expect(resultFail.scorePercent).toBe(50);
      expect(resultFail.passed).toBe(false);
    });
  });
});
