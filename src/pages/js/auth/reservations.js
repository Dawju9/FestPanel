import { useState, useEffect } from 'react';
import { requireAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/AdminLayout';

export async function getServerSideProps(context) { return requireAuth(context); }

export default function Reservations() {
  const [res, setRes] = useState([]);

  useEffect(() => { fetch('/api/reservations').then(r => r.json()).then(setRes); }, []);

  const groups = res.reduce((acc, r) => {
    acc[r.date] = acc[r.date] || [];
    acc[r.date].push(r);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <h1>Rezerwacje</h1>
      {Object.entries(groups).map(([date, items]) => (
        <div key={date} style={{ marginBottom: '20px' }}>
          <h2>{date}</h2>
          {items.map(item => (
            <div key={item.id} style={{ background: '#fff', padding: '10px', margin: '5px 0' }}>
              {item.name} - {item.meters}m2 - {item.floorType}
            </div>
          ))}
        </div>
      ))}
    </AdminLayout>
  );
}
