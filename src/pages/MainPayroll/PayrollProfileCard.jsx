import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

const EmployeePayrollDetailsCard = () => (
  <Card
    sx={{
      bgcolor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      width: '100%',
      maxWidth: '1500px',
      margin: '0 auto',
      overflow: 'hidden',
    }}
  >
    {/* <CardContent sx={{ p: 1.5 }}> */}
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: '#000080',
          color: 'white',
          p: 1.5, // reduced from 2
          borderRadius: '16px 16px 0 0',
          textAlign: 'left',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Employee Payroll Details
        </Typography>
      </Box>

      {/* Main Details Card */}
      <Card
        sx={{
          bgcolor: '#f5f5f5',
          borderRadius: 8,
          mt: 2, // reduced from 2
          mb: 2, // reduced from 2
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          maxWidth: '1150px',      // Set desired width
          mx: 'auto',  
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          {/* Employee Info Section */}
          <Box
            sx={{
              p: 1.5, // reduced from 2
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 500 }}>
                John Smith
              </Typography>
              <Typography variant="body2" sx={{ color: '#1976d2' }}>
                Employee Code: EMP001
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#d3d3d3', p: 0.8, borderRadius: 4 }}>
              <Typography variant="body2" sx={{ color: '#ed6c02' }}>
                Joined: 15/01/2023
              </Typography>
            </Box>
          </Box>

          {/* Metrics Section */}
          <Box
            sx={{
              p: 1.5, // reduced from 2
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              alignItems: 'center',
              textAlign: 'left',
              
            }}
          >
              <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 4 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Fixed Salary/Month
                </Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                  ₹45,000
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 4 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Per Day Salary
                </Typography>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 500 }}>
                  ₹1,500
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 4 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Absent Days
                </Typography>
                <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 500 }}>
                  2
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 4 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                  Present Days
                </Typography>
                <Typography variant="h6" sx={{ color: '#22c55e', fontWeight: 500 }}>
                  28
                </Typography>
              </Box>
          </Box>
        </CardContent>

        {/* Salary to be Paid Section */}
        <CardContent sx={{ p: 1.5 }}>
          <Box
            sx={{
              bgcolor: '#E6E6FA',
              p: 1.5,
              borderRadius: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Salary to be Paid
              </Typography>
              <Typography variant="h6" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                ₹42,000
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    {/* </CardContent> */}
  </Card>
);

export default EmployeePayrollDetailsCard;
