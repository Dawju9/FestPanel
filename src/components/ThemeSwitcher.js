import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        background: 'var(--color-primary)',
        color: 'var(--color-white)',
        padding: '16px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
    >
      {theme === 'default' ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
}
