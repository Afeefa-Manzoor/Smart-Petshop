import { useState } from "react";
import { Link } from "wouter";
import {
  useAiRecommend,
  useAddCartItem,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, ShoppingBag, Zap, Sun, Moon, Clock } from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { toast } from "sonner";
import { AiHero } from "./_shared";

type Preset = {
  label: string;
  icon: string;
  petType: "dog" | "cat";
  breed: string;
  ageYears: number;
  weightKg: number;
  healthCondition: string;
};

const PRESETS: Preset[] = [
  { label: "Puppy Dog", icon: "🐶", petType: "dog", breed: "Labrador", ageYears: 0.5, weightKg: 8, healthCondition: "" },
  { label: "Adult Dog", icon: "🐕", petType: "dog", breed: "German Shepherd", ageYears: 4, weightKg: 28, healthCondition: "" },
  { label: "Senior Dog", icon: "🦮", petType: "dog", breed: "Golden Retriever", ageYears: 10, weightKg: 22, healthCondition: "joint issues" },
  { label: "Kitten", icon: "🐱", petType: "cat", breed: "Domestic Shorthair", ageYears: 0.4, weightKg: 2, healthCondition: "" },
  { label: "Adult Cat", icon: "🐈", petType: "cat", breed: "Persian", ageYears: 5, weightKg: 5, healthCondition: "" },
  { label: "Sensitive Pet", icon: "💊", petType: "dog", breed: "Poodle", ageYears: 3, weightKg: 12, healthCondition: "sensitive stomach" },
];

function MealTimeline() {
  const meals = [
    { time: "7:00 AM", label: "Morning meal", icon: Sun, tip: "Larger portion — peak energy hours" },
    { time: "1:00 PM", label: "Midday snack", icon: Clock, tip: "Light treat or small supplement" },
    { time: "7:00 PM", label: "Evening meal", icon: Moon, tip: "Remaining daily ration" },
  ];
  return (
    <div className="space-y-3">
      {meals.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.time} className="flex items-center gap-4 bg-secondary/40 rounded-xl px-4 py-3">
            <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.tip}</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{m.time}</span>
          </div>
        );
      })}
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-6 mt-8 animate-pulse">
      <div className="h-20 bg-secondary/30 rounded-2xl" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-secondary/30 rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function FoodRecommender() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    petType: "dog" as "dog" | "cat",
    breed: "",
    ageYears: 3,
    weightKg: 10,
    healthCondition: "",
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const recommend = useAiRecommend();

  const addCart = useAddCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Added to cart");
      },
    },
  });

  function applyPreset(p: Preset) {
    setActivePreset(p.label);
    setForm({ petType: p.petType, breed: p.breed, ageYears: p.ageYears, weightKg: p.weightKg, healthCondition: p.healthCondition });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    recommend.mutate({
      data: {
        petType: form.petType,
        breed: form.breed || undefined,
        ageYears: form.ageYears || undefined,
        weightKg: form.weightKg || undefined,
        healthCondition: form.healthCondition || undefined,
      },
    });
  }

  // Rough daily calorie estimate
  const dailyKcal = form.petType === "dog"
    ? Math.round(70 * Math.pow(form.weightKg, 0.75))
    : Math.round(52 * Math.pow(form.weightKg, 0.67));

  return (
    <>
      <AiHero
        title="Food & Care Recommender"
        subtitle="Enter your pet's details and get a personalised daily diet plan, portion sizes, and care tips tailored to Pakistan's climate."
      />

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-6xl">
        {/* Quick profile presets */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Quick fill a profile
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors flex items-center gap-2 ${
                  activePreset === p.label
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-input bg-card hover:bg-secondary/50 text-foreground"
                }`}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={submit} className="lg:col-span-3 bg-card border border-card-border rounded-2xl p-6 space-y-5">
            <h2 className="font-serif text-xl">Pet Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pet Type</Label>
                <Select value={form.petType} onValueChange={(v) => { setForm({ ...form, petType: v as "dog" | "cat" }); setActivePreset(null); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Breed (optional)</Label>
                <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Persian, Labrador" />
              </div>
              <div className="space-y-2">
                <Label>Age (years)</Label>
                <Input type="number" min={0} step={0.1} value={form.ageYears} onChange={(e) => setForm({ ...form, ageYears: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" min={0} step={0.1} value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Health condition (optional)</Label>
                <Input value={form.healthCondition} onChange={(e) => setForm({ ...form, healthCondition: e.target.value })} placeholder="e.g. allergies, joint issues, sensitive stomach" />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full h-12" disabled={recommend.isPending}>
              {recommend.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Building your plan...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Get My Plan</span>
              )}
            </Button>
          </form>

          {/* Live calorie estimate card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[hsl(15,20%,14%)] rounded-2xl p-6">
              <p className="text-[hsl(90,12%,56%)] text-xs uppercase tracking-widest mb-2">Estimated Daily Needs</p>
              <p className="font-serif text-5xl text-[hsl(40,40%,95%)] mb-1">{dailyKcal.toLocaleString()}</p>
              <p className="text-[hsl(35,20%,60%)] text-sm">kcal per day</p>
              <div className="mt-4 border-t border-white/10 pt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[hsl(35,20%,55%)]">Type</p>
                  <p className="text-[hsl(40,40%,85%)] font-medium capitalize">{form.petType}</p>
                </div>
                <div>
                  <p className="text-[hsl(35,20%,55%)]">Weight</p>
                  <p className="text-[hsl(40,40%,85%)] font-medium">{form.weightKg} kg</p>
                </div>
                <div>
                  <p className="text-[hsl(35,20%,55%)]">Age</p>
                  <p className="text-[hsl(40,40%,85%)] font-medium">{form.ageYears} yrs</p>
                </div>
                {form.breed && (
                  <div>
                    <p className="text-[hsl(35,20%,55%)]">Breed</p>
                    <p className="text-[hsl(40,40%,85%)] font-medium">{form.breed}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-card border border-card-border rounded-2xl p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Suggested Meal Times</p>
              <MealTimeline />
            </div>
          </div>
        </div>

        {/* Loading */}
        {recommend.isPending && <ResultSkeleton />}

        {/* Results */}
        {recommend.data && !recommend.isPending && (
          <div className="mt-10 space-y-8">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
              <p className="text-foreground leading-relaxed">{recommend.data.summary}</p>
            </div>

            {recommend.data.products.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-2xl">Picked for your pet</h3>
                  <Link href="/shop" className="text-sm text-primary hover:underline">Browse all</Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommend.data.products.map((p) => (
                    <div key={p.id} className="bg-card border border-card-border rounded-2xl overflow-hidden group">
                      <Link href={`/shop/${p.id}`}>
                        <div className="aspect-square bg-secondary/20 overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      </Link>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.brand}</p>
                        <p className="text-sm font-medium mt-0.5 line-clamp-2">{p.name}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-semibold">{formatPKR(p.price)}</span>
                          <button
                            onClick={() => addCart.mutate({ data: { productId: p.id, quantity: 1 } })}
                            className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
                            aria-label="Add to cart"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-serif text-2xl mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-accent" />
                Care Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {recommend.data.careTips.map((tip, i) => (
                  <div key={i} className="bg-card border border-card-border rounded-xl p-4 flex gap-3">
                    <span className="font-serif text-xl text-primary flex-shrink-0 leading-none mt-0.5">{i + 1}</span>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
