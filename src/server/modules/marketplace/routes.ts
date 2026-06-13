import { Router } from "express";
import { teacherController } from "./controllers/teacher.controller";
import { productController } from "./controllers/product.controller";
import { purchaseController } from "./controllers/purchase.controller";
import { settingsController } from "./controllers/settings.controller";
import { dashboardController } from "./controllers/dashboard.controller";
import {
  authenticateMarketplaceToken,
  requireAdmin,
  requireTeacher,
  requireBuyer
} from "./middlewares/marketplace-auth.middleware";

import { teacherService } from "./services/teacher.service";
import { purchaseService } from "./services/purchase.service";
import { prisma } from "../../../../server/db";

const router = Router();

// ==========================================
// SWAGGER & API DOCUMENTATION ENDPOINTS
// ==========================================
router.get("/swagger.json", (req, res) => {
  res.json({
    openapi: "3.0.3",
    info: {
      title: "Tatame Conectado - Jiu-Jitsu Teacher & Course Marketplace",
      description: "Especificação OpenAPI completa de todos os endpoints REST do Marketplace, incluindo perfis de professores, faturamento, escrows e mídias de aulas.",
      version: "1.0.0",
      contact: {
        name: "Suporte JiuSpeak",
        email: "suporte@jiuspeak.com.br"
      }
    },
    servers: [
      {
        url: "/api/marketplace",
        description: "Servidor Principal do Marketplace"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    paths: {
      "/teacher/apply": {
        post: {
          summary: "Inscrever-se Candidato a Professor",
          description: "Submete uma nova ficha de inscrição de professor de Jiu-Jitsu, anexando diplomas ou comprovantes curriculares.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["bio", "academy", "experience"],
                  properties: {
                    bio: { type: "string", minLength: 10, maxLength: 1000 },
                    academy: { type: "string", minLength: 3 },
                    experience: { type: "string", minLength: 10 },
                    documents: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["documentType", "fileUrl"],
                        properties: {
                          documentType: { type: "string" },
                          fileUrl: { type: "string", format: "uri" },
                          fileName: { type: "string" },
                          fileSize: { type: "integer" }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "Inscrição enviada com sucesso para verificação." },
            "400": { description: "Erro de validação ou candidato já ativo como professor." },
            "401": { description: "Não autorizado." }
          }
        }
      },
      "/teacher/applications": {
        get: {
          summary: "Listar Inscrições de Professor (Escopado ou Geral)",
          description: "Retorna a fila de inscrições. Se acessado por um usuário comum, mostra apenas as suas próprias inscrições. Se acessado por Admin, lista todas de forma administrativa.",
          parameters: [
            { name: "status", in: "query", schema: { type: "string" }, required: false },
            { name: "page", in: "query", schema: { type: "integer", default: 1 }, required: false },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 }, required: false }
          ],
          responses: {
            "200": { description: "Lista de inscrições retornada com sucesso." },
            "401": { description: "Não autorizado." }
          }
        }
      },
      "/admin/applications/{id}": {
        put: {
          summary: "Julgar Inscrição de Professor (Aprovar / Rejeitar)",
          description: "Aprova ou rejeita uma candidatura pendente de professor, atualizando automaticamente sua carteira e perfil ativo de instrutor.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["APPROVED", "REJECTED"] },
                    adminNotes: { type: "string", maxLength: 500 }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Julgamento processado e emitido na fila do sistema." },
            "400": { description: "Parâmetros inválidos." },
            "401": { description: "Acesso administrativo negado." }
          }
        }
      },
      "/teacher/products": {
        post: {
          summary: "Criar Rascunho / Draft do Produto",
          description: "Cria uma nova listagem de curso ou material técnico de Jiu-Jitsu em modo de rascunho temporário do professor.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "description", "priceJT", "type", "categoryId"],
                  properties: {
                    title: { type: "string", minLength: 3, maxLength: 255 },
                    description: { type: "string", minLength: 10 },
                    priceJT: { type: "integer", minimum: 0 },
                    type: { type: "string", enum: ["COURSE", "EBOOK", "SEMINAR"] },
                    categoryId: { type: "string", format: "uuid" },
                    lessons: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["title", "orderIndex"],
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                          videoUrl: { type: "string", format: "uri" },
                          orderIndex: { type: "integer" }
                        }
                      }
                    },
                    files: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["name", "fileUrl"],
                        properties: {
                          name: { type: "string" },
                          fileUrl: { type: "string", format: "uri" },
                          fileSize: { type: "integer" }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "Rascunho criado com sucesso." },
            "401": { description: "Acesso apenas para professores." }
          }
        }
      },
      "/teacher/products/{id}": {
        put: {
          summary: "Atualizar Rascunho do Produto",
          description: "Modifica as propriedades técnicas, lições, ou vídeos associados ao rascunho de produto do marketplace.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    priceJT: { type: "integer" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Produto atualizado com sucesso." }
          }
        }
      },
      "/teacher/products/{id}/review": {
        post: {
          summary: "Submeter Produto para Revisão Geral",
          description: "Despacha o rascunho preenchido para a fila de análise de consistência e conformidade do JiuSpeak.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            "200": { description: "Submetido com sucesso. Status alterado para PENDING_REVIEW." }
          }
        }
      },
      "/store/products": {
        get: {
          summary: "Vitrine: Buscar Produtos Aprovados",
          description: "Permite que alunos e visitantes filtrem a vitrine de cursos pelo título, categoria, tipo ou busca textual.",
          parameters: [
            { name: "categoryId", in: "query", schema: { type: "string" }, required: false },
            { name: "type", in: "query", schema: { type: "string" }, required: false },
            { name: "search", in: "query", schema: { type: "string" }, required: false },
            { name: "page", in: "query", schema: { type: "integer", default: 1 }, required: false },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 }, required: false }
          ],
          responses: {
            "200": { description: "Lista de produtos na vitrine retornada com sucesso." }
          }
        }
      },
      "/store/products/{id}": {
        get: {
          summary: "Vitrine: Detalhes do Produto",
          description: "Exibe a ementa de aulas, o professor responsável, as estatísticas, as avaliações de estrelas e o preço do produto.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            "200": { description: "Ementa estruturada e dados gerais do produto." }
          }
        }
      },
      "/store/purchase/{id}": {
        post: {
          summary: "Adquirir Produto com Moedas Virtuais",
          description: "Realiza a adjudicação e transferência de saldo em moedas do comprador para o sistema na forma de garantia de escrow de carência anti-fraude.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ipAddress: { type: "string" },
                    fingerprint: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "Matrícula autorizada de forma transacional e balance disponível descontado." },
            "400": { description: "Saldo em moedas insuficiente ou erro transacional." }
          }
        }
      },
      "/store/review/{id}": {
        post: {
          summary: "Avaliar / Dar Nota ao Curso Adquirido",
          description: "Submete ou atualiza uma nota de 1 a 5 estrelas e comentário crítico sobre o curso.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rating"],
                  properties: {
                    rating: { type: "integer", minimum: 1, maximum: 5 },
                    comment: { type: "string", maxLength: 1000 }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Avaliação homologada com sucesso." }
          }
        }
      },
      "/admin/products/pending": {
        get: {
          summary: "Fila de Produtos Pendentes para Análise",
          description: "Exibe todos os produtos pendentes de revisão técnica pelos administradores da plataforma.",
          responses: {
            "200": { description: "Lista de cursos na fila de triagem técnica." }
          }
        }
      },
      "/admin/products/{id}/judge": {
        post: {
          summary: "Julgamento de Produto por Administrador",
          description: "Aprova, reprova ou requer revisão com anotações de adequação pedagógica ou direitos autorais.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["action"],
                  properties: {
                    action: { type: "string", enum: ["APPROVE", "REJECT", "REQUEST_REVISION"] },
                    notes: { type: "string", maxLength: 1000 }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Controle operacional registrado no histórico." }
          }
        }
      },
      "/admin/settings": {
        put: {
          summary: "Alterar Parâmetros Fiscais do Sistema",
          description: "Define taxas percentuais do marketplace, comissões de gateway Pix e tempos mínimos regulados de garantia do escrow.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    marketplaceCommissionRate: { type: "number" },
                    minimumEscrowDays: { type: "integer" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Configuração ajustada e historizada de modo auditável." }
          }
        }
      },
      "/teacher/dashboard": {
        get: {
          summary: "Painel de Métricas do Professor",
          description: "Retorna dados gerais consolidados do professor, incluindo alunos totais, notas médias recebidas, faturamento total e valores retidos sob escrow.",
          responses: {
            "200": { description: "Métricas consolidadas de vendas." }
          }
        }
      },
      "/teacher/financial/ledger": {
        get: {
          summary: "Extrato Ledger Financeiro das Vendas",
          description: "Histórico granular detalhado de todas as transações, contendo comissões e datas de liquidação dos escrows.",
          responses: {
            "200": { description: "Faturamento transacional detalhado e ordenado." }
          }
        }
      }
    }
  });
});

// ==========================================
// PUBLIC & BUYER PORTAL API ENDPOINTS
// ==========================================
// 1. apply to be a teacher
router.post(
  "/teacher/apply",
  authenticateMarketplaceToken,
  teacherController.apply
);

// 1.5. list applications (for individual self-tracking, or admin list query)
router.get(
  "/teacher/applications",
  authenticateMarketplaceToken,
  teacherController.getApplications
);

// 2. get specific user profile
router.get(
  "/teacher/profile",
  authenticateMarketplaceToken,
  async (req: any, res: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado." });
      }
      const prof = await teacherService.getProfileByUserId(req.user.id);
      return res.json(prof);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
);

// 3. active listing categories
router.get("/store/categories", productController.getCategories);

// 4. browse listed approved products
router.get("/store/products", productController.listApprovedProducts);

// 5. browse catalog product details
router.get("/store/products/:id", productController.getProductDetails);

// 6. acquire content using platform virtual coins (requires Buyer level)
router.post(
  "/store/purchase/:id",
  authenticateMarketplaceToken,
  requireBuyer,
  purchaseController.purchaseProduct
);

// 7. submit product evaluation ratings (requires Enrollment checking)
router.post(
  "/store/review/:productId",
  authenticateMarketplaceToken,
  requireBuyer,
  purchaseController.reviewProduct
);

// 7.5. alias matching store/review/:id exactly
router.post(
  "/store/review/:id",
  authenticateMarketplaceToken,
  requireBuyer,
  purchaseController.reviewProduct
);

// 8. fetch ratings listing for single product
router.get("/store/reviews/:productId", purchaseController.getProductReviews);

// 8.5. fetch ratings listing for single product with alias matching store/reviews/:id exactly
router.get("/store/reviews/:id", purchaseController.getProductReviews);


// ==========================================
// TEACHER (INSTRUCTOR) API ENDPOINTS (requireTeacher)
// ==========================================
// 9. create temporary draft version of a product
router.post(
  "/teacher/products",
  authenticateMarketplaceToken,
  requireTeacher,
  productController.createProduct
);

// 10. update content properties (might trigger conditional draft copies)
router.put(
  "/teacher/products/:id",
  authenticateMarketplaceToken,
  requireTeacher,
  productController.updateProduct
);

// 11. dispatch drafted course content for review analylists queue
router.post(
  "/teacher/products/:id/review",
  authenticateMarketplaceToken,
  requireTeacher,
  productController.submitForReview
);

// 12. archive and logically deprecate active/inactive products list
router.delete(
  "/teacher/products/:id",
  authenticateMarketplaceToken,
  requireTeacher,
  productController.archiveProduct
);

// 13. financial ledger metrics reporting
router.get(
  "/teacher/financial/ledger",
  authenticateMarketplaceToken,
  requireTeacher,
  purchaseController.getTeacherSalesLedger
);

// 14. general stats dashboard summary
router.get(
  "/teacher/dashboard",
  authenticateMarketplaceToken,
  requireTeacher,
  dashboardController.getTeacherMetrics
);


// ==========================================
// ADMINISTRATIVE STAFF (ADMIN) API ENDPOINTS (requireAdmin)
// ==========================================
// 15. get pending teacher candidate list
router.get(
  "/admin/applications",
  authenticateMarketplaceToken,
  requireAdmin,
  teacherController.getApplications
);

// 16. judge teacher applications (approve / reject)
router.put(
  "/admin/applications/:id",
  authenticateMarketplaceToken,
  requireAdmin,
  teacherController.judgeApplication
);

// 16.5. judge teacher uploaded verification document/credential
router.put(
  "/admin/documents/:documentId",
  authenticateMarketplaceToken,
  requireAdmin,
  teacherController.judgeDocument
);

// 17. view products analysis checklist queue
router.get(
  "/admin/products/pending",
  authenticateMarketplaceToken,
  requireAdmin,
  productController.getPendingProducts
);

// 18. approve / reject drafted products items listings
router.post(
  "/admin/products/:id/judge",
  authenticateMarketplaceToken,
  requireAdmin,
  productController.judgeProduct
);

// 19. update settings and conversion parameters
router.put(
  "/admin/settings",
  authenticateMarketplaceToken,
  requireAdmin,
  settingsController.updateSettings
);

// 20. read settings state details
router.get(
  "/admin/settings",
  authenticateMarketplaceToken,
  requireAdmin,
  settingsController.getSettings
);

// 21. fetch administrative revision change logs history
router.get(
  "/admin/settings/history",
  authenticateMarketplaceToken,
  requireAdmin,
  settingsController.getSettingsHistory
);

// 22. view admin dashboard general stats telemetry
router.get(
  "/admin/dashboard",
  authenticateMarketplaceToken,
  requireAdmin,
  dashboardController.getAdminMetrics
);

// 23. view and fetch physical JSON logs
router.get(
  "/admin/audit/logs",
  authenticateMarketplaceToken,
  requireAdmin,
  dashboardController.getAuditHistory
);

// 24. manually trigger fast escrow reconciliation for testing
router.post(
  "/admin/finance/reconcile",
  authenticateMarketplaceToken,
  requireAdmin,
  async (req: any, res: any) => {
    try {
      const count = await purchaseService.runPendingEscrowReconciliation();
      return res.json({
        message: `Conciliação de escrow executada manualmente com sucesso. Recursos liberados para ${count} faturas.`,
        releasedCount: count
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
);

// 25. get detailed lists of all purchases (finance details)
router.get(
  "/admin/finance/purchases",
  authenticateMarketplaceToken,
  requireAdmin,
  async (req: any, res: any) => {
    try {
      const purchases = await prisma.marketplacePurchase.findMany({
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              title: true,
              type: true,
              priceJT: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return res.json(purchases);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Erro ao obter transações de finanças." });
    }
  }
);

// 26. Admin Category modification endpoints (CRUD Categories)
router.post(
  "/admin/categories",
  authenticateMarketplaceToken,
  requireAdmin,
  async (req: any, res: any) => {
    try {
      const { name, slug, description } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: "Nome e slug são obrigatórios." });
      }
      const existing = await prisma.marketplaceCategory.findFirst({
        where: { OR: [{ name }, { slug }] }
      });
      if (existing) {
        return res.status(400).json({ error: "Já existe uma categoria cadastrada com este nome ou slug." });
      }
      const newCat = await prisma.marketplaceCategory.create({
        data: { name, slug, description, isActive: true }
      });
      return res.json({ success: true, message: "Categoria criada com sucesso.", category: newCat });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Erro ao criar categoria." });
    }
  }
);

router.put(
  "/admin/categories/:id",
  authenticateMarketplaceToken,
  requireAdmin,
  async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { name, slug, description, isActive } = req.body;
      const updatedCat = await prisma.marketplaceCategory.update({
        where: { id },
        data: { name, slug, description, isActive }
      });
      return res.json({ success: true, message: "Categoria atualizada com sucesso.", category: updatedCat });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Erro ao atualizar categoria." });
    }
  }
);

router.delete(
  "/admin/categories/:id",
  authenticateMarketplaceToken,
  requireAdmin,
  async (req: any, res: any) => {
    try {
      const { id } = req.params;
      // Soft-delete to preserve references
      const updatedCat = await prisma.marketplaceCategory.update({
        where: { id },
        data: { isActive: false }
      });
      return res.json({ success: true, message: "Categoria desativada com sucesso.", category: updatedCat });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Erro ao desativar categoria." });
    }
  }
);

export default router;
