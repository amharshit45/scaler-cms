// frontend/src/components/CourseList.js
import React from 'react';

export default function CourseList({ courses, onView, completedCourseIds = new Set() }) {
  return (
    <div>
      <h3>Courses</h3>
      <div className="courseGrid">
        {courses.map(c => {
          const isCompleted = completedCourseIds.has(String(c.id));
          return (
          <div key={c.id} className="courseCard">
            <div className="title">{c.title}</div>
            <div className="meta">
              <span>{c.description}</span>
              <span>• Lectures: {c.lecturesCount}</span>
            </div>
            <div className="cta">
              <span className="small">{isCompleted ? 'Completed' : 'Start course'}</span>
              <button className="start" onClick={()=>onView(c.id)}>{isCompleted ? 'View' : 'Start'}</button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
