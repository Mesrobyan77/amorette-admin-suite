import { cn } from "@/utils/format";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-2xl", className)} />;
}

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("inline-block h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin", className)} />
  );
}
