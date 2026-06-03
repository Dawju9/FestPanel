import { useState, useEffect } from 'react';
import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';

export async function getServerSideProps(context) { return requireAuth(context); }

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetch('/api/notes').then(r => r.json()).then(setNotes); }, []);

  const saveNote = async () => {
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch('/api/notes', { 
      method, headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(editingId ? {...form, id: editingId} : form)
    });
    setNotes(await res.json());
    setForm({ title: '', content: '', category: '' });
    setEditingId(null);
  };

  const deleteNote = async (id) => {
    const res = await fetch('/api/notes', { 
      method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id})
    });
    setNotes(await res.json());
  };

  const groups = notes.reduce((acc, note) => {
    acc[note.category] = acc[note.category] || [];
    acc[note.category].push(note);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: '24px' }}>Notes</h1>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }} />
        <textarea placeholder="Content" value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }} />
        <button onClick={saveNote} style={{ padding: '8px 16px', background: '#D32F2F', color: '#fff', border: 'none', borderRadius: '4px' }}>{editingId ? 'Update' : 'Add'} Note</button>
      </div>

      {Object.entries(groups).map(([cat, notesInCat]) => (
        <div key={cat} style={{ marginBottom: '24px' }}>
          <h2>{cat}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {notesInCat.map(n => (
              <div key={n.id} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h3>{n.title}</h3>
                <p>{n.content}</p>
                <button onClick={() => {setEditingId(n.id); setForm(n);}}>Edit</button>
                <button onClick={() => deleteNote(n.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </AdminLayout>
  );
}
