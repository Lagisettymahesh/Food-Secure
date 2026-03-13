const prisma = require('../utils/db');

// ─── POST /api/v1/ngo/requests ────────────────────────────────────────────────
// NGO claims a donation
exports.claimDonation = async (req, res) => {
    try {
        const ngo_id = req.user.id;
        const { donation_id, requested_quantity, needs_volunteer = false } = req.body;

        // Check donation exists and is still pending
        const donation = await prisma.donation.findUnique({
            where: { id: donation_id },
            include: { donor: { select: { name_or_org: true } } }
        });

        if (!donation) return res.status(404).json({ error: 'Donation not found' });
        if (donation.status !== 'pending') return res.status(409).json({ error: `Donation is already ${donation.status}` });
        if (new Date(donation.expiry_time) < new Date()) return res.status(410).json({ error: 'Donation has expired' });

        // Create NGO request + update donation in a transaction
        const [ngoRequest] = await prisma.$transaction([
            prisma.ngoRequest.create({
                data: { donation_id, ngo_id, requested_quantity, needs_volunteer, status: 'requested' }
            }),
            prisma.donation.update({
                where: { id: donation_id },
                data: { status: 'accepted' }
            }),
            // Notify donor
            prisma.notification.create({
                data: {
                    user_id: donation.donor_id,
                    type: 'claim',
                    title: 'Your donation was claimed! 🎉',
                    message: `An NGO has claimed your "${donation.food_type}" donation.`
                }
            })
        ]);

        // Broadcast to volunteer feed if volunteer is needed
        const io = req.app.get('io');
        if (io) {
            io.to('ngo_feed').emit('donation:claimed', { donation_id, ngo_id });
            if (needs_volunteer) {
                io.to('volunteer_feed').emit('claim:new', {
                    ...ngoRequest,
                    donation,
                    ngo_name: req.user.name_or_org
                });
            }
        }

        res.status(201).json({ message: 'Donation claimed successfully', request: ngoRequest });
    } catch (error) {
        console.error('NGO claim error:', error);
        res.status(500).json({ error: 'Failed to claim donation' });
    }
};

// ─── GET /api/v1/ngo/requests ─────────────────────────────────────────────────
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await prisma.ngoRequest.findMany({
            where: { ngo_id: req.user.id },
            include: {
                donation: {
                    include: { donor: { select: { name_or_org: true, address: true } } }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch NGO requests' });
    }
};

// ─── GET /api/v1/ngo/stats ────────────────────────────────────────────────────
exports.getNgoStats = async (req, res) => {
    try {
        const ngo_id = req.user.id;
        const [totalClaimed, pendingCount, mealsClaimed] = await Promise.all([
            prisma.ngoRequest.count({ where: { ngo_id } }),
            prisma.ngoRequest.count({ where: { ngo_id, status: 'requested' } }),
            prisma.ngoRequest.aggregate({ where: { ngo_id }, _sum: { requested_quantity: true } })
        ]);
        res.status(200).json({
            totalClaimed,
            pendingCount,
            mealsClaimed: mealsClaimed._sum.requested_quantity || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch NGO stats' });
    }
};
