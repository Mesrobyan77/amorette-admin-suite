import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Check } from "lucide-react";
import { templateSchema, type TemplateInput } from "@/schemas/template";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { SingleFileUpload, GalleryUpload } from "@/components/ui/FileUpload";
import { cn } from "@/utils/format";
import type { Template } from "@/api/templates";

export interface TemplateFormSubmit {
  values: TemplateInput;
  mainImage: File | null;
  gallery: File[];
  music: File | null;
  removedGalleryUrls: string[];
  mainImageRemoved: boolean;
  musicRemoved: boolean;
}

interface Props {
  initial?: Template;
  submitLabel?: string;
  onSubmit: (data: TemplateFormSubmit) => Promise<void> | void;
}

const DEFAULT_FEATURES = ["RSVP", "Countdown", "Map", "Music", "Gallery"];

export function TemplateForm({ initial, submitLabel = "Save", onSubmit }: Props) {
  const isEdit = !!initial;
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImageRemoved, setMainImageRemoved] = useState(false);
  const [gallery, setGallery] = useState<File[]>([]);
  const [removedExistingGallery, setRemovedExistingGallery] = useState<string[]>([]);
  const [music, setMusic] = useState<File | null>(null);
  const [musicRemoved, setMusicRemoved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const defaultFeatures = DEFAULT_FEATURES.map((name) => {
    const existing = (initial?.features || []).find(
      (f) => f.name.toLowerCase() === name.toLowerCase(),
    );
    return existing || { name, included: false };
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initial?.name || "",
      category: initial?.category || "",
      description: initial?.description || "",
      basePrice: initial?.basePrice ?? (undefined as any),
      currency: initial?.currency || "֏",
      musicTitle: initial?.musicTitle || "",
      features: defaultFeatures,
    },
  });

  const { fields } = useFieldArray({ control, name: "features" });

  const existingGallery = (initial?.gallery || []).filter(
    (u) => !removedExistingGallery.includes(u),
  );
  const existingMain = mainImageRemoved ? null : initial?.mainImage || null;
  const existingMusic = musicRemoved ? null : initial?.musicUrl || initial?.music || null;

  const submit = handleSubmit(async (values) => {
    if (!isEdit && !mainImage) {
      alert("Main image is required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        values,
        mainImage,
        gallery,
        music,
        removedGalleryUrls: removedExistingGallery,
        mainImageRemoved,
        musicRemoved,
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 space-y-4">
          <CardTitle>Details</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name *"
              placeholder="Royal Ivory"
              error={errors.name?.message}
              {...register("name")}
            />
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
              <select
                className={cn(
                  "w-full h-11 px-4 rounded-2xl bg-card text-foreground border border-border",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer appearance-none",
                  errors.category && "border-destructive focus:ring-destructive/40",
                )}
                {...register("category")}
              >
                <option value="">Ընտրեք կատեգորիա</option>
                <option value="Հարսանիք">Հարսանիք</option>
                <option value="Կնունք">Կնունք</option>
                <option value="Նշանդրեք">Նշանդրեք</option>
                <option value="Ծնունդ">Ծնունդ</option>
                <option value="Այլ">Այլ</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>
            <Input
              label="Base Price *"
              type="number"
              step="0.01"
              placeholder="25000"
              error={errors.basePrice?.message}
              {...register("basePrice")}
            />
            <Input
              label="Currency"
              placeholder="֏"
              error={errors.currency?.message}
              {...register("currency")}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="A timeless luxury wedding invitation…"
            error={errors.description?.message}
            {...register("description")}
          />
        </Card>

        <Card className="space-y-4">
          <CardTitle>Main Image {!isEdit && <span className="text-destructive">*</span>}</CardTitle>
          <SingleFileUpload
            kind="image"
            accept="image/*"
            value={mainImage}
            existingUrl={existingMain}
            onChange={(f) => {
              setMainImage(f);
              if (!f) setMainImageRemoved(true);
              else setMainImageRemoved(false);
            }}
            onRemoveExisting={() => setMainImageRemoved(true)}
          />
        </Card>
      </div>

      <Card className="space-y-4">
        <CardTitle>Gallery</CardTitle>
        <GalleryUpload
          files={gallery}
          existingUrls={existingGallery}
          onAdd={(files) =>
            setGallery((prev) => [...prev, ...files].slice(0, 10 - existingGallery.length))
          }
          onRemoveFile={(i) => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
          onRemoveExisting={(i) => {
            const url = existingGallery[i];
            if (url) setRemovedExistingGallery((prev) => [...prev, url]);
          }}
          max={10}
        />
      </Card>

      <Card className="space-y-4">
        <CardTitle>Music</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SingleFileUpload
            kind="audio"
            accept="audio/*, .mp3, .wav, .mpeg"
            value={music}
            existingUrl={existingMusic}
            onChange={(f) => {
              setMusic(f);
              if (!f) setMusicRemoved(true);
              else setMusicRemoved(false);
            }}
            onRemoveExisting={() => setMusicRemoved(true)}
          />
          <Input
            label="Music Title"
            placeholder="Canon in D"
            error={errors.musicTitle?.message}
            {...register("musicTitle")}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <CardTitle>Features</CardTitle>
        <div className="flex flex-wrap gap-3">
          {fields.map((field, idx) => (
            <label
              key={field.id}
              className={cn(
                "flex items-center gap-2 px-4 h-11 rounded-2xl border border-border cursor-pointer text-sm select-none transition-colors hover:bg-muted/30",
              )}
            >
              <input type="hidden" {...register(`features.${idx}.name` as const)} />
              <input
                type="checkbox"
                {...register(`features.${idx}.included` as const)}
                className="sr-only peer"
              />
              <span className="h-5 w-5 rounded-md border border-border bg-background peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition">
                <Check className="h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100" />
              </span>
              {field.name}
            </label>
          ))}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
        <Button type="submit" variant="gold" size="lg" loading={submitting} fullWidth>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
