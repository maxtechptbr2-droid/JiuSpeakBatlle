/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Middleware to authorize specific Roles
export const requireRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        error: "Forbidden. Higher privilege role needed to execute this action.",
      });
    }
    const userRole = String(req.user.role).toUpperCase();
    const authorized = allowedRoles.some(role => {
      const target = String(role).toUpperCase();
      // Match general ADMIN roles
      if (target === "ADMIN" && (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "DEVELOPER")) {
        return true;
      }
      return target === userRole;
    });

    if (!authorized) {
      return res.status(403).json({
        error: "Forbidden. Higher privilege role needed to execute this action.",
      });
    }
    next();
  };
};
