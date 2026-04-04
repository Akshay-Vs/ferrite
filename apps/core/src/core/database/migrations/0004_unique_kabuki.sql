ALTER TABLE "inbox_events" RENAME COLUMN "aggregate_type" TO "queue_name";--> statement-breakpoint
ALTER TABLE "outbox_events" DROP COLUMN "aggregate_id";--> statement-breakpoint
ALTER TABLE "outbox_events" DROP COLUMN "aggregate_type";