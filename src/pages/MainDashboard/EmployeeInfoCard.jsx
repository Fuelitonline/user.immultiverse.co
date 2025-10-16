import { Box, Grid, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { CalendarMonth, WorkHistory, Badge, AttachMoney, Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------
// 1. INFO CARD COMPONENT (Updated to match the flat dashboard UI)
// ----------------------------------------------------------------------
// Removed 'theme' from props list and added useTheme() inside the function.
const InfoCard = ({ icon, label, value, animationProps, cardType, onCardClick }) => {
    // Get the theme object directly using the Material-UI hook to fix the 'palette' undefined error.
    const theme = useTheme();

    // Defines the color scheme for each card type based on the dashboard image
    const getCardStyle = () => {
        switch (cardType) {
            case 'joinDate': // Matches the Total Employees/Attendance Rate style (Large Primary Card)
                return {
                    bgColor: '#f3f4ff', // Light Background
                    iconBgColor: '#673ab7', // Deep Purple Icon
                    color: '#333', // Dark text
                    labelColor: theme.palette.text.secondary,
                };
            case 'experience': // Matches Late Arrivals style (Yellow/Orange)
                return {
                    bgColor: '#fffbe6', // Very Light Yellow Background
                    iconBgColor: '#906038', // Deep Orange Icon
                    color: '#333',
                    labelColor: theme.palette.text.secondary,
                };
            case 'employeeId': // Matches Currently Punched In style (Blue)
                return {
                    bgColor: '#e3f2fd', // Very Light Blue Background
                    iconBgColor: '#2196f3', // Blue Icon
                    color: '#333',
                    labelColor: theme.palette.text.secondary,
                };
            case 'payroll': // Matches Checked Out style (Green)
                return {
                    bgColor: '#e8f5e9', // Very Light Green Background
                    iconBgColor: '#4caf50', // Green Icon
                    color: '#333',
                    labelColor: theme.palette.text.secondary,
                };
            default:
                return {
                    bgColor: '#fff',
                    iconBgColor: '#607d8b',
                    color: '#333',
                    labelColor: theme.palette.text.secondary,
                };
        }
    };

    const cardStyle = getCardStyle();

    // Determine if the card needs a larger font/layout (like 'Total Employees' in the image)
    const isPrimaryCard = cardType === 'joinDate';

    return (
        <Paper
            component={motion.div}
            initial={animationProps.initial}
            // Use the same animation props from the original code
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: animationProps.delay }}
            onClick={onCardClick}
            sx={{
                p: isPrimaryCard ? 3 : 2.5, // Padding adjustment
                borderRadius: '12px',
                // Flat UI styling
                backgroundColor: cardStyle.bgColor,
                color: cardStyle.color,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // Subtle shadow
                height: '100%',
                minHeight: '140px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                },
            }}
        >
            {/* Top Row: Label and Icon */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={isPrimaryCard ? 2 : 1}>
                {/* 1. Label/Title */}
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 500,
                        color: cardStyle.labelColor,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontFamily: '"Inter", sans-serif',
                        opacity: 0.9,
                        mt: 0.5, // Slight top margin for alignment
                    }}
                >
                    {label}
                </Typography>

                {/* 2. Icon Container (Solid colored box) */}
                <Box
                    sx={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: cardStyle.iconBgColor,
                        color: '#fff',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    {React.cloneElement(icon, { sx: { fontSize: '1.5rem', color: '#fff' } })}
                </Box>
            </Box>

            {/* Bottom Row: Value/Metric */}
            <Box>
                <Typography
                    variant={isPrimaryCard ? 'h4' : 'h5'} // Large font for Join Date/Experience, smaller for ID/Payroll
                    sx={{
                        fontWeight: 700,
                        color: cardStyle.color,
                        textAlign: 'left',
                        fontFamily: '"Inter", sans-serif',
                        // Ensure multi-line value (like experience/payroll) is properly aligned
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
};

// ----------------------------------------------------------------------
// 2. JOIN DATE TABLE (Pop-up component)
// ----------------------------------------------------------------------
const JoinDateTable = ({ empDetails, formatDate, onClose }) => {
    const theme = useTheme();

    // Determine the position for modal popup
    const modalPositionStyles = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1200,
        width: '90%',
        maxWidth: '600px',
        bgcolor: theme.palette.background.paper, // Use standard paper background
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        p: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={modalPositionStyles}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={600} color={theme.palette.text.primary}>
                    Employee Join Details
                </Typography>
                <Button
                    onClick={onClose}
                    sx={{
                        minWidth: 'auto', p: 1, borderRadius: '50%',
                        color: theme.palette.text.primary,
                        '&:hover': { bgcolor: theme.palette.action.hover }
                    }}
                >
                    <Close />
                </Button>
            </Box>

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '12px',
                    boxShadow: 'none',
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            {['Job Type', 'ID', 'Join Date'].map((header) => (
                                <TableCell key={header} sx={{ fontWeight: 600, bgcolor: theme.palette.action.selected }}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow
                            component={motion.tr}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            sx={{
                                '&:hover': { background: theme.palette.action.hover },
                            }}
                        >
                            <TableCell>{empDetails?.jobType || 'N/A'}</TableCell>
                            <TableCell>{empDetails?.empId || 'N/A'}</TableCell>
                            <TableCell>{formatDate(empDetails?.joiningDate) || 'N/A'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </motion.div>
    );
};


// ----------------------------------------------------------------------
// 3. MAIN COMPONENT (EmployeeInfoCards)
// ----------------------------------------------------------------------
// Removed 'theme' from props since it's now handled by useTheme() in child components
const EmployeeInfoCards = ({ empDetails, canViewSensitive, formatDate, formatCurrency, difference }) => {
    // State for controlling the join date pop-up visibility
    const [showJoinDateTable, setShowJoinDateTable] = useState(false);
    const navigate = useNavigate();

    const handleJoinDateClick = () => {
        // Toggle the visibility of the detailed join date table
        setShowJoinDateTable(!showJoinDateTable);
    };

    const handleNavigateToProfile = () => {
        // Navigate function (simulated in this example)
        console.log('Navigating to profile...');
        // navigate('/profile'); 
    };

    // Static current date simulation
    const currentDate = new Date('2025-07-15T15:02:00+05:30');
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentDay = currentDate.getDate();
    const currentYear = currentDate.getFullYear();
    const lastMonthAmount = 75000; // Static data for last month's amount

    return (
        <Box sx={{ position: 'relative' }}>
            {/* AnimatePresence for smooth mounting/unmounting of the popup and overlay */}
            <AnimatePresence>
                {/* Overlay for background blur when pop-up is visible */}
                {showJoinDateTable && canViewSensitive && (
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setShowJoinDateTable(false)} // Close on clicking outside
                        sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0, 0, 0, 0.4)', // Semi-transparent black overlay
                            backdropFilter: 'blur(4px)', // Soft blur effect
                            WebkitBackdropFilter: 'blur(4px)',
                            zIndex: 1100,
                        }}
                    />
                )}
            </AnimatePresence>

            <Grid container spacing={3}>
                {/* 1. Join Date Card (Primary/Large Look) */}
                <Grid item xs={12} sm={6} md={3}>
                    <InfoCard
                        icon={<CalendarMonth />}
                        label="Join Date"
                        value={canViewSensitive ? formatDate(empDetails?.joiningDate) : '••••••'}
                        // Removed theme={theme}
                        animationProps={{ initial: { opacity: 0, x: -50 }, delay: 0.2 }}
                        cardType="joinDate" // Purple Theme
                        onCardClick={handleJoinDateClick}
                    />
                </Grid>

                {/* 2. Experience Card (Orange/Yellow Theme) */}
                <Grid item xs={12} sm={6} md={3}>
                    <InfoCard
                        icon={<WorkHistory />}
                        label="Experience"
                        value={
                            canViewSensitive ? (
                                <Box>
                                    {/* Using dark color for text to be visible on the light background */}
                                    <Box fontSize="0.9rem" color="#444">
                                        {difference.years} years
                                    </Box>
                                    <Box fontWeight="bold" color="#333">
                                        {difference.months} months
                                    </Box>
                                </Box>
                            ) : (
                                '••••••'
                            )
                        }
                        // Removed theme={theme}
                        animationProps={{ initial: { opacity: 0, y: 50 }, delay: 0.4 }}
                        cardType="experience"
                        onCardClick={handleNavigateToProfile}
                    />
                </Grid>

                {/* 3. Employee ID Card (Blue Theme) */}
                <Grid item xs={12} sm={6} md={3}>
                    <InfoCard
                        icon={<Badge />}
                        label="Employee ID"
                        value={canViewSensitive ? empDetails?.empId || 'Not Available' : '••••••'}
                        // Removed theme={theme}
                        animationProps={{ initial: { opacity: 0, x: 50 }, delay: 0.6 }}
                        cardType="employeeId"
                        onCardClick={handleNavigateToProfile}
                    />
                </Grid>

                {/* 4. Payroll/Date Card (Green Theme) */}
                <Grid item xs={12} sm={6} md={3}>
                    <InfoCard
                        icon={<AttachMoney />}
                        label={`${currentMonth} ${currentDay}, ${currentYear}`}
                        value={
                            <div>
                                {/* Using dark color for text to be visible on the light background */}
                                <div style={{ fontSize: '0.9rem', color: '#444' }}>Last Month:</div>
                                <div style={{ fontWeight: 'bold', color: '#333' }}>{formatCurrency(lastMonthAmount)}</div>
                            </div>
                        }
                        // Removed theme={theme}
                        animationProps={{ initial: { opacity: 0, y: 50 }, delay: 0.8 }}
                        cardType="payroll"
                        onCardClick={handleNavigateToProfile}
                    />
                </Grid>
            </Grid>

            {/* Join Date Table Pop-up */}
            <AnimatePresence>
                {showJoinDateTable && canViewSensitive && (
                    <JoinDateTable
                        empDetails={empDetails}
                        formatDate={formatDate}
                        onClose={() => setShowJoinDateTable(false)}
                    />
                )}
            </AnimatePresence>
        </Box>
    );
};

export default EmployeeInfoCards;