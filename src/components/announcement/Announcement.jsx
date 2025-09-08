import React, { useState } from "react";
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

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "8vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 2,
        }}
      >
        <CircularProgress size={24} sx={{ color: "white" }} />
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

  const data = Array.isArray(announcementData) ? announcementData : [];

  return (
    <Box sx={{ width: "100%" }}>
      {/* 🔔 Modern Marquee Bar */}
      {data.length > 0 ? (
        <Paper
          elevation={8}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            height: 60,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            cursor: "pointer",
            borderRadius: 3,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              pointerEvents: "none",
            },
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.37)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
          }}
        >
          <Box sx={{ ml: 3, mr: 2, display: "flex", alignItems: "center" }}>
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <CampaignIcon sx={{ fontSize: 28, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
            </motion.div>
          </Box>
          
          <motion.div
            style={{ whiteSpace: "nowrap", flex: 1 }}
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            {data.map((item, index) => (
              <span
                key={item.id}
                onClick={() => navigate(`/announcements/${item.id}`)}
                style={{ 
                  marginRight: "80px", 
                  fontWeight: 600, 
                  fontSize: "16px",
                  textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  display: "inline-block",
                  transition: "all 0.3s ease",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.transform = "scale(1)";
                }}
              >
                📢 {item.title} - {item.description}
              </span>
            ))}
          </motion.div>
        </Paper>
      ) : (
        <Paper
          elevation={4}
          sx={{
            background: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
            color: "white",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(156, 163, 175, 0.3)",
          }}
        >
          <Typography sx={{ fontWeight: 500, fontSize: "16px" }}>
            📭 No Announcements Available
          </Typography>
        </Paper>
      )}

      {/* 🔔 Modern Popup Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <Backdrop
            open={true}
            sx={{ 
              zIndex: 99,
              backdropFilter: "blur(10px)",
              background: "rgba(0,0,0,0.7)"
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
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {/* Header with gradient */}
                <Box
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
                      color: "#374151"
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
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                          <strong style={{ color: "#1e293b" }}>Start:</strong>{" "}
                          {new Date(selectedAnnouncement.startDate).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
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
                      Got it! ✨
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