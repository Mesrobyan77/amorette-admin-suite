import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileImage, Eye, Star, Sparkles, Plus, ArrowUpRight, TrendingUp } from "lucide-react";
import { templatesApi, type Template } from "@/api/templates";
import { analyticsApi, deriveTrendsFromTemplates, type TrendPoint } from "@/api/analytics";
import { Card, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { TrendChart } from "@/components/ui/TrendChart";
import { DateRangePicker, rangeFromPreset, type DateRange } from "@/components/ui/DateRangePicker";
import { formatCurrency, formatDate, cn } from "@/utils/format";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function extractList(payload: any): Template[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function DashboardPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chart state
  const [range, setRange] = useState<DateRange>(() => rangeFromPreset("30d"));
  const [metric, setMetric] = useState<"views" | "rating">("views");
  const [trend, setTrend] = useState<TrendPoint[] | null>(null);
  const [trendFallback, setTrendFallback] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await templatesApi.list();
        if (!alive) return;
        setTemplates(extractList(data));
      } catch (e: any) {
        if (alive) setError(e?.response?.data?.message || "Failed to load templates");
      }
    })();
    return () => { alive = false; };
  }, []);

  // Fetch trends when range changes; gracefully fall back to derived data.
  useEffect(() => {
    let alive = true;
    setTrend(null);
    (async () => {
      try {
        const { data } = await analyticsApi.trends({
          from: range.from.toISOString(),
          to: range.to.toISOString(),
        });
        if (!alive) return;
        setTrend(Array.isArray((data as any)?.series) ? (data as any).series : []);
        setTrendFallback(false);
      } catch {
        if (!alive) return;
        // Backend not ready — derive from templates once they're loaded
        setTrendFallback(true);
      }
    })();
    return () => { alive = false; };
  }, [range.from, range.to]);

  const fallbackSeries = useMemo(
    () => (trendFallback && templates ? deriveTrendsFromTemplates(templates, range.from, range.to) : null),
    [trendFallback, templates, range.from, range.to],
  );
  const chartData = trend ?? fallbackSeries ?? [];

  const total = templates?.length ?? 0;
  const totalViews = templates?.reduce((s, t) => s + (t.views || 0), 0) ?? 0;
  const ratings = templates?.filter((t) => typeof t.rating === "number") ?? [];
  const avgRating = ratings.length
    ? (ratings.reduce((s, t) => s + (t.rating || 0), 0) / ratings.length).toFixed(2)
    : "—";
  const latest = (templates ?? []).slice().sort((a, b) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  ).slice(0, 4);

  const stats = [
    { label: "Total Templates", value: total, icon: FileImage, accent: "from-[var(--gold)] to-[var(--primary)]" },
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, accent: "from-[var(--primary)] to-[var(--rose)]" },
    { label: "Average Rating", value: avgRating, icon: Star, accent: "from-[var(--gold)] to-[var(--accent)]" },
    { label: "Active Status", value: "Live", icon: Sparkles, accent: "from-[var(--sage)] to-[var(--gold)]" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Welcome to <span className="text-gradient-gold">Amorette</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your luxury wedding templates with ease.</p>
        </div>
        <Link to="/admin/templates/create">
          <Button variant="gold"><Plus className="h-4 w-4" /> Create Template</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.accent} opacity-20 blur-2xl`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {templates === null ? (
                    <Skeleton className="h-8 w-24 mt-2" />
                  ) : (
                    <p className="font-display text-3xl mt-1">{s.value}</p>
                  )}
                </div>
                <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${s.accent} text-primary-foreground flex items-center justify-center ring-luxe`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--gold)]" /> Trends
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {trendFallback ? "Showing estimated data" : "Live analytics"} · {range.from.toLocaleDateString()} — {range.to.toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-2xl border border-border bg-card p-1">
              {(["views", "rating"] as const).map((m) => {
                const active = metric === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={cn(
                      "px-3 h-8 rounded-xl text-xs font-medium transition capitalize",
                      active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            <DateRangePicker value={range} onChange={setRange} />
          </div>
        </div>
        {chartData.length === 0 ? (
          <Skeleton className="h-64 sm:h-72 w-full" />
        ) : (
          <TrendChart data={chartData} metric={metric} />
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Latest Templates</CardTitle>
          <Link to="/admin/templates" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {templates === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <FileImage className="h-10 w-10 mx-auto mb-2 opacity-50" />
            No templates yet. Create your first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latest.map((t) => (
              <Link key={t.id || t._id} to="/admin/templates/$id" params={{ id: (t.id || t._id) as string }}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-border overflow-hidden bg-card group"
                >
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {t.mainImage ? (
                      <img src={t.mainImage} alt={t.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <FileImage className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                    <p className="text-sm mt-1 text-gradient-gold font-semibold">{formatCurrency(t.basePrice, t.currency || "֏")}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
