import { Link } from "wouter";
import { useListFeaturedProducts, useListPopularInPakistan } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/currency";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: featured } = useListFeaturedProducts();
  const { data: popular } = useListPopularInPakistan();

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden bg-[hsl(15,20%,14%)]"
        style={{ minHeight: "90vh" }}
      >
        {/* Cat image — right 60 % */}
        <div
          className="absolute inset-y-0 right-0 w-full md:w-[62%] pointer-events-none"
          aria-hidden="true"
        >
          <img
            src={import.meta.env.BASE_URL + "seed/hero_cat.png"}
            alt=""
            className="h-full w-full object-cover object-center"
          />
          {/* left-edge fade so text sits clean */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[hsl(15,20%,14%)] to-transparent" />
        </div>

        {/* Semi-transparent overlay for mobile (full cover) */}
        <div className="absolute inset-0 bg-[hsl(15,20%,14%)]/60 md:hidden" aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-10 flex flex-col justify-center h-full"
          style={{ minHeight: "90vh" }}
        >
          <div className="max-w-lg py-24 md:py-0">
            <p className="text-[hsl(90,12%,56%)] text-xs tracking-[0.25em] uppercase font-medium mb-5">
              Premium Pet Care · Pakistan
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-[hsl(40,40%,95%)] leading-[1.05] mb-6">
              A life of comfort for your companion.
            </h1>
            <p className="text-[hsl(35,20%,70%)] text-base md:text-lg leading-relaxed mb-10 max-w-sm">
              Curated food, expert AI care, and on-call vets — all in one place
              for pet owners across Pakistan.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 h-13 px-8 py-3.5 rounded-full bg-[hsl(90,12%,56%)] text-white font-medium text-sm hover:bg-[hsl(90,12%,48%)] transition-colors shadow-lg"
              >
                Shop Essentials
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/ai/breed-detector"
                className="inline-flex items-center gap-2 h-13 px-8 py-3.5 rounded-full border border-white/20 text-[hsl(40,40%,90%)] font-medium text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Try Breed AI
              </Link>
            </div>

            {/* Stat row */}
            <div className="mt-14 flex gap-10">
              <div>
                <p className="text-[hsl(40,40%,95%)] font-serif text-3xl">24+</p>
                <p className="text-[hsl(35,20%,60%)] text-xs mt-0.5">Premium products</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-[hsl(40,40%,95%)] font-serif text-3xl">3</p>
                <p className="text-[hsl(35,20%,60%)] text-xs mt-0.5">AI health tools</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-[hsl(40,40%,95%)] font-serif text-3xl">COD</p>
                <p className="text-[hsl(35,20%,60%)] text-xs mt-0.5">Across Pakistan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to page bg */}
        <div
          className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, hsl(40,40%,98%))" }}
          aria-hidden="true"
        />
      </section>

      {/* ── FEATURED COLLECTION ── */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif mb-2">Featured Collection</h2>
            <p className="text-muted-foreground">Handpicked essentials for exceptional care.</p>
          </div>
          <Link href="/shop" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured?.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`} className="group">
              <div className="aspect-square rounded-2xl bg-secondary/20 mb-3 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover:scale-105 duration-500"
                />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
              <h3 className="font-medium text-foreground text-sm mt-0.5 line-clamp-2">{product.name}</h3>
              <p className="mt-1.5 font-semibold">{formatPKR(product.price)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── POPULAR IN PAKISTAN ── */}
      {popular && popular.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif mb-2">Popular in Pakistan</h2>
              <p className="text-muted-foreground">What pet owners across Pakistan are loving.</p>
            </div>
            <Link href="/shop" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {popular.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="group">
                <div className="aspect-square rounded-2xl bg-secondary/20 mb-3 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover:scale-105 duration-500"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    Popular
                  </span>
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
                <h3 className="font-medium text-foreground text-sm mt-0.5 line-clamp-2">{product.name}</h3>
                <p className="mt-1.5 font-semibold">{formatPKR(product.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CATEGORY STRIP ── */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-serif mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Food & Nutrition", filter: "food", bg: "bg-secondary/60", img: "/seed/product_1.png" },
            { label: "Grooming", filter: "grooming", bg: "bg-primary/15", img: "/seed/product_p16.png" },
            { label: "Toys", filter: "toys", bg: "bg-accent/15", img: "/seed/product_13.png" },
            { label: "Accessories", filter: "accessories", bg: "bg-secondary/40", img: "/seed/product_12.jpg" },
          ].map((cat) => (
            <Link
              key={cat.label}
              href={`/shop?category=${cat.filter}`}
              className={`group ${cat.bg} rounded-3xl p-6 flex flex-col items-center gap-4 hover:shadow-md transition-shadow overflow-hidden relative`}
            >
              <div className="h-24 w-24 rounded-full bg-background/60 flex items-center justify-center overflow-hidden">
                <img src={cat.img} alt="" className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="font-medium text-foreground text-sm">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── AI TOOLS BANNER ── */}
      <section className="container mx-auto px-4">
        <div className="bg-[hsl(15,20%,14%)] rounded-3xl overflow-hidden">
          <div className="p-8 md:p-12 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <p className="text-[hsl(90,12%,56%)] text-xs tracking-widest uppercase mb-3">Powered by AI</p>
              <h2 className="font-serif text-3xl text-[hsl(40,40%,95%)] mb-2">Care tools that think.</h2>
              <p className="text-[hsl(35,20%,65%)] text-sm leading-relaxed">
                Upload a photo, describe symptoms, or ask about food — our AI gives you instant, breed-specific answers.
              </p>
            </div>
            {[
              { href: "/ai/breed-detector", title: "Breed Detector", desc: "Identify your pet's breed from a single photo." },
              { href: "/ai/food-recommender", title: "Food Recommender", desc: "Tailored diet plans based on age, breed, and health." },
              { href: "/ai/symptom-checker", title: "Symptom Checker", desc: "Spot health concerns before they become serious." },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-5 flex flex-col gap-2"
              >
                <h3 className="font-serif text-lg text-[hsl(40,40%,95%)]">{tool.title}</h3>
                <p className="text-[hsl(35,20%,65%)] text-sm">{tool.desc}</p>
                <span className="mt-2 text-[hsl(90,12%,56%)] text-xs font-medium inline-flex items-center gap-1">
                  Try it <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
