ALTER TABLE "user_payment_methods" RENAME COLUMN "token" TO "provider_payment_method_id";--> statement-breakpoint
DROP INDEX "idx_payment_methods_default";--> statement-breakpoint
DROP INDEX "idx_staff_owner";--> statement-breakpoint
DROP INDEX "idx_phones_lookup";--> statement-breakpoint
DROP INDEX "idx_users_email";--> statement-breakpoint
DROP INDEX "idx_phones_default";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payment_methods_one_default_per_user" ON "user_payment_methods" USING btree ("user_id") WHERE is_default = true;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_staff_one_owner" ON "staff_members" USING btree ("is_owner") WHERE is_owner = true;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_phones_default" ON "user_phones" USING btree ("user_id") WHERE is_default = true;