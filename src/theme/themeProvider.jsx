import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';

// Create the context outside of the component
const ThemeContext = createContext();

/**
 * A context provider that wraps the MUI ThemeProvider. It handles the state
 * of the theme and provides a function to toggle between light and dark themes.
 * The value of the context is an object with two props: `toggleTheme` and `mode`.
 * The `toggleTheme` function switches between light and dark themes.
 * The `mode` prop is a string that indicates the current theme, either 'light' or 'dark'.
 * @param {{children: React.ReactNode}} props
 * @returns {React.ReactElement}
 */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    // Check localStorage for theme preference and set the mode accordingly
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setMode(savedTheme); // If a saved theme exists, use it
    } else {
      // Otherwise, default to 'light'
      localStorage.setItem('theme', 'light');
    }
  }, []);

  const theme = mode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);  // This can now be used to access the context
