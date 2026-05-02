import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { products } from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import seedData from "../../scripts/src/seed-products.json" assert { type: "json" };

const port = Number(process.env.PORT) || 8080;

async function seedIfEmpty() {
  try {
    const result = await db.execute(sql`SELECT COUNT(*) FROM products`);
    const count = Number((result.rows[0] as any).count);
    if (count === 0) {
      logger.info("Seeding products...");
      for (const p of seedData as any[]) {
        await db.insert(products).values(p).onConflictDoNothing();
      }
      logger.info("Seeded!");
    }
  } catch (err) {
    logger.error({ err }, "Seed failed — continuing anyway");
  }
}

seedIfEmpty().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
});
