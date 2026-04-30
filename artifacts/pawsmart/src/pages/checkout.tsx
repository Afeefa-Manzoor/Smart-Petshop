import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  useGetCart,
  useCreateOrder,
  getGetCartQueryKey,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPKR } from "@/lib/currency";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function Checkout() {
  const { data: cart } = useGetCart();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState({
    customerName: "",
    address: "",
    phone: "",
    notes: "",
  });

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (order) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast.success("Order placed successfully");
        setLocation(`/orders/${order.id}`);
      },
      onError: () => toast.error("Could not place your order"),
    },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif mb-4">Nothing to checkout</h1>
        <p className="text-muted-foreground mb-6">
          Add some products to your cart first.
        </p>
        <Link href="/shop">
          <Button className="rounded-full px-8 h-11">Browse Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>
      <h1 className="text-4xl font-serif text-foreground mb-2">Checkout</h1>
      <p className="text-muted-foreground mb-10">
        Cash on delivery available across Pakistan.
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createOrder.mutate({ data: form });
          }}
          className="lg:col-span-2 space-y-6 bg-card border border-card-border rounded-2xl p-8"
        >
          <h2 className="font-serif text-xl mb-2">Delivery Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="customerName">Full Name</Label>
              <Input
                id="customerName"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Ali Hassan"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+92 300 1234567"
                data-testid="input-phone"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea
                id="address"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House 12, Street 5, DHA Phase 6, Karachi"
                rows={3}
                data-testid="input-address"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Leave at the gate, ring the bell once..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-secondary/40 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Your details are kept private. We deliver in 1–3 business days
              and accept cash on delivery.
            </p>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full h-12"
            disabled={createOrder.isPending}
            data-testid="place-order-button"
          >
            {createOrder.isPending ? "Placing order..." : `Place Order — ${formatPKR(cart.total)}`}
          </Button>
        </form>

        <aside className="lg:col-span-1">
          <div className="sticky top-28 p-6 bg-card border border-card-border rounded-2xl">
            <h2 className="font-serif text-xl mb-5">Your Order</h2>
            <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
              {cart.items.map((it) => (
                <div key={it.productId} className="flex gap-3 text-sm">
                  <div className="h-12 w-12 rounded-lg bg-secondary/40 overflow-hidden flex-shrink-0">
                    <img src={it.product.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{it.product.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {it.quantity} × {formatPKR(it.product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-card-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPKR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{cart.shipping === 0 ? "Free" : formatPKR(cart.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-serif pt-2 border-t border-card-border">
                <span>Total</span>
                <span>{formatPKR(cart.total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
