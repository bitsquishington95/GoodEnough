const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const franchiseManager = require('./franchiseManagement');

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.key);

// Verify Shopify webhook signature
const verifyWebhook = (req) => {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const body = req.rawBody;
  
  const calculatedHmac = crypto
    .createHmac('sha256', config.shopify.webhookSecret)
    .update(body)
    .digest('base64');
    
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(calculatedHmac)
  );
};

// Extract region from SKU
const getRegionFromSku = (sku) => {
  const regionPrefix = sku.split('-')[0];
  return regionPrefix.toUpperCase();
};

// Update regional sales
const updateRegionalSales = async (region, amount) => {
  try {
    const { data, error } = await supabase
      .from('regional_sales')
      .upsert(
        { 
          region,
          total_sales: amount,
          last_updated: new Date().toISOString()
        },
        { onConflict: 'region' }
      );
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating regional sales:', error);
    throw error;
  }
};

// Update customer loyalty status
const updateLoyaltyStatus = async (customerId, scanCount) => {
  let status = 'Passport Holder';
  
  if (scanCount >= config.loyalty.tiers.cultureKeeper) {
    status = 'Culture Keeper';
  } else if (scanCount >= config.loyalty.tiers.cityRegular) {
    status = 'City Regular';
  }
  
  try {
    const { data, error } = await supabase
      .from('loyalty_status')
      .upsert(
        {
          customer_id: customerId,
          status,
          scan_count: scanCount,
          last_updated: new Date().toISOString()
        },
        { onConflict: 'customer_id' }
      );
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating loyalty status:', error);
    throw error;
  }
};

// Process Shopify order
const processOrder = async (order) => {
  try {
    // Calculate regional commissions
    const commissions = await franchiseManager.calculateCommission(order);
    
    // Record commissions for each region
    for (const [regionCode, amount] of Object.entries(commissions)) {
      if (amount > 0) {
        // Get active licensees for this region
        const { data: licensees, error } = await supabase
          .from('franchise_licenses')
          .select('licensee_id')
          .eq('region_code', regionCode)
          .eq('status', 'active');
          
        if (error) throw error;
        
        // Record commission for each licensee
        for (const licensee of licensees) {
          await supabase
            .from('regional_commissions')
            .insert({
              order_id: order.id,
              licensee_id: licensee.licensee_id,
              region_code: regionCode,
              amount: amount
            });
        }
      }
    }
    
    // Update franchise performance metrics
    if (order.customer) {
      const { data: scanHistory } = await supabase
        .from('scan_history')
        .select('count')
        .eq('customer_id', order.customer.id)
        .single();
        
      const scanCount = scanHistory?.count || 0;
      await franchiseManager.updateLoyaltyStatus(order.customer.id, scanCount);
    }
    
    return { success: true, commissions };
  } catch (error) {
    console.error('Error processing order:', error);
    throw error;
  }
};

// Webhook handler
const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyWebhook(req)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    
    // Process the order
    const result = await processOrder(req.body);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleWebhook,
  processOrder,
  updateRegionalSales,
  updateLoyaltyStatus
}; 