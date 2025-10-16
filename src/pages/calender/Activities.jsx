


import React, { useState, useEffect, useMemo, Component } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Backdrop,
  Paper,
  Popover,
  TextField,
  Alert,
  Tooltip,
  Link as MuiLink,
} from "@mui/material";
import {
  Assignment,
  ExpandLess,
  ExpandMore,
  MeetingRoom,
  Timelapse,
  PersonPin,
  EventNote,
  FileCopy,
  VideoCall,
  Feedback,
  Event,
  Close,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import moment from "moment-timezone";
import GetFileThumbnail from "./getFileThumnail";
import { Link } from "react-router-dom";
import { useGet, usePost } from "../../hooks/useApi";

// Styled Components (unchanged)
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s ease-in-out",
  position: "relative",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    borderColor: theme.palette.grey[300],
  },
}));

const StatusDot = styled(Box)(({ theme, status }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor:
    status === "Completed"
      ? theme.palette.success.main
      : status === "Ongoing"
      ? theme.palette.warning.main
      : theme.palette.info.main,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
}));

const IconContainer = styled(Avatar)(({ theme, variant }) => ({
  width: 28,
  height: 28,
  backgroundColor:
    variant === "task"
      ? theme.palette.success.light
      : variant === "meeting"
      ? theme.palette.info.light
      : theme.palette.secondary.light,
  color:
    variant === "task"
      ? theme.palette.success.main
      : variant === "meeting"
      ? theme.palette.info.main
      : theme.palette.secondary.main,
  border: `1px solid ${
    variant === "task"
      ? theme.palette.success.light
      : variant === "meeting"
      ? theme.palette.info.light
      : theme.palette.secondary.light
  }`,
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.common.white} 100%)`,
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  color: theme.palette.primary.main,
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "rgba(255, 255, 255, 0.8)",
}));

// Error Boundary Component (unchanged)
class ActivitiesErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          <Typography variant="h6" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2">
            Please try refreshing the page or contact support.
          </Typography>
        </Alert>
      );
    }
    return this.props.children;
  }
}

function Activities({
  currentMonth,
  currentYear,
  selectedDateRange,
  user,
  handleToggleFeedback,
  openFeedback,
  handlePopoverOpen,
  handlePopoverClose,
  handleFeedbackChange,
  handleSubmitFeedback,
  loading,
  feedback,
}) {
  const [filter, setFilter] = useState("all");
  const [localFeedbacks, setLocalFeedbacks] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [events, setEvents] = useState([]);
  const [dailyWork, setDailyWork] = useState([]);

  // Determine the date range for fetching data (used for events and meetings)
  const dateParams = useMemo(() => {
    if (
      selectedDateRange?.start &&
      selectedDateRange?.end &&
      moment(selectedDateRange.start).isValid() &&
      moment(selectedDateRange.end).isValid()
    ) {
      return {
        startDate: moment(selectedDateRange.start).tz("UTC").format("YYYY-MM-DD"),
        endDate: moment(selectedDateRange.end).tz("UTC").format("YYYY-MM-DD"),
      };
    }
    // Fallback to currentMonth and currentYear
    const startOfMonth = moment([currentYear, currentMonth - 1])
      .tz("UTC")
      .startOf("month")
      .format("YYYY-MM-DD");
    const endOfMonth = moment([currentYear, currentMonth - 1])
      .tz("UTC")
      .endOf("month")
      .format("YYYY-MM-DD");
    return {
      startDate: startOfMonth,
      endDate: endOfMonth,
    };
  }, [selectedDateRange, currentMonth, currentYear]);

  // API Calls
  const {
    data: getMeetings,
    isLoading: isMeetingsLoading,
    error: meetingsError,
    refetch: refetchMeetings,
  } = useGet(
    "meetings/get",
    {
      employeeId: user?._id,
      startDate: dateParams.startDate,
      endDate: dateParams.endDate,
    },
    {},
    { queryKey: ["meetings", user?._id, dateParams.startDate, dateParams.endDate] }
  );

  // ✅ FIXED: Use currentMonth and currentYear for dailywork to match CalendarView
  const { data: getDailyWorkData, refetch: refetchDailyWork } = useGet(
    "/employee/daily-work/get",
    {
      employeeId: user?._id,
      currentMonth,
      currentYear,
    },
    {},
    { queryKey: ["dailyWork", user?._id, currentMonth, currentYear] }
  );

  const {
    data: getEventsData,
    isLoading: isEventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useGet(
    "/event", // ✅ FIXED: Changed endpoint to match CalendarView
    {
      employeeId: user?._id,
      startDate: dateParams.startDate,
      endDate: dateParams.endDate,
    },
    {},
    { queryKey: ["events", user?._id, dateParams.startDate, dateParams.endDate] }
  );

  const { data: employees } = useGet(
    "employee/all",
    {},
    {},
    { queryKey: "employees" }
  );
  
  // ✅ FIXED: Refetch when currentMonth or currentYear changes (for all fetches)
  useEffect(() => {
    refetchDailyWork();
    refetchMeetings();
    refetchEvents();
  }, [currentMonth, currentYear]);

  // ✅ NEW EFFECT: Initial refetch on mount
  useEffect(() => {
    refetchDailyWork();
    refetchMeetings();
    refetchEvents();
  }, []); // Run on component mount

  const handleGiveFeedback = usePost("/employee/daily-work/update");

  // Helper to extract array from API response (robust for varying structures)
  const extractArray = (responseData) => {
    if (!responseData) return [];
    let data = responseData?.data;
    while (data && !Array.isArray(data)) {
      data = data?.data;
    }
    return Array.isArray(data) ? data : [];
  };

  // Update daily work state with multi-day task splitting
  useEffect(() => {
    const tasks = extractArray(getDailyWorkData);
    const expandedTasks = tasks.flatMap((task) => {
      const startMoment =
        task.startDate && moment(task.startDate).isValid()
          ? moment(task.startDate).tz("UTC")
          : moment().tz("UTC");
      const endMoment =
        task.endDate && moment(task.endDate).isValid()
          ? moment(task.endDate).tz("UTC")
          : startMoment.clone();

      if (startMoment.isSame(endMoment, "day")) {
        return [
          {
            ...task,
            date: startMoment.toDate(),
            originalId: task._id,
            taskId: `${task._id}-0`,
          },
        ];
      }

      const taskEntries = [];
      let currentDay = startMoment.clone().startOf("day");
      const endDay = endMoment.clone().startOf("day");
      let dayIndex = 0;

      while (currentDay.isSameOrBefore(endDay, "day")) {
        taskEntries.push({
          ...task,
          date: currentDay.toDate(),
          originalId: task._id,
          taskId: `${task._id}-${dayIndex}`,
          isMultiDay: true,
          fullDuration: `${startMoment.format("MMM D")} to ${endMoment.format(
            "MMM D"
          )}`,
        });
        currentDay.add(1, "day");
        dayIndex++;
      }
      return taskEntries;
    });

    const seenIds = new Set();
    const uniqueTasks = expandedTasks.filter((task) => {
      if (seenIds.has(task.originalId)) {
        return false;
      }
      seenIds.add(task.originalId);
      return true;
    });

    setDailyWork(uniqueTasks);
  }, [getDailyWorkData]);

  // Update events state
  useEffect(() => {
    if (isEventsLoading || eventsError) {
      setEvents([]);
      return;
    }
    const eventsArray = extractArray(getEventsData);
    if (eventsArray.length > 0) {
      const eventData = eventsArray.map((event) => ({
        ...event,
        eventDate: event.start,
        meetingName: event.title,
        meetingAgenda: event.description,
        meetingDuration: moment(event.end).diff(moment(event.start), "minutes"),
        type: event.type,
        eventBy: event.createdBy || user?._id,
        originalId: event._id,
      }));
      setEvents(eventData);
    } else {
      setEvents([]);
    }
  }, [getEventsData, isEventsLoading, eventsError, user]);

  // Update meetings state
  useEffect(() => {
    if (isMeetingsLoading || meetingsError) {
      // Keep existing events that have eventDate (non-meetings)
      setEvents((prevEvents) => prevEvents.filter((event) => event.eventDate));
      return;
    }
    const meetingsArray = extractArray(getMeetings);
    if (meetingsArray.length > 0) {
      const meetings = meetingsArray.map((meeting) => ({
        ...meeting,
        meetingDate: meeting.start_time_Date,
        meetingName: meeting.meetingName,
        meetingAgenda: meeting.meetingDescription,
        meetingDuration: moment(meeting.end_time_Date).diff(
          moment(meeting.start_time_Date),
          "minutes"
        ),
        meetingBy: meeting.meetingBy || user?._id,
        originalId: meeting._id,
      }));
      setEvents((prevEvents) => [
        ...prevEvents.filter((event) => event.eventDate),
        ...meetings,
      ]);
    }
  }, [getMeetings, isMeetingsLoading, meetingsError, user]);


  const combinedData = useMemo(() => {
    const seenIds = new Set();
    const mergedData = [
      ...(Array.isArray(dailyWork) ? dailyWork : []),
      ...(Array.isArray(events) ? events : []),
    ]
      .filter((item) => {
        if (seenIds.has(item.originalId)) {
          return false;
        }
        seenIds.add(item.originalId);
        return true;
      })
      .sort((a, b) => {
        const dateA = a.date
          ? new Date(a.date)
          : a.meetingDate
          ? new Date(a.meetingDate)
          : new Date(a.eventDate);
        const dateB = b.date
          ? new Date(b.date)
          : b.meetingDate
          ? new Date(b.meetingDate)
          : new Date(b.eventDate);
        return dateA - dateB;
      });

    return mergedData;
  }, [dailyWork, events]);

  // Helper functions (unchanged)
  const getStatus = (date) => {
    if (!date || !moment(date).isValid()) {
      return "Unknown";
    }
    const now = moment().tz("UTC");
    const eventTime = moment.utc(date);
    if (now.isAfter(eventTime)) return "Completed";
    if (now.isBefore(eventTime)) return "Upcoming";
    return "Ongoing";
  };

  const formatDate = (date) => {
    if (!date || !moment(date).isValid()) {
      return "Invalid Date";
    }
    return moment(date).tz("UTC").format("MMM D, h:mm A");
  };

  const copyToClipboard = (text) => {
    if (typeof text !== "string") {
      alert("No valid link to copy");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const getEmployeeName = (id) => {
    const employee = employees?.data?.message?.[0]?.find((emp) => emp._id === id);
    return employee ? employee.name : "Imperial Milestones";
  };

  const handleSubmitFeedbackLocal = async (id) => {
    const data = {
      feedback,
      id,
      feedbackGiverName: user?.name || user?.companyName || "Anonymous",
    };
    try {
      await handleGiveFeedback.mutateAsync(data);
      refetchDailyWork(); // Refetch only daily work after submitting feedback
      setLocalFeedbacks((prev) => ({
        ...prev,
        [id]: [
          ...(prev[id] || []),
          {
            feedback,
            feedbackGiverName: user?.name || user?.companyName || "Anonymous",
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      customHandlePopoverClose();
    }
  };

  const customHandlePopoverOpen = (event, file, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
    if (handlePopoverOpen) {
      handlePopoverOpen(event, file, id);
    }
  };

  const customHandlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
    if (handlePopoverClose) {
      handlePopoverClose();
    }
  };

  // Filter logic (unchanged)
  const filteredData = combinedData.filter((item) => {
    const itemDate = item.date
      ? moment(item.date).tz("UTC").format("YYYY-MM-DD")
      : item.meetingDate
      ? moment(item.meetingDate).tz("UTC").format("YYYY-MM-DD")
      : moment(item.eventDate).tz("UTC").format("YYYY-MM-DD");
    const isWithinRange = moment(itemDate).isBetween(
      dateParams.startDate,
      dateParams.endDate,
      "day",
      "[]"
    );

    if (!isWithinRange) return false;
    if (filter === "all") return true;
    if (filter === "task") return !!item.date && !item.meetingDate && !item.eventDate;
    if (filter === "meeting") return !!item.meetingDate;
    if (filter === "event") return !!item.eventDate;
    return true;
  });

  const renderItem = (item, index) => {
    if (!item) return null;
    const isDailyWork = !!item.date && !item.meetingDate && !item.eventDate;
    const isMeeting = !!item.meetingDate;
    const isEvent = !!item.eventDate;
    const status = isMeeting
      ? getStatus(item.meetingDate)
      : isEvent
      ? getStatus(item.eventDate)
      : isDailyWork
      ? item.status || 'Ongoing'
      : null;

    return (
      <StyledCard key={`${item.taskId || item._id}-${index}`}>
        {(isMeeting || isEvent || isDailyWork) && status !== "Unknown" && (
          <StatusDot status={status} />
        )}

        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box display="flex" alignItems="flex-start" gap={1} flex={1}>
              <IconContainer
                variant={isDailyWork ? "task" : isMeeting ? "meeting" : "event"}
                sx={{ 
                    bgcolor: isDailyWork && item.color ? item.color + '1A' : undefined, 
                    color: isDailyWork && item.color ? item.color : undefined
                }}
              >
                {isDailyWork ? (
                  <Assignment sx={{ fontSize: 16 }} />
                ) : isMeeting ? (
                  <MeetingRoom sx={{ fontSize: 16 }} />
                ) : (
                  <Event sx={{ fontSize: 16 }} />
                )}
              </IconContainer>

              <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    color="text.primary"
                    noWrap
                  >
                    {isDailyWork
                      ? item.title || item.description || "No Description"
                      : isMeeting
                      ? item.meetingName || "Unnamed Meeting"
                      : item.title || "Unnamed Event"}
                  </Typography>
                  {(isDailyWork || isMeeting) && (
                    <Chip
                      icon={<PersonIcon />}
                      label={
                        getEmployeeName(
                          isDailyWork
                            ? item.assignFor?._id
                            : item.meetingBy || item.eventBy
                        ) || "Unknown"
                      }
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontSize: 10, height: 20 }}
                    />
                  )}
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} mb={0.5}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarTodayIcon sx={{ fontSize: 10 }} />
                    <Typography variant="caption" color="text.secondary">
                      {isDailyWork
                        ? item.isMultiDay
                          ? `Day of ${item.fullDuration}`
                          : formatDate(item.date)
                        : isMeeting
                        ? `${formatDate(item.meetingDate)} - ${moment(
                            item.meetingDate
                          )
                            .tz("UTC")
                            .add(item.meetingDuration, "minutes")
                            .format("h:mm A")}`
                        : `${formatDate(item.eventDate)} - ${moment(item.eventDate)
                            .tz("UTC")
                            .add(item.meetingDuration, "minutes")
                            .format("h:mm A")}`}
                    </Typography>
                  </Box>

                  {(isMeeting || isEvent) && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Timelapse sx={{ fontSize: 10 }} />
                      <Typography variant="caption" color="text.secondary">
                        {item.meetingDuration
                          ? `${item.meetingDuration}m`
                          : "Duration Unknown"}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {isEvent && (
                  <Typography variant="caption" color="text.secondary">
                    Type: {item.type || "N/A"}
                  </Typography>
                )}
              </Box>
            </Box>

            {isDailyWork ? (
              <IconButton
                size="small"
                onClick={() => handleToggleFeedback(item.taskId)}
                sx={{ p: 0.5 }}
              >
                {openFeedback === item.taskId ? (
                  <ExpandLess sx={{ fontSize: 16 }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            ) : (
              <Chip
                label={status}
                size="small"
                color={
                  status === "Completed"
                    ? "success"
                    : status === "Ongoing"
                    ? "warning"
                    : "info"
                }
                sx={{ fontSize: 10 }}
              />
            )}
          </Box>
          
          {isDailyWork && item.guests && item.guests.length > 0 && (
            <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                    Guests: 
                    <Tooltip title={item.guests.join(', ')} arrow>
                        <Typography component="span" variant="caption" fontWeight="600" sx={{ ml: 0.5 }}>
                            {item.guests.length}
                        </Typography>
                    </Tooltip>
                </Typography>
            </Box>
          )}

          {isDailyWork && (
            <>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    p: 1,
                    bgcolor: "grey.50",
                    border: 1,
                    borderColor: "grey.200",
                  }}
                >
                  {item.file && item.fileType ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <GetFileThumbnail fileType={item.fileType} fileUrl={item.file} />
                      <MuiLink
                        href={item.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                        color="primary"
                        underline="hover"
                        noWrap
                      >
                        {item.fileType || "Document"}
                      </MuiLink>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No File
                    </Typography>
                  )}
                </Paper>

                <Tooltip title="Add Feedback">
                  <IconButton
                    size="small"
                    onClick={(e) => customHandlePopoverOpen(e, item.file, item.taskId)}
                    sx={{
                      bgcolor: "info.light",
                      color: "info.main",
                      "&:hover": { bgcolor: "info.main", color: "white" },
                    }}
                  >
                    <Feedback sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {openFeedback === item.taskId && (
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: "grey.50", border: 1, borderColor: "grey.200" }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="600"
                    color="text.primary"
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    mb={1}
                  >
                    <Feedback sx={{ fontSize: 12 }} />
                    Feedback
                  </Typography>
                  {(item?.feedBack?.length > 0 || localFeedbacks[item.taskId]?.length > 0) ? (
                    <Box sx={{ maxHeight: 128, overflowY: "auto" }}>
                      {[...(item.feedBack || []), ...(localFeedbacks[item.taskId] || [])]
                        .map((fb, idx) => (
                          <Paper
                            key={idx}
                            variant="outlined"
                            sx={{ p: 1, mb: 1, bgcolor: "white" }}
                          >
                            <Typography variant="caption" color="text.primary">
                              {fb.feedback || "No feedback text"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              textAlign="right"
                              mt={0.5}
                            >
                              {fb.feedbackGiverName || "Imperial Milestones"} •{" "}
                              {moment(fb.timestamp).tz("UTC").format("MMM D")}
                            </Typography>
                          </Paper>
                        ))}
                    </Box>
                  ) : (
                    <Box textAlign="center" py={2}>
                      <Typography variant="caption" color="text.secondary">
                        No feedback yet
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </>
          )}

          {(isMeeting || isEvent) && (
            <Box mt={2}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Avatar sx={{ width: 20, height: 20, bgcolor: "success.light" }}>
                  <PersonPin sx={{ fontSize: 12, color: "success.main" }} />
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  Organized by{" "}
                  <Typography component="span" variant="caption" fontWeight="600">
                    {getEmployeeName(item.meetingBy) || "Unknown Organizer"}
                  </Typography>
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" fontWeight="600" color="text.primary" mb={0.5}>
                  {isMeeting ? "Agenda" : "Description"}
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 1, bgcolor: "grey.50", border: 1, borderColor: "grey.200" }}
                >
                  <Typography variant="caption" color="text.primary">
                    {item.meetingAgenda || item.description || "No description provided"}
                  </Typography>
                </Paper>
              </Box>

              {isMeeting && (
                <>
                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    <Typography component="span" fontWeight="500">
                      Access:
                    </Typography>{" "}
                    {item.registrants?.length > 0
                      ? item.registrants
                          .map((id) => getEmployeeName(id) || "Unknown")
                          .join(", ")
                      : "None"}
                  </Typography>

                  <Box display="flex" gap={1} mt={1} pt={1} borderTop={1} borderColor="grey.200">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileCopy />}
                      onClick={() => copyToClipboard(item.meetingLink)}
                      disabled={!item.meetingLink}
                      sx={{ flex: 1, fontSize: 10 }}
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VideoCall />}
                      href={item.meetingLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={!item.meetingLink}
                      sx={{ flex: 1, fontSize: 10 }}
                    >
                      Join Meeting
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </StyledCard>
    );
  };

  return (
    <ActivitiesErrorBoundary>
      <HeaderBox sx={{ p: 2, height: "88vh", overflow: "auto" }}>
        <LoadingOverlay open={isMeetingsLoading || isEventsLoading}>
          <Box textAlign="center">
            <CircularProgress size={32} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Loading activities...
            </Typography>
          </Box>
        </LoadingOverlay>

        {(meetingsError || eventsError) && (
          <LoadingOverlay open>
            <Alert severity="error" sx={{ bgcolor: "white" }}>
              <Typography variant="h6" gutterBottom>
                Error loading data
              </Typography>
              <Typography variant="body2">Please try again later</Typography>
            </Alert>
          </LoadingOverlay>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1.5} borderBottom={1} borderColor="grey.200">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              }}
            >
              <EventNote sx={{ fontSize: 18 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Activities
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Your tasks, meetings & events
              </Typography>
            </Box>
          </Box>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ fontSize: 12 }}
            >
              <MenuItem value="all">All Activities</MenuItem>
              <MenuItem value="task">Tasks Only</MenuItem>
              <MenuItem value="event">Events Only</MenuItem>
              <MenuItem value="meeting">Meetings Only</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Paper
          variant="outlined"
          sx={{ p: 1.5, mb: 2, bgcolor: "info.light", border: 1, borderColor: "info.main" }}
        >
          <Typography variant="body2" color="text.primary" fontWeight="500">
            📅 Showing activities for:{" "}
            <Typography component="span" color="info.main">
              {dateParams.startDate === dateParams.endDate
                ? moment(dateParams.startDate).tz("UTC").format("MMMM D, YYYY")
                : `${moment(dateParams.startDate).tz("UTC").format("MMM D")} - ${moment(
                    dateParams.endDate
                  )
                    .tz("UTC")
                    .format("MMM D, YYYY")}`}
            </Typography>
          </Typography>
        </Paper>

        {Array.isArray(filteredData) && filteredData.length > 0 ? (
          <Box>{filteredData.map((item, index) => renderItem(item, index))}</Box>
        ) : (
          <Box textAlign="center" py={8}>
            <Avatar sx={{
              width: 64,
              height: 64,
              bgcolor: "grey.100",
              mx: "auto",
              mb: 2,
            }}>
              <EventNote sx={{ fontSize: 32, color: "grey.400" }} />
            </Avatar>
            <Typography variant="body2" fontWeight="600" color="text.primary" mb={0.5}>
              No activities scheduled
            </Typography>
            <Typography variant="caption" color="text.secondary" maxWidth="sm">
              Your scheduled meetings, events, and daily tasks will appear here when available
            </Typography>
          </Box>
        )}

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={customHandlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: 320,
              maxWidth: '90vw',
              boxShadow: 3,
            },
          }}
        >
          <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2" fontWeight="600" color="text.primary" display="flex" alignItems="center" gap={1}>
                <Feedback sx={{ fontSize: 16, color: "info.main" }} />
                Add Feedback
              </Typography>
              <IconButton
                size="small"
                onClick={customHandlePopoverClose}
                sx={{ 
                  color: "grey.400", 
                  "&:hover": { bgcolor: "grey.100", color: "grey.600" } 
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            <TextField
              multiline
              rows={3}
              fullWidth
              value={feedback || ""}
              onChange={handleFeedbackChange}
              placeholder="Share your thoughts on this work..."
              variant="outlined"
              size="small"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  fontSize: 12,
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={() => handleSubmitFeedbackLocal(selectedId)}
              disabled={loading || !feedback?.trim()}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Feedback sx={{ fontSize: 16 }} />
                )
              }
              sx={{ textTransform: "none" }}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </Box>
        </Popover>
      </HeaderBox>
    </ActivitiesErrorBoundary>
  );
}

export default Activities;