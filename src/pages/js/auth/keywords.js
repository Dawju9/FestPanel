import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';
import { useState } from 'react';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

const initialKeywords = [
  { keyword: 'Zlecę położenie paneli podłogowych', hits: 24, lastRun: '2026-05-16', status: 'active' },
  { keyword: 'Zlecę układanie paneli', hits: 18, lastRun: '2026-05-16', status: 'active' },
  { keyword: 'potrzebny montaż paneli podłogowych', hits: 12, lastRun: '2026-05-16', status: 'active' },
  { keyword: 'skręcanie podłóg zlecę', hits: 5, lastRun: '2026-05-15', status: 'active' },
  { keyword: 'zlecę panele winylowe OR montaż paneli PCV', hits: 20, lastRun: '2026-05-16', status: 'active' },
  { keyword: 'przygotowanie podłoża pod panele zlecę', hits: 7, lastRun: '2026-05-15', status: 'active' },
  { keyword: '"zlecę położenie paneli" OR "układanie paneli zlecę"', hits: 15, lastRun: '2026-05-16', status: 'active' },
  { keyword: 'zlecę cyklinowanie podłóg', hits: 9, lastRun: '2026-05-14', status: 'paused' },
];

export default function Keywords() {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) {
      return;
    }
    setKeywords([...keywords, {
      keyword: newKeyword,
      hits: 0,
      lastRun: '-',
      status: 'active',
    }]);
    setNewKeyword('');
  };

  const toggleStatus = (idx) => {
    setKeywords(keywords.map((k, i) =>
      i === idx ? { ...k, status: k.status === 'active' ? 'paused' : 'active' } : k
    ));
  };

  const deleteKeyword = (idx) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
            Keywords & Statistics
          </h1>
          <p style={{ color: '#666', fontSize: '15px' }}>
            Manage search keywords and track performance.
          </p>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px',
        }}>
          <form onSubmit={addKeyword} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Enter new keyword or phrase..."
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <button type="submit" style={{
              padding: '12px 24px',
              background: '#D32F2F',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Add Keyword
            </button>
          </form>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }} className="admin-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                {['Keyword', 'Total Hits', 'Last Run', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '14px 16px',
                    fontWeight: 600,
                    color: '#666',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keywords.map((k, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: '#333' }}>{k.keyword}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#D32F2F' }}>{k.hits}</td>
                  <td style={{ padding: '14px 16px', color: '#666' }}>{k.lastRun}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: k.status === 'active' ? '#E8F5E9' : '#FFF3E0',
                      color: k.status === 'active' ? '#388E3C' : '#F57C00',
                    }}>
                      {k.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggleStatus(i)} style={{
                        padding: '4px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        background: 'transparent',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#666',
                      }}>
                        {k.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button onClick={() => deleteKeyword(i)} style={{
                        padding: '4px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        background: 'transparent',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#D32F2F',
                      }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginTop: '24px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#D32F2F' }}>{keywords.filter(k => k.status === 'active').length}</p>
            <p style={{ fontSize: '13px', color: '#666' }}>Active Keywords</p>
          </div>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#1976D2' }}>{keywords.reduce((sum, k) => sum + k.hits, 0)}</p>
            <p style={{ fontSize: '13px', color: '#666' }}>Total Hits</p>
          </div>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#388E3C' }}>{keywords.filter(k => k.lastRun === '2026-05-16').length}</p>
            <p style={{ fontSize: '13px', color: '#666' }}>Run Today</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}