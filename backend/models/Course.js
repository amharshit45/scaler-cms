const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  text: String,
  options: [String],
  correctAnswerIndex: Number
}, { _id: false });

const lectureSchema = new Schema({
  type: { type: String, enum: ['reading','quiz'], required: true },
  title: String,
  content: String,
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lectures: [lectureSchema]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
