import React, { useState } from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import { PieChart as PieChartIcon } from '@mui/icons-material';

// Earnings data
const earningsData = [
  { id: 0, label: 'Basic Salary', value: 18000, color: '#4CAF50' },
  { id: 1, label: 'HRA', value: 900, color: '#2196F3' },
  { id: 2, label: 'Conveyance', value: 500, color: '#9C27B0' },
  { id: 3, label: 'Medical', value: 500, color: '#FF9800' },
  { id: 4, label: 'Special', value: 595, color: '#3F51B5' },
  { id: 5, label: 'Incentive', value: 2000, color: '#E91E63' },
  { id: 6, label: 'Reimbursement', value: 500, color: '#607D8B' },
];

// Month options
const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { id: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const EarningsBreakdownCard = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('01');

  // Create a deep copy of the data
  const localEarningsData = JSON.parse(JSON.stringify(earningsData));

  // Filter logic: Adjust values based on year and month
  const filteredData = localEarningsData.map((item) => {
    const yearMultiplier = selectedYear === '2024' ? 0.9 : 1.0; // 10% reduction for 2024
    const monthIndex = months.findIndex((m) => m.value === selectedMonth);
    const monthMultiplier = 1.0 + (monthIndex * 0.01); // 1% increase per month index
    return {
      ...item,
      value: item.value * yearMultiplier * monthMultiplier,
    };
  });

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PieChartIcon sx={{ color: '#4b5e97', mr: 1 }} />
            <Typography variant="h6" sx={{ color: '#4b5e97', fontWeight: 600, fontSize: '16px' }}>
              Earnings Breakdown
            </Typography>
          </Box>
          {/* Year and Month Filters */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                color: '#4a5568',
                fontSize: '14px',
                minWidth: '100px',
                cursor: 'pointer',
              }}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                color: '#4a5568',
                fontSize: '14px',
                minWidth: '120px',
                cursor: 'pointer',
              }}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PieChart
            series={[
              {
                data: filteredData,
                innerRadius: 60,
                outerRadius: 100,
                cornerRadius: 5,
                paddingAngle: 2,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 60, additionalRadius: -5, color: 'gray' },
                highlighted: { additionalRadius: 5 },
                labelVisibility: 'none',
              },
            ]}
            colors={filteredData.map((item) => item.color)}
            height={300}
            width={300}
            slotProps={{ legend: { hidden: true } }}
          />
        </Box>
        
      </CardContent>
    </Card>
  );
};

export default EarningsBreakdownCard;