-- GOOD ENOUGH™ - Database Schema for NFC Authentication & Regional Sales Tracking
-- PostgreSQL compatible schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- REGIONS TABLE
CREATE TABLE regions (
    region_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code VARCHAR(50) NOT NULL UNIQUE,
    region_name VARCHAR(255) NOT NULL,
    licensee_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- LICENSEES TABLE
CREATE TABLE licensees (
    licensee_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    license_start DATE NOT NULL,
    license_end DATE NOT NULL,
    markets JSON,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Add foreign key to regions table
ALTER TABLE regions 
ADD CONSTRAINT fk_region_licensee 
FOREIGN KEY (licensee_id) REFERENCES licensees(licensee_id);

-- PRODUCTS TABLE
CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    region_id UUID,
    season VARCHAR(100),
    colorway VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

-- NFC TAGS TABLE
CREATE TABLE nfc_tags (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uuid VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    product_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- REGISTRATIONS TABLE
CREATE TABLE registrations (
    reg_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id UUID NOT NULL,
    customer_id VARCHAR(255),
    customer_email VARCHAR(255),
    purchase_date DATE,
    store_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (tag_id) REFERENCES nfc_tags(tag_id)
);

-- REGIONAL SALES TABLE
CREATE TABLE regional_sales (
    sale_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(255) NOT NULL,
    order_number VARCHAR(100),
    region_id UUID NOT NULL,
    licensee_id UUID NOT NULL,
    sale_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    item_count INTEGER NOT NULL,
    items JSON,
    order_date TIMESTAMP,
    customer_email VARCHAR(255),
    processed_at TIMESTAMP NOT NULL,
    paid_out BOOLEAN DEFAULT FALSE,
    payout_date TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(region_id),
    FOREIGN KEY (licensee_id) REFERENCES licensees(licensee_id)
);

-- TAG SCANS TABLE
CREATE TABLE tag_scans (
    scan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id UUID NOT NULL,
    device_id VARCHAR(255),
    scan_location POINT,
    scan_time TIMESTAMP NOT NULL DEFAULT NOW(),
    scan_result VARCHAR(50) NOT NULL,
    FOREIGN KEY (tag_id) REFERENCES nfc_tags(tag_id)
);

-- Create indexes for performance
CREATE INDEX idx_nfc_tags_uuid ON nfc_tags(uuid);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_region ON products(region_id);
CREATE INDEX idx_regional_sales_licensee ON regional_sales(licensee_id);
CREATE INDEX idx_regional_sales_order ON regional_sales(order_id);
CREATE INDEX idx_tag_scans_tag ON tag_scans(tag_id);

-- Initial regions data
INSERT INTO regions (region_code, region_name) VALUES
('CHI', 'Chicago'),
('DEN', 'Denver'),
('AUS', 'Austin'),
('PDX', 'Portland');

-- Sample product categories for reference
COMMENT ON TABLE products IS 'Product categories: Core, Regional, Premium, Limited';

-- Add permissions (if needed for your environment)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO web_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO admin_user; 