import { useState, useEffect } from 'react';
import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';

export async function getServerSideProps(context) { return requireAuth(context); }

export default function Zlecenia() {
  const [zlecenia, setZlecenia] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchZlecenia = async () => {
    setLoading(true);
    const res = await fetch('/api/zlecenia');
    const data = await res.json();
    setZlecenia(data);
    setLoading(false);
  };

  const syncEmails = async () => {
    await fetch('/api/zlecenia', { method: 'POST' });
    fetchZlecenia();
  };

  useEffect(() => { fetchZlecenia(); }, []);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Zlecenia z Oferteo</h1>
        <button onClick={syncEmails} style={{ padding: '8px 16px', background: '#D32F2F', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Sync Emails
        </button>
      </div>
      
      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {zlecenia.map((z, i) => (
            <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{z.subject}</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>{new Date(z.date).toLocaleString()}</p>
              <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                {z.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
