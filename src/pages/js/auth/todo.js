import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';
import { useState, useEffect } from 'react';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

const defaultTasks = [
  { id: 1, title: 'Review new crawler results', priority: 'high', done: false },
  { id: 2, title: 'Update search keywords list', priority: 'medium', done: false },
  { id: 3, title: 'Check Discord webhook is working', priority: 'high', done: false },
  { id: 4, title: 'Add new site: zleceniomat.pl', priority: 'low', done: true },
  { id: 5, title: 'Optimize Google search delay settings', priority: 'medium', done: true },
];

export default function Todo() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('festpanel-tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks(defaultTasks);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('festpanel-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      return;
    }
    setTasks([...tasks, {
      id: Date.now(),
      title: newTitle,
      priority: newPriority,
      done: false,
    }]);
    setNewTitle('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filtered = filter === 'all' ? tasks :
    filter === 'active' ? tasks.filter(t => !t.done) :
    tasks.filter(t => t.done);

  const priorityColors = { high: '#D32F2F', medium: '#F57C00', low: '#388E3C' };

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
            To Do List
          </h1>
          <p style={{ color: '#666', fontSize: '15px' }}>
            Manage crawler tasks and maintenance items.
          </p>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px',
        }}>
          <form onSubmit={addTask} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                New Task
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter task description..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                style={{
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button type="submit" style={{
              padding: '10px 24px',
              background: '#D32F2F',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              height: '42px',
            }}>
              Add Task
            </button>
          </form>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            gap: '8px',
          }}>
            {['all', 'active', 'done'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: 'none',
                background: filter === f ? '#1a1a1a' : '#f0f0f0',
                color: filter === f ? '#ffffff' : '#666',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}>
                {f}
              </button>
            ))}
          </div>

          {filtered.map(t => (
            <div key={t.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 24px',
              borderBottom: '1px solid #f0f0f0',
              background: t.done ? '#fafafa' : '#ffffff',
              transition: 'background 0.2s',
            }}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleTask(t.id)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#D32F2F' }}
              />
              <span style={{
                flex: 1,
                fontSize: '15px',
                color: t.done ? '#777' : '#1a1a1a',
                fontWeight: t.done ? '400' : '500',
                textDecoration: t.done ? 'line-through' : 'none',
              }}>
                {t.title}
              </span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: `${priorityColors[t.priority]}15`,
                color: priorityColors[t.priority],
                border: `1px solid ${priorityColors[t.priority]}30`,
              }}>
                {t.priority}
              </span>
              <button onClick={() => deleteTask(t.id)} style={{
                padding: '6px 12px',
                border: '1px solid #ffcccc',
                borderRadius: '6px',
                background: '#fff5f5',
                color: '#D32F2F',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}>
                Delete
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#999' }}>
              No tasks found.
            </div>
          )}

          <div style={{
            padding: '12px 24px',
            borderTop: '1px solid #f0f0f0',
            fontSize: '13px',
            color: '#999',
          }}>
            {tasks.filter(t => !t.done).length} active / {tasks.length} total
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}