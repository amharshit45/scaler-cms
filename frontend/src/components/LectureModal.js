// frontend/src/components/LectureModal.js
import React, { useState } from 'react';

export default function LectureModal({ onClose, onSave }) {
  const [type,setType] = useState('reading');
  const [title,setTitle] = useState('');
  const [content,setContent] = useState('');
  const [questions,setQuestions] = useState([]);

  function addQuestion(){ setQuestions(prev => [...prev,{ text:'', options:['',''], correctAnswerIndex:0 }]); }
  function updateQuestion(idx,field,value){ setQuestions(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], [field]: value }; return copy; }); }
  function updateOption(qIdx,oIdx,value){ setQuestions(prev => { const copy = [...prev]; copy[qIdx] = { ...copy[qIdx], options: copy[qIdx].options.map((o,i)=> i===oIdx ? value : o) }; return copy; }); }
  function addOption(qIdx){ setQuestions(prev => { const copy = [...prev]; copy[qIdx] = { ...copy[qIdx], options: [...copy[qIdx].options, ''] }; return copy; }); }

  function handleSubmit(e){
    e.preventDefault();
    if(type === 'reading'){
      onSave({ type, title, content });
    } else {
      // ensure numeric correctAnswerIndex
      const normalized = questions.map(q => ({ ...q, correctAnswerIndex: Number(q.correctAnswerIndex) }));
      onSave({ type, title, questions: normalized });
    }
  }

  return (
    <div className="modalOverlay">
      <div className="modal">
        <h3>Add Lecture</h3>
        <form onSubmit={handleSubmit}>
          <label>Type</label>
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option value="reading">Reading</option>
            <option value="quiz">Quiz</option>
          </select>

          <label>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} required/>

          {type === 'reading' && <>
            <label>Content</label>
            <textarea value={content} onChange={e=>setContent(e.target.value)} required/>
          </>}

          {type === 'quiz' && <>
            <div style={{marginTop:10}}>
              <button type="button" onClick={addQuestion}>➕ Add Question</button>
            </div>
            {questions.map((q, qi) => (
              <div key={qi} className="card" style={{marginTop:10}}>
                <label>Question</label>
                <input value={q.text} onChange={e=>updateQuestion(qi,'text',e.target.value)} required/>
                <div>
                  <label>Options</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{display:'flex',alignItems:'center',gap:6}}>
                      <input value={opt} onChange={e=>updateOption(qi,oi,e.target.value)} required />
                      <input type="radio" name={`correct-${qi}`} checked={Number(q.correctAnswerIndex)===oi} onChange={()=>updateQuestion(qi,'correctAnswerIndex',oi)} />
                      <span className="small">Correct</span>
                    </div>
                  ))}
                  <button type="button" onClick={()=>addOption(qi)}>➕ Add Option</button>
                </div>
              </div>
            ))}
          </>}

          <div style={{marginTop:16,display:'flex',gap:8}}>
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
