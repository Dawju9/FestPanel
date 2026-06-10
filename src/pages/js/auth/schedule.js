import { useState, useEffect } from 'react';
import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';
import { Clock, CheckCircle, AlertCircle, Terminal, Play } from 'lucide-react';
import fs from 'fs/promises';
import path from 'path';

export async function getServerSideProps(context) {
  const auth = await requireAuth(context);
  
  let taskConfig = { tasks: {} };
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'tasks_config.json'), 'utf8');
    taskConfig = JSON.parse(data);
  } catch (e) {
    console.error(e);
  }

  return { props: { ...auth.props, taskConfig } };
}

export default function Schedule({ taskConfig: initialTaskConfig }) {
  const [data, setData] = useState(null);
  const [taskConfig, setTaskConfig] = useState(initialTaskConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedule')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const runTask = async (taskId) => {
    await fetch('/api/tasks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
    });
    alert(`Task ${taskId} triggered`);
  };

  if (loading) {
    return <AdminLayout>Loading schedule...</AdminLayout>;
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
          Harmonogram Automatyzacji
        </h1>
        <p style={{ color: '#666' }}>Zarządzaj i monitoruj zaplanowane zadania crawlera i testów.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Status Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Clock size={24} color="#D32F2F" />
            <h2 style={{ fontSize: '18px', margin: 0 }}>Ostatnie Uruchomienie</h2>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>{data.lastRun}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <CheckCircle size={16} color="#388E3C" />
            <span>Wszystkie systemy sprawne</span>
          </div>
        </div>

        {/* Cron Info Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Terminal size={24} color="#D32F2F" />
            <h2 style={{ fontSize: '18px', margin: 0 }}>Konfiguracja Cron</h2>
          </div>
          <code style={{ display: 'block', background: '#f5f5f5', padding: '12px', borderRadius: '8px', fontSize: '14px', wordBreak: 'break-all' }}>
            {data.cronInfo}
          </code>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>
            Zadanie uruchamia się co 6 godzin (0, 6, 12, 18).
          </p>
        </div>
      </div>

      <div style={{ marginTop: '32px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Task Hopper</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(taskConfig.tasks).map(([taskId, config]) => (
            <div key={taskId} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ textTransform: 'capitalize' }}>{taskId}</strong>
                <div style={{ fontSize: '13px', color: '#666' }}>Frequency: {config.frequency}</div>
              </div>
              <button 
                onClick={() => runTask(taskId)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#D32F2F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                <Play size={16} /> Run Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
