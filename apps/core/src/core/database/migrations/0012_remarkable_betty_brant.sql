CREATE TABLE "store_preferences" (
	"store_id" uuid PRIMARY KEY NOT NULL,
	"frontend_url" varchar(255),
	"html_template" varchar(255),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storefront_users" DROP CONSTRAINT "uq_storefront_users_store_email";--> statement-breakpoint
DROP INDEX "idx_storefront_users_email";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_storefront_users_store_email" ON "storefront_users" USING btree ("store_id",lower("email"));--> statement-breakpoint
CREATE INDEX "idx_storefront_users_email" ON "storefront_users" USING btree (lower("email"));