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
import { Sparkles, Heart } from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { toast } from "sonner";

export default function FoodRecommender() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    petType: "dog" as "dog" | "cat",
    breed: "",
    ageYears: 3,
    weightKg: 10,
    healthCondition: "",
  });
  const recommend = useAiRecommend();

  const addCart = useAddCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Added to cart");
      },
    },
  });

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

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium tracking-wider uppercase mb-4">
          <Sparkles className="h-3 w-3" />
          AI Tool
        </span>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-3">
          Food &amp; Care Recommender
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Tell us about your pet and we will assemble a personalized list of
          food and a daily care routine tuned for Pakistan's climate.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-card border border-card-border rounded-2xl p-6 grid md:grid-cols-2 gap-5 mb-10"
      >
        <div className="space-y-2">
          <Label>Pet Type</Label>
          <Select
            value={form.petType}
            onValueChange={(v) =>
              setForm({ ...form, petType: v as "dog" | "cat" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Dog</SelectItem>
              <SelectItem value="cat">Cat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Breed (optional)</Label>
          <Input
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            placeholder="e.g. Persian, Labrador"
          />
        </div>
        <div className="space-y-2">
          <Label>Age (years)</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={form.ageYears}
            onChange={(e) =>
              setForm({ ...form, ageYears: Number(e.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={form.weightKg}
            onChange={(e) =>
              setForm({ ...form, weightKg: Number(e.target.value) })
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Health condition (optional)</Label>
          <Input
            value={form.healthCondition}
            onChange={(e) =>
              setForm({ ...form, healthCondition: e.target.value })
            }
            placeholder="e.g. allergies, joint issues, sensitive stomach"
          />
        </div>
        <div className="md:col-span-2">
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto rounded-full px-10 h-12"
            disabled={recommend.isPending}
          >
            {recommend.isPending ? "Curating..." : "Get Recommendations"}
          </Button>
        </div>
      </form>

      {recommend.data && (
        <div className="space-y-8">
          <div className="bg-primary/10 rounded-2xl p-6">
            <p className="text-foreground leading-relaxed">
              {recommend.data.summary}
            </p>
          </div>

          {recommend.data.products.length > 0 && (
            <div>
              <h3 className="font-serif text-2xl mb-4">Picks for your pet</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommend.data.products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-card border border-card-border rounded-2xl p-4 flex flex-col"
                  >
                    <Link href={`/shop/${p.id}`}>
                      <div className="aspect-square bg-secondary/30 rounded-xl mb-3 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </div>
                    </Link>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {p.brand}
                    </p>
                    <p className="font-medium text-sm line-clamp-2 mb-2">
                      {p.name}
                    </p>
                    <p className="font-medium mt-auto mb-2">
                      {formatPKR(p.price)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() =>
                        addCart.mutate({
                          data: { productId: p.id, quantity: 1 },
                        })
                      }
                    >
                      Add to Cart
                    </Button>
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
                <div
                  key={i}
                  className="bg-card border border-card-border rounded-xl p-4 text-sm text-foreground"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
