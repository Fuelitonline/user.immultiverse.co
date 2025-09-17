import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Backdrop,
  Paper,
  IconButton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useGet } from "../../hooks/useApi";
import CampaignIcon from "@mui/icons-material/Campaign";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate } from "react-router-dom";

// Transform API data
const transformData = (data, limit) => {
  return (
    data?.data?.data
      .slice(0, limit || data?.data?.data.length)
      .map((item) => ({
        id: item._id,
        title: item.title,
        description: item.description,
        startDate: item.startDate,
        endDate: item.endDate,
      })) || []
  );
};

const Announcement = ({ limit = null }) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const {
    data: announcementData,
    isLoading,
    isError,
    error,
  } = useGet("/announcement/user/get", {}, {}, {
    select: (data) => transformData(data, limit),
    retry: 2,
    refetchOnWindowFocus: false,
    queryKey: ["announcement/user/get", limit],
  });

  const data = Array.isArray(announcementData) ? announcementData : [];

  // Auto-flip announcements every 4 seconds
  useEffect(() => {
    if (data.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % data.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [data.length, isPaused]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "8vh",
          display: "flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "center",
          borderRadius: 2,
        }}
      >
        <CircularProgress size={24} sx={{ color: "black" }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 2, 
          boxShadow: "0 4px 20px rgba(244, 67, 54, 0.15)",
          border: "1px solid rgba(244, 67, 54, 0.2)"
        }}
      >
        {error.message || "Failed to load announcements"}
      </Alert>
    );
  }

  const currentAnnouncement = data[currentIndex];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Modern Flip Announcement Bar */}
      {data.length > 0 ? (
        <Paper
          elevation={0}
          sx={{
            background: "transparent",
            height: 70,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            cursor: "pointer",
            position: "relative",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Animated Background Gradient */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
             background: "linear-gradient(45deg,rgba(255, 255, 255, 0) 0%, rgba(69, 114, 237, 0.09) 50%, rgba(255, 255, 255, 0) 100%)",
              animation: "shimmer 3s ease-in-out infinite",
              "@keyframes shimmer": {
                "0%": { transform: "translateX(-100%)" },
                "100%": { transform: "translateX(100%)" },
              },
            }}
          />
          
          {/* Icon Section */}
          <Box sx={{ ml: 2, mr: 1, display: "flex", alignItems: "center", zIndex: 1 }}>
            <motion.div
              animate={{ 
                rotate: isPaused ? 0 : [0, 15, -15, 0],
                scale: isPaused ? 1.1 : [1, 1.1, 1]
              }}
              transition={{ 
                duration: isPaused ? 0.3 : 2, 
                repeat: isPaused ? 0 : Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Box
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  padding: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                }}
              >
                <CampaignIcon sx={{ 
                  fontSize: 26, 
                  color: "#4572ed",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" 
                }} />
              </Box>
            </motion.div>
          </Box>
          
          {/* Content Section with Flip Animation */}
          <Box sx={{ flex: 1, overflow: "hidden", position: "relative", height: "100%" }}>
            <AnimatePresence mode="wait">
              {currentAnnouncement && (
                <motion.div
                  key={currentIndex}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    transformStyle: "preserve-3d",
                  }}
                  onClick={() => navigate(`/announcements/${currentAnnouncement.id}`)}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#4572ed",
                        fontWeight: 700,
                        fontSize: "16px",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {currentAnnouncement.title}
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Pagination Dots */}
          {/* {data.length > 1 && (
            <Box sx={{ mr: 3, display: "flex", gap: 1, zIndex: 1 }}>
              {data.map((_, index) => (
                <motion.div
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: index === currentIndex 
                      ? "white" 
                      : "rgba(255, 255, 255, 0.4)",
                    cursor: "pointer",
                    boxShadow: index === currentIndex 
                      ? "0 2px 8px rgba(255, 255, 255, 0.5)" 
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Box>
          )} */}

        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            color: "#4572ed",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            borderRadius: 3,
            border: "2px dashed #cbd5e1",
          }}
        >
          <Typography sx={{ fontWeight: 500, fontSize: "16px", color: "#4572ed" }}>
            📭 No Announcements Available
          </Typography>
        </Paper>
      )}

      {/* Modern Popup Modal (keeping your existing modal) */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <Backdrop
            open={true}
            sx={{ 
              zIndex: 99,
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 50 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.4, 0, 0.2, 1] 
              }}
              style={{ outline: "none" }}
            >
              <Paper
                elevation={24}
                sx={{
                  background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: 4,
                  p: 0,
                  width: { xs: "90vw", sm: "70vw", md: "50vw" },
                  maxWidth: "600px",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {/* Header with gradient */}
                <Box
                  sx={{
                    background: "transparent",
                    color: "#4572ed",
                    p: 3,
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", color: "#4572ed" }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        flex: 1, 
                        pr: 2,
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                      }}
                    >
                      {selectedAnnouncement.title}
                    </Typography>
                    <IconButton
                      onClick={() => setSelectedAnnouncement(null)}
                      sx={{
                        color: "white",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.2)",
                          transform: "rotate(90deg)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 4 }}>
                  <Typography 
                    sx={{ 
                      mb: 3, 
                      lineHeight: 1.7, 
                      fontSize: "16px",
                      color: "#4572ed"
                    }}
                  >
                    {selectedAnnouncement.description}
                  </Typography>

                  {/* Date info with modern styling */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      mb: 3,
                      background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                      <CalendarTodayIcon sx={{ color: "#667eea", fontSize: 20 }} />
                      <Box sx={{ flex: 1, minWidth: "200px" }}>
                        <Typography variant="body2" sx={{ color: "#4572ed", fontWeight: 500 }}>
                          <strong style={{ color: "#1e293b" }}>Start:</strong>{" "}
                          {new Date(selectedAnnouncement.startDate).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#4572ed", fontWeight: 500 }}>
                          <strong style={{ color: "#1e293b" }}>End:</strong>{" "}
                          {new Date(selectedAnnouncement.endDate).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setSelectedAnnouncement(null)}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        py: 1.5,
                        fontSize: "16px",
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: "none",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                        "&:hover": {
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                          background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Got it!
                    </Button>
                  </motion.div>
                </Box>
              </Paper>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Announcement;