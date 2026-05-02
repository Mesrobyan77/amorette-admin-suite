import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Eye,
  Star,
  Calendar,
  Check,
  X,
  FileImage,
} from "lucide-react";
import toast from "react-hot-toast";
import { templatesApi, type Template } from "@/api/templates";
import { Card, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { formatCurrency, formatDate } from "@/utils/format";

export const Route = createFileRoute("/admin/templates/$id")({
  component: TemplateDetailPage,
});

function TemplateDetailPage() {
  const { id } = useParams({ from: "/admin/templates/$id" });
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await templatesApi.get(id);
        const templateData = (data as any)?.data || data;
        if (alive) {
          setTemplate(templateData);
          setGalleryIdx(0);
        }
      } catch (e: any) {
        if (alive) setError(e?.response?.data?.message || "Failed to load template");
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleDelete = async () => {
    await toast.promise(templatesApi.remove(id), {
      loading: "Deleting…",
      success: "Template deleted",
      error: "Delete failed",
    });
    navigate({ to: "/admin/templates" });
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
        {error}
      </div>
    );
  }
  if (!template) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const gallery = template.gallery || [];
  const allImages = [template.mainImage, ...gallery].filter(Boolean) as string[];
  const current = allImages[galleryIdx] || template.mainImage;
  const prev = () => setGalleryIdx((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const next = () => setGalleryIdx((i) => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl truncate">{template.name}</h1>
            {template.category && <Badge variant="gold">{template.category}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(template.createdAt)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2">
          <Link to="/admin/templates/edit/$id" params={{ id }}>
            <Button variant="outline" fullWidth>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)} fullWidth>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-muted">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.img
                  key={current}
                  src={current}
                  alt={template.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <FileImage className="h-12 w-12" />
                </div>
              )}
            </AnimatePresence>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur hover:bg-black/70 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur hover:bg-black/70 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs">
                  {galleryIdx + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="p-3 flex gap-2 overflow-x-auto">
              {allImages.map((url, i) => (
                <button
                  key={url + i}
                  onClick={() => setGalleryIdx(i)}
                  className={`shrink-0 h-16 w-20 rounded-xl overflow-hidden border-2 transition ${i === galleryIdx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-display text-3xl text-gradient-gold mt-1">
              {formatCurrency(template.basePrice, template.currency || "֏")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" /> {template.views || 0} views
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--gold)]" /> {template.rating ?? "—"}
              </div>
            </div>
            {template.demoLink && (
              <Button
                variant="gold"
                fullWidth
                className="mt-5"
                onClick={() => window.open(template.demoLink, "_blank")}
              >
                <Eye className="h-4 w-4" /> Live Demo
              </Button>
            )}
          </Card>

          {(template.musicUrl || template.music) && (
            <Card>
              <CardTitle>Music</CardTitle>
              {template.musicTitle && <p className="text-sm text-muted-foreground mt-1">{template.musicTitle}</p>}
              <audio src={template.musicUrl || template.music} controls className="mt-3 w-full" />
            </Card>
          )}
        </div>
      </div>

      {template.description && (
        <Card>
          <CardTitle>Description</CardTitle>
          <p className="mt-3 text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {template.description}
          </p>
        </Card>
      )}

      {template.features && template.features.length > 0 && (
        <Card>
          <CardTitle>Features</CardTitle>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {template.features.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted/50 text-sm"
              >
                {f.included ? (
                  <Check className="h-4 w-4 text-[var(--primary)]" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={f.included ? "" : "text-muted-foreground line-through"}>
                  {f.name}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        itemName={template.name}
        title="Delete template"
      />
    </div>
  );
}
