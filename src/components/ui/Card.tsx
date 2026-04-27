import type { ReactNode, HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/utils/format";

type DivAttrs = Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">>;

interface CardProps extends DivAttrs {
  children: ReactNode;
  hoverable?: boolean;
  glass?: boolean;
}

export function Card({ className, children, hoverable, glass, ...props }: CardProps) {
  const Comp: any = hoverable ? motion.div : "div";
  const motionProps = hoverable
    ? { whileHover: { y: -4 }, transition: { type: "spring", stiffness: 300, damping: 22 } }
    : {};
  return (
    <Comp
      className={cn(
        "rounded-3xl p-5 sm:p-6",
        glass ? "glass" : "bg-card text-card-foreground border border-border",
        "shadow-[0_4px_20px_-8px_color-mix(in_oklab,var(--foreground)_15%,transparent)]",
        hoverable && "cursor-pointer hover:shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--primary)_35%,transparent)]",
        className,
      )}
      {...motionProps}
      {...(props as any)}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}
export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("font-display text-xl sm:text-2xl text-foreground", className)}>{children}</h3>;
}
export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground mt-1", className)}>{children}</p>;
}
