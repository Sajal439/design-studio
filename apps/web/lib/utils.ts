import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFirstImageUrl(images: unknown): string | null {
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0] as any;
    return typeof first === "object" && first?.url ? String(first.url) : null;
  }
  return null;
}
