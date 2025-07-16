import React from 'react';
import { Card, Typography, useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { useNavigate } from 'react-router-dom';

const AttendanceDonutChart = () => {
  const theme = useTheme();
  const navigate = useNavigate();

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

  const colors = {
    Present: '#4CAF50', // Soft Green for Present
    Absent: '#FF7043', // Soft Coral for Absent
    Remaining: '#8fcfb3', // Light Red for consistency with Chart component
  };

  const chartOptions = {
    chart: {
      type: 'donut',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradients: true,
      },
    },
    colors: [colors.Present, colors.Absent],
    labels: ['Present', 'Absent'],
    plotOptions: {
      pie: {
        donut: {
          size: '10%',
          background: 'transparent',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      followCursor: true,
      offsetX: 10,
      theme: 'dark',
    },
    stroke: {
      width: 0,
      colors: ['grey'],
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      labels: {
        colors: theme.palette.text.primary,
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
      },
      markers: {
        width: 10,
        height: 10,
        radius: 0,
        offsetX: -10,
      },
      offsetX: 0,
      offsetY: 0,
    },
    dropShadow: {
      enabled: true,
      top: 5,
      left: 5,
      blur: 4,
      opacity: 0.2,
    },
    
  };

  const chartSeries = [attendanceCounts.present, attendanceCounts.absent];

  const handleCardClick = () => {
    navigate('/profileleave');
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
         padding: 3,
        height: "32vh",
        borderRadius: "12px",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "scale(1.06)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
          cursor: "pointer", // Add pointer cursor to indicate clickability
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            textAlign: "left",
            mb: 2,
            fontSize: '1rem'
          }}
        >
          Last Month Attendance
        </Typography>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            width={350}
            height={150}
          />
        </div>
      </div>
    </Card>
  );
};

export default AttendanceDonutChart;