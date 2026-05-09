import React, { createContext, useState, ReactNode } from 'react';

// Define theme objects directly in the context (like calorie-cam)
const lightTheme = {
  background: '#f4efe5',
  card: '#fffaf1',
  text: '#1b1713',
  textSecondary: '#6f6558',
  primary: '#b7792b',
  accent: '#5f7f61',
  border: '#ded3c3',
  muted: '#ebe1d2',
};

const darkTheme = {
  background: '#12100d',
  card: '#211b16',
  text: '#f7efe3',
  textSecondary: '#c7b9a7',
  primary: '#d7a75b',
  accent: '#879f72',
  border: '#3c3128',
  muted: '#2a231d',
};

export type Theme = 'light' | 'dark';
export type AppTheme = typeof lightTheme;

export interface ThemeContextProps {
  theme: Theme;
  themeObj: AppTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);
export default ThemeContext;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const themeObj = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeObj, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
