CREATE TABLE "storefront_email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storefront_oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_oauth_store_provider_user" UNIQUE("store_id","provider","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE "storefront_password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storefront_users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "storefront_users" ADD COLUMN "password_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "storefront_users" ADD COLUMN "mfa_secret" varchar(255);--> statement-breakpoint
ALTER TABLE "storefront_users" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "storefront_users" ADD COLUMN "mfa_recovery_codes" text[];--> statement-breakpoint
ALTER TABLE "storefront_users" ADD COLUMN "failed_login_count" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "storefront_users" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "storefront_email_verifications" ADD CONSTRAINT "storefront_email_verifications_user_id_storefront_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."storefront_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_oauth_accounts" ADD CONSTRAINT "storefront_oauth_accounts_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_oauth_accounts" ADD CONSTRAINT "storefront_oauth_accounts_user_id_storefront_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."storefront_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_password_resets" ADD CONSTRAINT "storefront_password_resets_user_id_storefront_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."storefront_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_email_verifications_token_hash" ON "storefront_email_verifications" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_user_id" ON "storefront_email_verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_expires_at" ON "storefront_email_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_oauth_accounts_user_id" ON "storefront_oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_token_hash" ON "storefront_password_resets" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_password_resets_user_id" ON "storefront_password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_expires_at" ON "storefront_password_resets" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "storefront_users" DROP COLUMN "email_verified";