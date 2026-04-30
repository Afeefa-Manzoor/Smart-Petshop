import { Link, useParams } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Package, Truck, Home } from "lucide-react";

const STAGES = [
  { key: "pending", label: "Order Placed", icon: Check },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function OrderDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: order, isLoading } = useGetOrder(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif mb-3">Order not found</h1>
        <Link href="/orders" className="text-primary underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const stageIdx =
    order.status === "cancelled"
      ? -1
      : STAGES.findIndex((s) => s.key === order.status);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Orders
      </Link>
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Order #{order.id}
          </p>
          <h1 className="text-4xl font-serif text-foreground">
            {order.customerName}
          </h1>
          <p className="text-muted-foreground">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-PK", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`capitalize text-sm py-1.5 px-3 ${
            STATUS_COLORS[order.status] || ""
          }`}
        >
          {order.status}
        </Badge>
      </div>

      {order.status !== "cancelled" && (
        <div className="bg-card border border-card-border rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between gap-4">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const done = i <= stageIdx;
              return (
                <div key={stage.key} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        done ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-3 ${
                        i < stageIdx ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-card border border-card-border rounded-2xl p-6">
          <h2 className="font-serif text-xl mb-5 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Items
          </h2>
          <div className="divide-y divide-card-border">
            {order.items.map((it, i) => (
              <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-16 w-16 rounded-xl bg-secondary/40 overflow-hidden">
                  <img src={it.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {it.brand}
                  </p>
                  <p className="font-medium">{it.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty {it.quantity}
                  </p>
                </div>
                <span className="font-medium self-center">
                  {formatPKR(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-6">
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h3 className="font-serif text-lg mb-3">Delivery</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {order.address}
            </p>
            <p className="text-sm text-foreground mt-3">{order.phone}</p>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h3 className="font-serif text-lg mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping === 0 ? "Free" : formatPKR(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between font-serif text-lg pt-3 border-t border-card-border">
                <span>Total</span>
                <span>{formatPKR(order.total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
