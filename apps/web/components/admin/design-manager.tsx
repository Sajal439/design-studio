"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";

type Category = { id: string; slug: string; label: string };
type Design = {
  id: string;
  title: string;
  slug: string;
  description: string;
  estimatedCost: string;
  roomSize: string;
  style: string;
  images: { url: string; publicId: string }[];
  category: { label: string; slug: string };
  materials: { id: string; name: string; quantity: number; unit: string }[];
};

type DesignManagerProps = { categories: Category[]; designs: Design[] };
type DesignFormState = {
  title: string;
  slug: string;
  categorySlug: string;
  description: string;
  estimatedCost: string;
  roomSize: string;
  style: string;
  images: { url: string; publicId: string }[];
  materialsText: string;
};

const initialState: DesignFormState = {
  title: "",
  slug: "",
  categorySlug: "",
  description: "",
  estimatedCost: "",
  roomSize: "",
  style: "",
  images: [],
  materialsText: "",
};

function materialsToText(materials: Design["materials"]) {
  return materials.map((material) => `${material.name}|${material.quantity}|${material.unit}`).join("\n");
}

function parseMaterials(materialsText: string) {
  return materialsText.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name, quantity, unit] = line.split("|").map((part) => part.trim());
    return { name, quantity: Number(quantity), unit };
  });
}

export function DesignManager({ categories, designs }: DesignManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DesignFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof DesignFormState>(key: K, value: DesignFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(design: Design) {
    setEditingId(design.id);
    setForm({
      title: design.title,
      slug: design.slug,
      categorySlug: design.category.slug,
      description: design.description,
      estimatedCost: design.estimatedCost,
      roomSize: design.roomSize,
      style: design.style,
      images: design.images,
      materialsText: materialsToText(design.materials),
    });
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialState);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(editingId ? `/api/admin/designs/${editingId}` : "/api/admin/designs", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, materials: parseMaterials(form.materialsText) }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error || "Unable to save design");
        return;
      }

      resetForm();
      router.refresh();
    } catch {
      setError("Unable to save design");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this design?")) return;
    const response = await fetch(`/api/admin/designs/${id}`, { method: "DELETE" });
    if (response.ok) {
      if (editingId === id) resetForm();
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{editingId ? "Edit Design" : "Add Design"}</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Title" value={form.title} onChange={(event) => updateField("title", event.target.value)} />
              <Input placeholder="Slug" value={form.slug} onChange={(event) => updateField("slug", event.target.value)} />
              <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.categorySlug} onChange={(event) => updateField("categorySlug", event.target.value)}>
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.slug}>{category.label}</option>)}
              </select>
              <Input placeholder="Estimated cost" value={form.estimatedCost} onChange={(event) => updateField("estimatedCost", event.target.value)} />
              <Input placeholder="Room size" value={form.roomSize} onChange={(event) => updateField("roomSize", event.target.value)} />
              <Input placeholder="Style" value={form.style} onChange={(event) => updateField("style", event.target.value)} />
            </div>

            <Textarea placeholder="Description" rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} />

            <div className="space-y-2">
              <p className="text-sm font-medium">Images</p>
              <ImageUploader images={form.images} onChange={(images) => updateField("images", images)} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Materials</p>
              <Textarea placeholder="One material per line: Material Name|Quantity|Unit" rows={6} value={form.materialsText} onChange={(event) => updateField("materialsText", event.target.value)} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-3">
              <Button disabled={loading} type="submit">{loading ? "Saving..." : editingId ? "Update Design" : "Create Design"}</Button>
              {editingId ? <Button onClick={resetForm} type="button" variant="outline">Cancel</Button> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Existing Designs</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {designs.map((design) => (
              <div key={design.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">{design.title}</p>
                    <p className="text-sm text-muted-foreground">{design.category.label} • {design.slug}</p>
                    <p className="text-sm text-muted-foreground">{design.materials.length} materials • {design.images.length} images</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => startEdit(design)} type="button" variant="outline">Edit</Button>
                    <Button onClick={() => void handleDelete(design.id)} type="button" variant="destructive">Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
