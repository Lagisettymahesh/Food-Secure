require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const prisma = require('./utils/db');

const app = express();
const server = http.createServer(app);

// ── Socket.io setup with CORS ─────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://127.0.0.1:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Make io accessible in all controllers via req.app.get('io')
app.set('io', io);

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [process.env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const donationRoutes  = require('./routes/donationRoutes');
const ngoRoutes       = require('./routes/ngoRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'FoodRescue Backend', timestamp: new Date().toISOString() }));

app.use('/api/v1/auth',      authRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/ngo',       ngoRoutes);
app.use('/api/v1/volunteer', volunteerRoutes);

// ── Admin stats route ─────────────────────────────────────────────────────────
app.get('/api/v1/admin/stats', async (req, res) => {
  try {
    const [users, donations, pending, flagged] = await Promise.all([
      prisma.user.count(),
      prisma.donation.count(),
      prisma.donation.count({ where: { status: 'pending' } }),
      prisma.donation.count({ where: { status: 'cancelled' } })  // ML-cancelled ones
    ]);
    res.json({ users, donations, pending, flagged });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// ── Socket.io — Room system ───────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Client declares their role to join the right feed room
  socket.on('join_room', (role) => {
    if (role === 'ngo')       socket.join('ngo_feed');
    if (role === 'volunteer') socket.join('volunteer_feed');
    if (role === 'donor')     socket.join('donor_feed');
    console.log(`  → ${socket.id} joined room: ${role}_feed`);
  });

  socket.on('disconnect', () => console.log(`🔌 Socket disconnected: ${socket.id}`));
});

// ── Cron: Auto-expire stale donations every 5 minutes ────────────────────────
cron.schedule('*/5 * * * *', async () => {
  try {
    const result = await prisma.donation.updateMany({
      where: { status: 'pending', expiry_time: { lt: new Date() } },
      data: { status: 'cancelled' }
    });
    if (result.count > 0) {
      console.log(`⏱  Cron: Auto-cancelled ${result.count} expired donation(s)`);
      io.to('ngo_feed').emit('donation:expired', { count: result.count });
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});

// ── Server start ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Smart Food Rescue backend running on port ${PORT}`);
  console.log(`   CORS origin: ${process.env.CORS_ORIGIN}`);
  console.log(`   Cron: auto-expire donations every 5 minutes\n`);
});
