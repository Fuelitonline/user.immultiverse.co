import React, { useState } from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { BarChart as BarChartIcon } from '@mui/icons-material';

// Base data
const baseData = [
  { category: 'Earnings', earnings: 22500, deductions: 0, netSalary: 0 },
  { category: 'Deductions', earnings: 0, deductions: 4935, netSalary: 0 },
  { category: 'Net Salary', earnings: 0, deductions: 0, netSalary: 31649 },
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
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const SalaryVsDeductionsCard = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('01');

  // Create a deep copy of the data
  const localData = JSON.parse(JSON.stringify(baseData));

  // Filter logic: Adjust values based on year and month
  const filteredData = localData.map((item) => {
    const yearMultiplier = selectedYear === '2024' ? 0.9 : 1.0; // 10% reduction for 2024
    const monthIndex = months.findIndex((m) => m.value === selectedMonth);
    const monthMultiplier = 1.0 + monthIndex * 0.01; // 1% increase per month index
    return {
      ...item,
      earnings: item.earnings * yearMultiplier * monthMultiplier,
      deductions: item.deductions * yearMultiplier * monthMultiplier,
      netSalary: item.netSalary * yearMultiplier * monthMultiplier,
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
        height: '415px',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BarChartIcon sx={{ color: '#4b5e97', mr: 1 }} />
            <Typography variant="h6" sx={{ color: '#4b5e97', fontWeight: 600, fontSize: 16 }}>
              Salary vs Deductions
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
        <BarChart
          dataset={filteredData}
          xAxis={[{ scaleType: 'band', dataKey: 'category' }]}
          yAxis={[
            {
              scaleType: 'linear',
              min: 0,
              max: 35000,
              tickInterval: 5000,
              valueFormatter: (value) => `${(value / 1000).toFixed(1)}K`, // Show in 'K' with 1 decimal
            },
          ]}
          series={[
            {
              dataKey: 'earnings',
              label: 'Earnings',
              color: '#4CAF50',
            },
            {
              dataKey: 'deductions',
              label: 'Deductions',
              color: '#ef4444',
            },
            {
              dataKey: 'netSalary',
              label: 'Net Salary',
              color: '#6b21a8',
            },
          ]}
          height={350}
          width={500}
          margin={{ top: 5, right: 50, left: 30, bottom: 60 }}
          legend={{ hidden: false }}
          sx={{
            '& .MuiChartsAxis-tickLabel': {
              fontSize: 11,
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default SalaryVsDeductionsCard;