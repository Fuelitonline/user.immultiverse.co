import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Grid,
  Fade,
  useTheme,
  Card,
  Tooltip,
  IconButton,
  alpha,
  Paper,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { DateTime } from "luxon";
import { useGet } from "../../hooks/useApi";
import { useAuth } from "../../middlewares/auth";
import { motion } from 'framer-motion';

// Placeholder logo paths - replace with your actual logo paths
const lightLogo = "https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/logo.png";
const darkLogo = "https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darkLogo.png";

moment.locale("en-GB");

// Utility function to format hours into hours and minutes
const formatWorkingTime = (hours) => {
  if (!hours) return "0h 0m";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
};

const CalendarViewAttendance = ({ getTimes = () => {}, size = { height: { xs: '320px', md: '600px' }, width: '100%' } }) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [fetchedHolidays, setFetchedHolidays] = useState([]); 

  const { user } = useAuth();
  const id = user?._id || '';

  const monthQuery = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

  // API Call 1: Daily Records (Dependent on currentMonth/currentYear)
  const { data: dailyRecords, error: recordsError } = useGet("employee/work-tracking/daily-records", {
    userId: id,
    startDate: DateTime.fromObject({ year: currentYear, month: currentMonth, day: 1 }).toISODate(),
    endDate: DateTime.fromObject({ year: currentYear, month: currentMonth }).endOf("month").toISODate(),
  }, { enabled: !!id });
  
  // API Call 2: Leaves (Dependent on employeeId)
  const { data: leaves, error: leavesError } = useGet('employee/leave/get-by-id',
     {
      employeeId: id,
    month: monthQuery,
    status: "Approved",
  },{ enabled: !!id });
  
  // API Call 3: Policy Data (Static)
  const { data: policyData, error: policyError } = useGet("company/policy/attendece-get", { employeeId: id }, { enabled: !!id });

  // API Call 4: Holiday Events (Dependent on month)
  const { data: holidayData, error: holidayError } = useGet("/employee/event/holiday-events", {
    month: monthQuery
  }, { enabled: !!id });

  const [policy, setPolicy] = useState({ workingHours: 8, workingDays: {} });

  const colorPalette = {
    attended: "#10b981",
    holiday: "#f97316",
    absent: "#ef4444",
    sandwichLeave: "#8b5cf6",
    weekend: "#e5e7eb",
    halfDay: "#fb7185",
    paidLeave: "#22c55e",
    unpaidLeave: "#f59e0b",
  };

  useEffect(() => {
    if (policyData?.data?.data?.[0]) {
      const pol = policyData.data.data[0];
      let workingHoursNum = 8;
      if (pol.workingHours && pol.workingHours.start && pol.workingHours.end) {
        const [startHour, startMin] = pol.workingHours.start.split(':').map(Number);
        const [endHour, endMin] = pol.workingHours.end.split(':').map(Number);
        workingHoursNum = (endHour - startHour) + ((endMin - startMin) / 60);
      }
      setPolicy({ 
        workingHours: workingHoursNum, 
        workingDays: pol.workingDays || {} 
      });
    }
    if (policyError) {
      setError("Failed to load policy data");
    }
  }, [policyData, policyError]);

  // Process holiday data
  useEffect(() => {
    if (holidayData?.data?.data) {
      const holidays = holidayData.data.data.map((h) => ({
        id: h._id,
        start: new Date(h.start),
        end: new Date(h.end),
        title: h.title,
        color: colorPalette.holiday,
      }));
      setFetchedHolidays(holidays);
    } else if (holidayError) {
      console.error("Failed to fetch holidays:", holidayError);
      setFetchedHolidays([]);
    }
  }, [holidayData, holidayError, colorPalette.holiday]);

  const isWorkingDay = useCallback((dayNum, policy) => {
    // 0 = Sunday, 6 = Saturday
    const workingDaysPolicy = policy?.workingDays;
    // Default to true if policy isn't loaded or doesn't define the day
    if (!workingDaysPolicy) return true; 
    return workingDaysPolicy[dayNum] === true;
  }, []);

  const hasAdjacentAbsentChain = useCallback((momentDate, direction, absentDates, monthStart, monthEnd, policy) => {
    // direction: 'left' for backward, 'right' for forward
    let checkMoment = momentDate.clone();
    if (direction === 'left') {
      checkMoment.subtract(1, 'days');
    } else {
      checkMoment.add(1, 'days');
    }

    if ((direction === 'left' && checkMoment.isSameOrAfter(monthStart)) ||
        (direction === 'right' && checkMoment.isSameOrBefore(monthEnd))) {
      const checkStr = checkMoment.format('YYYY-MM-DD');
      if (absentDates.has(checkStr) && checkMoment.isSameOrBefore(moment(), 'day') && isWorkingDay(checkMoment.day(), policy)) {
        return true;
      }
    }
    return false;
  }, [isWorkingDay]);

  const getAdjacentChainDates = useCallback((momentDate, direction, absentDates, monthStart, monthEnd, policy) => {
    const chainDates = new Set();
    let checkMoment = momentDate.clone();
    if (direction === 'left') {
      checkMoment.subtract(1, 'days');
    } else {
      checkMoment.add(1, 'days');
    }

    if ((direction === 'left' && checkMoment.isSameOrAfter(monthStart)) ||
        (direction === 'right' && checkMoment.isSameOrBefore(monthEnd))) {
      const checkStr = checkMoment.format('YYYY-MM-DD');
      if (absentDates.has(checkStr) && checkMoment.isSameOrBefore(moment(), 'day') && isWorkingDay(checkMoment.day(), policy)) {
        chainDates.add(checkStr);
        // Extend the chain
        let extendMoment = checkMoment.clone();
        if (direction === 'left') {
          extendMoment.subtract(1, 'days');
          while (extendMoment.isSameOrAfter(monthStart) && absentDates.has(extendMoment.format('YYYY-MM-DD')) && 
                 extendMoment.isSameOrBefore(moment(), 'day') && isWorkingDay(extendMoment.day(), policy)) {
            chainDates.add(extendMoment.format('YYYY-MM-DD'));
            extendMoment.subtract(1, 'days');
          }
        } else {
          extendMoment.add(1, 'days');
          while (extendMoment.isSameOrBefore(monthEnd) && absentDates.has(extendMoment.format('YYYY-MM-DD')) && 
                 extendMoment.isSameOrBefore(moment(), 'day') && isWorkingDay(extendMoment.day(), policy)) {
            chainDates.add(extendMoment.format('YYYY-MM-DD'));
            extendMoment.add(1, 'day');
          }
        }
      }
    }
    return chainDates;
  }, [isWorkingDay]);

  const handleSandwichLeaves = useCallback((events, absentDates, monthStart, monthEnd, policy, holidays) => {
    // Policy non-working dates: weekends + policy off days (exclude holidays)
    const policyNonWorkingDates = new Set();
    
    for (let d = monthStart.clone(); d.isSameOrBefore(monthEnd, 'day'); d.add(1, 'day')) {
      const dayNum = d.day();
      if (!isWorkingDay(dayNum, policy)) {
        policyNonWorkingDates.add(d.format('YYYY-MM-DD'));
      }
    }
    
    // Do not add holidays to policyNonWorkingDates to avoid sandwich around holidays

    // Find consecutive policy non-working blocks
    const blocks = [];
    let currentBlock = [];
    
    let currentDate = monthStart.clone();
    while (currentDate.isSameOrBefore(monthEnd, 'day')) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      if (policyNonWorkingDates.has(dateStr)) {
        if (currentBlock.length === 0) {
          currentBlock = [dateStr];
        } else {
          currentBlock.push(dateStr);
        }
      } else {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
      }
      currentDate.add(1, 'day');
    }
    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }

    const sandwichLeaveDates = new Set();

    // Process each block
    blocks.forEach((block) => {
      const blockStartStr = block[0];  // Earliest date in block
      const blockEndStr = block[block.length - 1];  // Latest
      
      const blockStartMoment = moment(blockStartStr);
      const blockEndMoment = moment(blockEndStr);
      
      // Check for left adjacent chain
      const hasLeftChain = hasAdjacentAbsentChain(blockStartMoment, 'left', absentDates, monthStart, monthEnd, policy);
      
      // Check for right adjacent chain
      const hasRightChain = hasAdjacentAbsentChain(blockEndMoment, 'right', absentDates, monthStart, monthEnd, policy);
      
      // Only if BOTH sides have adjacent absents/unpaid leaves
      if (hasLeftChain && hasRightChain) {
        // Add block dates (weekends/non-working) to sandwich
        block.forEach(dateStr => sandwichLeaveDates.add(dateStr));
        
        // Add left chain dates
        const leftChainDates = getAdjacentChainDates(blockStartMoment, 'left', absentDates, monthStart, monthEnd, policy);
        leftChainDates.forEach(dateStr => sandwichLeaveDates.add(dateStr));
        
        // Add right chain dates
        const rightChainDates = getAdjacentChainDates(blockEndMoment, 'right', absentDates, monthStart, monthEnd, policy);
        rightChainDates.forEach(dateStr => sandwichLeaveDates.add(dateStr));
      }
    });

    // Remove old events and add sandwich ones
    sandwichLeaveDates.forEach((dateStr) => {
      const index = events.findIndex((e) => e.start === dateStr);
      if (index !== -1) {
        events.splice(index, 1);
      }
      // Push for all sandwich dates (working/absent/non-working) - show future too if needed, but logic is past only
      const eventDate = moment(dateStr);
      if (eventDate.isSameOrBefore(moment(), 'day')) {  // Keep past/current only for sandwich
        events.push({
          id: `sandwich-${dateStr}`,
          start: dateStr,
          color: colorPalette.sandwichLeave,
          title: "Sandwich Leave",
          isSandwichLeave: true,
        });
      }
    });
  }, [colorPalette.sandwichLeave, isWorkingDay, hasAdjacentAbsentChain, getAdjacentChainDates]);

  const processRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!dailyRecords || recordsError || !policy) {
      if(recordsError) setError("Failed to load attendance data");
      setEvents([]);
      setLoading(false);
      return;
    }

    // --- Core processing logic ---
    
    const transformedEvents = [];
    const records = dailyRecords.data?.data?.records || []; 
    
    // Month range
    const monthStart = moment({ year: currentYear, month: currentMonth - 1 }).startOf('month');
    const monthEnd = monthStart.clone().endOf('month');

    if (!Array.isArray(records)) {
      setError("Invalid attendance data format");
      setLoading(false);
      setEvents([]);
      return;
    }

    // Process attendance records (but won't use if leave present)
    const workingHours = policy.workingHours || 8;
    const halfDayThreshold = workingHours * 0.5;
    records.forEach((entry) => {
      if (!entry?.day) return;
      const dateStr = moment(entry.day).format("YYYY-MM-DD");
      let color = colorPalette.absent;
      let title = "";

      if (entry.totalWorkingTime >= workingHours) {
        color = colorPalette.attended;
      } else if (entry.totalWorkingTime > 0 && entry.totalWorkingTime < workingHours) {
        color = entry.totalWorkingTime >= halfDayThreshold ? colorPalette.attended : colorPalette.halfDay;
      }

      transformedEvents.push({
        id: entry.day,
        start: dateStr,
        color,
        title,
      });
    });

    
    // Build all days events - PRIORITY: LEAVE > ATTENDANCE > ABSENT
    const allDaysEvents = [];
    const absentDates = new Set();

    for (let date = monthStart.clone(); date.isSameOrBefore(monthEnd, 'day'); date.add(1, 'day')) {
      const formattedDate = date.format("YYYY-MM-DD");
      const dayNum = date.day();
      const isPastOrToday = date.isSameOrBefore(moment(), 'day');

      const leave = leaves?.data?.data?.leaveRequests?.find((l) => 
        moment.utc(l.date).format("YYYY-MM-DD") === formattedDate && ["Approved", "Pending"].includes(l.status)
      );
      
      const attEvent = transformedEvents.find((e) => e.start === formattedDate);
      
      const isWorkDay = isWorkingDay(dayNum, policy);

      if (leave) {
        // LEAVE PRIORITY: Always push leave, even future
        const isHalf = leave.leaveDuration === "Half Day";
        const isPaidLeave = leave.isPaid || false;
        const leaveColor = isHalf ? colorPalette.halfDay : (isPaidLeave ? colorPalette.paidLeave : colorPalette.unpaidLeave);
        const leaveTitle = `${isHalf ? 'Half Day ' : ''}${isPaidLeave ? 'Paid ' : 'Unpaid '}Leave`;
        allDaysEvents.push({
          id: leave._id,
          start: moment.utc(leave.date).format("YYYY-MM-DD"),
          color: leaveColor,
          title: leaveTitle,
        });
        // Unpaid ko absent ki tarah treat (only past/current)
        if (!isPaidLeave && isPastOrToday) {
          absentDates.add(formattedDate);
        }
      } else if (attEvent) {
        // ATTENDANCE if no leave
        allDaysEvents.push(attEvent);
        if (attEvent.color === colorPalette.absent && isPastOrToday) {
          absentDates.add(formattedDate);
        }
      } else if (isWorkDay) {
        // ABSENT only if working day, no att/leave, and past/current
        if (isPastOrToday) {
          absentDates.add(formattedDate);
          allDaysEvents.push({
            id: formattedDate,
            start: formattedDate,
            color: colorPalette.absent,
            title: "Absent",
          });
        }
        // Future working: no event (white)
      } else {
        // Non-working: no event initially (white, even future)
      }
    }

    // Process sandwich leaves (only on absents/unpaid, past/current)
    handleSandwichLeaves(allDaysEvents, absentDates, monthStart, monthEnd, policy, fetchedHolidays);

    // Holidays merge (override everything, including future leaves/sandwich)
    const finalEvents = [...allDaysEvents];
    fetchedHolidays.forEach((h) => {
      let current = moment(h.start).clone().startOf('day');
      const endDay = moment(h.end).clone().startOf('day');
      while (current.isSameOrBefore(endDay)) {
        const dateStr = current.format("YYYY-MM-DD");
        const index = finalEvents.findIndex((e) => e.start === dateStr);
        if (index > -1) {
          finalEvents[index] = { 
            ...finalEvents[index], 
            color: h.color, 
            title: h.title 
          };
        } else {
          finalEvents.push({
            id: `holiday-${dateStr}`,
            start: dateStr,
            color: h.color,
            title: h.title,
          });
        }
        current.add(1, 'day');
      }
    });

    setEvents(finalEvents);
    setLoading(false);
    
  }, [dailyRecords, leaves, policy, recordsError, fetchedHolidays, colorPalette, isWorkingDay, handleSandwichLeaves, currentYear, currentMonth]); 

  // --- EFFECT: Trigger Data Processing (Still needed to run when data is fetched) ---
  useEffect(() => {
    // This effect runs whenever API results (dailyRecords, leaves) or policy OR fetchedHolidays change.
    if (dailyRecords || leaves || policy || fetchedHolidays) {
        processRecords();
    }
  }, [dailyRecords, leaves, policy, fetchedHolidays, processRecords]);


  // --- NAVIGATION FUNCTIONS ---
  
  const handleNext = useCallback(() => {
    const newDate = moment({ year: currentYear, month: currentMonth - 1 }).add(1, 'month');
    setCurrentMonth(newDate.month() + 1);
    setCurrentYear(newDate.year());
    getTimes(newDate.month() + 1, newDate.year()); 
  }, [currentMonth, currentYear, getTimes]);

  const handleBack = useCallback(() => {
    const newDate = moment({ year: currentYear, month: currentMonth - 1 }).subtract(1, 'month');
    setCurrentMonth(newDate.month() + 1);
    setCurrentYear(newDate.year());
    getTimes(newDate.month() + 1, newDate.year());
  }, [currentMonth, currentYear, getTimes]);
  
  // --- END NAVIGATION FUNCTIONS ---


  const generateCalendarGrid = useCallback(() => {
    const startOfMonth = moment({ year: currentYear, month: currentMonth - 1 }).startOf('month');
    const endOfMonth = startOfMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week'); // Start from Sunday
    const endDate = endOfMonth.clone().endOf('week');

    const days = [];
    let current = startDate.clone();

    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      days.push(current.clone());
      current.add(1, 'day');
    }

    // Group into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return { weeks, startOfMonth, endOfMonth };
  }, [currentMonth, currentYear]);

  const { weeks, startOfMonth, endOfMonth } = generateCalendarGrid();

  // --- HELPER FUNCTIONS ---

  const getEventForDate = useCallback((date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return events.find((event) => event.start === dateStr);
  }, [events]);

  const getEventCountForDate = useCallback((date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return events.filter((event) => event.start === dateStr).length;
  }, [events]);

  const isToday = useCallback((date) => {
    return date.isSame(moment(), 'day');
  }, []);

  const isCurrentMonth = useCallback((date) => {
    return date.month() === startOfMonth.month() && date.year() === startOfMonth.year();
  }, [startOfMonth]);
  
  // --- END HELPER FUNCTIONS ---


  // Filter out weekends (no events for them, so all events are marked: attended/absent/leave/holiday)
  const markedEvents = events; // Since no weekend events pushed

  // --- RENDER FUNCTIONS ---

  const renderDayCell = (date) => {
    const event = getEventForDate(date);
    const eventCount = getEventCountForDate(date);
    const today = isToday(date);
    const currentMonthDay = isCurrentMonth(date);
    const dayNum = date.day();
    const isWeekendDay = !isWorkingDay(dayNum, policy);

    // Default styles: white for no event (weekend or future)
    let cellStyle = {
      position: 'relative',
      height: 60,
      width: 60,
      minWidth: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px', 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '1rem',
      fontWeight: 500,
      color: currentMonthDay ? '#333' : '#a0a0a0', 
      backgroundColor: '#ffffff', 
      border: 'none', 
      boxShadow: 'none', 
      '&:hover': {
        backgroundColor: currentMonthDay ? alpha('#3b82f6', 0.1) : '#e0e0e0',
        transform: 'none',
      },
      ...(!currentMonthDay ? { backgroundColor: '#ededed', color: '#a0a0a0' } : {}),
    };

    let indicator = null;
    let dotIndicator = null;
    let primaryColor = '#3b82f6'; 

    let tooltipTitle = date.format('dddd, MMMM D');
    if (event) {
      tooltipTitle = `Status: ${event.title || Object.keys(colorPalette).find(key => colorPalette[key] === event.color)?.replace(/([A-Z])/g, " $1").trim()}`;
    } else if (isWeekendDay && currentMonthDay) {
      tooltipTitle = "Weekend/Non-working Day";
    } else if (!isWorkingDay(dayNum, policy) && !currentMonthDay) {
      tooltipTitle = "Weekend/Non-working Day";
    }
    // Future working day: default tooltip, no special

    if (event && currentMonthDay) {
      const eventColor = event.color;

      // Direct palette color for match
      primaryColor = eventColor;

      // Apply styling
      cellStyle = {
        ...cellStyle,
        backgroundColor: primaryColor,
        color: 'white',
        fontWeight: 600,
        '&:hover': {
          backgroundColor: alpha(primaryColor, 0.8),
        },
      };
      
      // Indicators logic same
      const requiresPlusIndicator = eventCount > 1 || eventColor === colorPalette.halfDay || eventColor === colorPalette.paidLeave || eventColor === colorPalette.unpaidLeave || eventColor === colorPalette.sandwichLeave;

      if (requiresPlusIndicator) {
        const plusNum = eventCount > 1 ? eventCount : 1;
        
        if (today && eventColor !== colorPalette.absent) {
          cellStyle = {
            ...cellStyle,
            backgroundColor: '#a3e635',
            color: '#1f2937',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: alpha('#a3e635', 0.8),
            },
          };
          indicator = (
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                backgroundColor: '#16a34a',
                color: 'white',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: 600,
              }}
            >
              +{plusNum}
            </Box>
          );
        } else {
          dotIndicator = (
            <Box
              sx={{
                position: 'absolute',
                bottom: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: 'white',
              }}
            />
          );
        }
      } else {
        dotIndicator = (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: 'white',
            }}
          />
        );
      }
    }
    
    // Today highlight if no event
    if (today && !event) {
        cellStyle = {
            ...cellStyle,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            fontWeight: 600,
        }
    }


    return (
      <Tooltip 
        title={tooltipTitle}
        arrow
      >
        <Box
          sx={cellStyle}
        >
          <Typography variant="body2" sx={{ fontSize: '1rem', zIndex: 1 }}>
            {date.date()}
          </Typography>
          {indicator}
          {dotIndicator}
        </Box>
      </Tooltip>
    );
  };

  const renderWeekRow = (week) => (
    <Grid container key={week[0].format('YYYY-MM-DD')} spacing={1} sx={{ mb: 1.5 }}>
      {week.map((date) => (
        <Grid item xs={12 / 7} key={date.format('YYYY-MM-DD')} sx={{ display: 'flex', justifyContent: 'center' }}>
          {renderDayCell(date)}
        </Grid>
      ))}
    </Grid>
  );

  // --- JSX RENDER ---
  return (
    <Card
      elevation={0}
      sx={{
        background: '#f7f9fc',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        width: '100%',
        height: size.height,
        position: 'relative',
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Fade in={!loading} timeout={600}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* Header Section Styling */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    mb: 1,
                    p: 0,
                }}>
                    {/* Title and Event Count */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: 'var(--background-bg-2)',
                                    fontSize: '1.4rem',
                                    fontFamily: "'Poppins', sans-serif",
                                }}
                            >
                              🗓️  Attendance Calendar
                            </Typography>
                        </Box>
                        {/* Total Events Count */}
                        <Typography
                            sx={{
                                fontWeight: 500,
                                color: 'black',
                                fontSize: '1rem',
                                fontFamily: "'Poppins', sans-serif",
                                display: 'flex',
                                gap: 1
                            }}
                        >
                            Total Marked Days: <Typography sx={{color: 'var(--text-color-2)'}}>{markedEvents.length}</Typography>
                        </Typography>
                    </Box>
                </Box>
                
                {error && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme.palette.error.main,
                            mb: 2,
                            fontFamily: "'Poppins', sans-serif",
                        }}
                    >
                        {error}
                    </Typography>
                )}
                
                {/* Calendar Wrapper Box */}
                <Paper
                elevation={6}
                    sx={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        p: { xs: 1, md: 2 },
                        overflow: 'hidden',
                    }}
                >
                    {/* Navigation */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0 }}>
                        <IconButton
                            onClick={handleBack} 
                            size="small"
                            sx={{
                                color: '#333',
                                background: '#f0f0f0',
                                borderRadius: '50%',
                                p: 1,
                                border: '1px solid #ddd',
                                '&:hover': { 
                                    backgroundColor: '#e0e0e0',
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            <KeyboardArrowLeft />
                        </IconButton>
                        
                        {/* Month and Year Display */}
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#333',
                                fontSize: '1.5rem', 
                                fontFamily: "'Poppins', sans-serif",
                                borderBottom: '2px solid #3b82f6',
                                paddingBottom: '2px',
                                lineHeight: 1.2,
                            }}
                        >
                            {startOfMonth.format('MMMM YYYY')}
                        </Typography>
                        
                        <IconButton
                            onClick={handleNext}
                            size="small"
                            sx={{
                                color: '#333',
                                background: '#f0f0f0',
                                borderRadius: '50%',
                                p: 1,
                                border: '1px solid #ddd',
                                '&:hover': { 
                                    backgroundColor: '#e0e0e0',
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            <KeyboardArrowRight />
                        </IconButton>
                    </Box>

                    {/* Day Headers */}
                    <Grid container spacing={1} mb={1}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <Grid item xs={12 / 7} key={day} sx={{ p: 0, textAlign: 'center' }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#615fff',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        fontFamily: "'Poppins', sans-serif",
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {day}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Calendar Grid */}
                    <Box sx={{ height: '100%', overflowY: 'visible', p: 0 }}>
                        {weeks.map((week) => renderWeekRow(week))}
                    </Box>
                </Paper>
                
              </Grid>
              
              {/* Legend/Key Section */}
              <Grid item xs={12}>
                <Box>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <Box
                        display="flex"
                        flexDirection="row"
                        gap={1.5}
                        justifyContent="flex-start"
                        flexWrap="nowrap"
                        sx={{
                          overflowX: 'auto',
                          whiteSpace: 'nowrap',
                          '&::-webkit-scrollbar': { display: 'none' },
                          scrollbarWidth: 'none',
                          '-ms-overflow-style': 'none',
                        }}
                      >
                        {Object.entries(colorPalette).map(([key, color]) => (
                          <Box
                            key={key}
                            display="flex"
                            alignItems="center"
                            sx={{
                              transition: 'all 0.3s ease',
                              '&:hover': { transform: 'translateY(-1px)' },
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Box
                              width={8}
                              height={8}
                              bgcolor={color}
                              mr={0.75}
                              sx={{
                                borderRadius: '50%',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontFamily: "'Poppins', sans-serif",
                                color: theme.palette.text.primary,
                                textTransform: 'capitalize',
                                fontSize: '0.75rem',
                              }}
                            >
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Fade>
        </motion.div>
      </Box>
    </Card>
  );
};

// --- PROP TYPES AND DEFAULTS ---

CalendarViewAttendance.defaultProps = {
  size: {
    height: { xs: '420px', md: '600px' },
    width: '100%',
  },
};

CalendarViewAttendance.propTypes = {
  getTimes: PropTypes.func.isRequired,
  size: PropTypes.shape({
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }).isRequired,
};

export default CalendarViewAttendance;