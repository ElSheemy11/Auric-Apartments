import { describe, expect, it } from "vitest";
import { createInquirySchema } from "./inquiry";
import { createReportSchema } from "./report";

const id = "3f2b8c1e-9d4a-4b7e-8a5c-1d2e3f4a5b6c";

describe("createInquirySchema", () => {
  const ok = { propertyId: id, name: "Ahmed", phone: "01012345678", message: "Is it still available?" };
  it("accepts a valid inquiry", () => {
    expect(createInquirySchema.safeParse(ok).success).toBe(true);
  });
  it("rejects a bad property id", () => {
    expect(createInquirySchema.safeParse({ ...ok, propertyId: "123" }).success).toBe(false);
  });
  it("rejects a too-short message", () => {
    expect(createInquirySchema.safeParse({ ...ok, message: "hi" }).success).toBe(false);
  });
});

describe("createReportSchema", () => {
  it("accepts a report without details", () => {
    expect(createReportSchema.safeParse({ propertyId: id, reason: "fraud" }).success).toBe(true);
  });
  it("rejects an unknown reason", () => {
    expect(createReportSchema.safeParse({ propertyId: id, reason: "boring" }).success).toBe(false);
  });
});