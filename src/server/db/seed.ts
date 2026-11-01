import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray } from "drizzle-orm";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL_DIRECT ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_POOLED;

if (!connectionString) {
  throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED is missing.");
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

function getTodayCairo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
  }).format(new Date());
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const PLACEHOLDER_IMAGE = "/placeholder.svg";

const neighborhoods = [
  "El Mina",
  "Kornas",
  "Tesea",
  "Fasil",
  "Salam",
  "Nagaa el Nabawi",
  "Abu Tender",
  "Elmanagila",
  "Jadid",
  "El Kureima",
  "El Gabalawi",
  "El Nagza",
];

const amenitiesPool = [
  "wifi",
  "ac",
  "washing_machine",
  "kitchen",
  "balcony",
  "parking",
  "furnished",
  "shared_living_room",
  "private_bathroom",
  "near_university",
  "water_heater",
  "security",
];

const propertyTypes = ["apartment", "room", "shared_room", "studio", "house"] as const;
const listingTypes = ["rent", "sale"] as const;
const genderPrefs = ["any", "male", "female"] as const;
const billingPeriods = ["monthly", "yearly", "one_time"] as const;

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const demoOwners = [
  { clerkId: "demo-owner-1", name: "Ahmed Mostafa", email: "ahmed.mostafa@example.com", isAdmin: false, isSuspended: false },
  { clerkId: "demo-owner-2", name: "Fatma Hassan", email: "fatma.hassan@example.com", isAdmin: false, isSuspended: false },
  { clerkId: "demo-owner-3", name: "Omar Youssef", email: "omar.youssef@example.com", isAdmin: false, isSuspended: false },
  { clerkId: "demo-owner-4", name: "Nadia Ali", email: "nadia.ali@example.com", isAdmin: false, isSuspended: false },
  { clerkId: "demo-admin", name: "Demo Admin", email: "admin@auric-apartments.example.com", isAdmin: true, isSuspended: false },
];

export async function seed() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEON_BRANCH === "production"
  ) {
    throw new Error("Seed is forbidden in production environment!");
  }

  console.log("Starting idempotent seed for Auric Apartments (Aswan)...");

  const demoOwnerIds: string[] = [];
  for (const c of demoOwners) {
    const [u] = await db
      .insert(schema.users)
      .values({
        clerkId: c.clerkId,
        name: c.name,
        email: c.email,
        isAdmin: c.isAdmin,
        isSuspended: c.isSuspended,
      })
      .onConflictDoNothing()
      .returning();
    if (u) {
      demoOwnerIds.push(u.id);
    } else {
      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, c.clerkId))
        .limit(1);
      if (existing) demoOwnerIds.push(existing.id);
    }
  }

  if (demoOwnerIds.length) {
    const listingIds = await db
      .select({ id: schema.properties.id })
      .from(schema.properties)
      .where(inArray(schema.properties.ownerId, demoOwnerIds));
    const ids = listingIds.map((r) => r.id);
    if (ids.length) {
      await db.delete(schema.propertyImages).where(inArray(schema.propertyImages.propertyId, ids));
      await db.delete(schema.favorites).where(inArray(schema.favorites.propertyId, ids));
      await db.delete(schema.inquiries).where(inArray(schema.inquiries.propertyId, ids));
      await db.delete(schema.reports).where(inArray(schema.reports.propertyId, ids));
      await db.delete(schema.contactReveals).where(inArray(schema.contactReveals.propertyId, ids));
      await db.delete(schema.properties).where(inArray(schema.properties.id, ids));
    }
  }

  console.log("Seeding 30 listings...");

  const today = getTodayCairo();
  const expiresDefault = addDays(today, 60);

  const listings: schema.NewProperty[] = [];

  for (let i = 0; i < 30; i++) {
    const propertyType = pick(propertyTypes, i);
    const listingType = pick(listingTypes, i);
    const genderPreference = pick(genderPrefs, i);
    const billingPeriod = listingType === "sale" ? "one_time" : pick(billingPeriods, i);
    const neighborhood = pick(neighborhoods, i);
    const ownerId = demoOwnerIds[i % demoOwnerIds.length];

    const bedrooms = propertyType === "studio" ? 1 : propertyType === "room" ? 1 : Math.floor(Math.random() * 3) + 1;
    const bathrooms = Math.max(1, Math.floor(bedrooms / 2) + (propertyType === "studio" ? 0 : 1));
    const areaM2 = 25 + Math.floor(Math.random() * 90);
    const furnished = i % 2 === 0;
    const distanceKm = Math.round((Math.random() * 5 + 0.5) * 10) / 10;

    let price = 0;
    if (listingType === "rent") {
      price = 150000 + Math.floor(Math.random() * 350000);
    } else {
      price = 15000000 + Math.floor(Math.random() * 60000000);
    }

    const slug = `demo-${propertyType}-${listingType}-${i + 1}`;
    const title = `${propertyType.replace("_", " ")} in ${neighborhood} - ${listingType === "rent" ? "Rent" : "Sale"} #${i + 1}`;
    const description = `A ${furnished ? "furnished" : "unfurnished"} ${propertyType.replace("_", " ")} in ${neighborhood}, Aswan, near Aswan University. ${bedrooms} bedroom(s), ${bathrooms} bathroom(s), ${areaM2} m². Gender preference: ${genderPreference}.`;

    const amenities = shuffle(amenitiesPool).slice(0, 3 + (i % 4));

    let status: "draft" | "active" | "rented" | "sold" | "archived" = "active";
    let isPublished = true;
    let expiresAt = expiresDefault;
    if (i % 7 === 0) {
      status = "rented";
      isPublished = false;
    } else if (i % 11 === 0) {
      status = "sold";
      isPublished = false;
    } else if (i % 13 === 0) {
      status = "draft";
      isPublished = false;
    } else if (i % 17 === 0) {
      status = "archived";
      isPublished = false;
      expiresAt = addDays(today, -30);
    }

    listings.push({
      ownerId,
      slug,
      title,
      description,
      propertyType,
      listingType,
      price,
      billingPeriod,
      bedrooms,
      bathrooms,
      areaM2,
      furnished,
      genderPreference,
      distanceToUniversityKm: distanceKm.toString(),
      neighborhood,
      city: "aswan",
      address: `${neighborhood}, Aswan, Egypt`,
      latitude: null,
      longitude: null,
      amenities,
      status,
      isPublished,
      isVerified: i % 3 === 0,
      expiresAt: new Date(expiresAt + "T00:00:00Z"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await db.insert(schema.properties).values(listings);

  const allListings = await db
    .select({ id: schema.properties.id })
    .from(schema.properties)
    .where(inArray(schema.properties.slug, listings.map((l) => l.slug)));
  const imageValues = allListings.map((l, idx) => ({
    propertyId: l.id,
    url: PLACEHOLDER_IMAGE,
    storageKey: `placeholder-${idx}`,
    position: 0,
    caption: null,
  }));
  if (imageValues.length) {
    await db.insert(schema.propertyImages).values(imageValues);
  }

  const inquiryListings = allListings.slice(0, 4);
  if (inquiryListings.length) {
    await db.insert(schema.inquiries).values(
      inquiryListings.map((l, idx) => ({
        propertyId: l.id,
        userId: null,
        name: `Student ${idx + 1}`,
        phone: `+20100000000${idx + 1}`,
        message: "Is this still available? What's the deposit?",
        status: "new" as const,
      })),
    );
  }

  const reportListings = allListings.slice(4, 7);
  if (reportListings.length) {
    await db.insert(schema.reports).values(
      reportListings.map((l, idx) => ({
        propertyId: l.id,
        reporterId: null,
        reason: "misleading" as const,
        details: "Listing details appear inaccurate.",
        status: "open" as const,
      })),
    );
  }

  console.log(`Seed complete: ${listings.length} listings, ${demoOwners.length} owners, ${imageValues.length} images.`);
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}