"use server";

import { createInquirySchema } from "@/lib/validators/inquiry";
import { getCurrentUser } from "@/lib/auth";
import { failure, fromUnknown, type ActionResult } from "@/lib/action-result";

export async function createInquiry(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    // Anonymous inquiries allowed; a signed-in suspended user is blocked.
    const user = await getCurrentUser();
    if (user?.isSuspended) {
      throw new Error("user is suspended");
    }

    const parsed = createInquirySchema.safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): rate limit, insert inquiry, notify owner.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}