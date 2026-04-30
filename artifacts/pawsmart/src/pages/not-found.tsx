import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center max-w-xl">
      <p className="text-xs uppercase tracking-widest text-primary mb-3">
        404
      </p>
      <h1 className="text-5xl font-serif text-foreground mb-4">
        We couldn't fetch that page.
      </h1>
      <p className="text-muted-foreground mb-8">
        The link may have moved, or perhaps a curious cat sat on the keyboard.
      </p>
      <Link href="/">
        <Button size="lg" className="rounded-full px-8 h-12">
          Back home
        </Button>
      </Link>
    </div>
  );
}
