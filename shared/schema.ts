import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, unique, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth (REQUIRED)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with role-based access (Replit Auth compatible)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Additional fields for real estate marketplace
  role: varchar("role", { enum: ["buyer", "seller", "agent", "admin"] }).notNull().default("buyer"),
  phone: varchar("phone"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table for real estate listings
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }).notNull(),
  squareFootage: integer("square_footage").notNull(),
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built"),
  parkingSpaces: integer("parking_spaces").default(0),
  propertyType: text("property_type").notNull(), // house, condo, townhouse, apartment, land
  status: text("status").notNull().default("for-sale"), // for-sale, for-rent, sold, pending
  images: text("images").array(), // Array of image URLs
  features: text("features").array(), // Array of feature strings
  agentId: varchar("agent_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages for communication between users and agents
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  subject: text("subject"),
  message: text("message").notNull(),
  inquiryType: text("inquiry_type").default("general"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites for users to save properties
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Unique constraint to prevent duplicate favorites
  uniqueUserProperty: unique().on(table.userId, table.propertyId),
}));

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
  favorites: many(favorites),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(users, {
    fields: [properties.agentId],
    references: [users.id],
  }),
  messages: many(messages),
  favorites: many(favorites),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  property: one(properties, {
    fields: [messages.propertyId],
    references: [properties.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));

// Zod schemas for validation

// Replit Auth compatible schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
}).extend({
  role: z.enum(["buyer", "seller", "agent", "admin"]).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  agentId: true,
}).extend({
  // Allow string inputs from forms and convert to numbers
  price: z.union([z.number(), z.string()]).transform((val) => typeof val === 'string' ? parseFloat(val) : val),
  bedrooms: z.union([z.number(), z.string()]).transform((val) => typeof val === 'string' ? parseInt(val) : val),
  bathrooms: z.union([z.number(), z.string()]).transform((val) => typeof val === 'string' ? parseFloat(val) : val),
  squareFootage: z.union([z.number(), z.string()]).transform((val) => typeof val === 'string' ? parseInt(val) : val),
  lotSize: z.union([z.string(), z.undefined()]).transform((val) => {
    if (val === undefined || val === '') return undefined;
    return val;
  }).optional(),
  yearBuilt: z.union([z.number(), z.string(), z.undefined()]).transform((val) => {
    if (val === undefined || val === '') return undefined;
    return typeof val === 'string' ? parseInt(val) : val;
  }).optional(),
  parkingSpaces: z.union([z.number(), z.string(), z.undefined()]).transform((val) => {
    if (val === undefined || val === '') return undefined;
    return typeof val === 'string' ? parseInt(val) : val;
  }).optional(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  agentId: z.string().optional(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

// Type exports for Replit Auth compatibility
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>; // Required for Replit Auth
export type InsertUser = Omit<typeof users.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>; // For manual user creation if needed
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;