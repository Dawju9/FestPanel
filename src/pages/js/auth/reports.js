import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

const reportData = [
  { source: 'olx.pl', hits: 32, leads: 18, rate: '56%', avgSalary: '3200 zł', avgMeters: '42 m²' },
  { source: 'fixly.pl', hits: 28, leads: 14, rate: '50%', avgSalary: '3800 zł', avgMeters: '48 m²' },
  { source: 'oferteo.pl', hits: 15, leads: 8, rate: '53%', avgSalary: '4100 zł', avgMeters: '55 m²' },
  { source: 'zleca.pl', hits: 8, leads: 4, rate: '50%', avgSalary: '2900 zł', avgMeters: '35 m²' },
  { source: 'zleceniomat.pl', hits: 6, leads: 2, rate: '33%', avgSalary: '3500 zł', avgMeters: '40 m²' },
  { source: 'forum', hits: 11, leads: 5, rate: '45%', avgSalary: '2100 zł', avgMeters: '28 m²' },
];

const weekData = [
  { day: 'Mon', hits: 4 },
  { day: 'Tue', hits: 7 },
  { day: 'Wed', hits: 3 },
  { day: 'Thu', hits: 9 },
  { day: 'Fri', hits: 5 },
  { day: 'Sat', hits: 2 },
  { day: 'Sun', hits: 0 },
];

const maxHits = Math.max(...weekData.map(d => d.hits));

export default function Reports() {
  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
            Reports & Statistics
          </h1>
          <p style={{ color: '#666', fontSize: '15px' }}>
            Crawler performance, hit reports, and analytics overview.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {[
            { label: 'Total Hits', value: '100', color: '#D32F2F' },
            { label: 'Total Leads', value: '51', color: '#388E3C' },
            { label: 'Avg. Salary', value: '3,283 zł', color: '#1976D2' },
            { label: 'Conversion', value: '51%', color: '#7B1FA2' },
            { label: 'Active Days', value: '47', color: '#F57C00' },
            { label: 'Events Count', value: '1,247', color: '#C62828' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderTop: `3px solid ${stat.color}`,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '24px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '20px' }}>
              Hits This Week
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
              {weekData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '100%',
                    height: `${(d.hits / (maxHits || 1)) * 100}px`,
                    background: d.hits > 0 ? '#D32F2F' : '#f0f0f0',
                    borderRadius: '4px 4px 0 0',
                    minHeight: d.hits > 0 ? '8px' : '4px',
                    transition: 'height 0.3s ease',
                  }} />
                  <span style={{ fontSize: '11px', color: '#999' }}>{d.day}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#333' }}>{d.hits}</span>
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
              Event Log (Last 24h)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { event: 'Search Queries', count: 24, color: '#1976D2' },
                { event: 'New Results', count: 5, color: '#388E3C' },
                { event: 'Discord Notifications', count: 3, color: '#7B1FA2' },
                { event: 'Excel Exports', count: 1, color: '#F57C00' },
                { event: 'Errors', count: 1, color: '#D32F2F' },
              ].map((e, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                }}>
                  <span style={{ fontSize: '14px', color: '#333' }}>{e.event}</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: e.color }}>{e.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>
              Source Performance Report
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                {['Source', 'Hits', 'Leads', 'Conversion', 'Avg Salary', 'Avg Meters'].map(h => (
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
              {reportData.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#333' }}>{r.source}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontWeight: 700, color: '#D32F2F' }}>{r.hits}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#333' }}>{r.leads}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: '#E8F5E9',
                      color: '#388E3C',
                    }}>
                      {r.rate}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1976D2' }}>{r.avgSalary}</td>
                  <td style={{ padding: '14px 16px', color: '#666' }}>{r.avgMeters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}