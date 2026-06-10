import { useState, useEffect } from 'react';
import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

export default function Insights() {
  const [seoData, setSeoData] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [pagespeedData, setPagespeedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [seoRes, secRes, psRes] = await Promise.all([
          fetch('/api/seo-check'),
          fetch('/api/security-monitor'),
          fetch('/api/analytics/pagespeed'),
        ]);
        const seo = await seoRes.json();
        const sec = await secRes.json();
        const ps = await psRes.json();
        setSeoData(seo);
        setSecurityData(sec);
        setPagespeedData(ps);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const sendEmailReport = async () => {
    try {
      await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'seo', details: { scores: { performance: seoData?.averageScore }, recommendations: seoData?.recommendations } }),
      });
      alert('Report sent to email!');
    } catch {
      alert('Failed to send report');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) {
      return '#28a745';
    }
    if (score >= 50) {
      return '#ffc107';
    }
    return '#dc3545';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) {
      return 'Excellent';
    }
    if (score >= 70) {
      return 'Good';
    }
    if (score >= 50) {
      return 'Needs Work';
    }
    return 'Poor';
  };

  return (
    <AdminLayout>
      <div style={{ padding: '0', maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0 }}>Insights & SEO</h1>
          <button
            onClick={() => sendEmailReport('seo')}
            style={{
              padding: '8px 16px',
              background: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            📧 Send Email Report
          </button>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading insights...</div>}
        {error && <div style={{ color: '#dc3545', padding: '16px', background: '#f8d7da', borderRadius: '8px' }}>Error: {error}</div>}

        {!loading && !error && (
          <>
            {/* SEO Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {seoData?.pages?.map((page, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: getScoreColor(page.score),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}>
                    {page.score}
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px' }}>
                    {page.url?.replace('http://localhost:3000', '') || '/'}
                  </p>
                  <p style={{ fontSize: '12px', color: getScoreColor(page.score), fontWeight: '600', margin: 0 }}>
                    {getScoreLabel(page.score)}
                  </p>
                </div>
              ))}
            </div>

            {/* PageSpeed Data */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px',
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px' }}>PageSpeed Insights</h3>
                {pagespeedData && Object.keys(pagespeedData).length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {Object.entries(pagespeedData).map(([mode, data]) => (
                            <div key={mode} style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                                <strong>{mode.toUpperCase()}</strong>: {data.score}/100 (FCP: {data.fcp})
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No data available. Run the analysis script.</p>
                )}
            </div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px',
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>SEO Audit</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Page</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Title</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Meta Desc</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>OG Tags</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Schema</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Load</th>
                  </tr>
                </thead>
                <tbody>
                  {seoData?.pages?.map((page, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px', fontSize: '13px' }}>{page.url?.replace('http://localhost:3000', '')}</td>
                      <td style={{ padding: '8px' }}>{page.checks?.hasTitle ? '✅' : '❌'}</td>
                      <td style={{ padding: '8px' }}>{page.checks?.hasMetaDescription ? '✅' : '❌'}</td>
                      <td style={{ padding: '8px' }}>{page.checks?.hasOpenGraph ? '✅' : '❌'}</td>
                      <td style={{ padding: '8px' }}>{page.checks?.hasStructuredData ? '✅' : '❌'}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{page.loadTime ? `${page.loadTime}ms` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Security Status */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '24px',
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Security Monitor</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {securityData?.checks?.map((check, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: check.pass ? '#d4edda' : '#f8d7da',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${check.pass ? '#28a745' : '#dc3545'}`,
                  }}>
                    <span style={{ fontSize: '18px' }}>{check.pass ? '✅' : '❌'}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{check.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              {securityData && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: securityData.allPassed ? '#d4edda' : '#f8d7da',
                    color: securityData.allPassed ? '#155724' : '#721c24',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}>
                    {securityData.summary?.passed}/{securityData.summary?.total} checks passed
                  </span>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {seoData?.recommendations?.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Recommendations</h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {seoData.recommendations.map((rec, i) => (
                    <li key={i} style={{ padding: '4px 0', fontSize: '14px', color: '#333' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
