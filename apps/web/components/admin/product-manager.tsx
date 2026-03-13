"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";

type Category = { id: string; slug: string; label: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  priceRange: string;
  unit: string;
  inStock: boolean;
  images: string[];
  category: { label: string; slug: string };
  specifications: { id: string; label: string; value: string }[];
};

type ProductManagerProps = { categories: Category[]; products: Product[] };
type ProductFormState = {
  name: string;
  slug: string;
  categorySlug: string;
  brand: string;
  description: string;
  priceRange: string;
  unit: string;
  inStock: boolean;
  images: string[];
  specificationsText: string;
};

const initialState: ProductFormState = {
  name: "",
  slug: "",
  categorySlug: "",
  brand: "",
  description: "",
  priceRange: "",
  unit: "",
  inStock: true,
  images: [],
  specificationsText: "",
};

function specificationsToText(specifications: Product["specifications"]) {
  return specifications.map((specification) => `${specification.label}|${specification.value}`).join("\n");
}

function parseSpecifications(specificationsText: string) {
  return specificationsText.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label, value] = line.split("|").map((part) => part.trim());
    return { label, value };
  });
}

export function ProductManager({ categories, products }: ProductManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      categorySlug: product.category.slug,
      brand: product.brand,
      description: product.description,
      priceRange: product.priceRange,
      unit: product.unit,
      inStock: product.inStock,
      images: product.images,
      specificationsText: specificationsToText(product.specifications),
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
      const response = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, specifications: parseSpecifications(form.specificationsText) }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error || "Unable to save product");
        return;
      }

      resetForm();
      router.refresh();
    } catch {
      setError("Unable to save product");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) return;
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (response.ok) {
      if (editingId === id) resetForm();
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{editingId ? "Edit Product" : "Add Product"}</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              <Input placeholder="Slug" value={form.slug} onChange={(event) => updateField("slug", event.target.value)} />
              <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.categorySlug} onChange={(event) => updateField("categorySlug", event.target.value)}>
                <option value="">Select category</option>
                {categories.map((category) => <option key={category.id} value={category.slug}>{category.label}</option>)}
              </select>
              <Input placeholder="Brand" value={form.brand} onChange={(event) => updateField("brand", event.target.value)} />
              <Input placeholder="Price range" value={form.priceRange} onChange={(event) => updateField("priceRange", event.target.value)} />
              <Input placeholder="Unit" value={form.unit} onChange={(event) => updateField("unit", event.target.value)} />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input checked={form.inStock} onChange={(event) => updateField("inStock", event.target.checked)} type="checkbox" />
              In stock
            </label>

            <Textarea placeholder="Description" rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} />

            <div className="space-y-2">
              <p className="text-sm font-medium">Images</p>
              <ImageUploader images={form.images} onChange={(images) => updateField("images", images)} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Specifications</p>
              <Textarea placeholder="One specification per line: Label|Value" rows={6} value={form.specificationsText} onChange={(event) => updateField("specificationsText", event.target.value)} />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex gap-3">
              <Button disabled={loading} type="submit">{loading ? "Saving..." : editingId ? "Update Product" : "Create Product"}</Button>
              {editingId ? <Button onClick={resetForm} type="button" variant="outline">Cancel</Button> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Existing Products</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category.label} • {product.slug}</p>
                    <p className="text-sm text-muted-foreground">{product.specifications.length} specifications • {product.images.length} images</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => startEdit(product)} type="button" variant="outline">Edit</Button>
                    <Button onClick={() => void handleDelete(product.id)} type="button" variant="destructive">Delete</Button>
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
