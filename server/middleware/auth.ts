/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../authService";
import { authStore } from "../authStore";
import { isDatabaseConnected } from "../db";

let getActiveSubscriptionForUserFn: ((userId: string) => Promise<any>) | null = null;
let inMemoryUserInventoriesMap: Map<string, string[]> | null = null;

/**
 * Registers helpers from server.ts to avoid circular dependencies
 */
export function registerAuthHelpers(
  subscriptionFn: (userId: string) => Promise<any>,
  inventoriesMap: Map<string, string[]>
) {
  getActiveSubscriptionForUserFn = subscriptionFn;
  inMemoryUserInventoriesMap = inventoriesMap;
}

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    token = req.cookies?.["accessToken"] || req.cookies?.["token"];
  }

  if (!token) {
    console.error("[AUTH FAILURE] Erro de autenticação: cabeçalho Bearer Token ou cookie accessToken ausente.");
    return res.status(401).json({ error: "Access token missing. Please authenticate." });
  }

  jwt.verify(token, JWT_ACCESS_SECRET, async (err: any, decoded: any) => {
    if (err) {
      console.error(`[AUTH FAILURE] Falha ao verificar token JWT. Erro: ${err.message}, Token substring: ${token.substring(0, 15)}...`);
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(401).json({ error: "Token expirado ou inválido" });
    }

    try {
      const user = await authStore.findById(decoded.userId);
      if (!user) {
        console.error(`[AUTH FAILURE] Usuário ID ${decoded.userId} extraído do token JWT não foi localizado.`);
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      if (user.isBanned) {
        console.error(`[AUTH FAILURE] Usuário ID ${decoded.userId} banido tentou requisitar recurso autêntico.`);
        return res.status(403).json({ error: "Conta bloqueada" });
      }
      if (user.isSuspended) {
        console.error(`[AUTH FAILURE] Usuário ID ${decoded.userId} suspenso tentou requisitar recurso autêntico.`);
        return res.status(403).json({ error: "Conta suspensa" });
      }
      if (user.deletedAt) {
        console.error(`[AUTH FAILURE] Usuário ID ${decoded.userId} excluído tentou requisitar recurso autêntico.`);
        return res.status(403).json({ error: "Esta conta foi excluída" });
      }

      try {
        if (getActiveSubscriptionForUserFn) {
          const userSubscription = await getActiveSubscriptionForUserFn(decoded.userId);
          (user as any).subscription = userSubscription;
        } else {
          (user as any).subscription = { type: "FREE", priceBRL: 0, autoRenew: false };
        }
      } catch (subErr) {
        console.warn("Could not attach user subscription in auth middleware:", subErr);
        (user as any).subscription = { type: "FREE", priceBRL: 0, autoRenew: false };
      }

      // Inject marketplace inventory tracking
      if (user && user.id) {
        const invMap = inMemoryUserInventoriesMap;
        if (invMap) {
          if (!invMap.get(user.id)) {
            invMap.set(user.id, ["item_purple_belt", "item_armor_badge"]);
          }
          (user as any).inventory = invMap.get(user.id) || [];
        } else {
          (user as any).inventory = ["item_purple_belt", "item_armor_badge"];
        }
        if ((user as any).coins === undefined) {
          (user as any).coins = 600;
        }
      }

      req.user = user;
      console.log("[AUTH TOKEN req.user KEYS]", Object.keys(req.user), "COUNT:", Object.keys(req.user).length);
      next();
    } catch (dbErr: any) {
      console.error("[AUTH FAILURE] Erro crítico de comunicação com o Postgres/Prisma durante autenticação de rotas:", dbErr);
      const isDbErr = isDatabaseConnected() && (dbErr.message?.includes("connect") || dbErr.message?.includes("database") || dbErr.message?.includes("Prisma") || dbErr.message?.includes("Postgres") || dbErr.message?.includes("Can't reach database"));
      if (isDbErr) {
        return res.status(503).json({ error: "Banco indisponível" });
      }
      return res.status(500).json({ error: "Internal server error." });
    }
  });
};
