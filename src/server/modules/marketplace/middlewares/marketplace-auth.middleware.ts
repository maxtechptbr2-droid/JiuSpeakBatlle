import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../../../../../server/authService";
import { prisma } from "../../../../../server/db";
import { teacherService } from "../services/teacher.service";

export interface AuthenticatedMarketplaceRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  isTeacher?: boolean;
  teacherProfile?: any;
}

export const authenticateMarketplaceToken = async (
  req: AuthenticatedMarketplaceRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    token = req.cookies?.["accessToken"] || req.cookies?.["token"];
  }

  if (!token) {
    return res.status(401).json({ error: "Token de acesso ausente. Por favor, autentique-se primeiro." });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Token inválido." });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário do token não localizado." });
    }

    if ((user as any).isBanned) {
      return res.status(403).json({ error: "Conta de usuário banida." });
    }

    if ((user as any).isSuspended) {
      return res.status(403).json({ error: "Conta de usuário suspensa temporariamente." });
    }

    req.user = {
      id: user.id,
      name: user.name || "Sem Nome",
      email: user.email,
      role: user.role
    };

    next();
  } catch (err: any) {
    console.error("[MARKETPLACE AUTH CORRUPT] JWT verify failed:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token de autenticação expirado." });
    }
    return res.status(401).json({ error: "Autenticação falhou: token inválido." });
  }
};

export const requireBuyer = (req: AuthenticatedMarketplaceRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Acesso de comprador: Autenticação obrigatória." });
  }
  next();
};

export const requireTeacher = async (req: AuthenticatedMarketplaceRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Acesso de professor: Autenticação obrigatória." });
  }

  try {
    const profile = await teacherService.getProfileByUserId(req.user.id);
    if (!profile || !profile.approved) {
      return res.status(403).json({
        error: "Acesso negado. Requer perfil de Professor aprovado e ativo para prosseguir."
      });
    }

    req.isTeacher = true;
    req.teacherProfile = profile;
    next();
  } catch (err) {
    console.error("Erro no middleware requireTeacher:", err);
    return res.status(500).json({ error: "Erro de validação do perfil do professor." });
  }
};

export const requireAdmin = (req: AuthenticatedMarketplaceRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Acesso de gestão: Autenticação obrigatória." });
  }

  const role = String(req.user.role).toUpperCase();
  if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "DEVELOPER") {
    return res.status(403).json({
      error: "Acesso negado. Apenas administradores do Tatame Conectado possuem privilégios."
    });
  }

  next();
};
