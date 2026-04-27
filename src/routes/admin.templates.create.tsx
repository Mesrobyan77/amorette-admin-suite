import { createFileRoute, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { templatesApi } from "@/api/templates";
import { TemplateForm, type TemplateFormSubmit } from "@/components/templates/TemplateForm";

export const Route = createFileRoute("/admin/templates/create")({
  component: CreateTemplatePage,
});

function buildFormData({ values, mainImage, gallery, music }: TemplateFormSubmit) {
  const fd = new FormData();
  fd.append("name", values.name);
  if (values.category) fd.append("category", values.category);
  if (values.description) fd.append("description", values.description);
  fd.append("basePrice", String(values.basePrice));
  fd.append("currency", values.currency || "֏");
  if (values.musicTitle) fd.append("musicTitle", values.musicTitle);
  fd.append("features", JSON.stringify(values.features || []));
  if (mainImage) fd.append("mainImage", mainImage);
  gallery.forEach((f) => fd.append("gallery", f));
  if (music) fd.append("music", music);
  return fd;
}

function CreateTemplatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: TemplateFormSubmit) => {
    if (!data.mainImage) {
      toast.error("Main image is required");
      return;
    }
    const fd = buildFormData(data);
    try {
      const { data: created } = await toast.promise(templatesApi.create(fd), {
        loading: "Creating template…",
        success: "Template created",
        error: (e: any) => e?.response?.data?.message || "Create failed",
      });
      const id = (created as any)?.id || (created as any)?._id;
      if (id) navigate({ to: "/admin/templates/$id", params: { id } });
      else navigate({ to: "/admin/templates" });
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl">Create Template</h1>
        <p className="text-sm text-muted-foreground mt-1">Add a new luxury wedding template.</p>
      </div>
      <TemplateForm onSubmit={handleSubmit} submitLabel="Create Template" />
    </div>
  );
}
