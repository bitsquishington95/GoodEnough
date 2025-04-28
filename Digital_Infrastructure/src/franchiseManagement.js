const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.key);

// Franchise Management System
class FranchiseManager {
    constructor() {
        this.commissionRate = 0.10; // 10% commission on regional capsule sales
    }

    // Create new franchise license
    async createLicense(licenseeData) {
        const { data, error } = await supabase
            .from('franchise_licenses')
            .insert({
                licensee_id: licenseeData.id,
                region_code: licenseeData.region,
                markets: licenseeData.markets,
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 years
                status: 'active',
                license_fee: 18000, // $18,000 base fee
                performance_metrics: {
                    minimum_sales: 30000, // $30,000/year minimum
                    minimum_market_days: 12 // 12 market days/year
                }
            });

        if (error) throw error;
        return data;
    }

    // Calculate regional commission for online sales
    async calculateCommission(order) {
        const regionalItems = order.line_items.filter(item => {
            const regionCode = item.sku.split('-')[0];
            return config.regions.validPrefixes.includes(regionCode);
        });

        const commissions = {};
        for (const item of regionalItems) {
            const regionCode = item.sku.split('-')[0];
            const commission = item.price * item.quantity * this.commissionRate;
            
            if (!commissions[regionCode]) {
                commissions[regionCode] = 0;
            }
            commissions[regionCode] += commission;
        }

        return commissions;
    }

    // Track franchise performance
    async updatePerformanceMetrics(licenseeId, metrics) {
        const { data, error } = await supabase
            .from('franchise_performance')
            .upsert({
                licensee_id: licenseeId,
                year: new Date().getFullYear(),
                total_sales: metrics.totalSales,
                market_days: metrics.marketDays,
                online_commissions: metrics.onlineCommissions,
                last_updated: new Date().toISOString()
            }, { onConflict: 'licensee_id,year' });

        if (error) throw error;
        return data;
    }

    // Check if franchise meets minimum requirements
    async checkLicenseCompliance(licenseeId) {
        const { data, error } = await supabase
            .from('franchise_performance')
            .select('*')
            .eq('licensee_id', licenseeId)
            .eq('year', new Date().getFullYear())
            .single();

        if (error) throw error;

        const license = await this.getLicense(licenseeId);
        const requirements = license.performance_metrics;

        return {
            meetsSalesMinimum: data.total_sales >= requirements.minimum_sales,
            meetsMarketDays: data.market_days >= requirements.minimum_market_days,
            currentSales: data.total_sales,
            currentMarketDays: data.market_days
        };
    }

    // Get license details
    async getLicense(licenseeId) {
        const { data, error } = await supabase
            .from('franchise_licenses')
            .select('*')
            .eq('licensee_id', licenseeId)
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = new FranchiseManager(); 