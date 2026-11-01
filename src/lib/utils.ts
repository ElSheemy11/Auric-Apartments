export { cn } from "cn";

/** Collapse whitespace and trim; used to sanitize free text before validation/storage. */
export function sanitizeText(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return value.trim().replace(/\s+/g, " ");
}
