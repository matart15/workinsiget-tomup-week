CREATE OR REPLACE FUNCTION public.enum_types()
  RETURNS TABLE(
    enum_name text,
    enum_value text)
  LANGUAGE sql
  AS $function$
  SELECT
    t.typname AS enum_name,
    e.enumlabel AS enum_value
  FROM
    pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
  WHERE
    n.nspname = 'public'
  ORDER BY
    t.typname,
    e.enumsortorder;
$function$;

GRANT EXECUTE ON FUNCTION public.enum_types() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_table_details(target_table text)
  RETURNS TABLE(
    table_name text,
    column_name text,
    is_nullable text,
    data_type text,
    udt_name text,
    character_maximum_length integer,
    column_default text,
    is_identity text,
    identity_generation text)
  LANGUAGE sql
  AS $function$
  SELECT
    table_name,
    column_name,
    is_nullable,
    data_type,
    udt_name,
    character_maximum_length,
    column_default,
    is_identity,
    identity_generation
  FROM
    information_schema.columns
  WHERE
    table_name = target_table
    AND table_schema = 'public'
  ORDER BY
    ordinal_position;
$function$;

GRANT EXECUTE ON FUNCTION public.get_table_details(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.list_public_relations()
  RETURNS TABLE(
    table_name text)
  LANGUAGE sql
  AS $function$
  SELECT
    table_name
  FROM
    information_schema.tables
  WHERE
    table_schema = 'public'
    AND table_type IN('BASE TABLE', 'VIEW')
  ORDER BY
    table_name;
$function$;

GRANT EXECUTE ON FUNCTION public.list_public_relations() TO authenticated;

CREATE OR REPLACE FUNCTION public.list_public_tables()
  RETURNS TABLE(
    table_name text)
  LANGUAGE sql
  AS $function$
  SELECT
    table_name
  FROM
    information_schema.tables
  WHERE
    table_schema = 'public'
    AND table_type IN('BASE TABLE', 'VIEW')
  ORDER BY
    table_name;
$function$;

GRANT EXECUTE ON FUNCTION public.list_public_tables() TO authenticated;
