
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DeleteIcon from '@mui/icons-material/Delete';
import Assignment from '@mui/icons-material/Assignment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventIcon from '@mui/icons-material/Event';
import Timelapse from '@mui/icons-material/Timelapse';
import FileCopy from '@mui/icons-material/FileCopy';
import VideoCall from '@mui/icons-material/VideoCall';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SendIcon from '@mui/icons-material/Send';
import moment from 'moment-timezone';
import { useGet, usePost, usePut } from '../../hooks/useApi';
import TaskTab from './TaskTab';
import MeetingTab from './MeetingTab';
import EventTab from './EventTab';
import GetFileThumbnail from './getFileThumnail';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Divider,
  Chip,
  Tooltip,
  Paper,
  Autocomplete,
  TextField,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// --- STYLED COMPONENTS (MODIFIED FOR COMPACTNESS) ---
const StyledDialog = styled(Dialog)(({ theme, open }) => ({
  '& .MuiDialog-paper': {
    width: '500px', // Reduced from 600px
    maxWidth: 'calc(100% - 24px)', // Tighter margin
    height: 'auto',
    maxHeight: 'calc(100% - 24px)', // Reduced max height
    borderRadius: 12, // Slightly smaller radius
    boxShadow: theme.shadows[16], // Lighter shadow for smaller appearance
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  },
  transition: 'opacity 200ms ease-in-out', // Faster transition
  opacity: open ? 1 : 0,
  pointerEvents: open ? 'auto' : 'none',
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(4px)', // Reduced blur
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Lighter backdrop
  },
}));

const PrimaryTab = styled(Tab)(({ theme, active }) => ({
  minHeight: 32, // Reduced height
  minWidth: 80, // Smaller width
  textTransform: 'none',
  fontSize: 12, // Smaller font
  fontWeight: '600',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  border: active ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.grey[300]}`,
  borderRadius: 16, // Smaller radius
  padding: '6px 12px', // Tighter padding
  marginRight: 6, // Reduced margin
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // Faster transition
  '&:hover': {
    backgroundColor: active ? theme.palette.primary[50] : theme.palette.grey[50],
    boxShadow: active ? `0 3px 8px ${theme.palette.primary[100]}` : '0 1px 6px rgba(0,0,0,0.06)',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary[50],
    color: theme.palette.primary.main,
    boxShadow: `0 3px 8px ${theme.palette.primary[100]}`,
  },
}));

const StatusIndicator = styled(Box)(({ statusColor }) => ({
  position: 'absolute',
  top: 8, // Moved closer to edge
  right: 8,
  width: 8, // Smaller indicator
  height: 8,
  borderRadius: '50%',
  backgroundColor: statusColor,
  boxShadow: `0 0 6px ${statusColor}20`,
}));

const ItemContainer = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12, // Smaller radius
  marginBottom: 8, // Reduced margin
  backgroundColor: theme.palette.background.paper,
  backdropFilter: 'blur(8px)', // Slightly reduced blur
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: theme.shadows[6], // Lighter shadow
    transform: 'translateY(-1px)', // Subtle lift
  },
}));

const FeedbackMessage = styled(Box)(({ theme, isOwn }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: isOwn ? 'flex-end' : 'flex-start',
  marginBottom: 12, // Reduced margin
  maxWidth: '80%', // Slightly wider for compactness
}));

const MessageBubble = styled(Paper)(({ theme, isOwn }) => ({
  position: 'relative',
  padding: theme.spacing(1.5), // Reduced padding
  borderRadius: 14, // Smaller radius
  backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.grey[100],
  color: isOwn ? 'white' : theme.palette.text.primary,
  fontSize: '0.75rem', // Smaller font
  lineHeight: 1.4,
  maxWidth: '100%',
  wordWrap: 'break-word',
  boxShadow: isOwn ? '0 3px 8px rgba(25, 118, 210, 0.2)' : theme.shadows[1],
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    border: '6px solid transparent', // Smaller triangle
    ...(isOwn
      ? {
          right: -6,
          borderBottomColor: theme.palette.primary.main,
          borderRightColor: 'transparent',
        }
      : {
          left: -6,
          borderBottomColor: theme.palette.grey[100],
          borderLeftColor: 'transparent',
        }),
  },
  ...(isOwn
    ? { borderBottomRightRadius: 3 }
    : { borderBottomLeftRadius: 3 }),
}));

const MessageMeta = styled(Box)(({ theme, isOwn }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: isOwn ? 'flex-end' : 'flex-start',
  marginBottom: 0.25, // Tighter margin
  fontSize: '0.65rem', // Smaller font
  width: '100%',
  ...(isOwn
    ? {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
      }
    : {
        justifyContent: 'space-between',
      }),
}));

const RoleChip = styled(Chip)(({ theme, roleColor }) => ({
  height: 16, // Smaller chip
  fontSize: 8, // Smaller font
  fontWeight: 'bold',
  ml: 0.25,
  backgroundColor: roleColor || theme.palette.grey[300],
  color: theme.palette.grey[800],
  borderRadius: 8,
}));

// --- FEEDBACK MODAL COMPONENT ---
function FeedbackModal({
  open,
  onClose,
  taskId,
  onFeedbackAdded,
  queryClient,
  currentUserId,
  queryDate,
}) {
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: taskData, isLoading: taskLoading, error: taskError } = useGet(
    `/employee/daily-work/${taskId}`,
    {},
    {},
    { queryKey: ['task', taskId], enabled: !!taskId },
  );

  const addFeedbackMutation = usePost(
    `/employee/daily-work/${taskId}/feedback`,
    {},
    'feedback',
  );

  const markReadMutation = usePut(
    `/employee/daily-work/${taskId}/feedback/mark-read`,
    {},
    ['task', taskId],
  );

  const feedbacks = taskData?.data?.data?.feedBack || [];
  console.log(feedbacks,'data is here......');

  useEffect(() => {
    if (taskError) {
      console.error('🔍 DEBUG - Task fetch error:', taskError);
    }
  }, [taskError]);

  const markReadCalledRef = useRef(false);
  useEffect(() => {
    if (open && taskId && !markReadCalledRef.current) {
      markReadMutation.mutateAsync({}).then(() => {
        console.log(`✅ Marked as read for task ${taskId}. Invalidating queries...`);
        queryClient.invalidateQueries(['task', taskId]);
        queryClient.invalidateQueries(['tasks', queryDate]);
        markReadCalledRef.current = true;
      });
    }
  }, [open, taskId, markReadMutation, queryClient, queryDate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedbacks]);

  const handleCloseWithInvalidation = useCallback(() => {
    if (queryDate) {
      queryClient.invalidateQueries(['tasks', queryDate]);
    } else {
      queryClient.invalidateQueries(['tasks']);
    }
    onClose();
  }, [onClose, queryClient, queryDate]);

  const handleSendFeedback = useCallback(async () => {
    if (!feedbackText.trim()) return;
    setLoading(true);
    try {
      await addFeedbackMutation.mutateAsync({ feedback: feedbackText });
      setFeedbackText('');
      onFeedbackAdded();
      queryClient.invalidateQueries(['task', taskId]);
      queryClient.invalidateQueries(['tasks']);
      console.log(`✅ Feedback sent for task ${taskId}`);
    } catch (error) {
      console.error('❌ Error sending feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [feedbackText, addFeedbackMutation, onFeedbackAdded, taskId, queryClient]);

  if (!open || !taskId) return null;

  if (taskLoading) {
    return (
      <StyledDialog open={open} onClose={handleCloseWithInvalidation}>
        <DialogTitle sx={{ fontSize: '1rem', py: 1.5 }}>Loading Task...</DialogTitle>
        <DialogContent><CircularProgress size={20} /></DialogContent>
      </StyledDialog>
    );
  }

  if (taskError) {
    return (
      <StyledDialog open={open} onClose={handleCloseWithInvalidation}>
        <DialogTitle sx={{ fontSize: '1rem', py: 1.5 }}>Error Loading Task</DialogTitle>
        <DialogContent>
          <Typography color="error" fontSize="0.85rem">
            Failed to load: {taskError?.message || 'Unknown error'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWithInvalidation} size="small">Close</Button>
        </DialogActions>
      </StyledDialog>
    );
  }

  if (!taskData?.data) {
    return (
      <StyledDialog open={open} onClose={handleCloseWithInvalidation}>
        <DialogTitle sx={{ fontSize: '1rem', py: 1.5 }}>No Task Data</DialogTitle>
        <DialogContent>
          <Typography color="warning" fontSize="0.85rem">
            Task not found. Please try again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWithInvalidation} size="small">Close</Button>
        </DialogActions>
      </StyledDialog>
    );
  }

  const taskDetails = taskData?.data?.data;
  const assignById = taskDetails?.assignBy?._id?.toString() || '';
  const assignForId = taskDetails?.assignFor?._id?.toString() || '';

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager':
        return 'warning.main';
      case 'superadmin':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  return (
    <StyledDialog open={open} onClose={handleCloseWithInvalidation}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--background-bg-2)',
          color: 'white',
          py: 1.5, // Reduced padding
          fontSize: '1rem', // Smaller font
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem', color: 'white' }}>
            Task Feedback
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'white' }}>
            {taskDetails?.title}
          </Typography>
        </Box>
        <IconButton onClick={handleCloseWithInvalidation} sx={{ color: 'white', p: 0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ height: 400, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2, // Reduced padding
            bgcolor: 'grey.50',
            backgroundImage: 'linear-gradient(to bottom, #f0f2f5 0%, #ffffff 100%)',
          }}
        >
          {feedbacks.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
              <Typography color="text.secondary" align="center" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                No feedback yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            feedbacks.map((fb, idx) => {
              const isOwnMessage = fb.feedbackBy?._id?.toString() === currentUserId;
              const isFromAssignBy = fb.feedbackBy?._id?.toString() === assignById;
              const role = fb.feedbackBy?.role || 'User';
              const roleColor = getRoleColor(role);

              return (
                <FeedbackMessage key={idx} isOwn={isOwnMessage}>
                  <MessageMeta isOwn={isOwnMessage}>
                    <Box display="flex" alignItems="center" sx={{ order: isOwnMessage ? 2 : 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="medium" fontSize="0.65rem">
                        {fb.feedbackGiverName || 'Unknown'}
                      </Typography>
                      <RoleChip
                        label={`(${role})`}
                        size="small"
                        sx={{ ml: 0.25, backgroundColor: roleColor, color: 'white' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" fontSize="0.65rem" sx={{ order: isOwnMessage ? 1 : 2 }}>
                      {moment(fb.timestamp).tz('Asia/Kolkata').format('h:mm A')}
                    </Typography>
                  </MessageMeta>
                  <MessageBubble isOwn={isOwnMessage}>
                    <Typography fontSize="0.75rem">{fb.feedback}</Typography>
                  </MessageBubble>
                </FeedbackMessage>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', mt: 0, p: 1.5, bgcolor: 'white' }}>
          <TextField
            fullWidth
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Type your feedback..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendFeedback()}
            disabled={loading}
            size="small"
            multiline
            maxRows={2} // Reduced max rows
            sx={{
              mr: 0.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 20,
                backgroundColor: 'grey.50',
                fontSize: '0.8rem', // Smaller font
                padding: '4px 8px', // Tighter padding
              },
            }}
          />
          <IconButton
            onClick={handleSendFeedback}
            disabled={!feedbackText.trim() || loading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '100%',
              height: 30, // Smaller button
              width: 30,
              p: 0.4,
              m: 'auto',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'grey.300' },
            }}
            size="small"
          >
            <SendIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 1.5, bgcolor: 'grey.50' }}>
        <Button onClick={handleCloseWithInvalidation} variant="outlined" size="small" sx={{ borderRadius: 8, fontSize: '0.8rem' }}>
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}

// --- ADD TASK DIALOG COMPONENT ---
function AddTaskDialog({
  open,
  onClose,
  selectedDate,
  selectedDateRange,
  description,
  setDescription,
  file,
  setFile,
  dailyWork,
  handleDelete,
  currentUserId,
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const itemsPerPage = 10;

  // Date Normalization Logic (unchanged)
  const incomingRange = selectedDate && selectedDate.start && selectedDate.end ? selectedDate : selectedDateRange;

  const normalizedSelectedDate = selectedDate && !incomingRange && moment(selectedDate).isValid()
    ? moment(selectedDate).tz('UTC').startOf('day').toISOString()
    : null;

  const normalizedDateRange = incomingRange && moment(incomingRange.start).isValid() && moment(incomingRange.end).isValid()
    ? {
        start: moment(incomingRange.start).tz('UTC').startOf('day').toISOString(),
        end: moment(incomingRange.end).tz('UTC').startOf('day').toISOString(),
      }
    : null;

  const queryDate = normalizedDateRange?.start || normalizedSelectedDate || null;

  // API Data Fetching (unchanged)
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useGet(
    '/employee/daily-work/get',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['tasks', queryDate, currentPage], enabled: !!queryDate },
  );
  const { data: meetingsData, isLoading: meetingsLoading, error: meetingsError } = useGet(
    '/meetings/get',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['meetings', queryDate, currentPage], enabled: !!queryDate },
  );
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useGet(
    '/event',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['events', queryDate, currentPage], enabled: !!queryDate },
  );
  const { data: employees, error: employeesError } = useGet('/employee/all', {}, {}, { queryKey: ['employees'] });

  const tasks = Array.isArray(tasksData?.data?.data?.data) ? tasksData.data.data.data : [];
  const meetings = Array.isArray(meetingsData?.data?.data?.data)
    ? meetingsData.data.data.data.map((meeting) => ({
        ...meeting,
        start_time_Date: meeting.meetingDate,
        end_time_Date: moment(meeting.meetingDate).add(parseInt(meeting.meetingDuration), 'minutes').toISOString(),
        meetingName: meeting.meetingName,
        meetingDescription: meeting.meetingAgenda,
        registrants: meeting.access,
      }))
    : [];
  const events = Array.isArray(eventsData?.data) ? eventsData.data : Array.isArray(eventsData?.data?.data) ? eventsData.data.data : [];

  const pagination = {
    tasks: tasksData?.data?.pagination || {
      total: tasks.length,
      totalPages: Math.ceil(tasks.length / itemsPerPage),
      currentPage: currentPage,
      limit: itemsPerPage,
    },
    meetings: meetingsData?.data?.pagination || {
      total: meetings.length,
      totalPages: Math.ceil(meetings.length / itemsPerPage),
      currentPage: currentPage,
      limit: itemsPerPage,
    },
    events: eventsData?.data?.pagination || {
      total: events.length,
      totalPages: Math.ceil(events.length / itemsPerPage),
      currentPage: currentPage,
      limit: itemsPerPage,
    },
  };

  useEffect(() => {
    if (mainTab === 0 && tasksData?.data?.pagination?.page) {
      setCurrentPage(tasksData.data.pagination.page);
    } else if (mainTab === 1 && meetingsData?.data?.pagination?.page) {
      setCurrentPage(meetingsData.data.pagination.page);
    } else if (mainTab === 2 && eventsData?.data?.pagination?.page) {
      setCurrentPage(eventsData.data.pagination.page);
    }
  }, [mainTab, tasksData, meetingsData, eventsData]);

  const handleTaskAdded = useCallback(() => {
    queryClient.invalidateQueries(['tasks', queryDate, currentPage]);
    setCurrentPage(1);
    setSubTab(1);
  }, [queryClient, queryDate, currentPage]);

  const handleMeetingAdded = useCallback(() => {
    queryClient.invalidateQueries(['meetings', queryDate, currentPage]);
    setCurrentPage(1);
    setSubTab(1);
  }, [queryClient, queryDate, currentPage]);

  const handleEventAdded = useCallback(() => {
    queryClient.invalidateQueries(['events', queryDate, currentPage]);
    setCurrentPage(1);
    setSubTab(1);
  }, [queryClient, queryDate, currentPage]);

  const handleOpenFeedbackModal = useCallback((taskId) => {
    setSelectedTaskId(taskId);
    setOpenFeedbackModal(true);
  }, []);

  const handleFeedbackAdded = useCallback(() => {
    queryClient.invalidateQueries(['tasks', queryDate]);
  }, [queryClient, queryDate]);

  const getEmployeeName = (employee) => {
    if (!employee) return 'Unknown';
    if (typeof employee === 'object' && employee?._id && employee?.name) return employee.name;
    const employeeList = employees?.data?.message?.[0] || [];
    const foundEmployee = employeeList.find((emp) => emp?._id === employee);
    return foundEmployee?.name || 'Unknown';
  };

  const getStatus = (date) => {
    if (!date || !moment(date).isValid()) return 'Unknown';
    const now = moment().tz('UTC');
    const eventTime = moment(date).tz('UTC');
    if (now.isAfter(eventTime)) return 'Completed';
    if (now.isBefore(eventTime)) return 'Upcoming';
    return 'Ongoing';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return theme.palette.success.main;
      case 'Ongoing':
        return theme.palette.warning.main;
      case 'Upcoming':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const copyToClipboard = (text) => {
    if (!text || typeof text !== 'string') {
      setErrorMessage('No valid link to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setErrorMessage('Link copied to clipboard!');
      setTimeout(() => setErrorMessage(''), 2000);
    }).catch(() => {
      setErrorMessage('Failed to copy link');
    });
  };

  const renderContent = (data, type) => {
    if (!queryDate) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <Typography color="error" variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
            No date selected
          </Typography>
        </Box>
      );
    }

    const isLoading = (type === 'tasks' && tasksLoading) || (type === 'meetings' && meetingsLoading) || (type === 'events' && eventsLoading);
    const error = (type === 'tasks' && tasksError) || (type === 'meetings' && meetingsError) || (type === 'events' && eventsError);

    if (isLoading) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={3}>
          <CircularProgress size={20} color="primary" sx={{ mb: 0.5 }} />
          <Typography color="textSecondary" variant="body2" fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
            Loading {type}...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={3}>
          <Typography color="error" variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
            Error loading {type}: {error?.message || 'Unknown error'}
          </Typography>
        </Box>
      );
    }

    const safeData = Array.isArray(data) ? data : [];
    if (safeData.length === 0) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={3}>
          <Box
            borderRadius="50%"
            bgcolor="grey.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={1}
            p={1.5}
            sx={{ boxShadow: '0 3px 8px rgba(0,0,0,0.08)' }}
          >
            <CalendarTodayIcon sx={{ fontSize: 20, color: 'grey.500' }} />
          </Box>
          <Typography color="textSecondary" variant="h6" fontWeight="medium" mb={1} sx={{ fontSize: '0.9rem' }}>
            No {type} logged for this date
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => setSubTab(0)}
            sx={{
              textTransform: 'none',
              borderRadius: 16,
              boxShadow: '0 3px 8px rgba(25, 118, 210, 0.2)',
              fontSize: '0.75rem',
              py: 0.5,
              px: 2,
            }}
          >
            Add a {type.slice(0, -1)}
          </Button>
        </Box>
      );
    }

    const totalItems = type === 'tasks' ? pagination.tasks.total : type === 'meetings' ? pagination.meetings.total : pagination.events.total;
    const totalPages = type === 'tasks' ? pagination.tasks.totalPages : type === 'meetings' ? pagination.meetings.totalPages : pagination.events.totalPages;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedData = safeData.slice(startIndex, endIndex);

    return (
      <Box sx={{ overflowY: 'auto', p: 0.5 }}>
        {paginatedData.map((item, index) => {
          const isMeeting = type === 'meetings';
          const isEvent = type === 'events';
          const isDailyWork = type === 'tasks';
          const duration = isMeeting ? parseInt(item.meetingDuration) || 0 : 0;
          const status = isMeeting ? getStatus(item.start_time_Date) : isEvent ? getStatus(item.start) : item.status;
          const statusColor = status ? getStatusColor(status) : null;
          const unreadCount = isDailyWork
            ? item.feedBack?.filter((fb) => {
                const isOwn = fb.feedbackBy?._id?.toString() === currentUserId;
                if (isOwn) return false;
                if (!fb.readBy || !Array.isArray(fb.readBy)) return true;
                return !fb.readBy.some((rbId) => rbId.toString() === currentUserId);
              }).length || 0
            : 0;

          return (
            <ItemContainer key={item._id || index} elevation={0}>
              {(isMeeting || isEvent || isDailyWork) && status !== 'Unknown' && <StatusIndicator statusColor={statusColor} />}
              <Box p={2} sx={{ position: 'relative' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Box
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      width={36}
                      height={36}
                      sx={{
                        bgcolor: isDailyWork ? 'success.50' : isMeeting ? 'info.50' : 'secondary.50',
                        color: isDailyWork ? 'success.main' : isMeeting ? 'info.main' : 'secondary.main',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                      }}
                    >
                      {isDailyWork ? (
                        <Assignment sx={{ fontSize: 16 }} />
                      ) : isMeeting ? (
                        <MeetingRoomIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <EventIcon sx={{ fontSize: 16 }} />
                      )}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold" color="text.primary" mb={0.25} sx={{ fontSize: '0.9rem' }}>
                        {isDailyWork
                          ? item.title || 'No Description'
                          : isMeeting
                          ? item.meetingName || 'Unnamed Meeting'
                          : item.title || 'Unnamed Event'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        mb={0.5}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 14 }} />
                        {isDailyWork
                          ? item.startDate === item.endDate
                            ? moment(item.startDate).tz('Asia/Kolkata').format('MMMM D, YYYY')
                            : `${moment(item.startDate).tz('Asia/Kolkata').format('MMMM D, YYYY')} - ${moment(item.endDate).tz('Asia/Kolkata').format('MMMM D, YYYY')}`
                          : isMeeting
                          ? `${moment(item.start_time_Date).tz('Asia/Kolkata').format('MMMM D, YYYY, h:mm A')} - ${moment(item.end_time_Date).tz('Asia/Kolkata').format('h:mm A')}`
                          : `${moment(item.start).tz('Asia/Kolkata').format('MMMM D, YYYY, h:mm A')} - ${moment(item.end).tz('Asia/Kolkata').format('h:mm A')}`}
                      </Typography>
                      {isMeeting && (
                        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                          <Timelapse sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
                            {item.meetingDuration || duration ? `${item.meetingDuration || duration} min` : 'Duration Unknown'}
                          </Typography>
                        </Box>
                      )}
                      {isEvent && (
                        <Typography variant="body2" color="text.secondary" mb={0.5} fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
                          Type: {item.type || 'N/A'}
                        </Typography>
                      )}
                      <Box display="flex" flexWrap="wrap" gap={0.5} mb={0.5}>
                        <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Assigned:
                        </Typography>
                        {(Array.isArray(item.assignFor) ? item.assignFor : [item.assignFor]).filter(Boolean).map((employeeId, i) => (
                          <Chip
                            key={i}
                            label={getEmployeeName(employeeId)}
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 18,
                              bgcolor: 'primary.50',
                              color: 'primary.main',
                              borderRadius: 8,
                            }}
                          />
                        ))}
                      </Box>
                      {isDailyWork && Array.isArray(item.guests) && item.guests.length > 0 && (
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          <Typography variant="body2" fontWeight="bold" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Guests:
                          </Typography>
                          {item.guests.filter(Boolean).map((guestEmail, i) => (
                            <Chip
                              key={i}
                              label={guestEmail}
                              size="small"
                              sx={{
                                fontSize: 10,
                                height: 18,
                                bgcolor: 'secondary.50',
                                color: 'secondary.main',
                                borderRadius: 8,
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={0.5} alignItems="flex-end">
                    {isDailyWork ? (
                      <>
                        <Tooltip title="Chat Feedback">
                          <Badge
                            badgeContent={unreadCount > 0 ? unreadCount : 0}
                            color="error"
                            max={99}
                            sx={{ '& .MuiBadge-badge': { fontSize: 8, minWidth: 16, height: 16 } }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleOpenFeedbackModal(item._id)}
                              sx={{
                                bgcolor: 'info.50',
                                color: 'info.main',
                                borderRadius: '50%',
                                '&:hover': { bgcolor: 'info.100' },
                                p: 0.5,
                              }}
                            >
                              <FeedbackIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Badge>
                        </Tooltip>
                        <Tooltip title="Delete Task">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item._id)}
                            sx={{
                              bgcolor: 'error.50',
                              color: 'error.main',
                              borderRadius: '50%',
                              '&:hover': { bgcolor: 'error.100' },
                              p: 0.5,
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Chip
                        label={status}
                        size="small"
                        sx={{
                          bgcolor: statusColor,
                          color: 'white',
                          fontSize: 10,
                          fontWeight: '600',
                          borderRadius: 10,
                          height: 20,
                        }}
                      />
                    )}
                  </Box>
                </Box>
                {isDailyWork && (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    mb={1}
                    p={1}
                    sx={{
                      border: 1,
                      borderColor: 'grey.200',
                      borderRadius: 10,
                      bgcolor: 'grey.50',
                    }}
                  >
                    {item.file && item.fileType ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <GetFileThumbnail fileType={item.fileType} fileUrl={item.file} />
                        <Typography
                          component="a"
                          href={item.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          color="primary"
                          sx={{
                            fontWeight: '500',
                            fontSize: '0.75rem',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {item.fileType || 'Document'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.25, fontStyle: 'italic', fontSize: '0.75rem' }}>
                        No File Attached
                      </Typography>
                    )}
                  </Box>
                )}
                {(isMeeting || isEvent) && (
                  <Box mt={1}>
                    <Box mb={1}>
                      <Typography variant="body2" fontWeight="bold" color="text.primary" mb={0.5} sx={{ fontSize: '0.8rem' }}>
                        {isMeeting ? 'Agenda' : 'Description'}
                      </Typography>
                      <Box p={1.5} sx={{ border: 1, borderColor: 'grey.200', borderRadius: 10, bgcolor: 'grey.50' }}>
                        <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                          {item.meetingDescription || item.description || 'No description provided'}
                        </Typography>
                      </Box>
                    </Box>
                    {isEvent && item.file && item.fileType && (
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        mb={1}
                        p={1}
                        sx={{
                          border: 1,
                          borderColor: 'grey.200',
                          borderRadius: 10,
                          bgcolor: 'grey.50',
                        }}
                      >
                        <GetFileThumbnail fileType={item.fileType} fileUrl={item.file} />
                        <Typography
                          component="a"
                          href={item.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          color="primary"
                          sx={{
                            fontWeight: '500',
                            fontSize: '0.75rem',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {item.fileType || 'Document'}
                        </Typography>
                      </Box>
                    )}
                    {isMeeting && (
                      <>
                        <Typography variant="body2" color="text.secondary" mb={0.5} fontWeight="medium" sx={{ fontSize: '0.75rem' }}>
                          Attendees:{' '}
                          {item.meetingFor?.length > 0
                            ? item.meetingFor.map((attendee) => attendee.email).join(', ')
                            : item.registrants?.length > 0
                            ? item.registrants.map((id) => getEmployeeName(id)).join(', ')
                            : 'None'}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                          <Button
                            size="small"
                            onClick={() => copyToClipboard(item.meetingLink)}
                            disabled={!item.meetingLink}
                            startIcon={<FileCopy sx={{ fontSize: 14 }} />}
                            variant="outlined"
                            sx={{
                              textTransform: 'none',
                              fontSize: 11,
                              borderRadius: 8,
                              px: 1.5,
                              py: 0.5,
                              color: item.meetingLink ? 'text.primary' : 'text.disabled',
                              '&:hover': {
                                borderColor: item.meetingLink ? 'primary.main' : 'grey.300',
                                color: item.meetingLink ? 'primary.main' : 'text.disabled',
                              },
                            }}
                          >
                            Copy Link
                          </Button>
                          <Button
                            size="small"
                            href={item.meetingLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<VideoCall sx={{ fontSize: 14 }} />}
                            disabled={!item.meetingLink}
                            variant="contained"
                            sx={{
                              textTransform: 'none',
                              fontSize: 11,
                              borderRadius: 8,
                              px: 1.5,
                              py: 0.5,
                              bgcolor: item.meetingLink ? 'primary.main' : 'grey.300',
                              color: 'white',
                              boxShadow: item.meetingLink ? '0 3px 8px rgba(25, 118, 210, 0.2)' : 'none',
                              '&:hover': {
                                bgcolor: item.meetingLink ? 'primary.dark' : 'grey.300',
                                boxShadow: item.meetingLink ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                              },
                            }}
                            onClick={(e) => !item.meetingLink && e.preventDefault()}
                          >
                            Join Meeting
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </ItemContainer>
          );
        })}
        {totalPages > 1 && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={1.5}
            sx={{
              borderTop: 1,
              borderColor: 'grey.200',
              borderRadius: '0 0 12px 12px',
              bgcolor: 'grey.50',
            }}
          >
            <Button
              size="small"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              startIcon={<ChevronLeftIcon sx={{ fontSize: 14 }} />}
              variant="text"
              sx={{
                textTransform: 'none',
                fontSize: 11,
                fontWeight: '600',
                color: currentPage === 1 ? 'text.disabled' : 'primary.main',
              }}
            >
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              size="small"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
              variant="text"
              sx={{
                textTransform: 'none',
                fontSize: 11,
                fontWeight: '600',
                color: currentPage === totalPages ? 'text.disabled' : 'primary.main',
              }}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <Box sx={{ p: 2, pb: 1.5, borderBottom: 1, borderColor: 'grey.100' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Tabs
            value={mainTab}
            onChange={(e, newValue) => {
              setMainTab(newValue);
              setCurrentPage(1);
              setSubTab(0);
            }}
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{ minHeight: 0, mb: 1 }}
          >
            <PrimaryTab label="Task" active={mainTab === 0} />
            <PrimaryTab label="Meeting" active={mainTab === 1} />
            <PrimaryTab label="Event" active={mainTab === 2} />
          </Tabs>
          <IconButton onClick={onClose} sx={{ p: 0.5, '&:hover': { bgcolor: 'grey.100', borderRadius: '50%' } }}>
            <CloseIcon sx={{ fontSize: 20, color: theme.palette.grey[600] }} />
          </IconButton>
        </Box>

        <Typography variant="h5" fontWeight="600" color="text.primary" sx={{ mb: 1, fontSize: '0.9rem' }}>
          {subTab === 0
            ? `Add ${mainTab === 0 ? 'Task' : mainTab === 1 ? 'Meeting' : 'Event'}`
            : `View ${mainTab === 0 ? 'Tasks' : mainTab === 1 ? 'Meetings' : 'Events'}`}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5} color="text.secondary" sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 10 }}>
          <CalendarTodayIcon sx={{ fontSize: 16 }} />
          <Typography variant="body1" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
            {normalizedDateRange && normalizedDateRange.start !== normalizedDateRange.end
              ? `${moment(normalizedDateRange.start).tz('Asia/Kolkata').format('MMMM D')} - ${moment(normalizedDateRange.end).tz('Asia/Kolkata').format('MMMM D, YYYY')}`
              : moment(normalizedSelectedDate || normalizedDateRange?.start).tz('Asia/Kolkata').format('MMMM D, YYYY')}
          </Typography>
  
        </Box>
      </Box>

      <Box sx={{ px: 2, pt: 1.5, pb: 0.5, borderBottom: 1, borderColor: 'grey.200' }}>
        <Tabs
          value={subTab}
          onChange={(e, newValue) => setSubTab(newValue)}
          sx={{
            minHeight: 32,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: 12,
              fontWeight: '600',
              minHeight: 32,
              px: 2,
              py: 0.5,
              borderRadius: 16,
              margin: '0 3px',
              bgcolor: 'grey.100',
              '&.Mui-selected': {
                bgcolor: 'primary.50',
                color: 'primary.main',
              },
            },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          <Tab
            icon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Add"
            sx={{ minWidth: 80 }}
          />
          <Tab
            icon={<VisibilityIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="View"
            sx={{ minWidth: 80 }}
          />
        </Tabs>
      </Box>

      <DialogContent
        sx={{
          p: 2,
          pt: 1.5,
          pb: 1.5,
          overflowY: 'auto',
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        {errorMessage && (
          <Box sx={{ p: 1.5, mb: 1, bgcolor: 'error.50', borderRadius: 10, border: 1, borderColor: 'error.main' }}>
            <Typography color="error" variant="body2" sx={{ fontSize: '0.75rem' }}>
              {errorMessage}
            </Typography>
          </Box>
        )}
        {employeesError && (
          <Box sx={{ p: 1.5, mb: 1, bgcolor: 'warning.50', borderRadius: 10, border: 1, borderColor: 'warning.main' }}>
            <Typography color="warning.dark" variant="body2" sx={{ fontSize: '0.75rem' }}>
              Error loading employees: {employeesError?.message || 'Unknown error'}
            </Typography>
          </Box>
        )}

        {subTab === 0 && mainTab !== null && (
          <Box sx={{ overflowY: 'auto', px: 0.25 }}>
            {mainTab === 0 && (
              <TaskTab
                description={description}
                setDescription={setDescription}
                file={file}
                setFile={setFile}
                setErrorMessage={setErrorMessage}
                selectedDate={normalizedSelectedDate || normalizedDateRange?.start}
                selectedDateRange={normalizedDateRange}
                onTaskAdded={handleTaskAdded}
              />
            )}
            {mainTab === 1 && (
              <MeetingTab
                selectedDate={normalizedSelectedDate || normalizedDateRange?.start}
                selectedDateRange={normalizedDateRange}
                setErrorMessage={setErrorMessage}
                onMeetingAdded={handleMeetingAdded}
              />
            )}
            {mainTab === 2 && (
              <EventTab
                selectedDate={normalizedSelectedDate || normalizedDateRange?.start}
                selectedDateRange={normalizedDateRange}
                description={description}
                setDescription={setDescription}
                setErrorMessage={setErrorMessage}
                onEventAdded={handleEventAdded}
                file={file}
                setFile={setFile}
              />
            )}
          </Box>
        )}

        {subTab === 1 && mainTab !== null && renderContent(mainTab === 0 ? tasks : mainTab === 1 ? meetings : events, mainTab === 0 ? 'tasks' : mainTab === 1 ? 'meetings' : 'events')}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          pt: 1.5,
          bgcolor: 'grey.50',
          borderTop: 1,
          borderColor: 'grey.100',
          justifyContent: 'flex-end',
          borderRadius: '0 0 12px 12px',
        }}
      >
        {subTab === 0 && mainTab !== null && (
          <Button
            onClick={() => {
              if (mainTab === 0) {
                document.querySelector('#task-submit')?.click();
              } else if (mainTab === 1) {
                document.querySelector('#meeting-submit')?.click();
              } else if (mainTab === 2) {
                document.querySelector('#event-submit')?.click();
              }
            }}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontSize: 13,
              fontWeight: '600',
              borderRadius: 10,
              px: 3,
              py: 0.8,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: '0 6px 14px rgba(25, 118, 210, 0.3)',
              },
            }}
          >
            Save
          </Button>
        )}
        {subTab === 1 && (
          <Button
            onClick={() => setSubTab(0)}
            variant="contained"
            startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              fontSize: 13,
              fontWeight: '600',
              borderRadius: 10,
              px: 2.5,
              py: 0.8,
              bgcolor: 'secondary.main',
              color: 'white',
              boxShadow: '0 4px 12px rgba(96, 125, 139, 0.2)',
              '&:hover': { bgcolor: 'secondary.dark' },
            }}
          >
            Add New
          </Button>
        )}
      </DialogActions>

      <FeedbackModal
        open={openFeedbackModal}
        onClose={() => setOpenFeedbackModal(false)}
        taskId={selectedTaskId}
        onFeedbackAdded={handleFeedbackAdded}
        queryClient={queryClient}
        currentUserId={currentUserId}
        queryDate={queryDate}
      />
    </StyledDialog>
  );
}

export default AddTaskDialog;