-- GOOD ENOUGH™ Analytics System - Sample Data Generator
-- Version: 1.0
-- Date: 2024-03-21

-- Set search path
SET search_path TO good_enough, public;

-- Clear existing sample data
TRUNCATE TABLE orders, nfc_scans, booth_attendance, compliance_logs;

-- Generate sample franchisee IDs
DO $$
DECLARE
    franchisee_ids UUID[] := ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333'
    ];
    customer_ids UUID[] := ARRAY[
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '66666666-6666-6666-6666-666666666666'
    ];
BEGIN
    -- Insert sample orders (last 30 days)
    FOR i IN 1..100 LOOP
        INSERT INTO orders (
            region_code,
            sku,
            quantity,
            sale_amount,
            sale_channel,
            order_date
        ) VALUES (
            CASE (i % 3)
                WHEN 0 THEN 'NY-NYC'
                WHEN 1 THEN 'CA-LAX'
                ELSE 'TX-AUS'
            END,
            CASE (i % 4)
                WHEN 0 THEN 'GE-TSHIRT-001'
                WHEN 1 THEN 'GE-HOODIE-001'
                WHEN 2 THEN 'GE-CAP-001'
                ELSE 'GE-TOTE-001'
            END,
            (random() * 3 + 1)::integer,
            (random() * 100 + 20)::numeric(10,2),
            CASE (i % 2)
                WHEN 0 THEN 'online'
                ELSE 'market'
            END,
            NOW() - (random() * 30 || ' days')::interval
        );
    END LOOP;

    -- Insert sample NFC scans (last 7 days)
    FOR i IN 1..200 LOOP
        INSERT INTO nfc_scans (
            sku,
            scan_timestamp,
            location_code,
            customer_id
        ) VALUES (
            CASE (i % 4)
                WHEN 0 THEN 'GE-TSHIRT-001'
                WHEN 1 THEN 'GE-HOODIE-001'
                WHEN 2 THEN 'GE-CAP-001'
                ELSE 'GE-TOTE-001'
            END,
            NOW() - (random() * 7 || ' days')::interval,
            CASE (i % 3)
                WHEN 0 THEN 'NY-NYC1'
                WHEN 1 THEN 'CA-LAX1'
                ELSE 'TX-AUS1'
            END,
            customer_ids[(i % 3) + 1]
        );
    END LOOP;

    -- Insert sample booth attendance (last 30 days)
    FOR i IN 1..90 LOOP
        INSERT INTO booth_attendance (
            franchisee_id,
            market_location,
            event_date,
            attendance_flag
        ) VALUES (
            franchisee_ids[(i % 3) + 1],
            CASE (i % 3)
                WHEN 0 THEN 'Union Square Market'
                WHEN 1 THEN 'Santa Monica Market'
                ELSE 'Austin Farmers Market'
            END,
            CURRENT_DATE - (i - 1),
            CASE (i % 10)
                WHEN 0 THEN false
                ELSE true
            END
        );
    END LOOP;

    -- Insert sample compliance logs (last 30 days)
    FOR i IN 1..50 LOOP
        INSERT INTO compliance_logs (
            franchisee_id,
            violation_type,
            violation_timestamp,
            status
        ) VALUES (
            franchisee_ids[(i % 3) + 1],
            CASE (i % 4)
                WHEN 0 THEN 'booth_setup'
                WHEN 1 THEN 'attendance'
                WHEN 2 THEN 'branding'
                ELSE 'reporting'
            END,
            NOW() - (random() * 30 || ' days')::interval,
            CASE (i % 3)
                WHEN 0 THEN 'pending'
                WHEN 1 THEN 'resolved'
                ELSE 'escalated'
            END
        );
    END LOOP;
END $$;

-- Verify data insertion
SELECT 'Orders' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'NFC Scans', COUNT(*) FROM nfc_scans
UNION ALL
SELECT 'Booth Attendance', COUNT(*) FROM booth_attendance
UNION ALL
SELECT 'Compliance Logs', COUNT(*) FROM compliance_logs;

-- Sample analytics queries
SELECT 
    region_code,
    COUNT(*) as total_orders,
    SUM(sale_amount) as total_revenue
FROM orders
GROUP BY region_code
ORDER BY total_revenue DESC;

SELECT 
    sku,
    COUNT(*) as scan_count
FROM nfc_scans
GROUP BY sku
ORDER BY scan_count DESC;

SELECT 
    franchisee_id,
    COUNT(*) as total_violations,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_violations
FROM compliance_logs
GROUP BY franchisee_id
ORDER BY total_violations DESC; 