import React from 'react';
import { Card, Typography, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';

const AttendanceDonutChart = () => {
  const theme = useTheme();

  const staticAttendanceData = [
    { date: '01-05', status: 'present' }, { date: '02-05', status: 'present' },
    { date: '03-05', status: 'absent' }, { date: '04-05', status: 'present' },
    { date: '05-05', status: 'present' }, { date: '06-05', status: 'absent' },
    { date: '07-05', status: 'present' }, { date: '08-05', status: 'present' },
    { date: '09-05', status: 'present' }, { date: '10-05', status: 'absent' },
    { date: '11-05', status: 'present' }, { date: '12-05', status: 'present' },
    { date: '13-05', status: 'present' }, { date: '14-05', status: 'present' },
    { date: '15-05', status: 'absent' }, { date: '16-05', status: 'present' },
    { date: '17-05', status: 'present' }, { date: '18-05', status: 'present' },
    { date: '19-05', status: 'absent' }, { date: '20-05', status: 'present' },
    { date: '21-05', status: 'present' }, { date: '22-05', status: 'present' },
    { date: '23-05', status: 'present' }, { date: '24-05', status: 'absent' },
    { date: '25-05', status: 'present' }, { date: '26-05', status: 'present' },
    { date: '27-05', status: 'present' }, { date: '28-05', status: 'present' },
    { date: '29-05', status: 'present' }, { date: '30-05', status: 'absent' },
  ];

  const attendanceCounts = staticAttendanceData.reduce(
    (acc, record) => {
      record.status === 'present' ? acc.present++ : acc.absent++;
      return acc;
    },
    { present: 0, absent: 0 }
  );

  const chartOptions = {
    chart: {
      type: 'donut',
      animations: { enabled: false }, // Removed animation
    },
    labels: ['Present', 'Absent'],
    colors: [
      theme.palette.mode === 'dark' ? '#4FC3F7' : '#0288D1',
      theme.palette.mode === 'dark' ? '#FF8A80' : '#D32F2F',
    ],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 600,
      fontFamily: '"Roboto", sans-serif',
      labels: {
        colors: theme.palette.mode === 'dark' ? '#E0E0E0' : '#212121',
      },
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
    },
    dataLabels: {
      enabled: false, // Disabled to remove percentage labels
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            
            value: {
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: '"Roboto", sans-serif',
              
              color: theme.palette.mode === 'dark' ? '#E0E0E0' : '#212121',
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: '"Roboto", sans-serif',
              color: theme.palette.mode === 'dark' ? '#E0E0E0' : '#212121',
              formatter: () => `${attendanceCounts.present + attendanceCounts.absent}`,
            },
          },
        },
      },
    },
    stroke: {
      width: 2,
      colors: [theme.palette.mode === 'dark' ? '#424242' : '#FFFFFF'],
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 280 },
          legend: { position: 'bottom', fontSize: '13px' },
        },
      },
    ],
  };

  const chartSeries = [attendanceCounts.present, attendanceCounts.absent];

  return (
    <Card
      sx={{
        padding: 3,
        height: '32vh',
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.06)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
        },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        // variant="h6"
        sx={{
          textAlign: 'left',
          fontWeight: 700,
          fontSize: '1rem',
          color: theme.palette.mode === 'dark' ? '#E0E0E0' : '#000',
          fontFamily: '"Roboto", sans-serif',
          textTransform: 'uppercase',
          mb: 2
        }}
      >
        Last Month Attendance
      </Typography>

      <Chart
        options={chartOptions}
        series={chartSeries}
        type="donut"
        width={250} // Reduced width slightly to fit better within centered layout
        height={150}
      />
    </Card>
  );
};

export default AttendanceDonutChart;