// backend/routes/courses.js  (update existing file)
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/firebaseAuth');
const User = require('../models/User');
const Course = require('../models/Course');

// list all courses
router.get('/', authMiddleware, async (req, res) => {
  const courses = await Course.find().select('title description instructorId lectures').lean().exec();
  const result = courses.map(c => ({
    id: String(c._id),
    title: c.title,
    description: c.description,
    instructorId: String(c.instructorId || ''),
    lecturesCount: (c.lectures || []).length
  }));
  res.json(result);
});

// create course
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  const me = await User.findOne({ $or: [{ firebaseUid: req.firebaseUser.uid }, { email: req.firebaseUser.email }] }).exec();
  if (!me) return res.status(403).json({ message: 'User not registered on backend. Call /auth/firebase first.' });
  if (me.role !== 'Instructor') return res.status(403).json({ message: 'Only Instructors can create courses' });
  const course = new Course({ title, description: description || '', instructorId: me._id, lectures: [] });
  await course.save();
  // return instructorId and id as strings, useful to frontend
  res.json({ id: String(course._id), title: course.title, description: course.description, instructorId: String(course.instructorId) });
});

// get course
router.get('/:id', authMiddleware, async (req, res) => {
  const course = await Course.findById(req.params.id).lean().exec();
  if (!course) return res.status(404).json({ message: 'Course not found' });
  // normalize ids to strings for frontend
  course.id = String(course._id);
  course.instructorId = String(course.instructorId || '');
  // keep lectures as-is (they're embedded)
  res.json(course);
});

module.exports = router;
