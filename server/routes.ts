import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Ensure password is never returned in API responses
      if (user) {
        const { ...safeUser } = user;
        res.json(safeUser);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile (protected route)
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      // Validate input data
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ message: "Invalid input data" });
      }
      
      // Only allow updating certain fields (role changes require admin approval)
      const allowedFields = ['phone', 'bio'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          // Basic validation
          if (typeof updates[key] === 'string' || updates[key] === null) {
            obj[key] = updates[key];
          }
          return obj;
        }, {});

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updatedUser = await storage.upsertUser({
        id: userId,
        ...filteredUpdates,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // TODO: Add property routes
  // TODO: Add message routes
  // TODO: Add favorite routes

  const httpServer = createServer(app);

  return httpServer;
}
