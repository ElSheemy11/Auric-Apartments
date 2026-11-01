/** View-layer types for listing placeholders. Step 2 replaces these with Drizzle InferSelectModel types. */
export type ListingView = {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: "apartment" | "room" | "shared_room" | "studio" | "house";
  listingType: "rent" | "sale";
  price: number; // EGP cents
  billingPeriod: "monthly" | "yearly" | "one_time";
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  furnished: boolean;
  genderPreference: "any" | "male" | "female";
  neighborhood: string;
  city: string;
  address: string;
  coverImage: string | null;
  status: "draft" | "active" | "rented" | "sold" | "archived";
  isPublished: boolean;
  isVerified: boolean;
  createdAt: Date;
  distanceToUniversityKm: string | null; // numeric columns come back as strings
};

export type ListingFilters = {
  listingType?: "rent" | "sale";
  propertyType?: "apartment" | "room" | "shared_room" | "studio" | "house";
  minPrice?: number; // EGP cents
  maxPrice?: number; // EGP cents
  bedrooms?: number;
  furnished?: boolean;
  genderPreference?: "any" | "male" | "female";
  neighborhood?: string;
  maxDistanceKm?: number;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
};

export type ListingsPage = {
  items: ListingView[];
  total: number;
  page: number;
  pageSize: number;
};

export type InquiryView = {
  id: string;
  propertyId: string;
  userId: string | null;
  name: string;
  phone: string;
  message: string;
  status: "new" | "replied" | "closed";
  createdAt: Date;
};

export type ReportView = {
  id: string;
  propertyId: string;
  reporterId: string | null;
  reason:
    | "fraud"
    | "misleading"
    | "inappropriate"
    | "duplicate"
    | "rented_already"
    | "other";
  details: string | null;
  status: "open" | "reviewed" | "dismissed";
  createdAt: Date;
};

export type UserView = {
  id: string;
  clerkId: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  isSuspended: boolean;
  createdAt: Date;
};