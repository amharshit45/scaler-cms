// backend/utils/seed.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/olp';

async function run(){
  await mongoose.connect(MONGO_URI);
  console.log('Connected');

  // create instructor
  let inst = await User.findOne({ email: 'alice@inst.com' });
  if(!inst) inst = await User.create({ firebaseUid: 'u-inst-1', name: 'Alice Instructor', email: 'alice@inst.com', role: 'Instructor' });

  let stud = await User.findOne({ email: 'bob@stud.com' });
  if(!stud) stud = await User.create({ firebaseUid: 'u-stu-1', name: 'Bob Student', email: 'bob@stud.com', role: 'Student' });

  // sample course
  let course = await Course.findOne({ title: 'Intro to Programming' });
  if(!course){
    course = await Course.create({
      title: 'Intro to Programming',
      description: 'Learn basics of programming',
      instructorId: inst._id,
      lectures: [
        { type: 'reading', title: 'Welcome', content: 'Welcome to the course!' },
        { type: 'quiz', title: 'Basics Quiz', questions: [
          { text: 'What is 1+1?', options: ['1','2','3','4'], correctAnswerIndex: 1 },
          { text: 'Which keyword declares a variable in JS?', options: ['var','let','const','all'], correctAnswerIndex: 3 }
        ]}
      ]
    });
  }

  console.log('Seed complete');
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
