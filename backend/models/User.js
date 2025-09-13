const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  firebaseUid: { type: String, index: true, unique: true, sparse: true },
  name: String,
  email: { type: String, index: true, unique: true, sparse: true },
  role: { type: String, enum: ['Instructor','Student'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
