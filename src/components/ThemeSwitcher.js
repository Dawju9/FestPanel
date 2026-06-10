import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { retroFuturisticTheme } from '../themes/retro-futuristic';
import { Palette, Check, X } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
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

  const current = themes.find((t) => t.id === theme) || themes[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Wybierz motyw"
        title={`Motyw: ${current.name}`}
        className="fab-button theme-switcher-btn"
      >
        <Palette size={24} />
      </button>

      {open && (
        <div ref={panelRef} className="popup-panel" role="dialog" aria-label="Wybierz motyw">

          {/* Header */}
          <div className="popup-header">
            <div className="popup-header-icon">
              <Palette size={20} />
            </div>
            <h3 className="popup-header-title">Motyw</h3>
            <button onClick={() => setOpen(false)} className="popup-close" aria-label="Zamknij">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="popup-body popup-body--flush">
            {themes.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  aria-pressed={active}
                  className={`theme-option ${active ? 'theme-option--active' : ''}`}
                >
                  <div className="theme-swatch" aria-hidden="true">
                    <div style={{ background: t.swatch[0] }} />
                    <div style={{ background: t.swatch[1] }} />
                    <div style={{ background: t.swatch[1] }} />
                    <div style={{ background: t.swatch[2] }} />
                  </div>
                  <div className="theme-info">
                    <div className="theme-name">{t.name}</div>
                    <div className="theme-desc">{t.description}</div>
                  </div>
                  {active && <Check size={16} className="theme-check" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
