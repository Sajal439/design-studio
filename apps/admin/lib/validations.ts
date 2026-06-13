import { z } from "zod";

export const quoteRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  projectType: z.string().min(1, "Select a project type"),
  designSlug: z.string().optional(),
  productSlug: z.string().optional(),
  location: z.string().min(2, "Enter your project location"),
  message: z.string().optional(),
  source: z.string().optional(),
});

export const consultationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  projectType: z.string().min(1, "Select a project type"),
  location: z.string().min(2, "Enter your location"),
  consultationType: z.enum(["showroom", "video", "site-visit"], {
    required_error: "Select a consultation type",
  }),
  source: z.string().optional(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type Consultation = z.infer<typeof consultationSchema>;

// ── Project & Project Item ─────────────────────────────────────────────────────

export const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
});

export const projectItemSchema = z.object({
  designId: z.string().cuid().optional(),
  estimateId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectItemInput = z.infer<typeof projectItemSchema>;

export type ConsultationRequest = z.infer<typeof consultationSchema>;

