

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgaudit" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."COMMUNITY_JOIN_MODE" AS ENUM (
    'INVITATION_ONLY',
    'OPEN_TO_ALL'
);


ALTER TYPE "public"."COMMUNITY_JOIN_MODE" OWNER TO "postgres";


CREATE TYPE "public"."EVENT_TYPE" AS ENUM (
    'ONLINE',
    'OFFLINE',
    'ONDEMAND'
);


ALTER TYPE "public"."EVENT_TYPE" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'staff',
    'community_admin'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."community_member_status" AS ENUM (
    'INVITED',
    'REQUESTED',
    'ACCEPTED',
    'REQUEST_REJECTED',
    'REMOVED',
    'INVITATION_REJECTED'
);


ALTER TYPE "public"."community_member_status" OWNER TO "postgres";


CREATE TYPE "public"."recommendation_status" AS ENUM (
    'ACCEPTED',
    'REJECTED',
    'NOT_USED'
);


ALTER TYPE "public"."recommendation_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."db_pre_request"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    claims jsonb;
    headers jsonb;
    my_community_ids jsonb;
    my_managing_community_ids jsonb;
BEGIN
    -- Get the claims from the JWT
    SELECT coalesce(current_setting('request.jwt.claims', TRUE), '{}') INTO claims;
    SELECT coalesce(current_setting('request.headers', TRUE), '{}') INTO headers;
    claims := claims || jsonb_build_object('headers', headers);

    -- ******************************** CUSTOM CLAIMS ********************************
    -- Get communities where the user is a member
    SELECT jsonb_agg(community_id) INTO my_community_ids
    FROM c_community_members
    WHERE user_id = ((claims::jsonb) ->> 'sub')::uuid;

    -- Get communities where the user is a manager
    SELECT jsonb_agg(id) INTO my_managing_community_ids
    FROM c_community
    WHERE manager_id = ((claims::jsonb) ->> 'sub')::uuid;

    -- RAISE EXCEPTION 'User is not a manager of any communities. Managing Community IDs: %, sub1: %', my_managing_community_ids, current_setting('request.jwt.claims', TRUE);
    -- Add the custom claim to the claims JSON
    claims := claims || jsonb_build_object(
        'my_community_ids', COALESCE(my_community_ids, '[]'::jsonb),
        'my_managing_community_ids', COALESCE(my_managing_community_ids, '[]'::jsonb)
    );
    -- *******************************************************************************

    -- Set the claims in the request context
    PERFORM set_config('request.claims'::text, claims::text, FALSE /* is_local */);
    RETURN claims;
END;
$$;


ALTER FUNCTION "public"."db_pre_request"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."db_pre_request_debug"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    claims jsonb;
    headers jsonb;
    my_community_ids jsonb;
    my_managing_community_ids jsonb;
BEGIN
    -- Get the claims from the JWT
    SELECT coalesce(current_setting('request.jwt.claims', TRUE), '{}') INTO claims;
    SELECT coalesce(current_setting('request.headers', TRUE), '{}') INTO headers;
    claims := claims || jsonb_build_object('headers', headers);

    -- ******************************** CUSTOM CLAIMS ********************************
    -- Get communities where the user is a member
    SELECT jsonb_agg(community_id) INTO my_community_ids
    FROM c_community_members
    WHERE user_id = ((claims::jsonb) ->> 'sub')::uuid;

    -- Get communities where the user is a manager
    SELECT jsonb_agg(id) INTO my_managing_community_ids
    FROM c_community
    WHERE manager_id = ((claims::jsonb) ->> 'sub')::uuid;

    -- Add the custom claim to the claims JSON
    claims := claims || jsonb_build_object(
        'my_community_ids', COALESCE(my_community_ids, '[]'::jsonb),
        'my_managing_community_ids', COALESCE(my_managing_community_ids, '[]'::jsonb)
    );
    -- *******************************************************************************

    -- Set the claims in the request context
    PERFORM set_config('request.claims'::text, claims::text, FALSE /* is_local */);
    RETURN (my_managing_community_ids::jsonb) ;
END;
$$;


ALTER FUNCTION "public"."db_pre_request_debug"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "firstname" "text",
    "lastname" "text",
    "firstname_kana" "text",
    "lastname_kana" "text",
    "birthday" "date",
    "hide_age" boolean,
    "sns_link1" "text",
    "sns_link2" "text",
    "sns_link3" "text",
    "introduction" "text",
    "avatar_url" "text",
    "profile_bg_url" "text",
    "expo_push_notification_token" "text",
    "email" character varying,
    "last_recommended_date" "date",
    "ignore_app_settings" boolean,
    "is_debug_premium" boolean,
    "stripe_subscription_id" "text",
    "stripe_customer_id" "text",
    "invited_by" "text",
    "revenuecat_app_user_id" "text",
    "job_position" "text",
    "job_join_date" "date",
    "job_left_date" "date",
    "company_name" "text",
    "company_established_year" smallint,
    "company_homepage" "text",
    "salary_range" "text",
    "last_active_datetime" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_recommended_profiles"("current_user_id" "uuid", "recommend_count" integer) RETURNS SETOF "public"."users"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    profileCount integer := 0;
BEGIN
    RETURN QUERY
    SELECT u.*
    FROM users u
    WHERE u.id NOT IN (
        SELECT m.user2
        FROM u_matches m
        WHERE m.user1 = current_user_id
    )
    AND u.id NOT IN (
        SELECT m.user1
        FROM u_matches m
        WHERE  m.user2 = current_user_id
    )
    AND u.id NOT IN (
        SELECT r.recommended_user_id
        FROM u_recommendations r
        WHERE r.user_id = current_user_id
        AND r.created_at = CURRENT_DATE - INTERVAL '1 day'
    )
    AND u.id != current_user_id
    LIMIT recommend_count;

    RETURN;
END;
$$;


ALTER FUNCTION "public"."get_recommended_profiles"("current_user_id" "uuid", "recommend_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."req"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce(current_setting('request.claims', true), '{}')::JSONB
$$;


ALTER FUNCTION "public"."req"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_credentials"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF(NEW.email = ANY(ARRAY['test@fakedomain.com', 'test2@fakedomain.com', 'matart15+1@gmail.com'])) THEN
        NEW.recovery_token := encode(sha224(concat(NEW.email, '123456')::bytea), 'hex');
        NEW.recovery_sent_at := NOW() - INTERVAL '2 minutes';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."test_credentials"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_login"("user_email" "text", "logout_first" boolean DEFAULT true) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    auth_user auth.users;
    test_a uuid;
BEGIN
    -- IF logout_first THEN
    --     PERFORM
    --         test_logout ();
    -- END IF;

    SELECT
        * INTO auth_user
    FROM
        auth.users
    WHERE
        email = user_email;
    EXECUTE format('SET request.jwt.claim.sub=%I', (auth_user).id::text);
    EXECUTE format('SET request.jwt.claim.role=%I', (auth_user).ROLE);
    EXECUTE format('SET request.jwt.claim.email=%I', (auth_user).email);
    -- EXECUTE format('SET request.jwt.claims=%I', json_build_object('app_metadata', (auth_user).raw_app_meta_data)::text);

    RAISE NOTICE '%', format( 'SET ROLE %I; -- Logging in as %L (%L)', (auth_user).ROLE, (auth_user).id, (auth_user).email);
    EXECUTE format('SET ROLE %I', (auth_user).ROLE);

    SELECT  * 
    INTO test_a
    from db_pre_request_debug();
    RETURN test_a;
END;
$$;


ALTER FUNCTION "public"."test_login"("user_email" "text", "logout_first" boolean) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_matches" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user1_id" "uuid" NOT NULL,
    "user2_id" "uuid" NOT NULL,
    "user1_last_seen_at" timestamp with time zone,
    "user2_last_seen_at" timestamp with time zone,
    "user_1_blocked" boolean,
    "user_2_blocked" boolean
);


ALTER TABLE "public"."u_matches" OWNER TO "postgres";


ALTER TABLE "public"."u_matches" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Match_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."m_app_settings" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "value" "json" NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."m_app_settings" OWNER TO "postgres";


ALTER TABLE "public"."m_app_settings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."app_settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."c_community" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "detail" "text",
    "manager_id" "uuid" NOT NULL,
    "join_mode" "public"."COMMUNITY_JOIN_MODE" DEFAULT 'INVITATION_ONLY'::"public"."COMMUNITY_JOIN_MODE" NOT NULL
);


ALTER TABLE "public"."c_community" OWNER TO "postgres";


ALTER TABLE "public"."c_community" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."c_community_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."c_community_members" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "community_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."community_member_status"
);


ALTER TABLE "public"."c_community_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."c_community_posts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "community_id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "image_url" "text",
    "detail_text" "text",
    "detail_html" "text",
    "created_by" "uuid" NOT NULL
);


ALTER TABLE "public"."c_community_posts" OWNER TO "postgres";


ALTER TABLE "public"."c_community_posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."c_community_posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."dep_u_user_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL
);


ALTER TABLE "public"."dep_u_user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."dep_u_user_roles" IS '@deprecated use aut.users.app_metadata.role';



CREATE TABLE IF NOT EXISTS "public"."u_jobs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "position" "text",
    "join_date" "date" NOT NULL,
    "left_date" "date",
    "company_name" "text",
    "company_established_year" smallint,
    "homepage" "text",
    "salary_range" "text"
);


ALTER TABLE "public"."u_jobs" OWNER TO "postgres";


ALTER TABLE "public"."u_jobs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."employmentHistory_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."u_event_categories" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "display_order" smallint
);


ALTER TABLE "public"."u_event_categories" OWNER TO "postgres";


ALTER TABLE "public"."u_event_categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."event_category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."u_events" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "detail" "text" NOT NULL,
    "price" integer,
    "category" bigint NOT NULL,
    "featured" smallint,
    "type" "public"."EVENT_TYPE" NOT NULL,
    "is_free" boolean,
    "end_datetime" timestamp with time zone,
    "entry_start_datetime" timestamp with time zone,
    "entry_end_datetime" timestamp with time zone,
    "sub_category_id" bigint,
    "body_html" "text",
    "place" "text",
    "place_url" "text",
    "address_country" "text",
    "address_prefecture" "text",
    "address_address1" "text",
    "address_address2" "text",
    "use_map" boolean,
    "latitude" real,
    "longitude" real,
    "office_name" "text",
    "has_after_party" boolean,
    "start_datetime" timestamp with time zone,
    "total_capacity" smallint,
    "short_detail" "text",
    "is_published" boolean,
    "community_id" bigint,
    "created_by" "uuid"
);


ALTER TABLE "public"."u_events" OWNER TO "postgres";


ALTER TABLE "public"."u_events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."u_event_reviews" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "star" smallint NOT NULL,
    "comment" "text",
    "title" "text" NOT NULL
);


ALTER TABLE "public"."u_event_reviews" OWNER TO "postgres";


ALTER TABLE "public"."u_event_reviews" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."event_review_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."m_industries" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."m_industries" OWNER TO "postgres";


ALTER TABLE "public"."m_industries" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."m_industry_data_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."m_interests" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."m_interests" OWNER TO "postgres";


ALTER TABLE "public"."m_interests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."m_interest_data_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."m_skills" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."m_skills" OWNER TO "postgres";


ALTER TABLE "public"."m_skills" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."m_skill_data_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."random_users" AS
 SELECT "users"."id",
    "users"."created_at",
    "users"."firstname",
    "users"."lastname",
    "users"."firstname_kana",
    "users"."lastname_kana",
    "users"."birthday",
    "users"."hide_age",
    "users"."sns_link1",
    "users"."sns_link2",
    "users"."sns_link3",
    "users"."introduction",
    "users"."avatar_url",
    "users"."profile_bg_url",
    "users"."expo_push_notification_token",
    "users"."email",
    "users"."last_recommended_date"
   FROM "public"."users"
  ORDER BY ("random"());


ALTER TABLE "public"."random_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_recommendations" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user1_id" "uuid" NOT NULL,
    "user2_id" "uuid" NOT NULL,
    "status" "public"."recommendation_status",
    "last_action_at" "date"
);


ALTER TABLE "public"."u_recommendations" OWNER TO "postgres";


ALTER TABLE "public"."u_recommendations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."recommendation_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."revenue_cat_processed_events" (
    "id" bigint NOT NULL,
    "created_at" timestamp without time zone NOT NULL
);


ALTER TABLE "public"."revenue_cat_processed_events" OWNER TO "postgres";


ALTER TABLE "public"."revenue_cat_processed_events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."revenue_cat_processed_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."s_matches" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "staff_id" "uuid" NOT NULL,
    "user_last_seen_at" timestamp with time zone,
    "staff_last_seen_at" timestamp with time zone,
    "id" bigint NOT NULL
);


ALTER TABLE "public"."s_matches" OWNER TO "postgres";


ALTER TABLE "public"."s_matches" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."s_matches_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."s_messages" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL,
    "image_url" "text",
    "match_id" bigint NOT NULL,
    "sender_id" "uuid" NOT NULL
);


ALTER TABLE "public"."s_messages" OWNER TO "postgres";


ALTER TABLE "public"."s_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."s_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."s_staff_categories" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "image" "text" NOT NULL
);


ALTER TABLE "public"."s_staff_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."s_staff_categories_rel" (
    "staff_category_id" bigint NOT NULL,
    "staff_id" "uuid" NOT NULL
);


ALTER TABLE "public"."s_staff_categories_rel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."s_staff_images" (
    "id" bigint NOT NULL,
    "staff_id" "uuid" NOT NULL,
    "image_url" "text"
);


ALTER TABLE "public"."s_staff_images" OWNER TO "postgres";


ALTER TABLE "public"."s_staff_images" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."s_staff_images_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."s_staffs" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "avatar_url" "text",
    "location" "text",
    "introduction" "text"
);


ALTER TABLE "public"."s_staffs" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."s_staff_with_category" AS
 SELECT "s_staffs"."id",
    "s_staffs"."created_at",
    "s_staffs"."name",
    "s_staffs"."avatar_url",
    "s_staffs"."location",
    "s_staffs"."introduction",
    "s_staff_categories_rel"."staff_category_id" AS "category_id",
    "s_staff_categories"."name" AS "category_name",
    "s_staff_categories"."image" AS "category_image"
   FROM (("public"."s_staffs"
     LEFT JOIN "public"."s_staff_categories_rel" ON (("s_staffs"."id" = "s_staff_categories_rel"."staff_id")))
     LEFT JOIN "public"."s_staff_categories" ON (("s_staff_categories_rel"."staff_category_id" = "s_staff_categories"."id")));


ALTER TABLE "public"."s_staff_with_category" OWNER TO "postgres";


ALTER TABLE "public"."s_staff_categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."staff_category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."u_event_attends" (
    "user_id" "uuid" NOT NULL,
    "event_id" bigint NOT NULL
);


ALTER TABLE "public"."u_event_attends" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_event_tickets" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "price" smallint,
    "capacity" smallint,
    "event_id" bigint NOT NULL
);


ALTER TABLE "public"."u_event_tickets" OWNER TO "postgres";


ALTER TABLE "public"."u_event_tickets" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."u_event_tickets_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."u_job_industries" (
    "job" bigint NOT NULL,
    "industry" bigint NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."u_job_industries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_match_reports" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "match_id" bigint NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "detail" "text" NOT NULL
);


ALTER TABLE "public"."u_match_reports" OWNER TO "postgres";


ALTER TABLE "public"."u_match_reports" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."u_match_reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."u_messages" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "match_id" bigint NOT NULL,
    "image_url" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."u_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_user_industries" (
    "industry_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."u_user_industries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_user_industry_interests" (
    "user" "uuid" NOT NULL,
    "industry" bigint NOT NULL
);


ALTER TABLE "public"."u_user_industry_interests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_user_interests" (
    "user" "uuid" NOT NULL,
    "interest" bigint NOT NULL
);


ALTER TABLE "public"."u_user_interests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_user_reviews" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "star" smallint NOT NULL,
    "title" "text" NOT NULL,
    "detail" "text"
);


ALTER TABLE "public"."u_user_reviews" OWNER TO "postgres";


ALTER TABLE "public"."u_user_reviews" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."u_user_review_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."u_user_skills" (
    "user" "uuid" NOT NULL,
    "skill" bigint NOT NULL
);


ALTER TABLE "public"."u_user_skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_review" (
    "reviewer_id" "uuid" NOT NULL,
    "reviewee_id" "uuid" NOT NULL,
    "response_speed" smallint,
    "credibility" smallint,
    "cooperation" smallint,
    "sincerity" smallint,
    "growth" smallint,
    "comment" "text"
);


ALTER TABLE "public"."user_review" OWNER TO "postgres";


ALTER TABLE "public"."dep_u_user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."u_matches"
    ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_community"
    ADD CONSTRAINT "c_community_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_community_posts"
    ADD CONSTRAINT "c_community_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_community_members"
    ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("community_id", "user_id");



ALTER TABLE ONLY "public"."u_jobs"
    ADD CONSTRAINT "employmentHistory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_event_categories"
    ADD CONSTRAINT "event_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_events"
    ADD CONSTRAINT "event_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_event_reviews"
    ADD CONSTRAINT "event_review_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_app_settings"
    ADD CONSTRAINT "m_app_settings_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."m_industries"
    ADD CONSTRAINT "m_industry_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_interests"
    ADD CONSTRAINT "m_interest_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_skills"
    ADD CONSTRAINT "m_skill_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_matches"
    ADD CONSTRAINT "match_between_users_unique" UNIQUE ("user1_id", "user2_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "profile_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_recommendations"
    ADD CONSTRAINT "recommendation_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."revenue_cat_processed_events"
    ADD CONSTRAINT "revenue_cat_processed_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."s_matches"
    ADD CONSTRAINT "s_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."s_messages"
    ADD CONSTRAINT "s_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."s_staff_categories_rel"
    ADD CONSTRAINT "s_staff_categories_rel_pkey" PRIMARY KEY ("staff_category_id", "staff_id");



ALTER TABLE ONLY "public"."s_staff_images"
    ADD CONSTRAINT "s_staff_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."s_staffs"
    ADD CONSTRAINT "s_staffs_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."s_staffs"
    ADD CONSTRAINT "s_staffs_id_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."s_staff_categories"
    ADD CONSTRAINT "staff_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_event_attends"
    ADD CONSTRAINT "u_event_attends_pkey" PRIMARY KEY ("user_id", "event_id");



ALTER TABLE ONLY "public"."u_event_tickets"
    ADD CONSTRAINT "u_event_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_job_industries"
    ADD CONSTRAINT "u_job_industries_pkey" PRIMARY KEY ("industry", "user_id");



ALTER TABLE ONLY "public"."u_match_reports"
    ADD CONSTRAINT "u_match_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_messages"
    ADD CONSTRAINT "u_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_messages"
    ADD CONSTRAINT "u_messages_unique_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."u_user_interests"
    ADD CONSTRAINT "u_profile_interests_pkey" PRIMARY KEY ("user", "interest");



ALTER TABLE ONLY "public"."u_user_skills"
    ADD CONSTRAINT "u_profile_skills_pkey" PRIMARY KEY ("user", "skill");



ALTER TABLE ONLY "public"."u_user_industries"
    ADD CONSTRAINT "u_user_industries_pkey" PRIMARY KEY ("industry_id", "user_id");



ALTER TABLE ONLY "public"."u_user_industry_interests"
    ADD CONSTRAINT "u_user_industry_interests_pkey" PRIMARY KEY ("user", "industry");



ALTER TABLE ONLY "public"."u_user_reviews"
    ADD CONSTRAINT "u_user_review_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_review"
    ADD CONSTRAINT "user_review_pkey" PRIMARY KEY ("reviewer_id", "reviewee_id");



ALTER TABLE ONLY "public"."dep_u_user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "new_message_notification" AFTER INSERT ON "public"."u_messages" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://brnhszjqdyjuocrwjiyh.supabase.co/functions/v1/pushNotificationTest', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJybmhzempxZHlqdW9jcndqaXloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTIwOTYxMSwiZXhwIjoyMDA0Nzg1NjExfQ.MqTm0-5u9ogt8TZzBRVotayd4ODbH89EeqTwPm19bqA"}', '{}', '1000');



ALTER TABLE ONLY "public"."c_community"
    ADD CONSTRAINT "c_community_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."c_community_posts"
    ADD CONSTRAINT "c_community_posts_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."c_community"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_community_posts"
    ADD CONSTRAINT "c_community_posts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."c_community_members"
    ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."c_community"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."c_community_members"
    ADD CONSTRAINT "community_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dep_u_user_roles"
    ADD CONSTRAINT "dep_u_user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_match_reports"
    ADD CONSTRAINT "public_u_match_reports_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."u_matches"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_match_reports"
    ADD CONSTRAINT "public_u_match_reports_reporter_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_messages"
    ADD CONSTRAINT "public_u_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_industries"
    ADD CONSTRAINT "public_u_user_industries_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "public"."m_industries"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_industries"
    ADD CONSTRAINT "public_u_user_industries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_industry_interests"
    ADD CONSTRAINT "public_u_user_industry_interests_industry_fkey" FOREIGN KEY ("industry") REFERENCES "public"."m_industries"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_industry_interests"
    ADD CONSTRAINT "public_u_user_industry_interests_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."s_matches"
    ADD CONSTRAINT "s_matches_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."s_staffs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."s_matches"
    ADD CONSTRAINT "s_matches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."s_messages"
    ADD CONSTRAINT "s_messages_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."s_matches"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."s_staff_categories_rel"
    ADD CONSTRAINT "s_staff_categories_rel_staff_category_id_fkey" FOREIGN KEY ("staff_category_id") REFERENCES "public"."s_staff_categories"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."s_staff_categories_rel"
    ADD CONSTRAINT "s_staff_categories_rel_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."s_staffs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."s_staff_images"
    ADD CONSTRAINT "s_staff_images_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."s_staffs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."s_staffs"
    ADD CONSTRAINT "s_staffs_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_event_attends"
    ADD CONSTRAINT "u_event_attends_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."u_events"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_event_attends"
    ADD CONSTRAINT "u_event_attends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_event_reviews"
    ADD CONSTRAINT "u_event_reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."u_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_event_reviews"
    ADD CONSTRAINT "u_event_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_event_tickets"
    ADD CONSTRAINT "u_event_tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."u_events"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_events"
    ADD CONSTRAINT "u_events_category_fkey" FOREIGN KEY ("category") REFERENCES "public"."u_event_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_events"
    ADD CONSTRAINT "u_events_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."c_community"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_events"
    ADD CONSTRAINT "u_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."u_events"
    ADD CONSTRAINT "u_events_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "public"."u_event_categories"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."u_job_industries"
    ADD CONSTRAINT "u_job_industries_industry_fkey" FOREIGN KEY ("industry") REFERENCES "public"."m_industries"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_job_industries"
    ADD CONSTRAINT "u_job_industries_job_fkey" FOREIGN KEY ("job") REFERENCES "public"."u_jobs"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_jobs"
    ADD CONSTRAINT "u_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_matches"
    ADD CONSTRAINT "u_matches_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_matches"
    ADD CONSTRAINT "u_matches_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_messages"
    ADD CONSTRAINT "u_messages_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."u_matches"("id");



ALTER TABLE ONLY "public"."u_recommendations"
    ADD CONSTRAINT "u_recommendations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_recommendations"
    ADD CONSTRAINT "u_recommendations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_interests"
    ADD CONSTRAINT "u_user_interests_interest_fkey" FOREIGN KEY ("interest") REFERENCES "public"."m_interests"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_interests"
    ADD CONSTRAINT "u_user_interests_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_reviews"
    ADD CONSTRAINT "u_user_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_reviews"
    ADD CONSTRAINT "u_user_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_skills"
    ADD CONSTRAINT "u_user_skills_skill_fkey" FOREIGN KEY ("skill") REFERENCES "public"."m_skills"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_user_skills"
    ADD CONSTRAINT "u_user_skills_user_fkey" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_review"
    ADD CONSTRAINT "user_review_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_review"
    ADD CONSTRAINT "user_review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable delete for authenticated users only" ON "public"."u_user_industry_interests" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for users based on user_id" ON "public"."u_job_industries" FOR DELETE USING (("auth"."uid"() IN ( SELECT "u_jobs"."user_id"
   FROM "public"."u_jobs"
  WHERE ("u_jobs"."id" = "u_job_industries"."job"))));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."u_user_interests" FOR DELETE USING (("auth"."uid"() = "user"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."u_user_skills" FOR DELETE USING (("auth"."uid"() = "user"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."m_industries" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."u_job_industries" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."u_jobs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."u_user_industry_interests" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."u_user_interests" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."u_user_skills" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_review" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."m_app_settings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."m_interests" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."m_skills" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."s_staff_categories_rel" USING (true) WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."u_job_industries" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."u_messages" USING (true) WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."u_user_industry_interests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."u_user_interests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."u_user_skills" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_review" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable select for authenticated users only" ON "public"."s_staff_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable select for authenticated users only" ON "public"."u_user_industry_interests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable select for authenticated users only" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for users based on id" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "admin: allow all" ON "public"."dep_u_user_roles" TO "authenticated" USING ((("auth"."uid"() = "user_id") AND ("role" = 'admin'::"public"."app_role")));



CREATE POLICY "allow admin all" ON "public"."m_app_settings" TO "authenticated" USING (("auth"."uid"() IN ( SELECT "dep_u_user_roles"."user_id"
   FROM "public"."dep_u_user_roles"
  WHERE ("dep_u_user_roles"."role" = 'admin'::"public"."app_role")))) WITH CHECK (("auth"."uid"() IN ( SELECT "dep_u_user_roles"."user_id"
   FROM "public"."dep_u_user_roles"
  WHERE ("dep_u_user_roles"."role" = 'admin'::"public"."app_role"))));



CREATE POLICY "allow all for admin" ON "public"."s_staff_categories" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "allow all for admin" ON "public"."s_staff_categories_rel" TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")) WITH CHECK (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "allow community manager" ON "public"."c_community_posts" TO "authenticated" USING (("community_id" IN ( SELECT ("jsonb_array_elements_text"(("public"."req"() -> 'my_managing_community_ids'::"text")))::bigint AS "jsonb_array_elements_text")));



CREATE POLICY "allow community members" ON "public"."c_community_posts" FOR SELECT TO "authenticated" USING ((("community_id")::"text" IN ( SELECT "jsonb_array_elements_text"((("current_setting"('request.claims'::"text", true))::"jsonb" -> 'my_community_ids'::"text")) AS "jsonb_array_elements_text")));



CREATE POLICY "allow own data" ON "public"."dep_u_user_roles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "allow own data" ON "public"."u_matches" FOR SELECT USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



CREATE POLICY "auth user" ON "public"."c_community" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."c_community" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."c_community_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "community admin create" ON "public"."c_community" FOR INSERT WITH CHECK (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'community_admin'::"text"));



ALTER TABLE "public"."dep_u_user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."m_app_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."m_industries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."m_interests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."m_skills" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "my community manager" ON "public"."c_community" TO "authenticated" USING (("auth"."uid"() = "manager_id"));



ALTER TABLE "public"."revenue_cat_processed_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."s_staff_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."s_staff_categories_rel" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."u_event_tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."u_job_industries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."u_matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."u_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."u_user_industry_interests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."u_user_interests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."u_user_skills" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update own data" ON "public"."u_matches" FOR UPDATE USING ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id"))) WITH CHECK ((("auth"."uid"() = "user1_id") OR ("auth"."uid"() = "user2_id")));



ALTER TABLE "public"."user_review" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."s_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."u_messages";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
































































































































































































GRANT ALL ON FUNCTION "public"."db_pre_request"() TO "anon";
GRANT ALL ON FUNCTION "public"."db_pre_request"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."db_pre_request"() TO "service_role";
GRANT ALL ON FUNCTION "public"."db_pre_request"() TO "authenticator";



GRANT ALL ON FUNCTION "public"."db_pre_request_debug"() TO "anon";
GRANT ALL ON FUNCTION "public"."db_pre_request_debug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."db_pre_request_debug"() TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recommended_profiles"("current_user_id" "uuid", "recommend_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_recommended_profiles"("current_user_id" "uuid", "recommend_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recommended_profiles"("current_user_id" "uuid", "recommend_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."req"() TO "anon";
GRANT ALL ON FUNCTION "public"."req"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."req"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_credentials"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_credentials"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_credentials"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_login"("user_email" "text", "logout_first" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."test_login"("user_email" "text", "logout_first" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_login"("user_email" "text", "logout_first" boolean) TO "service_role";


















GRANT ALL ON TABLE "public"."u_matches" TO "anon";
GRANT ALL ON TABLE "public"."u_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."u_matches" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Match_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Match_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Match_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_app_settings" TO "anon";
GRANT ALL ON TABLE "public"."m_app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."m_app_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."app_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."app_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."app_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_community" TO "anon";
GRANT ALL ON TABLE "public"."c_community" TO "authenticated";
GRANT ALL ON TABLE "public"."c_community" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_community_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_community_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_community_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_community_members" TO "anon";
GRANT ALL ON TABLE "public"."c_community_members" TO "authenticated";
GRANT ALL ON TABLE "public"."c_community_members" TO "service_role";



GRANT ALL ON TABLE "public"."c_community_posts" TO "anon";
GRANT ALL ON TABLE "public"."c_community_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."c_community_posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_community_posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_community_posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_community_posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."dep_u_user_roles" TO "anon";
GRANT ALL ON TABLE "public"."dep_u_user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."dep_u_user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."u_jobs" TO "anon";
GRANT ALL ON TABLE "public"."u_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."u_jobs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."employmentHistory_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."employmentHistory_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."employmentHistory_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_event_categories" TO "anon";
GRANT ALL ON TABLE "public"."u_event_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."u_event_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."event_category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_category_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_events" TO "anon";
GRANT ALL ON TABLE "public"."u_events" TO "authenticated";
GRANT ALL ON TABLE "public"."u_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."event_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_event_reviews" TO "anon";
GRANT ALL ON TABLE "public"."u_event_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."u_event_reviews" TO "service_role";



GRANT ALL ON SEQUENCE "public"."event_review_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_review_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_review_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_industries" TO "anon";
GRANT ALL ON TABLE "public"."m_industries" TO "authenticated";
GRANT ALL ON TABLE "public"."m_industries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_industry_data_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_industry_data_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_industry_data_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_interests" TO "anon";
GRANT ALL ON TABLE "public"."m_interests" TO "authenticated";
GRANT ALL ON TABLE "public"."m_interests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_interest_data_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_interest_data_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_interest_data_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_skills" TO "anon";
GRANT ALL ON TABLE "public"."m_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."m_skills" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_skill_data_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_skill_data_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_skill_data_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."random_users" TO "anon";
GRANT ALL ON TABLE "public"."random_users" TO "authenticated";
GRANT ALL ON TABLE "public"."random_users" TO "service_role";



GRANT ALL ON TABLE "public"."u_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."u_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."u_recommendations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recommendation_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recommendation_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recommendation_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."revenue_cat_processed_events" TO "anon";
GRANT ALL ON TABLE "public"."revenue_cat_processed_events" TO "authenticated";
GRANT ALL ON TABLE "public"."revenue_cat_processed_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."revenue_cat_processed_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."revenue_cat_processed_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."revenue_cat_processed_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."s_matches" TO "anon";
GRANT ALL ON TABLE "public"."s_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."s_matches" TO "service_role";



GRANT ALL ON SEQUENCE "public"."s_matches_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."s_matches_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."s_matches_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."s_messages" TO "anon";
GRANT ALL ON TABLE "public"."s_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."s_messages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."s_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."s_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."s_messages_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."s_staff_categories" TO "anon";
GRANT ALL ON TABLE "public"."s_staff_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."s_staff_categories" TO "service_role";



GRANT ALL ON TABLE "public"."s_staff_categories_rel" TO "anon";
GRANT ALL ON TABLE "public"."s_staff_categories_rel" TO "authenticated";
GRANT ALL ON TABLE "public"."s_staff_categories_rel" TO "service_role";



GRANT ALL ON TABLE "public"."s_staff_images" TO "anon";
GRANT ALL ON TABLE "public"."s_staff_images" TO "authenticated";
GRANT ALL ON TABLE "public"."s_staff_images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."s_staff_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."s_staff_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."s_staff_images_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."s_staffs" TO "anon";
GRANT ALL ON TABLE "public"."s_staffs" TO "authenticated";
GRANT ALL ON TABLE "public"."s_staffs" TO "service_role";



GRANT ALL ON TABLE "public"."s_staff_with_category" TO "anon";
GRANT ALL ON TABLE "public"."s_staff_with_category" TO "authenticated";
GRANT ALL ON TABLE "public"."s_staff_with_category" TO "service_role";



GRANT ALL ON SEQUENCE "public"."staff_category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."staff_category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."staff_category_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_event_attends" TO "anon";
GRANT ALL ON TABLE "public"."u_event_attends" TO "authenticated";
GRANT ALL ON TABLE "public"."u_event_attends" TO "service_role";



GRANT ALL ON TABLE "public"."u_event_tickets" TO "anon";
GRANT ALL ON TABLE "public"."u_event_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."u_event_tickets" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_event_tickets_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_event_tickets_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_event_tickets_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_job_industries" TO "anon";
GRANT ALL ON TABLE "public"."u_job_industries" TO "authenticated";
GRANT ALL ON TABLE "public"."u_job_industries" TO "service_role";



GRANT ALL ON TABLE "public"."u_match_reports" TO "anon";
GRANT ALL ON TABLE "public"."u_match_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."u_match_reports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_match_reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_match_reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_match_reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_messages" TO "anon";
GRANT ALL ON TABLE "public"."u_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."u_messages" TO "service_role";



GRANT ALL ON TABLE "public"."u_user_industries" TO "anon";
GRANT ALL ON TABLE "public"."u_user_industries" TO "authenticated";
GRANT ALL ON TABLE "public"."u_user_industries" TO "service_role";



GRANT ALL ON TABLE "public"."u_user_industry_interests" TO "anon";
GRANT ALL ON TABLE "public"."u_user_industry_interests" TO "authenticated";
GRANT ALL ON TABLE "public"."u_user_industry_interests" TO "service_role";



GRANT ALL ON TABLE "public"."u_user_interests" TO "anon";
GRANT ALL ON TABLE "public"."u_user_interests" TO "authenticated";
GRANT ALL ON TABLE "public"."u_user_interests" TO "service_role";



GRANT ALL ON TABLE "public"."u_user_reviews" TO "anon";
GRANT ALL ON TABLE "public"."u_user_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."u_user_reviews" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_user_review_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_user_review_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_user_review_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_user_skills" TO "anon";
GRANT ALL ON TABLE "public"."u_user_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."u_user_skills" TO "service_role";



GRANT ALL ON TABLE "public"."user_review" TO "anon";
GRANT ALL ON TABLE "public"."user_review" TO "authenticated";
GRANT ALL ON TABLE "public"."user_review" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
