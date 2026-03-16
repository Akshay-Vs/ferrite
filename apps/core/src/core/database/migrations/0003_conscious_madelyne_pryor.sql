ALTER TABLE "user_auth_providers" ADD COLUMN "oauth_provider" varchar(255);--> statement-breakpoint
ALTER TABLE "user_auth_providers" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_auth_providers" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_auth_providers" ADD COLUMN "locked" boolean DEFAULT false NOT NULL;