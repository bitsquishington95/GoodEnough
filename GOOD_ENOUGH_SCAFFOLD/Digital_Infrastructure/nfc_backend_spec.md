# GOOD ENOUGH™ — NFC Authentication System Specification

⸻

## 1. System Overview

The GOOD ENOUGH NFC Authentication System provides:

1. **Product Verification** - Confirms product authenticity
2. **Regional Attribution** - Links products to specific market regions
3. **Customer Registration** - Allows garment ownership registration
4. **Sales Attribution** - Tracks online sales for licensee commission

⸻

## 2. Database Architecture

### Entity Relationship Diagram

```
+-------------+       +----------------+        +---------------+
| nfc_tags    |       | products       |        | regions       |
+-------------+       +----------------+        +---------------+
| tag_id (PK) |------>| product_id (PK)|------->| region_id (PK)|
| uuid        |       | sku            |        | region_code   |
| status      |       | name           |        | region_name   |
| product_id  |       | product_type   |        | licensee_id   |
| created_at  |       | description    |        | created_at    |
| activated_at|       | price          |        +---------------+
+-------------+       | region_id      |                ^
       |              | season         |                |
       |              | created_at     |                |
       |              +----------------+                |
       |                                                |
       v                                                |
+---------------+                              +----------------+
| registrations |                              | licensees     |
+---------------+                              +----------------+
| reg_id (PK)   |                              | licensee_id (PK)|
| tag_id (FK)   |                              | name           |
| customer_id   |                              | email          |
| purchase_date |                              | status         |
| store_id      |                              | created_at     |
| created_at    |                              | license_start  |
+---------------+                              | license_end    |
                                               +----------------+
```

### Table Schemas

#### nfc_tags

```sql
CREATE TABLE nfc_tags (
    tag_id UUID PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    product_id UUID REFERENCES products(product_id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMP
);
```

#### products

```sql
CREATE TABLE products (
    product_id UUID PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    region_id UUID REFERENCES regions(region_id),
    season VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### regions

```sql
CREATE TABLE regions (
    region_id UUID PRIMARY KEY,
    region_code VARCHAR(50) UNIQUE NOT NULL,
    region_name VARCHAR(255) NOT NULL,
    licensee_id UUID REFERENCES licensees(licensee_id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### licensees

```sql
CREATE TABLE licensees (
    licensee_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    license_start DATE NOT NULL,
    license_end DATE NOT NULL
);
```

#### registrations

```sql
CREATE TABLE registrations (
    reg_id UUID PRIMARY KEY,
    tag_id UUID REFERENCES nfc_tags(tag_id),
    customer_id VARCHAR(255),
    purchase_date DATE,
    store_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

⸻

## 3. API Endpoints

### Authentication Endpoints

#### 1. Scan NFC Tag

```
POST /api/v1/scan
```

**Request Body:**
```json
{
  "tag_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "scan_location": {
    "latitude": 41.8781,
    "longitude": -87.6298
  },
  "device_id": "user-device-id-123"
}
```

**Response (200 OK):**
```json
{
  "authenticated": true,
  "product": {
    "name": "HEAVY TEE",
    "sku": "CHI-HVT-001",
    "product_type": "tee", 
    "colorway": "Lake Effect Grey",
    "region": {
      "code": "CHI",
      "name": "Chicago"
    },
    "registered": false
  },
  "registration_url": "https://goodenough.auth/register/f47ac10b"
}
```

#### 2. Register Product

```
POST /api/v1/register
```

**Request Body:**
```json
{
  "tag_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "customer_email": "customer@example.com",
  "purchase_date": "2025-06-15",
  "purchase_location": "West Loop Market"
}
```

**Response (201 Created):**
```json
{
  "registration_id": "e32f4c8d-1234-5678-90ab-cdef01234567",
  "registered_at": "2025-06-20T15:30:00Z",
  "product": {
    "name": "HEAVY TEE",
    "sku": "CHI-HVT-001"
  }
}
```

### Admin/Management Endpoints

#### 1. Create NFC Tag Batch

```
POST /api/v1/admin/tags/batch
```

**Request Body:**
```json
{
  "product_id": "12345678-90ab-cdef-1234-567890abcdef",
  "quantity": 100
}
```

**Response (201 Created):**
```json
{
  "batch_id": "batch-1234567890",
  "created_tags": 100,
  "product": {
    "product_id": "12345678-90ab-cdef-1234-567890abcdef",
    "sku": "CHI-HVT-001",
    "name": "HEAVY TEE"
  }
}
```

#### 2. Get Regional Sales Report

```
GET /api/v1/admin/regions/{region_code}/sales
```

**Parameters:**
- `start_date` (query, optional): Start date for report
- `end_date` (query, optional): End date for report

**Response (200 OK):**
```json
{
  "region": {
    "code": "CHI",
    "name": "Chicago",
    "licensee": "Jordan Smith"
  },
  "period": {
    "start": "2025-06-01",
    "end": "2025-06-30"
  },
  "sales": {
    "total": 24500.00,
    "online": 8500.00,
    "booth": 16000.00,
    "commission_due": 850.00
  },
  "units": {
    "total": 120,
    "by_product": [
      { "sku": "CHI-HVT-001", "name": "HEAVY TEE", "count": 80 },
      { "sku": "CHI-TOT-001", "name": "TOTE BAG", "count": 40 }
    ]
  }
}
```

⸻

## 4. Shopify Integration

### Order Webhook Handler

The system will listen for Shopify order creation webhooks to:

1. Identify regional products in orders
2. Record sales for commission calculation
3. Generate NFC registration emails

```javascript
// Pseudo-code for Shopify order webhook handler
function handleShopifyOrder(order) {
  // Extract order items
  const lineItems = order.line_items;
  
  // Check for regional products by SKU prefix
  const regionalItems = lineItems.filter(item => {
    const skuPrefix = item.sku.split('-')[0];
    return isValidRegionCode(skuPrefix);
  });
  
  if (regionalItems.length > 0) {
    // Group by region for commission tracking
    const regionSales = groupByRegion(regionalItems);
    
    // Record regional sales for each affected region
    recordRegionalSales(regionSales, order.id);
    
    // Send NFC registration instructions to customer
    sendNfcRegistrationEmail(order.email, regionalItems);
  }
}
```

⸻

## 5. Technical Implementation

### Proposed Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Database | PostgreSQL | Relational data model, transaction support |
| API Layer | Node.js + Express | Fast development, good Shopify integration |
| NFC Reading | Web NFC API | Works on modern mobile browsers without app |
| Hosting | Vercel or Netlify | Serverless, scales with demand |
| Authentication | Auth0 | Supports social login, secure |

### Development Phases

1. **Alpha** (Week 2-3):
   - Core database schema
   - NFC scanning endpoint
   - Basic product validation

2. **Beta** (Week 3-4):
   - Registration flow
   - Admin panel basics
   - Shopify webhook

3. **Launch** (Week 5-6):
   - Region-based commission tracking
   - Full reporting
   - Licensee-specific views

⸻

## 6. Security Considerations

- NFC tags use encrypted UUIDs with checksum
- Customer data stored with encryption-at-rest
- Admin access restricted by role-based permissions
- Activity logging for all authentications
- Commission-related financial data isolated in separate table

⸻

## 7. Privacy Policy Implications

The NFC registration process requires a privacy addendum covering:

1. What data is collected (email, purchase location, timestamp)
2. How the data is used (authentication, commission tracking)
3. Opt-out provisions for registration
4. Data retention policies (tag data kept indefinitely, personal data optional)
5. GDPR/CCPA compliance plan

⸻

## Next Steps

1. Create database initialization scripts
2. Build API prototype with mock data
3. Set up Shopify test store for webhook development
4. Order sample NFC tags for physical testing 