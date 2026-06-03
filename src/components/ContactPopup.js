import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function ContactPopup({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', message: '', metrage: '', prepServices: false, baseboards: false
  });
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Wysyłanie...');
    const token = window.grecaptcha.getResponse();
    if (!token) { setStatus('Proszę wypełnić reCAPTCHA.'); return; }
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: token }),
      });
      if (response.ok) {
        setStatus('Wysłano pomyślnie!');
        setTimeout(onClose, 2000);
      } else {
        setStatus('Wystąpił błąd.');
      }
    } catch { setStatus('Wystąpił błąd.'); }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none' }}><X /></button>
        <h2 style={{ marginBottom: '16px' }}>Szczegóły wyceny</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder="Imię" className="form-input" onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input type="tel" placeholder="Telefon" className="form-input" onChange={e => setFormData({...formData, phone: e.target.value})} required />
          <input type="email" placeholder="Email" className="form-input" onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="number" placeholder="Metraż (m2)" className="form-input" onChange={e => setFormData({...formData, metrage: e.target.value})} />
          <label><input type="checkbox" onChange={e => setFormData({...formData, prepServices: e.target.checked})} /> Przygotowanie podłoża</label>
          <label><input type="checkbox" onChange={e => setFormData({...formData, baseboards: e.target.checked})} /> Montaż listew</label>
          <textarea placeholder="Dodatkowe informacje..." className="form-textarea" onChange={e => setFormData({...formData, message: e.target.value})} />
          <div className="g-recaptcha" data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}></div>
          <button type="submit" className="btn-submit">WYŚLIJ <ArrowRight /></button>
        </form>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}
