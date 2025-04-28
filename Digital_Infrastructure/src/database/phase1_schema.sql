-- GOOD ENOUGH™ Analytics System - Phase 1 Database Schema
-- Version: 1.0
-- Date: 2024-03-21

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS good_enough;

-- Set search path
SET search_path TO good_enough, public;

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code VARCHAR(8) NOT NULL,
    sku VARCHAR(32) NOT NULL,
    quantity INTEGER NOT NULL,
    sale_amount DECIMAL(10,2) NOT NULL,
    sale_channel VARCHAR(16) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_sale_channel CHECK (sale_channel IN ('online', 'market', 'booth'))
);

-- NFC Scans Table
CREATE TABLE nfc_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(32) NOT NULL,
    scan_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location_code VARCHAR(16) NOT NULL,
    customer_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_location CHECK (location_code ~ '^[A-Z]{2}-[A-Z0-9]{4}$')
);

-- Booth Attendance Table
CREATE TABLE booth_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchisee_id UUID NOT NULL,
    market_location VARCHAR(128) NOT NULL,
    event_date DATE NOT NULL,
    attendance_flag BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Logs Table
CREATE TABLE compliance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchisee_id UUID NOT NULL,
    violation_type VARCHAR(32) NOT NULL,
    violation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'resolved', 'escalated'))
);

-- Create Indexes
CREATE INDEX idx_orders_region ON orders(region_code);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_nfc_scans_sku ON nfc_scans(sku);
CREATE INDEX idx_nfc_scans_timestamp ON nfc_scans(scan_timestamp);
CREATE INDEX idx_booth_attendance_franchisee ON booth_attendance(franchisee_id);
CREATE INDEX idx_booth_attendance_date ON booth_attendance(event_date);
CREATE INDEX idx_compliance_logs_franchisee ON compliance_logs(franchisee_id);
CREATE INDEX idx_compliance_logs_status ON compliance_logs(status);

-- Create Views
CREATE VIEW daily_sales_summary AS
SELECT 
    region_code,
    DATE_TRUNC('day', order_date) AS sale_date,
    COUNT(*) AS total_orders,
    SUM(quantity) AS total_units,
    SUM(sale_amount) AS total_revenue
FROM orders
GROUP BY region_code, DATE_TRUNC('day', order_date);

CREATE VIEW compliance_summary AS
SELECT 
    franchisee_id,
    COUNT(*) AS total_violations,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_violations,
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_violations
FROM compliance_logs
GROUP BY franchisee_id;

-- Create Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booth_attendance_updated_at
    BEFORE UPDATE ON booth_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_logs_updated_at
    BEFORE UPDATE ON compliance_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create Roles
CREATE ROLE good_enough_read;
CREATE ROLE good_enough_write;
CREATE ROLE good_enough_admin;

-- Grant Schema Permissions
GRANT USAGE ON SCHEMA good_enough TO good_enough_read, good_enough_write, good_enough_admin;

-- Grant Table Permissions
GRANT SELECT ON ALL TABLES IN SCHEMA good_enough TO good_enough_read;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA good_enough TO good_enough_write;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA good_enough TO good_enough_admin;

-- Grant View Permissions
GRANT SELECT ON ALL TABLES IN SCHEMA good_enough TO good_enough_read;
GRANT SELECT ON ALL TABLES IN SCHEMA good_enough TO good_enough_write;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA good_enough TO good_enough_admin;

-- Create Sample Data (for testing)
INSERT INTO orders (region_code, sku, quantity, sale_amount, sale_channel, order_date)
VALUES 
    ('NY-NYC', 'GE-TSHIRT-001', 2, 49.98, 'online', NOW()),
    ('CA-LAX', 'GE-HOODIE-001', 1, 89.99, 'market', NOW());

INSERT INTO nfc_scans (sku, scan_timestamp, location_code, customer_id)
VALUES 
    ('GE-TSHIRT-001', NOW(), 'NY-NYC1', uuid_generate_v4()),
    ('GE-HOODIE-001', NOW(), 'CA-LAX1', uuid_generate_v4());

INSERT INTO booth_attendance (franchisee_id, market_location, event_date, attendance_flag)
VALUES 
    (uuid_generate_v4(), 'Union Square Market', CURRENT_DATE, true),
    (uuid_generate_v4(), 'Santa Monica Market', CURRENT_DATE, true);

INSERT INTO compliance_logs (franchisee_id, violation_type, violation_timestamp, status)
VALUES 
    (uuid_generate_v4(), 'booth_setup', NOW(), 'pending'),
    (uuid_generate_v4(), 'attendance', NOW(), 'resolved'); 