# GOOD ENOUGH™ NFC Backend Specification

## System Overview

The NFC authentication system provides the digital backbone for GOOD ENOUGH™'s regional capsule collections and customer loyalty program. It enables:
- Product authentication
- Regional attribution
- Customer engagement tracking
- Loyalty program integration

## Technical Stack

- **Database**: Supabase (PostgreSQL)
- **API**: REST/GraphQL hybrid
- **Authentication**: JWT + NFC tag verification
- **Integration**: Shopify webhooks

## Database Schema

### Tables

#### 1. nfc_tags
```sql
CREATE TABLE nfc_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id VARCHAR(64) UNIQUE NOT NULL,
    sku_id UUID REFERENCES products(sku_id),
    region_code VARCHAR(8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(16) DEFAULT 'inactive'
);
```

#### 2. products
```sql
CREATE TABLE products (
    sku_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL,
    region_code VARCHAR(8) NOT NULL,
    release_date DATE,
    status VARCHAR(16) DEFAULT 'draft'
);
```

#### 3. customers
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(256) UNIQUE,
    phone VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_scan_at TIMESTAMP WITH TIME ZONE,
    loyalty_tier VARCHAR(16) DEFAULT 'passport_holder'
);
```

#### 4. scans
```sql
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id UUID REFERENCES nfc_tags(id),
    customer_id UUID REFERENCES customers(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8)
);
```

## API Endpoints

### 1. Tag Authentication
```http
POST /api/v1/tags/authenticate
Content-Type: application/json

{
    "tag_id": "string",
    "customer_id": "uuid",
    "location": {
        "lat": number,
        "lng": number
    }
}
```

### 2. Customer Registration
```http
POST /api/v1/customers
Content-Type: application/json

{
    "email": "string",
    "phone": "string"
}
```

### 3. Scan History
```http
GET /api/v1/customers/{id}/scans
```

## Shopify Integration

### Webhook Configuration
```javascript
// Shopify webhook handler
app.post('/webhooks/shopify/order', async (req, res) => {
    const { order } = req.body;
    
    // Extract region code from order
    const regionCode = extractRegionCode(order);
    
    // Update customer loyalty status
    await updateCustomerLoyalty(order.customer.id, regionCode);
    
    res.status(200).send('OK');
});
```

## Security Considerations

1. **Tag Security**
   - Encrypted tag IDs
   - Rate limiting per tag
   - Geographic validation

2. **Data Protection**
   - GDPR compliance
   - CCPA compliance
   - Data retention policies

3. **API Security**
   - JWT authentication
   - Rate limiting
   - IP whitelisting

## Implementation Timeline

### Week 1
- Database setup
- Basic API endpoints
- Tag registration system

### Week 2
- Shopify integration
- Customer management
- Scan tracking

### Week 3
- Security implementation
- Testing framework
- Documentation

## Testing Requirements

1. **Tag Authentication**
   - Valid tag verification
   - Invalid tag handling
   - Duplicate scan prevention

2. **API Endpoints**
   - Response time < 200ms
   - 99.9% uptime
   - Error handling

3. **Integration**
   - Shopify order sync
   - Customer data sync
   - Webhook reliability

## Monitoring & Maintenance

1. **Metrics**
   - Scan success rate
   - API response times
   - Error rates

2. **Alerts**
   - Failed authentications
   - API downtime
   - Database issues

3. **Backups**
   - Daily database backups
   - Tag registry backups
   - Customer data backups 