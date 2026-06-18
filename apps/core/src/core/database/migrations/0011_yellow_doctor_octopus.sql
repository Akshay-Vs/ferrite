ALTER TABLE "storefront_users" ADD COLUMN "banned_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "storefront_users" ADD COLUMN "deleted_at" timestamp with time zone;