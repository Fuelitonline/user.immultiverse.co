import React, { useState } from 'react';
import { Box, Container, Grid, Button } from '@mui/material';
import ProfileNav from '../../components/user/profiveNav'; // Adjust path as needed
import EmployeePayrollDetailsCard from './PayrollProfileCard';
import SalaryCalculationCard from './SalaryCalculationBreakdownCard';
import DeductionsCard from './DeductionsCard';
import EarningsBreakdownCard from './EarningsBreakdownCard';
import SalaryVsDeductionsCard from './SalaryVsDeductionCard';
import MonthlyIncentiveCard from './MonthlyIncentiveCard';
import { generatePDF } from './SalarySlip'; // Import from same directory

const PayrollPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const pdfParams = {
    month: 'April',
    year: 2021,
    saleryMonth: 3, // 0-based index for April
    employeeId: 'TNL21833191', // Matches employeeData.code from SalarySlip
    setIsLoading,
  };

  const handleSalarySlipClick = async () => {
    console.log('Salary Slip button clicked, calling generatePDF with:', pdfParams);
    try {
      const result = await generatePDF(pdfParams);
      console.log('PDF generation result:', result);
    } catch (error) {
      console.error('Error generating PDF in PayrollPage:', error.message, error.stack);
      alert(`Failed to generate salary slip: ${error.message}. Please check the console for details and try again.`);
    } finally {
      setIsLoading(false); // Always reset loading state
    }
  };

  // return (
  //     <Box sx={{ bgcolor: '#f4f6f8', flexGrow: 1 }}>
  //           Faild to load PDF: PDF generation failed
  //     </Box>
  // )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        px: { xs: 2, md: 4 },
        py: 6,
      }}
    >
      <Box sx={{ width: '100%', mb: 7 }}>
        <Grid container spacing={2} sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000, bgcolor: '#f4f6f8' }}>
          <Grid item xs={12} container justifyContent="flex-end">
            <ProfileNav />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 8, width: '100%', maxWidth: '1200px' }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#4B0082',
            color: 'white',
            borderRadius: '8px',
            px: 3,
            py: 1.5,
            '&:hover': { bgcolor: '#6b21a8' },
          }}
          onClick={handleSalarySlipClick}
          disabled={isLoading}
          aria-label="Generate Salary Slip"
        >
          {isLoading ? 'Generating PDF...' : 'Salary Slip'}
        </Button>
      </Box>

      <Container maxWidth="xl" disableGutters sx={{ width: '100%' }}>
        <EmployeePayrollDetailsCard />
        <Grid container spacing={3} sx={{ px: 0, my: 4 }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <EarningsBreakdownCard />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SalaryVsDeductionsCard />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <SalaryCalculationCard />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DeductionsCard />
          </Grid>
        </Grid>
        
        <MonthlyIncentiveCard />
      </Container>
    </Box>
  );
};

export default PayrollPage;