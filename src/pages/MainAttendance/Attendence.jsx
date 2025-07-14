import React from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import DailyRecordsTable from './tableView';
import ProfileNav from '../../components/user/profiveNav';

const Attendance = ({ size = { height: '100vh', width: '100%' } }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "1500px",
        mx: "auto",
        px: 4,
        gap: 4,
        pb: 6,
        overflowX: "hidden",
      }}
    >
      {/* Profile Navigation */}
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000, mb: 9 }}>
          <Grid item xs={12} container justifyContent='flex-end'>
            <ProfileNav />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} justifyContent="center" alignItems="stretch" sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={12}>
          <Paper
            elevation={8}
            sx={{
              width: '100%',
              borderRadius: '20px',
              borderTop: `6px solid #3498db`,
              backgroundColor: theme.palette.mode === 'dark' ? '#2c3e50' : '#ffffff',
              boxShadow: `0 10px 30px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'}`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: theme.shadows[12],
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                backgroundColor: '#aabdad',
              },
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <DailyRecordsTable />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Attendance;