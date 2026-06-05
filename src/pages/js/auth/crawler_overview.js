import { useState, useEffect } from 'react';
import { requireAuth } from '../../../../lib/auth';
import AdminLayout from '../../../../components/AdminLayout';

export async function getServerSideProps(context) { return requireAuth(context); }

export default function CrawlerOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/crawler_data');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result = await res.json();
        setData(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <AdminLayout>Loading crawler data...</AdminLayout>;
  if (error) return <AdminLayout>Error: {error}</AdminLayout>;
  if (!data) return <AdminLayout>No crawler data available.</AdminLayout>;

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: '24px' }}>Crawler Overview</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {data.summary && Object.entries(data.summary).map(([key, value]) => (
          <div key={key} style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: `4px solid #D32F2F`, // Use a primary color
          }}>
            <p style={{ fontSize: '13px', color: '#666' }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a' }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Active Offers</h2>
        {data.offers && data.offers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.offers.map(offer => (
              <div key={offer.id} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                <p><strong>{offer.title}</strong></p>
                <p>Miasto: {offer.city}, Metraż: {offer.metrage}</p>
                <p>Źródło: {offer.source} - <a href={offer.url} target="_blank" rel="noopener noreferrer">{offer.url}</a></p>
                <p>Status: {offer.age_group}</p>
              </div>
            ))}
          </div>
        ) : <p>No active offers found.</p>}
      </div>

      <div>
        <h2 style={{ marginBottom: '16px' }}>Discovered Sources</h2>
        {data.sources && data.sources.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.sources.map(source => (
              <div key={source.url} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                <p><strong>{source.site}</strong></p>
                <p><a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}</a></p>
                <p>Znaleziono przez: {source.found_by} ({new Date(source.found_at).toLocaleDateString()})</p>
              </div>
            ))}
          </div>
        ) : <p>No sources discovered.</p>}
      </div>
    </AdminLayout>
  );
}
