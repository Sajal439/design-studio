import { z } from "zod";

// ── Design ────────────────────────────────────────────────────────────────────
export const materialSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
});

export const imageItemSchema = z.object({
  url: z.string().min(1),
  publicId: z.string(),
});

export const designSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  categorySlug: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.string().optional().or(z.literal("")),
  roomSize: z.string().optional().or(z.literal("")),
  style: z.string().optional().or(z.literal("")),
  images: z.array(imageItemSchema).min(1),
  tags: z.array(z.string().min(1)).default([]),
  isRealWork: z.boolean().default(false),
  location: z.string().optional().or(z.literal("")),
  priceRange: z.string().optional().or(z.literal("")),
  badge: z.string().optional().or(z.literal("")),
  waText: z.string().optional().or(z.literal("")),
});

// ── Product ───────────────────────────────────────────────────────────────────
export const specificationSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  categorySlug: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().min(1),
  priceRange: z.string().min(1),
  unit: z.string().min(1),
  inStock: z.boolean(),
  images: z.array(z.string().min(1)).min(1),
  specifications: z.array(specificationSchema).min(1),
});

// ── Estimate ──────────────────────────────────────────────────────────────────
// Validates the full estimation result before it is written to the database.
// Previously api/estimates/route.ts accepted any JSON body.
export const estimateSaveSchema = z.object({
  categoryId: z.string().min(1),
  categorySlug: z.string().min(1),
  categoryLabel: z.string().min(1),
  designId: z.string().min(1),
  designTitle: z.string().min(1),
  layout: z.string().min(1),
  grade: z.enum(["BUDGET", "STANDARD", "PREMIUM"]),
  finishType: z.enum(["LAMINATE", "VENEER", "ACRYLIC"]),
  doorType: z.enum(["HINGED", "SLIDING", "OPEN", "HANDLELESS"]),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    depth: z.number().positive(),
  }),
  summary: z.object({
    materialCost: z.number().nonnegative(),
    hardwareCost: z.number().nonnegative(),
    laborCost: z.number().nonnegative(),
    installationCost: z.number().nonnegative(),
    transportCost: z.number().nonnegative(),
    dealerTotal: z.number().nonnegative(),
    contractorTotal: z.number().nonnegative(),
    customerTotal: z.number().nonnegative(),
    totalCostMin: z.number().nonnegative(),
    totalCostMax: z.number().nonnegative(),
  }),
  // Customer contact — required to save
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  customerCity: z.string().min(2),
  // Optional enrichment — stored as JSON
  billOfMaterials: z.array(z.string()).optional(),
  productRecommendations: z.array(z.unknown()).optional(),
  materials: z.array(z.unknown()).optional(),
  modules: z.array(z.unknown()).optional(),
  nextBestAction: z.unknown().optional(),
  sheetOptimization: z.array(z.unknown()).optional(),
});

export type EstimateSave = z.infer<typeof estimateSaveSchema>;
