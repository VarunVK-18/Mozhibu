require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const { computeEngagementScores } = require('./services/engagementScorer');
const { computeMonthlyRevenue } = require('./services/revenueEngine');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Map sockets to users
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('authenticate', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} authenticated on socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

app.set('io', io);
app.set('userSockets', userSockets);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const competitionRoutes = require('./routes/competitions');
const searchRoutes = require('./routes/search');

const subscriptionRoutes = require('./routes/subscriptions');
const revenueRoutes = require('./routes/revenue');
const earningsRoutes = require('./routes/earnings');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api', earningsRoutes);

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Mozhibu API is running fine' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// ─── Cron Jobs ────────────────────────────────────────────────

// Nightly at 2:00 AM: compute engagement scores for current month
cron.schedule('0 2 * * *', async () => {
  const now = new Date();
  console.log(`[Cron] Running nightly engagement scorer for ${now.getFullYear()}-${now.getMonth() + 1}`);
  try {
    await computeEngagementScores(now.getFullYear(), now.getMonth() + 1);
  } catch (err) {
    console.error('[Cron] Engagement scoring failed:', err.message);
  }
});

// 1st of each month at 3:00 AM: auto-compute revenue for previous month
cron.schedule('0 3 1 * *', async () => {
  const now = new Date();
  // Previous month
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  console.log(`[Cron] Running monthly revenue computation for ${year}-${month}`);
  try {
    await computeMonthlyRevenue(year, month, 'system');
    console.log(`[Cron] Revenue computation complete for ${year}-${month}`);
  } catch (err) {
    console.error(`[Cron] Error computing engagement scores:`, err);
  }
});


// Daily: expire subscriptions past end_date
cron.schedule('0 0 * * *', async () => {
  try {
    const UserSubscription = require('./models/UserSubscription');
    const result = await UserSubscription.updateMany(
      { status: 'active', endDate: { $lt: new Date() } },
      { $set: { status: 'expired' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Cron] Expired ${result.modifiedCount} subscriptions`);
    }
  } catch (err) {
    console.error('[Cron] Subscription expiry failed:', err.message);
  }
});

module.exports = server;
