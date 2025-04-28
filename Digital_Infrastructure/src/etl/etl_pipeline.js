// GOOD ENOUGH™ Analytics System - ETL Pipeline
// Version: 1.0
// Date: 2024-03-21

const { createClient } = require('@supabase/supabase-js');
const Shopify = require('shopify-api-node');
const config = require('../config');

// Initialize clients
const supabase = createClient(config.supabase.url, config.supabase.key);
const shopify = new Shopify({
    shopName: config.shopify.shopName,
    accessToken: config.shopify.accessToken
});

class ETLPipeline {
    constructor() {
        this.lastRun = null;
        this.errorCount = 0;
        this.maxRetries = 3;
    }

    // Main ETL process
    async run() {
        try {
            console.log('Starting ETL process...');
            this.lastRun = new Date();

            // Run all ETL processes
            await Promise.all([
                this.syncShopifyOrders(),
                this.syncNFCScans(),
                this.syncBoothAttendance(),
                this.syncComplianceLogs()
            ]);

            console.log('ETL process completed successfully');
            this.errorCount = 0;
        } catch (error) {
            console.error('ETL process failed:', error);
            this.errorCount++;
            
            if (this.errorCount >= this.maxRetries) {
                // Alert system admin
                await this.sendAlert('ETL Pipeline Critical Error', error.message);
            }
        }
    }

    // Shopify Orders Sync
    async syncShopifyOrders() {
        try {
            console.log('Syncing Shopify orders...');
            
            // Get orders from last sync or last 24 hours
            const lastSync = await this.getLastSyncTime('shopify_orders');
            const orders = await shopify.order.list({
                created_at_min: lastSync,
                status: 'any',
                limit: 250
            });

            // Transform and load orders
            for (const order of orders) {
                await this.transformAndLoadOrder(order);
            }

            await this.updateLastSyncTime('shopify_orders');
            console.log(`Synced ${orders.length} Shopify orders`);
        } catch (error) {
            console.error('Shopify sync failed:', error);
            throw error;
        }
    }

    // NFC Scans Sync
    async syncNFCScans() {
        try {
            console.log('Syncing NFC scans...');
            
            // Get scans from NFC system
            const lastSync = await this.getLastSyncTime('nfc_scans');
            const scans = await this.fetchNFCScans(lastSync);

            // Transform and load scans
            for (const scan of scans) {
                await this.transformAndLoadScan(scan);
            }

            await this.updateLastSyncTime('nfc_scans');
            console.log(`Synced ${scans.length} NFC scans`);
        } catch (error) {
            console.error('NFC sync failed:', error);
            throw error;
        }
    }

    // Booth Attendance Sync
    async syncBoothAttendance() {
        try {
            console.log('Syncing booth attendance...');
            
            // Get attendance records
            const lastSync = await this.getLastSyncTime('booth_attendance');
            const attendance = await this.fetchBoothAttendance(lastSync);

            // Transform and load attendance
            for (const record of attendance) {
                await this.transformAndLoadAttendance(record);
            }

            await this.updateLastSyncTime('booth_attendance');
            console.log(`Synced ${attendance.length} attendance records`);
        } catch (error) {
            console.error('Attendance sync failed:', error);
            throw error;
        }
    }

    // Compliance Logs Sync
    async syncComplianceLogs() {
        try {
            console.log('Syncing compliance logs...');
            
            // Get compliance logs
            const lastSync = await this.getLastSyncTime('compliance_logs');
            const logs = await this.fetchComplianceLogs(lastSync);

            // Transform and load logs
            for (const log of logs) {
                await this.transformAndLoadComplianceLog(log);
            }

            await this.updateLastSyncTime('compliance_logs');
            console.log(`Synced ${logs.length} compliance logs`);
        } catch (error) {
            console.error('Compliance sync failed:', error);
            throw error;
        }
    }

    // Helper Methods

    async getLastSyncTime(source) {
        const { data, error } = await supabase
            .from('sync_history')
            .select('last_sync')
            .eq('source', source)
            .single();

        if (error || !data) {
            return new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago
        }

        return new Date(data.last_sync);
    }

    async updateLastSyncTime(source) {
        const { error } = await supabase
            .from('sync_history')
            .upsert({
                source,
                last_sync: new Date().toISOString()
            });

        if (error) throw error;
    }

    async transformAndLoadOrder(order) {
        const transformedOrder = {
            region_code: this.extractRegionCode(order),
            sku: order.line_items[0]?.sku,
            quantity: order.line_items[0]?.quantity,
            sale_amount: order.total_price,
            sale_channel: this.determineSaleChannel(order),
            order_date: new Date(order.created_at)
        };

        const { error } = await supabase
            .from('orders')
            .insert(transformedOrder);

        if (error) throw error;
    }

    async transformAndLoadScan(scan) {
        const transformedScan = {
            sku: scan.product_sku,
            scan_timestamp: new Date(scan.timestamp),
            location_code: scan.location_code,
            customer_id: scan.customer_id
        };

        const { error } = await supabase
            .from('nfc_scans')
            .insert(transformedScan);

        if (error) throw error;
    }

    async transformAndLoadAttendance(record) {
        const transformedAttendance = {
            franchisee_id: record.franchisee_id,
            market_location: record.location,
            event_date: new Date(record.date),
            attendance_flag: record.attended
        };

        const { error } = await supabase
            .from('booth_attendance')
            .insert(transformedAttendance);

        if (error) throw error;
    }

    async transformAndLoadComplianceLog(log) {
        const transformedLog = {
            franchisee_id: log.franchisee_id,
            violation_type: log.type,
            violation_timestamp: new Date(log.timestamp),
            status: log.status
        };

        const { error } = await supabase
            .from('compliance_logs')
            .insert(transformedLog);

        if (error) throw error;
    }

    // Utility Methods

    extractRegionCode(order) {
        // Extract region from shipping address or order tags
        return order.tags?.find(tag => tag.startsWith('REGION-'))?.split('-')[1] || 'UNKNOWN';
    }

    determineSaleChannel(order) {
        return order.source_name === 'pos' ? 'market' : 'online';
    }

    async sendAlert(subject, message) {
        // Implement alert system (email, Slack, etc.)
        console.error(`ALERT: ${subject} - ${message}`);
    }

    // Mock Data Fetch Methods (Replace with actual API calls)

    async fetchNFCScans(since) {
        // Mock implementation - replace with actual NFC system API
        return [];
    }

    async fetchBoothAttendance(since) {
        // Mock implementation - replace with actual attendance system API
        return [];
    }

    async fetchComplianceLogs(since) {
        // Mock implementation - replace with actual compliance system API
        return [];
    }
}

// Create and export singleton instance
module.exports = new ETLPipeline(); 