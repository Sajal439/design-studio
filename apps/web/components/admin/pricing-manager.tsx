"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Entry = {
    id: string; key: string; category: string; label: string;
    value: number; unit: string; notes: string | null; active: boolean;
};

const CATEGORY_ORDER = ["SHEET", "HARDWARE", "RATE"];

const CATEGORY_LABELS: Record<string, string> = {
    SHEET: "Sheet prices (per sqft)",
    HARDWARE: "Hardware and accessory prices",
    RATE: "Rate percentages",
};

function formatValue(value: number, unit: string): string {
    if (unit === "percentage") return `${(value * 100).toFixed(1)}%`;
    return `₹${value.toLocaleString("en-IN")}`;
}

export function PricingManager({ entries }: { entries: Entry[] }) {
    const router = useRouter();
    const [editId, setEditId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const grouped = CATEGORY_ORDER.reduce<Record<string, Entry[]>>((acc, cat) => {
        acc[cat] = entries.filter(e => e.category === cat);
        return acc;
    }, {});

    function startEdit(entry: Entry) {
        setEditId(entry.id);
        // For rates show as percentage (e.g. 0.26 → "26")
        const display = entry.unit === "percentage"
            ? String((entry.value * 100).toFixed(1))
            : String(entry.value);
        setEditValue(display);
        setError("");
        setTimeout(() => inputRef.current?.focus(), 50);
    }

    async function saveEdit(entry: Entry) {
        setSaving(true);
        setError("");

        const raw = parseFloat(editValue);
        if (isNaN(raw) || raw < 0) {
            setError("Enter a valid positive number.");
            setSaving(false);
            return;
        }

        // Convert percentage display back to decimal
        const stored = entry.unit === "percentage" ? raw / 100 : raw;

        try {
            const res = await fetch(`/api/admin/pricing/${entry.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value: stored }),
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

    function cancelEdit() {
        setEditId(null);
        setError("");
    }

    return (
        <div className="space-y-8">
            {CATEGORY_ORDER.map(cat => (
                <Card key={cat}>
                    <CardHeader>
                        <CardTitle>{CATEGORY_LABELS[cat]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {grouped[cat]?.map(entry => (
                                <div
                                    key={entry.id}
                                    className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-muted/40"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{entry.label}</p>
                                        <div className="mt-0.5 flex items-center gap-3">
                                            <span className="font-mono text-xs text-muted-foreground">{entry.key}</span>
                                            {entry.notes && (
                                                <span className="text-xs text-muted-foreground">— {entry.notes}</span>
                                            )}
                                        </div>
                                        {editId === entry.id && error && (
                                            <p className="mt-1 text-xs text-destructive">{error}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {editId === entry.id ? (
                                            <>
                                                <div className="relative">
                                                    <Input
                                                        ref={inputRef}
                                                        type="number"
                                                        step={entry.unit === "percentage" ? "0.1" : "1"}
                                                        min="0"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === "Enter") saveEdit(entry);
                                                            if (e.key === "Escape") cancelEdit();
                                                        }}
                                                        className="w-28 pr-10 text-right"
                                                    />
                                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                                        {entry.unit === "percentage" ? "%" : "₹"}
                                                    </span>
                                                </div>
                                                <Button size="sm" onClick={() => saveEdit(entry)} disabled={saving}>
                                                    {saving ? "..." : "Save"}
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="min-w-[80px] text-right text-sm font-medium tabular-nums">
                                                    {formatValue(entry.value, entry.unit)}
                                                </span>
                                                <span className="w-20 text-xs text-muted-foreground">{entry.unit}</span>
                                                <Button size="sm" variant="outline" onClick={() => startEdit(entry)}>
                                                    Edit
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}