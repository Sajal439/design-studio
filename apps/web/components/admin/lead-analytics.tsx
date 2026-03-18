"use client";

import { BarChart3 } from "lucide-react";

interface LeadTrendBarProps {
  /** Array of { label: "Mon", quotes: 3, consultations: 1, estimates: 2 } */
  data: { label: string; quotes: number; consultations: number; estimates: number }[];
}

function max(data: LeadTrendBarProps["data"]) {
  return Math.max(...data.map((d) => d.quotes + d.consultations + d.estimates), 1);
}

export function LeadTrendBars({ data }: LeadTrendBarProps) {
  const peak = max(data);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-blue-500" /> Quotes</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-green-500" /> Consultations</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-amber-500" /> Estimates</span>
      </div>
      <div className="flex items-end gap-1.5 h-36">
        {data.map((day) => {
          const total = day.quotes + day.consultations + day.estimates;
          const heightPct = (total / peak) * 100;
          const qPct = total > 0 ? (day.quotes / total) * 100 : 0;
          const cPct = total > 0 ? (day.consultations / total) * 100 : 0;

          return (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{total > 0 ? total : ""}</span>
              <div
                className="w-full rounded-t overflow-hidden"
                style={{ height: `${Math.max(heightPct, total > 0 ? 8 : 2)}%` }}
                title={`${day.label}: ${day.quotes} quotes, ${day.consultations} consultations, ${day.estimates} estimates`}
              >
                <div className="w-full bg-blue-500" style={{ height: `${qPct}%` }} />
                <div className="w-full bg-green-500" style={{ height: `${cPct}%` }} />
                <div className="w-full bg-amber-500" style={{ height: `${100 - qPct - cPct}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{day.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SourceBreakdownProps {
  items: { source: string; count: number }[];
}

export function SourceBreakdown({ items }: SourceBreakdownProps) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;

  return (
    <div className="space-y-2">
      {items.slice(0, 8).map((item) => (
        <div key={item.source} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="truncate text-muted-foreground">{item.source || "direct"}</span>
              <span className="font-medium">{item.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No source data yet — leads with source attribution will appear here.</p>
      )}
    </div>
  );
}
