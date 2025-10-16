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
import axios from "axios";
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

  // API Call 1: Daily Records (Dependent on currentMonth/currentYear)
  const { data: dailyRecords, error: recordsError } = useGet("employee/work-tracking/daily-records", {
    userId: id,
    startDate: DateTime.fromObject({ year: currentYear, month: currentMonth, day: 1 }).toISODate(),
    endDate: DateTime.fromObject({ year: currentYear, month: currentMonth }).endOf("month").toISODate(),
  }, { enabled: !!id });
  
  // API Call 2: Leaves (Dependent on employeeId)
  const { data: leaves, error: leavesError } = useGet('employee/leave/get-by-id', {
    employeeId: id
  }, { enabled: !!id });
  
  // API Call 3: Policy Data (Static)
  const { data: policyData, error: policyError } = useGet("company/policy/attendece-get", { employeeId: id }, { enabled: !!id });

  const [policy, setPolicy] = useState({ workingHours: 8, workingDays: {} });

  const colorPalette = {
    attended: "#10b981",
    holiday: "#f97316",
    absent: "#ef4444",
    sandwichLeave: "#8b5cf6",
    weekend: "#e5e7eb",
    halfDay: "#fb7185",
    onLeave: "#facc15",
  };

  useEffect(() => {
    if (policyData?.data?.data) {
      setPolicy(policyData.data.data);
    }
    if (policyError) {
      setError("Failed to load policy data");
    }
  }, [policyData, policyError]);

  // Holiday Fetcher Function (API Key Dummy - Replace with actual key)
  const fetchHolidays = useCallback(async (year, month) => {
    // This is the URL structure causing repeated calls if not managed correctly
    const API_KEY = "YOUR_GOOGLE_CALENDAR_API_KEY"; // REPLACE THIS WITH YOUR REAL KEY
    if (API_KEY === "YOUR_GOOGLE_CALENDAR_API_KEY") {
        console.warn("Google Calendar API Key is a placeholder. Holidays will not fetch.");
        return [];
    }
    
    const timeMin = DateTime.fromObject({ year, month, day: 1 }).toISO();
    const timeMax = DateTime.fromObject({ year, month }).endOf("month").plus({ days: 1 }).toISO();
    const url = `https://www.googleapis.com/calendar/v3/calendars/en.indian%23holiday%40group.v.calendar.google.com/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}`;
    
    try {
      const response = await axios.get(url);
      return response.data.items.map((event) => ({
        id: event.id,
        // Ensure date parsing is robust for both date and dateTime formats
        start: new Date(event.start.date || event.start.dateTime),
        end: new Date(event.end.date || event.end.dateTime),
        title: "Holiday",
        color: colorPalette.holiday,
      }));
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
      return [];
    }
  }, [colorPalette.holiday]);
  
  
  useEffect(() => {
    const getHolidays = async () => {
        const holidays = await fetchHolidays(currentYear, currentMonth);
        setFetchedHolidays(holidays);
    };

    getHolidays();
  }, [currentYear, currentMonth, fetchHolidays]); 

  const handleSandwichLeaves = useCallback((events, absentDates, monthStart, monthEnd, policy) => {
    const sandwichLeaveDates = new Set();
    const nonWorkingDays = policy?.workingDays
      ? Object.keys(policy.workingDays)
          .filter((day) => !policy.workingDays[day])
          .map(Number)
      : [];

    for (let d = monthStart.clone(); d.isSameOrBefore(monthEnd, 'day'); d.add(1, 'day')) {
      const dayNum = d.day();
      if (!isWorkingDay(dayNum, policy)) { 
        const nonWorkingDate = d.clone();
        const dayBefore = nonWorkingDate.clone().subtract(1, 'days');
        const dayAfter = nonWorkingDate.clone().add(1, 'days');

        if (dayBefore.isSameOrAfter(monthStart) && dayAfter.isSameOrBefore(monthEnd)) {
          const nonStr = nonWorkingDate.format('YYYY-MM-DD');
          const beforeStr = dayBefore.format('YYYY-MM-DD');
          const afterStr = dayAfter.format('YYYY-MM-DD');

          if (absentDates.has(beforeStr) && absentDates.has(afterStr)) {
            sandwichLeaveDates.add(nonStr);
            sandwichLeaveDates.add(beforeStr);
            sandwichLeaveDates.add(afterStr);
          }
        }
      }
    }

    sandwichLeaveDates.forEach((date) => {
      const index = events.findIndex((e) => moment(e.start).format('YYYY-MM-DD') === date);
      if (index !== -1) {
        events.splice(index, 1);
      }
      events.push({
        id: `sandwich-${date}`,
        start: moment(date).toDate(),
        end: moment(date).toDate(),
        color: colorPalette.sandwichLeave,
        title: "Sandwich Leave",
        isSandwichLeave: true,
      });
    });
  }, [colorPalette.sandwichLeave]);
  
  const isWorkingDay = useCallback((dayNum, policy) => {
    // 0 = Sunday, 6 = Saturday
    const workingDaysPolicy = policy?.workingDays;
    // Default to true if policy isn't loaded or doesn't define the day
    if (!workingDaysPolicy) return true; 
    return workingDaysPolicy[dayNum] === true;
  }, []);

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

    // Process attendance records
    const workingHours = policy.workingHours || 8;
    const halfDayThreshold = workingHours * 0.5;
    records.forEach((entry) => {
      if (!entry?.day) return;
      const start = moment(entry.day).toDate();
      let color = colorPalette.absent;
      let title = "";

      if (entry.totalWorkingTime >= workingHours) {
        color = colorPalette.attended;
      } else if (entry.totalWorkingTime > 0 && entry.totalWorkingTime < workingHours) {
        color = entry.totalWorkingTime >= halfDayThreshold ? colorPalette.attended : colorPalette.halfDay;
      }

      transformedEvents.push({
        id: entry.day,
        start,
        end: start,
        color,
        title,
      });
    });

    
    // Build all days events
    const allDaysEvents = [];
    const absentDates = new Set();

    for (let date = monthStart.clone(); date.isSameOrBefore(monthEnd, 'day'); date.add(1, 'day')) {
      const formattedDate = date.format("YYYY-MM-DD");
      const dayNum = date.day();

      const attEvent = transformedEvents.find((e) => moment(e.start).format("YYYY-MM-DD") === formattedDate);
      
      const leave = leaves?.data?.data?.leaveRequests?.find((l) => 
        moment(l.date).format("YYYY-MM-DD") === formattedDate && ["Approved", "Pending"].includes(l.status)
      );
      const isWorkDay = isWorkingDay(dayNum, policy);

      if (attEvent) {
        allDaysEvents.push(attEvent);
      } else if (leave) {
        allDaysEvents.push({
          id: leave._id,
          start: new Date(leave.date),
          end: new Date(leave.date),
          color: leave.leaveDuration === "Half Day" ? colorPalette.halfDay : colorPalette.onLeave,
          title: "On Leave",
        });
      } else if (isWorkDay) {
        if (date.isSameOrBefore(moment(), 'day')) {
          absentDates.add(formattedDate);
          allDaysEvents.push({
            id: formattedDate,
            start: date.toDate(),
            end: date.toDate(),
            color: colorPalette.absent,
            title: "Absent",
          });
        }
      } else {
        // Not a working day (Weekend/Policy defined non-working day)
        allDaysEvents.push({
          id: formattedDate,
          start: date.toDate(),
          end: date.toDate(),
          color: colorPalette.weekend,
          title: "Weekend/Non-working Day",
          isWeekend: true,
        });
      }
    }

    // Process sandwich leaves
    handleSandwichLeaves(allDaysEvents, absentDates, monthStart, monthEnd, policy);

    const finalEvents = [...allDaysEvents];
    fetchedHolidays.forEach((h) => {
      const dateStr = moment(h.start).format("YYYY-MM-DD");
      const index = finalEvents.findIndex((e) => moment(e.start).format("YYYY-MM-DD") === dateStr);
      if (index > -1) {
        // Overwrite existing event (like weekend/absent) with holiday color
        finalEvents[index] = { ...finalEvents[index], color: colorPalette.holiday, title: "Holiday" };
      } else {
        finalEvents.push(h);
      }
    });

    setEvents(finalEvents);
    setLoading(false);
    
  // Dependencies Array Fix: `fetchedHolidays` को जोड़ा गया है ताकि हॉलिडे डेटा आने पर processing हो
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
    return events.find((event) => moment(event.start).format('YYYY-MM-DD') === dateStr);
  }, [events]);

  const getEventCountForDate = useCallback((date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return events.filter((event) => moment(event.start).format('YYYY-MM-DD') === dateStr).length;
  }, [events]);

  const isToday = useCallback((date) => {
    return date.isSame(moment(), 'day');
  }, []);

  const isCurrentMonth = useCallback((date) => {
    return date.month() === startOfMonth.month() && date.year() === startOfMonth.year();
  }, [startOfMonth]);
  
  // --- END HELPER FUNCTIONS ---


  // Filter out weekend events for the total count display
  const markedEvents = events.filter((e) => e.color !== colorPalette.weekend);

  // --- RENDER FUNCTIONS (Remains the same as before) ---

  const renderDayCell = (date) => {
    const event = getEventForDate(date);
    const eventCount = getEventCountForDate(date);
    const today = isToday(date);
    const currentMonthDay = isCurrentMonth(date);

    // Default styles for all cells (like the image)
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
      backgroundColor: '#f7f7f7', 
      border: 'none', 
      boxShadow: 'none', 
      '&:hover': {
        backgroundColor: currentMonthDay ? alpha('#3b82f6', 0.1) : '#e0e0e0',
        transform: 'none',
      },
      // Important: Ensure non-current month days look like the image
      ...(event?.isWeekend && currentMonthDay ? { backgroundColor: '#e0e0e0', color: '#777' } : {}),
      ...(!currentMonthDay ? { backgroundColor: '#ededed', color: '#a0a0a0' } : {}),
    };

    let indicator = null;
    let dotIndicator = null;
    let primaryColor = '#3b82f6'; // Default blue for attended/leave

    if (event && !event.isWeekend && currentMonthDay) {
      const eventColor = event.color;

      // Determine primary color based on event type for background
      if (eventColor === colorPalette.attended) {
        primaryColor = '#3b82f6'; // Blue (for general attendance)
      } else if (eventColor === colorPalette.onLeave || eventColor === colorPalette.halfDay || eventColor === colorPalette.sandwichLeave) {
        primaryColor = '#16a34a'; // Green (for leave/special attended)
      } else if (eventColor === colorPalette.holiday) {
        primaryColor = '#f97316'; // Orange (for holiday)
      } else if (eventColor === colorPalette.absent) {
        primaryColor = '#ef4444'; // Red (for absent)
      }

      // Apply primary styling
      cellStyle = {
        ...cellStyle,
        backgroundColor: primaryColor,
        color: 'white',
        fontWeight: 600,
        '&:hover': {
          backgroundColor: alpha(primaryColor, 0.8),
        },
      };
      
      // If there are multiple events or it's a special type, use the +N indicator
      const requiresPlusIndicator = eventCount > 1 || eventColor === colorPalette.onLeave || eventColor === colorPalette.halfDay || eventColor === colorPalette.sandwichLeave;

      if (requiresPlusIndicator) {
        const plusNum = eventCount > 1 ? eventCount : 1;
        
        // Match Day 19 (Greenish background, dark green indicator)
        if (today && eventColor !== colorPalette.absent) {
          cellStyle = {
            ...cellStyle,
            backgroundColor: '#a3e635', // Greenish-Yellow (like 19 in image)
            color: '#1f2937', // Dark text color
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
                backgroundColor: '#16a34a', // Darker Green
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
          // Default dot indicator for other marked days (like 20 and 21 in image)
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
        // Simple dot for single attended event
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
    
    // Highlight today if no special event is overriding it
    if (today && !event) {
        cellStyle = {
            ...cellStyle,
            backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue for today
            color: '#3b82f6', // Blue text
            fontWeight: 600,
        }
    }


    return (
      <Tooltip 
        title={event ? `Status: ${event.title || Object.keys(colorPalette).find(key => colorPalette[key] === event.color).replace(/([A-Z])/g, " $1").trim()}` : date.format('dddd, MMMM D')}
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