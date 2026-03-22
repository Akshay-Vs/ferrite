CREATE TYPE "public"."address_type" AS ENUM('home', 'work', 'other');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('clerk');--> statement-breakpoint
CREATE TYPE "public"."card_brand" AS ENUM('visa', 'mastercard');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'sms', 'push', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order_updates', 'promotions', 'restock', 'price_drop', 'support', 'security');--> statement-breakpoint
CREATE TYPE "public"."override_type" AS ENUM('grant', 'revoke');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('stripe', 'paypal');--> statement-breakpoint
CREATE TYPE "public"."permission_action" AS ENUM('create', 'read', 'update', 'delete', 'export', 'cancel', 'refund', 'assign', 'send', 'schedule', 'activate', 'manage_stock', 'approve');--> statement-breakpoint
CREATE TYPE "public"."permission_resource" AS ENUM('products', 'categories', 'orders', 'returns', 'customers', 'support_tickets', 'warehouse', 'inventory', 'suppliers', 'purchase_orders', 'promotions', 'messages', 'staff', 'roles', 'reports', 'store_settings');--> statement-breakpoint
CREATE TYPE "public"."staff_status" AS ENUM('active', 'suspended', 'invited');--> statement-breakpoint
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
CREATE TABLE "user_notification_preferences" (
	"user_id" uuid NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"type" "notification_type" NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_notification_preferences_user_id_channel_type_pk" PRIMARY KEY("user_id","channel","type")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource" "permission_resource" NOT NULL,
	"action" "permission_action" NOT NULL,
	"description" text,
	CONSTRAINT "uq_permission_resource_action" UNIQUE("resource","action")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"granted_by" uuid,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_roles_name" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"status" "staff_status" DEFAULT 'invited' NOT NULL,
	"invited_by" uuid,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"joined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_staff_user_id" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "staff_permission_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"type" "override_type" NOT NULL,
	"overridden_by" uuid NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_staff_permission_override" UNIQUE("staff_id","permission_id")
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
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_auth_providers" ADD CONSTRAINT "user_auth_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_granted_by_staff_members_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."staff_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_invited_by_staff_members_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."staff_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_permission_overrides" ADD CONSTRAINT "staff_permission_overrides_staff_id_staff_members_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_permission_overrides" ADD CONSTRAINT "staff_permission_overrides_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_permission_overrides" ADD CONSTRAINT "staff_permission_overrides_overridden_by_staff_members_id_fk" FOREIGN KEY ("overridden_by") REFERENCES "public"."staff_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_phones" ADD CONSTRAINT "user_phones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_auth_providers_lookup" ON "user_auth_providers" USING btree ("provider","external_auth_id");--> statement-breakpoint
CREATE INDEX "idx_auth_providers_user_id" ON "user_auth_providers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "user_payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payment_methods_one_default_per_user" ON "user_payment_methods" USING btree ("user_id") WHERE is_default = true;--> statement-breakpoint
CREATE INDEX "idx_payment_methods_expires_at" ON "user_payment_methods" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_notif_prefs_channel_type_enabled" ON "user_notification_preferences" USING btree ("channel","type","is_enabled");--> statement-breakpoint
CREATE INDEX "idx_permissions_resource" ON "permissions" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_permissions_lookup" ON "permissions" USING btree ("resource","action");--> statement-breakpoint
CREATE INDEX "idx_role_permissions_role_id" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "idx_roles_created_at" ON "roles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_roles_is_system" ON "roles" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX "idx_staff_user_id" ON "staff_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_staff_role_id" ON "staff_members" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_staff_status" ON "staff_members" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_staff_one_owner" ON "staff_members" USING btree ("is_owner") WHERE is_owner = true;--> statement-breakpoint
CREATE INDEX "idx_overrides_staff_id" ON "staff_permission_overrides" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_overrides_permission_id" ON "staff_permission_overrides" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "idx_overrides_type" ON "staff_permission_overrides" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_addresses_user_id" ON "user_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_addresses_one_primary_per_user" ON "user_addresses" USING btree ("user_id") WHERE is_primary = true;--> statement-breakpoint
CREATE INDEX "idx_addresses_country" ON "user_addresses" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_addresses_user_type" ON "user_addresses" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_phones_user_id" ON "user_phones" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_phones_default" ON "user_phones" USING btree ("user_id") WHERE is_default = true;--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_is_banned" ON "users" USING btree ("is_banned");--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at") WHERE deleted_at IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_last_login_at" ON "users" USING btree ("last_login_at");