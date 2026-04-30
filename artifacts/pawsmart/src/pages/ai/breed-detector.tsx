import { useState } from "react";
import { Link } from "wouter";
import { useAiBreedDetect, useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
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
import { Sparkles, Upload, AlertCircle } from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { toast } from "sonner";

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload or paste an image first");
      return;
    }
    detect.mutate({ data: { imageUrl, petType } });
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium tracking-wider uppercase mb-4">
          <Sparkles className="h-3 w-3" />
          AI Tool
        </span>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-3">
          Breed Detector
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Upload a clear photo of your pet — we will identify the most likely
          breed and recommend tailored products and care tips.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <form
          onSubmit={submit}
          className="bg-card border border-card-border rounded-2xl p-6 space-y-5"
        >
          <div className="space-y-2">
            <Label>Pet Type</Label>
            <Select
              value={petType}
              onValueChange={(v) => setPetType(v as "dog" | "cat")}
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
            <Label>Image URL</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={imageUrl.startsWith("data:") ? "" : imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreview(e.target.value);
              }}
            />
          </div>
          <div className="text-center text-xs text-muted-foreground">— or —</div>
          <label className="border-2 border-dashed border-input rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/30 transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">Upload from device</span>
            <span className="text-xs text-muted-foreground">JPG or PNG</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </label>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full h-12"
            disabled={detect.isPending}
          >
            {detect.isPending ? "Analyzing..." : "Detect Breed"}
          </Button>
          <p className="text-xs text-muted-foreground italic flex gap-2">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            Visual estimates only. Not a substitute for DNA testing.
          </p>
        </form>

        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          {preview ? (
            <div className="aspect-square bg-secondary/30">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="aspect-square bg-secondary/30 flex items-center justify-center text-muted-foreground text-sm">
              Image preview will appear here
            </div>
          )}
        </div>
      </div>

      {detect.data && (
        <div className="mt-10 bg-card border border-card-border rounded-3xl p-8 space-y-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary mb-1">
                Detected Breed
              </p>
              <h2 className="text-3xl font-serif">{detect.data.breed}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Confidence
              </p>
              <p className="text-2xl font-serif">
                {Math.round(detect.data.confidence * 100)}%
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-3">Characteristics</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {detect.data.characteristics.map((c, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {detect.data.recommendedProducts.length > 0 && (
            <div>
              <h3 className="font-serif text-lg mb-3">Recommended Products</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {detect.data.recommendedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-secondary/30 rounded-2xl p-4 flex flex-col"
                  >
                    <Link href={`/shop/${p.id}`}>
                      <div className="aspect-square bg-background/60 rounded-xl mb-3 overflow-hidden">
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

          <p className="text-xs text-muted-foreground italic border-t border-card-border pt-4">
            {detect.data.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
