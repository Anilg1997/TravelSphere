-- =============================================================================
-- TravelSphere Platform — Database Schema Initialization
-- =============================================================================
-- This script runs when the PostgreSQL container starts for the first time.
-- Each microservice uses its own schema for isolation.
-- Flyway will handle table creation within each schema.

-- Create all schemas
CREATE SCHEMA IF NOT EXISTS auth_schema;
CREATE SCHEMA IF NOT EXISTS user_schema;
CREATE SCHEMA IF NOT EXISTS flight_schema;
CREATE SCHEMA IF NOT EXISTS hotel_schema;
CREATE SCHEMA IF NOT EXISTS transport_schema;
CREATE SCHEMA IF NOT EXISTS car_schema;
CREATE SCHEMA IF NOT EXISTS insurance_schema;
CREATE SCHEMA IF NOT EXISTS package_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;
CREATE SCHEMA IF NOT EXISTS document_schema;
CREATE SCHEMA IF NOT EXISTS search_schema;
CREATE SCHEMA IF NOT EXISTS ai_schema;
CREATE SCHEMA IF NOT EXISTS admin_schema;
CREATE SCHEMA IF NOT EXISTS food_schema;
CREATE SCHEMA IF NOT EXISTS webhook_schema;

-- Grant permissions (Flyway needs to create tables in these schemas)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO travelsphere;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA user_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA flight_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA hotel_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA transport_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA car_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA insurance_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA package_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA payment_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA notification_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA document_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA search_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA ai_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA admin_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA food_schema GRANT ALL ON TABLES TO travelsphere;
ALTER DEFAULT PRIVILEGES IN SCHEMA webhook_schema GRANT ALL ON TABLES TO travelsphere;

-- Ensure the user has CREATE privilege on each schema
GRANT CREATE ON SCHEMA auth_schema TO travelsphere;
GRANT CREATE ON SCHEMA user_schema TO travelsphere;
GRANT CREATE ON SCHEMA flight_schema TO travelsphere;
GRANT CREATE ON SCHEMA hotel_schema TO travelsphere;
GRANT CREATE ON SCHEMA transport_schema TO travelsphere;
GRANT CREATE ON SCHEMA car_schema TO travelsphere;
GRANT CREATE ON SCHEMA insurance_schema TO travelsphere;
GRANT CREATE ON SCHEMA package_schema TO travelsphere;
GRANT CREATE ON SCHEMA payment_schema TO travelsphere;
GRANT CREATE ON SCHEMA notification_schema TO travelsphere;
GRANT CREATE ON SCHEMA document_schema TO travelsphere;
GRANT CREATE ON SCHEMA search_schema TO travelsphere;
GRANT CREATE ON SCHEMA ai_schema TO travelsphere;
GRANT CREATE ON SCHEMA admin_schema TO travelsphere;
GRANT CREATE ON SCHEMA food_schema TO travelsphere;
GRANT CREATE ON SCHEMA webhook_schema TO travelsphere;
