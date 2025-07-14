import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DarkModeRounded, LightModeRounded } from '@mui/icons-material';
import { useTheme } from './themeProvider';


/**
 * A button to toggle between light and dark themes.
 * 
 * @component
 * @returns {React.ReactElement} A button to toggle between light and dark themes.
 */

function ThemeSwitcher() {
  const { toggleTheme, mode } = useTheme();
  const isDarkMode = mode === 'dark';

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <Tooltip title="Toggle theme">
      <IconButton onClick={toggleTheme} color="inherit" sx={{
        backgroundColor: isDarkMode ? '#fff' : '#fff',
        borderRadius: '50%',
      }}>
        {isDarkMode ? <LightModeRounded /> : <DarkModeRounded />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeSwitcher;
