const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/firebaseAuth');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');

// add lecture to course
router.post('/:courseId', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type, title, content, questions } = req.body;
    if (!type || !title) return res.status(400).json({ message: 'Missing fields' });
    const me = await User.findOne({ $or: [{ firebaseUid: req.firebaseUser.uid }, { email: req.firebaseUser.email }] }).exec();
    if (!me) return res.status(403).json({ message: 'User not registered on backend. Call /auth/firebase first.' });
    const course = await Course.findById(courseId).exec();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.instructorId.equals(me._id)) return res.status(403).json({ message: 'Only course owner can add lectures' });
    const lecture = { type, title, content: content || '', questions: questions || [] };
    course.lectures.push(lecture);
    await course.save();
    const added = course.lectures[course.lectures.length - 1];
    // normalize response
    const out = added.toObject ? added.toObject() : added;
    out.id = out._id || out.id || null;
    res.json(out);
  } catch (err) {
    console.error('Error adding lecture:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// view lecture
router.get('/view/:courseId/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const course = await Course.findById(courseId).lean().exec();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const lecture = (course.lectures || []).find(l => String(l._id || l.id) === String(lectureId));
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    // normalize id
    lecture.id = lecture._id || lecture.id || null;
    res.json(lecture);
  } catch (err) {
    console.error('Error viewing lecture:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// submit quiz attempt
router.post('/attempt/:courseId/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { answers } = req.body; // answers: [{questionIndex:0, answerIndex:1}, ...]
    const course = await Course.findById(courseId).lean().exec();
    if(!course) return res.status(404).json({ message: 'Course not found' });
    const lecture = (course.lectures || []).find(l => String(l._id || l.id) === String(lectureId));
    if(!lecture) return res.status(404).json({ message: 'Lecture not found' });
    if(lecture.type !== 'quiz') return res.status(400).json({ message: 'Not a quiz' });

    // grade robustly
    let correct = 0;
    const total = (lecture.questions || []).length;
    (lecture.questions || []).forEach((q, idx) => {
      const ansObj = (answers || []).find(a => Number(a.questionIndex) === idx);
      // attempt to get correct index from multiple possible fields
      const correctIndex = (q && (q.correctAnswerIndex ?? q.correctIndex ?? q.correct)) ?? null;
      if(correctIndex === null || correctIndex === undefined) return; // can't grade this question
      const submitted = ansObj && (ansObj.answerIndex !== null && ansObj.answerIndex !== undefined) ? Number(ansObj.answerIndex) : null;
      if(submitted !== null && Number(submitted) === Number(correctIndex)) correct++;
    });
    const score = total > 0 ? Math.round((correct/total)*100) : 0;
    const passed = score >= 70;

    // update progress if passed
    const me = await User.findOne({ $or: [{ firebaseUid: req.firebaseUser.uid }, { email: req.firebaseUser.email }] }).exec();
    if(!me) return res.status(403).json({ message: 'User not registered on backend.' });

    let userProgress = await Progress.findOne({ userId: me._id, courseId }).exec();
    if(!userProgress){
      userProgress = new Progress({ userId: me._id, courseId, completedLectureIds: [] });
    }
    // ensure lectureId stored as string
    const lectureIdStr = String(lectureId);
    if(passed && !userProgress.completedLectureIds.map(String).includes(lectureIdStr)){
      userProgress.completedLectureIds.push(lectureIdStr);
      await userProgress.save();
    } else {
      // if new progress document, save it
      if(!userProgress._id) await userProgress.save();
    }

    res.json({ score, passed, correct, total });
  } catch (err) {
    console.error('Error attempting quiz:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
