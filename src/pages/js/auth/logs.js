import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

const logEntries = [
  { time: '10:30:01', level: 'info', msg: '🚀 Crawler started successfully' },
  { time: '10:30:02', level: 'info', msg: '🔍 Searching: Zlecę położenie paneli podłogowych' },
  { time: '10:30:03', level: 'debug', msg: 'GET https://www.google.com/search?q=Zlecę+położenie+paneli+podłogowych' },
  { time: '10:30:04', level: 'info', msg: '✅ Found 1 result on olx.pl' },
  { time: '10:30:05', level: 'info', msg: '🔍 Searching: Zlecę układanie paneli' },
  { time: '10:30:07', level: 'warn', msg: '⚠️ Rate limit approaching, sleeping 5s...' },
  { time: '10:30:12', level: 'info', msg: '✅ Found 0 new results' },
  { time: '10:30:13', level: 'info', msg: '🔍 Searching: potrzebny montaż paneli podłogowych' },
  { time: '10:30:15', level: 'info', msg: '✅ Found 2 results on fixly.pl, oferteo.pl' },
  { time: '10:30:18', level: 'info', msg: '🔍 Searching: zlecę panele winylowe OR montaż paneli PCV' },
  { time: '10:30:20', level: 'error', msg: '❌ Google returned 429 Too Many Requests' },
  { time: '10:30:21', level: 'warn', msg: '⚠️ Retrying after 30s delay...' },
  { time: '10:30:51', level: 'info', msg: '✅ Retry successful, found 1 result' },
  { time: '10:31:00', level: 'info', msg: '🔍 Searching: zlecę cyklinowanie podłóg' },
  { time: '10:31:03', level: 'info', msg: '✅ Found 1 result on forum' },
  { time: '10:31:05', level: 'info', msg: '📤 Sending Discord notification...' },
  { time: '10:31:06', level: 'info', msg: '✅ Discord notification sent' },
  { time: '10:31:07', level: 'info', msg: '💾 Saving to Excel: nowe_zlecenia_20260516_1030.xlsx' },
  { time: '10:31:08', level: 'info', msg: '💾 Excel saved successfully' },
  { time: '10:31:09', level: 'info', msg: '🎉 Total new results: 5' },
  { time: '10:31:10', level: 'info', msg: '💤 Crawler cycle complete. Next run in ~4 hours.' },
];

const levelColors = {
  info: '#2196F3',
  debug: '#888',
  warn: '#FF9800',
  error: '#D32F2F',
};

export default function Logs() {
  return (
    <AdminLayout>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
            System Logs
          </h1>
          <p style={{ color: '#666', fontSize: '15px' }}>
            Real-time crawler and system diagnostic logs.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
        }}>
          {['all', 'info', 'warn', 'error', 'debug'].map(l => (
            <button key={l} style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              background: '#f0f0f0',
              color: '#666',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '2',
          overflowX: 'auto',
        }}>
          {logEntries.map((entry, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '16px',
              color: levelColors[entry.level],
            }}>
              <span style={{ color: '#555', minWidth: '70px', flexShrink: 0 }}>[{entry.time}]</span>
              <span style={{
                minWidth: '50px',
                flexShrink: 0,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                [{entry.level}]
              </span>
              <span style={{ color: '#ccc' }}>{entry.msg}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '16px',
          textAlign: 'right',
        }}>
          <button style={{
            padding: '10px 20px',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#666',
            cursor: 'pointer',
          }}>
            Download Logs
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}