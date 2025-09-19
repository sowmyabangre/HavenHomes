// Authorization middleware for role-based access control
import type { RequestHandler } from "express";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

export const requireRole = (allowedRoles: string[]): RequestHandler => {
  return async (req: any, res, next) => {
    // First ensure user is authenticated
    isAuthenticated(req, res, async (authErr) => {
      if (authErr) return;
      
      try {
        // Fetch user role from database (not from claims)
        const userId = req.user.claims.sub;
        const dbUser = await storage.getUser(userId);
        const userRole = dbUser?.role || 'buyer';
        
        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({ 
            message: "Insufficient permissions",
            required: allowedRoles,
            current: userRole 
          });
        }
        
        next();
      } catch (error) {
        console.error("Error checking user role:", error);
        res.status(500).json({ message: "Authorization check failed" });
      }
    });
  };
};

export const requireAgent = requireRole(['agent']);
export const requireSeller = requireRole(['seller', 'agent']);
export const requireAdmin = requireRole(['admin']);