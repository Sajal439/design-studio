"use client";

import Image from "next/image";
import { useRef, useState, useCallback } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Upload, X, GripVertical, Link as LinkIcon, ImagePlus, Loader2 } from "lucide-react";

export type ImageItem = { url: string; publicId: string };

type ImageUploaderProps = {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
};

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // ── File upload ──────────────────────────────────────────────────────────────

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setLoading(true);
      setError("");
      setUploadProgress(`Uploading ${files.length} image${files.length > 1 ? "s" : ""}…`);

      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          setError(payload?.error || "Upload failed. Check Cloudinary config.");
          return;
        }

        const payload = await response.json();
        onChange([...images, ...payload.urls]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch {
        setError("Upload failed — check your network connection.");
      } finally {
        setLoading(false);
        setUploadProgress("");
      }
    },
    [images, onChange]
  );

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void processFiles(Array.from(files));
  }

  // ── Drag-and-drop zone (upload) ─────────────────────────────────────────────

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Only activate drop-zone for external files, not for reorder drag
    if (dragIndex === null) setIsDraggingOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    // If we're in reorder mode, ignore the drop zone
    if (dragIndex !== null) return;

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length > 0) void processFiles(files);
  }

  // ── Manual URL ──────────────────────────────────────────────────────────────

  function addManualUrl() {
    const value = manualUrl.trim();
    if (!value) return;
    onChange([...images, { url: value, publicId: "" }]);
    setManualUrl("");
  }

  function handleUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addManualUrl();
    }
  }

  // ── Image management ────────────────────────────────────────────────────────

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  // ── Drag-and-drop reorder ───────────────────────────────────────────────────

  function onReorderDragStart(index: number) {
    setDragIndex(index);
  }

  function onReorderDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function onReorderDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    if (!moved) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    reordered.splice(index, 0, moved);
    onChange(reordered);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function onReorderDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="space-y-4">
      {/* ── Drop Zone ─────────────────────────────────────────────────── */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
          isDraggingOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-primary">{uploadProgress}</p>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ImagePlus className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isDraggingOver ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse • supports JPG, PNG, WebP
              </p>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          multiple
          onChange={handleFileInput}
          type="file"
        />
      </div>

      {/* ── URL Input ─────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Paste image URL and press Enter"
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            value={manualUrl}
          />
        </div>
        <Button onClick={addManualUrl} type="button" variant="outline" disabled={!manualUrl.trim()}>
          <Upload className="mr-1.5 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* ── Error message ─────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <X className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* ── Image Grid (reorderable) ──────────────────────────────────── */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              {images.length} image{images.length !== 1 ? "s" : ""} • drag to reorder
            </p>
            {images.length > 1 && (
              <p className="text-xs text-muted-foreground">
                First image = thumbnail
              </p>
            )}
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                draggable
                onDragStart={() => onReorderDragStart(index)}
                onDragOver={(e) => onReorderDragOver(e, index)}
                onDrop={() => onReorderDrop(index)}
                onDragEnd={onReorderDragEnd}
                className={`group relative rounded-xl border bg-card overflow-hidden transition-all duration-200 ${
                  dragIndex === index
                    ? "opacity-40 scale-95"
                    : dragOverIndex === index
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:shadow-md"
                } ${index === 0 ? "ring-2 ring-primary/30" : ""}`}
              >
                {/* Thumbnail indicator */}
                {index === 0 && (
                  <span className="absolute top-2 left-2 z-10 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                    COVER
                  </span>
                )}

                {/* Drag handle */}
                <div className="absolute top-2 right-9 z-10 flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeImage(index)}
                  type="button"
                  className="absolute top-2 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Image */}
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    alt={`Design image ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    src={image.url}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
