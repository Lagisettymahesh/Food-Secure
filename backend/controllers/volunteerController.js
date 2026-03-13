const prisma = require('../utils/db');

// ─── GET /api/v1/volunteer/tasks ──────────────────────────────────────────────
exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await prisma.volunteerTask.findMany({
            where: { volunteer_id: req.user.id },
            include: {
                donation: {
                    include: { donor: { select: { name_or_org: true, address: true, lat: true, lng: true } } }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// ─── PATCH /api/v1/volunteer/tasks/:id/status ─────────────────────────────────
exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, delivery_photo_proof } = req.body;

        const task = await prisma.volunteerTask.findUnique({ where: { id } });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (task.volunteer_id !== req.user.id) return res.status(403).json({ error: 'Not your task' });

        const updateData = { status };
        if (status === 'picked_up') updateData.actual_pickup_time = new Date();
        if (status === 'delivered') {
            updateData.actual_delivery_time = new Date();
            if (delivery_photo_proof) updateData.delivery_photo_proof = delivery_photo_proof;
        }

        const updatedTask = await prisma.volunteerTask.update({
            where: { id },
            data: updateData,
            include: { donation: true }
        });

        // If delivered, mark donation as completed
        if (status === 'delivered') {
            await prisma.donation.update({
                where: { id: task.donation_id },
                data: { status: 'completed' }
            });
        }

        // Broadcast update
        const io = req.app.get('io');
        if (io) io.to('ngo_feed').emit('task:update', updatedTask);

        res.status(200).json({ message: 'Task status updated', task: updatedTask });
    } catch (error) {
        console.error('Task update error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

// ─── GET /api/v1/volunteer/stats ──────────────────────────────────────────────
exports.getVolunteerStats = async (req, res) => {
    try {
        const vol_id = req.user.id;
        const [total, delivered, active] = await Promise.all([
            prisma.volunteerTask.count({ where: { volunteer_id: vol_id } }),
            prisma.volunteerTask.count({ where: { volunteer_id: vol_id, status: 'delivered' } }),
            prisma.volunteerTask.count({ where: { volunteer_id: vol_id, status: { notIn: ['delivered'] } } })
        ]);
        res.status(200).json({ totalTasks: total, delivered, active });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch volunteer stats' });
    }
};

// ─── GET /api/v1/volunteer/available-tasks ────────────────────────────────────
// Available donations that need a volunteer (NGO requested + needs_volunteer = true)
exports.getAvailableTasks = async (req, res) => {
    try {
        const openRequests = await prisma.ngoRequest.findMany({
            where: { needs_volunteer: true, status: 'requested' },
            include: {
                donation: {
                    include: { donor: { select: { name_or_org: true, address: true, lat: true, lng: true } } }
                },
                ngo: { select: { name_or_org: true, address: true, lat: true, lng: true } }
            },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json(openRequests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch available tasks' });
    }
};
