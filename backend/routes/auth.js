const express = require('express');
const router = express.Router();
const { verifyIdToken } = require('../middleware/firebaseAuth');
const User = require('../models/User');

// Registers or logs in a user using Firebase ID token.
// Frontend should send { idToken, role } after Firebase sign-in.
router.post('/firebase', async (req, res) => {
  const { idToken, role } = req.body;
  if (!idToken || !role) return res.status(400).json({ message: 'Missing idToken or role' });
  if (!['Instructor','Student'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  try {
    const decoded = await verifyIdToken(idToken);
    let user = await User.findOne({ $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }] }).exec();
    if (!user) {
      user = new User({
        firebaseUid: decoded.uid,
        name: decoded.name || decoded.email,
        email: decoded.email,
        role
      });
      await user.save();
    } else {
      if (user.role !== role) {
        user.role = role;
        await user.save();
      }
    }
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: 'Invalid Firebase ID token' });
  }
});

module.exports = router;
