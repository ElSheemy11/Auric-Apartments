import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { inquiries, properties } from "@/server/db/schema";
import { type InquiryView } from "@/types/listing";

type InquiryRow = {
  id: string;
  propertyId: string;
  userId: string | null;
  name: string;
  phone: string;
  message: string;
  status: "new" | "replied" | "closed";
  createdAt: Date;
  slug: string;
  title: string;
  address: string;
  neighborhood: string;
};

function toInquiryView(row: InquiryRow): InquiryView {
  return {
    id: row.id,
    propertyId: row.propertyId,
    userId: row.userId,
    name: row.name,
    phone: row.phone,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
  };
}

/**
 * Owner's inbox: inquiries on the owner's own listings (joined to the property
 * so the dashboard can show neighborhood/title without a second query).
 */
export async function listInquiriesForOwner(
  ownerId: string,
): Promise<InquiryView[]> {
  const rows = await db
    .select({
      id: inquiries.id,
      propertyId: inquiries.propertyId,
      userId: inquiries.userId,
      name: inquiries.name,
      phone: inquiries.phone,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      slug: properties.slug,
      title: properties.title,
      address: properties.address,
      neighborhood: properties.neighborhood,
    })
    .from(inquiries)
    .innerJoin(properties, eq(inquiries.propertyId, properties.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(desc(inquiries.createdAt));

  return rows.map(toInquiryView);
}

export async function getInquiry(inquiryId: string): Promise<InquiryView | null> {
  const [row] = await db
    .select({
      id: inquiries.id,
      propertyId: inquiries.propertyId,
      userId: inquiries.userId,
      name: inquiries.name,
      phone: inquiries.phone,
      message: inquiries.message,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
    })
    .from(inquiries)
    .where(eq(inquiries.id, inquiryId))
    .limit(1);
  return row ? toInquiryView(row as InquiryRow) : null;
}