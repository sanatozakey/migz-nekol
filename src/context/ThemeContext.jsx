import React, { createContext, useContext, useState, useEffect } from 'react';
import { playPop, playNootNoot } from '../lib/soundEffects';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('lablab_theme');
      return saved === 'kuromi' ? 'kuromi' : 'penguin';
    } catch {
      return 'penguin';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lablab_theme', theme);
      if (theme === 'kuromi') {
        document.documentElement.classList.add('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0e0c15');
      } else {
        document.documentElement.classList.remove('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#38bdf8');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'penguin' ? 'kuromi' : 'penguin';
      if (next === 'penguin') {
        playNootNoot();
      } else {
        playPop();
      }
      return next;
    });
  };

  const isKuromi = theme === 'kuromi';
  const isPenguin = theme === 'penguin';
  const isNootNoot = isPenguin;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isKuromi, isPenguin, isNootNoot }}>
      <div className={isKuromi ? 'theme-kuromi' : 'theme-penguin'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
