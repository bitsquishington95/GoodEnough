/**
 * GOOD ENOUGH™ - Shopify Region Attribution Webhook Handler
 * 
 * This script processes Shopify orders to identify regional products and track
 * online sales for commission calculations for market licensees.
 * 
 * Implementation: Deploy as a Shopify Function or AWS Lambda function
 * triggered by Shopify webhook events.
 */

const REGION_CODES = {
  'CHI': { name: 'Chicago', licensee_id: 'l-chi-001' },
  'DEN': { name: 'Denver', licensee_id: 'l-den-001' },
  'AUS': { name: 'Austin', licensee_id: 'l-aus-001' },
  'PDX': { name: 'Portland', licensee_id: 'l-pdx-001' }
};

/**
 * Handles Shopify order creation webhook
 * 
 * @param {Object} order - The Shopify order object
 * @returns {Object} - Processing result with attribution data
 */
async function handleShopifyOrder(order) {
  try {
    console.log(`Processing order #${order.name}`);
    
    // Extract line items from the order
    const lineItems = order.line_items || [];
    
    // Filter items that are regional products
    const regionalItems = lineItems.filter(item => {
      // Check if SKU exists
      if (!item.sku) return false;
      
      // Extract region code from SKU (format: REGION-TYPE-ID)
      const skuParts = item.sku.split('-');
      if (skuParts.length < 2) return false;
      
      const regionCode = skuParts[0].toUpperCase();
      return Object.keys(REGION_CODES).includes(regionCode);
    });
    
    // If no regional items found, exit early
    if (regionalItems.length === 0) {
      console.log('No regional items found in order');
      return { 
        order_id: order.id,
        attributed: false,
        message: 'No regional items in order'
      };
    }
    
    // Group items by region for attribution
    const regionSales = groupItemsByRegion(regionalItems);
    
    // Record regional sales for commission tracking
    await recordRegionalSales(regionSales, order);
    
    // Send NFC registration instructions if needed
    await sendNfcRegistrationEmail(order.email, regionalItems, order.id);
    
    return {
      order_id: order.id,
      attributed: true,
      regions_found: Object.keys(regionSales),
      items_attributed: regionalItems.length
    };
    
  } catch (error) {
    console.error(`Error processing order: ${error.message}`);
    return {
      order_id: order.id || 'unknown',
      attributed: false,
      error: error.message
    };
  }
}

/**
 * Groups line items by region code
 * 
 * @param {Array} items - Array of order line items
 * @returns {Object} - Object with region codes as keys and sales data as values
 */
function groupItemsByRegion(items) {
  const regions = {};
  
  items.forEach(item => {
    const regionCode = item.sku.split('-')[0].toUpperCase();
    
    if (!regions[regionCode]) {
      regions[regionCode] = {
        items: [],
        total: 0,
        quantity: 0
      };
    }
    
    // Track the item details
    regions[regionCode].items.push({
      sku: item.sku,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    });
    
    // Update region totals
    regions[regionCode].total += parseFloat(item.price) * item.quantity;
    regions[regionCode].quantity += item.quantity;
  });
  
  return regions;
}

/**
 * Records regional sales for commission tracking
 * 
 * @param {Object} regionSales - Object with region codes and sales data
 * @param {Object} order - The full Shopify order
 * @returns {Promise} - Result of database operations
 */
async function recordRegionalSales(regionSales, order) {
  const recordPromises = [];
  
  // For each region, create a sales record
  for (const [regionCode, salesData] of Object.entries(regionSales)) {
    if (!REGION_CODES[regionCode]) continue;
    
    const licenseeId = REGION_CODES[regionCode].licensee_id;
    const commission = calculateCommission(salesData.total);
    
    // Create record in database
    const recordPromise = saveRegionalSaleRecord({
      order_id: order.id,
      order_number: order.name,
      order_date: order.created_at,
      region_code: regionCode,
      region_name: REGION_CODES[regionCode].name,
      licensee_id: licenseeId,
      sale_amount: salesData.total,
      commission_amount: commission,
      item_count: salesData.quantity,
      items: salesData.items,
      customer_email: order.email,
      processed_at: new Date().toISOString()
    });
    
    recordPromises.push(recordPromise);
  }
  
  return Promise.all(recordPromises);
}

/**
 * Calculates commission amount (10% of sales)
 * 
 * @param {number} saleAmount - The total sale amount
 * @returns {number} - Commission amount
 */
function calculateCommission(saleAmount) {
  // 10% commission rate for online sales of regional products
  return parseFloat(saleAmount) * 0.1;
}

/**
 * Saves a regional sale record to the database
 * 
 * @param {Object} saleRecord - The sale record data
 * @returns {Promise} - Result of database operation
 */
async function saveRegionalSaleRecord(saleRecord) {
  // This would connect to your database - implementation depends on your backend
  // Example using a simple REST API call:
  try {
    console.log(`Recording sale for ${saleRecord.region_name}: $${saleRecord.sale_amount}`);
    
    // IMPLEMENTATION REQUIRED:
    // Make API call to your backend to save the record
    // const response = await fetch('https://api.goodenough.com/regional-sales', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(saleRecord)
    // });
    
    // For now, just log and return success
    return {
      success: true,
      sale_id: `sale-${Date.now()}`,
      licensee_id: saleRecord.licensee_id,
      commission: saleRecord.commission_amount
    };
  } catch (error) {
    console.error(`Failed to record sale: ${error.message}`);
    throw error;
  }
}

/**
 * Sends NFC registration instructions to customer
 * 
 * @param {string} customerEmail - Customer's email address
 * @param {Array} regionalItems - Array of regional items purchased
 * @param {string} orderId - The Shopify order ID
 * @returns {Promise} - Result of email sending
 */
async function sendNfcRegistrationEmail(customerEmail, regionalItems, orderId) {
  try {
    console.log(`Sending NFC registration email to ${customerEmail}`);
    
    // Prepare item details for email
    const itemDetails = regionalItems.map(item => ({
      name: item.name,
      sku: item.sku,
      region: REGION_CODES[item.sku.split('-')[0].toUpperCase()].name
    }));
    
    // IMPLEMENTATION REQUIRED:
    // Connect to your email service provider
    // const emailSent = await sendEmail({
    //   to: customerEmail,
    //   subject: 'Register Your GOOD ENOUGH Regional Products',
    //   template: 'nfc-registration',
    //   templateData: {
    //     order_id: orderId,
    //     items: itemDetails,
    //     registration_url: `https://goodenough.com/register?order=${orderId}`
    //   }
    // });
    
    // For now, just log and return success
    return {
      success: true,
      email: customerEmail,
      sent_at: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
    // Don't throw - we don't want to fail the whole process if email fails
    return {
      success: false,
      error: error.message
    };
  }
}

// Export the handler for use in serverless function
module.exports = {
  handleShopifyOrder
};

/**
 * Example webhook handler for AWS Lambda or similar
 */
exports.handler = async (event, context) => {
  try {
    // Parse the incoming webhook body
    const webhookBody = JSON.parse(event.body);
    
    // Process the order
    const result = await handleShopifyOrder(webhookBody);
    
    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error(`Webhook handler error: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process webhook' })
    };
  }
};

/**
 * Example implementation for Shopify Functions
 */
// For Shopify Functions, uncomment and adapt:
// export function orderCreated(order) {
//   return handleShopifyOrder(order);
// } 