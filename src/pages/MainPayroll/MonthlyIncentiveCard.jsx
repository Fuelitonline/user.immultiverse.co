import React, { useState } from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { TrendingUp } from '@mui/icons-material';

// Static data
const incentiveData = [
  { month: 'Jan', baseIncentive: 2000, bonusIncentive: 500, performanceIncentive: 300 },
  { month: 'Feb', baseIncentive: 2200, bonusIncentive: 600, performanceIncentive: 350 },
  { month: 'Mar', baseIncentive: 2300, bonusIncentive: 700, performanceIncentive: 400 },
  { month: 'Apr', baseIncentive: 2100, bonusIncentive: 550, performanceIncentive: 320 },
  { month: 'May', baseIncentive: 2400, bonusIncentive: 800, performanceIncentive: 450 },
  { month: 'Jun', baseIncentive: 2500, bonusIncentive: 900, performanceIncentive: 500 },
  { month: 'Jul', baseIncentive: 2600, bonusIncentive: 950, performanceIncentive: 550 },
  { month: 'Aug', baseIncentive: 2700, bonusIncentive: 1000, performanceIncentive: 600 },
  { month: 'Sep', baseIncentive: 2800, bonusIncentive: 1100, performanceIncentive: 650 },
  { month: 'Oct', baseIncentive: 2900, bonusIncentive: 1200, performanceIncentive: 700 },
  { month: 'Nov', baseIncentive: 3000, bonusIncentive: 1300, performanceIncentive: 750 },
  { month: 'Dec', baseIncentive: 3100, bonusIncentive: 1400, performanceIncentive: 800 },
];

const MonthlyIncentiveCard = () => {
  const [selectedYear, setSelectedYear] = useState('2025');

  // Create a deep copy of the data
  const localIncentiveData = JSON.parse(JSON.stringify(incentiveData));

  // Filter logic: Adjust values based on year
  const filteredData = localIncentiveData.map((item) => {
    const yearMultiplier = selectedYear === '2024' ? 0.9 : 1.0; // 10% reduction for 2024
    return {
      ...item,
      baseIncentive: item.baseIncentive * yearMultiplier,
      bonusIncentive: item.bonusIncentive * yearMultiplier,
      performanceIncentive: item.performanceIncentive * yearMultiplier,
    };
  });

  return (
    <Card
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        width: '100%',
        maxWidth: '1500px',
        margin: '0 auto',
        overflow: 'hidden',
        mt: 8,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ color: '#4b5e97', mr: 1 }} />
            <Typography variant="h6" sx={{ color: '#4b5e97', fontWeight: 600, fontSize: 16 }}>
              Monthly Incentive
            </Typography>
          </Box>
          {/* Year Filter */}
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
          </Box>
        </Box>
        <LineChart
          xAxis={[{ data: filteredData.map((item) => item.month), scaleType: 'band' }]}
          series={[
            { data: filteredData.map((item) => item.baseIncentive), label: 'Base Incentive', color: '#22c55e' },
            { data: filteredData.map((item) => item.bonusIncentive), label: 'Bonus Incentive', color: '#ef4444' },
            { data: filteredData.map((item) => item.performanceIncentive), label: 'Performance Incentive', color: '#3b82f6' },
          ]}
          height={350}
          sx={{ '& .MuiChartsAxis-label': { fontSize: '12px' } }}
          yAxis={[{ valueFormatter: (value) => `${value.toLocaleString()}` }]}
        />
      </CardContent>
    </Card>
  );
};

export default MonthlyIncentiveCard;