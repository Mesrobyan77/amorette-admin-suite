export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number, currency = "֏") {
  if (typeof amount !== "number" || isNaN(amount)) return `0 ${currency}`;
  return `${amount.toLocaleString()} ${currency}`;
}

export function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return d; }
}
