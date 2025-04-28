require('dotenv').config();

module.exports = {
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  },
  shopify: {
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET
  },
  loyalty: {
    tiers: {
      passportHolder: 0,
      cityRegular: 5,
      cultureKeeper: 15
    }
  },
  regions: {
    validPrefixes: ['NYC', 'LA', 'CHI', 'MIA', 'ATL', 'SEA', 'DEN', 'AUS']
  }
}; 