// Prefer env-configurable API base for deployments; fallback to localhost for dev
const API = (process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.trim()) || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '');

export async function registerWithBackend(idToken, role){
  const res = await fetch(`${API}/auth/firebase`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ idToken, role })
  });
  return res.json();
}

export async function listCourses(idToken){
  const res = await fetch(`${API}/courses`, { headers: {'Content-Type':'application/json', 'Authorization':'Bearer ' + idToken }});
  return res.json();
}

export async function createCourse(idToken, payload){
  const res = await fetch(`${API}/courses`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken}, body: JSON.stringify(payload) });
  return res.json();
}

export async function getCourse(idToken, id){
  const res = await fetch(`${API}/courses/${id}`, { headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken} });
  return res.json();
}

export async function addLecture(idToken, courseId, payload){
  const res = await fetch(`${API}/lectures/${courseId}`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken}, body: JSON.stringify(payload) });
  return res.json();
}

export async function viewLecture(idToken, courseId, lectureId){
  const res = await fetch(`${API}/lectures/view/${courseId}/${lectureId}`, { headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken} });
  return res.json();
}

export async function completeReading(idToken, courseId, lectureId){
  const res = await fetch(`${API}/progress/complete/${courseId}/${lectureId}`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken} });
  return res.json();
}

export async function attemptQuiz(idToken, courseId, lectureId, answers){
  const res = await fetch(`${API}/lectures/attempt/${courseId}/${lectureId}`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken}, body: JSON.stringify({ answers }) });
  return res.json();
}

export async function getProgress(idToken, courseId){
  const res = await fetch(`${API}/progress/${courseId}`, { headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken}});
  return res.json();
}

export async function listMyLearning(idToken){
  const res = await fetch(`${API}/progress/mine/list`, { headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken}});
  return res.json();
}

export async function myProgressMap(idToken){
  const res = await fetch(`${API}/progress/mine/map`, { headers:{'Content-Type':'application/json','Authorization':'Bearer ' + idToken}});
  return res.json();
}
