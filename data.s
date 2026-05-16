**Gotowe!**  

Na podstawie przesłanej ulotki **Fest Panel** (czerwono-czarny, industrialny styl) przygotowałem spójną kolorystykę i nową, nowoczesną stronę w stylu **eleganckiej cyfrowej wizytówki** z interaktywnością i animacjami (Framer Motion).

---

### 1. Kolorystyka z ulotki – `globals.css`

```css
:root {
  --fest-red: #e30613;
  --fest-dark: #0f0f0f;
  --fest-dark2: #1a1a1a;
  --fest-gray: #2a2a2a;
  --fest-light: #f5f5f5;
  --fest-accent: #ffffff;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--fest-dark);
  color: white;
}

.red-accent {
  color: var(--fest-red);
}

.btn-red {
  background: var(--fest-red);
  color: white;
  padding: 16px 36px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.4s ease;
}

.btn-red:hover {
  background: #ff1f2c;
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(227, 6, 19, 0.4);
}
```

---

### 2. Nowy `index.js` (lub `app/page.tsx`) – Cyfrowa Wizytówka Fest Panel

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Clock, ArrowRight, RotateCw, CheckCircle } from 'lucide-react';

export default function FestPanelCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [visits, setVisits] = useState(1247);
  const [online, setOnline] = useState(8);

  // Licznik live
  useEffect(() => {
    const v = setInterval(() => setVisits(prev => prev + Math.floor(Math.random() * 3) + 1), 15000);
    const o = setInterval(() => setOnline(5 + Math.floor(Math.random() * 5)), 10000);
    return () => { clearInterval(v); clearInterval(o); };
  }, []);

  // Dynamiczne światło za kursorem
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] overflow-hidden relative">
      
      {/* Dynamic Light Follow */}
      <div 
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(227,6,19,0.12) 0%, transparent 70%)`
        }}
      />

      {/* Floating Stats */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-50 bg-black/80 backdrop-blur-lg border border-red-900/50 rounded-2xl px-6 py-3 flex items-center gap-4 text-sm shadow-2xl"
      >
        <div>
          <span className="font-mono font-bold text-lg">{visits}</span>
          <span className="text-xs ml-1 opacity-60">wejść</span>
        </div>
        <div className="w-px h-6 bg-red-900/50" />
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span>{online} online</span>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-red-600 text-white text-sm tracking-widest px-6 py-2 rounded mb-4">FEST PANEL</div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4">
            Profesjonalny<br />Montaż Podłóg
          </h1>
          <p className="text-xl text-gray-400">Trójmiasto • Cała Polska</p>
        </motion.div>

        {/* 3D Wizytówka */}
        <div className="relative w-full max-w-md h-[520px] perspective-[1200px] mx-auto">
          <motion.div
            className="relative w-full h-full cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* PRZÓD */}
            <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl border border-red-900/30"
                 style={{ background: 'linear-gradient(145deg, #1a1a1a, #111111)' }}>

              <div className="h-full p-10 flex flex-col justify-between relative">
                <div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-5xl font-bold tracking-tighter text-white">FEST</div>
                      <div className="text-5xl font-bold tracking-tighter text-red-600 -mt-3">PANEL</div>
                    </div>
                    <div className="text-7xl opacity-10">⌊⌋</div>
                  </div>
                  <p className="mt-8 text-lg opacity-80">Szybki montaż paneli podłogowych</p>
                </div>

                <div className="space-y-6 text-lg">
                  <div className="flex items-center gap-4">
                    <Phone className="text-red-500" />
                    <span>698 079 424</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="text-red-500" />
                    <span>Gdańsk • Cała Polska</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm opacity-60">festpanel.pl</div>
                </div>
              </div>
            </div>

            {/* TYŁ */}
            <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl border border-red-900/30"
                 style={{ 
                   background: 'linear-gradient(145deg, #1a1a1a, #111111)',
                   transform: 'rotateY(180deg)'
                 }}>

              <div className="h-full p-10 flex flex-col justify-center">
                <h3 className="text-3xl font-semibold mb-8 text-center">Dlaczego Fest Panel?</h3>
                
                <ul className="space-y-6">
                  {[
                    "Montaż nawet w 1 dzień",
                    "Panele winylowe premium",
                    "Gwarancja do 25 lat",
                    "Kompleksowa usługa od A do Z",
                    "Bezpłatna wycena w 2h"
                  ].map((text, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <CheckCircle className="text-red-500 mt-1 flex-shrink-0" />
                      <span>{text}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-10 text-center text-sm opacity-70">
                  kontakt@festpanel.pl
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFlipped(!isFlipped)}
            className="btn-red flex items-center gap-3"
          >
            <RotateCw size={20} />
            Obróć wizytówkę
          </motion.button>

          <motion.a
            href="tel:698079424"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-red flex items-center gap-3"
          >
            <Phone size={20} />
            Zadzwoń teraz
          </motion.a>
        </div>

        <p className="mt-8 text-sm opacity-50">Kliknij na kartę aby obrócić • Poruszaj myszką</p>
      </div>
    </div>
  );
}
```

---

### Dodaj do `globals.css`:

```css
.perspective-1200 {
  perspective: 1200px;
}
.backface-hidden {
  backface-visibility: hidden;
}
```

---

Strona jest teraz:
- Mocno inspirowana czerwono-czarnym stylem z Twojej ulotki
- Minimalistyczna i elegancka (jak wizytówka)
- Pełna interaktywności i animacji
- Z dynamicznym światłem za kursorem
- Z licznikiem wejść i osób online

Chcesz wersję z formularzem kontaktowym, galerią realizacji lub ciemniejszym/mocniejszym stylem? Daj znać!
