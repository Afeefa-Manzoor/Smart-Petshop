import { Router, type IRouter } from "express";
import { db, petsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  CreatePetBody,
  UpdatePetBody,
  UpdatePetParams,
  DeletePetParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(p: typeof petsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    breed: p.breed,
    ageYears: Number(p.ageYears),
    weightKg: Number(p.weightKg),
    healthNotes: p.healthNotes,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/pets", async (req, res) => {
  const userId = req.demoUserId!;
  const rows = await db
    .select()
    .from(petsTable)
    .where(eq(petsTable.userId, userId));
  res.json(rows.map(serialize));
});

router.post("/pets", async (req, res) => {
  const body = CreatePetBody.parse(req.body);
  const userId = req.demoUserId!;
  const inserted = await db
    .insert(petsTable)
    .values({
      userId,
      name: body.name,
      type: body.type,
      breed: body.breed,
      ageYears: body.ageYears.toString(),
      weightKg: body.weightKg.toString(),
      healthNotes: body.healthNotes ?? "",
    })
    .returning();
  res.status(201).json(serialize(inserted[0]!));
});

router.put("/pets/:id", async (req, res) => {
  const { id } = UpdatePetParams.parse(req.params);
  const body = UpdatePetBody.parse(req.body);
  const userId = req.demoUserId!;
  const updated = await db
    .update(petsTable)
    .set({
      name: body.name,
      type: body.type,
      breed: body.breed,
      ageYears: body.ageYears.toString(),
      weightKg: body.weightKg.toString(),
      healthNotes: body.healthNotes ?? "",
    })
    .where(and(eq(petsTable.id, id), eq(petsTable.userId, userId)))
    .returning();
  if (updated.length === 0) {
    res.status(404).json({ error: "Pet not found" });
    return;
  }
  res.json(serialize(updated[0]!));
});

router.delete("/pets/:id", async (req, res) => {
  const { id } = DeletePetParams.parse(req.params);
  const userId = req.demoUserId!;
  await db
    .delete(petsTable)
    .where(and(eq(petsTable.id, id), eq(petsTable.userId, userId)));
  res.status(204).end();
});

export default router;
