-- Create profiles table
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text",
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id")
);

-- Add RLS policies for profiles
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to manage their own profile
CREATE POLICY "Users can manage their own profile" ON "public"."profiles"
    FOR ALL USING ("auth"."uid"() = "id");

-- Add index for profiles
CREATE INDEX "idx_profiles_id" ON "public"."profiles" ("id");

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "public"."profiles" ("id", "email", "full_name")
    VALUES (
        NEW."id",
        NEW."email",
        COALESCE(NEW."raw_user_meta_data"->>'full_name', NEW."email")
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user creation
CREATE TRIGGER "on_auth_user_created"
    AFTER INSERT ON "auth"."users"
    FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();

-- Add foreign key constraint to cascade delete profiles when auth.users is deleted
-- This must be after the trigger to avoid race conditions
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" 
    FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Drop existing user_activity_logs table and recreate with user_id
DROP TABLE IF EXISTS "public"."user_activity_logs";

-- Recreate user activity logs table with user_id
CREATE TABLE IF NOT EXISTS "public"."user_activity_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "title" "text",
    "duration" "int8" NOT NULL,
    "timestamp" "int8" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Add RLS policies for user_activity_logs
ALTER TABLE "public"."user_activity_logs" ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own activity logs
CREATE POLICY "Users can insert their own activity logs" ON "public"."user_activity_logs"
    FOR INSERT WITH CHECK ("auth"."uid"() = "user_id");

-- Policy to allow users to view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON "public"."user_activity_logs"
    FOR SELECT USING ("auth"."uid"() = "user_id");

-- Add indexes for better performance
CREATE INDEX "idx_user_activity_logs_user_id" ON "public"."user_activity_logs" ("user_id");
CREATE INDEX "idx_user_activity_logs_timestamp" ON "public"."user_activity_logs" ("timestamp");
CREATE INDEX "idx_user_activity_logs_created_at" ON "public"."user_activity_logs" ("created_at");

-- Add foreign key constraint
ALTER TABLE "public"."user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE; 
