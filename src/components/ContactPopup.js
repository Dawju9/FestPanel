import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ContactPopup({ isOpen, onClose }) {
  const { success, error: toastError } = useToast();
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', message: '', metrage: '', prepServices: false, baseboards: false
  });
  const [sending, setSending] = useState(false);
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {return;}

    const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!SITE_KEY) {return;}

    const renderWidget = () => {
      if (!window.grecaptcha || !recaptchaRef.current) {return;}
      if (widgetIdRef.current !== null) {return;}
      try {
        widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: SITE_KEY,
        });
      } catch { /* already rendered */ }
    };

    if (window.grecaptcha) {
      renderWidget();
    } else {
      const existing = document.querySelector('script[src*="recaptcha/api.js"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => setTimeout(renderWidget, 100);
        document.body.appendChild(script);
      } else {
        existing.addEventListener('load', () => setTimeout(renderWidget, 100));
      }
    }

    return () => {
      if (widgetIdRef.current !== null) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) {return null;}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const token = widgetIdRef.current !== null
      ? window.grecaptcha.getResponse(widgetIdRef.current)
      : window.grecaptcha?.getResponse?.();
    if (!token) {
      toastError('Proszę wypełnić reCAPTCHA.');
      setSending(false);
      return;
    }
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: token }),
      });
      if (response.ok) {
        success('Wiadomość wysłana pomyślnie! Odpowiemy najszybciej jak to możliwe.');
        setFormData({ name: '', phone: '', email: '', message: '', metrage: '', prepServices: false, baseboards: false });
        if (widgetIdRef.current !== null) {window.grecaptcha.reset(widgetIdRef.current);}
        setTimeout(onClose, 1500);
      } else {
        toastError('Nie udało się wysłać wiadomości. Spróbuj ponownie.');
        if (widgetIdRef.current !== null) {window.grecaptcha.reset(widgetIdRef.current);}
      }
    } catch { 
      toastError('Wystąpił błąd połączenia. Spróbuj ponownie później.');
      if (widgetIdRef.current !== null) {window.grecaptcha.reset(widgetIdRef.current);}
    }
    setSending(false);
  };

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div
        className="popup-panel popup-panel--modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Szczegóły wyceny"
      >
        <div className="popup-header">
          <div className="popup-header-icon">
            <Send size={20} />
          </div>
          <h3 className="popup-header-title">Szczegóły wyceny</h3>
          <button onClick={onClose} className="popup-close" aria-label="Zamknij">
            <X size={18} />
          </button>
        </div>

        <div className="popup-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Imię" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="tel" placeholder="Telefon" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <input type="email" placeholder="Email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <input type="number" placeholder="Metraż (m2)" className="form-input" value={formData.metrage} onChange={e => setFormData({...formData, metrage: e.target.value})} />
            <label className="popup-checkbox-label">
              <input type="checkbox" checked={formData.prepServices} onChange={e => setFormData({...formData, prepServices: e.target.checked})} />
              <span>Przygotowanie podłoża</span>
            </label>
            <label className="popup-checkbox-label">
              <input type="checkbox" checked={formData.baseboards} onChange={e => setFormData({...formData, baseboards: e.target.checked})} />
              <span>Montaż listew</span>
            </label>
            <textarea placeholder="Dodatkowe informacje..." className="form-textarea" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
            <div ref={recaptchaRef} style={{ minHeight: '78px' }} />
            <button type="submit" className="btn-submit" disabled={sending}>
              {sending ? 'Wysyłanie...' : 'WYŚLIJ'}
              {!sending && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
