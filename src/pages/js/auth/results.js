import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';
import { useState } from 'react';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

const sampleResults = [
  { id: 1, title: 'Zlecę położenie paneli podłogowych - Warszawa', link: 'https://olx.pl/oferta/12345', city: 'Warszawa', code: '00-001', date: '2026-05-16', salary: '3500 zł', meters: '45 m²', source: 'olx.pl', query: 'Zlecę położenie paneli' },
  { id: 2, title: 'Montaż paneli winylowych - Kraków', link: 'https://fixly.pl/zlecenie/67890', city: 'Kraków', code: '30-001', date: '2026-05-16', salary: '4200 zł', meters: '60 m²', source: 'fixly.pl', query: 'montaż paneli winylowych' },
  { id: 3, title: 'Układanie paneli podłogowych - Gdańsk', link: 'https://oferteo.pl/zlecenie/11111', city: 'Gdańsk', code: '80-001', date: '2026-05-15', salary: '2800 zł', meters: '35 m²', source: 'oferteo.pl', query: 'układanie paneli zlecę' },
  { id: 4, title: 'Potrzebny montaż paneli PCV - Wrocław', link: 'https://zleca.pl/oferta/22222', city: 'Wrocław', code: '50-001', date: '2026-05-15', salary: '5100 zł', meters: '70 m²', source: 'zleca.pl', query: 'potrzebny montaż paneli' },
  { id: 5, title: 'Zlecę cyklinowanie i panele - Poznań', link: 'https://forum.dom.pl/temat/33333', city: 'Poznań', code: '60-001', date: '2026-05-14', salary: '1900 zł', meters: '25 m²', source: 'forum', query: 'zlecę cyklinowanie podłóg' },
];

export default function Results() {
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [results] = useState(sampleResults);

  const filtered = results.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchesSource = filterSource === 'all' || r.source === filterSource;
    return matchesSearch && matchesSource;
  });

  return (
    <AdminLayout>
        <div>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
              Crawler Results
            </h1>
            <p style={{ color: '#666', fontSize: '15px' }}>
              Browse and filter all found flooring installation leads.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}>
            <input
              type="text"
              placeholder="Search by title or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                minWidth: '150px',
              }}
            >
              <option value="all">All Sources</option>
              <option value="olx.pl">OLX</option>
              <option value="fixly.pl">Fixly</option>
              <option value="oferteo.pl">Oferteo</option>
              <option value="zleca.pl">Zleca</option>
              <option value="forum">Forum</option>
            </select>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}>
              <thead>
                <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                  {['Title', 'Location', 'Code', 'Date', 'Salary', 'Meters', 'Source', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '14px 16px',
                      fontWeight: 600,
                      color: '#666',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{
                    borderTop: '1px solid #f0f0f0',
                    background: i % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <a href={r.link} target="_blank" rel="noopener noreferrer" style={{
                        color: '#D32F2F',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}>
                        {r.title}
                      </a>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#333' }}>{r.city}</td>
                    <td style={{ padding: '14px 16px', color: '#666', fontFamily: 'monospace' }}>{r.code}</td>
                    <td style={{ padding: '14px 16px', color: '#666' }}>{r.date}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#388E3C' }}>{r.salary}</td>
                    <td style={{ padding: '14px 16px', color: '#333' }}>{r.meters}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: '#f0f0f0',
                        color: '#666',
                      }}>
                        {r.source}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <a href={r.link} target="_blank" rel="noopener noreferrer" style={{
                        color: '#D32F2F',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}>
                        Open →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#999' }}>
                No results found matching your search.
              </div>
            )}

            <div style={{
              padding: '16px',
              borderTop: '1px solid #f0f0f0',
              fontSize: '13px',
              color: '#999',
              textAlign: 'right',
            }}>
              Showing {filtered.length} of {results.length} results
            </div>
          </div>
        </div>
      </AdminLayout>
  );
}