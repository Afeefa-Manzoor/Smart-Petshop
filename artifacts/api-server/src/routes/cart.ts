import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  AddCartItemBody,
  UpdateCartItemBody,
  UpdateCartItemParams,
  RemoveCartItemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SHIPPING_FLAT = 250;
const FREE_SHIPPING_THRESHOLD = 5000;

async function buildCart(userId: number) {
  const rows = await db
    .select({
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      product: productsTable,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const items = rows.map((r) => ({
    productId: r.productId,
    quantity: r.quantity,
    product: {
      id: r.product.id,
      name: r.product.name,
      brand: r.product.brand,
      category: r.product.category,
      petType: r.product.petType,
      price: Number(r.product.price),
      stock: r.product.stock,
      description: r.product.description,
      image: r.product.image,
      weight: r.product.weight,
      expiryDate: r.product.expiryDate,
      popular: r.product.popular,
      breed: r.product.breed,
      ageGroup: r.product.ageGroup,
      healthCondition: r.product.healthCondition,
      createdAt: r.product.createdAt.toISOString(),
    },
  }));
  const subtotal = items.reduce(
    (acc, it) => acc + it.product.price * it.quantity,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;
  const count = items.reduce((acc, it) => acc + it.quantity, 0);
  return {
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    shipping,
    total: Math.round(total * 100) / 100,
    count,
  };
}

router.get("/cart", async (req, res) => {
  const userId = req.demoUserId!;
  res.json(await buildCart(userId));
});

router.post("/cart/items", async (req, res) => {
  const body = AddCartItemBody.parse(req.body);
  const userId = req.demoUserId!;
  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.userId, userId),
        eq(cartItemsTable.productId, body.productId),
      ),
    );
  if (existing.length > 0) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing[0]!.quantity + body.quantity })
      .where(eq(cartItemsTable.id, existing[0]!.id));
  } else {
    await db.insert(cartItemsTable).values({
      userId,
      productId: body.productId,
      quantity: body.quantity,
    });
  }
  res.json(await buildCart(userId));
});

router.put("/cart/items/:productId", async (req, res) => {
  const { productId } = UpdateCartItemParams.parse(req.params);
  const body = UpdateCartItemBody.parse(req.body);
  const userId = req.demoUserId!;
  if (body.quantity === 0) {
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.userId, userId),
          eq(cartItemsTable.productId, productId),
        ),
      );
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity: body.quantity })
      .where(
        and(
          eq(cartItemsTable.userId, userId),
          eq(cartItemsTable.productId, productId),
        ),
      );
  }
  res.json(await buildCart(userId));
});

router.delete("/cart/items/:productId", async (req, res) => {
  const { productId } = RemoveCartItemParams.parse(req.params);
  const userId = req.demoUserId!;
  await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.userId, userId),
        eq(cartItemsTable.productId, productId),
      ),
    );
  res.json(await buildCart(userId));
});

export { buildCart };
export default router;
