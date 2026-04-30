import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useGetProduct(id);
  
  const addCartItem = useAddCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast.success("Added to cart", {
          description: `${quantity}x ${product?.name}`,
        });
      },
      onError: () => {
        toast.error("Failed to add to cart");
      }
    }
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-20 text-center animate-pulse">Loading product details...</div>;
  }

  if (isError || !product) {
    return <div className="container mx-auto px-4 py-20 text-center text-destructive">Product not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/shop" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shop
      </Link>

      <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-secondary/10 p-12 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-card-border">
            {product.popular && (
              <Badge className="absolute top-6 left-6 bg-accent text-accent-foreground border-none text-sm py-1 px-3">
                Customer Favorite
              </Badge>
            )}
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full max-h-[500px] object-contain mix-blend-multiply" 
            />
          </div>
          
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-sm font-semibold tracking-widest text-primary uppercase">{product.brand}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <span className="text-3xl font-medium text-foreground">{formatPKR(product.price)}</span>
              <Badge variant="outline" className="text-sm capitalize font-normal border-border bg-background">
                {product.weight}
              </Badge>
            </div>

            <div className="prose prose-sm text-muted-foreground mb-8">
              <p>{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Category</span>
                <span className="capitalize text-foreground font-medium">{product.category.replace("_", " ")}</span>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">For</span>
                <span className="capitalize text-foreground font-medium">{product.petType}</span>
              </div>
              {product.ageGroup && (
                <div>
                  <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Age</span>
                  <span className="capitalize text-foreground font-medium">{product.ageGroup}</span>
                </div>
              )}
              {product.healthCondition && (
                <div>
                  <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Health Support</span>
                  <span className="capitalize text-foreground font-medium">{product.healthCondition}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <div className="flex items-center border border-input rounded-full bg-background h-14 w-full sm:w-auto overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary/20"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary/20"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <Button 
                onClick={() => addCartItem.mutate({ data: { productId: product.id, quantity } })}
                disabled={addCartItem.isPending || product.stock === 0}
                className="h-14 rounded-full px-8 flex-1 text-base shadow-md"
              >
                {addCartItem.isPending ? "Adding..." : product.stock === 0 ? "Out of Stock" : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
            
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-accent font-medium text-sm mt-4 text-center sm:text-left">
                Only {product.stock} left in stock!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
