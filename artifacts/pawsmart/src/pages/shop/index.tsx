import { useState } from "react";
import { Link } from "wouter";
import { useListProducts, useListCategories, useListBrands } from "@workspace/api-client-react";
import { formatPKR } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [petType, setPetType] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [sort, setSort] = useState<string>("popular");

  const { data: products, isLoading } = useListProducts({
    search: search || undefined,
    category: category || undefined,
    petType: petType || undefined,
    brand: brand || undefined,
    sort: sort as any,
  });

  const { data: categories } = useListCategories();
  const { data: brands } = useListBrands();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
          <div>
            <h2 className="text-xl font-serif mb-4 text-foreground">Filters</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Search</Label>
                <Input 
                  placeholder="Search products..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label>Pet Type</Label>
                <Select value={petType} onValueChange={setPetType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Pets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pets</SelectItem>
                    <SelectItem value="dog">Dogs</SelectItem>
                    <SelectItem value="cat">Cats</SelectItem>
                    <SelectItem value="small_pet">Small Pets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setCategory("")} 
                    className={`text-left text-sm px-2 py-1 rounded ${!category ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50"}`}
                  >
                    All Categories
                  </button>
                  {categories?.map((c) => (
                    <button 
                      key={c.category}
                      onClick={() => setCategory(c.category)} 
                      className={`text-left text-sm px-2 py-1 rounded flex justify-between items-center ${category === c.category ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50"}`}
                    >
                      <span className="capitalize">{c.category.replace("_", " ")}</span>
                      <span className="text-xs opacity-50">{c.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands?.map((b) => (
                      <SelectItem key={b.brand} value={b.brand}>{b.brand} ({b.count})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-foreground">Our Catalog</h1>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap hidden sm:inline-block">Sort by</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popularity</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="bg-secondary/30 aspect-square rounded-2xl"></div>
                  <div className="h-4 bg-secondary/30 rounded w-2/3"></div>
                  <div className="h-4 bg-secondary/30 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 bg-secondary/20 rounded-2xl">
              <h3 className="text-xl font-serif mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
              <button 
                onClick={() => { setSearch(""); setCategory(""); setPetType(""); setBrand(""); }}
                className="mt-4 text-primary hover:underline font-medium text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-card-border hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square bg-secondary/10 relative overflow-hidden p-6 flex items-center justify-center">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                    />
                    {product.popular && (
                      <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground border-none">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{product.brand}</div>
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2">{product.name}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="font-semibold text-lg">{formatPKR(product.price)}</span>
                      <span className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">View details</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
