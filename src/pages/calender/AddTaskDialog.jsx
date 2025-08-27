import React, { useState, useCallback, useEffect } from 'react';
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
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import moment from 'moment-timezone';
import { useGet } from '../../hooks/useApi';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme, open }) => ({
  '& .MuiDialog-paper': {
    width: '70%',
    height: '80%',
    borderRadius: 12,
    boxShadow: theme.shadows[5],
    fontFamily: theme.typography.fontFamily,
  },
  transition: 'opacity 300ms ease-in-out',
  opacity: open ? 1 : 0,
  pointerEvents: open ? 'auto' : 'none',
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(4px)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
}));

const StatusIndicator = styled(Box)(({ statusColor }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: statusColor,
}));

const ItemContainer = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 8,
  marginBottom: 8,
  backgroundColor: theme.palette.background.paper,
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

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
  handlePopoverOpen,
  openFeedbackIndex,
  handleToggleFeedback,
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const normalizedSelectedDate = selectedDate && moment(selectedDate).isValid()
    ? moment(selectedDate).tz('UTC').startOf('day').toISOString()
    : null;
  const normalizedDateRange = selectedDateRange?.start && selectedDateRange?.end && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()
    ? {
        start: moment(selectedDateRange.start).tz('UTC').startOf('day').toISOString(),
        end: moment(selectedDateRange.end).tz('UTC').startOf('day').toISOString(),
      }
    : null;

  const queryDate = normalizedSelectedDate || normalizedDateRange?.start;

  console.log('AddTaskDialog - Received selectedDate:', selectedDate);
  console.log('AddTaskDialog - Received selectedDateRange:', selectedDateRange);
  console.log('AddTaskDialog - Normalized selectedDate:', normalizedSelectedDate);
  console.log('AddTaskDialog - Normalized selectedDateRange:', normalizedDateRange);
  console.log('AddTaskDialog - Query date:', queryDate);

  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useGet(
    '/employee/daily-work/get',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['tasks', queryDate, currentPage], enabled: !!queryDate }
  );
  const { data: meetingsData, isLoading: meetingsLoading, error: meetingsError } = useGet(
    '/meetings/get',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['meetings', queryDate, currentPage], enabled: !!queryDate }
  );
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useGet(
    '/event',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['events', queryDate, currentPage], enabled: !!queryDate }
  );
  const { data: employees, error: employeesError } = useGet(
    '/employee/all',
    {},
    {},
    { queryKey: ['employees'] }
  );

  const tasks = Array.isArray(tasksData?.data?.data?.data) ? tasksData.data.data.data : [];
  const meetings = Array.isArray(meetingsData?.data?.data?.data)
    ? meetingsData.data.data.data.map(meeting => ({
        ...meeting,
        start_time_Date: meeting.meetingDate,
        end_time_Date: moment(meeting.meetingDate).add(parseInt(meeting.meetingDuration), 'minutes').toISOString(),
        meetingName: meeting.meetingName,
        meetingDescription: meeting.meetingAgenda,
        registrants: meeting.access
      }))
    : [];
  const events = Array.isArray(eventsData?.data)
    ? eventsData.data
    : Array.isArray(eventsData?.data?.data)
    ? eventsData.data.data
    : [];

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

  console.log('AddTaskDialog - Tasks:', tasks);
  console.log('AddTaskDialog - Meetings:', meetings);
  console.log('AddTaskDialog - Events:', events);
  console.log('AddTaskDialog - Pagination:', pagination);
  console.log('AddTaskDialog - Employees:', employees);

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
    onClose();
  }, [queryClient, queryDate, onClose]);

  const handleMeetingAdded = useCallback(() => {
    queryClient.invalidateQueries(['meetings', queryDate, currentPage]);
    setCurrentPage(1);
    onClose();
  }, [queryClient, queryDate, onClose]);

  const handleEventAdded = useCallback(() => {
    queryClient.invalidateQueries(['events', queryDate, currentPage]);
    setCurrentPage(1);
    onClose();
  }, [queryClient, queryDate, onClose]);

  const getEmployeeName = (employee) => {
    if (!employee) return 'Unknown';
    if (typeof employee === 'object' && employee?._id && employee?.name) return employee.name;
    if (!employees?.data?.message?.[0]) return 'Unknown';
    return employees.data.message[0].find((emp) => emp?._id === employee?._id)?.name || 'Unknown';
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

  const getDatesInRange = (start, end) => {
    if (!start || !end || !moment(start).isValid() || !moment(end).isValid()) return [];
    const startDate = moment(start).tz('UTC').startOf('day');
    const endDate = moment(end).tz('UTC').startOf('day');
    const dates = [];
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.toISOString());
      currentDate.add(1, 'day');
    }
    return dates;
  };

  const renderContent = (data, type) => {
    console.log('renderContent - type:', type, 'data:', data, 'currentPage:', currentPage);

    if (!queryDate) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <Typography color="error" variant="caption" fontWeight="medium">
            No date selected
          </Typography>
        </Box>
      );
    }

    if (tasksLoading && type === 'tasks') {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <CircularProgress size={20} color="primary" sx={{ mb: 1 }} />
          <Typography color="textSecondary" variant="caption" fontWeight="medium">
            Loading {type}...
          </Typography>
        </Box>
      );
    }

    if (tasksError && type === 'tasks') {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <Typography color="error" variant="caption" fontWeight="medium">
            Error loading tasks: {tasksError?.message || 'Unknown error'}
          </Typography>
        </Box>
      );
    }

    if (meetingsLoading && type === 'meetings') {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <CircularProgress size={20} color="primary" sx={{ mb: 1 }} />
          <Typography color="textSecondary" variant="caption" fontWeight="medium">
            Loading {type}...
          </Typography>
        </Box>
      );
    }

    if (meetingsError && type === 'meetings') {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <Typography color="error" variant="caption" fontWeight="medium">
            Error loading meetings: {meetingsError?.message || 'Unknown error'}
          </Typography>
        </Box>
      );
    }

    if (eventsLoading && type === 'events') {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <CircularProgress size={20} color="primary" sx={{ mb: 1 }} />
          <Typography color="textSecondary" variant="caption" fontWeight="medium">
            Loading {type}...
          </Typography>
        </Box>
      );
    }

    if (eventsError && type === 'events') {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <Typography color="error" variant="caption" fontWeight="medium">
            Error loading events: {eventsError?.message || 'Unknown error'}
          </Typography>
        </Box>
      );
    }

    const safeData = Array.isArray(data) ? data : [];
    if (safeData.length === 0) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={2}>
          <Box
            borderRadius="50%"
            bgcolor="grey.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={1}
          >
            <CalendarTodayIcon sx={{ fontSize: 14, color: 'grey.400' }} />
          </Box>
          <Typography color="textSecondary" variant="caption" fontWeight="medium" mb={0.5}>
            No {type} logged for this date
          </Typography>
          <Typography color="textSecondary" variant="caption">
            Switch to the "Add {type}" tab to log your {type}
          </Typography>
        </Box>
      );
    }

    const totalItems = type === 'tasks' ? pagination.tasks.total :
                       type === 'meetings' ? pagination.meetings.total :
                       pagination.events.total;
    const totalPages = type === 'tasks' ? pagination.tasks.totalPages :
                       type === 'meetings' ? pagination.meetings.totalPages :
                       pagination.events.totalPages;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = safeData.slice(startIndex, endIndex);
    console.log('renderContent - Pagination:', { totalItems, totalPages, startIndex, endIndex, paginatedData });

    return (
      <Box sx={{  overflowY: 'auto', p: 1 }}>
        {paginatedData.map((item, index) => {
          const isMeeting = type === 'meetings';
          const isEvent = type === 'events';
          const isDailyWork = type === 'tasks';
          const duration = isMeeting ? parseInt(item.meetingDuration) || 0 : 0;
          const status = isMeeting ? getStatus(item.start_time_Date) : isEvent ? getStatus(item.start) : item.status;
          const statusColor = status ? getStatusColor(status) : null;
          const assignedEmployees = Array.isArray(item.assignFor) ? item.assignFor : [item.assignFor].filter(Boolean);
          const employeeOptions = employees?.data?.message?.[0] || [];

          return (
            <ItemContainer key={item._id || index} elevation={1}>
              {(isMeeting || isEvent || isDailyWork) && status !== 'Unknown' && (
                <StatusIndicator statusColor={statusColor} />
              )}
              <Box p={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bgcolor={
                        isDailyWork ? 'success.light' :
                        isMeeting ? 'info.light' : 'secondary.light'
                      }
                      color={
                        isDailyWork ? 'success.main' :
                        isMeeting ? 'info.main' : 'secondary.main'
                      }
                    >
                      {isDailyWork ? (
                        <Assignment fontSize="small" />
                      ) : isMeeting ? (
                        <MeetingRoomIcon fontSize="small" />
                      ) : (
                        <EventIcon fontSize="small" />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="text.primary">
                        {isDailyWork
                          ? item.description || 'No Description'
                          : isMeeting
                          ? item.meetingName || 'Unnamed Meeting'
                          : item.title || 'Unnamed Event'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <CalendarTodayIcon sx={{ fontSize: 10 }} />
                        {isDailyWork
                          ? item.startDate === item.endDate
                            ? moment(item.startDate).tz('Asia/Kolkata').format('MMMM D, YYYY')
                            : `${moment(item.startDate).tz('Asia/Kolkata').format('MMMM D, YYYY')} - ${moment(item.endDate).tz('Asia/Kolkata').format('MMMM D, YYYY')}`
                          : isMeeting
                          ? `${moment(item.start_time_Date).tz('Asia/Kolkata').format('MMMM D, YYYY, h:mm A')} - ${moment(item.end_time_Date).tz('Asia/Kolkata').format('h:mm A')}`
                          : `${moment(item.start).tz('Asia/Kolkata').format('MMMM D, YYYY, h:mm A')} - ${moment(item.end).tz('Asia/Kolkata').format('h:mm A')}`}
                      </Typography>
                      {isMeeting && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          <Timelapse sx={{ fontSize: 10, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {item.meetingDuration || duration
                              ? `${item.meetingDuration || duration} min`
                              : 'Duration Unknown'}
                          </Typography>
                        </Box>
                      )}
                      {isEvent && (
                        <Typography variant="caption" color="text.secondary" mt={0.5}>
                          Type: {item.type || 'N/A'}
                        </Typography>
                      )}
                      {isDailyWork && (
                        <Box mt={0.5}>
                          <Autocomplete
                            multiple
                            options={employeeOptions}
                            getOptionLabel={(option) => option.name || 'Unknown'}
                            value={assignedEmployees.map((empId) =>
                              employeeOptions.find((emp) => emp._id === empId) || { _id: empId, name: 'Unknown' }
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Assigned To"
                                variant="outlined"
                                size="small"
                                sx={{ '& .MuiInputBase-root': { fontSize: 12 } }}
                              />
                            )}
                            readOnly
                            sx={{ width: '100%', '& .MuiAutocomplete-input': { fontSize: 12 } }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {/* <Box display="flex" gap={1}>
                    {isDailyWork ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFeedback(index)}
                          sx={{
                            bgcolor: 'grey.100',
                            borderRadius: '50%',
                            '&:hover': { bgcolor: 'grey.200' },
                          }}
                        >
                          {openFeedbackIndex === index ? (
                            <KeyboardDoubleArrowRight sx={{ fontSize: 10, color: 'primary.main' }} />
                          ) : (
                            <FeedbackIcon sx={{ fontSize: 10, color: 'primary.main' }} />
                          )}
                        </IconButton>
                        <Tooltip title="Add Feedback">
                          <IconButton
                            size="small"
                            onClick={(e) => handlePopoverOpen(e, item.file, item._id)}
                            sx={{
                              bgcolor: 'info.light',
                              borderRadius: '50%',
                              '&:hover': { bgcolor: 'info.main' },
                            }}
                          >
                            <FeedbackIcon sx={{ fontSize: 10 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Task">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item._id)}
                            sx={{
                              bgcolor: 'error.light',
                              borderRadius: '50%',
                              '&:hover': { bgcolor: 'error.main' },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 10 }} />
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
                          fontWeight: 'medium',
                        }}
                      />
                    )}
                  </Box> */}
                </Box>
                {isDailyWork && (
                  <>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box
                        flex={1}
                        p={1}
                        border={1}
                        borderColor="grey.200"
                        borderRadius={1}
                        bgcolor="grey.50"
                      >
                        {item.file && item.fileType ? (
                          <>
                            <GetFileThumbnail fileType={item.fileType} fileUrl={item.file} />
                            <Typography
                              component="a"
                              href={item.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="caption"
                              color="primary"
                              sx={{ ml: 0.5, '&:hover': { textDecoration: 'underline' } }}
                            >
                              {item.fileType || 'Document'}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary" ml={0.5}>
                            No File
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {item.feedBack?.length > 0 && openFeedbackIndex === index && (
                      <Box p={1.5} border={1} borderColor="grey.200" borderRadius={1} bgcolor="grey.50">
                        <Typography variant="caption" fontWeight="bold" color="text.primary" mb={1}>
                          Feedback
                        </Typography>
                        {item.feedBack.map((fb, idx) => (
                          <Box
                            key={idx}
                            p={1}
                            mb={1}
                            border={1}
                            borderColor="grey.200"
                            borderRadius={1}
                            bgcolor="background.paper"
                          >
                            <Typography variant="caption" color="text.primary">
                              {fb.feedback || 'No feedback text'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mt={0.5}>
                              {fb.feedbackGiverName || 'Imperial Milestones'} •{' '}
                              {moment(fb.timestamp).tz('Asia/Kolkata').format('MMM D, YYYY')}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                )}
                {(isMeeting || isEvent) && (
                  <Box mt={1}>
                    <Box mb={1}>
                      <Typography variant="caption" fontWeight="bold" color="text.primary">
                        {isMeeting ? 'Agenda' : 'Description'}
                      </Typography>
                      <Box p={1} border={1} borderColor="grey.200" borderRadius={1} bgcolor="grey.50">
                        <Typography variant="caption" color="text.primary">
                          {item.meetingDescription || item.description || 'No description provided'}
                        </Typography>
                      </Box>
                    </Box>
                    {isMeeting && (
                      <>
                        <Typography variant="caption" color="text.secondary" mt={0.5}>
                          Attendees:{' '}
                          {item.meetingFor?.length > 0
                            ? item.meetingFor.map((attendee) => attendee.email).join(', ')
                            : item.registrants?.length > 0
                            ? item.registrants.map((id) => getEmployeeName(id)).join(', ')
                            : 'None'}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Button
                            size="small"
                            onClick={() => copyToClipboard(item.meetingLink)}
                            disabled={!item.meetingLink}
                            startIcon={<FileCopy sx={{ fontSize: 10 }} />}
                            sx={{
                              textTransform: 'none',
                              fontSize: 10,
                              color: item.meetingLink ? 'text.primary' : 'text.disabled',
                              '&:hover': { color: item.meetingLink ? 'text.primary' : 'text.disabled' },
                            }}
                          >
                            Copy Link
                          </Button>
                          <Button
                            size="small"
                            href={item.meetingLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<VideoCall fontSize="small" />}
                            disabled={!item.meetingLink}
                            sx={{
                              textTransform: 'none',
                              fontSize: 10,
                              bgcolor: item.meetingLink ? 'primary.main' : 'grey.400',
                              color: 'white',
                              borderRadius: 1,
                              px: 1,
                              py: 0.5,
                              '&:hover': { bgcolor: item.meetingLink ? 'primary.dark' : 'grey.400' },
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
          <Box display="flex" justifyContent="space-between" alignItems="center" p={1} borderTop={1} borderColor="grey.200">
            <Button
              size="small"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              startIcon={<ChevronLeftIcon sx={{ fontSize: 10 }} />}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 'bold',
                color: currentPage === 1 ? 'text.disabled' : 'primary.main',
                '&:hover': { bgcolor: currentPage === 1 ? 'transparent' : 'primary.light' },
              }}
            >
              Previous
            </Button>
            <Typography variant="caption" color="text.secondary">
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              size="small"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              endIcon={<ChevronRightIcon sx={{ fontSize: 10 }} />}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 'bold',
                color: currentPage === totalPages ? 'text.disabled' : 'primary.main',
                '&:hover': { bgcolor: currentPage === totalPages ? 'transparent' : 'primary.light' },
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
    <StyledDialog open={open} onClose={onClose} maxWidth={true}>
      <DialogTitle sx={{ p: 2, pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {mainTab === 0
                ? 'Tasks'
                : mainTab === 1
                ? 'Meetings'
                : mainTab === 2
                ? 'Events'
                : 'Select an Option'}
            </Typography>
            {(normalizedDateRange || normalizedSelectedDate) && (
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <CalendarTodayIcon sx={{ fontSize: 12 }} />
                <Typography variant="caption" color="text.secondary">
                  {normalizedDateRange && normalizedDateRange.start !== normalizedDateRange.end
                    ? `${moment(normalizedDateRange.start).tz('Asia/Kolkata').format('MMM D, YYYY')} - ${moment(normalizedDateRange.end).tz('Asia/Kolkata').format('MMM D, YYYY')}`
                    : moment(normalizedSelectedDate || normalizedDateRange.start).tz('Asia/Kolkata').format('dddd, MMMM D, YYYY')}
                </Typography>
              </Box>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ p: 0.5, '&:hover': { bgcolor: 'grey.100' } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <Box sx={{ px: 2, mb: 1 }}>
        <Tabs
          value={mainTab}
          onChange={(e, newValue) => setMainTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: 12,
              fontWeight: 'bold',
              px: 1,
              py: 0.5,
            },
            '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
          }}
        >
          <Tab
            icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label="Tasks"
          />
          <Tab
            icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label="Meetings"
          />
          <Tab
            icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label="Events"
          />
        </Tabs>
      </Box>
      {mainTab !== null && (
        <Box sx={{ px: 2, mb: 1 }}>
          <Tabs
            value={subTab}
            onChange={(e, newValue) => setSubTab(newValue)}
            sx={{
              minHeight: 32,
              borderBottom: 1,
              borderColor: 'grey.200',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 'bold',
                minHeight: 32,
                px: 1,
                py: 0.5,
              },
              '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
            }}
          >
            <Tab
              icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
              iconPosition="start"
              label={`Add ${mainTab === 0 ? 'Task' : mainTab === 1 ? 'Meeting' : 'Event'}`}
            />
            <Tab
              icon={<VisibilityIcon sx={{ fontSize: 14 }} />}
              iconPosition="start"
              label={`View ${mainTab === 0 ? 'Tasks' : mainTab === 1 ? 'Meetings' : 'Events'}`}
            />
          </Tabs>
        </Box>
      )}
      <DialogContent sx={{ p: 2, pt: 0 }}>
        {errorMessage && (
          <Typography color="error" variant="caption" sx={{ mb: 1 }}>
            {errorMessage}
          </Typography>
        )}
        {employeesError && (
          <Typography color="error" variant="caption" sx={{ mb: 1 }}>
            Error loading employees: {employeesError?.message || 'Unknown error'}
          </Typography>
        )}
        {subTab === 0 && mainTab !== null && (
          <Box sx={{  overflowY: 'auto', px: 0.5 }}>
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
              />
            )}
          </Box>
        )}
        {subTab === 1 && mainTab !== null && (
          renderContent(
            mainTab === 0 ? tasks : mainTab === 1 ? meetings : events,
            mainTab === 0 ? 'tasks' : mainTab === 1 ? 'meetings' : 'events'
          )
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'grey.100' }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 'bold',
            color: 'text.secondary',
            '&:hover': { bgcolor: 'grey.200' },
          }}
        >
          Cancel
        </Button>
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
              fontSize: 12,
              fontWeight: 'bold',
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 1,
              px: 2,
              py: 0.5,
              '&:hover': { bgcolor: 'primary.dark', boxShadow: theme.shadows[4] },
            }}
          >
            Save {mainTab === 0 ? 'Task' : mainTab === 1 ? 'Meeting' : 'Event'}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  );
}

export default AddTaskDialog;