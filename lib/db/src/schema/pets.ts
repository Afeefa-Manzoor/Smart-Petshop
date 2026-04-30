import {
  pgTable,
  text,
  serial,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

export const petsTable = pgTable("pets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  breed: text("breed").notNull(),
  ageYears: numeric("age_years", { precision: 4, scale: 1 }).notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
  healthNotes: text("health_notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Pet = typeof petsTable.$inferSelect;
