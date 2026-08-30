\set ON_ERROR_STOP on
\if :{?product_password}
\else
\echo 'product_password psql variable is required'
\quit 1
\endif

SELECT format('CREATE ROLE %I LOGIN', 'product_quote_intake_demo_app')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'product_quote_intake_demo_app')
\gexec

ALTER ROLE "product_quote_intake_demo_app" PASSWORD :'product_password';
CREATE SCHEMA IF NOT EXISTS "product_quote_intake_demo" AUTHORIZATION "product_quote_intake_demo_app";
ALTER SCHEMA "product_quote_intake_demo" OWNER TO "product_quote_intake_demo_app";
ALTER ROLE "product_quote_intake_demo_app" SET search_path TO "product_quote_intake_demo";
GRANT USAGE, CREATE ON SCHEMA "product_quote_intake_demo" TO "product_quote_intake_demo_app";
REVOKE CREATE ON SCHEMA public FROM "product_quote_intake_demo_app";

-- Configure PRODUCT_DATABASE_URL with the isolated role credentials before
-- applying 001_init.sql. The role-level search_path keeps unqualified tables
-- inside this product schema on shared Postgres.
