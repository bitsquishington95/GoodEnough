/**
 * GOOD ENOUGH Shopify Webhook Handler
 * 
 * This script handles incoming webhooks from Shopify for order processing
 * and NFC tag registration in the sandbox environment.
 */

const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// MongoDB connection (would be in environment variables in production)
mongoose.connect('mongodb://localhost:27017/goodenough_sandbox', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define MongoDB schemas
const NFCTagSchema = new mongoose.Schema({
  tagId: { type: String, required: true, unique: true },
  sku: { type: String, required: true },
  productId: { type: String, required: true },
  region: { type: String, required: true },
  orderId: { type: String, required: true },
  orderNumber: { type: String, required: true },
  registered: { type: Boolean, default: false },
  registrationDate: { type: Date },
  authenticated: { type: Boolean, default: false },
  authenticationCount: { type: Number, default: 0 },
  lastAuthenticated: { type: Date }
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true },
  customer: {
    email: { type: String, required: true },
    shippingAddress: {
      city: String,
      state: String,
      country: String
    }
  },
  items: [{
    sku: String,
    quantity: Number,
    price: Number,
    requiresNfc: Boolean,
    region: String,
    productId: String,
    nfcTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NFCTag' }]
  }],
  attribution: {
    source: String,
    campaign: String
  },
  created: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false }
});

const NFCTag = mongoose.model('NFCTag', NFCTagSchema);
const Order = mongoose.model('Order', OrderSchema);

// Verify Shopify webhook hmac
const verifyShopifyWebhook = (req, res, next) => {
  const hmac = req.get('X-Shopify-Hmac-SHA256');
  const body = req.body;
  
  // Your Shopify webhook secret (would be in environment variables)
  const secret = 'your_shopify_webhook_secret';
  
  const calculatedHmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body), 'utf8')
    .digest('base64');
  
  if (hmac === calculatedHmac) {
    next();
  } else {
    res.status(401).send('HMAC validation failed');
  }
};

// Endpoint to receive Shopify order webhooks
app.post('/webhook/orders', verifyShopifyWebhook, async (req, res) => {
  try {
    const orderData = req.body;
    
    // Create new order in database
    const order = new Order({
      orderId: orderData.order_id,
      orderNumber: orderData.order_number,
      customer: orderData.customer,
      items: orderData.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        requiresNfc: item.requires_nfc,
        region: item.region,
        productId: item.product_id,
        nfcTags: []
      })),
      attribution: orderData.attribution
    });
    
    await order.save();
    
    // For items requiring NFC, generate NFC tags
    for (const item of order.items) {
      if (item.requiresNfc) {
        for (let i = 0; i < item.quantity; i++) {
          // Generate a unique NFC tag ID
          // In production, this would correspond to physical NFC tags
          const tagId = `NFC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
          
          // Create NFC tag in database
          const nfcTag = new NFCTag({
            tagId,
            sku: item.sku,
            productId: item.productId,
            region: item.region,
            orderId: order.orderId,
            orderNumber: order.orderNumber
          });
          
          await nfcTag.save();
          
          // Add NFC tag reference to order item
          item.nfcTags.push(nfcTag._id);
        }
      }
    }
    
    // Save updated order with NFC tags
    order.processed = true;
    await order.save();
    
    console.log(`Processed order ${order.orderNumber} with ${order.items.reduce((acc, item) => acc + item.nfcTags.length, 0)} NFC tags`);
    
    res.status(200).send('Order processed successfully');
  } catch (error) {
    console.error('Error processing order webhook:', error);
    res.status(500).send('Error processing order');
  }
});

// Endpoint to validate NFC tag
app.get('/api/validate-nfc/:tagId', async (req, res) => {
  try {
    const { tagId } = req.params;
    
    const nfcTag = await NFCTag.findOne({ tagId });
    
    if (!nfcTag) {
      return res.status(404).json({ 
        authenticated: false, 
        message: 'NFC tag not found in database' 
      });
    }
    
    // Update authentication stats
    nfcTag.authenticated = true;
    nfcTag.authenticationCount += 1;
    nfcTag.lastAuthenticated = new Date();
    await nfcTag.save();
    
    // Get product details (in production, this would come from Shopify API)
    const productDetails = {
      // Mocked data for testing
      name: 'GOOD ENOUGH Heavy Tee',
      color: nfcTag.sku.split('-')[2],
      size: nfcTag.sku.split('-')[3],
      region: nfcTag.region,
      authenticated: true,
      productionDate: '2025-07-15',
      capsuleId: `${nfcTag.region.toLowerCase()}-summer-2025`,
      imageUrl: '/assets/images/heavy-tee-black.jpg'
    };
    
    return res.status(200).json({
      authenticated: true,
      tagId: nfcTag.tagId,
      sku: nfcTag.sku,
      product: productDetails
    });
  } catch (error) {
    console.error('Error validating NFC tag:', error);
    res.status(500).json({ 
      authenticated: false, 
      message: 'Error validating NFC tag' 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook handler running on port ${PORT}`);
});

module.exports = app; 