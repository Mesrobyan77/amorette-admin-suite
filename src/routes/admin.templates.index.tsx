import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Eye,
  Pencil,
  FileImage,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { templatesApi, type Template } from "@/api/templates";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { formatCurrency, formatDate, cn } from "@/utils/format";

export const Route = createFileRoute("/admin/templates/")({
  component: TemplatesListPage,
});

const PAGE_SIZE = 9;
type SortKey = "newest" | "oldest" | "price-asc" | "price-desc" | "name";

function extractList(payload: any): Template[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function TemplatesListPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const load = async () => {
    setTemplates(null);
    setError(null);
    try {
      const { data } = await templatesApi.list();
      setTemplates(extractList(data));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load templates");
      setTemplates([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (templates || []).forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return ["all", ...Array.from(set)];
  }, [templates]);

  const filtered = useMemo(() => {
    let list = templates || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.category || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q),
      );
    }
    if (category !== "all") list = list.filter((t) => t.category === category);

    list = list.slice().sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "price-asc":
          return (a.basePrice || 0) - (b.basePrice || 0);
        case "price-desc":
          return (b.basePrice || 0) - (a.basePrice || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
    return list;
  }, [templates, search, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const allOnPageSelected =
    pageItems.length > 0 && pageItems.every((t) => selected.has((t.id || t._id) as string));
  const togglePageSelection = () => {
    const next = new Set(selected);
    if (allOnPageSelected) pageItems.forEach((t) => next.delete((t.id || t._id) as string));
    else pageItems.forEach((t) => next.add((t.id || t._id) as string));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const doDelete = async (t: Template) => {
    const id = (t.id || t._id) as string;
    await toast.promise(templatesApi.remove(id), {
      loading: "Deleting…",
      success: "Template deleted",
      error: "Delete failed",
    });
    setTemplates((prev) => (prev || []).filter((x) => (x.id || x._id) !== id));
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const doBulkDelete = async () => {
    const ids = Array.from(selected);
    await toast.promise(Promise.allSettled(ids.map((id) => templatesApi.remove(id))), {
      loading: `Deleting ${ids.length}…`,
      success: "Bulk delete complete",
      error: "Some deletions failed",
    });
    setTemplates((prev) => (prev || []).filter((x) => !ids.includes((x.id || x._id) as string)));
    setSelected(new Set());
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {templates?.length ?? 0} templates
          </p>
        </div>
        <Link to="/admin/templates/create">
          <Button variant="gold" fullWidth>
            <Plus className="h-4 w-4" /> Create Template
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates…"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:flex">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 px-4 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 px-4 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl bg-secondary/60"
          >
            <p className="text-sm">{selected.size} selected</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </motion.div>
        )}
      </Card>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {templates === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : pageItems.length === 0 ? (
        <Card className="text-center py-16">
          <FileImage className="h-12 w-12 mx-auto text-muted-foreground/60" />
          <h3 className="font-display text-2xl mt-3">No templates found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search || category !== "all"
              ? "Try adjusting your filters."
              : "Create your first template to get started."}
          </p>
          <div className="mt-5 flex justify-center">
            <Link to="/admin/templates/create">
              <Button variant="gold">
                <Plus className="h-4 w-4" /> Create Template
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={togglePageSelection}
              className="h-4 w-4 rounded accent-[var(--primary)]"
            />
            <span className="text-xs text-muted-foreground">Select all on page</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((t) => {
              const id = (t.id || t._id) as string;
              const isSelected = selected.has(id);
              return (
                <motion.div
                  key={id}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "rounded-3xl border bg-card overflow-hidden group transition shadow-[0_4px_20px_-8px_color-mix(in_oklab,var(--foreground)_15%,transparent)]",
                    isSelected ? "border-primary ring-2 ring-primary/40" : "border-border",
                  )}
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    {t.mainImage ? (
                      <img
                        src={t.mainImage}
                        alt={t.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <FileImage className="h-10 w-10" />
                      </div>
                    )}
                    <label className="absolute top-2 left-2 h-8 w-8 rounded-xl bg-black/50 backdrop-blur flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(id)}
                        className="h-4 w-4 accent-[var(--gold)]"
                      />
                    </label>
                    {t.category && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="gold">{t.category}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg truncate">{t.name}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gradient-gold whitespace-nowrap">
                        {formatCurrency(t.basePrice, t.currency || "֏")}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {t.views || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">★ {t.rating ?? "—"}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate({ to: "/admin/templates/$id", params: { id } })}
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigate({ to: "/admin/templates/edit/$id", params: { id } })
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(t)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await doDelete(deleteTarget);
        }}
        itemName={deleteTarget?.name || ""}
        title="Delete template"
      />
      <ConfirmDeleteModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onConfirm={doBulkDelete}
        itemName={`DELETE ${selected.size}`}
        title="Bulk delete templates"
        description={`Type "DELETE ${selected.size}" to confirm deleting ${selected.size} template(s).`}
      />
    </div>
  );
}
