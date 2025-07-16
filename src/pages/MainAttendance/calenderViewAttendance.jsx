import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import PropTypes from 'prop-types';
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Box,
  Typography,
  Grid,
  Fade,
  useTheme,
  Card,
  Tooltip,
} from "@mui/material";
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { DateTime } from "luxon";
import { useGet } from "../../hooks/useApi";
import { useAuth } from "../../middlewares/auth";
import axios from "axios";
import { motion } from 'framer-motion';

// Placeholder logo paths - replace with your actual logo paths
const lightLogo = "https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/logo.png";
const darkLogo = "https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darkLogo.png";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);

// Utility function to format hours into hours and minutes
const formatWorkingTime = (hours) => {
  if (!hours) return "0h 0m";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
};

const CalendarViewAttendance = ({ getTimes = () => {}, size = { height: { xs: '320px', md: '400px' }, width: '100%' } }) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const id = user?._id || '';

  const { data: leaves, isLoading: leavesLoading, error: leavesError } = useGet('employee/leave/get-by-id', {
    employeeId: id
  }, { enabled: !!id });
  const { data: dailyRecords, error: recordsError } = useGet("employee/work-tracking/daily-records", {
    userId: id,
    startDate: DateTime.fromObject({ year: currentYear, month: currentMonth, day: 1 }).toISODate(),
    endDate: DateTime.fromObject({ year: currentYear, month: currentMonth }).endOf("month").toISODate(),
  }, { enabled: !!id });
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

  const fetchHolidays = useCallback(async (apiKey) => {
    const url = `https://www.googleapis.com/calendar/v3/calendars/en.indian%23holiday%40group.v.calendar.google.com/events?key=${apiKey}`;
    try {
      const response = await axios.get(url);
      return response.data.items.map((event) => ({
        id: event.id,
        start: new Date(event.start.date || event.start.dateTime),
        end: new Date(event.end.date || event.end.dateTime),
        title: "", // Empty title to remove labels
        color: colorPalette.holiday,
      }));
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
      return [];
    }
  }, []);

  const processRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!dailyRecords || recordsError || !policy) {
      setError("Failed to load attendance data");
      setLoading(false);
      setEvents([]);
      return;
    }

    const transformedEvents = [];
    const absentDates = new Set();
    const today = moment().startOf("day");
    const records = dailyRecords.data?.data?.records || [];

    if (!Array.isArray(records)) {
      setError("Invalid attendance data format");
      setLoading(false);
      setEvents([]);
      return;
    }

    // Process attendance records
    const workingHours = policy.workingHours || 8;
    const halfDayThreshold = workingHours * 0.5; // Half day is less than 50% of working hours
    records.forEach((entry) => {
      if (!entry?.day) return;
      const start = moment(entry.day).toDate();
      let color = colorPalette.absent;
      let title = ""; // Empty title to remove labels

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

    // Identify absent and weekend days
    const attendanceDays = new Set(records.map((entry) => entry.day));
    const startDate = records.length > 0 ? moment.min(records.map((entry) => moment(entry.day))) : today;

    for (let date = today.clone(); date.isAfter(startDate) || date.isSame(startDate, 'day'); date.subtract(1, "days")) {
      const formattedDate = date.format("YYYY-MM-DD");
      const isWorkingDay = policy?.workingDays?.[date.day()] ?? true;

      if (isWorkingDay && !attendanceDays.has(formattedDate)) {
        absentDates.add(formattedDate);
        transformedEvents.push({
          id: formattedDate,
          start: date.toDate(),
          end: date.toDate(),
          color: colorPalette.absent,
          title: "", // Empty title to remove labels
        });
      } else if (!isWorkingDay) {
        transformedEvents.push({
          id: formattedDate,
          start: date.toDate(),
          end: date.toDate(),
          color: colorPalette.weekend,
          title: "", // Empty title to remove labels
          isWeekend: true,
        });
      }
    }

    // Process sandwich leaves
    handleSandwichLeaves(transformedEvents, absentDates);

    // Process approved or pending leaves
    if (leaves?.data?.data?.leaveRequests) {
      leaves.data.data.leaveRequests.forEach((leave) => {
        if (!leave?.date || !["Approved", "Pending"].includes(leave.status)) return;
        const dateStr = moment(leave.date).format("YYYY-MM-DD");
        // Remove existing attendance event to avoid overlap
        const index = transformedEvents.findIndex((e) => moment(e.start).format("YYYY-MM-DD") === dateStr);
        if (index !== -1) {
          transformedEvents.splice(index, 1);
        }
        transformedEvents.push({
          id: leave._id,
          start: new Date(leave.date),
          end: new Date(leave.date),
          color: leave.leaveDuration === "Half Day" ? colorPalette.halfDay : colorPalette.onLeave,
          title: "", // Empty title to remove labels
        });
      });
    }

    // Fetch holidays (replace with your actual Google Calendar API key)
    const holidayEvents = await fetchHolidays("YOUR_GOOGLE_CALENDAR_API_KEY");
    setEvents([...transformedEvents, ...holidayEvents]);
    setLoading(false);
  }, [dailyRecords, leaves, policy, recordsError, fetchHolidays]);

  const handleSandwichLeaves = useCallback((events, absentDates) => {
    const sandwichLeaveDates = new Set();
    const nonWorkingDays = policy?.workingDays
      ? Object.keys(policy.workingDays)
          .filter((day) => !policy.workingDays[day])
          .map(Number)
      : [];

    if (nonWorkingDays.length > 0) {
      nonWorkingDays.forEach((nonWorkingDay) => {
        const today = moment();
        const weekStart = today.clone().startOf('isoWeek');
        const nonWorkingDate = weekStart.clone().add(nonWorkingDay, 'days');
        const dayBefore = nonWorkingDate.clone().subtract(1, 'days');
        const dayAfter = nonWorkingDate.clone().add(1, 'days');

        const nonWorkingDateStr = nonWorkingDate.format('YYYY-MM-DD');
        const dayBeforeStr = dayBefore.format('YYYY-MM-DD');
        const dayAfterStr = dayAfter.format('YYYY-MM-DD');

        if (absentDates.has(dayBeforeStr) && absentDates.has(dayAfterStr)) {
          sandwichLeaveDates.add(nonWorkingDateStr);
          sandwichLeaveDates.add(dayBeforeStr);
          sandwichLeaveDates.add(dayAfterStr);
        }
      });
    }

    sandwichLeaveDates.forEach((date) => {
      // Remove existing events for sandwich leave dates to avoid duplicates
      const index = events.findIndex((e) => moment(e.start).format('YYYY-MM-DD') === date);
      if (index !== -1) {
        events.splice(index, 1);
      }
      events.push({
        id: `sandwich-${date}`,
        start: moment(date).toDate(),
        end: moment(date).toDate(),
        color: colorPalette.sandwichLeave,
        title: "", // Empty title to remove labels
        isSandwichLeave: true,
      });
    });
  }, [policy, colorPalette.sandwichLeave]);

  useEffect(() => {
    processRecords();
  }, [processRecords]);

  const handleNavigate = useCallback((date) => {
    setCurrentMonth(date.getMonth() + 1);
    setCurrentYear(date.getFullYear());
    getTimes(date.getMonth() + 1, date.getFullYear());
  }, [getTimes]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
    getTimes(today.getMonth() + 1, today.getFullYear());
  }, [getTimes]);

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

  const eventPropGetter = useCallback((event) => {
    const style = {
      backgroundColor: event.color,
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
      borderRadius: event.isWeekend || event.isSandwichLeave ? '50%' : '4px',
      padding: event.isWeekend || event.isSandwichLeave ? '0' : '2px',
      fontSize: '0', // Hide text by setting font size to 0
      fontWeight: 600,
      fontFamily: "'Poppins', sans-serif",
      color: theme.palette.getContrastText(event.color || '#ffffff'),
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
    };

    if (event.isWeekend || event.isSandwichLeave) {
      style.width = '8px';
      style.height = '8px';
      style.position = 'absolute';
      style.top = '40px';
      style.right = '2px';
    }

    return { style };
  }, [theme.palette]);

  const dayPropGetter = useCallback((date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const event = events.find((e) => moment(e.start).format("YYYY-MM-DD") === formattedDate && !e.isWeekend);

    if (event) {
      return {
        style: {
          backgroundColor: event.color,
          opacity: 0.5,
          transition: 'background 0.3s ease',
        },
      };
    }

    return {
      style: {
        backgroundColor: 'transparent',
        transition: 'background 0.3s ease',
      },
    };
  }, [events]);

  return (
    <Card
      elevation={4}
      sx={{
        background: 'transparent',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          transform: 'translateY(-4px)',
        },
        overflow: 'hidden',
        width: '100%',
        minHeight: size.height,
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
        backdropFilter: 'blur(12px)',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? `url(${darkLogo}) no-repeat center center, rgba(50, 50, 50, 0.1)`
            : `url(${lightLogo}) no-repeat center center, rgba(255, 255, 255, 0.1)`,
          backgroundSize: '30%',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            zIndex: -1,
          },
        }}
      />
      <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.8 }}
        >
          <Fade in={!loading} timeout={800}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1.5rem',
                    gap: 1,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <CalendarIcon sx={{ color: theme.palette.primary.main, fontSize: '2rem' }} />
                  Attendance Calendar
                </Typography>
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
                <Box
                  sx={{
                    background: 'transparent',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    overflow: 'auto',
                    height: size.height,
                    '& .rbc-calendar': {
                      height: size.height,
                      fontFamily: "'Poppins', sans-serif",
                      '& .rbc-toolbar': {
                        background: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        padding: '8px 12px',
                        borderRadius: '10px 10px 0 0',
                        '& button': {
                          borderRadius: '8px',
                          textTransform: 'capitalize',
                          fontWeight: 500,
                          fontFamily: "'Poppins', sans-serif",
                          color: theme.palette.text.primary,
                          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                          border: `1px solid ${theme.palette.divider}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: theme.palette.primary.light,
                            color: '#ffffff',
                            transform: 'translateY(-1px)',
                          },
                        },
                      },
                      '& .rbc-month-view': {
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '12px',
                        height: '100%',
                        position: 'relative',
                        zIndex: 1,
                      },
                      '& .rbc-month-row': {
                        borderColor: theme.palette.divider,
                      },
                      '& .rbc-day-bg': {
                        background: 'transparent',
                        transition: 'background 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          background: theme.palette.action.hover,
                        },
                      },
                      '& .rbc-off-range-bg': {
                        background: theme.palette.mode === 'dark' ? '#334155' : '#e5e7eb',
                      },
                      '& .rbc-today': {
                        background: theme.palette.primary.light,
                        opacity: 0.15,
                      },
                      '& .rbc-event': {
                        display: 'none', // Hide event labels
                      },
                      '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                        borderRadius: '3px',
                        '&:hover': {
                          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                        },
                      },
                    },
                  }}
                >
                  {events.length === 0 && !loading && !error && (
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: 'center',
                        py: 2,
                        color: theme.palette.text.secondary,
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      No events to display
                    </Typography>
                  )}
                  <Calendar
                    localizer={localizer}
                    events={events}
                    views={["month"]}
                    defaultView="month"
                    startAccessor="start"
                    endAccessor="end"
                    eventPropGetter={eventPropGetter}
                    dayPropGetter={dayPropGetter}
                    onNavigate={handleNavigate}
                    defaultDate={new Date()}
                    style={{ height: size.height, width: '100%' }}
                    step={60}
                    timeslots={1}
                    components={{
                      event: ({ event }) => (
                        <Tooltip title={event.title} arrow>
                          <div style={{ display: 'none' }}>{event.title}</div> {/* Hide event labels */}
                        </Tooltip>
                      ),
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box mt={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                      <Box
                        display="flex"
                        flexDirection="row"
                        gap={1}
                        justifyContent="flex-start"
                        flexWrap="nowrap"
                        sx={{
                          overflowX: 'auto',
                          whiteSpace: 'nowrap',
                          paddingBottom: '8px',
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
                              '&:hover': { transform: 'translateY(-2px)' },
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Box
                              width={16}
                              height={16}
                              bgcolor={color}
                              mr={0.5}
                              sx={{
                                borderRadius: key === 'weekend' ? '50%' : '4px',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontFamily: "'Poppins', sans-serif",
                                color: theme.palette.text.primary,
                                textTransform: 'capitalize',
                                fontSize: '0.8rem',
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

CalendarViewAttendance.defaultProps = {
  size: {
    height: { xs: '320px', md: '400px' },
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