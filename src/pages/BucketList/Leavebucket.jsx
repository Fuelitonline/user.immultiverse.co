import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import ProfileNav from '../../components/user/profiveNav';
import LeaveCards from './Leavecards';
import LeaveTable from './Leavetable';
import GlassEffect from "../../theme/glassEffect";

const LeaveBucket = () => {
  return (
    <Box sx={{
      fontFamily: 'Inter, sans-serif',
      width: '98%',
      mx: 'auto',
      minHeight: '100vh',
      py: 4,
      mr: 2,
      overflow: 'hidden',
    }}>
      <Grid container spacing={1} p={3}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <ProfileNav />
        </Grid>

        <Grid item xs={12}>
          
            <CardContent sx={{ p: 4 }}>
              <LeaveCards />
            </CardContent>
      
            <GlassEffect.GlassContainer>
                <CardContent sx={{ p: 4 }}>
                  <LeaveTable />
                </CardContent>
            </GlassEffect.GlassContainer>
          
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeaveBucket;