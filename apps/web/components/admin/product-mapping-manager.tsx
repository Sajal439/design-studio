"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Mapping = {
    id: string; pattern: string; productSlugs: string[];
    reason: string; priority: number; active: boolean;
};
type ProductOption = { slug: string; name: string; category: string };

export function ProductMappingManager({
    mappings,
    products,
}: {
    mappings: Mapping[];
    products: ProductOption[];
}) {
    const router = useRouter();
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<Mapping>>({});
    const [slugsText, setSlugsText] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function startEdit(m: Mapping) {
        setEditId(m.id);
        setForm(m);
        setSlugsText(m.productSlugs.join("\n"));
        setError("");
    }

    function startNew() {
        setEditId("new");
        setForm({ pattern: "", reason: "", priority: 100, active: true });
        setSlugsText("");
        setError("");
    }

    async function handleSave() {
        setSaving(true);
        setError("");
        const slugs = slugsText.split("\n").map(s => s.trim()).filter(Boolean);
        if (!form.pattern || slugs.length === 0) {
            setError("Pattern and at least one product slug are required.");
            setSaving(false);
            return;
        }

        // Validate: all slugs must exist in the product list
        const known = new Set(products.map(p => p.slug));
        const bad = slugs.filter(s => !known.has(s));
        if (bad.length > 0) {
            setError(`Unknown slugs: ${bad.join(", ")}. Check the Products catalog.`);
            setSaving(false);
            return;
        }

        const payload = { ...form, productSlugs: slugs };
        const isNew = editId === "new";
        const url = isNew ? "/api/admin/product-mappings" : `/api/admin/product-mappings/${editId}`;
        const method = isNew ? "POST" : "PATCH";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Save failed");
            setEditId(null);
            router.refresh();
        } catch {
            setError("Failed to save. Try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this mapping?")) return;
        await fetch(`/api/admin/product-mappings/${id}`, { method: "DELETE" });
        router.refresh();
    }

    const productBySlug = new Map(products.map(p => [p.slug, p]));

    return (
        <div className="space-y-6">
            {/* Edit / new form */}
            {editId && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editId === "new" ? "New mapping" : "Edit mapping"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Pattern <span className="font-normal text-muted-foreground">(regex, case-insensitive)</span>
                                </label>
                                <Input
                                    value={form.pattern ?? ""}
                                    onChange={e => setForm({ ...form, pattern: e.target.value })}
                                    placeholder="PLYWOOD|MDF|HDHMR"
                                    className="font-mono"
                                />
                                {form.pattern && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Matches: {products.filter(p =>
                                            new RegExp(form.pattern!, "i").test(p.name)
                                        ).slice(0, 3).map(p => p.name).join(", ") || "no products matched"}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Priority</label>
                                <Input
                                    type="number"
                                    value={form.priority ?? 100}
                                    onChange={e => setForm({ ...form, priority: +e.target.value })}
                                />
                                <p className="mt-1 text-xs text-muted-foreground">Lower = runs first</p>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Product slugs <span className="font-normal text-muted-foreground">(one per line, tried in order)</span>
                            </label>
                            <Textarea
                                value={slugsText}
                                onChange={e => setSlugsText(e.target.value)}
                                rows={4}
                                placeholder={"bwr-plywood-19mm\nmarine-plywood-19mm"}
                                className="font-mono text-xs"
                            />
                            {/* Live preview of resolved products */}
                            <div className="mt-2 flex flex-wrap gap-2">
                                {slugsText.split("\n").map(s => s.trim()).filter(Boolean).map(slug => {
                                    const p = productBySlug.get(slug);
                                    return (
                                        <span
                                            key={slug}
                                            className={`rounded-md px-2 py-0.5 text-xs ${p
                                                    ? "bg-green-50 text-green-800 border border-green-200"
                                                    : "bg-red-50 text-red-800 border border-red-200"
                                                }`}
                                        >
                                            {p ? p.name : `✗ ${slug}`}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Reason shown on recommendation card</label>
                            <Input
                                value={form.reason ?? ""}
                                onChange={e => setForm({ ...form, reason: e.target.value })}
                                placeholder="Soft-close hinge recommendation matched to shutter hardware demand."
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.active ?? true}
                                onChange={e => setForm({ ...form, active: e.target.checked })}
                            />
                            Active
                        </label>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <div className="flex gap-3">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </Button>
                            <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Mappings list */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Active mappings ({mappings.length})</CardTitle>
                    <Button size="sm" onClick={startNew}>Add mapping</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {mappings.map(m => (
                            <div key={m.id} className="rounded-lg border p-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <code className="rounded bg-muted px-2 py-0.5 text-xs">{m.pattern}</code>
                                            <span className="text-xs text-muted-foreground">priority {m.priority}</span>
                                            {!m.active && <Badge variant="outline">inactive</Badge>}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {m.productSlugs.map((slug, i) => {
                                                const p = productBySlug.get(slug);
                                                return (
                                                    <span
                                                        key={slug}
                                                        className={`rounded-md px-2 py-0.5 text-xs ${p
                                                                ? "bg-muted text-muted-foreground"
                                                                : "bg-red-50 text-red-700 border border-red-200"
                                                            }`}
                                                    >
                                                        {i === 0 ? "→ " : "or "}
                                                        {p ? p.name : `✗ ${slug} (not in DB)`}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{m.reason}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => startEdit(m)}>Edit</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}>Delete</Button>
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