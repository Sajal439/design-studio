import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { CategoryData, DesignOption } from "./useEstimatorState";

const CATEGORY_META: Record<string, { copy: string }> = {
    kitchen: { copy: "Base cabinets, wall units, corners, and tall storage." },
    wardrobe: { copy: "Sliding, hinged, and walk-in layouts with hardware logic." },
    "tv-unit": { copy: "Back panels, floating cabinets, shelves, and lighting add-ons." },
    bedroom: { copy: "Bed, side tables, wardrobe, dresser, and loft storage in one flow." },
    study: { copy: "Table tops, drawer pedestals, shelving, and cable management." },
    office: { copy: "Workstations, storage, meeting tables, and partitions." },
};

interface Props {
    selectedCategory: CategoryData;
    onSelect: (design: DesignOption) => void;
    onBack: () => void;
}

export function StepReference({ selectedCategory, onSelect, onBack }: Props) {
    const meta = CATEGORY_META[selectedCategory.slug] ?? { copy: "Layout-driven planning." };

    return (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[1.75rem] border border-foreground/10 bg-[linear-gradient(135deg,rgba(255,251,245,0.95),rgba(255,255,255,0.96))] p-6">
                <Badge className="rounded-full bg-foreground text-background hover:bg-foreground">Selected category</Badge>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{selectedCategory.label}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{meta.copy}</p>
                <div className="mt-6 space-y-3">
                    {[
                        "Reference designs help tune finish and accessory assumptions.",
                        "You can still edit layout and dimensions in the next steps.",
                        "The final estimate will show the BOM, price range, and planning summary.",
                    ].map((line) => (
                        <div key={line} className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-background/75 p-3">
                            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="h-3.5 w-3.5" />
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">{line}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 2</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Pick the closest design reference.</h3>
                </div>
                <div className="grid gap-4">
                    {selectedCategory.designs.map((design) => (
                        <Card
                            key={design.slug}
                            className="cursor-pointer border border-foreground/10 bg-background transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            onClick={() => onSelect(design)}
                        >
                            <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="rounded-full">{design.style}</Badge>
                                        <Badge variant="secondary" className="rounded-full">{design.roomSize}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold">{design.title}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">Typical budget: {design.estimatedCost}</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="rounded-full px-4">
                                    Use this reference <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Button variant="ghost" onClick={onBack} className="w-full justify-start">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to categories
                </Button>
            </div>
        </div>
    );
}