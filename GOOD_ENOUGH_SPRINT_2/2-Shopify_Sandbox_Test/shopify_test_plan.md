# Shopify Sandbox Testing Plan

## Overview
This document outlines the plan for testing the Shopify integration with the GOOD ENOUGH regional SKU tagging system in a sandbox environment. The goal is to validate that orders correctly capture regional information and trigger the appropriate webhooks for NFC tag registration.

## Test Environment Setup

### 1. Shopify Development Store
- Create a Shopify development store (no credit card required)
- Install necessary apps:
  - Webhook connector
  - Product tagging app
  - Order attribution app

### 2. Test Product Setup
- Create product entries for each regional capsule
- Configure proper SKU naming convention: [REGION]-[PRODUCT]-[COLOR]-[SIZE]
- Set up product variants with:
  - Regional identifiers
  - Size/color options
  - NFC tracking flags

### 3. Integration Components
- Set up webhook endpoints (localhost or staging)
- Configure order processing workflow
- Prepare NFC registration simulation

## Test Scenarios

### Scenario 1: Basic Order Flow
1. Add a Chicago Heavy Tee (Black, Large) to cart
2. Complete checkout process
3. ✓ Verify order contains correct regional tag
4. ✓ Verify webhook receives proper SKU information

### Scenario 2: Multi-Region Order
1. Add products from different regions to cart
2. Complete checkout process
3. ✓ Verify order correctly identifies multiple regions
4. ✓ Verify webhook triggers separate entries for each regional product

### Scenario 3: NFC Registration Process
1. Process a test order
2. ✓ Verify NFC registration webhook is triggered
3. ✓ Verify NFC database receives correct product information
4. ✓ Confirm SKU-to-NFC mapping is created

### Scenario 4: Order Attribution
1. Simulate order from specific marketing channel
2. ✓ Verify regional attribution is maintained
3. ✓ Verify analytics correctly track region + marketing source

### Scenario 5: Inventory Updates
1. Process multiple orders for same regional SKU
2. ✓ Verify inventory decrements correctly
3. ✓ Verify regional inventory constraints are maintained

## Webhook Testing

### Endpoint Configuration
```
POST https://api.goodenough.dev/webhook/orders
Content-Type: application/json
X-Shopify-Hmac-SHA256: {hmac}
```

### Expected Payload Structure
```json
{
  "order_id": "12345",
  "order_number": "GE1001",
  "items": [
    {
      "sku": "CHI-HTee-BLK-L",
      "quantity": 1,
      "price": 85.00,
      "requires_nfc": true,
      "region": "Chicago",
      "product_id": "prod_123456"
    }
  ],
  "customer": {
    "email": "test@example.com",
    "shipping_address": {
      "city": "Chicago",
      "state": "IL",
      "country": "US"
    }
  },
  "attribution": {
    "source": "instagram",
    "campaign": "summer_launch"
  }
}
```

## NFC Registration Simulation

For each order containing items with `requires_nfc: true`:

1. Generate unique NFC IDs for each item
2. Create database entries linking:
   - Product SKU
   - NFC tag ID
   - Order information
   - Regional capsule data
3. Test validation API with simulated NFC scan

## Success Criteria
- All test scenarios pass without errors
- Webhooks correctly transmit order information
- Regional SKUs are properly identified
- NFC registration process functions correctly
- Order attribution data is preserved

## Testing Schedule
- Setup: Day 1
- Scenario Testing: Days 2-3
- Integration Testing: Day 4
- Bug Fixes: Day 5

## Responsible Team Members
- Tech Lead: Webhook and API testing
- Ops Team: Shopify configuration
- Brand Team: Product setup and regional validation 