import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

export default function Crawler() {
  return (
    <AdminLayout>
        <div>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
              Crawler Control Panel
            </h1>
            <p style={{ color: '#666', fontSize: '15px' }}>
              Manage crawler settings, start/stop, and view status.
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '24px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>
                  Crawler Status
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#4CAF50',
                  }} />
                  <span style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 600 }}>Running</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  padding: '10px 24px',
                  background: '#D32F2F',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  Start Crawler
                </button>
                <button style={{
                  padding: '10px 24px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                  Stop
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}>
              {[
                { label: 'Last Run', value: '2 minutes ago' },
                { label: 'Cycle Duration', value: '45 seconds' },
                { label: 'Results Found', value: '3 new' },
                { label: 'Queries Used', value: '8' },
                { label: 'Sites Scraped', value: '6' },
                { label: 'Next Run', value: '~4 hours' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#f9f9f9',
                  padding: '16px',
                  borderRadius: '8px',
                }}>
                  <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{stat.label}</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>
                Crawler Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                    Interval (hours)
                  </label>
                  <input type="number" defaultValue={4} style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                    Max Results per Query
                  </label>
                  <input type="number" defaultValue={15} style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                    Discord Webhook URL
                  </label>
                  <input type="text" placeholder="https://discord.com/api/webhooks/..." style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }} />
                </div>
                <button style={{
                  padding: '12px',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '8px',
                }}>
                  Save Settings
                </button>
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>
                Recent Crawler Output
              </h3>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.8' }}>
                <p style={{ color: '#4CAF50' }}>[2026-05-16 10:30:01] 🚀 Crawler started</p>
                <p style={{ color: '#2196F3' }}>[2026-05-16 10:30:02] 🔍 Searching: Zlecę położenie paneli podłogowych</p>
                <p style={{ color: '#2196F3' }}>[2026-05-16 10:30:05] 🔍 Searching: Zlecę układanie paneli</p>
                <p style={{ color: '#4CAF50' }}>[2026-05-16 10:30:08] ✅ Found: 1 new result</p>
                <p style={{ color: '#2196F3' }}>[2026-05-16 10:30:10] 🔍 Searching: potrzebny montaż paneli podłogowych</p>
                <p style={{ color: '#4CAF50' }}>[2026-05-16 10:30:15] ✅ Found: 2 new results</p>
                <p style={{ color: '#FF9800' }}>[2026-05-16 10:30:20] 💾 Saved to Excel: nowe_zlecenia_20260516_1030.xlsx</p>
                <p style={{ color: '#4CAF50' }}>[2026-05-16 10:30:21] 🎉 Total new: 3</p>
                <p style={{ color: '#888' }}>[2026-05-16 10:30:22] 💤 Waiting 4 hours until next run...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
  );
}