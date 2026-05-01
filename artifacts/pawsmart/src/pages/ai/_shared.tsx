import { Link, useLocation } from "wouter";
import { Sparkles } from "lucide-react";

const TOOLS = [
  { href: "/ai/breed-detector", label: "Breed Detector", desc: "Identify from a photo" },
  { href: "/ai/food-recommender", label: "Food Recommender", desc: "Tailored diet plans" },
  { href: "/ai/symptom-checker", label: "Symptom Checker", desc: "Spot health concerns" },
];

export function AiHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const [location] = useLocation();
  return (
    <div className="bg-[hsl(15,20%,14%)] pt-12 pb-0">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[hsl(90,12%,56%)]" />
          <span className="text-[hsl(90,12%,56%)] text-xs font-semibold tracking-[0.2em] uppercase">
            AI Tools
          </span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-[hsl(40,40%,95%)] mb-2 leading-tight">
          {title}
        </h1>
        <p className="text-[hsl(35,20%,65%)] text-base md:text-lg mb-8 max-w-2xl">
          {subtitle}
        </p>
        {/* Tool Tab Nav */}
        <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
          {TOOLS.map((t) => {
            const active = location === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex-shrink-0 px-5 py-3 rounded-t-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-background text-foreground"
                    : "text-[hsl(35,20%,60%)] hover:text-[hsl(40,40%,85%)] hover:bg-white/5"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
