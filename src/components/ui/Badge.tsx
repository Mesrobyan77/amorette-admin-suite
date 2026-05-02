import { cn } from "@/utils/format";
import type { ReactNode } from "react";

type Variant = "default" | "gold" | "sage" | "rose" | "muted";

const variants: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  gold: "bg-[color-mix(in_oklab,var(--gold)_22%,transparent)] text-foreground",
  sage: "bg-[color-mix(in_oklab,var(--sage)_30%,transparent)] text-foreground",
  rose: "bg-[color-mix(in_oklab,var(--rose)_30%,transparent)] text-foreground",
  muted: "bg-muted text-muted-foreground",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
