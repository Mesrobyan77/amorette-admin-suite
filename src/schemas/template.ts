import { z } from "zod";

export const featureSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  included: z.boolean(),
});

export const templateSchema = z.object({
  name: z.string().trim().min(2, "Min 2 characters").max(120),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  basePrice: z.coerce.number({ invalid_type_error: "Required" }).positive("Must be positive"),
  currency: z.string().trim().min(1).max(8).default("֏"),
  musicTitle: z.string().trim().max(120).optional().or(z.literal("")),
  features: z.array(featureSchema).max(50).default([]),
});

export type TemplateInput = z.infer<typeof templateSchema>;
