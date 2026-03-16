"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Template = {
    id: string; type: string; label: string; category: string; active: boolean;
    widthMin: number; widthMax: number; heightDefault: number; depthDefault: number;
    plywoodMult: number; finishMult: number; edgeBandMult: number;
    shelves: number; doors: number; drawers: number; shutterMode: string;
    hardware: unknown; accessories: unknown; notes: string | null;
};

const CATEGORIES = ["kitchen", "wardrobe", "tv-unit", "bedroom", "study", "office"];
const CATEGORY_COLORS: Record<string, string> = {
    kitchen: "bg-amber-100 text-amber-800",
    wardrobe: "bg-teal-100 text-teal-800",
    "tv-unit": "bg-blue-100 text-blue-800",
    bedroom: "bg-pink-100 text-pink-800",
    study: "bg-green-100 text-green-800",
    office: "bg-purple-100 text-purple-800",
};

export function ModuleTemplateManager({ templates }: { templates: Template[] }) {
    const router = useRouter();
    const [editing, setEditing] = useState<Template | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    const visible = filter === "all" ? templates : templates.filter(t => t.category === filter);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editing) return;
        setLoading(true);
        setError("");

        try {
            // Parse JSON fields before sending
            const hardware = JSON.parse(
                (e.currentTarget.elements.namedItem("hardware") as HTMLTextAreaElement).value
            );
            const accessories = JSON.parse(
                (e.currentTarget.elements.namedItem("accessories") as HTMLTextAreaElement).value
            );

            const res = await fetch(`/api/admin/module-templates/${editing.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editing, hardware, accessories }),
            });

            if (!res.ok) throw new Error("Failed to save");
            setEditing(null);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
                {["all", ...CATEGORIES].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`rounded-full px-4 py-1 text-sm border transition-colors ${filter === cat
                                ? "bg-foreground text-background border-foreground"
                                : "border-border text-muted-foreground hover:border-foreground/50"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Edit form */}
            {editing && (
                <Card>
                    <CardHeader>
                        <CardTitle>Editing: {editing.label} ({editing.type})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Plywood multiplier</label>
                                    <Input type="number" step="0.05" value={editing.plywoodMult}
                                        onChange={e => setEditing({ ...editing, plywoodMult: +e.target.value })} />
                                    <p className="mt-1 text-xs text-muted-foreground">× width × height = sqft</p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Finish multiplier</label>
                                    <Input type="number" step="0.05" value={editing.finishMult}
                                        onChange={e => setEditing({ ...editing, finishMult: +e.target.value })} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Edge band (rft)</label>
                                    <Input type="number" step="1" value={editing.edgeBandMult}
                                        onChange={e => setEditing({ ...editing, edgeBandMult: +e.target.value })} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Shelves</label>
                                    <Input type="number" step="1" min="0" value={editing.shelves}
                                        onChange={e => setEditing({ ...editing, shelves: +e.target.value })} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Doors</label>
                                    <Input type="number" step="1" min="0" value={editing.doors}
                                        onChange={e => setEditing({ ...editing, doors: +e.target.value })} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Drawers</label>
                                    <Input type="number" step="1" min="0" value={editing.drawers}
                                        onChange={e => setEditing({ ...editing, drawers: +e.target.value })} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Shutter mode</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editing.shutterMode}
                                        onChange={e => setEditing({ ...editing, shutterMode: e.target.value })}
                                    >
                                        <option value="HINGED">Hinged</option>
                                        <option value="SLIDING">Sliding</option>
                                        <option value="OPEN">Open</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Width min (ft)</label>
                                    <Input type="number" step="0.1" value={editing.widthMin}
                                        onChange={e => setEditing({ ...editing, widthMin: +e.target.value })} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Width max (ft)</label>
                                    <Input type="number" step="0.1" value={editing.widthMax}
                                        onChange={e => setEditing({ ...editing, widthMax: +e.target.value })} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Hardware JSON
                                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                                            {"{"}  "Soft Close Hinges": 4, "Handles": 2  {"}"}
                                        </span>
                                    </label>
                                    <Textarea
                                        name="hardware"
                                        rows={5}
                                        defaultValue={JSON.stringify(editing.hardware, null, 2)}
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Accessories JSON
                                    </label>
                                    <Textarea
                                        name="accessories"
                                        rows={5}
                                        defaultValue={JSON.stringify(editing.accessories, null, 2)}
                                        className="font-mono text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Notes</label>
                                <Input value={editing.notes ?? ""}
                                    onChange={e => setEditing({ ...editing, notes: e.target.value })} />
                            </div>

                            {error && <p className="text-sm text-destructive">{error}</p>}

                            <div className="flex gap-3">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save changes"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Template table */}
            <Card>
                <CardHeader><CardTitle>All templates ({visible.length})</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {visible.map(t => (
                            <div key={t.id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[t.category] ?? ""}`}>
                                            {t.category}
                                        </span>
                                        <span className="font-medium text-sm">{t.label}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{t.type}</span>
                                        {!t.active && <Badge variant="outline">inactive</Badge>}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>ply ×{t.plywoodMult}</span>
                                        <span>fin ×{t.finishMult}</span>
                                        <span>{t.shelves}sh / {t.doors}dr / {t.drawers}dw</span>
                                        <span>{t.shutterMode.toLowerCase()}</span>
                                        <Button size="sm" variant="outline" onClick={() => setEditing(t)}>
                                            Edit
                                        </Button>
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