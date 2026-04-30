import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      demoUserId?: number;
    }
  }
}

const userCache = new Map<string, number>();

async function ensureUser(email: string, name: string): Promise<number> {
  const cached = userCache.get(email);
  if (cached) return cached;
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  if (existing.length > 0) {
    userCache.set(email, existing[0]!.id);
    return existing[0]!.id;
  }
  const inserted = await db
    .insert(usersTable)
    .values({ email, name, role: email === "admin@pawsmart.pk" ? "admin" : "user" })
    .returning();
  const id = inserted[0]!.id;
  userCache.set(email, id);
  return id;
}

export async function demoUser(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const headerEmail = (req.header("x-demo-user") || "").trim();
    const email = headerEmail || "guest@pawsmart.pk";
    const name = email === "admin@pawsmart.pk" ? "Admin" : "Guest Shopper";
    req.demoUserId = await ensureUser(email, name);
    next();
  } catch (err) {
    next(err);
  }
}
