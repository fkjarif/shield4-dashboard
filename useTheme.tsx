import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

type Theme = 'dark' | 'light';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'dark',
  toggleTheme: () => null,
});

export function ThemeProvider({ children }: ThemeProviderProps) {
  const settings = useLiveQuery(() => db.settings.get('core'));
  const [localTheme, setLocalTheme] = useState<Theme>('dark');

  // Sync with DB
  useEffect(() => {
    if (settings?.theme) {
      setLocalTheme(settings.theme);
    }
  }, [settings?.theme]);

  // Apply to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(localTheme);
  }, [localTheme]);

  const toggleTheme = async () => {
    const newTheme = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(newTheme);
    await db.settings.update('core', { theme: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme: localTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
