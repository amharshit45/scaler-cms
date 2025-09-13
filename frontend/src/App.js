// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
         createUserWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged } from 'firebase/auth';
import { registerWithBackend, listCourses } from './api';

import AuthForm from './components/AuthForm';
import CourseList from './components/CourseList';
import { listMyLearning, myProgressMap } from './api';
import CreateCourse from './components/CreateCourse';
import InstructorCourses from './components/InstructorCourses';
import CourseView from './components/CourseView';

function App(){
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('authUser');
      return saved ? JSON.parse(saved) : null;
    } catch(e){ return null; }
  });
  const [page, setPage] = useState('home');
  const [courses, setCourses] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [myLearning, setMyLearning] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  const loadCourses = useCallback(async (idToken) => {
    try{
      if(!idToken) return;
      const data = await listCourses(idToken);
      setCourses(data);
    }catch(e){ console.error(e); }
  }, []);

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if(!fbUser){
        localStorage.removeItem('authUser');
        localStorage.removeItem('backendUser');
        setUser(null);
        setCourses([]);
        return;
      }
      try{
        const idToken = await fbUser.getIdToken();
        const savedBackend = localStorage.getItem('backendUser');
        const savedRole = savedBackend ? JSON.parse(savedBackend).role : localStorage.getItem('savedRole');
        const bodyRole = savedRole || undefined;
        const res = await registerWithBackend(idToken, bodyRole);
        const backendUser = res.user || (savedBackend ? JSON.parse(savedBackend) : null);
        const info = { name: fbUser.displayName || fbUser.email, email: fbUser.email, role: backendUser?.role || bodyRole || 'Student', idToken };
        localStorage.setItem('authUser', JSON.stringify(info));
        if(backendUser) localStorage.setItem('backendUser', JSON.stringify(backendUser));
        setUser(info);
        await loadCourses(idToken);
      }catch(e){
        console.error('Failed to restore backend session', e);
      }
    });
    return () => unsub();
  }, [loadCourses]);

  useEffect(()=>{ if(user) loadCourses(user.idToken); }, [user, loadCourses]);
  useEffect(()=>{ (async()=>{ if(user){ try{ const [mine, pmap] = await Promise.all([listMyLearning(user.idToken), myProgressMap(user.idToken)]); setMyLearning(mine||[]); setProgressMap(pmap||{});}catch(e){console.error(e);} } else { setMyLearning([]); setProgressMap({});} })(); }, [user]);
  useEffect(()=>{ const handler = ()=>{ (async()=>{ if(user){ try{ const pmap = await myProgressMap(user.idToken); setProgressMap(pmap||{});}catch(e){console.error(e);} } })(); }; window.addEventListener('progress-changed', handler); return ()=> window.removeEventListener('progress-changed', handler); }, [user]);

  function saveAuthAndBackend(userObj, backendUser){
    localStorage.setItem('authUser', JSON.stringify(userObj));
    if(backendUser) localStorage.setItem('backendUser', JSON.stringify(backendUser));
    localStorage.setItem('savedRole', userObj.role);
  }

  function getInitials(nameOrEmail){
    if(!nameOrEmail) return 'U';
    const parts = String(nameOrEmail).trim().split(/\s+/).filter(Boolean);
    if(parts.length === 1){
      const s = parts[0];
      const letters = s.replace(/[^a-zA-Z]/g,'');
      return (letters.slice(0,2) || s.slice(0,2)).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  }

 async function handleEmailRegister(name, email, password, role){
  try{
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // modular API - use updateProfile imported from 'firebase/auth'
    await updateProfile(cred.user, { displayName: name });

    const idToken = await cred.user.getIdToken();
    const res = await registerWithBackend(idToken, role);
    const backendUser = res.user;
    const info = { name: cred.user.displayName || name, email: cred.user.email, role: backendUser?.role || role, idToken };
    saveAuthAndBackend(info, backendUser);
    setUser(info);
    setPage('home');
  } catch(e){ console.error(e); alert(e.message); }
}


  async function handleEmailLogin(email, password, role){
    try{
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const res = await registerWithBackend(idToken, role);
      const backendUser = res.user;
      const info = { name: cred.user.displayName || cred.user.email, email: cred.user.email, role: backendUser?.role || role, idToken };
      saveAuthAndBackend(info, backendUser);
      setUser(info);
      setPage('home');
    } catch(e){ console.error(e); alert(e.message); }
  }

  async function handleGoogleLogin(role){
    try{
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await registerWithBackend(idToken, role);
      const backendUser = res.user;
      const info = { name: result.user.displayName, email: result.user.email, role: backendUser?.role || role, idToken };
      saveAuthAndBackend(info, backendUser);
      setUser(info);
      setPage('home');
    } catch(e){ console.error(e); alert(e.message); }
  }

  function logout(){
    signOut(auth);
    localStorage.removeItem('authUser');
    localStorage.removeItem('backendUser');
    localStorage.removeItem('savedRole');
    setUser(null);
    setMenuOpen(false);
    setPage('home');
  }

  const userInitials = user ? getInitials(user.name || user.email) : '';

  return (
    <div className="container">
      <div className="header">
        <h2>Scalar CMS</h2>
        <div className="nav">
          <button className={page==='student.courses' ? 'active' : ''} onClick={()=>setPage('student.courses')}>Courses</button>
          {user && user.role === 'Instructor' && <>
            <button className={page==='instructor.create' ? 'active' : ''} onClick={()=>setPage('instructor.create')}>Create Course</button>
            <button className={page==='instructor.mycourses' ? 'active' : ''} onClick={()=>setPage('instructor.mycourses')}>My Courses</button>
          </>}
          <button className={page==='home' ? 'active' : ''} onClick={()=>setPage('home')}>Home</button>
        </div>
        <div className="actions">
          {user ? (
            <div className="userBox" tabIndex={0} onBlur={(e)=>{ if(!e.currentTarget.contains(e.relatedTarget)) setMenuOpen(false); }}>
              <button className="avatarBtn" onClick={()=> setMenuOpen(v=>!v)} aria-haspopup="menu" aria-expanded={menuOpen}>
                <span className="avatarInitials">{userInitials}</span>
              </button>
              {menuOpen && (
                <div className="userMenu">
                  <div className="userMenuHeader">
                    <div className="avatarSmall">{userInitials}</div>
                    <div>
                      <div className="userName">{user.name}</div>
                      <div className="userEmail small">{user.email}</div>
                    </div>
                  </div>
                  <button className="menuItem" disabled={user.role !== 'Instructor'} onClick={()=>{ setPage('instructor.mycourses'); setMenuOpen(false); }}>Instructor Dashboard</button>
                  <div className="menuDivider"></div>
                  <button className="menuItem danger" onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : <>
            <button onClick={()=>setPage('login')}>Login</button>
            <button onClick={()=>setPage('register')}>Register</button>
          </>}
        </div>
      </div>

      {page === 'home' && <>
        <div className="hero">
          <h1>Welcome to <span className="brand">Scalar CMS</span></h1>
          <p className="lead">A modern online learning platform for instructors and students. Create, teach, learn, and track your progress—all in one place.</p>
          <div className="actions">
            <button className="primaryBtn" onClick={()=> setPage('student.courses')}>Browse Courses</button>
            <button className="outlineBtn" onClick={()=> setPage('instructor.mycourses')} disabled={!user || user.role !== 'Instructor'}>Instructor Dashboard</button>
          </div>
        </div>
      </>}

      {page === 'login' && <div className="centerScreen"><AuthForm mode="login" onEmailLogin={handleEmailLogin} onGoogleLogin={handleGoogleLogin} /></div> }
      {page === 'register' && <div className="centerScreen"><AuthForm mode="register" onEmailRegister={handleEmailRegister} onGoogleLogin={handleGoogleLogin} /></div> }

      {page === 'instructor.create' && user?.role === 'Instructor' && <CreateCourse user={user} onCreated={()=>{ loadCourses(user.idToken); setPage('instructor.mycourses'); }} />}

      {page === 'instructor.mycourses' && user?.role === 'Instructor' && <InstructorCourses user={user} onOpen={(id)=> setPage('course.view:'+id)} />}

      {page.startsWith('course.view:') && <CourseView id={page.split(':')[1]} user={user} />}

      {page === 'student.courses' && (
        <CourseList
          courses={courses}
          onView={(id)=> setPage('course.view:'+id)}
          completedCourseIds={new Set(courses.filter(c => (progressMap[String(c.id)] || 0) >= (c.lecturesCount || 0) && (c.lecturesCount || 0) > 0).map(c => String(c.id)))}
        />
      )}
      {page === 'my.learning' && <CourseList courses={myLearning} onView={(id)=> setPage('course.view:'+id)} />}

    </div>
  );
}

export default App;
