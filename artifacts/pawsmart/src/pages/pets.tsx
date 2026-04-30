import { useState } from "react";
import {
  useListPets,
  useCreatePet,
  useUpdatePet,
  useDeletePet,
  getListPetsQueryKey,
} from "@workspace/api-client-react";
import type { Pet } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, PawPrint } from "lucide-react";
import { toast } from "sonner";

type PetForm = {
  name: string;
  type: "dog" | "cat";
  breed: string;
  ageYears: number;
  weightKg: number;
  healthNotes: string;
};

const EMPTY: PetForm = {
  name: "",
  type: "dog",
  breed: "",
  ageYears: 1,
  weightKg: 5,
  healthNotes: "",
};

export default function Pets() {
  const queryClient = useQueryClient();
  const { data: pets, isLoading } = useListPets();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pet | null>(null);
  const [form, setForm] = useState<PetForm>(EMPTY);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListPetsQueryKey() });

  const createPet = useCreatePet({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Pet added");
        setOpen(false);
      },
    },
  });
  const updatePet = useUpdatePet({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Pet updated");
        setOpen(false);
      },
    },
  });
  const deletePet = useDeletePet({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Pet removed");
      },
    },
  });

  function startCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function startEdit(p: Pet) {
    setEditing(p);
    setForm({
      name: p.name,
      type: p.type as "dog" | "cat",
      breed: p.breed,
      ageYears: p.ageYears,
      weightKg: p.weightKg,
      healthNotes: p.healthNotes ?? "",
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updatePet.mutate({ id: editing.id, data: form });
    } else {
      createPet.mutate({ data: form });
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-serif text-foreground">My Pets</h1>
          <p className="text-muted-foreground mt-1">
            Profiles power our food and care recommendations.
          </p>
        </div>
        <Button onClick={startCreate} className="rounded-full h-11 px-6" data-testid="add-pet">
          <Plus className="h-4 w-4 mr-2" />
          Add Pet
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : !pets || pets.length === 0 ? (
        <div className="text-center py-20 bg-secondary/30 rounded-3xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-background mb-4">
            <PawPrint className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-serif mb-2">No pets yet</h2>
          <p className="text-muted-foreground mb-6">
            Add your first companion to unlock tailored guidance.
          </p>
          <Button onClick={startCreate} className="rounded-full px-6">
            Add your first pet
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {pets.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-card-border rounded-2xl p-6"
              data-testid={`pet-${p.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
                    <PawPrint className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl">{p.name}</h3>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {p.type} • {p.breed}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(p)}
                    className="h-8 w-8 rounded-full hover:bg-secondary/60 inline-flex items-center justify-center"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => deletePet.mutate({ id: p.id })}
                    className="h-8 w-8 rounded-full hover:bg-destructive/15 inline-flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-secondary/40 rounded-xl px-3 py-2">
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{p.ageYears} years</p>
                </div>
                <div className="bg-secondary/40 rounded-xl px-3 py-2">
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-medium">{p.weightKg} kg</p>
                </div>
              </div>
              {p.healthNotes && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {p.healthNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editing ? "Edit Pet" : "Add Pet"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Bruno"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as "dog" | "cat" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Breed</Label>
                <Input
                  required
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  placeholder="Labrador"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    required
                    value={form.ageYears}
                    onChange={(e) =>
                      setForm({ ...form, ageYears: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    required
                    value={form.weightKg}
                    onChange={(e) =>
                      setForm({ ...form, weightKg: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Health notes</Label>
                <Textarea
                  rows={3}
                  value={form.healthNotes}
                  onChange={(e) =>
                    setForm({ ...form, healthNotes: e.target.value })
                  }
                  placeholder="Any allergies, conditions, or quirks..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPet.isPending || updatePet.isPending}>
                {editing ? "Save changes" : "Add pet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
