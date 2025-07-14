// src/App.js
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import ThemeSwitcher from '../theme/themeSwitcher';
import { useTheme } from '../theme/themeProvider';



const ThemeChanager = () => {
  const { mode } = useTheme();
  const theme = mode === 'dark' ? 'dark' : 'light';
  
  return (
    <>
    <Box
      sx={{
        minHeight: '100vh', // Full viewport height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) => theme.palette.background.default,
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <ThemeSwitcher />
      
       
    </Box>
    </>
  );
};

export default ThemeChanager;
