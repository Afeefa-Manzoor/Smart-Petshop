import { Link } from "wouter";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLockout() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-xl text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary/60 mb-5">
        <Lock className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-serif mb-2">Admin only</h1>
      <p className="text-muted-foreground mb-6">
        Switch to the Admin profile from the header to access this area.
      </p>
      <Link href="/">
        <Button variant="outline" className="rounded-full px-6">
          Back home
        </Button>
      </Link>
    </div>
  );
}
