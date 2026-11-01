import { z } from "zod";

export const reportReasonSchema = z.enum([
  "fraud",
  "misleading",
  "inappropriate",
  "duplicate",
  "rented_already",
  "other",
]);

export const createReportSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  reason: reportReasonSchema,
  details: z.string().trim().min(1).max(2000).optional().nullable(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;