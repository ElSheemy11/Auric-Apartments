"use server";

import { z } from "zod";
import {
  createListingSchema,
  updateListingSchema,
} from "@/lib/validators/listing";
import { requireUser, requireOwnerOf } from "@/lib/auth";
import {
  failure,
  fromUnknown,
  success,
  type ActionResult,
} from "@/lib/action-result";
import { type ListingView } from "@/types/listing";

export async function createListing(
  input: unknown,
): Promise<ActionResult<ListingView>> {
  try {
    await requireUser();
    const parsed = createListingSchema.safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    // TODO(step-2): insert property; duplicate detection (similar title/price/address per owner);
    // enforce configurable active-listing cap for new accounts.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function updateListing(
  input: unknown,
): Promise<ActionResult<ListingView>> {
  try {
    await requireUser();
    const parsed = updateListingSchema.safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    const { id } = parsed.data as { id: string };
    await requireOwnerOf(id);
    // TODO(step-2): update property (owner only).
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function deleteListing(
  propertyId: unknown,
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    await requireUser();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(propertyId);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    await requireOwnerOf(parsed.data.id);
    // TODO(step-2): delete property + remote images (cascade).
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function publishListing(
  propertyId: unknown,
): Promise<ActionResult<{ published: boolean }>> {
  try {
    await requireUser();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(propertyId);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    await requireOwnerOf(parsed.data.id);
    // TODO(step-2): set isPublished = true (suspended owners cannot publish).
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function unpublishListing(
  propertyId: unknown,
): Promise<ActionResult<{ published: boolean }>> {
  try {
    await requireUser();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(propertyId);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    await requireOwnerOf(parsed.data.id);
    // TODO(step-2): set isPublished = false.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function markRented(
  propertyId: unknown,
): Promise<ActionResult<{ status: string }>> {
  try {
    await requireUser();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(propertyId);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    await requireOwnerOf(parsed.data.id);
    // TODO(step-2): status = rented.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function markSold(
  propertyId: unknown,
): Promise<ActionResult<{ status: string }>> {
  try {
    await requireUser();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(propertyId);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    await requireOwnerOf(parsed.data.id);
    // TODO(step-2): status = sold.
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function renewListing(
  propertyId: unknown,
): Promise<ActionResult<{ expiresAt: string }>> {
  try {
    await requireUser();
    const parsed = z.object({ id: z.string().uuid() }).safeParse(propertyId);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    await requireOwnerOf(parsed.data.id);
    // TODO(step-2): extend expires_at (default 60 days).
    return failure("not_implemented", "errors.unknown");
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export async function listMyListingsAction(): Promise<ActionResult<ListingView[]>> {
  // TODO(step-2): owner's listings via listMyListings query (current user id).
  return success([]);
}