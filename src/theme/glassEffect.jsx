// src/components/GlassEffect.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';

const GlassContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  padding: theme.spacing(0),
  background: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
  borderRadius: '15px',
  backdropFilter: 'blur(10px)', // Blurring effect
  border: '1px solid rgba(255, 255, 255, 0)', // Semi-transparent border
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Soft shadow for depth
  
}));

const GlassButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  background: 'rgba(255, 255, 255, 0.3)', // Slightly more opaque for the button
  borderRadius: '8px',
  color: '#333',
  textTransform: 'none',
  transition: 'background 0.3s ease, transform 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.5)',
    transform: 'scale(1.05)',
  },
}));

export default { GlassContainer, GlassButton };
