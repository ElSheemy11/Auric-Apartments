"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { failure, fromUnknown, type ActionResult } from "@/lib/action-result";

const toggleFavoriteSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
});

export async function toggleFavorite(
  input: unknown,
): Promise<ActionResult<{ favorited: boolean }>> {
  try {
    await requireUser();
    const parsed = toggleFavoriteSchema.safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): toggle favorites row for userId + propertyId.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}