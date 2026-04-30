import { Router, type IRouter } from "express";
import {
  db,
  ordersTable,
  cartItemsTable,
  productsTable,
  type OrderItemJson,
} from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";

const router: IRouter = Router();

const SHIPPING_FLAT = 250;
const FREE_SHIPPING_THRESHOLD = 5000;

function serialize(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    items: o.items,
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    total: Number(o.total),
    status: o.status,
    customerName: o.customerName,
    address: o.address,
    phone: o.phone,
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res) => {
  const userId = req.demoUserId!;
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/orders", async (req, res) => {
  const body = CreateOrderBody.parse(req.body);
  const userId = req.demoUserId!;

  const cartRows = await db
    .select({
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      product: productsTable,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  if (cartRows.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const items: OrderItemJson[] = cartRows.map((r) => ({
    productId: r.product.id,
    name: r.product.name,
    brand: r.product.brand,
    image: r.product.image,
    price: Number(r.product.price),
    quantity: r.quantity,
  }));
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const inserted = await db
    .insert(ordersTable)
    .values({
      userId,
      items,
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      status: "pending",
      customerName: body.customerName,
      address: body.address,
      phone: body.phone,
      notes: body.notes ?? "",
    })
    .returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  res.status(201).json(serialize(inserted[0]!));
});

router.get("/orders/:id", async (req, res) => {
  const { id } = GetOrderParams.parse(req.params);
  const userId = req.demoUserId!;
  const rows = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, userId)));
  if (rows.length === 0) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(serialize(rows[0]!));
});

export default router;
