import { Router, type IRouter } from "express";
import {
  db,
  productsTable,
  ordersTable,
  usersTable,
  type OrderItemJson,
} from "@workspace/db";
import { desc, eq, sql, count } from "drizzle-orm";
import {
  AdminCreateProductBody,
  AdminUpdateProductBody,
  AdminUpdateProductParams,
  AdminDeleteProductParams,
  AdminUpdateOrderStatusBody,
  AdminUpdateOrderStatusParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeProduct(p: typeof productsTable.$inferSelect) {
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

function serializeOrder(o: typeof ordersTable.$inferSelect) {
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

router.get("/admin/stats", async (_req, res) => {
  const orders = await db.select().from(ordersTable);
  const products = await db.select({ id: productsTable.id, stock: productsTable.stock }).from(productsTable);
  const users = await db.select({ id: usersTable.id }).from(usersTable);

  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalUsers = users.length;
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  const statusCounts = new Map<string, number>();
  for (const o of orders) statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
  const ordersByStatus = ["pending", "shipped", "delivered", "cancelled"].map(
    (status) => ({ status, count: statusCounts.get(status) ?? 0 }),
  );

  const today = new Date();
  const revenueByDay: { date: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const revenue = orders
      .filter((o) => o.createdAt.toISOString().slice(0, 10) === key)
      .reduce((acc, o) => acc + Number(o.total), 0);
    revenueByDay.push({ date: key, revenue: Math.round(revenue * 100) / 100 });
  }

  const productSales = new Map<number, { name: string; totalSold: number; revenue: number }>();
  for (const o of orders) {
    const items = o.items as OrderItemJson[];
    for (const it of items) {
      const cur = productSales.get(it.productId) ?? {
        name: it.name,
        totalSold: 0,
        revenue: 0,
      };
      cur.totalSold += it.quantity;
      cur.revenue += it.price * it.quantity;
      productSales.set(it.productId, cur);
    }
  }
  const topProducts = Array.from(productSales.entries())
    .map(([productId, v]) => ({
      productId,
      name: v.name,
      totalSold: v.totalSold,
      revenue: Math.round(v.revenue * 100) / 100,
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  res.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    totalProducts,
    totalUsers,
    lowStockCount,
    ordersByStatus,
    revenueByDay,
    topProducts,
  });
});

router.get("/admin/recent-activity", async (_req, res) => {
  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(8);
  const recentUsers = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(5);

  const items = [
    ...recentOrders.map((o) => ({
      type: "order" as const,
      title: `New order #${o.id} — Rs. ${Number(o.total).toLocaleString()}`,
      subtitle: `${o.customerName} • ${o.status}`,
      createdAt: o.createdAt.toISOString(),
    })),
    ...recentUsers.map((u) => ({
      type: "user" as const,
      title: `New ${u.role} signed up`,
      subtitle: `${u.name} • ${u.email}`,
      createdAt: u.createdAt.toISOString(),
    })),
  ];
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json(items.slice(0, 12));
});

router.get("/admin/products", async (_req, res) => {
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt));
  res.json(rows.map(serializeProduct));
});

router.post("/admin/products", async (req, res) => {
  const body = AdminCreateProductBody.parse(req.body);
  const inserted = await db
    .insert(productsTable)
    .values({
      name: body.name,
      brand: body.brand,
      category: body.category,
      petType: body.petType,
      price: body.price.toString(),
      stock: body.stock,
      description: body.description,
      image: body.image,
      weight: body.weight,
      expiryDate: body.expiryDate,
      popular: body.popular ?? false,
      breed: body.breed ?? null,
      ageGroup: body.ageGroup ?? null,
      healthCondition: body.healthCondition ?? null,
    })
    .returning();
  res.status(201).json(serializeProduct(inserted[0]!));
});

router.put("/admin/products/:id", async (req, res) => {
  const { id } = AdminUpdateProductParams.parse(req.params);
  const body = AdminUpdateProductBody.parse(req.body);
  const updated = await db
    .update(productsTable)
    .set({
      name: body.name,
      brand: body.brand,
      category: body.category,
      petType: body.petType,
      price: body.price.toString(),
      stock: body.stock,
      description: body.description,
      image: body.image,
      weight: body.weight,
      expiryDate: body.expiryDate,
      popular: body.popular ?? false,
      breed: body.breed ?? null,
      ageGroup: body.ageGroup ?? null,
      healthCondition: body.healthCondition ?? null,
    })
    .where(eq(productsTable.id, id))
    .returning();
  if (updated.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(serializeProduct(updated[0]!));
});

router.delete("/admin/products/:id", async (req, res) => {
  const { id } = AdminDeleteProductParams.parse(req.params);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).end();
});

router.get("/admin/orders", async (_req, res) => {
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(rows.map(serializeOrder));
});

router.put("/admin/orders/:id/status", async (req, res) => {
  const { id } = AdminUpdateOrderStatusParams.parse(req.params);
  const body = AdminUpdateOrderStatusBody.parse(req.body);
  const updated = await db
    .update(ordersTable)
    .set({ status: body.status })
    .where(eq(ordersTable.id, id))
    .returning();
  if (updated.length === 0) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(serializeOrder(updated[0]!));
});

router.get("/admin/users", async (_req, res) => {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      blocked: usersTable.blocked,
      createdAt: usersTable.createdAt,
      orderCount: count(ordersTable.id),
    })
    .from(usersTable)
    .leftJoin(ordersTable, eq(ordersTable.userId, usersTable.id))
    .groupBy(usersTable.id)
    .orderBy(desc(usersTable.createdAt));
  res.json(
    rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      blocked: u.blocked,
      createdAt: u.createdAt.toISOString(),
      orderCount: Number(u.orderCount),
    })),
  );
});

export default router;
