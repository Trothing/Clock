ALTER TABLE "messages" ADD COLUMN "forwarded_from_sender_id" integer;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "forwarded_from_sender_name" text;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_forwarded_from_sender_id_users_id_fk" FOREIGN KEY ("forwarded_from_sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;