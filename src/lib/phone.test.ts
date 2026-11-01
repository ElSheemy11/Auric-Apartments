import { describe, expect, it } from "vitest";
import { toWhatsAppDigits } from "./phone";

describe("toWhatsAppDigits", () => {
  it("adds the Egypt code to local numbers", () => {
    expect(toWhatsAppDigits("01012345678")).toBe("201012345678");
  });
  it("accepts + and spaces", () => {
    expect(toWhatsAppDigits("+20 101 234 5678")).toBe("201012345678");
  });
  it("accepts the 00 prefix", () => {
    expect(toWhatsAppDigits("0020 101 234 5678")).toBe("201012345678");
  });
  it("strips punctuation", () => {
    expect(toWhatsAppDigits("(010) 1234-5678")).toBe("201012345678");
  });
  it("leaves an already-international number alone", () => {
    expect(toWhatsAppDigits("201012345678")).toBe("201012345678");
  });
  it("returns an empty string for junk", () => {
    expect(toWhatsAppDigits("abc")).toBe("");
  });
});