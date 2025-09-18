import { 
  users, 
  properties, 
  messages, 
  favorites,
  type User, 
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Message,
  type InsertMessage,
  type Favorite,
  type InsertFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, desc, asc } from "drizzle-orm";

// Storage interface for all real estate marketplace operations
export interface IStorage {
  // User operations (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;

  // Property operations
  getProperty(id: string): Promise<Property | undefined>;
  getProperties(filters?: PropertyFilters): Promise<Property[]>;
  getPropertiesByAgent(agentId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;

  // Message operations
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByProperty(propertyId: string): Promise<Message[]>;
  getMessagesBetweenUsers(senderId: string, recipientId: string): Promise<Message[]>;
  getMessagesForUser(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;
  deleteMessage(id: string): Promise<boolean>;

  // Favorite operations
  getFavorite(userId: string, propertyId: string): Promise<Favorite | undefined>;
  getFavoritesByUser(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, propertyId: string): Promise<boolean>;
}

export interface PropertyFilters {
  status?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  location?: string;
  agentId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'bedrooms' | 'squareFootage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property operations
  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
    // Simple implementation for now - we'll enhance filtering later
    const result = await db
      .select()
      .from(properties)
      .orderBy(desc(properties.createdAt))
      .limit(filters.limit || 50);
    
    return result;
  }

  async getPropertiesByAgent(agentId: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(eq(properties.agentId, agentId))
      .orderBy(desc(properties.createdAt));
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(insertProperty)
      .returning();
    return property;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return property || undefined;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db
      .delete(properties)
      .where(eq(properties.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Message operations
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByProperty(propertyId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.propertyId, propertyId))
      .orderBy(desc(messages.createdAt));
  }

  async getMessagesBetweenUsers(senderId: string, recipientId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.recipientId, recipientId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.recipientId, userId))
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Favorite operations
  async getFavorite(userId: string, propertyId: string): Promise<Favorite | undefined> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      );
    return favorite || undefined;
  }

  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Use ON CONFLICT DO NOTHING to handle duplicate favorites gracefully
    const [favorite] = await db
      .insert(favorites)
      .values(insertFavorite)
      .onConflictDoNothing()
      .returning();
    
    // If no favorite was returned (due to conflict), fetch the existing one
    if (!favorite) {
      const existing = await this.getFavorite(insertFavorite.userId, insertFavorite.propertyId);
      if (existing) {
        return existing;
      }
      throw new Error('Failed to add favorite');
    }
    
    return favorite;
  }

  async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.propertyId, propertyId)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db
      .delete(messages)
      .where(eq(messages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

}

export const storage = new DatabaseStorage();