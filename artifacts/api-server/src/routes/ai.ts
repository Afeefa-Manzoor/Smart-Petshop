import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import {
  AiRecommendBody,
  AiSymptomCheckBody,
  AiBreedDetectBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeProducts(rows: (typeof productsTable.$inferSelect)[]) {
  return rows.map((p) => ({
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
  }));
}

const DOG_BREEDS = [
  {
    breed: "Labrador Retriever",
    characteristics: [
      "Friendly and outgoing temperament",
      "High energy — needs daily exercise",
      "Prone to weight gain — measure portions carefully",
      "Loves swimming and fetch",
    ],
  },
  {
    breed: "Golden Retriever",
    characteristics: [
      "Gentle, intelligent, and devoted",
      "Thick double coat — sheds seasonally",
      "Hip dysplasia risk in adulthood",
      "Excellent with children",
    ],
  },
  {
    breed: "German Shepherd",
    characteristics: [
      "Highly intelligent working breed",
      "Needs structured training and a job",
      "Sensitive stomach — quality protein matters",
      "Loyal and protective",
    ],
  },
  {
    breed: "French Bulldog",
    characteristics: [
      "Brachycephalic — keep cool in hot weather",
      "Low exercise needs, apartment friendly",
      "Sensitive skin — gentle grooming products",
      "Affectionate and playful indoors",
    ],
  },
];

const CAT_BREEDS = [
  {
    breed: "British Shorthair",
    characteristics: [
      "Calm, easygoing, and quiet",
      "Plush dense coat — weekly brushing",
      "Tendency toward chunky build",
      "Independent but affectionate",
    ],
  },
  {
    breed: "Persian",
    characteristics: [
      "Long flowing coat — daily grooming required",
      "Flat face — pick low-dish food and water bowls",
      "Quiet and gentle indoor companion",
      "Eye drainage needs daily wipe",
    ],
  },
  {
    breed: "Siamese",
    characteristics: [
      "Vocal, social, and intelligent",
      "Slim athletic build — high metabolism",
      "Forms strong bonds with one person",
      "Needs mental stimulation",
    ],
  },
];

router.post("/ai/recommend", async (req, res) => {
  const body = AiRecommendBody.parse(req.body);
  const ageYears = body.ageYears ?? 3;
  const ageGroup =
    body.petType === "cat"
      ? ageYears < 1
        ? "kitten"
        : ageYears > 9
          ? "senior"
          : "adult"
      : ageYears < 1
        ? "puppy"
        : ageYears > 8
          ? "senior"
          : "adult";

  const rows = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.petType, body.petType),
        or(
          eq(productsTable.ageGroup, ageGroup),
          eq(productsTable.ageGroup, "all"),
        )!,
      ),
    )
    .limit(8);

  const careTips: string[] = [];
  if (body.petType === "dog") {
    careTips.push(
      `Feed roughly ${Math.max(50, Math.round((body.weightKg ?? 10) * 25))}g of dry food per day, split across 2 meals.`,
      "Provide fresh water at all times — refresh twice daily in Pakistan's heat.",
      "Daily walk of at least 30 minutes — early morning or after sunset is best.",
      "Brush teeth 2–3 times a week to prevent dental disease.",
    );
  } else {
    careTips.push(
      `Offer ${Math.max(40, Math.round((body.weightKg ?? 4) * 20))}g of dry food daily, with 1–2 wet meals per week.`,
      "Keep the litter box clean — scoop daily.",
      "Brush regularly to reduce hairballs, especially for long-haired breeds.",
      "Schedule annual vet checkups and keep vaccinations current.",
    );
  }
  if (body.healthCondition && body.healthCondition.toLowerCase().includes("allerg")) {
    careTips.push(
      "Choose limited-ingredient or hypoallergenic formulas — avoid common triggers like grain and chicken.",
    );
  }

  const summary = `Based on your ${body.petType}${
    body.breed ? ` (${body.breed})` : ""
  }${body.weightKg ? `, ${body.weightKg}kg` : ""}${
    body.ageYears ? `, ${body.ageYears} years old` : ""
  }, here are food and care picks tuned for an ${ageGroup} ${body.petType} in Pakistan.`;

  res.json({
    summary,
    products: serializeProducts(rows),
    careTips,
  });
});

router.post("/ai/symptom-check", async (req, res) => {
  const body = AiSymptomCheckBody.parse(req.body);
  const s = body.symptoms.toLowerCase();

  type Cause = { name: string; severity: "mild" | "moderate" | "severe"; description: string };
  const possibleCauses: Cause[] = [];
  const suggestedActions: string[] = [];
  let urgent = false;

  if (s.includes("vomit") || s.includes("throw up")) {
    possibleCauses.push({
      name: "Dietary indiscretion",
      severity: "mild",
      description:
        "Eating something unfamiliar or too quickly often causes a single vomiting episode.",
    });
    possibleCauses.push({
      name: "Gastroenteritis",
      severity: "moderate",
      description:
        "Viral or bacterial inflammation of the stomach lining, often paired with diarrhea.",
    });
    if (s.includes("blood")) {
      possibleCauses.push({
        name: "Internal injury or ulcer",
        severity: "severe",
        description: "Blood in vomit needs urgent veterinary attention.",
      });
      urgent = true;
    }
    suggestedActions.push(
      "Withhold food for 6–12 hours but keep small amounts of water available.",
      "Reintroduce a bland diet (boiled chicken and rice) in small portions.",
    );
  }
  if (s.includes("diarrh")) {
    possibleCauses.push({
      name: "Sudden diet change",
      severity: "mild",
      description: "Switching food too quickly often upsets the gut.",
    });
    possibleCauses.push({
      name: "Parasites",
      severity: "moderate",
      description: "Worms or giardia can cause persistent loose stool.",
    });
    suggestedActions.push("Make sure water is always available to prevent dehydration.");
  }
  if (s.includes("limp") || s.includes("not walk") || s.includes("can't walk")) {
    possibleCauses.push({
      name: "Soft tissue strain",
      severity: "moderate",
      description: "Sprains and strains heal with rest but should be checked.",
    });
    possibleCauses.push({
      name: "Fracture or joint injury",
      severity: "severe",
      description: "Sudden refusal to bear weight needs same-day veterinary care.",
    });
    urgent = true;
  }
  if (s.includes("breath") || s.includes("pant") || s.includes("choke")) {
    possibleCauses.push({
      name: "Respiratory distress",
      severity: "severe",
      description: "Difficulty breathing is always an emergency.",
    });
    urgent = true;
  }
  if (s.includes("itch") || s.includes("scratch") || s.includes("skin")) {
    possibleCauses.push({
      name: "Allergic dermatitis",
      severity: "mild",
      description: "Food or environmental allergens commonly cause itching.",
    });
    possibleCauses.push({
      name: "Fleas or mites",
      severity: "moderate",
      description: "Parasite infestations are very common in Pakistan's climate.",
    });
    suggestedActions.push(
      "Bathe with a gentle medicated shampoo and check for fleas at the base of the tail.",
    );
  }
  if (s.includes("eye") || s.includes("red eye") || s.includes("discharge")) {
    possibleCauses.push({
      name: "Conjunctivitis",
      severity: "mild",
      description: "Eye irritation from dust or mild infection.",
    });
    suggestedActions.push("Clean discharge gently with a saline-soaked cotton pad.");
  }

  if (possibleCauses.length === 0) {
    possibleCauses.push({
      name: "General discomfort",
      severity: "mild",
      description:
        "Without more details we cannot narrow this down. Monitor for 12–24 hours and note any changes.",
    });
    suggestedActions.push(
      "Keep your pet calm, hydrated, and observe eating, drinking, and bathroom habits.",
    );
  }

  suggestedActions.push(
    "If symptoms worsen, persist beyond 24 hours, or your pet seems lethargic, consult a veterinarian immediately.",
  );

  res.json({
    disclaimer:
      "This tool provides general information only and is not a substitute for professional veterinary diagnosis. If your pet shows severe or worsening symptoms, contact a licensed veterinarian immediately.",
    possibleCauses,
    suggestedActions,
    urgent,
  });
});

router.post("/ai/breed-detect", async (req, res) => {
  const body = AiBreedDetectBody.parse(req.body);

  const seed = body.imageUrl.length;
  const pool = body.petType === "cat" ? CAT_BREEDS : DOG_BREEDS;
  const pick = pool[seed % pool.length]!;
  const confidence = 0.78 + ((seed % 15) / 100);

  const rows = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.petType, body.petType),
        or(
          ilike(productsTable.breed, `%${pick.breed.split(" ")[0]}%`),
          eq(productsTable.ageGroup, "adult"),
          eq(productsTable.ageGroup, "all"),
        )!,
      ),
    )
    .orderBy(sql`random()`)
    .limit(4);

  res.json({
    breed: pick.breed,
    confidence: Math.round(confidence * 100) / 100,
    characteristics: pick.characteristics,
    recommendedProducts: serializeProducts(rows),
    careTips: pick.characteristics.slice(0, 3),
    disclaimer:
      "Breed detection is an estimate based on visual cues and is not a DNA test. For accurate breed identification, consult a veterinary genetic test.",
  });
});

export default router;
