import fs from "node:fs";
import path from "node:path";
import { db, productsTable } from "@workspace/db";

type SeedRow = {
  name: string;
  brand: string;
  category: string;
  petType: string;
  price: number;
  stock: number;
  weight: string;
  expiryDate: string;
  popular: boolean;
  breed: string | null;
  ageGroup: string | null;
  healthCondition: string | null;
  description: string;
  image: string;
};

async function main() {
  const file = path.resolve(import.meta.dirname, "seed-products.json");
  const items: SeedRow[] = JSON.parse(fs.readFileSync(file, "utf8"));

  const existing = await db.select().from(productsTable);
  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing products. Skipping seed.`);
    return;
  }

  const inserted = await db
    .insert(productsTable)
    .values(
      items.map((p) => ({
        name: p.name,
        brand: p.brand,
        category: p.category,
        petType: p.petType,
        price: p.price.toString(),
        stock: p.stock,
        description: p.description,
        image: p.image,
        weight: p.weight,
        expiryDate: p.expiryDate,
        popular: p.popular,
        breed: p.breed,
        ageGroup: p.ageGroup,
        healthCondition: p.healthCondition,
      })),
    )
    .returning();
  console.log(`Inserted ${inserted.length} products.`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
