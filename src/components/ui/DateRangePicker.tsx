import { useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/utils/format";

export type RangePreset = "7d" | "30d" | "90d" | "ytd" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  preset: RangePreset;
}

const presets: { key: Exclude<RangePreset, "custom">; label: string; days?: number }[] = [
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "90D", days: 90 },
  { key: "ytd", label: "YTD" },
];

export function rangeFromPreset(preset: Exclude<RangePreset, "custom">): DateRange {
  const to = new Date();
  const from = new Date(to);
  if (preset === "ytd") from.setMonth(0, 1);
  else from.setDate(to.getDate() - (presets.find((p) => p.key === preset)?.days || 30) + 1);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to, preset };
}

const toInputValue = (d: Date) => d.toISOString().slice(0, 10);

export function DateRangePicker({
  value, onChange, className,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="inline-flex rounded-2xl border border-border bg-card p-1">
        {presets.map((p) => {
          const active = value.preset === p.key;
          return (
            <button
              key={p.key}
              onClick={() => { onChange(rangeFromPreset(p.key)); setOpen(false); }}
              className={cn(
                "px-3 h-8 rounded-xl text-xs font-medium transition",
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          );
        })}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "px-3 h-8 rounded-xl text-xs font-medium transition inline-flex items-center gap-1.5",
            value.preset === "custom" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Calendar className="h-3.5 w-3.5" /> Custom
        </button>
      </div>

      {open && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={toInputValue(value.from)}
            onChange={(e) => {
              const from = new Date(e.target.value);
              if (!isNaN(from.getTime())) onChange({ ...value, from, preset: "custom" });
            }}
            className="h-9 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <input
            type="date"
            value={toInputValue(value.to)}
            onChange={(e) => {
              const to = new Date(e.target.value);
              if (!isNaN(to.getTime())) {
                to.setHours(23, 59, 59, 999);
                onChange({ ...value, to, preset: "custom" });
              }
            }}
            className="h-9 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}
    </div>
  );
}
