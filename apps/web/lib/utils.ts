import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type DesignImage = {
  url: string;
  publicId: string;
};

export function normalizeDesignImages(images: unknown): DesignImage[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.flatMap((image) => {
    if (typeof image === "string" && image.trim()) {
      return [{ url: image, publicId: "" }];
    }

    if (
      image &&
      typeof image === "object" &&
      "url" in image &&
      typeof image.url === "string" &&
      image.url.trim()
    ) {
      const publicId =
        "publicId" in image && typeof image.publicId === "string"
          ? image.publicId
          : "";

      return [{ url: image.url, publicId }];
    }

    return [];
  });
}

export function getFirstImageUrl(images: unknown): string | null {
  return normalizeDesignImages(images)[0]?.url ?? null;
}

export function normalizeWhatsAppNumber(number: string): string {
  return number.replace(/\D/g, "");
}

export function buildWhatsAppUrl(number: string, text?: string): string {
  const normalized = normalizeWhatsAppNumber(number);
  if (!text) {
    return `https://wa.me/${normalized}`;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
