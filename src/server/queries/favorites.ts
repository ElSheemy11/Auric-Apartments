import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import {
  favorites,
  propertyImages,
  properties,
  propertyTypeEnum,
  listingTypeEnum,
  billingPeriodEnum,
  genderPreferenceEnum,
  propertyStatusEnum,
} from "@/server/db/schema";
import { type ListingView } from "@/types/listing";

type FavoriteRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: (typeof propertyTypeEnum.enumValues)[number];
  listingType: (typeof listingTypeEnum.enumValues)[number];
  price: number;
  billingPeriod: (typeof billingPeriodEnum.enumValues)[number];
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  furnished: boolean;
  genderPreference: (typeof genderPreferenceEnum.enumValues)[number];
  neighborhood: string;
  city: string;
  address: string;
  coverImage: string | null;
  status: (typeof propertyStatusEnum.enumValues)[number];
  isPublished: boolean;
  isVerified: boolean;
  createdAt: Date;
  distanceToUniversityKm: string | null;
};

function toListingView(row: FavoriteRow): ListingView {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    propertyType: row.propertyType,
    listingType: row.listingType,
    price: row.price,
    billingPeriod: row.billingPeriod,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaM2: row.areaM2,
    furnished: row.furnished,
    genderPreference: row.genderPreference,
    neighborhood: row.neighborhood,
    city: row.city,
    address: row.address,
    coverImage: row.coverImage,
    status: row.status,
    isPublished: row.isPublished,
    isVerified: row.isVerified,
    distanceToUniversityKm: row.distanceToUniversityKm,
    createdAt: row.createdAt,   
  };
}

export async function listFavorites(userId: string): Promise<ListingView[]> {
  const rows = await db
    .select({
      id: properties.id,
      slug: properties.slug,
      title: properties.title,
      description: properties.description,
      propertyType: properties.propertyType,
      listingType: properties.listingType,
      price: properties.price,
      billingPeriod: properties.billingPeriod,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      areaM2: properties.areaM2,
      furnished: properties.furnished,
      genderPreference: properties.genderPreference,
      neighborhood: properties.neighborhood,
      city: properties.city,
      address: properties.address,
      coverImage: propertyImages.url,
      status: properties.status,
      isPublished: properties.isPublished,
      isVerified: properties.isVerified,
      distanceToUniversityKm: properties.distanceToUniversityKm,
      createdAt: properties.createdAt,
    })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .leftJoin(
      propertyImages,
      and(eq(propertyImages.propertyId, properties.id), eq(propertyImages.position, 0)),
    )
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  return rows.map(toListingView);
}

export async function isFavorite(
  userId: string,
  propertyId: string,
): Promise<boolean> {
  const [row] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
    .limit(1);
  return !!row;
}