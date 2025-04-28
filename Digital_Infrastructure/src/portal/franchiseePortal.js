const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const franchiseManager = require('../franchiseManagement');

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.key);

class FranchiseePortal {
    constructor() {
        this.uploadBucket = 'franchisee-documents';
    }

    // Get franchisee dashboard data
    async getDashboardData(licenseeId) {
        try {
            // Get license details
            const license = await franchiseManager.getLicense(licenseeId);
            
            // Get performance metrics
            const { data: performance } = await supabase
                .from('franchise_performance')
                .select('*')
                .eq('licensee_id', licenseeId)
                .eq('year', new Date().getFullYear())
                .single();

            // Get pending commissions
            const { data: pendingCommissions } = await supabase
                .from('regional_commissions')
                .select('*')
                .eq('licensee_id', licenseeId)
                .eq('status', 'pending');

            // Get recent market days
            const { data: recentMarkets } = await supabase
                .from('market_days')
                .select('*')
                .eq('licensee_id', licenseeId)
                .order('date', { ascending: false })
                .limit(5);

            return {
                license,
                performance,
                pendingCommissions: pendingCommissions || [],
                recentMarkets: recentMarkets || [],
                compliance: await franchiseManager.checkLicenseCompliance(licenseeId)
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    // Submit market day report
    async submitMarketDayReport(licenseeId, reportData) {
        try {
            const { data, error } = await supabase
                .from('market_days')
                .insert({
                    licensee_id: licenseeId,
                    date: reportData.date,
                    location: reportData.location,
                    sales: reportData.sales,
                    attendance: reportData.attendance,
                    photos: reportData.photos,
                    notes: reportData.notes,
                    status: 'pending_review'
                });

            if (error) throw error;

            // Update performance metrics
            await franchiseManager.updatePerformanceMetrics(licenseeId, {
                marketDays: 1,
                totalSales: reportData.sales
            });

            return data;
        } catch (error) {
            console.error('Error submitting market day report:', error);
            throw error;
        }
    }

    // Upload booth setup photos
    async uploadBoothPhotos(licenseeId, photos) {
        try {
            const uploadPromises = photos.map(async (photo) => {
                const { data, error } = await supabase.storage
                    .from(this.uploadBucket)
                    .upload(`${licenseeId}/booth/${Date.now()}-${photo.name}`, photo);

                if (error) throw error;
                return data;
            });

            const results = await Promise.all(uploadPromises);

            // Record photo submission
            await supabase
                .from('booth_compliance')
                .insert({
                    licensee_id: licenseeId,
                    photos: results.map(r => r.path),
                    submitted_at: new Date().toISOString(),
                    status: 'pending_review'
                });

            return results;
        } catch (error) {
            console.error('Error uploading booth photos:', error);
            throw error;
        }
    }

    // Get marketing materials
    async getMarketingMaterials(licenseeId) {
        try {
            const { data, error } = await supabase
                .from('marketing_materials')
                .select('*')
                .eq('region_code', (await franchiseManager.getLicense(licenseeId)).region_code);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching marketing materials:', error);
            throw error;
        }
    }

    // Submit regional capsule design
    async submitCapsuleDesign(licenseeId, designData) {
        try {
            const { data, error } = await supabase
                .from('regional_capsules')
                .insert({
                    licensee_id: licenseeId,
                    region_code: (await franchiseManager.getLicense(licenseeId)).region_code,
                    design_data: designData,
                    status: 'pending_approval',
                    submitted_at: new Date().toISOString()
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error submitting capsule design:', error);
            throw error;
        }
    }
}

module.exports = new FranchiseePortal(); 