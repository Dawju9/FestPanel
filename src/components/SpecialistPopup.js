import { useState, useEffect, useRef } from 'react';
import { X, User, Phone, Mail, MapPin, Star, Shield, Clock, Award } from 'lucide-react';

export default function SpecialistPopup() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) {return;}
    const onKey = (e) => { if (e.key === 'Escape') {setOpen(false);} };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) {return;}
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Poznaj specjalistę"
        title="Poznaj specjalistę"
        className="fab-button"
      >
        <User size={24} />
      </button>

      {open && (
        <div ref={panelRef} className="popup-panel" role="dialog" aria-label="Wizytówka specjalisty">

          {/* Header */}
          <div className="popup-header popup-header--gradient">
            <button onClick={() => setOpen(false)} className="popup-close popup-close--light" aria-label="Zamknij">
              <X size={18} />
            </button>

            <div className="specialist-avatar">
              <User size={36} color="#fff" />
            </div>
            <h3 className="popup-header-title popup-header-title--white">
              Dawid
            </h3>
            <p className="popup-header-subtitle">
              Właściciel &bull; Specjalista ds. montażu
            </p>
            <div className="specialist-stars">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} fill="#FFD700" color="#FFD700" />
              ))}
              <span className="specialist-rating">5.0</span>
            </div>
          </div>

          {/* Body */}
          <div className="popup-body">
            <p className="specialist-desc">
              Profesjonalny montaż paneli podłogowych i winylowych. Gwarancja jakości i szybkie terminy realizacji.
            </p>

            <div className="specialist-contacts">
              <a href="tel:698079424" className="specialist-contact-row">
                <div className="specialist-contact-icon"><Phone size={16} /></div>
                <span>698 079 424</span>
              </a>
              <a href="mailto:kontakt@festpanel.pl" className="specialist-contact-row">
                <div className="specialist-contact-icon"><Mail size={16} /></div>
                <span>kontakt@festpanel.pl</span>
              </a>
            </div>

            <div className="specialist-badges">
              <div className="specialist-badge"><Shield size={14} /><span>Gwarancja</span></div>
              <div className="specialist-badge"><Clock size={14} /><span>Szybko</span></div>
            </div>

            <a href="tel:698079424" className="btn-submit" style={{ textDecoration: 'none', marginTop: '16px' }}>
              <Phone size={16} />
              Zadzwoń teraz
            </a>
          </div>
        </div>
      )}
    </>
  );
}
