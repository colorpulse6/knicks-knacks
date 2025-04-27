import React, { createContext, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';

// Define theme objects directly in the context (like calorie-cam)
const lightTheme = {
  background: '#fff',
  card: '#f6f6f6',
  text: '#222',
  textSecondary: '#666',
  primary: '#4CAF50',
  accent: '#8BC34A',
  border: '#e0e0e0',
};

const darkTheme = {
  background: '#222',
  card: '#333',
  text: '#fff',
  textSecondary: '#ccc',
  primary: '#8BC34A',
  accent: '#4CAF50',
  border: '#444',
};

export type Theme = 'light' | 'dark';
export type AppTheme = typeof lightTheme;

interface ThemeContextProps {
  theme: Theme;
  themeObj: AppTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);
export default ThemeContext;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState<Theme>(colorScheme === 'dark' ? 'dark' : 'light');

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
