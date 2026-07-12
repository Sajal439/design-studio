"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import {
    Plus,
    Pencil,
    Trash2,
    Star,
    StarOff,
    X,
    Check,
} from "lucide-react";

type Product = {
    id: string;
    name: string;
    brand: string | null;
    description: string | null;
    category: string;
    tier: string;
    price: number;
    isDefault: boolean;
    active: boolean;
};

type Tier = "BUDGET" | "STANDARD" | "PREMIUM";

const TIER_COLORS: Record<Tier, string> = {
    BUDGET: "bg-zinc-100 text-zinc-700 border-zinc-300",
    STANDARD: "bg-amber-50 text-amber-700 border-amber-300",
    PREMIUM: "bg-blue-50 text-blue-700 border-blue-300",
};

const TIERS: Tier[] = ["BUDGET", "STANDARD", "PREMIUM"];

const EMPTY_FORM = {
    name: "",
    brand: "",
    description: "",
    category: "",
    tier: "STANDARD" as Tier,
    price: "",
};

/** Capitalises and formats a raw category string for display, e.g. "plywood" → "Plywood" */
function formatCategory(cat: string) {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function ProductsManager({ products }: { products: Product[] }) {
    const router = useRouter();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState("");
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);

    // Derive unique categories from existing active products, sorted alphabetically
    const allCategories = Array.from(
        new Set(products.filter((p) => p.active).map((p) => p.category))
    ).sort();

    // Group products by category dynamically
    const grouped = allCategories.reduce<Record<string, Product[]>>((acc, cat) => {
        acc[cat] = products
            .filter((p) => p.category === cat && p.active)
            .sort((a, b) => {
                const tierOrder: Record<string, number> = { BUDGET: 0, STANDARD: 1, PREMIUM: 2 };
                return (tierOrder[a.tier] ?? 99) - (tierOrder[b.tier] ?? 99);
            });
        return acc;
    }, {});

    // ── Add product ───────────────────────────────────────────────────────────

    async function handleAdd() {
        setFormError("");
        if (!form.name.trim()) { setFormError("Product name is required."); return; }
        if (!form.category.trim()) { setFormError("Category is required."); return; }
        const price = parseFloat(form.price);
        if (isNaN(price) || price <= 0) { setFormError("Enter a valid price."); return; }

        setSubmitting(true);
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    brand: form.brand.trim() || undefined,
                    description: form.description.trim() || undefined,
                    category: form.category.trim().toLowerCase(),
                    tier: form.tier,
                    price,
                    isDefault: false,
                }),
            });
            if (!res.ok) throw new Error("Failed to add product.");
            setForm(EMPTY_FORM);
            setShowAddForm(false);
            router.refresh();
        } catch {
            setFormError("Failed to add. Try again.");
        } finally {
            setSubmitting(false);
        }
    }

    // ── Edit product price/name ───────────────────────────────────────────────

    function startEdit(p: Product) {
        setEditId(p.id);
        setEditPrice(String(p.price));
        setEditName(p.name);
    }

    async function saveEdit(p: Product) {
        const price = parseFloat(editPrice);
        if (isNaN(price) || price <= 0) return;
        setSaving(true);
        try {
            await fetch(`/api/products/${p.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, price }),
            });
            setEditId(null);
            router.refresh();
        } finally {
            setSaving(false);
        }
    }

    // ── Toggle default ────────────────────────────────────────────────────────

    async function toggleDefault(p: Product) {
        await fetch(`/api/products/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isDefault: !p.isDefault }),
        });
        router.refresh();
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    async function deleteProduct(id: string) {
        setDeleting(id);
        try {
            await fetch(`/api/products/${id}`, { method: "DELETE" });
            router.refresh();
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="space-y-8">
            {/* ── Add product form ── */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle>Products</CardTitle>
                    <Button
                        size="sm"
                        onClick={() => { setShowAddForm((v) => !v); setFormError(""); }}
                        className="gap-1.5"
                    >
                        {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {showAddForm ? "Cancel" : "Add Product"}
                    </Button>
                </CardHeader>

                {showAddForm && (
                    <CardContent className="border-t pt-5">
                        {/* datalist provides autocomplete suggestions from existing categories */}
                        <datalist id="category-suggestions">
                            {allCategories.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Product name *</label>
                                <Input
                                    ref={nameRef}
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. BWR Plywood 19mm"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Brand</label>
                                <Input
                                    value={form.brand}
                                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                    placeholder="e.g. Century"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Category * <span className="font-normal text-muted-foreground/70">(e.g. plywood, laminate, hardware)</span>
                                </label>
                                <Input
                                    list="category-suggestions"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    placeholder="e.g. plywood"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tier *</label>
                                <select
                                    value={form.tier}
                                    onChange={(e) => setForm({ ...form, tier: e.target.value as Tier })}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {TIERS.map((t) => (
                                        <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price (₹) *</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        placeholder="e.g. 18000"
                                        className="pr-8"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                                </div>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description (optional)</label>
                                <Input
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Short description for reference"
                                />
                            </div>
                        </div>
                        {formError && <p className="mt-2 text-xs text-destructive">{formError}</p>}
                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleAdd} disabled={submitting} size="sm">
                                {submitting ? "Adding…" : "Add Product"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setShowAddForm(false); setFormError(""); }}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* ── Product tables grouped by category (dynamic) ── */}
            {allCategories.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    No products yet. Click <strong>Add Product</strong> above to get started.
                </p>
            )}

            {allCategories.map((cat) => (
                <Card key={cat}>
                    <CardHeader>
                        <CardTitle className="text-base">{formatCategory(cat)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {grouped[cat]!.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No products yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="pb-2 pr-4 font-medium">Name / Brand</th>
                                            <th className="pb-2 pr-4 font-medium">Tier</th>
                                            <th className="pb-2 pr-4 font-medium text-right">Price</th>
                                            <th className="pb-2 pr-4 font-medium text-center">Estimator</th>
                                            <th className="pb-2 font-medium" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {grouped[cat]!.map((p) => (
                                            <tr key={p.id} className="group">
                                                <td className="py-3 pr-4">
                                                    {editId === p.id ? (
                                                        <Input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="h-8 w-full max-w-xs text-sm"
                                                        />
                                                    ) : (
                                                        <div>
                                                            <p className="font-medium">{p.name}</p>
                                                            {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TIER_COLORS[p.tier as Tier] ?? "bg-muted text-muted-foreground border-muted"}`}>
                                                        {p.tier.charAt(0) + p.tier.slice(1).toLowerCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-right font-mono">
                                                    {editId === p.id ? (
                                                        <div className="relative inline-block">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="100"
                                                                value={editPrice}
                                                                onChange={(e) => setEditPrice(e.target.value)}
                                                                className="h-8 w-28 pr-6 text-right text-sm"
                                                            />
                                                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                                                        </div>
                                                    ) : (
                                                        <span>₹{p.price.toLocaleString("en-IN")}</span>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-center">
                                                    <button
                                                        onClick={() => toggleDefault(p)}
                                                        title={p.isDefault ? "Currently used in estimator — click to unset" : "Use this product in estimator"}
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-colors ${p.isDefault
                                                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                            }`}
                                                    >
                                                        {p.isDefault ? (
                                                            <><Star className="h-3 w-3 fill-green-600 text-green-600" /> Active</>
                                                        ) : (
                                                            <><StarOff className="h-3 w-3" /> Set</>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {editId === p.id ? (
                                                            <>
                                                                <Button size="sm" onClick={() => saveEdit(p)} disabled={saving} className="h-7 px-2 text-xs">
                                                                    <Check className="h-3 w-3" />
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="h-7 px-2 text-xs">
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => startEdit(p)}
                                                                    className="h-7 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => deleteProduct(p.id)}
                                                                    disabled={deleting === p.id}
                                                                    className="h-7 px-2 text-xs text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
