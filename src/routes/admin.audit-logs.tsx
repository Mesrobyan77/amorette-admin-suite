import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Search, ShieldCheck, LogIn, LogOut, FilePlus2,
  FilePenLine, FileX2, Filter, RefreshCw, Inbox,
} from "lucide-react";
import { auditApi, type AuditLog } from "@/api/audit";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DateRangePicker, rangeFromPreset, type DateRange } from "@/components/ui/DateRangePicker";
import { formatDate, cn } from "@/utils/format";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AuditLogsPage,
});

const ACTIONS: { key: string; label: string; group: "auth" | "template" }[] = [
  { key: "auth.login", label: "Login", group: "auth" },
  { key: "auth.logout", label: "Logout", group: "auth" },
  { key: "auth.logout_all", label: "Logout (all)", group: "auth" },
  { key: "template.create", label: "Template Created", group: "template" },
  { key: "template.update", label: "Template Updated", group: "template" },
  { key: "template.delete", label: "Template Deleted", group: "template" },
];

const ACTION_META: Record<string, { icon: any; variant: "gold" | "sage" | "rose" | "muted" | "default"; label: string }> = {
  "auth.login":        { icon: LogIn,        variant: "sage",    label: "Login" },
  "auth.logout":       { icon: LogOut,       variant: "muted",   label: "Logout" },
  "auth.logout_all":   { icon: ShieldCheck,  variant: "rose",    label: "Logout (all)" },
  "template.create":   { icon: FilePlus2,    variant: "gold",    label: "Template Created" },
  "template.update":   { icon: FilePenLine,  variant: "default", label: "Template Updated" },
  "template.delete":   { icon: FileX2,       variant: "rose",    label: "Template Deleted" },
};

const PAGE_SIZE = 15;

function extractList(payload: any): { items: AuditLog[]; total: number } {
  if (Array.isArray(payload)) return { items: payload, total: payload.length };
  if (Array.isArray(payload?.items)) return { items: payload.items, total: payload.total ?? payload.items.length };
  if (Array.isArray(payload?.data)) return { items: payload.data, total: payload.total ?? payload.data.length };
  return { items: [], total: 0 };
}

function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [actor, setActor] = useState("");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<DateRange>(() => rangeFromPreset("30d"));
  const [page, setPage] = useState(1);
  const [serverPaginated, setServerPaginated] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await auditApi.list({
        page,
        limit: PAGE_SIZE,
        action: actionFilter !== "all" ? actionFilter : undefined,
        actor: actor || undefined,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      });
      const { items, total } = extractList(data);
      setLogs(items);
      setTotal(total);
      // Heuristic: if backend returned <=PAGE_SIZE while total > PAGE_SIZE, it's paginating server-side
      setServerPaginated(items.length <= PAGE_SIZE && total > items.length);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, actionFilter, range.from, range.to]);

  // Client-side filtering layer (search + actor-fuzzy) on top of whatever the server returned.
  const clientFiltered = useMemo(() => {
    let list = logs || [];
    if (actor.trim()) {
      const q = actor.toLowerCase();
      list = list.filter((l) =>
        (l.actorEmail || "").toLowerCase().includes(q) ||
        (l.actorName || "").toLowerCase().includes(q));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        (l.targetName || "").toLowerCase().includes(q) ||
        (l.targetId || "").toLowerCase().includes(q) ||
        (l.action || "").toLowerCase().includes(q) ||
        (l.ip || "").toLowerCase().includes(q));
    }
    return list;
  }, [logs, actor, search]);

  // If server isn't paginating, paginate client-side
  const displayItems = serverPaginated
    ? clientFiltered
    : clientFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = serverPaginated
    ? Math.max(1, Math.ceil(total / PAGE_SIZE))
    : Math.max(1, Math.ceil(clientFiltered.length / PAGE_SIZE));

  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  const resetFilters = () => {
    setActionFilter("all");
    setActor("");
    setSearch("");
    setRange(rangeFromPreset("30d"));
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Authentication and template activity across the panel.
          </p>
        </div>
        <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search target, IP, action…" className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="lg:col-span-3 relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Actor name or email" className="pl-10" value={actor} onChange={(e) => { setActor(e.target.value); setPage(1); }} />
          </div>
          <div className="lg:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="all">All actions</option>
              <optgroup label="Auth">
                {ACTIONS.filter((a) => a.group === "auth").map((a) => (
                  <option key={a.key} value={a.key}>{a.label}</option>
                ))}
              </optgroup>
              <optgroup label="Templates">
                {ACTIONS.filter((a) => a.group === "template").map((a) => (
                  <option key={a.key} value={a.key}>{a.label}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="lg:col-span-2">
            <Button variant="ghost" onClick={resetFilters} fullWidth>Clear</Button>
          </div>
        </div>
        <div className="mt-3">
          <DateRangePicker value={range} onChange={(r) => { setRange(r); setPage(1); }} />
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && logs === null ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : displayItems.length === 0 ? (
        <Card className="text-center py-14">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground/60" />
          <h3 className="font-display text-2xl mt-3">No audit logs</h3>
          <p className="text-sm text-muted-foreground mt-1">Try widening your date range or clearing filters.</p>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            <AnimatePresence initial={false}>
              {displayItems.map((log) => <LogCard key={log.id} log={log} />)}
            </AnimatePresence>
          </div>

          {/* Desktop table */}
          <Card className="hidden md:block p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Actor</th>
                    <th className="px-5 py-3 font-medium">Target</th>
                    <th className="px-5 py-3 font-medium">IP</th>
                    <th className="px-5 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((log) => {
                    const meta = ACTION_META[log.action] || { icon: ShieldCheck, variant: "muted" as const, label: log.action };
                    const Icon = meta.icon;
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-t border-border hover:bg-muted/30 transition"
                      >
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center"><Icon className="h-4 w-4" /></span>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-medium">{log.actorName || "—"}</div>
                          <div className="text-xs text-muted-foreground">{log.actorEmail || ""}</div>
                        </td>
                        <td className="px-5 py-3">
                          {log.targetName || log.targetId ? (
                            <>
                              <div className="font-medium truncate max-w-[280px]">{log.targetName || log.targetId}</div>
                              {log.targetType && <div className="text-xs text-muted-foreground">{log.targetType}</div>}
                            </>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground tabular-nums">{log.ip || "—"}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm tabular-nums">{page} / {totalPages}</span>
              <Button variant="ghost" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LogCard({ log }: { log: AuditLog }) {
  const meta = ACTION_META[log.action] || { icon: ShieldCheck, variant: "muted" as const, label: log.action };
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={cn("rounded-2xl border border-border bg-card p-4")}
    >
      <div className="flex items-start gap-3">
        <span className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0"><Icon className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm font-medium truncate">{log.actorName || log.actorEmail || "—"}</p>
          {log.targetName || log.targetId ? (
            <p className="text-xs text-muted-foreground truncate">→ {log.targetName || log.targetId}</p>
          ) : null}
          {log.ip && <p className="text-xs text-muted-foreground mt-1">IP {log.ip}</p>}
        </div>
      </div>
    </motion.div>
  );
}
