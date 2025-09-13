// frontend/src/components/CreateCourse.js
import React, { useState } from 'react';
import { createCourse } from '../api';

export default function CreateCourse({ user, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function submit(e){
    e.preventDefault();
    try{
      const res = await createCourse(user.idToken, { title, description });
      if(res.id){ alert('Created'); onCreated(); } else alert(res.message || 'Error');
    }catch(e){ console.error(e); alert('Request failed'); }
  }

  return (
    <form onSubmit={submit}>
      <h3>Create Course</h3>
      <label>Title</label><input value={title} onChange={e=>setTitle(e.target.value)} />
      <label>Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} />
      <button type="submit">Create</button>
    </form>
  );
}
