import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { templatesApi, type Template } from "@/api/templates";
import { TemplateForm, type TemplateFormSubmit } from "@/components/templates/TemplateForm";
import { Skeleton } from "@/components/ui/Skeleton";

export const Route = createFileRoute("/admin/templates/edit/$id")({
  component: EditTemplatePage,
});

function buildEditFormData(initial: Template, data: TemplateFormSubmit) {
  const { values, mainImage, gallery, music, removedGalleryUrls, mainImageRemoved, musicRemoved } =
    data;
  const fd = new FormData();
  // Always send text fields (changes are cheap to detect server-side)
  if (values.name !== initial.name) fd.append("name", values.name);
  if ((values.key || "") !== (initial.key || "")) fd.append("key", values.key || "");
  if ((values.category || "") !== (initial.category || ""))
    fd.append("category", values.category || "");
  if ((values.description || "") !== (initial.description || ""))
    fd.append("description", values.description || "");
  if (Number(values.basePrice) !== Number(initial.basePrice))
    fd.append("basePrice", String(values.basePrice));
  if ((values.currency || "֏") !== (initial.currency || "֏"))
    fd.append("currency", values.currency || "֏");
  if ((values.musicTitle || "") !== (initial.musicTitle || ""))
    fd.append("musicTitle", values.musicTitle || "");
  if ((values.demoLink || "") !== (initial.demoLink || ""))
    fd.append("demoLink", values.demoLink || "");
  if ((values.isActive || false) !== (initial.isActive || false))
    fd.append("isActive", String(values.isActive || false));
  if ((values.rating || 5) !== (initial.rating || 5))
    fd.append("rating", String(values.rating || 5));
  if (JSON.stringify(values.defaultData || {}) !== JSON.stringify(initial.defaultData || {}))
    fd.append("defaultData", JSON.stringify(values.defaultData || {}));

  const featuresChanged =
    JSON.stringify(values.features || []) !== JSON.stringify(initial.features || []);
  if (featuresChanged) fd.append("features", JSON.stringify(values.features || []));

  if (mainImage) fd.append("mainImage", mainImage);
  else if (mainImageRemoved) fd.append("mainImageRemoved", "true");

  if (gallery.length > 0) gallery.forEach((f) => fd.append("gallery", f));
  if (removedGalleryUrls.length > 0)
    fd.append("removedGallery", JSON.stringify(removedGalleryUrls));

  if (music) fd.append("music", music);
  else if (musicRemoved) fd.append("musicRemoved", "true");

  return fd;
}

function EditTemplatePage() {
  const { id } = useParams({ from: "/admin/templates/edit/$id" });
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await templatesApi.get(id);
        const templateData = (data as any)?.data || data;
        if (alive) setTemplate(templateData);
      } catch (e: any) {
        if (alive) setError(e?.response?.data?.message || "Failed to load template");
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleSubmit = async (data: TemplateFormSubmit) => {
    if (!template) return;
    const fd = buildEditFormData(template, data);
    if ([...fd.entries()].length === 0) {
      toast("No changes to save", { icon: "ℹ️" });
      return;
    }
    try {
      await toast.promise(templatesApi.update(id, fd), {
        loading: "Saving…",
        success: "Template updated",
        error: (e: any) => e?.response?.data?.message || "Update failed",
      });
      navigate({ to: "/admin/templates/$id", params: { id } });
    } catch {}
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl">Edit Template</h1>
        <p className="text-sm text-muted-foreground mt-1">{template.name}</p>
      </div>
      <TemplateForm initial={template} onSubmit={handleSubmit} submitLabel="Save changes" />
    </div>
  );
}
