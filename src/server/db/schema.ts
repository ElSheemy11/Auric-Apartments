import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey,
  doublePrecision,
  numeric,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

/* ------------------------------ Enums ------------------------------ */

export const listingTypeEnum = pgEnum("listing_type", ["rent", "sale"]);
export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "room",
  "shared_room",
  "studio",
  "house",
]);
export const billingPeriodEnum = pgEnum("billing_period", [
  "monthly",
  "yearly",
  "one_time",
]);
export const genderPreferenceEnum = pgEnum("gender_preference", [
  "any",
  "male",
  "female",
]);
export const propertyStatusEnum = pgEnum("property_status", [
  "draft",
  "active",
  "rented",
  "sold",
  "archived",
]);
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "replied",
  "closed",
]);
export const reportReasonEnum = pgEnum("report_reason", [
  "fraud",
  "misleading",
  "inappropriate",
  "duplicate",
  "rented_already",
  "other",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewed",
  "dismissed",
]);

/* ------------------------------ Users ------------------------------ */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name"),
  // Not unique: Clerk is the identity source (clerk_id). A unique email would
  // crash sign-in if an account is re-created in Clerk with the same email.
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"), // digits only, no "+"; revealed only via rate-limited action
  imageUrl: text("image_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuspended: boolean("is_suspended").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ---------------------------- Properties --------------------------- */

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Deleting a user deletes their listings. Delete their ImageKit files
    // in app code first (the DB cannot do that).
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    propertyType: propertyTypeEnum("property_type").notNull(),
    listingType: listingTypeEnum("listing_type").notNull(),
    price: integer("price").notNull(), // whole EGP (pounds), not piastres
    billingPeriod: billingPeriodEnum("billing_period")
      .notNull()
      .default("monthly"),
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    areaM2: integer("area_m2").notNull(),
    furnished: boolean("furnished").notNull().default(false),
    genderPreference: genderPreferenceEnum("gender_preference")
      .notNull()
      .default("any"),
    // numeric comes back from Drizzle as a string: use Number(x) when displaying.
    distanceToUniversityKm: numeric("distance_to_university_km", {
      precision: 6,
      scale: 2,
    }),
    neighborhood: text("neighborhood").notNull(),
    city: text("city").notNull().default("aswan"),
    address: text("address").notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    amenities: text("amenities")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    status: propertyStatusEnum("status").notNull().default("draft"),
    isPublished: boolean("is_published").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true })
      .notNull()
      .default(sql`now() + interval '60 days'`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("properties_listing_type_idx").on(table.listingType),
    index("properties_property_type_idx").on(table.propertyType),
    index("properties_neighborhood_idx").on(table.neighborhood),
    index("properties_city_idx").on(table.city),
    index("properties_owner_id_idx").on(table.ownerId),
    index("properties_expires_at_idx").on(table.expiresAt),
    // Public search only ever reads active + published rows, so index just those.
    index("properties_public_created_idx")
      .on(table.createdAt)
      .where(sql`status = 'active' AND is_published = true`),
    index("properties_public_price_idx")
      .on(table.price)
      .where(sql`status = 'active' AND is_published = true`),
    check("properties_price_nonneg", sql`price >= 0`),
    check("properties_bedrooms_nonneg", sql`bedrooms >= 0`),
    check("properties_bathrooms_nonneg", sql`bathrooms >= 0`),
    check("properties_area_nonneg", sql`area_m2 >= 0`),
    check(
      "properties_latitude_range",
      sql`latitude IS NULL OR latitude BETWEEN -90 AND 90`,
    ),
    check(
      "properties_longitude_range",
      sql`longitude IS NULL OR longitude BETWEEN -180 AND 180`,
    ),
  ],
);

/* --------------------------- Rate limiting -------------------------- */

export const rateLimits = pgTable(
  "rate_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(), // "ip:<hash>" or "user:<id>"
    windowSeconds: integer("window_seconds").notNull(),
    count: integer("count").notNull().default(1),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // This unique constraint already indexes identifier lookups.
    unique("rate_limits_identifier_window_idx").on(
      table.identifier,
      table.windowSeconds,
    ),
    index("rate_limits_expires_at_idx").on(table.expiresAt),
  ],
);

/* ------------------------- Property images ------------------------- */

export const propertyImages = pgTable(
  "property_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    storageKey: text("storage_key").notNull(), // ImageKit fileId, used for deletion
    position: integer("position").notNull().default(0),
    caption: text("caption"),
  },
  (table) => [
    index("property_images_property_position_idx").on(
      table.propertyId,
      table.position,
    ),
  ],
);

/* ----------------------------- Favorites ---------------------------- */

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // The composite PK already covers lookups by user_id.
    primaryKey({ columns: [table.userId, table.propertyId] }),
    index("favorites_property_id_idx").on(table.propertyId),
  ],
);

/* ----------------------------- Inquiries ---------------------------- */

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    message: text("message").notNull(),
    status: inquiryStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inquiries_property_id_idx").on(table.propertyId),
    index("inquiries_user_id_idx").on(table.userId),
  ],
);

/* ------------------------------ Reports ----------------------------- */

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    reporterId: uuid("reporter_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reason: reportReasonEnum("reason").notNull(),
    details: text("details"),
    status: reportStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reports_property_id_idx").on(table.propertyId),
    index("reports_reporter_id_idx").on(table.reporterId),
    index("reports_status_idx").on(table.status),
    // One open report per user per property, enforced by the database.
    uniqueIndex("reports_one_open_per_user_idx")
      .on(table.reporterId, table.propertyId)
      .where(sql`status = 'open'`),
  ],
);

/* --------------------------- Contact reveals ------------------------ */

export const contactReveals = pgTable(
  "contact_reveals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("contact_reveals_property_id_idx").on(table.propertyId),
    index("contact_reveals_user_id_idx").on(table.userId),
    index("contact_reveals_ip_created_idx").on(table.ipHash, table.createdAt),
  ],
);

/* ------------------------------- Types ------------------------------ */

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Property = InferSelectModel<typeof properties>;
export type NewProperty = InferInsertModel<typeof properties>;
export type PropertyImage = InferSelectModel<typeof propertyImages>;
export type NewPropertyImage = InferInsertModel<typeof propertyImages>;
export type Favorite = InferSelectModel<typeof favorites>;
export type NewFavorite = InferInsertModel<typeof favorites>;
export type Inquiry = InferSelectModel<typeof inquiries>;
export type NewInquiry = InferInsertModel<typeof inquiries>;
export type Report = InferSelectModel<typeof reports>;
export type NewReport = InferInsertModel<typeof reports>;
export type ContactReveal = InferSelectModel<typeof contactReveals>;
export type NewContactReveal = InferInsertModel<typeof contactReveals>;
export type RateLimit = InferSelectModel<typeof rateLimits>;
export type NewRateLimit = InferInsertModel<typeof rateLimits>;

export type ListingType = (typeof listingTypeEnum.enumValues)[number];
export type PropertyType = (typeof propertyTypeEnum.enumValues)[number];
export type BillingPeriod = (typeof billingPeriodEnum.enumValues)[number];
export type GenderPreference = (typeof genderPreferenceEnum.enumValues)[number];
export type PropertyStatus = (typeof propertyStatusEnum.enumValues)[number];
export type InquiryStatus = (typeof inquiryStatusEnum.enumValues)[number];
export type ReportReason = (typeof reportReasonEnum.enumValues)[number];
export type ReportStatus = (typeof reportStatusEnum.enumValues)[number];