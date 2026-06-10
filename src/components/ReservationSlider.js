import { useState, useRef } from 'react';
import { X, CalendarDays } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ReCAPTCHA from 'react-google-recaptcha';

export default function ReservationSlider({ isOpen, onClose }) {
  const { success, error: toastError } = useToast();
  const [data, setData] = useState({ name: '', date: '', meters: '', floorType: '' });
  const [sending, setSending] = useState(false);
  const recaptchaRef = useRef();

  if (!isOpen) {return null;}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    const token = recaptchaRef.current.getValue();
    if (!token) {
        toastError('Proszę potwierdzić, że nie jesteś robotem.');
        setSending(false);
        return;
    }

    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toastError('Wybrano datę z przeszłości. Wybierz inny termin.');
      setSending(false);
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0) {
      toastError('Niedziela jest nie dostępna. Wybierz inny termin.');
      setSending(false);
      return;
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken: token }),
      });
      if (res.ok) {
        success(`Termin zarezerwowany na ${data.date}! Potwierdzenie wyślemy na telefon.`);
        setData({ name: '', date: '', meters: '', floorType: '' });
        recaptchaRef.current.reset();
        setTimeout(onClose, 2000);
      } else {
        const result = await res.json().catch(() => null);
        if (result?.error) {
          toastError(result.error);
        } else {
          toastError('Nie udało się zarezerwować terminu. Spróbuj ponownie.');
        }
      }
    } catch {
      toastError('Wystąpił błąd połączenia. Spróbuj ponownie później.');
    }
    setSending(false);
  };

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div
        className="popup-panel popup-panel--modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Zarezerwuj termin"
      >
        <div className="popup-header">
          <div className="popup-header-icon">
            <CalendarDays size={20} />
          </div>
          <h3 className="popup-header-title">Zarezerwuj termin</h3>
          <button onClick={onClose} className="popup-close" aria-label="Zamknij">
            <X size={18} />
          </button>
        </div>

        <div className="popup-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tile-desc)' }}>Imię</label>
                <input
                placeholder="Twoje imię"
                className="form-input"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
                />
            </div>
            <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tile-desc)' }}>Data</label>
                <input
                type="date"
                className="form-input"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                required
                />
            </div>
            <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tile-desc)' }}>Metraż i typ</label>
                <input
                type="number"
                placeholder="Metraż (m2)"
                className="form-input"
                value={data.meters}
                onChange={(e) => setData({ ...data, meters: e.target.value })}
                style={{ marginBottom: '8px' }}
                />
                <input
                placeholder="Typ podłogi"
                className="form-input"
                value={data.floorType}
                onChange={(e) => setData({ ...data, floorType: e.target.value })}
                />
            </div>
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            />
            <button type="submit" className="btn-submit" disabled={sending}>
              {sending ? 'Rezerwowanie...' : 'Zarezerwuj termin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
