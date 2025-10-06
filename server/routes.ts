import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { requireAgent, requireSeller } from "./middleware";
import { insertPropertySchema, insertMessageSchema, insertFavoriteSchema } from "@shared/schema";

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

  // Property routes
  app.get('/api/properties', async (req, res) => {
    try {
      const {
        status,
        propertyType,
        minPrice,
        maxPrice,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        location,
        agentId,
        limit = '50',
        offset = '0',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filters = {
        status: status as string,
        propertyType: propertyType as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minBedrooms: minBedrooms ? parseInt(minBedrooms as string) : undefined,
        maxBedrooms: maxBedrooms ? parseInt(maxBedrooms as string) : undefined,
        minBathrooms: minBathrooms ? parseFloat(minBathrooms as string) : undefined,
        maxBathrooms: maxBathrooms ? parseFloat(maxBathrooms as string) : undefined,
        location: location as string,
        agentId: agentId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sortBy: sortBy as 'price' | 'bedrooms' | 'squareFootage' | 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ message: 'Failed to fetch properties' });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({ message: 'Failed to fetch property' });
    }
  });

  app.get('/api/properties/agent/:agentId', async (req, res) => {
    try {
      const properties = await storage.getPropertiesByAgent(req.params.agentId);
      res.json(properties);
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      res.status(500).json({ message: 'Failed to fetch agent properties' });
    }
  });

  app.post('/api/properties', isAuthenticated, requireSeller, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'agent' && user.role !== 'seller')) {
        return res.status(403).json({ message: 'Only agents and sellers can create properties' });
      }

      console.log('Received property data:', JSON.stringify(req.body, null, 2));
      const validationResult = insertPropertySchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error('Validation errors:', JSON.stringify(validationResult.error.errors, null, 2));
        return res.status(400).json({ 
          message: 'Invalid property data', 
          errors: validationResult.error.errors 
        });
      }

      const propertyData = {
        ...validationResult.data,
        agentId: userId
      };

      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({ message: 'Failed to create property' });
    }
  });

  app.put('/api/properties/:id', isAuthenticated, requireSeller, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const property = await storage.getProperty(req.params.id);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      if (property.agentId !== userId) {
        return res.status(403).json({ message: 'You can only edit your own properties' });
      }

      const validationResult = insertPropertySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid property data', 
          errors: validationResult.error.errors 
        });
      }

      const updatedProperty = await storage.updateProperty(req.params.id, validationResult.data);
      if (!updatedProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      res.json(updatedProperty);
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({ message: 'Failed to update property' });
    }
  });

  app.delete('/api/properties/:id', isAuthenticated, requireSeller, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const property = await storage.getProperty(req.params.id);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      if (property.agentId !== userId) {
        return res.status(403).json({ message: 'You can only delete your own properties' });
      }

      const deleted = await storage.deleteProperty(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({ message: 'Failed to delete property' });
    }
  });

  // Message routes
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getMessagesForUser(userId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.get('/api/messages/property/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const property = await storage.getProperty(req.params.propertyId);
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Only allow property owner or involved users to see messages
      const messages = await storage.getMessagesByProperty(req.params.propertyId);
      const userMessages = messages.filter(msg => 
        msg.senderId === userId || msg.recipientId === userId || property.agentId === userId
      );
      
      res.json(userMessages);
    } catch (error) {
      console.error('Error fetching property messages:', error);
      res.status(500).json({ message: 'Failed to fetch property messages' });
    }
  });

  app.get('/api/messages/conversation/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getMessagesBetweenUsers(userId, req.params.otherUserId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ message: 'Failed to fetch conversation' });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validationResult = insertMessageSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid message data', 
          errors: validationResult.error.errors 
        });
      }

      const messageData = {
        ...validationResult.data,
        senderId: userId
      };

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ message: 'Failed to create message' });
    }
  });

  app.patch('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const message = await storage.getMessage(req.params.id);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      if (message.recipientId !== userId) {
        return res.status(403).json({ message: 'You can only mark your own messages as read' });
      }

      const marked = await storage.markMessageAsRead(req.params.id);
      if (!marked) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ message: 'Failed to mark message as read' });
    }
  });

  // Favorite routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validationResult = insertFavoriteSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid favorite data', 
          errors: validationResult.error.errors 
        });
      }

      const favoriteData = {
        ...validationResult.data,
        userId
      };

      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ message: 'Failed to add favorite' });
    }
  });

  app.delete('/api/favorites/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const removed = await storage.removeFavorite(userId, req.params.propertyId);
      
      if (!removed) {
        return res.status(404).json({ message: 'Favorite not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ message: 'Failed to remove favorite' });
    }
  });

  app.get('/api/favorites/check/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorite = await storage.getFavorite(userId, req.params.propertyId);
      res.json({ isFavorite: !!favorite });
    } catch (error) {
      console.error('Error checking favorite status:', error);
      res.status(500).json({ message: 'Failed to check favorite status' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
