import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { RemoveCircleOutline } from '@mui/icons-material';

const deductionData = [
  { name: 'Employee PF (12% of Basic)', value: 2160 },
  { name: 'Employer PF (12% of Basic)', value: 2160 },
  { name: 'ESI Deduction', value: 915 },
  { name: 'Professional Tax', value: 200 },
  { name: 'TDS (5% of Present Days)', value: 500 },
];

const DeductionsCard = () => (
  <Card
    sx={{
      bgcolor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      width: '600px',
      height: '420px'
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 1, py: 1 }}>
        <RemoveCircleOutline sx={{ color: '#4b5e97', mr: 1, fontSize: '20px' }} />
        <Typography variant="h6" sx={{ color: '#4b5e97', fontWeight: 600, fontSize: '16px' }}>
          Deductions
        </Typography>
      </Box>
      {deductionData.map((item, index) => (
        <Box
          key={item.name}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 1,
            px: 2,
            mb: 1,
            bgcolor: [
              '#fce4ec', // Light Pink
              '#edf2fb', // Light Blue
              '#fef5e7', // Light Peach
              '#e8f5e9', // Light Green
              '#fff3e0', // Light Orange
            ][index],
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '14px' }}>{item.name}</Typography>
          <Typography variant="body2" sx={{ color: [
            '#d32f2f', // Red
            '#1976d2', // Blue
            '#ed6c02', // Orange
            '#2e7d32', // Green
            '#f57c00', // Deep Orange
          ][index], fontWeight: 600, fontSize: '14px' }}>₹{item.value}</Typography>
        </Box>
      ))}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          py: 1,
          px: 2,
          mt: 2,
          bgcolor: '#eceff1', // Light Gray
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <Typography variant="body2" sx={{ color: '#4a5568', fontWeight: 600, fontSize: '14px' }}>Net Salary</Typography>
        <Typography variant="body2" sx={{ color: '#6a1b9a', fontWeight: 600, fontSize: '14px' }}>₹31,649</Typography>
      </Box>
    </CardContent>
  </Card>
);

export default DeductionsCard;