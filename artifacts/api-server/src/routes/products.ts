import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    petType: p.petType,
    price: Number(p.price),
    stock: p.stock,
    description: p.description,
    image: p.image,
    weight: p.weight,
    expiryDate: p.expiryDate,
    popular: p.popular,
    breed: p.breed,
    ageGroup: p.ageGroup,
    healthCondition: p.healthCondition,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res) => {
  const params = ListProductsQueryParams.parse(req.query);
  const conds = [];
  if (params.category) conds.push(eq(productsTable.category, params.category));
  if (params.petType) conds.push(eq(productsTable.petType, params.petType));
  if (params.brand) conds.push(eq(productsTable.brand, params.brand));
  if (params.search) {
    const s = `%${params.search}%`;
    conds.push(
      or(
        ilike(productsTable.name, s),
        ilike(productsTable.brand, s),
        ilike(productsTable.description, s),
      )!,
    );
  }
  let order;
  switch (params.sort) {
    case "price_asc":
      order = asc(productsTable.price);
      break;
    case "price_desc":
      order = desc(productsTable.price);
      break;
    case "newest":
      order = desc(productsTable.createdAt);
      break;
    default:
      order = desc(productsTable.popular);
  }
  const rows = await db
    .select()
    .from(productsTable)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(order);
  res.json(rows.map(serialize));
});

router.get("/products/featured", async (_req, res) => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.popular, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);
  res.json(rows.map(serialize));
});

router.get("/products/popular-in-pakistan", async (_req, res) => {
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.popular), desc(productsTable.stock))
    .limit(12);
  res.json(rows.map(serialize));
});

router.get("/products/categories", async (_req, res) => {
  const rows = await db
    .select({
      category: productsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(productsTable)
    .groupBy(productsTable.category);
  res.json(rows);
});

router.get("/products/brands", async (_req, res) => {
  const rows = await db
    .select({
      brand: productsTable.brand,
      count: sql<number>`count(*)::int`,
    })
    .from(productsTable)
    .groupBy(productsTable.brand)
    .orderBy(desc(sql`count(*)`));
  res.json(rows);
});

router.get("/products/:id", async (req, res) => {
  const { id } = GetProductParams.parse(req.params);
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(serialize(rows[0]!));
});

export default router;
