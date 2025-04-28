# GOOD ENOUGH™ Digital Infrastructure

This repository contains the digital infrastructure for the GOOD ENOUGH™ Market Booth 2.0, including Shopify integration, NFC passport system, and regional sales tracking.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Shopify Configuration
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
```

3. Set up your Supabase database with the following tables:
- `regional_sales`
- `customer_loyalty`
- `nfc_scans`

4. Configure Shopify webhooks to point to your webhook endpoint.

## Features

- Shopify order processing and webhook handling
- Regional sales tracking
- Customer loyalty status management
- NFC passport system integration

## File Structure

- `src/shopifyIntegration.js`: Main Shopify integration logic
- `config.js`: Configuration and environment variables
- `src/database/`: Database schema and migrations
- `src/nfc/`: NFC passport system implementation

## Development

To start the development server:
```bash
npm run dev
```

## Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

Proprietary - All rights reserved 