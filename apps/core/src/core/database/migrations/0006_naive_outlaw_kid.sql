ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "outbox_events" ADD COLUMN "scheduled_at" timestamp with time zone DEFAULT now() NOT NULL;