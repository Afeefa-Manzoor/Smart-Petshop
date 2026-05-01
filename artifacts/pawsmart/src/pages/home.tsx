import { Link } from "wouter";
import { useListFeaturedProducts, useListPopularInPakistan } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/currency";

export default function Home() {
  const { data: featured } = useListFeaturedProducts();
  const { data: popular } = useListPopularInPakistan();

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero */}
      <section className="relative bg-secondary/30 pt-20 pb-32">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div className="max-w-xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight">
              Thoughtful care for your best friend.
            </h1>
            <p className="text-lg text-muted-foreground">
              A curated selection of premium pet essentials, AI-powered health insights, and expert veterinary guidance for pet owners in Pakistan.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                Shop Essentials
              </Link>
              <Link href="/ai/breed-detector" className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                Try Breed AI
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            {/* Placeholder for hero image */}
            <div className="aspect-[4/3] rounded-3xl bg-muted overflow-hidden shadow-2xl">
              <img src={import.meta.env.BASE_URL + "seed/hero.jpg"} alt="Happy dog" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif mb-2">Featured Collection</h2>
            <p className="text-muted-foreground">Handpicked essentials for exceptional care.</p>
          </div>
          <Link href="/shop" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featured?.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`} className="group group-hover:opacity-100">
              <div className="aspect-square rounded-2xl bg-secondary/20 mb-4 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover:scale-105" />
              </div>
              <h3 className="font-medium text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <p className="mt-2 font-medium">{formatPKR(product.price)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
