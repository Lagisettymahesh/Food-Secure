const prisma = require('../utils/db');
const axios = require('axios');

// ─── POST /api/v1/donations ───────────────────────────────────────────────────
// Requires: donor JWT token
exports.createDonation = async (req, res) => {
    try {
        const donor_id = req.user.id; // Always from verified JWT
        const { food_type, quantity, expiry_time, pickup_lat, pickup_lng, photo_url } = req.body;

        // ML Fraud Detection
        try {
            const mlRes = await axios.post('http://127.0.0.1:8000/api/ml/predict-fraud', {
                quantity,
                donor_history_count: await prisma.donation.count({ where: { donor_id } }),
                time_to_fill_form_seconds: 45,
                distance_from_registered_location: 2.5
            }, { timeout: 3000 });

            if (mlRes.data.isAnomaly) {
                return res.status(400).json({ error: 'Donation flagged as anomalous by fraud detection. Please contact support.' });
            }
        } catch (mlErr) {
            console.warn('ML service check failed, proceeding:', mlErr.message);
        }

        const donation = await prisma.donation.create({
            data: {
                donor_id,
                food_type,
                quantity,
                expiry_time: new Date(expiry_time),
                pickup_lat,
                pickup_lng,
                photo_url,
                status: 'pending'
            },
            include: { donor: { select: { name_or_org: true } } }
        });

        // Broadcast to NGOs via Socket.io
        const io = req.app.get('io');
        if (io) io.to('ngo_feed').emit('donation:new', donation);

        res.status(201).json({ message: 'Donation created successfully', donation });
    } catch (error) {
        console.error('Donation creation error:', error);
        res.status(500).json({ error: 'Failed to create donation' });
    }
};

// ─── GET /api/v1/donations/nearby ─────────────────────────────────────────────
exports.getNearbyDonations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const donations = await prisma.donation.findMany({
            where: {
                status: 'pending',
                expiry_time: { gt: new Date() } // Only non-expired
            },
            include: { donor: { select: { name_or_org: true, lat: true, lng: true } } },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        });

        const total = await prisma.donation.count({
            where: { status: 'pending', expiry_time: { gt: new Date() } }
        });

        res.status(200).json({ donations, page, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Fetch donations error:', error);
        res.status(500).json({ error: 'Failed to fetch nearby donations' });
    }
};

// ─── GET /api/v1/donations/my ─────────────────────────────────────────────────
// Donor sees their own real stats
exports.getMyDonations = async (req, res) => {
    try {
        const donor_id = req.user.id;

        const [donations, totalMeals, activeCount] = await Promise.all([
            prisma.donation.findMany({
                where: { donor_id },
                orderBy: { created_at: 'desc' },
                take: 10
            }),
            prisma.donation.aggregate({
                where: { donor_id },
                _sum: { quantity: true }
            }),
            prisma.donation.count({
                where: { donor_id, status: { in: ['pending', 'accepted', 'assigned'] } }
            })
        ]);

        const totalMealsCount = totalMeals._sum.quantity || 0;
        const co2Saved = Math.round(totalMealsCount * 0.3); // 0.3 kg CO2 per meal

        res.status(200).json({
            donations,
            stats: {
                totalMeals: totalMealsCount,
                activeDonations: activeCount,
                co2Saved
            }
        });
    } catch (error) {
        console.error('My donations error:', error);
        res.status(500).json({ error: 'Failed to fetch your donations' });
    }
};
