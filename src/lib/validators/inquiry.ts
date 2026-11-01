import { z } from "zod";

export const createInquirySchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  phone: z.string().trim().min(5, "Phone is too short").max(40, "Phone is too long"),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(2000, "Message is too long"),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;