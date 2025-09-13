// backend/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// ---------- Robust Firebase Admin initialization (env-first) ----------
function initFirebaseAdmin() {
  try {
    // 1) Try to initialize from environment variable (recommended for hosts)
    const envSa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (envSa) {
      try {
        const serviceAccount = JSON.parse(envSa);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        console.log('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var.');
        return true;
      } catch (err) {
        console.error('FIREBASE_SERVICE_ACCOUNT present but JSON.parse failed:', err.message || err);
        // fall through to local file attempt for dev
      }
    }

    // 2) Fallback to local serviceAccountKey.json (only for local development)
    const localPath = path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(localPath)) {
      const serviceAccount = require(localPath);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('Firebase Admin initialized from local serviceAccountKey.json file.');
      return true;
    }

    // 3) If neither present, log a clear warning.
    console.warn('Firebase Admin NOT initialized: no FIREBASE_SERVICE_ACCOUNT env var and no local serviceAccountKey.json.');
    return false;

  } catch (err) {
    console.error('Unexpected error while initializing Firebase Admin:', err && err.stack ? err.stack : err);
    return false;
  }
}
const firebaseInitialized = initFirebaseAdmin();
// ---------------------------------------------------------------------

// Express app setup
const app = express();
// Allow configurable origin in production
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin === '*' ? true : allowedOrigin }));
app.use(bodyParser.json());

// Simple health endpoint for uptime checks
app.get('/health', async (req, res) => {
  const status = { ok: true, firebase: !!firebaseInitialized, mongo: false };
  try {
    // check mongoose connection state: 1 = connected
    status.mongo = (mongoose.connection && mongoose.connection.readyState === 1);
  } catch (e) { status.mongo = false; }
  res.json(status);
});

// MongoDB connection (avoid deprecated options)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/olp';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // For Render, do not exit immediately so logs are visible;
    // but depending on your needs you may want process.exit(1)
  });

// Import routes AFTER firebase init (some middleware may rely on admin)
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const progressRoutes = require('./routes/progress');

// Debug: print route types (safe)
console.log('authRoutes type:', typeof authRoutes);
console.log('coursesRoutes type:', typeof courseRoutes);
console.log('lectureRoutes type:', typeof lectureRoutes);
console.log('progressRoutes type:', typeof progressRoutes);

// Register routes
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/lectures', lectureRoutes);
app.use('/progress', progressRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

module.exports = app;
