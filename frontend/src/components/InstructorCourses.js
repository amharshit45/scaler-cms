// frontend/src/components/InstructorCourses.js
import React, { useState, useEffect } from 'react';
import { listCourses } from '../api';

export default function InstructorCourses({ user, onOpen }) {
  const [list, setList] = useState([]);
  useEffect(()=>{
    (async ()=>{
      if(!user) return;
      try{
        const all = await listCourses(user.idToken);
        const backendUser = JSON.parse(localStorage.getItem('backendUser') || '{}');
        const backendId = backendUser && (backendUser.id || backendUser._id) ? String(backendUser.id || backendUser._id) : '';
        const mine = all.filter(c => String(c.instructorId || '') === backendId);
        setList(mine);
      }catch(e){ console.error(e); }
    })();
  }, [user]);

  return (
    <div>
      <h3>My Courses</h3>
      <div className="courseGrid">
        {list.map(c => (
          <div key={c.id} className="courseCard">
            <div className="title">{c.title}</div>
            <div className="meta">
              <span>{c.description}</span>
              <span>• Lectures: {c.lecturesCount}</span>
            </div>
            <div className="cta">
              <span className="small">Manage</span>
              <button className="start" onClick={()=>onOpen(c.id)}>Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
