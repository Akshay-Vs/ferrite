CREATE TABLE "storefront_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"store_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"display_name" varchar(200),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_storefront_users_store_email" UNIQUE("store_id","email")
);
--> statement-breakpoint
ALTER TABLE "storefront_users" ADD CONSTRAINT "storefront_users_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_storefront_users_store_id" ON "storefront_users" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_storefront_users_email" ON "storefront_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_storefront_users_created_at" ON "storefront_users" USING btree ("created_at");