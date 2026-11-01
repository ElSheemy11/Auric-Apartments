CREATE TYPE "public"."billing_period" AS ENUM('monthly', 'yearly', 'one_time');--> statement-breakpoint
CREATE TYPE "public"."gender_preference" AS ENUM('any', 'male', 'female');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('rent', 'sale');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('draft', 'active', 'rented', 'sold', 'archived');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'room', 'shared_room', 'studio', 'house');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('fraud', 'misleading', 'inappropriate', 'duplicate', 'rented_already', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'reviewed', 'dismissed');--> statement-breakpoint
CREATE TABLE "contact_reveals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"user_id" uuid,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_property_id_pk" PRIMARY KEY("user_id","property_id")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"property_type" "property_type" NOT NULL,
	"listing_type" "listing_type" NOT NULL,
	"price" integer NOT NULL,
	"billing_period" "billing_period" DEFAULT 'monthly' NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"area_m2" integer NOT NULL,
	"furnished" boolean DEFAULT false NOT NULL,
	"gender_preference" "gender_preference" DEFAULT 'any' NOT NULL,
	"distance_to_university_km" numeric(6, 2),
	"neighborhood" text NOT NULL,
	"city" text DEFAULT 'aswan' NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"amenities" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" "property_status" DEFAULT 'draft' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() + interval '60 days' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug"),
	CONSTRAINT "properties_price_nonneg" CHECK (price >= 0),
	CONSTRAINT "properties_bedrooms_nonneg" CHECK (bedrooms >= 0),
	CONSTRAINT "properties_bathrooms_nonneg" CHECK (bathrooms >= 0),
	CONSTRAINT "properties_area_nonneg" CHECK (area_m2 >= 0),
	CONSTRAINT "properties_latitude_range" CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
	CONSTRAINT "properties_longitude_range" CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"url" text NOT NULL,
	"storage_key" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"caption" text
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"window_seconds" integer NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rate_limits_identifier_window_idx" UNIQUE("identifier","window_seconds")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"reporter_id" uuid,
	"reason" "report_reason" NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"image_url" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_suspended" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "bookings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "experiences" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rooms" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tenant_contact" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tenants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "bookings" CASCADE;--> statement-breakpoint
DROP TABLE "experiences" CASCADE;--> statement-breakpoint
DROP TABLE "rooms" CASCADE;--> statement-breakpoint
DROP TABLE "tenant_contact" CASCADE;--> statement-breakpoint
DROP TABLE "tenants" CASCADE;--> statement-breakpoint
ALTER TABLE "inquiries" DROP CONSTRAINT "inquiries_tenant_id_tenants_id_fk";
--> statement-breakpoint
DROP INDEX "inquiries_tenant_id_idx";--> statement-breakpoint
ALTER TABLE "inquiries" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "property_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "contact_reveals" ADD CONSTRAINT "contact_reveals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_reveals" ADD CONSTRAINT "contact_reveals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_reveals_property_id_idx" ON "contact_reveals" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "contact_reveals_user_id_idx" ON "contact_reveals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_reveals_ip_created_idx" ON "contact_reveals" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "favorites_property_id_idx" ON "favorites" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "properties_listing_type_idx" ON "properties" USING btree ("listing_type");--> statement-breakpoint
CREATE INDEX "properties_property_type_idx" ON "properties" USING btree ("property_type");--> statement-breakpoint
CREATE INDEX "properties_neighborhood_idx" ON "properties" USING btree ("neighborhood");--> statement-breakpoint
CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");--> statement-breakpoint
CREATE INDEX "properties_owner_id_idx" ON "properties" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "properties_expires_at_idx" ON "properties" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "properties_public_created_idx" ON "properties" USING btree ("created_at") WHERE status = 'active' AND is_published = true;--> statement-breakpoint
CREATE INDEX "properties_public_price_idx" ON "properties" USING btree ("price") WHERE status = 'active' AND is_published = true;--> statement-breakpoint
CREATE INDEX "property_images_property_position_idx" ON "property_images" USING btree ("property_id","position");--> statement-breakpoint
CREATE INDEX "rate_limits_expires_at_idx" ON "rate_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "reports_property_id_idx" ON "reports" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "reports_reporter_id_idx" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_one_open_per_user_idx" ON "reports" USING btree ("reporter_id","property_id") WHERE status = 'open';--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiries_property_id_idx" ON "inquiries" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "inquiries_user_id_idx" ON "inquiries" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "inquiries" DROP COLUMN "tenant_id";--> statement-breakpoint
ALTER TABLE "inquiries" DROP COLUMN "email";--> statement-breakpoint
DROP TYPE "public"."booking_status";--> statement-breakpoint
DROP TYPE "public"."room_view";--> statement-breakpoint
DROP TYPE "public"."tenant_locale";