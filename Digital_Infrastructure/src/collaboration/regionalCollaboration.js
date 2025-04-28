const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.key);

class RegionalCollaboration {
    constructor() {
        this.uploadBucket = 'artist-submissions';
    }

    // Add local artist
    async addLocalArtist(artistData) {
        try {
            const { data, error } = await supabase
                .from('local_artists')
                .insert({
                    name: artistData.name,
                    region_code: artistData.region,
                    contact_email: artistData.email,
                    portfolio_url: artistData.portfolio,
                    status: 'pending',
                    submitted_at: new Date().toISOString()
                });

            if (error) throw error;

            // Notify regional licensee
            await this.notifyLicensee(artistData.region, 'new_artist', {
                artistName: artistData.name,
                portfolioUrl: artistData.portfolio
            });

            return data;
        } catch (error) {
            console.error('Error adding local artist:', error);
            throw error;
        }
    }

    // Submit artist design
    async submitArtistDesign(artistId, designData) {
        try {
            // Upload design files
            const uploadPromises = designData.files.map(async (file) => {
                const { data, error } = await supabase.storage
                    .from(this.uploadBucket)
                    .upload(`${artistId}/designs/${Date.now()}-${file.name}`, file);

                if (error) throw error;
                return data;
            });

            const uploadedFiles = await Promise.all(uploadPromises);

            // Create design submission
            const { data, error } = await supabase
                .from('artist_designs')
                .insert({
                    artist_id: artistId,
                    title: designData.title,
                    description: designData.description,
                    files: uploadedFiles.map(f => f.path),
                    status: 'pending_review',
                    submitted_at: new Date().toISOString()
                });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error submitting artist design:', error);
            throw error;
        }
    }

    // Create local event
    async createLocalEvent(eventData) {
        try {
            const { data, error } = await supabase
                .from('local_events')
                .insert({
                    region_code: eventData.region,
                    title: eventData.title,
                    description: eventData.description,
                    date: eventData.date,
                    location: eventData.location,
                    organizer_id: eventData.organizerId,
                    status: 'planned',
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            // Notify local community
            await this.notifyCommunity(eventData.region, 'new_event', {
                eventTitle: eventData.title,
                eventDate: eventData.date,
                eventLocation: eventData.location
            });

            return data;
        } catch (error) {
            console.error('Error creating local event:', error);
            throw error;
        }
    }

    // Get regional artists
    async getRegionalArtists(regionCode) {
        try {
            const { data, error } = await supabase
                .from('local_artists')
                .select('*')
                .eq('region_code', regionCode)
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching regional artists:', error);
            throw error;
        }
    }

    // Get regional events
    async getRegionalEvents(regionCode) {
        try {
            const { data, error } = await supabase
                .from('local_events')
                .select('*')
                .eq('region_code', regionCode)
                .order('date', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching regional events:', error);
            throw error;
        }
    }

    // Notify licensee
    async notifyLicensee(regionCode, type, data) {
        try {
            const { data: licensees } = await supabase
                .from('franchise_licenses')
                .select('contact_email')
                .eq('region_code', regionCode)
                .eq('status', 'active');

            if (!licensees || licensees.length === 0) return;

            // IMPLEMENTATION REQUIRED:
            // Connect to your email service provider
            // for (const licensee of licensees) {
            //     await sendEmail({
            //         to: licensee.contact_email,
            //         subject: `GOOD ENOUGH ${type.replace('_', ' ').toUpperCase()}`,
            //         template: type,
            //         templateData: data
            //     });
            // }

            return { success: true };
        } catch (error) {
            console.error('Error notifying licensee:', error);
            // Don't throw - we don't want to fail the whole process if notification fails
            return { success: false, error: error.message };
        }
    }

    // Notify community
    async notifyCommunity(regionCode, type, data) {
        try {
            const { data: subscribers } = await supabase
                .from('community_subscribers')
                .select('email')
                .eq('region_code', regionCode)
                .eq('status', 'active');

            if (!subscribers || subscribers.length === 0) return;

            // IMPLEMENTATION REQUIRED:
            // Connect to your email service provider
            // for (const subscriber of subscribers) {
            //     await sendEmail({
            //         to: subscriber.email,
            //         subject: `GOOD ENOUGH ${type.replace('_', ' ').toUpperCase()}`,
            //         template: type,
            //         templateData: data
            //     });
            // }

            return { success: true };
        } catch (error) {
            console.error('Error notifying community:', error);
            // Don't throw - we don't want to fail the whole process if notification fails
            return { success: false, error: error.message };
        }
    }
}

module.exports = new RegionalCollaboration(); 