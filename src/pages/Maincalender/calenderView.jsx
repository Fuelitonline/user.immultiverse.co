import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment-timezone'; // Import moment-timezone for proper time zone handling
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Chip,
  Avatar,
  Card,
  Tooltip,
  TextField
} from '@mui/material';
import { useTheme } from '@emotion/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../../middlewares/auth';
import Feedback from '@mui/icons-material/Feedback';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Person from '@mui/icons-material/Person';
import AddTaskDialog from './AddTaskDialog';
import { useGet, usePost } from '../../hooks/useApi';

// Placeholder logo paths - replace with your actual logo paths
const lightLogo = "https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/logo.png";
const darkLogo = "https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darkLogo.png";
const fallbackLogo = "/path/to/fallback-logo.png"; // Replace with a local fallback logo path

// Set moment to use IST time zone
moment.tz.setDefault('Asia/Kolkata');
moment.locale("en-GB");
const localizer = momentLocalizer(moment);

// Use current time instead of hardcoded value
const today = new Date(); // Current date and time in local timezone (IST)

function CalendarActions({ size, getTimes }) {
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dailyWork, setDailyWork] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [selected, setSelected] = useState(null);
  const theme = useTheme();
  const { user } = useAuth();
  const calendarRef = useRef(null);

  const { data: getMeetings } = useGet('meetings/get', { month: currentMonth, year: currentYear });
  const { data: getDailyWorkData, refetch } = useGet('/emplyoee/daily-work/get', {
    employeeId: user?._id,
    date: selectedDate,
  });

  const handleGiveFeedback = usePost('/emplyoee/daily-work/update');
  const handleDeleteTask = usePost('/emplyoee/daily-work/delete');

  useEffect(() => {
    if (getDailyWorkData?.data?.data) {
      setDailyWork(getDailyWorkData.data?.data);
      if (calendarRef.current) {
        calendarRef.current.forceUpdate();
      }
    } else {
      setDailyWork([]);
    }
  }, [getDailyWorkData]);

  useEffect(() => {
    if (getMeetings?.data?.data) {
      const transformedEvents = getMeetings.data.data?.data?.map(meeting => {
        // Parse meetingDate with moment to ensure correct time and timezone
        const start = meeting.meetingDate ? moment(meeting.meetingDate).toDate() : new Date();
        const end = new Date(start.getTime() + (meeting.meetingDuration || 30) * 60000);
        return {
          id: meeting._id,
          title: meeting.meetingName || "Unnamed Meeting",
          start,
          end,
          color: getColorByTimeDifference(start),
          details: `${meeting.meetingAgenda || "No agenda"} - Host: ${meeting.meetingHost || "Unknown"} - ${meeting.meetingDuration || 30} min`,
        };
      });
      setEvents(transformedEvents);
    } else {
      setEvents([]);
    }
  }, [getMeetings]);

  const getColorByTimeDifference = (eventStart) => {
    const now = new Date(); // Current time
    const timeDiff = eventStart - now;
    const minutesDiff = Math.floor(timeDiff / 60000);
    if (minutesDiff < 10 && minutesDiff >= 0) return "#ef4444"; // Red (urgent)
    if (minutesDiff < 60 && minutesDiff >= 0) return "#f59e0b"; // Yellow (soon)
    if (minutesDiff < 300 && minutesDiff >= 0) return "#10b981"; // Green (upcoming)
    if (minutesDiff >= 300) return "#6366f1"; // Blue (future)
    return "#9ca3af"; // Gray (past)
  };

  const handleNavigate = (date) => {
    setCurrentMonth(date.getMonth() + 1);
    setCurrentYear(date.getFullYear());
    getTimes && getTimes(date.getMonth() + 1, date.getFullYear());
  };

  const onSelectSlot = useCallback((slotInfo) => {
    setSelectedDate(slotInfo.start);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDescription("");
    setFile(null);
  };

  const handlePopoverOpen = (event, file, id) => {
    setSelected(id);
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
    setFeedback('');
  };

  const handleFeedbackChange = (e) => setFeedback(e.target.value);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !selected) {
      return;
    }
    
    setLoading(true);
    const data = { feedback, id: selected, feedbackGiverName: user?.name || user?.companyName || "Anonymous" };
    
    try {
      await handleGiveFeedback.mutateAsync(data);
      refetch();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setLoading(false);
      handlePopoverClose();
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      await handleDeleteTask.mutateAsync({ id });
      refetch();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setLoading(false);
    }
  };

  const dayPropGetter = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const hasTask = dailyWork.some((work) => moment(work.date).format("YYYY-MM-DD") === formattedDate);
    const isCurrentDate = 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (hasTask) {
      return {
        style: {
          backgroundColor: '#ef4444',
          opacity: 0.3,
          borderRadius: '4px',
          transition: 'background 0.3s ease',
        },
      };
    }

    if (isCurrentDate) {
      return {
        style: {
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          borderRadius: '4px',
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
  };

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: `${event.color}CC`,
      color: 'white',
      borderRadius: '6px',
      border: 'none',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
    },
  });

  const defaultDate = useMemo(() => new Date(), []);

  return (
    <Card
      elevation={4}
      sx={{
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-4px)',
        },
        overflow: 'hidden',
        width: size.width,
        height: size.height,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        position: 'relative',
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', position: 'relative', zIndex: 1 }}>
        <img
          src={theme.palette.mode === 'dark' ? darkLogo : lightLogo}
          alt="Calendar Logo"
          onError={(e) => { e.target.src = fallbackLogo; }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30%',
            opacity: 0.7,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <Calendar
          ref={calendarRef}
          localizer={localizer}
          events={events}
          eventPropGetter={eventPropGetter}
          defaultDate={defaultDate}
          startAccessor="start"
          endAccessor="end"
          onNavigate={handleNavigate}
          dayPropGetter={dayPropGetter}
          onSelectSlot={onSelectSlot}
          selectable={true}
          views={["month"]}
          defaultView="month"
          style={{
            height: size.height,
            width: size.width,
            fontFamily: '"Inter", "Roboto", sans-serif',
            border: 'none',
            background: 'transparent',
          }}
          components={{
            event: ({ event }) => (
              <Tooltip title={<EventTooltip event={event} />} arrow placement="top">
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  backgroundColor: `${generateRandomColor()}CC`,
                  px: 1,
                  py: 0.5,
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' }
                }}>
                  <Typography 
                    sx={{ 
                      color: 'white', 
                      fontSize: '12px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {event.title}
                  </Typography>
                </Box>
              </Tooltip>
            ),
            header: ({ label, onNavigate, onView }) => (
              <CalendarHeader label={label} onNavigate={onNavigate} onView={onView} />
            ),
          }}
        />
      </Box>

      <AddTaskDialog
        open={openDialog}
        onClose={handleCloseDialog}
        selectedDate={selectedDate}
        description={description}
        setDescription={setDescription}
        file={file}
        setFile={setFile}
        loading={loading}
        setLoading={setLoading}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        dailyWork={dailyWork}
        refetch={refetch}
        handleDelete={handleDelete}
      />
      
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ 
          sx: { 
            p: 3, 
            borderRadius: 2, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            width: 320
          } 
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1f2937' }}>
          Add Your Feedback
        </Typography>
        <TextField
          label="Your comments"
          value={feedback}
          onChange={handleFeedbackChange}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="What do you think about this work?"
          InputProps={{
            sx: { borderRadius: '8px' }
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': { borderColor: '#6366f1' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            onClick={handlePopoverClose}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              fontWeight: 500,
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            disabled={loading || !feedback.trim()}
            sx={{
              textTransform: 'none',
              bgcolor: '#6366f1',
              fontWeight: 600,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#4f46e5' },
              '&:disabled': { bgcolor: '#d1d5db' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Feedback'}
          </Button>
        </Box>
      </Popover>
    </Card>
  );
}

function generateRandomColor() {
  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#0ea5e9', // Sky
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#a855f7', // Purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function CalendarView({ size, getTimes }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <CalendarActions size={size} getTimes={getTimes} />
    </DndProvider>
  );
}

function EventTooltip({ event }) {
  return (
    <Box sx={{ p: 1.5, maxWidth: 300 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {event.title}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <CalendarToday sx={{ fontSize: 14, color: '#6b7280' }} />
        <Typography variant="body2" sx={{ color: '#4b5563' }}>
          {moment(event.start).format('MMM D, YYYY • h:mm A')}
        </Typography>
      </Box>
      
      <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
        {event.details}
      </Typography>
    </Box>
  );
}

function CalendarHeader({ label }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      mb: 2,
      px: 1
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
        {label}
      </Typography>
    </Box>
  );
}

export default CalendarView;
