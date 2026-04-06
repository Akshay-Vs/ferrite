CREATE TABLE "store_members" (
	"store_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_members_store_id_user_id_pk" PRIMARY KEY("store_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "store_role_permissions" (
	"store_role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "store_role_permissions_store_role_id_permission_id_pk" PRIMARY KEY("store_role_id","permission_id")
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
	"banner_url" varchar(2048),
	"icon_url" varchar(2048),
	"created_by" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_members" ADD CONSTRAINT "store_members_role_id_store_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."store_roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_role_permissions" ADD CONSTRAINT "store_role_permissions_store_role_id_store_roles_id_fk" FOREIGN KEY ("store_role_id") REFERENCES "public"."store_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_role_permissions" ADD CONSTRAINT "store_role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_roles" ADD CONSTRAINT "store_roles_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_store_members_one_owner_per_store" ON "store_members" USING btree ("store_id","is_owner") WHERE is_owner = true;--> statement-breakpoint
CREATE INDEX "idx_store_members_user_id" ON "store_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_store_members_store_role" ON "store_members" USING btree ("store_id","role_id");--> statement-breakpoint
CREATE INDEX "idx_store_role_permissions_role_id" ON "store_role_permissions" USING btree ("store_role_id");--> statement-breakpoint
CREATE INDEX "idx_store_role_permissions_permission_id" ON "store_role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "idx_store_roles_store_id" ON "store_roles" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_stores_slug" ON "stores" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_stores_created_by" ON "stores" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_stores_created_at" ON "stores" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_stores_active_created" ON "stores" USING btree ("is_active","created_at") WHERE is_active = true AND deleted_at IS NULL;