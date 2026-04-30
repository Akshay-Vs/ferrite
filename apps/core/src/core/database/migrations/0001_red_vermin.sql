CREATE TYPE "public"."onboarding_state" AS ENUM('ABOUT_ME', 'STORE_CREATION', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "user_onboarding" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"state" "onboarding_state" DEFAULT 'ABOUT_ME' NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"step_data" jsonb DEFAULT '{}'::jsonb,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_onboarding_state" ON "user_onboarding" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_user_onboarding_is_completed" ON "user_onboarding" USING btree ("is_completed");