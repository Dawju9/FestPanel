import Head from 'next/head';
import { Phone, Mail, Clock, CheckCircle, ArrowRight } from 'lucide-react';

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
  return (
    <>
      <Head>
        <title>FestPanel • Profesjonalny Montaż Paneli Podłogowych</title>
        <meta name="description" content="Szybki montaż paneli winylowych i podłogowych. Trójmiasto i cała Polska. Bezpłatna wycena • Gwarancja jakości." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="header">
        <div className="container header-content">
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
        <div className="container hero-content">
          <span className="hero-badge">Profesjonalne usługi montażowe</span>
          <h1 className="hero-title">
            MONTAŻ<br />
            <span className="hero-highlight">PANELI</span><br />
            PODŁOGOWYCH
          </h1>
          <p className="hero-subtitle">
            Gdańsk i okolice • Cała Polska • Bezpłatna wycena
          </p>
          <div className="hero-actions">
            <a href="#kontakt" className="btn-primary">
              <Phone size={18} />
              POPROŚ O WYCENĘ
            </a>
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
        </div>
      </section>

      <section id="uslugi" className="services">
        <div className="container">
          <div className="section-header">
            <span className="section-label">CO ROBIMY</span>
            <h2 className="section-title">NASZE USŁUGI</h2>
          </div>
          <div className="services-grid">
            {SERVICES.map((service) => (
              <div key={service.id} className="service-card">
                <span className="service-id">{service.id}</span>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
                <CheckCircle className="service-icon" size={24} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="o-nas" className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-label">NASZE ATUTY</span>
            <h2 className="section-title">DLACZEGO MY</h2>
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
              <form className="form">
                <input type="text" placeholder="Imię i nazwisko" className="form-input" />
                <input type="tel" placeholder="Numer telefonu" className="form-input" />
                <input type="email" placeholder="Adres e-mail" className="form-input" />
                <textarea placeholder="Opisz czego potrzebujesz..." className="form-textarea" rows="4" />
                <button type="submit" className="btn-submit">
                  WYŚLIJ ZAPYTANIE
                  <ArrowRight size={18} />
                </button>
              </form>
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
    </>
  );
}