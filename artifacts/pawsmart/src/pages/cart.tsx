import { Link, useLocation } from "wouter";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveCartItem,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatPKR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const update = useUpdateCartItem({ mutation: { onSuccess: invalidate } });
  const remove = useRemoveCartItem({ mutation: { onSuccess: invalidate } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading your cart...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-secondary/60 mb-6">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-serif mb-3">Your basket is empty</h1>
        <p className="text-muted-foreground mb-8">
          Browse our curated selection of premium pet essentials.
        </p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full px-8 h-12">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-serif text-foreground mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 bg-card border border-card-border rounded-2xl"
              data-testid={`cart-item-${item.productId}`}
            >
              <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-secondary/30 overflow-hidden">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-full w-full object-cover mix-blend-multiply"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {item.product.brand}
                    </p>
                    <h3 className="font-medium text-foreground">
                      {item.product.name}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      remove.mutate({ productId: item.productId })
                    }
                    className="text-muted-foreground hover:text-destructive p-1"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center border border-input rounded-full">
                    <button
                      onClick={() =>
                        update.mutate({
                          productId: item.productId,
                          data: { quantity: Math.max(0, item.quantity - 1) },
                        })
                      }
                      className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-sm font-medium min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        update.mutate({
                          productId: item.productId,
                          data: { quantity: item.quantity + 1 },
                        })
                      }
                      className="px-3 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-medium">
                    {formatPKR(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="lg:col-span-1">
          <div className="sticky top-28 p-6 bg-card border border-card-border rounded-2xl">
            <h2 className="font-serif text-xl mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm pb-5 border-b border-card-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPKR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {cart.shipping === 0 ? "Free" : formatPKR(cart.shipping)}
                </span>
              </div>
              {cart.shipping > 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Free shipping on orders over Rs. 5,000
                </p>
              )}
            </div>
            <div className="flex justify-between items-baseline pt-5 mb-6">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-2xl text-foreground">
                {formatPKR(cart.total)}
              </span>
            </div>
            <Button
              onClick={() => setLocation("/checkout")}
              size="lg"
              className="w-full rounded-full h-12"
              data-testid="checkout-button"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Link href="/shop">
              <Button
                variant="ghost"
                className="w-full rounded-full mt-2"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
