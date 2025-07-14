import React, { useState, Component } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Button as MuiButton,
  Chip,
  Collapse,
  Popover,
  TextField,
  CircularProgress,
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
} from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import moment from "moment";
import GetFileThumbnail from "../Profile/getFileThumnail";
import { Link } from "react-router-dom";

// Error Boundary Component
class ActivitiesErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error" variant="h6">
            Something went wrong in the Activities section.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please try refreshing the page or contact support.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

function Activities({
  combinedData,
  handleToggleFeedback,
  openFeedback,
  handleFeedbackChange,
  handleSubmitFeedback,
  loading,
  feedback,
  getEmployeeName,
  theme,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const getStatus = (meetingDate) => {
    if (!meetingDate || !moment(meetingDate).isValid()) {
      return "Unknown";
    }
    const now = moment();
    const meetingTime = moment.utc(meetingDate);
    if (now.isAfter(meetingTime)) return "Completed";
    if (now.isBefore(meetingTime)) return "Upcoming";
    return "Ongoing";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "#4caf50";
      case "Ongoing":
        return "#ff9800";
      case "Upcoming":
        return "#2196f3";
      default:
        return "#9e9e9e";
    }
  };

  const formatDate = (date) => {
    if (!date || !moment(date).isValid()) {
      return "Invalid Date";
    }
    return moment(date).format("ddd, MMM D • h:mm A");
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

  const handlePopoverOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
    handleFeedbackChange({ target: { value: "" } }); // Reset feedback
  };

  const renderItem = (item, index) => {
    if (!item) return null;
    const isDailyWork = !!item.date;
    const isMeeting = !isDailyWork;
    const status = isMeeting ? getStatus(item.meetingDate) : null;
    const statusColor = isMeeting ? getStatusColor(status) : null;

    return (
      <Card
        key={index}
        elevation={3}
        sx={{
          mb: 3,
          borderRadius: "16px",
          background: isDailyWork
            ? "linear-gradient(145deg, #ffffff, #f5f7fa)"
            : "linear-gradient(145deg, #ffffff, #f0f7ff)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: isDailyWork
            ? "1px solid rgba(236, 242, 248, 0.5)"
            : "1px solid rgba(224, 240, 255, 0.6)",
          overflow: "visible",
          position: "relative",
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
          },
        }}
      >
        {isMeeting && status !== "Unknown" && (
          <Box
            sx={{
              position: "absolute",
              top: "14px",
              right: "14px",
              height: "10px",
              width: "10px",
              borderRadius: "50%",
              backgroundColor: statusColor,
              boxShadow: `0 0 10px ${statusColor}60`,
            }}
          />
        )}

        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2.5}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  bgcolor: isDailyWork
                    ? "rgba(76, 175, 80, 0.1)"
                    : "rgba(33, 150, 243, 0.1)",
                  color: isDailyWork ? "#4caf50" : "#2196f3",
                  width: 42,
                  height: 42,
                }}
              >
                {isDailyWork ? (
                  <Assignment sx={{ fontSize: "1.3rem" }} />
                ) : (
                  <MeetingRoom sx={{ fontSize: "1.3rem" }} />
                )}
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    color: "#1d2939",
                    fontSize: "1rem",
                    lineHeight: 1.3,
                  }}
                >
                  {isDailyWork
                    ? item.description || "No Description"
                    : item.meetingName || "Unnamed Meeting"}
                </Typography>
                {isDailyWork ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667085",
                      fontSize: "0.75rem",
                      mt: 0.5,
                    }}
                  >
                    {formatDate(item.date)}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667085",
                      fontSize: "0.75rem",
                      mt: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Timelapse sx={{ fontSize: "0.75rem" }} />
                    {item.meetingDuration
                      ? `${item.meetingDuration} min`
                      : "Duration Unknown"}
                  </Typography>
                )}
              </Box>
            </Box>
            {isDailyWork ? (
              <IconButton
                onClick={() => handleToggleFeedback(item._id)}
                sx={{
                  bgcolor: "rgba(240, 242, 245, 0.8)",
                  width: 36,
                  height: 36,
                  "&:hover": {
                    bgcolor: "rgba(235, 238, 242, 1)",
                  },
                }}
              >
                {openFeedback === item._id ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            ) : (
              <Chip
                label={status}
                size="small"
                sx={{
                  fontWeight: "500",
                  color: statusColor,
                  bgcolor: `${statusColor}15`,
                  borderRadius: "8px",
                  height: "26px",
                  fontSize: "0.7rem",
                  "& .MuiChip-label": {
                    px: 1.2,
                  },
                }}
              />
            )}
          </Box>

          {isDailyWork && (
            <>
              <Box display="flex" alignItems="center" gap={2} mb={2} mt={3}>
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: "rgba(245, 247, 250, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid rgba(230, 235, 240, 0.8)",
                  }}
                >
                  {item.file && item.fileType ? (
                    <GetFileThumbnail
                      fileType={item.fileType}
                      fileUrl={item.file}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ ml: 1.5, color: "#667085" }}>
                      No File
                    </Typography>
                  )}
                  {item.file && (
                    <a href={item.file} target="_blank" rel="noopener noreferrer">
                      <Typography
                        variant="body2"
                        sx={{
                          ml: 1.5,
                          color: "blue",
                          cursor: "pointer",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.fileType || "Document"}
                      </Typography>
                    </a>
                  )}
                </Paper>
                <Tooltip title="Add Feedback">
                  <IconButton
                    color="primary"
                    onClick={(e) => handlePopoverOpen(e, item._id)}
                    sx={{
                      bgcolor: "rgba(33, 150, 243, 0.08)",
                      width: 42,
                      height: 42,
                      "&:hover": {
                        bgcolor: "rgba(33, 150, 243, 0.15)",
                      },
                    }}
                  >
                    <Feedback sx={{ fontSize: "1.2rem" }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Collapse in={openFeedback === item._id} sx={{ mt: 1 }}>
                <Box
                  sx={{
                    bgcolor: "rgba(245, 247, 250, 0.7)",
                    borderRadius: "12px",
                    p: 2,
                    border: "1px solid rgba(230, 235, 240, 0.8)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    mb={1.5}
                    color="#344054"
                  >
                    Feedback
                  </Typography>
                  {item?.feedBack?.length > 0 ? (
                    item.feedBack.map((fb, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(255, 255, 255, 0.8)",
                          borderRadius: "10px",
                          mb: 1.5,
                          border: "1px solid rgba(235, 238, 242, 1)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "#344054", mb: 0.5 }}
                        >
                          {fb.feedback || "No feedback text"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#667085",
                            fontStyle: "italic",
                            display: "block",
                            textAlign: "right",
                          }}
                        >
                          {fb.feedbackGiverName || "Imperial Milestones"}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#667085",
                        fontStyle: "italic",
                        textAlign: "center",
                        py: 1,
                      }}
                    >
                      No feedback yet
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </>
          )}

          {isMeeting && (
            <Box sx={{ mt: 2.5 }}>
              <Box
                display="flex"
                alignItems="center"
                gap={1.5}
                sx={{ mb: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    color: "#4caf50",
                    width: 32,
                    height: 32,
                  }}
                >
                  <PersonPin sx={{ fontSize: "1rem" }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: "#475467" }}>
                  Organized by{" "}
                  <span style={{ fontWeight: 600, color: "#344054" }}>
                    {getEmployeeName(item.meetingBy) || "Unknown Organizer"}
                  </span>
                </Typography>
              </Box>

              <Box sx={{ pl: 0.5, mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#344054",
                    lineHeight: 1.6,
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Agenda
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#475467",
                    bgcolor: "rgba(245, 247, 250, 0.7)",
                    p: 1.5,
                    borderRadius: "8px",
                    border: "1px solid rgba(230, 235, 240, 0.8)",
                  }}
                >
                  {item.meetingAgenda || "No agenda provided"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3, opacity: 0.6 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Tooltip title="Copy meeting link">
                  <MuiButton
                    size="small"
                    startIcon={<FileCopy fontSize="small" />}
                    onClick={() => copyToClipboard(item.meetingLink)}
                    sx={{
                      color: "#475467",
                      fontSize: "0.75rem",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.03)",
                        color: "#1d2939",
                      },
                    }}
                    disabled={!item.meetingLink}
                  >
                    Copy Link
                  </MuiButton>
                </Tooltip>

                <MuiButton
                  variant="contained"
                  size="medium"
                  startIcon={<VideoCall />}
                  href={item.meetingLink || "#"}
                  target="_blank"
                  sx={{
                    bgcolor: "#2196f3",
                    "&:hover": { bgcolor: "#1976d2" },
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(33, 150, 243, 0.25)",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2.5,
                    opacity: item.meetingLink ? 1 : 0.5,
                    pointerEvents: item.meetingLink ? "auto" : "none",
                  }}
                >
                  Join Meeting
                </MuiButton>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const id = Boolean(anchorEl) ? "feedback-popover" : undefined;

  return (
    <ActivitiesErrorBoundary>
      <Paper
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.2)",
          borderRadius: "20px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
          p: { xs: 2, md: 3 },
          height: "88vh",
          overflow: "auto",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(240, 245, 250, 0.8)",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.02)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.09)",
            borderRadius: "10px",
            "&:hover": {
              background: "rgba(0,0,0,0.12)",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 3.5,
            pb: 2,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "rgba(33, 150, 243, 0.1)",
              color: "#2196f3",
              width: 40,
              height: 40,
            }}
          >
            <EventNote />
          </Avatar>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme?.palette?.text?.primary || "#000",
            }}
          >
            Activities
          </Typography>
        </Box>

        {Array.isArray(combinedData) && combinedData.length > 0 ? (
          combinedData.map((item, index) => renderItem(item, index))
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              opacity: 0.7,
            }}
          >
            <EventNote sx={{ fontSize: 48, color: "#94a3b8", mb: 2 }} />
            <Typography
              sx={{
                textAlign: "center",
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              No activities scheduled yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#94a3b8",
                maxWidth: "80%",
                mt: 1,
              }}
            >
              Your scheduled meetings and daily tasks will appear here
            </Typography>
          </Box>
        )}

        <Popover
          id={id}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              backdropFilter: "blur(20px)",
              bgcolor: "rgba(255,255,255,0.98)",
              border: "1px solid rgba(240, 245, 250, 0.9)",
              overflow: "hidden",
            },
          }}
        >
          <Box sx={{ p: 3, width: { xs: 280, sm: 350 } }}>
            <Typography
              variant="h6"
              fontWeight={600}
              color="#1d2939"
              mb={2.5}
            >
              Add Feedback
            </Typography>
            <TextField
              value={feedback || ""}
              onChange={handleFeedbackChange}
              fullWidth
              multiline
              rows={4}
              placeholder="Share your thoughts on this work..."
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "rgba(245, 247, 250, 0.7)",
                  "& fieldset": {
                    borderColor: "rgba(230, 235, 240, 0.8)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(210, 215, 220, 0.9)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme?.palette?.primary?.main || "#1976d2",
                  },
                },
              }}
            />
            <MuiButton
              onClick={() => handleSubmitFeedback(selectedId)}
              variant="contained"
              fullWidth
              disabled={loading || !feedback?.trim()}
              sx={{
                borderRadius: "12px",
                py: 1.2,
                bgcolor: theme?.palette?.primary?.main || "#2196f3",
                "&:hover": { bgcolor: theme?.palette?.primary?.dark || "#1976d2" },
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.25)",
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Submit Feedback"}
            </MuiButton>
          </Box>
        </Popover>
      </Paper>
    </ActivitiesErrorBoundary>
  );
}

export default Activities;