import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading your orders...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-secondary/60 mb-6">
          <Package className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-serif mb-3">No orders yet</h1>
        <p className="text-muted-foreground mb-8">
          Your future orders will appear here.
        </p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full px-8 h-12">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-serif text-foreground mb-2">Your Orders</h1>
      <p className="text-muted-foreground mb-8">
        {orders.length} {orders.length === 1 ? "order" : "orders"} placed.
      </p>
      <div className="space-y-4">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="block bg-card border border-card-border rounded-2xl p-6 hover:shadow-md transition-shadow"
            data-testid={`order-${o.id}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Order #{o.id}
                </p>
                <p className="font-serif text-xl">{o.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`capitalize ${STATUS_COLORS[o.status] || ""}`}
              >
                {o.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {o.items.slice(0, 4).map((it, i) => (
                  <div
                    key={i}
                    className="h-12 w-12 rounded-full ring-2 ring-card overflow-hidden bg-secondary/40"
                  >
                    <img src={it.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                  </div>
                ))}
                {o.items.length > 4 && (
                  <div className="h-12 w-12 rounded-full ring-2 ring-card bg-secondary flex items-center justify-center text-xs font-medium">
                    +{o.items.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-serif text-lg">{formatPKR(o.total)}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
