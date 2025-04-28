const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const franchiseManager = require('../franchiseManagement');

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.key);

class ComplianceSystem {
    constructor() {
        this.warningThresholds = {
            sales: 0.7, // 70% of minimum required
            marketDays: 0.7, // 70% of minimum required
            boothCompliance: 3 // 3 failed checks
        };
    }

    // Check booth compliance
    async checkBoothCompliance(licenseeId) {
        try {
            const { data: recentChecks } = await supabase
                .from('booth_compliance')
                .select('*')
                .eq('licensee_id', licenseeId)
                .order('submitted_at', { ascending: false })
                .limit(5);

            if (!recentChecks || recentChecks.length === 0) {
                return this.generateWarning(licenseeId, 'booth_compliance', 'No booth photos submitted');
            }

            const failedChecks = recentChecks.filter(check => check.status === 'failed');
            if (failedChecks.length >= this.warningThresholds.boothCompliance) {
                return this.generateWarning(licenseeId, 'booth_compliance', 
                    `${failedChecks.length} consecutive failed booth checks`);
            }

            return { compliant: true };
        } catch (error) {
            console.error('Error checking booth compliance:', error);
            throw error;
        }
    }

    // Check performance compliance
    async checkPerformanceCompliance(licenseeId) {
        try {
            const compliance = await franchiseManager.checkLicenseCompliance(licenseeId);
            const license = await franchiseManager.getLicense(licenseeId);
            const requirements = license.performance_metrics;

            const warnings = [];

            if (!compliance.meetsSalesMinimum) {
                const progress = compliance.currentSales / requirements.minimum_sales;
                if (progress < this.warningThresholds.sales) {
                    warnings.push(this.generateWarning(licenseeId, 'sales', 
                        `Sales at ${Math.round(progress * 100)}% of minimum requirement`));
                }
            }

            if (!compliance.meetsMarketDays) {
                const progress = compliance.currentMarketDays / requirements.minimum_market_days;
                if (progress < this.warningThresholds.marketDays) {
                    warnings.push(this.generateWarning(licenseeId, 'market_days',
                        `Market days at ${Math.round(progress * 100)}% of minimum requirement`));
                }
            }

            return {
                compliant: warnings.length === 0,
                warnings: warnings
            };
        } catch (error) {
            console.error('Error checking performance compliance:', error);
            throw error;
        }
    }

    // Generate compliance warning
    async generateWarning(licenseeId, type, message) {
        try {
            const { data, error } = await supabase
                .from('compliance_warnings')
                .insert({
                    licensee_id: licenseeId,
                    warning_type: type,
                    message: message,
                    status: 'active',
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            // Send notification to licensee
            await this.sendComplianceNotification(licenseeId, type, message);

            return {
                compliant: false,
                warning: {
                    type,
                    message,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error generating warning:', error);
            throw error;
        }
    }

    // Send compliance notification
    async sendComplianceNotification(licenseeId, type, message) {
        try {
            const { data: licensee } = await supabase
                .from('franchise_licenses')
                .select('contact_email')
                .eq('licensee_id', licenseeId)
                .single();

            if (!licensee) throw new Error('Licensee not found');

            // IMPLEMENTATION REQUIRED:
            // Connect to your email service provider
            // await sendEmail({
            //     to: licensee.contact_email,
            //     subject: 'GOOD ENOUGH Compliance Warning',
            //     template: 'compliance-warning',
            //     templateData: {
            //         warning_type: type,
            //         message: message,
            //         action_url: `https://goodenough.com/compliance/${licenseeId}`
            //     }
            // });

            return { success: true };
        } catch (error) {
            console.error('Error sending compliance notification:', error);
            // Don't throw - we don't want to fail the whole process if notification fails
            return { success: false, error: error.message };
        }
    }

    // Check license renewal
    async checkLicenseRenewal(licenseeId) {
        try {
            const license = await franchiseManager.getLicense(licenseeId);
            const renewalDate = new Date(license.end_date);
            const now = new Date();
            
            // Check if renewal is due in next 30 days
            const daysUntilRenewal = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntilRenewal <= 30) {
                const compliance = await this.checkPerformanceCompliance(licenseeId);
                
                if (compliance.compliant) {
                    // Auto-renew if compliant
                    await this.renewLicense(licenseeId);
                    return { renewed: true, daysUntilRenewal };
                } else {
                    // Send renewal warning if not compliant
                    return this.generateWarning(licenseeId, 'renewal', 
                        `License renewal due in ${daysUntilRenewal} days. Performance requirements not met.`);
                }
            }
            
            return { renewed: false, daysUntilRenewal };
        } catch (error) {
            console.error('Error checking license renewal:', error);
            throw error;
        }
    }

    // Renew license
    async renewLicense(licenseeId) {
        try {
            const license = await franchiseManager.getLicense(licenseeId);
            
            const { data, error } = await supabase
                .from('franchise_licenses')
                .update({
                    end_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('licensee_id', licenseeId);

            if (error) throw error;

            // Send renewal confirmation
            await this.sendRenewalConfirmation(licenseeId);

            return data;
        } catch (error) {
            console.error('Error renewing license:', error);
            throw error;
        }
    }

    // Send renewal confirmation
    async sendRenewalConfirmation(licenseeId) {
        try {
            const { data: licensee } = await supabase
                .from('franchise_licenses')
                .select('contact_email')
                .eq('licensee_id', licenseeId)
                .single();

            if (!licensee) throw new Error('Licensee not found');

            // IMPLEMENTATION REQUIRED:
            // Connect to your email service provider
            // await sendEmail({
            //     to: licensee.contact_email,
            //     subject: 'GOOD ENOUGH License Renewed',
            //     template: 'license-renewed',
            //     templateData: {
            //         renewal_date: new Date().toISOString(),
            //         next_renewal: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString()
            //     }
            // });

            return { success: true };
        } catch (error) {
            console.error('Error sending renewal confirmation:', error);
            // Don't throw - we don't want to fail the whole process if notification fails
            return { success: false, error: error.message };
        }
    }
}

module.exports = new ComplianceSystem(); 