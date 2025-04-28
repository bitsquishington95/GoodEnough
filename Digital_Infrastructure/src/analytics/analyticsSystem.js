const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const franchiseManager = require('../franchiseManagement');

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.key);

class AnalyticsSystem {
    constructor() {
        this.metricsCache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    // Get regional performance metrics
    async getRegionalMetrics(regionCode, timeRange = '30d') {
        const cacheKey = `regional_${regionCode}_${timeRange}`;
        const cached = this.metricsCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        try {
            const { data: licensees } = await supabase
                .from('franchise_licenses')
                .select('licensee_id')
                .eq('region_code', regionCode)
                .eq('status', 'active');

            const metrics = await this.calculateRegionalMetrics(licensees.map(l => l.licensee_id), timeRange);
            
            this.metricsCache.set(cacheKey, {
                timestamp: Date.now(),
                data: metrics
            });

            return metrics;
        } catch (error) {
            console.error('Error fetching regional metrics:', error);
            throw error;
        }
    }

    // Calculate detailed regional metrics
    async calculateRegionalMetrics(licenseeIds, timeRange) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - this.getDaysFromTimeRange(timeRange));

        const [salesData, marketData, commissionData] = await Promise.all([
            this.getSalesMetrics(licenseeIds, startDate, endDate),
            this.getMarketMetrics(licenseeIds, startDate, endDate),
            this.getCommissionMetrics(licenseeIds, startDate, endDate)
        ]);

        return {
            sales: salesData,
            markets: marketData,
            commissions: commissionData,
            timeRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            }
        };
    }

    // Get sales metrics
    async getSalesMetrics(licenseeIds, startDate, endDate) {
        const { data, error } = await supabase
            .from('market_days')
            .select('sales, date, licensee_id')
            .in('licensee_id', licenseeIds)
            .gte('date', startDate.toISOString())
            .lte('date', endDate.toISOString())
            .order('date', { ascending: true });

        if (error) throw error;

        const dailySales = this.aggregateDailySales(data);
        const totalSales = dailySales.reduce((sum, day) => sum + day.sales, 0);
        const averageDailySales = totalSales / (dailySales.length || 1);

        return {
            total: totalSales,
            averageDaily: averageDailySales,
            dailyBreakdown: dailySales,
            growth: this.calculateGrowth(dailySales)
        };
    }

    // Get market metrics
    async getMarketMetrics(licenseeIds, startDate, endDate) {
        const { data, error } = await supabase
            .from('market_days')
            .select('attendance, date, location, licensee_id')
            .in('licensee_id', licenseeIds)
            .gte('date', startDate.toISOString())
            .lte('date', endDate.toISOString());

        if (error) throw error;

        const metrics = {
            totalMarkets: data.length,
            totalAttendance: data.reduce((sum, day) => sum + (day.attendance || 0), 0),
            averageAttendance: data.reduce((sum, day) => sum + (day.attendance || 0), 0) / (data.length || 1),
            locations: this.aggregateLocations(data),
            attendanceTrend: this.calculateAttendanceTrend(data)
        };

        return metrics;
    }

    // Get commission metrics
    async getCommissionMetrics(licenseeIds, startDate, endDate) {
        const { data, error } = await supabase
            .from('regional_commissions')
            .select('amount, created_at, status')
            .in('licensee_id', licenseeIds)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (error) throw error;

        const totalCommissions = data.reduce((sum, commission) => sum + commission.amount, 0);
        const pendingCommissions = data
            .filter(c => c.status === 'pending')
            .reduce((sum, commission) => sum + commission.amount, 0);

        return {
            total: totalCommissions,
            pending: pendingCommissions,
            paid: totalCommissions - pendingCommissions,
            dailyBreakdown: this.aggregateDailyCommissions(data)
        };
    }

    // Helper methods
    getDaysFromTimeRange(timeRange) {
        const ranges = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        return ranges[timeRange] || 30;
    }

    aggregateDailySales(data) {
        const dailySales = new Map();
        
        data.forEach(day => {
            const date = new Date(day.date).toISOString().split('T')[0];
            const current = dailySales.get(date) || 0;
            dailySales.set(date, current + day.sales);
        });

        return Array.from(dailySales.entries())
            .map(([date, sales]) => ({ date, sales }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    calculateGrowth(dailySales) {
        if (dailySales.length < 2) return 0;
        
        const firstPeriod = dailySales.slice(0, Math.floor(dailySales.length / 2))
            .reduce((sum, day) => sum + day.sales, 0);
        
        const secondPeriod = dailySales.slice(Math.floor(dailySales.length / 2))
            .reduce((sum, day) => sum + day.sales, 0);
        
        return ((secondPeriod - firstPeriod) / firstPeriod) * 100;
    }

    aggregateLocations(data) {
        const locations = new Map();
        
        data.forEach(day => {
            const current = locations.get(day.location) || 0;
            locations.set(day.location, current + 1);
        });

        return Array.from(locations.entries())
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count);
    }

    calculateAttendanceTrend(data) {
        const dailyAttendance = new Map();
        
        data.forEach(day => {
            const date = new Date(day.date).toISOString().split('T')[0];
            const current = dailyAttendance.get(date) || 0;
            dailyAttendance.set(date, current + (day.attendance || 0));
        });

        return Array.from(dailyAttendance.entries())
            .map(([date, attendance]) => ({ date, attendance }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    aggregateDailyCommissions(data) {
        const dailyCommissions = new Map();
        
        data.forEach(commission => {
            const date = new Date(commission.created_at).toISOString().split('T')[0];
            const current = dailyCommissions.get(date) || { pending: 0, paid: 0 };
            
            if (commission.status === 'pending') {
                current.pending += commission.amount;
            } else {
                current.paid += commission.amount;
            }
            
            dailyCommissions.set(date, current);
        });

        return Array.from(dailyCommissions.entries())
            .map(([date, amounts]) => ({ date, ...amounts }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
}

module.exports = new AnalyticsSystem(); 