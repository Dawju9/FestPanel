import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';
import { useSession } from 'next-auth/react';
import fs from 'fs/promises';
import path from 'path';

export async function getServerSideProps(context) {
  const auth = await requireAuth(context);

  // Read submissions
  let submissions = [];
  try {
    const filePath = path.join(process.cwd(), 'data', 'submissions.json');
    const data = await fs.readFile(filePath, 'utf8');
    submissions = JSON.parse(data).reverse(); // Newest first
  } catch (e) {
    // No submissions yet
    console.error(e);
  }

  // Read analytics
  let analytics = { pageViews: 0, buttonClicks: {}, ulotkaTouches: 0 };
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'analytics.json'), 'utf8');
    analytics = JSON.parse(data);
  } catch (e) {
    console.error(e);
  }

  let activeViewers = 0;
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'active_sessions.json'), 'utf8');
    activeViewers = Object.keys(JSON.parse(data)).length;
  } catch (e) {
    console.error(e);
  }

  return {
    props: {
      ...auth.props,
      submissions,
      analytics,
      activeViewers
    },
  };
}

export default function Dashboard({ submissions, analytics, activeViewers }) {
  const { data: session } = useSession();
  const stats = [
    { label: 'Page Views', value: analytics.pageViews, icon: '👁️', color: 'var(--color-primary)' },
    { label: 'Ulotka Touches', value: analytics.ulotkaTouches, icon: '📄', color: '#1976D2' },
    { label: 'Active Viewers', value: activeViewers, icon: '👤', color: '#388E3C' },
    { label: 'Button Clicks', value: Object.values(analytics.buttonClicks).reduce((a, b) => a + b, 0), icon: '🖱️', color: '#F57C00' },
  ];

  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-light)', fontSize: '15px' }}>
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
                background: 'var(--surface, var(--bg-color))',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: `4px solid ${stat.color}`,
                border: '1px solid var(--border-color)',
                borderLeftWidth: '4px',
                color: 'var(--color-text)',
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
                  color: 'var(--color-text)',
                  marginBottom: '4px',
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--surface, var(--bg-color))',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            marginBottom: '24px',
            color: 'var(--color-text)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '16px' }}>
              Form Submissions
            </h3>
            {submissions.length === 0 ? (
                <p style={{ color: 'var(--color-text-light)' }}>No submissions yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {submissions.map((sub, i) => (
                        <div key={i} style={{
                            padding: '12px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                        }}>
                            <div style={{ fontWeight: 600 }}>{sub.name} ({sub.email})</div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>Tel: {sub.phone} | Metraż: {sub.metrage}m2</div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>
                              Usługi: {sub.prepServices ? 'Przygotowanie, ' : ''}{sub.baseboards ? 'Listwy' : ''}
                            </div>
                            <div style={{ marginTop: '8px' }}>{sub.message}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', opacity: 0.7, marginTop: '8px' }}>{new Date(sub.createdAt).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </AdminLayout>
  );
}