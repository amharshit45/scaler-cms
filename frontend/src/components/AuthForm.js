// frontend/src/components/AuthForm.js
import React, { useState } from 'react';

export default function AuthForm({ mode, onEmailRegister, onEmailLogin, onGoogleLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');

  async function submit(e){
    e.preventDefault();
    if(mode === 'register'){
      await onEmailRegister(name, email, password, role);
    } else {
      await onEmailLogin(email, password, role);
    }
  }

  return (
    <form onSubmit={submit} className="authBox">
      {mode === 'register' && <>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} />
      </>}
      <label>Email</label>
      <input value={email} onChange={e=>setEmail(e.target.value)} />
      <label>Password</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <label>Role</label>
      <select value={role} onChange={e=>setRole(e.target.value)}>
        <option value="Student">Student</option>
        <option value="Instructor">Instructor</option>
      </select>
      <div style={{display:'flex', gap:8}}>
        <button type="submit">{mode === 'register' ? 'Register' : 'Login'}</button>
        <button type="button" className="googleButton" onClick={async ()=>{ await onGoogleLogin(role); }}>
          {mode==='register' ? 'Sign in with Google' : 'Sign in with Google'}
        </button>
      </div>
    </form>
  );
}
