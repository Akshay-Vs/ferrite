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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_from_currency_code_currencies_code_fk" FOREIGN KEY ("from_currency_code") REFERENCES "public"."currencies"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_to_currency_code_currencies_code_fk" FOREIGN KEY ("to_currency_code") REFERENCES "public"."currencies"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_currencies_code" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_exchange_rates_from_to" ON "exchange_rates" USING btree ("from_currency_code","to_currency_code");