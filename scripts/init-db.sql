-- Initial database setup for VT-LineAds

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE tenant_plan AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE rich_menu_size AS ENUM ('full', 'half');

-- Set timezone
SET timezone = 'Asia/Tokyo';

-- Create initial schema comment
COMMENT ON DATABASE vt_lineads IS 'VT-LineAds SaaS Platform Database';

-- Grant permissions (for production, adjust as needed)
-- GRANT CONNECT ON DATABASE vt_lineads TO app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT CREATE ON SCHEMA public TO app_user;