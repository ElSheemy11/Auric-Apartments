import { z } from "zod";

export const propertyTypeSchema = z.enum([
  "apartment",
  "room",
  "shared_room",
  "studio",
  "house",
]);
export const listingTypeSchema = z.enum(["rent", "sale"]);
export const billingPeriodSchema = z.enum(["monthly", "yearly", "one_time"]);
export const genderPreferenceSchema = z.enum(["any", "male", "female"]);
export const propertyStatusSchema = z.enum([
  "draft",
  "active",
  "rented",
  "sold",
  "archived",
]);

// Accepts real booleans and the strings "true"/"false"/"1"/"0"/"on"/"off".
// (z.coerce.boolean() would turn "false" into true.)
const boolish = z.union([z.boolean(), z.stringbool()]);

export const listingFiltersSchema = z
  .object({
    listingType: listingTypeSchema.optional(),
    propertyType: propertyTypeSchema.optional(),
    minPrice: z.coerce.number().int().nonnegative().optional(), // whole EGP
    maxPrice: z.coerce.number().int().nonnegative().optional(), // whole EGP
    bedrooms: z.coerce.number().int().min(0).optional(),
    furnished: boolish.optional(),
    genderPreference: genderPreferenceSchema.optional(),
    neighborhood: z.string().trim().min(1).max(100).optional(),
    maxDistanceKm: z.coerce.number().nonnegative().max(1000).optional(),
    q: z.string().trim().min(1).max(200).optional(),
    sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    { message: "minPrice must not exceed maxPrice", path: ["maxPrice"] },
  );

export type ListingFilters = z.infer<typeof listingFiltersSchema>;

// Fields with NO defaults: the shared base for create and update.
const listingFields = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(4000),
  propertyType: propertyTypeSchema,
  listingType: listingTypeSchema,
  price: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(1_000_000_000, "Price is too high"), // whole EGP
  billingPeriod: billingPeriodSchema,
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  areaM2: z.coerce.number().int().nonnegative().max(10_000),
  furnished: boolish,
  genderPreference: genderPreferenceSchema,
  distanceToUniversityKm: z.coerce
    .number()
    .nonnegative()
    .max(1000)
    .optional()
    .nullable(),
  neighborhood: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(500),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  amenities: z.array(z.string().trim().min(1).max(100)).max(50),
  expiresAt: z.string().datetime().optional(),
});

// Create: defaults apply here only.
export const createListingSchema = listingFields.extend({
  billingPeriod: billingPeriodSchema.default("monthly"),
  furnished: boolish.default(false),
  genderPreference: genderPreferenceSchema.default("any"),
  city: z.string().trim().min(1).max(100).default("aswan"),
  amenities: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

// Update: every field optional, NO defaults, so unsent fields stay untouched.
export const updateListingSchema = listingFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be updated",
  });

export type UpdateListingInput = z.infer<typeof updateListingSchema>;