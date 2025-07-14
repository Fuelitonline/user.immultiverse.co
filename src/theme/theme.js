// src/theme/themes.js
import { createTheme } from '@mui/material/styles';
import darkLogo from '../../src/assets/images/darkBg2.jpg';
import lightLogo from '../../src/assets/images/logo.png';
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4572ed',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
    },
  },
  logo:{
    light: lightLogo,
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    body1: {
      fontSize: '1rem',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2f655b',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#424242',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
  },
  logo:{
    dark: darkLogo,
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    body1: {
      fontSize: '1rem',
    },
  },
});
