"use client";

import { Badge } from "@/components/ui/badge";
import { Dimensions, LayoutType } from "@/lib/estimator/types";

interface RoomPreviewProps {
  dimensions: Dimensions;
  layout: LayoutType;
  categoryLabel: string;
}

function getPath(layout: LayoutType, width: number, depth: number): string {
  const x = 26;
  const y = 26;
  const w = width;
  const d = depth;

  switch (layout) {
    case "L_SHAPE":
      return `M ${x} ${y} H ${x + w} V ${y + d * 0.38} H ${x + w * 0.48} V ${y + d} H ${x} Z`;
    case "U_SHAPE":
      return `M ${x} ${y} H ${x + w} V ${y + d} H ${x + w * 0.72} V ${y + d * 0.38} H ${x + w * 0.28} V ${y + d} H ${x} Z`;
    case "ISLAND":
      return `M ${x} ${y} H ${x + w} V ${y + d} H ${x} Z M ${x + w * 0.32} ${y + d * 0.3} H ${x + w * 0.68} V ${y + d * 0.68} H ${x + w * 0.32} Z`;
    case "PARALLEL":
      return `M ${x} ${y} H ${x + w} V ${y + d * 0.24} H ${x} Z M ${x} ${y + d * 0.76} H ${x + w} V ${y + d} H ${x} Z`;
    case "SLIDING":
      return `M ${x} ${y} H ${x + w} V ${y + d} H ${x} Z M ${x + w * 0.5} ${y} V ${y + d}`;
    case "WALK_IN":
      return `M ${x} ${y} H ${x + w} V ${y + d} H ${x} Z M ${x + w * 0.2} ${y + d * 0.2} H ${x + w * 0.8} V ${y + d * 0.8} H ${x + w * 0.2} Z`;
    default:
      return `M ${x} ${y} H ${x + w} V ${y + d} H ${x} Z`;
  }
}

export function RoomPreview({ dimensions, layout, categoryLabel }: RoomPreviewProps) {
  const planWidth = dimensions.width;
  const planDepth = dimensions.depth;

  if (!planWidth || !planDepth) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-foreground/10 bg-[linear-gradient(180deg,rgba(248,246,241,0.85),rgba(255,255,255,0.95))] p-6 text-center">
        <p className="text-sm font-medium">Preview will appear here</p>
        <p className="mt-2 text-sm text-muted-foreground">Enter width and depth to generate the room sketch.</p>
      </div>
    );
  }

  const maxDimension = Math.max(planWidth, planDepth, 1);
  const scale = 150 / maxDimension;
  const renderWidth = planWidth * scale;
  const renderDepth = planDepth * scale;
  const planArea = (planWidth * planDepth).toFixed(1);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-foreground/10 bg-[linear-gradient(180deg,rgba(248,246,241,0.88),rgba(255,255,255,0.98))]">
      <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
        <div>
          <p className="text-sm font-semibold">{categoryLabel} preview</p>
          <p className="text-xs text-muted-foreground">{layout.replace(/_/g, " ")} layout</p>
        </div>
        <Badge variant="outline" className="rounded-full">{planArea} sq ft</Badge>
      </div>

      <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-6">
        <svg width="260" height="220" viewBox="0 0 260 220" className="overflow-visible text-primary">
          <defs>
            <linearGradient id="planFill" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path
            d={getPath(layout, renderWidth, renderDepth)}
            fill="url(#planFill)"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <text x="130" y="16" textAnchor="middle" fill="currentColor" className="text-xs font-semibold">
            {planWidth} ft
          </text>
          <text
            x="14"
            y="118"
            textAnchor="middle"
            fill="currentColor"
            className="text-xs font-semibold"
            transform="rotate(-90 14 118)"
          >
            {planDepth} ft
          </text>
        </svg>

        <div className="mt-3 grid w-full gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-background/70 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Width</p>
            <p className="mt-1 font-semibold">{planWidth} ft</p>
          </div>
          <div className="rounded-2xl bg-background/70 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Depth</p>
            <p className="mt-1 font-semibold">{planDepth} ft</p>
          </div>
          <div className="rounded-2xl bg-background/70 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Height</p>
            <p className="mt-1 font-semibold">{dimensions.height} ft</p>
          </div>
        </div>
      </div>
    </div>
  );
}
