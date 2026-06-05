import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Theme catalog — single source of truth for the chooser UI.
// Mirrors the entries in /thems_ideas.data; values here drive the UI,
// while the actual color application lives in src/styles/globals.css
// (each theme is implemented as html[data-theme="<id>"]).
export const THEMES = [
  {
    id: 'default',
    name: 'Klasyczny Czerwony',
    description: 'Domyslny motyw FestPanel — industrialna czerwien',
    swatch: ['#D32F2F', '#1a1a1a', '#ffffff'],
  },
  {
    id: 'modern_dark',
    name: 'Nowoczesny Ciemny',
    description: 'Stonowany cyjan na glebokiej czerni — dla nocnych marek',
    swatch: ['#00BCD4', '#0a0a0a', '#e0e0e0'],
  },
  {
    id: 'forest_green',
    name: 'Lesna Zielien',
    description: 'Naturalna zielen premium — panele drewniane w centrum uwagi',
    swatch: ['#2E7D32', '#1B2E1F', '#FAF8F5'],
  },
  {
    id: 'sunset_orange',
    name: 'Zachod Slonca',
    description: 'Cieply pomarancz — przyjazny, domowy klimat',
    swatch: ['#EF6C00', '#2D1B10', '#FFFAF5'],
  },
  {
    id: 'ocean_blue',
    name: 'Glebia Oceanu',
    description: 'Gleboki blekit — zaufanie i profesjonalizm',
    swatch: ['#1565C0', '#0F2237', '#F2F7FB'],
  },
  {
    id: 'royal_purple',
    name: 'Krolewska Purpura',
    description: 'Elegancki fiolet — wyrozniaj sie z tlumu',
    swatch: ['#6A1B9A', '#1F0F2A', '#FAF6FB'],
  },
];

const VALID_THEME_IDS = THEMES.map(t => t.id);
const DEFAULT_THEME = 'default';

function isValidThemeId(id) {
  return VALID_THEME_IDS.indexOf(id) !== -1;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const validTheme = isValidThemeId(savedTheme) ? savedTheme : DEFAULT_THEME;
    setTheme(validTheme);
    if (savedTheme !== validTheme) {
      localStorage.setItem('theme', validTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setThemeSafe = (id) => {
    if (isValidThemeId(id)) {
      setTheme(id);
    }
  };

  // Cycles to the next theme; kept for the simple toggle button if desired.
  const toggleTheme = () => {
    const idx = VALID_THEME_IDS.indexOf(theme);
    const next = VALID_THEME_IDS[(idx + 1) % VALID_THEME_IDS.length];
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeSafe, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
