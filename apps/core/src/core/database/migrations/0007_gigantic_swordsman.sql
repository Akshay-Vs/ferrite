CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'declined', 'expired');--> statement-breakpoint
CREATE TABLE "store_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "store_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "store_invitations" ADD CONSTRAINT "store_invitations_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_invitations" ADD CONSTRAINT "store_invitations_role_id_store_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."store_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_invitations" ADD CONSTRAINT "store_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_store_invitations_store_id" ON "store_invitations" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_store_invitations_email" ON "store_invitations" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_store_invitations_token" ON "store_invitations" USING btree ("token");