-- Franchise Licenses Table
CREATE TABLE franchise_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licensee_id UUID NOT NULL,
    region_code VARCHAR(8) NOT NULL,
    markets JSONB NOT NULL, -- Array of market locations
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(16) DEFAULT 'active',
    license_fee DECIMAL(10,2) NOT NULL,
    performance_metrics JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Franchise Performance Table
CREATE TABLE franchise_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licensee_id UUID NOT NULL REFERENCES franchise_licenses(licensee_id),
    year INTEGER NOT NULL,
    total_sales DECIMAL(10,2) DEFAULT 0,
    market_days INTEGER DEFAULT 0,
    online_commissions DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(licensee_id, year)
);

-- Regional Commissions Table
CREATE TABLE regional_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(64) NOT NULL,
    licensee_id UUID NOT NULL REFERENCES franchise_licenses(licensee_id),
    region_code VARCHAR(8) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(16) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Days Table
CREATE TABLE market_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licensee_id UUID NOT NULL REFERENCES franchise_licenses(licensee_id),
    date DATE NOT NULL,
    location VARCHAR(256) NOT NULL,
    sales DECIMAL(10,2) NOT NULL,
    attendance INTEGER,
    photos JSONB,
    notes TEXT,
    status VARCHAR(32) DEFAULT 'pending_review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booth Compliance Table
CREATE TABLE booth_compliance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licensee_id UUID NOT NULL REFERENCES franchise_licenses(licensee_id),
    photos JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) DEFAULT 'pending_review',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Materials Table
CREATE TABLE marketing_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code VARCHAR(8) NOT NULL,
    type VARCHAR(32) NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    file_url VARCHAR(512) NOT NULL,
    version VARCHAR(16) NOT NULL,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Regional Capsules Table
CREATE TABLE regional_capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licensee_id UUID NOT NULL REFERENCES franchise_licenses(licensee_id),
    region_code VARCHAR(8) NOT NULL,
    design_data JSONB NOT NULL,
    status VARCHAR(32) DEFAULT 'pending_approval',
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Warnings Table
CREATE TABLE compliance_warnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licensee_id UUID NOT NULL REFERENCES franchise_licenses(licensee_id),
    warning_type VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Compliance Checks Table
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licensee_id UUID NOT NULL REFERENCES franchise_licenses(licensee_id),
    check_type VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL,
    details JSONB,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_by UUID,
    notes TEXT
);

-- Local Artists Table
CREATE TABLE local_artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    region_code VARCHAR(8) NOT NULL,
    contact_email VARCHAR(256) NOT NULL,
    portfolio_url VARCHAR(512),
    status VARCHAR(16) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Artist Designs Table
CREATE TABLE artist_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES local_artists(id),
    title VARCHAR(128) NOT NULL,
    description TEXT,
    files JSONB NOT NULL,
    status VARCHAR(32) DEFAULT 'pending_review',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Local Events Table
CREATE TABLE local_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code VARCHAR(8) NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(256) NOT NULL,
    organizer_id UUID NOT NULL,
    status VARCHAR(16) DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Subscribers Table
CREATE TABLE community_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(256) NOT NULL,
    region_code VARCHAR(8) NOT NULL,
    status VARCHAR(16) DEFAULT 'active',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- ETL Sync History
CREATE TABLE IF NOT EXISTS sync_history (
    source VARCHAR(50) PRIMARY KEY,
    last_sync TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE TRIGGER set_sync_history_updated_at
    BEFORE UPDATE ON sync_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initial sync history records
INSERT INTO sync_history (source, last_sync, status)
VALUES 
    ('shopify_orders', CURRENT_TIMESTAMP - INTERVAL '1 day', 'success'),
    ('nfc_scans', CURRENT_TIMESTAMP - INTERVAL '1 day', 'success'),
    ('booth_attendance', CURRENT_TIMESTAMP - INTERVAL '1 day', 'success'),
    ('compliance_logs', CURRENT_TIMESTAMP - INTERVAL '1 day', 'success')
ON CONFLICT (source) DO NOTHING;

-- Create indexes
CREATE INDEX idx_franchise_licenses_region ON franchise_licenses(region_code);
CREATE INDEX idx_franchise_performance_licensee ON franchise_performance(licensee_id);
CREATE INDEX idx_regional_commissions_licensee ON regional_commissions(licensee_id);
CREATE INDEX idx_regional_commissions_order ON regional_commissions(order_id);
CREATE INDEX idx_market_days_licensee ON market_days(licensee_id);
CREATE INDEX idx_booth_compliance_licensee ON booth_compliance(licensee_id);
CREATE INDEX idx_marketing_materials_region ON marketing_materials(region_code);
CREATE INDEX idx_regional_capsules_licensee ON regional_capsules(licensee_id);
CREATE INDEX idx_regional_capsules_region ON regional_capsules(region_code);
CREATE INDEX idx_compliance_warnings_licensee ON compliance_warnings(licensee_id);
CREATE INDEX idx_compliance_warnings_status ON compliance_warnings(status);
CREATE INDEX idx_compliance_checks_licensee ON compliance_checks(licensee_id);
CREATE INDEX idx_compliance_checks_type ON compliance_checks(check_type);
CREATE INDEX idx_local_artists_region ON local_artists(region_code);
CREATE INDEX idx_artist_designs_artist ON artist_designs(artist_id);
CREATE INDEX idx_local_events_region ON local_events(region_code);
CREATE INDEX idx_community_subscribers_region ON community_subscribers(region_code); 