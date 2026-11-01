import { describe, expect, it } from "vitest";
import {
  createListingSchema,
  listingFiltersSchema,
  updateListingSchema,
} from "./listing";

const valid = {
  title: "  Sunny flat near the university ",
  description: "Two bedroom flat, ten minutes from campus.",
  propertyType: "apartment",
  listingType: "rent",
  price: 3500,
  bedrooms: 2,
  bathrooms: 1,
  areaM2: 80,
  neighborhood: "Sadat",
  address: "12 Sadat St",
};

describe("createListingSchema", () => {
  it("accepts a valid listing, trims, and applies defaults", () => {
    const r = createListingSchema.parse(valid);
    expect(r.title).toBe("Sunny flat near the university");
    expect(r.billingPeriod).toBe("monthly");
    expect(r.furnished).toBe(false);
    expect(r.genderPreference).toBe("any");
    expect(r.city).toBe("aswan");
    expect(r.amenities).toEqual([]);
  });
  it("rejects an unknown property type", () => {
    expect(createListingSchema.safeParse({ ...valid, propertyType: "castle" }).success).toBe(false);
  });
  it("rejects negative and fractional prices", () => {
    expect(createListingSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
    expect(createListingSchema.safeParse({ ...valid, price: 10.5 }).success).toBe(false);
  });
  it("rejects a too-short title", () => {
    expect(createListingSchema.safeParse({ ...valid, title: "ab" }).success).toBe(false);
  });
  it("parses the string 'false' as false, not true", () => {
    const r = createListingSchema.parse({ ...valid, furnished: "false" });
    expect(r.furnished).toBe(false);
  });
});

describe("updateListingSchema", () => {
  it("does not inject defaults into a partial update", () => {
    expect(updateListingSchema.parse({ title: "A new title" })).toEqual({
      title: "A new title",
    });
  });
  it("rejects an empty update", () => {
    expect(updateListingSchema.safeParse({}).success).toBe(false);
  });
});

describe("listingFiltersSchema", () => {
  it("applies defaults", () => {
    const r = listingFiltersSchema.parse({});
    expect(r).toMatchObject({ sort: "newest", page: 1, pageSize: 20 });
  });
  it("coerces query-string values", () => {
    const r = listingFiltersSchema.parse({ minPrice: "1000", page: "2" });
    expect(r.minPrice).toBe(1000);
    expect(r.page).toBe(2);
  });
  it("parses furnished=false from a URL as false", () => {
    expect(listingFiltersSchema.parse({ furnished: "false" }).furnished).toBe(false);
  });
  it("rejects min price above max price", () => {
    expect(listingFiltersSchema.safeParse({ minPrice: 5000, maxPrice: 1000 }).success).toBe(false);
  });
  it("caps the page size", () => {
    expect(listingFiltersSchema.safeParse({ pageSize: 101 }).success).toBe(false);
  });
});