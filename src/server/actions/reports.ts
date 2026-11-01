"use server";

import { z } from "zod";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createReportSchema } from "@/lib/validators/report";
import {
  failure,
  fromUnknown,
  success,
  type ActionResult,
} from "@/lib/action-result";
import { type ReportView } from "@/types/listing";

export async function createReport(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (user?.isSuspended) {
      throw new Error("user is suspended");
    }

    const parsed = createReportSchema.safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): rate limit; one open report per user per property; insert report.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function listReports(): Promise<ActionResult<ReportView[]>> {
  try {
    await requireAdmin();
    // TODO(step-2): list all reports for admin review.
    return success([]);
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function updateReportStatus(
  input: unknown,
): Promise<ActionResult<{ status: string }>> {
  try {
    await requireAdmin();
    const parsed = z
      .object({
        id: z.string().uuid(),
        status: z.enum(["open", "reviewed", "dismissed"]),
      })
      .safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): update report status.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function adminUnpublishListing(
  propertyId: unknown,
): Promise<ActionResult<{ published: boolean }>> {
  try {
    await requireAdmin();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(propertyId);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): set isPublished = false on any listing.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function adminDeleteListing(
  propertyId: unknown,
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    await requireAdmin();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(propertyId);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): delete listing + remote images.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function suspendUser(
  input: unknown,
): Promise<ActionResult<{ isSuspended: boolean }>> {
  try {
    await requireAdmin();
    const parsed = z
      .object({
        userId: z.string().uuid(),
        isSuspended: z.boolean(),
      })
      .safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): set users.is_suspended (never settable from client).
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function toggleVerified(
  input: unknown,
): Promise<ActionResult<{ isVerified: boolean }>> {
  try {
    await requireAdmin();
    const parsed = z
      .object({
        propertyId: z.string().uuid(),
        isVerified: z.boolean(),
      })
      .safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): set properties.is_verified.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}