import { useState } from "react";
import { Link } from "wouter";
import {
  useAiBreedDetect,
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
import { Upload, AlertCircle, ShoppingBag, Camera, RotateCcw } from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { toast } from "sonner";
import { AiHero } from "./_shared";

const SAMPLE_PETS = [
  {
    label: "Labrador",
    type: "dog" as const,
    url: "/seed/sample_labrador.jpg",
  },
  {
    label: "Persian Cat",
    type: "cat" as const,
    url: "/seed/sample_persian.jpg",
  },
  {
    label: "German Shepherd",
    type: "dog" as const,
    url: "/seed/sample_german_shepherd.jpg",
  },
  {
    label: "Siamese Cat",
    type: "cat" as const,
    url: "/seed/sample_siamese.jpg",
  },
];

function ConfidenceRing({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-serif text-2xl text-foreground leading-none">{pct}%</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Match</span>
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="mt-10 bg-card border border-card-border rounded-3xl p-8 space-y-6 animate-pulse">
      <div className="flex gap-6 items-center">
        <div className="h-24 w-24 rounded-full bg-secondary/50" />
        <div className="space-y-3 flex-1">
          <div className="h-8 bg-secondary/50 rounded w-1/2" />
          <div className="h-4 bg-secondary/30 rounded w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-secondary/30 rounded-full" />)}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 bg-secondary/20 rounded w-full" />)}
      </div>
    </div>
  );
}

export default function BreedDetector() {
  const queryClient = useQueryClient();
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");

  const detect = useAiBreedDetect();
  const addCart = useAddCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Added to cart");
      },
    },
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImageUrl(url);
      setPreview(url);
    };
    reader.readAsDataURL(f);
  }

  function useSample(s: (typeof SAMPLE_PETS)[0]) {
    setPetType(s.type);
    setImageUrl(s.url);
    setPreview(s.url);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) { toast.error("Add a photo first"); return; }
    detect.mutate({ data: { imageUrl, petType } });
  }

  function reset() {
    detect.reset?.();
    setImageUrl("");
    setPreview("");
  }

  return (
    <>
      <AiHero
        title="Breed Detector"
        subtitle="Upload or paste a photo of your pet — our AI identifies the breed and recommends tailored products within seconds."
      />

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-6xl">
        {/* Sample images */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Try a sample
          </p>
          <div className="flex gap-3 flex-wrap">
            {SAMPLE_PETS.map((s) => (
              <button
                key={s.label}
                onClick={() => useSample(s)}
                className={`group flex flex-col items-center gap-1.5 p-1 rounded-2xl border-2 transition-colors ${
                  preview === s.url
                    ? "border-primary"
                    : "border-transparent hover:border-primary/40"
                }`}
              >
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-secondary/40">
                  <img
                    src={s.url}
                    alt={s.label}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={submit} className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <Label>Pet Type</Label>
              <Select value={petType} onValueChange={(v) => setPetType(v as "dog" | "cat")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={imageUrl.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setPreview(e.target.value); }}
              />
            </div>
            <div className="text-center text-xs text-muted-foreground">— or —</div>
            <label className="border-2 border-dashed border-input rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:bg-secondary/30 transition-colors">
              <Camera className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Upload from device</span>
              <span className="text-xs text-muted-foreground">JPG, PNG or WEBP</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            <div className="flex gap-3">
              <Button type="submit" size="lg" className="rounded-full flex-1 h-12" disabled={detect.isPending || !imageUrl}>
                {detect.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Analysing...
                  </span>
                ) : "Detect Breed"}
              </Button>
              {(preview || detect.data) && (
                <Button type="button" variant="outline" className="rounded-full h-12 px-4" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex gap-2 items-start">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
              Visual estimates only — not a substitute for DNA testing.
            </p>
          </form>

          {/* Preview */}
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden flex flex-col">
            {preview ? (
              <div className="flex-1 min-h-60 bg-secondary/30 relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  style={{ maxHeight: 360 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {detect.data && (
                  <div className="absolute bottom-4 right-4">
                    <ConfidenceRing value={detect.data.confidence} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 min-h-60 bg-secondary/20 flex flex-col items-center justify-center gap-3 text-muted-foreground p-8 text-center">
                <Upload className="h-8 w-8 opacity-30" />
                <p className="text-sm">Your pet's photo will appear here</p>
                <p className="text-xs opacity-60">Pick a sample above or upload your own</p>
              </div>
            )}
            {detect.data && (
              <div className="p-5 border-t border-card-border">
                <p className="text-xs uppercase tracking-widest text-primary mb-0.5">Detected breed</p>
                <h2 className="font-serif text-2xl text-foreground">{detect.data.breed}</h2>
              </div>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {detect.isPending && <ResultSkeleton />}

        {/* Results */}
        {detect.data && !detect.isPending && (
          <div className="mt-10 space-y-8">
            {/* Breed overview */}
            <div className="bg-card border border-card-border rounded-3xl overflow-hidden">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-card-border">
                <div className="p-6 flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Breed</p>
                  <p className="font-serif text-3xl text-foreground">{detect.data.breed}</p>
                </div>
                <div className="p-6 flex items-center justify-center">
                  <ConfidenceRing value={detect.data.confidence} />
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {detect.data.characteristics.map((c, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended products */}
            {detect.data.recommendedProducts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-2xl">Recommended for {detect.data.breed}</h3>
                  <Link href="/shop" className="text-sm text-primary hover:underline">Browse all</Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {detect.data.recommendedProducts.map((p) => (
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

            <p className="text-xs text-muted-foreground italic border-t border-card-border pt-6">
              {detect.data.disclaimer}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
