const admin = require('firebase-admin');
const path = require('path');

async function verifyIdToken(idToken) {
  try {
    if (admin.apps.length === 0) {
      // Firebase Admin not initialized -> mock mode (for quick local dev)
      console.warn('Firebase Admin not initialized — skipping real token verification (MOCK MODE).');
      // In mock mode, accept any token and return a fake payload for local dev.
      return { uid: idToken || 'local-user', email: 'local@dev', name: 'Local Dev' };
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (e) {
    throw e;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });
  verifyIdToken(token).then(payload => {
    req.firebaseUser = payload;
    next();
  }).catch(err => {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Invalid token' });
  });
}

module.exports = { authMiddleware, verifyIdToken };
