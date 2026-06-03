import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';

export async function getServerSideProps(context) {
  return requireAuth(context);
}

export default function Insights() {
  const seoData = {
    score: 88,
    keywords: ['montaż paneli Gdańsk', 'panele winylowe montaż', 'podłogi drewniane'],
    traffic: '1,240 visits',
    performance: 'Good'
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: '24px' }}>Insights & SEO</h1>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
        <h3>SEO Score: {seoData.score}/100</h3>
        <p>Main Keywords: {seoData.keywords.join(', ')}</p>
        <p>Monthly Traffic: {seoData.traffic}</p>
        <p>Performance: {seoData.performance}</p>
      </div>
    </AdminLayout>
  );
}
