CREATE TYPE "public"."address_type" AS ENUM('home', 'work', 'other');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('clerk');--> statement-breakpoint
CREATE TYPE "public"."card_brand" AS ENUM('visa', 'mastercard');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'declined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'sms', 'push', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order_updates', 'promotions', 'restock', 'price_drop', 'support', 'security');--> statement-breakpoint
CREATE TYPE "public"."onboarding_state" AS ENUM('ABOUT_ME', 'STORE_CREATION', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('stripe', 'paypal');--> statement-breakpoint
CREATE TYPE "public"."permission_key" AS ENUM('products.read', 'products.create', 'products.update', 'products.delete', 'categories.read', 'categories.create', 'categories.update', 'categories.delete', 'customers.read', 'customers.create', 'customers.update', 'customers.delete', 'staff.read', 'staff.create', 'staff.update', 'staff.delete', 'store.read', 'store.create', 'store.update', 'store.delete', 'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.refund', 'orders.cancel', 'orders.fulfill', 'returns.read', 'returns.update', 'returns.approve', 'returns.reject', 'inventory.read', 'inventory.update', 'inventory.adjust', 'inventory.transfer', 'reports.read', 'logs.read', 'settings.read', 'settings.update');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('admin', 'staff', 'user');--> statement-breakpoint
CREATE TABLE "user_auth_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "auth_provider" NOT NULL,
	"oauth_provider" varchar(255),
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"external_auth_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_auth_provider_external" UNIQUE("provider","external_auth_id"),
	CONSTRAINT "uq_user_provider" UNIQUE("user_id","provider")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" char(3) PRIMARY KEY NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"decimal_precision" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"from_currency_code" char(3) NOT NULL,
	"to_currency_code" char(3) NOT NULL,
	"rate" numeric(18, 9) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_rates_from_currency_code_to_currency_code_pk" PRIMARY KEY("from_currency_code","to_currency_code")
);
--> statement-breakpoint
CREATE TABLE "inbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" text NOT NULL,
	"source" text NOT NULL,
	"queue_name" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_inbox_provider_event_id" UNIQUE("source","message_id")
);
--> statement-breakpoint
CREATE TABLE "user_onboarding" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"state" "onboarding_state" DEFAULT 'ABOUT_ME' NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"step_data" jsonb DEFAULT '{}'::jsonb,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"queue_name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 5 NOT NULL,
	"error_detail" text,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"notify_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"trace_context" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"provider_payment_method_id" varchar(255) NOT NULL,
	"card_last4" char(4),
	"card_brand" "card_brand",
	"expires_at" date,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_preferences" (
	"store_id" uuid PRIMARY KEY NOT NULL,
	"frontend_url" varchar(255),
	"html_template" varchar(255),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notification_preferences" (
	"user_id" uuid NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"type" "notification_type" NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_notification_preferences_user_id_channel_type_pk" PRIMARY KEY("user_id","channel","type")
);
--> statement-breakpoint
CREATE TABLE "store_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_members" (
	"store_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"suspended_at" timestamp with time zone,
	CONSTRAINT "store_members_store_id_user_id_pk" PRIMARY KEY("store_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "store_role_permissions" (
	"store_role_id" uuid NOT NULL,
	"permission_key" "permission_key" NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_role_permissions_store_role_id_permission_key_pk" PRIMARY KEY("store_role_id","permission_key")
);
--> statement-breakpoint
CREATE TABLE "store_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_store_roles_store_name" UNIQUE("store_id","name")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"description" text,
	"currency_code" char(3) NOT NULL,
	"banner_url" varchar(2048),
	"icon" varchar(256),
	"created_by" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
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
CREATE TABLE "storefront_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"store_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified_at" timestamp with time zone,
	"password_hash" varchar(255),
	"mfa_secret" varchar(255),
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_recovery_codes" text[],
	"failed_login_count" smallint DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"display_name" varchar(200),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"banned_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(100),
	"type" "address_type" DEFAULT 'home' NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"company" varchar(150),
	"phone" varchar(20),
	"country_code" varchar(5),
	"line1" varchar(255) NOT NULL,
	"line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"postal_code" varchar(20) NOT NULL,
	"country" char(2) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_phones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phone" varchar(20) NOT NULL,
	"country_code" varchar(5) NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_phone_country" UNIQUE("country_code","phone")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"avatar_url" varchar(2048),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"date_of_birth" date,
	"preferred_locale" varchar(10) DEFAULT 'en-US',
	"preferred_currency" char(3) DEFAULT 'USD',
	"is_active" boolean DEFAULT true NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"ban_reason" varchar(500),
	"platform_role" "platform_role" DEFAULT 'user' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_auth_providers" ADD CONSTRAINT "user_auth_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_from_currency_code_currencies_code_fk" FOREIGN KEY ("from_currency_code") REFERENCES "public"."currencies"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_to_currency_code_currencies_code_fk" FOREIGN KEY ("to_currency_code") REFERENCES "public"."currencies"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_invitations" ADD CONSTRAINT "store_invitations_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_invitations" ADD CONSTRAINT "store_invitations_role_id_store_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."store_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_invitations" ADD CONSTRAINT "store_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_role_id_store_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."store_roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_role_permissions" ADD CONSTRAINT "store_role_permissions_store_role_id_store_roles_id_fk" FOREIGN KEY ("store_role_id") REFERENCES "public"."store_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_roles" ADD CONSTRAINT "store_roles_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_currency_code_currencies_code_fk" FOREIGN KEY ("currency_code") REFERENCES "public"."currencies"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_email_verifications" ADD CONSTRAINT "storefront_email_verifications_user_id_storefront_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."storefront_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_oauth_accounts" ADD CONSTRAINT "storefront_oauth_accounts_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_oauth_accounts" ADD CONSTRAINT "storefront_oauth_accounts_user_id_storefront_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."storefront_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_password_resets" ADD CONSTRAINT "storefront_password_resets_user_id_storefront_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."storefront_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_users" ADD CONSTRAINT "storefront_users_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_phones" ADD CONSTRAINT "user_phones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_auth_providers_lookup" ON "user_auth_providers" USING btree ("provider","external_auth_id");--> statement-breakpoint
CREATE INDEX "idx_auth_providers_user_id" ON "user_auth_providers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_currencies_code" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_exchange_rates_from_to" ON "exchange_rates" USING btree ("from_currency_code","to_currency_code");--> statement-breakpoint
CREATE INDEX "idx_user_onboarding_state" ON "user_onboarding" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_user_onboarding_is_completed" ON "user_onboarding" USING btree ("is_completed");--> statement-breakpoint
CREATE INDEX "idx_outbox_pending" ON "outbox_events" USING btree ("created_at") WHERE processed_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "user_payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payment_methods_one_default_per_user" ON "user_payment_methods" USING btree ("user_id") WHERE is_default = true;--> statement-breakpoint
CREATE INDEX "idx_payment_methods_expires_at" ON "user_payment_methods" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_notif_prefs_channel_type_enabled" ON "user_notification_preferences" USING btree ("channel","type","is_enabled");--> statement-breakpoint
CREATE INDEX "idx_store_invitations_store_id" ON "store_invitations" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_invitations_email" ON "store_invitations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_store_invitations_token" ON "store_invitations" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_store_members_one_owner_per_store" ON "store_members" USING btree ("store_id","is_owner") WHERE is_owner = true;--> statement-breakpoint
CREATE INDEX "idx_store_members_user_id" ON "store_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_store_members_store_role" ON "store_members" USING btree ("store_id","role_id");--> statement-breakpoint
CREATE INDEX "idx_store_role_permissions_role_id" ON "store_role_permissions" USING btree ("store_role_id");--> statement-breakpoint
CREATE INDEX "idx_store_role_permissions_permission_key" ON "store_role_permissions" USING btree ("permission_key");--> statement-breakpoint
CREATE INDEX "idx_store_roles_store_id" ON "store_roles" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_stores_slug" ON "stores" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_stores_created_by" ON "stores" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_stores_created_at" ON "stores" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_stores_active_created" ON "stores" USING btree ("is_active","created_at") WHERE is_active = true AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_email_verifications_user_id" ON "storefront_email_verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_verifications_expires_at" ON "storefront_email_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_oauth_accounts_user_id" ON "storefront_oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_token_hash" ON "storefront_password_resets" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_password_resets_user_id" ON "storefront_password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_resets_expires_at" ON "storefront_password_resets" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_storefront_users_store_email" ON "storefront_users" USING btree ("store_id",lower("email"));--> statement-breakpoint
CREATE INDEX "idx_storefront_users_store_id" ON "storefront_users" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_storefront_users_email" ON "storefront_users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "idx_storefront_users_created_at" ON "storefront_users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_addresses_user_id" ON "user_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_addresses_one_primary_per_user" ON "user_addresses" USING btree ("user_id") WHERE is_primary = true;--> statement-breakpoint
CREATE INDEX "idx_addresses_country" ON "user_addresses" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_addresses_user_type" ON "user_addresses" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_phones_user_id" ON "user_phones" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_phones_default" ON "user_phones" USING btree ("user_id") WHERE is_default = true;--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_is_banned" ON "users" USING btree ("is_banned");--> statement-breakpoint
CREATE INDEX "idx_users_platform_role" ON "users" USING btree ("platform_role");--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at") WHERE deleted_at IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_last_login_at" ON "users" USING btree ("last_login_at");