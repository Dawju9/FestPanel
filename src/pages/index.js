import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Phone, Mail, Clock, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import ContactPopup from '../components/ContactPopup';
import ReservationSlider from '../components/ReservationSlider';
import { trackEvent } from '../lib/analytics';
import SpecialistPopup from '../components/SpecialistPopup';

// ... (existing code, update components to use motion.div)

const SERVICES = [
  { id: '01', title: 'Montaż paneli winylowych', desc: 'Profesjonalne układanie paneli LVT/SPC' },
  { id: '02', title: 'Montaż paneli podłogowych', desc: 'Klasyczne panele laminowane i drewniane' },
  { id: '03', title: 'Przygotowanie podłoża', desc: 'Wyrównanie, gruntowanie, izolacja' },
  { id: '04', title: 'Montaż listew', desc: 'Profilowanie i montaż listew przypodłogowych' },
];

const FEATURES = [
  { title: 'SZYBKOŚĆ', desc: 'Realizacja w 1-2 dni robocze' },
  { title: 'JAKOŚĆ', desc: 'Sprawdzone materiały premium' },
  { title: 'GWARANCJA', desc: 'Każda realizacja objęta gwarancją' },
  { title: 'TERMINOWOŚĆ', desc: 'Dotrzymujemy ustalonych terminów' },
];

export default function FestPanel() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isResOpen, setIsResOpen] = useState(false);
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!SITE_KEY) {return;}

    const renderWidget = () => {
      if (!window.grecaptcha || !recaptchaRef.current) {return;}
      if (widgetIdRef.current !== null) {return;}
      try {
        widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: SITE_KEY,
        });
      } catch { /* widget already rendered or grecaptcha unavailable */ }
    };

    if (window.grecaptcha) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => setTimeout(renderWidget, 150);
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Wysyłanie...');
    
    const token = widgetIdRef.current !== null
      ? window.grecaptcha.getResponse(widgetIdRef.current)
      : window.grecaptcha?.getResponse?.();
    if (!token) {
      setStatus('Proszę wypełnić reCAPTCHA.');
      return;
    }
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: token }),
      });

      if (response.ok) {
        setStatus('Wysłano pomyślnie!');
        setFormData({ name: '', phone: '', email: '', message: '' });
        if (widgetIdRef.current !== null) {window.grecaptcha.reset(widgetIdRef.current);}
      } else {
        setStatus('Wystąpił błąd. Spróbuj ponownie.');
        if (widgetIdRef.current !== null) {window.grecaptcha.reset(widgetIdRef.current);}
      }
    } catch {
      setStatus('Wystąpił błąd. Spróbuj ponownie.');
      if (widgetIdRef.current !== null) {window.grecaptcha.reset(widgetIdRef.current);}
    }
  };

  return (
    <>
      <Head>
        <title>Profesjonalny Montaż Paneli Gdańsk | Panele Winylowe i Podłogowe | FestPanel</title>
        <meta name="description" content="Szybki i profesjonalny montaż paneli winylowych oraz podłogowych w Gdańsku i całej Polsce. Darmowa wycena, wysoka jakość, gwarancja. Sprawdź nas!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            'name': 'FestPanel',
            'url': 'https://festpanel.pl',
            'telephone': '+48698079424',
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'Gdańsk',
              'addressCountry': 'PL'
            },
            'description': 'Profesjonalny montaż paneli podłogowych i winylowych.',
            'priceRange': '$$'
          }) }} />
      </Head>

      <header className="header">
        <div className="container-fluid header-content">
          <div className="logo">
            <span className="logo-text">FEST</span>
            <span className="logo-accent">PANEL</span>
          </div>
          <nav className="nav">
            <a href="#uslugi">Usługi</a>
            <a href="#o-nas">O nas</a>
            <a href="#kontakt" className="btn-nav">Kontakt</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="container-fluid hero-content"
        >
          <span className="hero-badge">Profesjonalne usługi montażowe</span>
          <h1 className="hero-title">
            PROFESJONALNY MONTAŻ<br />
            <span className="hero-highlight">PANELI PODŁOGOWYCH</span><br />
            I WINYLOWYCH W GDAŃSKU
          </h1>
          <p className="hero-subtitle">
            Usługi montażowe dla domu i biura • Szybka realizacja • Gwarancja jakości
          </p>
          <div className="hero-actions">
            <button onClick={() => setIsPopupOpen(true)} className="btn-primary">
              <Phone size={18} />
              POPROŚ O WYCENĘ
            </button>
            <a href="tel:698079424" className="btn-secondary">
              ZADZWOŃ: 698 079 424
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Zrealizowanych projektów</span>
            </div>
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Zadowolonych klientów</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="uslugi" className="services">
        <div className="container">
          <div className="section-header">
            <span className="section-label">CO ROBIMY</span>
            <h2 className="section-title">PROFESJONALNY MONTAŻ PANELI - NASZE USŁUGI</h2>
          </div>
          <div className="services-grid">
            {SERVICES.map((service, i) => (
              <motion.div 
                key={service.id} 
                className="service-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <span className="service-id">{service.id}</span>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
                <CheckCircle className="service-icon" size={24} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="o-nas" className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-label">NASZE ATUTY</span>
            <h2 className="section-title">DLACZEGO KLIENCI WYBIERAJĄ FESTPANEL?</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-icon">
                  <CheckCircle size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">NIE CZEKAJ — DZIAŁAMY OD ZARAZ!</h2>
            <p className="cta-subtitle">Bezpłatna wycena i konsultacja • Realizacja w krótkim terminie</p>
            <div className="cta-actions">
              <a href="tel:698079424" className="btn-contact">
                <Phone size={20} />
                698 079 424
              </a>
              <a href="mailto:kontakt@festpanel.pl" className="btn-contact-outline">
                <Mail size={20} />
                kontakt@festpanel.pl
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="kontakt" className="contact">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <span className="section-label">KONTAKT</span>
              <h2 className="section-title">SKONTAKTUJ SIĘ Z NAMI</h2>
              <p className="contact-desc">
                Masz pytania? Potrzebujesz wyceny? Zadzwoń lub napisz — odpowiemy najszybciej jak to możliwe.
              </p>
              <div className="contact-items">
                <div className="contact-item">
                  <Phone className="contact-icon" size={24} />
                  <div>
                    <span className="contact-label">Telefon</span>
                    <a href="tel:698079424" className="contact-value">698 079 424</a>
                  </div>
                </div>
                <div className="contact-item">
                  <Mail className="contact-icon" size={24} />
                  <div>
                    <span className="contact-label">E-mail</span>
                    <a href="mailto:kontakt@festpanel.pl" className="contact-value">kontakt@festpanel.pl</a>
                  </div>
                </div>
                <div className="contact-item">
                  <Clock className="contact-icon" size={24} />
                  <div>
                    <span className="contact-label">Godziny</span>
                    <span className="contact-value">Pn-Sb: 8:00 - 20:00</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form className="form" onSubmit={handleSubmit}>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Imię i nazwisko" 
                  className="form-input" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Numer telefonu" 
                  className="form-input" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Adres e-mail" 
                  className="form-input" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
                <textarea 
                  name="message" 
                  placeholder="Opisz czego potrzebujesz..." 
                  className="form-textarea" 
                  rows="4" 
                  value={formData.message} 
                  onChange={handleChange} 
                  required 
                />
                <div ref={recaptchaRef} style={{ minHeight: '78px' }} />
                <button type="submit" className="btn-submit">
                  WYŚLIJ ZAPYTANIE
                  <ArrowRight size={18} />
                </button>
              </form>
              {status && <p style={{marginTop: '16px', textAlign: 'center', color: 'var(--color-primary)'}}>{status}</p>}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-text">FEST</span>
              <span className="logo-accent">PANEL</span>
            </div>
            <p className="footer-desc">
              Profesjonalny montaż paneli podłogowych • Gdańsk i okolice • Cała Polska
            </p>
            <div className="footer-contact">
              <span>Tel: <strong>698 079 424</strong></span>
              <span>E-mail: <strong>kontakt@festpanel.pl</strong></span>
            </div>
            <p className="footer-copyright">
              © {new Date().getFullYear()} FestPanel. Wszelkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </footer>
      <ContactPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      <ReservationSlider isOpen={isResOpen} onClose={() => setIsResOpen(false)} />

      <div className="floating-buttons">
        <SpecialistPopup />
        <button
          onClick={() => { setIsResOpen(true); trackEvent('buttonClick', 'OpenReservationSlider'); }}
          aria-label="Zarezerwuj termin"
          title="Zarezerwuj termin"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Calendar size={24} />
        </button>
      </div>
    </>
  );
}
