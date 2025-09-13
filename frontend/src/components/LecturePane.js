// frontend/src/components/LecturePane.js
import React, { useState } from 'react';
import { completeReading, attemptQuiz } from '../api';

export default function LecturePane({ course, lecture, user, onProgressUpdate }) {
  const [attemptResult, setAttemptResult] = useState(null);

  async function viewReading(){
    try{
      await completeReading(user.idToken, course.id, lecture.id || lecture._id);
      alert('Marked as complete');
      await onProgressUpdate();
      try{ window.dispatchEvent(new Event('progress-changed')); }catch(_e){}
    } catch(err){
      console.error(err);
      alert('Failed to mark reading: ' + (err.message || err));
    }
  }

  async function submitQuiz(e){
    e.preventDefault();
    const form = e.target;
    const answers = [];
    (lecture.questions || []).forEach((q, idx) => {
      const el = form[`q-${idx}`];
      const val = el ? el.value : null;
      answers.push({ questionIndex: idx, answerIndex: val === null ? null : parseInt(val,10) });
    });
    try{
      const res = await attemptQuiz(user.idToken, course.id, lecture.id || lecture._id, answers);
      setAttemptResult(res);
      await onProgressUpdate();
      try{ window.dispatchEvent(new Event('progress-changed')); }catch(_e){}
    } catch(err){
      console.error(err);
      alert('Failed to submit quiz: ' + (err.message || err));
    }
  }

  if(lecture.type === 'reading'){
    return (
      <div className="LecturePane">
        <h4>{lecture.title}</h4>
        <p>{lecture.content}</p>
        <button onClick={viewReading}>Marked as complete</button>
      </div>
    );
  } else if(lecture.type === 'quiz'){
    return (
      <div className="LecturePane">
        <h4>{lecture.title}</h4>
        <form onSubmit={submitQuiz}>
          {(lecture.questions || []).map((q, idx) => (
            <div key={idx} style={{marginBottom:12}}>
              <div><b>{idx+1}. {q.text}</b></div>
              {(q.options || []).map((opt, i) => (
                <div key={i}>
                  <label>
                    <input type="radio" name={`q-${idx}`} value={i} defaultChecked={i===0} />
                    {' '}{opt}
                  </label>
                </div>
              ))}
            </div>
          ))}
          <button type="submit">Submit Quiz</button>
        </form>
        {attemptResult && <div style={{marginTop:10}}><b>Score:</b> {attemptResult.score}% - {attemptResult.passed ? '✅ Passed' : '❌ Failed'}</div>}
      </div>
    );
  } else {
    return <div>Unknown lecture type</div>;
  }
}
