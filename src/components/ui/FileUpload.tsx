import { useState, type ChangeEvent, type ReactNode } from "react";
import { ImagePlus, Music2, X, UploadCloud } from "lucide-react";
import { cn } from "@/utils/format";

interface SingleFileProps {
  label?: string;
  accept?: string;
  value?: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
  kind?: "image" | "audio";
  error?: string;
}

export function SingleFileUpload({
  label, accept, value, existingUrl, onChange, onRemoveExisting, kind = "image", error,
}: SingleFileProps) {
  const previewUrl = value ? URL.createObjectURL(value) : existingUrl || null;

  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium">{label}</label>}
      <div className={cn(
        "relative rounded-2xl border-2 border-dashed border-border bg-card/50 p-4 sm:p-6 transition hover:border-primary/40",
        error && "border-destructive",
      )}>
        {previewUrl ? (
          <div className="flex items-center gap-4">
            {kind === "image" ? (
              <img src={previewUrl} alt="preview" className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover" />
            ) : (
              <audio src={previewUrl} controls className="flex-1 max-w-full" />
            )}
            <button
              type="button"
              onClick={() => { onChange(null); onRemoveExisting?.(); }}
              className="ml-auto inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-sm hover:bg-destructive/20"
            >
              <X className="h-4 w-4" /> Remove
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4">
            {kind === "image" ? <ImagePlus className="h-8 w-8 text-muted-foreground" /> : <Music2 className="h-8 w-8 text-muted-foreground" />}
            <span className="text-sm text-muted-foreground">Click to upload</span>
            <input
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface GalleryProps {
  files: File[];
  existingUrls?: string[];
  onAdd: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onRemoveExisting?: (index: number) => void;
  max?: number;
}

export function GalleryUpload({
  files, existingUrls = [], onAdd, onRemoveFile, onRemoveExisting, max = 10,
}: GalleryProps) {
  const totalCount = files.length + existingUrls.length;
  const remaining = Math.max(0, max - totalCount);

  return (
    <div className="w-full">
      <label className="mb-1.5 flex items-center justify-between text-sm font-medium">
        <span>Gallery</span>
        <span className="text-xs text-muted-foreground">{totalCount}/{max}</span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {existingUrls.map((url, i) => (
          <div key={`ex-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
            <img src={url} alt="" className="h-full w-full object-cover" />
            {onRemoveExisting && (
              <button
                type="button"
                onClick={() => onRemoveExisting(i)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        {files.map((file, i) => {
          const url = URL.createObjectURL(file);
          return (
            <div key={`f-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveFile(i)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-white opacity-100 sm:opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        {remaining > 0 && (
          <label className="aspect-square rounded-2xl border-2 border-dashed border-border bg-card/50 hover:border-primary/40 cursor-pointer flex flex-col items-center justify-center gap-1 text-muted-foreground transition">
            <UploadCloud className="h-6 w-6" />
            <span className="text-xs">Add</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []).slice(0, remaining);
                onAdd(list);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

export function FileUploadHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-muted-foreground">{children}</p>;
}
