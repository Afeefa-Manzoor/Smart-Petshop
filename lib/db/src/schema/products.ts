import {
  pgTable,
  text,
  serial,
  integer,
  numeric,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  petType: text("pet_type").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  description: text("description").notNull(),
  image: text("image").notNull(),
  weight: text("weight").notNull(),
  expiryDate: text("expiry_date").notNull(),
  popular: boolean("popular").notNull().default(false),
  breed: text("breed"),
  ageGroup: text("age_group"),
  healthCondition: text("health_condition"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Product = typeof productsTable.$inferSelect;
