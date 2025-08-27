import React, { useEffect, useState } from "react";
import CalendarView from "../../components/emplyoee/calenderView";
import {
  Box,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Popover,
  TextField,
  Typography,
  Card,
  CardContent,
  Tooltip,
  Button as MuiButton,
  Chip,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import ProfileNav from "../../components/user/profiveNav";
import { useGet, usePost } from "../../helpers/axios/useApi";
import {
  Assignment,
  ExpandLess,
  ExpandMore,
  Send,
} from "@mui/icons-material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LinkIcon from "@mui/icons-material/Link";
import FeedbackIcon from "@mui/icons-material/Feedback";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import moment from "moment";
import { useAuth } from "../../middlewares/auth";
import { useTheme } from "@emotion/react";
import GetFileThumbnail from "../../components/emplyoee/getFileThumnail";

function Calender() {
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [events, setEvents] = useState([]);
  const [dailyWork, setDailyWork] = useState([]);
  const [selected, setSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openFeedback, setOpenFeedback] = useState(null);
  const { user } = useAuth();
  const theme = useTheme();

  const { data: getMeetings } = useGet("meetings/get", {
    month: currentMonth,
    year: currentYear,
  });

  const { data: getDailyWorkData, refetch } = useGet(
    "/employee/daily-work/get",
    {
      employeeId: user?._id,
      month: currentMonth,
      year: currentYear,
    }
  );

  const { data: employees } = useGet(
    "employee/all",
    {},
    {},
    { queryKey: "employees" }
  );

  const handleGiveFeedback = usePost("/employee/daily-work/update");

  useEffect(() => {
    if (getDailyWorkData?.data?.data) {
      setDailyWork(getDailyWorkData.data?.data);
    }
  }, [getDailyWorkData]);

  useEffect(() => {
    if (getMeetings?.data?.data) {
      setEvents(getMeetings.data.data);
    }
  }, [getMeetings]);

  const handleToggleFeedback = (id) => {
    setOpenFeedback((prev) => (prev === id ? null : id));
  };

  const handlePopoverOpen = (event, file, id) => {
    setSelected(id);
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
    setFeedback("");
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmitFeedback = async () => {
    setLoading(true);
    const data = { feedback, id: selected };
    await handleGiveFeedback.mutateAsync(data);
    setLoading(false);
    refetch();
    handlePopoverClose();
  };

  const getEmployeeName = (id) => {
    const employee = employees?.data?.message[0]?.find((emp) => emp._id === id);
    return employee ? `${employee.name}` : "Imperial Milestones";
  };

  const combinedData = [...dailyWork, ...events].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(a.createdAt);
    const dateB = b.date ? new Date(b.date) : new Date(b.createdAt);
    return dateA - dateB;
  });

  const handleTimes = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const getStatus = (meetingDate) => {
    const now = moment();
    const meetingTime = moment.utc(meetingDate);
    if (now.isAfter(meetingTime)) return "Completed";
    if (now.isBefore(meetingTime)) return "Upcoming";
    return "Ongoing";
  };

  const renderItem = (item, index) => {
    const isDailyWork = !!item.date;
    const isMeeting = !isDailyWork;
    const status = isMeeting ? getStatus(item.meetingDate) : null;

    return (
      <Card
        key={index}
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          background: isDailyWork
            ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
            : "linear-gradient(135deg, #fefefe 0%, #f0f9ff 100%)",
          border: `1px solid ${isDailyWork ? '#e2e8f0' : '#e0f2fe'}`,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderColor: isDailyWork ? '#cbd5e1' : '#7dd3fc',
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.5} flex={1}>
              <Avatar
                sx={{
                  bgcolor: isDailyWork ? '#10b981' : '#3b82f6',
                  width: 32,
                  height: 32,
                }}
              >
                {isDailyWork ? (
                  <Assignment sx={{ fontSize: 16 }} />
                ) : (
                  <MeetingRoomIcon sx={{ fontSize: 16 }} />
                )}
              </Avatar>
              <Box flex={1}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={600} 
                  color="#1e293b"
                  sx={{ 
                    lineHeight: 1.3,
                    fontSize: '0.875rem',
                    mb: 0.5
                  }}
                >
                  {isDailyWork ? item.description : item.meetingName}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="#64748b"
                  sx={{ fontSize: '0.75rem' }}
                >
                  {isDailyWork 
                    ? new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : `${item.meetingDuration} min • ${getEmployeeName(item.meetingBy)}`
                  }
                </Typography>
              </Box>
            </Stack>
            
            {isDailyWork ? (
              <IconButton 
                size="small"
                onClick={() => handleToggleFeedback(item._id)}
                sx={{ 
                  ml: 1,
                  color: '#64748b',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                }}
              >
                {openFeedback === item._id ? (
                  <ExpandLess sx={{ fontSize: 20 }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            ) : (
              <Chip
                label={status}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  fontWeight: 500,
                  borderColor: status === "Completed" 
                    ? '#10b981' 
                    : status === "Ongoing" 
                    ? '#f59e0b' 
                    : '#3b82f6',
                  color: status === "Completed" 
                    ? '#10b981' 
                    : status === "Ongoing" 
                    ? '#f59e0b' 
                    : '#3b82f6',
                  bgcolor: status === "Completed" 
                    ? '#ecfdf5' 
                    : status === "Ongoing" 
                    ? '#fffbeb' 
                    : '#eff6ff',
                }}
              />
            )}
          </Stack>

          {isDailyWork ? (
            <>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                <GetFileThumbnail fileType={item.fileType} fileUrl={item.file} />
                <IconButton
                  size="small"
                  onClick={(e) => handlePopoverOpen(e, item.file, item._id)}
                  sx={{
                    color: '#64748b',
                    '&:hover': { 
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6'
                    },
                  }}
                >
                  <FeedbackIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
              
              <Collapse in={openFeedback === item._id}>
                <Divider sx={{ my: 1.5, bgcolor: '#e2e8f0' }} />
                <Typography 
                  variant="caption" 
                  fontWeight={600} 
                  color="#475569"
                  sx={{ fontSize: '0.75rem', mb: 1, display: 'block' }}
                >
                  Feedback
                </Typography>
                <Stack spacing={1}>
                  {item?.feedBack?.length > 0 ? (
                    item.feedBack.map((fb, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          bgcolor: 'rgba(241, 245, 249, 0.8)',
                          borderRadius: 1.5,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.75rem',
                            lineHeight: 1.4,
                            color: '#475569',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          {fb.feedback}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.7rem',
                            color: '#64748b',
                            fontStyle: 'italic'
                          }}
                        >
                          ~ {fb.feedbackGiverName || "Imperial Milestones"}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        fontStyle: 'italic'
                      }}
                    >
                      No feedback yet
                    </Typography>
                  )}
                </Stack>
              </Collapse>
            </>
          ) : (
            <Stack spacing={1.5}>
              <Typography 
                variant="caption" 
                color="#64748b"
                sx={{ 
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <EventNoteIcon sx={{ fontSize: 14 }} />
                {item.meetingAgenda}
              </Typography>
              
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Tooltip title={item.meetingLink} arrow>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      p: 0.5,
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: 1,
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <LinkIcon sx={{ fontSize: 14, color: '#10b981' }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#10b981'
                      }}
                    >
                      Meeting Link
                    </Typography>
                  </Box>
                </Tooltip>
                
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(item.meetingLink)}
                  sx={{ 
                    color: '#64748b',
                    '&:hover': { color: '#3b82f6' }
                  }}
                >
                  <FileCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
                
                <MuiButton
                  variant="contained"
                  size="small"
                  startIcon={<VideoCallIcon sx={{ fontSize: 14 }} />}
                  href={item.meetingLink}
                  target="_blank"
                  sx={{
                    bgcolor: '#3b82f6',
                    fontSize: '0.7rem',
                    py: 0.5,
                    px: 1.5,
                    minHeight: 28,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#2563eb' },
                    boxShadow: 'none',
                    '&:hover': { 
                      bgcolor: '#2563eb',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }
                  }}
                >
                  Join
                </MuiButton>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  };

  const id = Boolean(anchorEl) ? "feedback-popover" : undefined;

  return (
    <Box
      sx={{
        width: "95%",
        maxWidth: 1600,
        mx: "auto",
        minHeight: "100vh",
        py: 3,
        bgcolor: '#fafafa',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} display="flex" justifyContent="flex-end" mb={1}>
          <ProfileNav />
        </Grid>
        
        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              height: "82vh",
              overflow: 'hidden'
            }}
          >
            <CalendarView
              size={{ width: "100%", height: "82vh" }}
              getTimes={handleTimes}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              height: "82vh",
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <EventNoteIcon sx={{ fontSize: 20, color: '#64748b' }} />
                Scheduled Activities
              </Typography>
            </Box>
            
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                '&::-webkit-scrollbar': {
                  width: 4,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: '#f1f5f9',
                  borderRadius: 2,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: '#cbd5e1',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#94a3b8',
                  },
                },
              }}
            >
              {combinedData.length > 0 ? (
                combinedData.map(renderItem)
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    color: '#94a3b8'
                  }}
                >
                  <EventNoteIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.875rem',
                      fontStyle: 'italic',
                    }}
                  >
                    No activities scheduled yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Popover
        id={id}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2.5,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            bgcolor: '#ffffff',
          },
        }}
      >
        <Box sx={{ p: 3, width: 300 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            color="#1e293b"
            sx={{ fontSize: '0.95rem', mb: 2 }}
          >
            Add Feedback
          </Typography>
          <TextField
            value={feedback}
            onChange={handleFeedbackChange}
            fullWidth
            multiline
            rows={3}
            placeholder="Share your thoughts..."
            variant="outlined"
            size="small"
            sx={{ 
              mb: 2.5,
              '& .MuiInputBase-root': {
                fontSize: '0.875rem'
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                },
              },
            }}
          />
          <MuiButton
            onClick={handleSubmitFeedback}
            variant="contained"
            fullWidth
            disabled={loading || !feedback.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <Send sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 1.5,
              py: 1,
              fontSize: '0.875rem',
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: '#3b82f6',
              boxShadow: 'none',
              '&:hover': { 
                bgcolor: '#2563eb',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              },
              '&:disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </MuiButton>
        </Box>
      </Popover>
    </Box>
  );
}

export default Calender;