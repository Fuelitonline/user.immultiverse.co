import { Box, Grid, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { CalendarMonth, WorkHistory, Badge, AttachMoney, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Styled InfoCard with glassmorphism design
const InfoCard = ({ icon, label, value, theme, animationProps, cardType, onIconClick }) => {
  const getCardStyle = () => {
    switch (cardType) {
      case 'joinDate':
        return {
          background: 'linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%)',
          borderColor: 'rgba(30, 58, 138, 0.3)',
          hoverShadow: '0 8px 24px rgba(30, 58, 138, 0.4)',
        };
      case 'experience':
        return {
          background: 'linear-gradient(135deg, #166534 0%, #86EFAC 100%)',
          borderColor: 'rgba(22, 101, 52, 0.3)',
          hoverShadow: '0 8px 24px rgba(22, 101, 52, 0.4)',
        };
      case 'employeeId':
        return {
          background: 'linear-gradient(135deg, #4C1D95 0%, #C084FC 100%)',
          borderColor: 'rgba(76, 29, 149, 0.3)',
          hoverShadow: '0 8px 24px rgba(76, 29, 149, 0.4)',
        };
      case 'payroll':
        return {
          background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
          borderColor: 'rgba(217, 119, 6, 0.3)',
          hoverShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #1F2937 0%, #6B7280 100%)',
          borderColor: 'rgba(31, 41, 55, 0.3)',
          hoverShadow: '0 8px 24px rgba(31, 41, 55, 0.4)',
        };
    }
  };

  const cardStyle = getCardStyle();

  return (
    <Paper
      component={motion.div}
      initial={animationProps.initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: animationProps.delay }}
      sx={{
        p: 2.5,
        borderRadius: '20px',
        background: `${cardStyle.background}, linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        height: '140px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${cardStyle.borderColor}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: cardStyle.hoverShadow,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', pl: 2, width: '60%', zIndex: 1 }}>
        {label && (
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: '#fff',
              textAlign: 'left',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              mb: 0.5,
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {label}
          </Typography>
        )}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: '#fff',
            textAlign: 'left',
            fontSize: '1rem',
            fontFamily: '"Poppins", sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </Typography>
      </Box>
      <Box
        component={motion.div}
        whileHover={{ scale: 1.15, rotate: 10 }}
        transition={{ duration: 0.3 }}
        onClick={onIconClick}
        sx={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          p: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          cursor: 'pointer',
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: '2.5rem', color: '#fff' } })}
      </Box>
    </Paper>
  );
};

const JoinDateTable = ({ empDetails, formatDate, onClose }) => {
  const theme = useTheme();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      sx={{
        position: 'fixed',
        top: '30%',
        left: '30%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1200,
        width: '90%',
        maxWidth: '600px',
        bgcolor: 'rgba(255, 255, 255, 0.7)', // Glassmorphism background
        backdropFilter: 'blur(20px)', // Blur effect
        WebkitBackdropFilter: 'blur(20px)', // Safari compatibility
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        border: `1px solid rgba(255, 255, 255, 0.2)`,
        p: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Employee Join Details
        </Typography>
        <Button
          component={motion.div}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          sx={{
            minWidth: 'auto',
            p: 1,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            color: theme.palette.text.primary,
          }}
        >
          <Close />
        </Button>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          background: 'transparent',
          borderRadius: '12px',
          border: `1px solid rgba(255, 255, 255, 0.2)`,
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontFamily: '"Poppins", sans-serif',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                Job Type
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontFamily: '"Poppins", sans-serif',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontFamily: '"Poppins", sans-serif',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                Join Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              component={motion.tr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              sx={{
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.3s ease',
                },
              }}
            >
              <TableCell
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: '"Poppins", sans-serif',
                  borderBottom: 'none',
                }}
              >
                {empDetails?.jobType || 'Not Available'}
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: '"Poppins", sans-serif',
                  borderBottom: 'none',
                }}
              >
                {empDetails?.empId || 'Not Available'}
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.text.secondary,
                  fontFamily: '"Poppins", sans-serif',
                  borderBottom: 'none',
                }}
              >
                {formatDate(empDetails?.joiningDate) || 'Not Available'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const EmployeeInfoCards = ({ empDetails, canViewSensitive, formatDate, formatCurrency, difference, theme }) => {
  const [showJoinDateTable, setShowJoinDateTable] = useState(false);

  const handleJoinDateClick = () => {
    setShowJoinDateTable(!showJoinDateTable);
  };

  // Current date and time (01:45 PM IST on Friday, July 11, 2025)
  const currentDate = new Date('2025-07-11T13:45:00+05:30');
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentDay = currentDate.getDate();
  const currentYear = currentDate.getFullYear();
  const lastMonthAmount = 75000; // Static data for last month's amount

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Overlay for background blur when pop-up is visible */}
      {showJoinDateTable && canViewSensitive && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.4)', // Semi-transparent black overlay
            backdropFilter: 'blur(8px)', // Blur effect
            WebkitBackdropFilter: 'blur(8px)', // For Safari compatibility
            zIndex: 1100, // Below the pop-up but above other content
          }}
        />
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            icon={<CalendarMonth />}
            label="Join Date"
            value={canViewSensitive ? formatDate(empDetails?.joiningDate) : '••••••'}
            theme={theme}
            animationProps={{ initial: { opacity: 0, x: -50 }, delay: 0.2 }}
            cardType="joinDate"
            onIconClick={handleJoinDateClick}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            icon={<WorkHistory />}
            label="Experience"
            value={
              canViewSensitive ? (
                <Box>
                  <Box fontSize="0.9rem" color="#fff">
                    {difference.years} years
                  </Box>
                  <Box fontWeight="bold">
                    {difference.months} months
                  </Box>
                </Box>
              ) : (
                '••••••'
              )
            }
            theme={theme}
            animationProps={{ initial: { opacity: 0, y: 50 }, delay: 0.4 }}
            cardType="experience"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            icon={<Badge />}
            label="Employee ID"
            value={canViewSensitive ? empDetails?.empId || 'Not Available' : '••••••'}
            theme={theme}
            animationProps={{ initial: { opacity: 0, x: 50 }, delay: 0.6 }}
            cardType="employeeId"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            icon={<AttachMoney />}
            label={`${currentMonth} ${currentDay}, ${currentYear}`}
            value={
              <div>
                <div style={{ fontSize: '0.9rem', color: '#fff' }}>Last Month:</div>
                <div style={{ fontWeight: 'bold' }}>{formatCurrency(lastMonthAmount)}</div>
              </div>
            }
            theme={theme}
            animationProps={{ initial: { opacity: 0, y: 50 }, delay: 0.8 }}
            cardType="payroll"
          />
        </Grid>
      </Grid>
      {showJoinDateTable && canViewSensitive && (
        <JoinDateTable
          empDetails={empDetails}
          formatDate={formatDate}
          onClose={() => setShowJoinDateTable(false)}
        />
      )}
    </Box>
  );
};

export default EmployeeInfoCards;