// GOOD ENOUGH™ Configuration
// Copy this file to config.js and update with your values

module.exports = {
    // Supabase Configuration
    supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY
    },

    // Shopify Configuration
    shopify: {
        webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
        storeUrl: process.env.SHOPIFY_STORE_URL,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN
    },

    // Application Configuration
    app: {
        env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000
    },

    // Security
    security: {
        jwtSecret: process.env.JWT_SECRET,
        encryptionKey: process.env.ENCRYPTION_KEY
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'app.log'
    },

    // Loyalty Program
    loyalty: {
        tiers: {
            culture_keeper: { minScans: 10 },
            city_regular: { minScans: 3 },
            passport_holder: { minScans: 0 }
        }
    }
}; 