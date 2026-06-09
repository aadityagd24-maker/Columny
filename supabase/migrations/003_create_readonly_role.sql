-- 1. Create a dedicated read-only role
CREATE ROLE ai_readonly_user WITH LOGIN PASSWORD 'columny-secure-readonly-pass';

-- 2. Grant schema access and SELECT-only on all tables
GRANT USAGE ON SCHEMA public TO ai_readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_readonly_user;

-- 3. Auto-grant on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ai_readonly_user;

-- 4. Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO ai_readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO ai_readonly_user;

-- 5. Set a statement timeout to prevent runaway queries
ALTER ROLE ai_readonly_user SET statement_timeout = '30s';
