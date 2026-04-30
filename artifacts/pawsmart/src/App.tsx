import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { useGetCart } from "@workspace/api-client-react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

import Home from "@/pages/home";
import Shop from "@/pages/shop";
import ProductDetail from "@/pages/shop/detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/orders/detail";
import Pets from "@/pages/pets";
import BreedDetector from "@/pages/ai/breed-detector";
import FoodRecommender from "@/pages/ai/food-recommender";
import SymptomChecker from "@/pages/ai/symptom-checker";
import VetConsult from "@/pages/vet";
import AdminDashboard from "@/pages/admin";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: false } },
});

function Header() {
  const { userEmail, role, setUser } = useAuth();
  const { data: cart } = useGetCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const navItems = [
    { href: "/shop", label: "Shop" },
    { href: "/ai/breed-detector", label: "Breed AI" },
    { href: "/ai/food-recommender", label: "Food AI" },
    { href: "/ai/symptom-checker", label: "Symptom AI" },
    { href: "/pets", label: "My Pets" },
    { href: "/orders", label: "Orders" },
    { href: "/vet", label: "Vet Consult" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-block h-8 w-8 rounded-full bg-primary/90"></span>
            <span className="font-serif text-2xl tracking-tight text-foreground">PawSmart</span>
          </Link>
          <nav className="hidden lg:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <select
            value={userEmail}
            onChange={(e) => setUser(e.target.value)}
            className="hidden sm:block text-xs md:text-sm border border-input rounded-full px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-testid="user-switcher"
          >
            <option value="guest@pawsmart.pk">Guest Shopper</option>
            <option value="admin@pawsmart.pk">Admin</option>
          </select>
          <button
            onClick={() => setLocation("/cart")}
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary/60 transition-colors"
            data-testid="cart-button"
          >
            <ShoppingBag className="h-5 w-5 text-foreground" />
            {cart && cart.count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold">
                {cart.count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary/60"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden border-t border-card-border bg-background/95 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-foreground py-2"
              >
                {item.label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-primary py-2"
              >
                Admin
              </Link>
            )}
            <select
              value={userEmail}
              onChange={(e) => setUser(e.target.value)}
              className="text-sm border border-input rounded-full px-3 py-2 bg-background mt-2"
            >
              <option value="guest@pawsmart.pk">Guest Shopper</option>
              <option value="admin@pawsmart.pk">Admin</option>
            </select>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-card-border bg-card/40 mt-24">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block h-7 w-7 rounded-full bg-primary/90"></span>
            <span className="font-serif text-xl text-foreground">PawSmart</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thoughtful pet care for Pakistan — premium essentials, AI guidance,
            and on-call vets.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/shop" className="hover:text-foreground">All Products</Link></li>
            <li><Link href="/shop" className="hover:text-foreground">Dogs</Link></li>
            <li><Link href="/shop" className="hover:text-foreground">Cats</Link></li>
            <li><Link href="/shop" className="hover:text-foreground">Grooming</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">AI Tools</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/ai/breed-detector" className="hover:text-foreground">Breed Detector</Link></li>
            <li><Link href="/ai/food-recommender" className="hover:text-foreground">Food Recommender</Link></li>
            <li><Link href="/ai/symptom-checker" className="hover:text-foreground">Symptom Checker</Link></li>
            <li><Link href="/vet" className="hover:text-foreground">Vet Consult</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Karachi, Lahore, Islamabad</li>
            <li>Free shipping over Rs. 5,000</li>
            <li>Cash on delivery available</li>
            <li>care@pawsmart.pk</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-card-border">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground text-center">
          © 2026 PawSmart Pakistan — Crafted with care in Karachi
        </div>
      </div>
    </footer>
  );
}

function AppRouter() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/shop/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orders" component={Orders} />
          <Route path="/orders/:id" component={OrderDetail} />
          <Route path="/pets" component={Pets} />
          <Route path="/ai/breed-detector" component={BreedDetector} />
          <Route path="/ai/food-recommender" component={FoodRecommender} />
          <Route path="/ai/symptom-checker" component={SymptomChecker} />
          <Route path="/vet" component={VetConsult} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
