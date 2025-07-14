import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';

// Data specific to SalaryCalculationCard
const calculationData = [
  { id: 0, label: 'Basic Salary (40%)', value: 18000 },
  { id: 1, label: 'HRA (5% of Basic)', value: 900 },
  { id: 2, label: 'Conveyance Allowance', value: 500 },
  { id: 3, label: 'Medical Allowance', value: 500 },
  { id: 4, label: 'Special Allowance', value: 595 },
  { id: 5, label: 'Incentive', value: 2000 },
  { id: 6, label: 'Reimbursement', value: 500 },
];

const SalaryCalculationCard = () => {
  // Create a deep copy of the data
  const localCalculationData = JSON.parse(JSON.stringify(calculationData));

  return (
    <Card
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        width: '600px',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 1, py: 1 }}>
          <AccountBalanceWallet sx={{ color: '#4b5e97', mr: 1, fontSize: '20px' }} />
          <Typography variant="h6" sx={{ color: '#4b5e97', fontWeight: 600, fontSize: '16px' }}>
            Salary Calculation Breakdown
          </Typography>
        </Box>
        {localCalculationData.map((item, index) => (
          <Box
            key={item.id}
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
                '#eceff1', // Light Gray
                '#f3e5f5', // Light Purple
              ][index],
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '14px' }}>{item.label}</Typography>
            <Typography
              variant="body2"
              sx={{
                color: [
                  '#d32f2f', // Red
                  '#1976d2', // Blue
                  '#ed6c02', // Orange
                  '#2e7d32', // Green
                  '#f57c00', // Deep Orange
                  '#455a64', // Gray
                  '#6a1b9a', // Purple
                ][index],
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              ₹{item.value}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default SalaryCalculationCard;