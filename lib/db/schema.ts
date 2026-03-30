import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  productId: integer("product_id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  owner: text("owner").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const productVotes = sqliteTable("product_votes", {
  productId: integer("product_id").notNull(),
  voter: text("voter").notNull(),
  voted: integer("voted", { mode: "boolean" }).notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const productComments = sqliteTable("product_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  author: text("author").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at").notNull(),
});

export type ProductInsert = typeof products.$inferInsert;
export type ProductSelect = typeof products.$inferSelect;
