import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, X } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const current = themes.find(t => t.id === theme) || themes[0];

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Wybierz motyw"
        title="Wybierz motyw"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '80px',
          background: 'var(--color-primary)',
          color: 'var(--color-white)',
          padding: '16px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Palette size={24} />
      </button>

      {/* Modal chooser */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Wybierz motyw"
          onClick={(e) => { if (e.target === e.currentTarget) { setOpen(false); } }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--surface, var(--bg-color))',
              color: 'var(--tile-text)',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              border: '1px solid var(--border-color)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--tile-text)' }}>
                Wybierz motyw
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zamknij"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--tile-text)',
                  padding: '4px',
                  display: 'inline-flex',
                }}
              >
                <X size={22} />
              </button>
            </div>
            <p style={{ margin: '0 0 16px', color: 'var(--tile-desc)', fontSize: '14px' }}>
              Aktywny: <strong style={{ color: 'var(--color-primary)' }}>{current.name}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {themes.map((t) => {
                const active = t.id === theme;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    aria-pressed={active}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: active
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--border-color)',
                      background: active
                        ? 'color-mix(in srgb, var(--color-primary) 8%, var(--surface, var(--bg-color)))'
                        : 'var(--surface, var(--bg-color))',
                      color: 'var(--tile-text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Swatch */}
                    <div
                      aria-hidden="true"
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        flexShrink: 0,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: '1fr 1fr',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ background: t.swatch[0] }} />
                      <div style={{ background: t.swatch[1] }} />
                      <div style={{ background: t.swatch[1] }} />
                      <div style={{ background: t.swatch[2] }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--tile-text)' }}>
                        {t.name}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--tile-desc)',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {t.description}
                      </div>
                    </div>
                    {active && (
                      <Check
                        size={20}
                        style={{ color: 'var(--color-primary)', flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
