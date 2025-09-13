// frontend/src/components/CourseView.js
import React, { useState, useEffect } from 'react';
import { getCourse, getProgress, addLecture } from '../api';
import LectureModal from './LectureModal';
import LecturePane from './LecturePane';

export default function CourseView({ id, user }) {
  const [course, setCourse] = useState(null);
  const [selectedLectureIndex, setSelectedLectureIndex] = useState(0);
  const [progress, setProgress] = useState({ completedLectureIds: [] });
  const [showModal, setShowModal] = useState(false);

  useEffect(()=>{ (async ()=>{ 
    if(!user) return;
    try{
      const c = await getCourse(user.idToken, id);
      c.lectures = (c.lectures || []).map(l => ({ ...l, id: l._id || l.id }));
      setCourse(c);
      const p = await getProgress(user.idToken, id);
      setProgress(p || { completedLectureIds: [] });
    }catch(e){ console.error(e); }
  })(); }, [id, user]);

  async function refreshCourse(){
    const c = await getCourse(user.idToken, id);
    c.lectures = (c.lectures || []).map(l => ({ ...l, id: l._id || l.id }));
    setCourse(c);
    const p = await getProgress(user.idToken, id);
    setProgress(p || { completedLectureIds: [] });
  }

  if(!course) return <div>Loading...</div>;
  const lectures = course.lectures || [];
  const completed = progress?.completedLectureIds?.map(String) || [];
  const total = lectures.length, done = completed.length, pct = total ? Math.round((done/total)*100) : 0;

  const canOpen = (idx) => {
    if(idx === 0) return true;
    const prevId = String(lectures[idx-1].id);
    return completed.includes(prevId);
  };

  return (
    <div>
      <h3>{course.title}</h3>
      <p className="small">{course.description}</p>

      <div style={{marginBottom:12}}>
        <div className="small">Progress: {done}/{total} lectures</div>
        <div className="progressBar"><div className="progressFill" style={{width:`${pct}%`}}></div></div>
      </div>

      {user?.role === 'Instructor' && <button onClick={()=>setShowModal(true)}>➕ Add Lecture</button>}

      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <h4>Lectures</h4>
          {lectures.map((l, idx) => (
            <div key={l.id} className="card">
              <b>{idx+1}. {l.title}</b>
              <p className="small">{l.type}</p>
              <p className="small">Status: {completed.includes(String(l.id)) ? 'Completed' : (canOpen(idx) ? 'Unlocked' : 'Locked')}</p>
              <button disabled={!canOpen(idx)} onClick={()=>setSelectedLectureIndex(idx)}>Open</button>
            </div>
          ))}
        </div>

        <div style={{flex:2}}>
          {lectures[selectedLectureIndex] && <LecturePane course={course} lecture={lectures[selectedLectureIndex]} user={user} onProgressUpdate={refreshCourse} />}
        </div>
      </div>

      {showModal && 
        <LectureModal 
          onClose={()=>setShowModal(false)} 
          onSave={async (data)=>{
            try{
              await addLecture(user.idToken, id, data);
              await refreshCourse();
              setShowModal(false);
            } catch(err){
              console.error('Failed to add lecture', err);
              alert('Failed to add lecture: ' + (err.message || err));
            }
          }} 
        />
      }
    </div>
  );
}
