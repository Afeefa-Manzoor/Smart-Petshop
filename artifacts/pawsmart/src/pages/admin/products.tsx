import { useState } from "react";
import {
  useAdminListProducts,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
  getAdminListProductsQueryKey,
  getListProductsQueryKey,
  getListFeaturedProductsQueryKey,
  getListPopularInPakistanQueryKey,
} from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPKR } from "@/lib/currency";
import { AdminNav } from "./index";
import { AdminLockout } from "./_lockout";
import { useAuth } from "@/lib/auth";

type Form = {
  name: string;
  brand: string;
  category: string;
  petType: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  weight: string;
  expiryDate: string;
  popular: boolean;
  breed: string;
  ageGroup: string;
  healthCondition: string;
};

const EMPTY: Form = {
  name: "",
  brand: "",
  category: "food",
  petType: "dog",
  price: 1000,
  stock: 10,
  description: "",
  image: "/seed/product_1.png",
  weight: "1kg",
  expiryDate: "2027-01-01",
  popular: false,
  breed: "",
  ageGroup: "all",
  healthCondition: "",
};

export default function AdminProducts() {
  const { role } = useAuth();
  if (role !== "admin") return <AdminLockout />;

  const queryClient = useQueryClient();
  const { data: products, isLoading } = useAdminListProducts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListFeaturedProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListPopularInPakistanQueryKey() });
  };

  const create = useAdminCreateProduct({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Product created");
        setOpen(false);
      },
      onError: () => toast.error("Could not save product"),
    },
  });
  const update = useAdminUpdateProduct({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Product updated");
        setOpen(false);
      },
      onError: () => toast.error("Could not update product"),
    },
  });
  const del = useAdminDeleteProduct({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Product removed");
      },
    },
  });

  function startCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function startEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      petType: p.petType,
      price: p.price,
      stock: p.stock,
      description: p.description,
      image: p.image,
      weight: p.weight,
      expiryDate: p.expiryDate,
      popular: p.popular,
      breed: p.breed ?? "",
      ageGroup: p.ageGroup ?? "all",
      healthCondition: p.healthCondition ?? "",
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      breed: form.breed || null,
      ageGroup: form.ageGroup || null,
      healthCondition: form.healthCondition || null,
    };
    if (editing) {
      update.mutate({ id: editing.id, data });
    } else {
      create.mutate({ data });
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <AdminNav />
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-serif text-foreground">Products</h1>
          <p className="text-muted-foreground">
            {products?.length ?? 0} items in catalog
          </p>
        </div>
        <Button onClick={startCreate} className="rounded-full h-11 px-6" data-testid="add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Product</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Pet</th>
                <th className="text-right px-5 py-3 font-medium">Price</th>
                <th className="text-right px-5 py-3 font-medium">Stock</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : (
                products?.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/20" data-testid={`product-${p.id}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary/30 overflow-hidden flex-shrink-0">
                          <img
                            src={p.image}
                            alt=""
                            className="h-full w-full object-cover mix-blend-multiply"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 capitalize">{p.category}</td>
                    <td className="px-5 py-4 capitalize">{p.petType}</td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {formatPKR(p.price)}
                    </td>
                    <td
                      className={`px-5 py-4 text-right tabular-nums ${
                        p.stock < 10 ? "text-amber-700 font-medium" : ""
                      }`}
                    >
                      {p.stock}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => startEdit(p)}
                          className="h-8 w-8 rounded-full hover:bg-secondary/60 inline-flex items-center justify-center"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => del.mutate({ id: p.id })}
                          className="h-8 w-8 rounded-full hover:bg-destructive/15 inline-flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editing ? "Edit Product" : "New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid sm:grid-cols-2 gap-4 py-4">
              <div className="sm:col-span-2 space-y-2">
                <Label>Name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["food", "treats", "accessories", "toys", "grooming"].map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pet Type</Label>
                <Select value={form.petType} onValueChange={(v) => setForm({ ...form, petType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Age Group</Label>
                <Select value={form.ageGroup} onValueChange={(v) => setForm({ ...form, ageGroup: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["all", "puppy", "kitten", "adult", "senior"].map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (PKR)</Label>
                <Input type="number" min={0} required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min={0} required value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input required value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="2kg, 500ml..." />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Breed (optional)</Label>
                <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Health Condition (optional)</Label>
                <Input value={form.healthCondition} onChange={(e) => setForm({ ...form, healthCondition: e.target.value })} placeholder="dental, joint..." />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Image Path</Label>
                <Input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/seed/product_1.png" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <Switch checked={form.popular} onCheckedChange={(v) => setForm({ ...form, popular: v })} />
                <Label className="!mt-0">Mark as popular / featured</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending || update.isPending}>
                {editing ? "Save changes" : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
