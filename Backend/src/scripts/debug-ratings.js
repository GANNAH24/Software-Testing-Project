const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const reviewsRepository = require('../features/reviews/reviews.repository');
const analyticsRepository = require('../features/admin/analytics.repository');

const debugRatings = async () => {
    console.log('--- Debugging Doctor Ratings ---');
    
    try {
        // 1. Get Top Doctors first
        console.log('Fetching top doctors...');
        const topDoctors = await analyticsRepository.getTopDoctors(5);
        console.log(`Found ${topDoctors.length} doctors.`);
        
        for (const doc of topDoctors) {
            console.log(`\nChecking Doctor: ${doc.name} (ID: ${doc.doctor_id})`);
            
            // 2. Check direct rating call
            console.log('Fetching rating from reviewsRepository...');
            const ratingData = await reviewsRepository.getDoctorAverageRating(doc.doctor_id);
            console.log(`Result: Average Rating = ${ratingData.averageRating}, Count = ${ratingData.reviewCount}`);
        }

    } catch (error) {
        console.error('Debug script error:', error);
    }
};

debugRatings();
