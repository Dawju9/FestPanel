import { useState } from 'react';
import Head from 'next/head';
import { Phone, Mail, ArrowLeftRight } from 'lucide-react';

export default function Ulotka() {
  const [isBack, setIsBack] = useState(false);

  const toggleView = () => setIsBack(!isBack);

  return (
    <div className="flyer-page">
      <Head>
        <title>Ulotka Elektroniczna • FestPanel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <div className="flyer-container">
        <div className={`flyer-card ${isBack ? 'is-flipped' : ''}`} onClick={toggleView}>
          <div className="flyer-face flyer-front">
            <img src="/images/flyer-front.png" alt="FestPanel Ulotka - Przód" />
          </div>
          <div className="flyer-face flyer-back">
            <img src="/images/flyer-back.png" alt="FestPanel Ulotka - Tył" />
          </div>
        </div>

        <div className="flyer-controls">
          <button className="btn-toggle" onClick={toggleView}>
            <ArrowLeftRight size={20} />
            {isBack ? 'Pokaż Przód' : 'Pokaż Tył'}
          </button>
          
          <div className="flyer-hint">
            Kliknij w ulotkę, aby ją obrócić
          </div>
        </div>

        <div className="flyer-contact">
          <a href="tel:698079424" className="contact-btn">
            <Phone size={20} />
            Zadzwoń: 698 079 424
          </a>
          <a href="mailto:kontakt@festpanel.pl" className="contact-btn secondary">
            <Mail size={20} />
            Napisz do nas
          </a>
        </div>
      </div>

      <style jsx>{`
        .flyer-page {
          min-height: 100vh;
          background: #1a1a1a;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .flyer-container {
          width: 100%;
          max-width: 500px;
          perspective: 1000px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          margin-top: 20px;
        }

        .flyer-card {
          width: 100%;
          aspect-ratio: 1 / 1.414; /* A4/A5 ratio */
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          border-radius: 12px;
          overflow: hidden;
        }

        .flyer-card.is-flipped {
          transform: rotateY(180deg);
        }

        .flyer-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
        }

        .flyer-face img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .flyer-back {
          transform: rotateY(180deg);
        }

        .flyer-controls {
          text-align: center;
        }

        .btn-toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #D32F2F;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(211, 47, 47, 0.4);
        }

        .btn-toggle:active {
          transform: scale(0.95);
        }

        .flyer-hint {
          margin-top: 15px;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .flyer-contact {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .contact-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: white;
          color: #1a1a1a;
          text-decoration: none;
          padding: 15px;
          border-radius: 12px;
          font-weight: 700;
          transition: background 0.2s;
        }

        .contact-btn.secondary {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
        }

        @media (max-width: 480px) {
          .flyer-container {
            margin-top: 10px;
            gap: 20px;
          }
          
          .btn-toggle {
            padding: 12px 24px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
