"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error || "Upload failed");
        return;
      }

      const payload = await response.json();
      onChange([...images, ...payload.urls]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function addManualUrl() {
    const value = manualUrl.trim();
    if (!value) return;
    onChange([...images, { url: value, publicId: "" }]);
    setManualUrl("");
  }

  function removeImage(index: number) {
    onChange(images.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row">
        <Input placeholder="Paste image URL" onChange={(event) => setManualUrl(event.target.value)} value={manualUrl} />
        <Button onClick={addManualUrl} type="button" variant="outline">Add URL</Button>
      </div>

      <div className="space-y-2">
        <input ref={fileInputRef} accept="image/*" className="block w-full text-sm" multiple onChange={handleUpload} type="file" />
        <p className="text-xs text-muted-foreground">Uploads use Cloudinary when configured. URL paste works as a fallback.</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Uploading...</p> : null}

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="rounded-lg border p-3">
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                <Image alt={`Uploaded asset ${index + 1}`} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={image.url} />
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">{image.url}</p>
              <Button className="mt-2 w-full" onClick={() => removeImage(index)} type="button" variant="outline">Remove</Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
