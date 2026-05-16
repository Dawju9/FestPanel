import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';
import { useSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

export default function Dashboard() {
  const { data: session } = useSession();
  const stats = [
    { label: 'Total Crawls', value: '1,247', icon: '🕷️', color: '#D32F2F' },
    { label: 'Results Found', value: '89', icon: '📋', color: '#1976D2' },
    { label: 'Active Keywords', value: '8', icon: '🔑', color: '#388E3C' },
    { label: 'Pending Tasks', value: '3', icon: '✅', color: '#F57C00' },
    { label: 'Events Today', value: '12', icon: '📊', color: '#7B1FA2' },
    { label: 'Hit Rate', value: '7.2%', icon: '🎯', color: '#C62828' },
  ];

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '15px' }}>
            Welcome back, {session?.user?.name || 'Admin'}. Here's your crawler overview.
          </p>
        </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}>
            {stats.map((stat, i) => (
              <div key={i} style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${stat.color}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                </div>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#1a1a1a',
                  marginBottom: '4px',
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '13px', color: '#666' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>
                Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[{ time: '2 min ago', msg: 'Crawler completed search cycle' },
                  { time: '15 min ago', msg: 'New result: Panele winylowe - Warszawa' },
                  { time: '1 hour ago', msg: 'Keyword "zlecę położenie paneli" processed' },
                  { time: '3 hours ago', msg: 'Crawler started successfully' },
                  { time: '5 hours ago', msg: '3 new results saved to Excel' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none',
                  }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>{item.msg}</span>
                    <span style={{ fontSize: '12px', color: '#999' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="/js/auth/crawler" style={{
                  display: 'block',
                  padding: '12px 16px',
                  background: '#D32F2F',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  Run Crawler Now
                </a>
                <a href="/js/auth/results" style={{
                  display: 'block',
                  padding: '12px 16px',
                  background: '#f5f5f5',
                  color: '#333',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  View Latest Results
                </a>
                <a href="/js/auth/todo" style={{
                  display: 'block',
                  padding: '12px 16px',
                  background: '#f5f5f5',
                  color: '#333',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  Manage Tasks
                </a>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
  );
}