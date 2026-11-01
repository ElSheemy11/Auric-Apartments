"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { toWhatsAppDigits } from "@/lib/phone";
import {
  failure,
  fromUnknown,
  success,
  type ActionResult,
} from "@/lib/action-result";
import { checkRateLimit } from "@/server/queries/contacts";
import { db } from "@/server/db";
import { contactReveals, properties, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";

const revealContactSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
});

const REVEAL_WINDOW_SECONDS = 15 * 60;
const REVEAL_MAX_REQUESTS = 5;

export type ContactRevealResult = {
  phone: string; // normalized E.164 digits without "+"
  whatsapp: string; // digits for wa.me links
  waUrl: string;
  telUrl: string;
};

function normalizeEgyptianPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `20${digits.slice(1)}`;
  return digits;
}

export async function revealContact(
  input: unknown,
): Promise<ActionResult<ContactRevealResult>> {
  try {
    const user = await getCurrentUser();
    if (user?.isSuspended) {
      throw new Error("user is suspended");
    }

    const parsed = revealContactSchema.safeParse(input);
    if (!parsed.success) {
      return failure("validation_failed", "errors.validation");
    }
    const propertyId = parsed.data.propertyId;

    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");
    const identifier = user ? `user:${user.id}` : `ip:${ipHash}`;

    const rl = await checkRateLimit(identifier, REVEAL_WINDOW_SECONDS, REVEAL_MAX_REQUESTS);
    if (!rl.allowed) {
      return failure("rate_limited", "errors.rateLimited");
    }

    const [row] = await db
      .select({ phone: users.phone, whatsapp: users.whatsapp })
      .from(properties)
      .innerJoin(users, eq(properties.ownerId, users.id))
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!row || !row.phone) {
      return failure("not_found", "errors.notFound");
    }

    const phone = normalizeEgyptianPhone(row.phone);
    const whatsapp = normalizeEgyptianPhone(row.whatsapp || row.phone);

    await db.insert(contactReveals).values({
      propertyId,
      userId: user?.id ?? null,
      ipHash,
    });

    return success({
      phone,
      whatsapp,
      waUrl: `https://wa.me/${whatsapp}`,
      telUrl: `tel:+${phone}`,
    });
  } catch (err) {
    const e = fromUnknown(err);
    return failure(e.code, e.messageKey);
  }
}

export function buildContactLinks(phoneDigits: string): {
  whatsapp: string;
  waUrl: string;
  telUrl: string;
} {
  const whatsapp = toWhatsAppDigits(phoneDigits);
  return {
    whatsapp,
    waUrl: `https://wa.me/${whatsapp}`,
    telUrl: `tel:+${whatsapp}`,
  };
}