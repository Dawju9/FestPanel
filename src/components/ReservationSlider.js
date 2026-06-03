import { useState } from 'react';
import { X, Calendar } from 'lucide-react';

export default function ReservationSlider({ isOpen, onClose }) {
  const [data, setData] = useState({ name: '', date: '', meters: '', floorType: '' });

  if (!isOpen) {return null;}

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '350px', background: '#fff', boxShadow: '-2px 0 10px rgba(0,0,0,0.1)', zIndex: 1001, padding: '24px' }}>
      <button onClick={onClose} style={{ float: 'right' }}><X /></button>
      <h2>Zarezerwuj termin</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        <input placeholder="Imię klienta" onChange={e => setData({...data, name: e.target.value})} required />
        <input type="date" onChange={e => setData({...data, date: e.target.value})} required />
        <input type="number" placeholder="Metraż" onChange={e => setData({...data, meters: e.target.value})} />
        <input placeholder="Typ podłogi" onChange={e => setData({...data, floorType: e.target.value})} />
        <button type="submit">Zapisz rezerwację</button>
      </form>
    </div>
  );
}
