const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/firebaseAuth');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

// mark reading lecture complete
router.post('/complete/:courseId/:lectureId', authMiddleware, async (req, res) => {
  const { courseId, lectureId } = req.params;
  const course = await Course.findById(courseId).lean().exec();
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const lecture = (course.lectures || []).find(l => String(l._id || l.id) === String(lectureId));
  if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
  if (lecture.type !== 'reading') return res.status(400).json({ message: 'Not a reading lecture' });

  const me = await User.findOne({ $or: [{ firebaseUid: req.firebaseUser.uid }, { email: req.firebaseUser.email }] }).exec();
  if (!me) return res.status(403).json({ message: 'User not registered on backend.' });

  let userProgress = await Progress.findOne({ userId: me._id, courseId }).exec();
  if (!userProgress) {
    userProgress = new Progress({ userId: me._id, courseId, completedLectureIds: [] });
  }
  if (!userProgress.completedLectureIds.includes(lectureId)) {
    userProgress.completedLectureIds.push(lectureId);
    await userProgress.save();
  } else {
    if (!userProgress._id) await userProgress.save();
  }
  res.json({ message: 'Marked complete' });
});

// get progress
router.get('/:courseId', authMiddleware, async (req, res) => {
  const { courseId } = req.params;
  const me = await User.findOne({ $or: [{ firebaseUid: req.firebaseUser.uid }, { email: req.firebaseUser.email }] }).exec();
  if (!me) return res.status(403).json({ message: 'User not registered on backend.' });
  const userProgress = await Progress.findOne({ userId: me._id, courseId }).lean().exec();
  res.json(userProgress || { userId: me._id, courseId, completedLectureIds: [] });
});

// list courses the user is learning (has any progress record)
router.get('/mine/list', authMiddleware, async (req, res) => {
  try{
    const me = await User.findOne({ $or: [{ firebaseUid: req.firebaseUser.uid }, { email: req.firebaseUser.email }] }).exec();
    if (!me) return res.status(403).json({ message: 'User not registered on backend.' });

    const progresses = await Progress.find({ userId: me._id }).populate({ path: 'courseId', select: 'title description instructorId lectures' }).lean().exec();
    const courses = (progresses || [])
      .filter(p => p.courseId)
      .map(p => {
        const c = p.courseId;
        return {
          id: String(c._id),
          title: c.title,
          description: c.description,
          instructorId: String(c.instructorId || ''),
          lecturesCount: (c.lectures || []).length
        };
      });
    res.json(courses);
  }catch(err){
    console.error('Failed to list my learning courses', err);
    res.status(500).json({ message: 'Failed to list learning courses' });
  }
});

// compact map of courseId -> completed lecture count for current user
router.get('/mine/map', authMiddleware, async (req, res) => {
  try{
    const me = await User.findOne({ $or: [{ firebaseUid: req.firebaseUser.uid }, { email: req.firebaseUser.email }] }).exec();
    if (!me) return res.status(403).json({ message: 'User not registered on backend.' });
    const progresses = await Progress.find({ userId: me._id }).select('courseId completedLectureIds').lean().exec();
    const map = {};
    (progresses || []).forEach(p => {
      map[String(p.courseId)] = Array.isArray(p.completedLectureIds) ? p.completedLectureIds.length : 0;
    });
    res.json(map);
  }catch(err){
    console.error('Failed to get my progress map', err);
    res.status(500).json({});
  }
});

module.exports = router;
