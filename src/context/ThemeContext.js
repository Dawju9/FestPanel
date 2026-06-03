import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const validTheme = savedTheme === 'modern_dark' ? 'modern_dark' : 'default';
    setTheme(validTheme);
    if (savedTheme !== validTheme) {
      localStorage.setItem('theme', validTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'default' ? 'modern_dark' : 'default');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
