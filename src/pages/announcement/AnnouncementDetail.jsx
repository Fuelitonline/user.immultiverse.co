import React from "react";
import { useParams } from "react-router-dom";
import { useGet } from "../../hooks/useApi";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Card,
  CardContent,
  Paper,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import ProfileNav from '../../components/user/profiveNav';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CampaignIcon from "@mui/icons-material/Campaign";

const AnnouncementDetail = () => {
  const { id } = useParams();

  // Fetch single announcement by ID
  const { data, isLoading, isError, error } = useGet(
    `/announcement/user/get/${id}`,
    {},
    {},
    { queryKey: ["announcement", id] }
  );

  if (isLoading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        minHeight: "50vh"
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress 
            size={50}
            sx={{ 
              color: "#667eea",
              filter: "drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))"
            }} 
          />
        </motion.div>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert 
        severity="error"
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(244, 67, 54, 0.15)",
          border: "1px solid rgba(244, 67, 54, 0.2)",
          m: 3
        }}
      >
        {error.message || "Failed to load"}
      </Alert>
    );
  }

  const announcement = data?.data?.data;

  if (!announcement) {
    return (
      <Typography 
        sx={{ 
          textAlign: "center", 
          mt: 5,
          color: "#64748b",
          fontSize: "18px"
        }}
      >
        No data found
      </Typography>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)",
      py: 3,
      width: "100%"
    }}>
      <Box sx={{ mx: "auto", p: 3, maxWidth: "900px", width: "100%" }}>
        {/* Profile Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <ProfileNav />
          </Box>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card 
            elevation={16}
            sx={{ 
              borderRadius: 4, 
              mt: 10,
              overflow: "hidden",
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              }
            }}
          >
            {/* Header Section */}
            <Paper
              elevation={0}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                p: 4,
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: 60,
                    height: 60,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                  }}
                >
                  <CampaignIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2
                    }}
                  >
                    {announcement.title}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <CardContent sx={{ p: 4 }}>
              {/* Description Section */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 4,
                  background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  borderRadius: 3,
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: "#374151", 
                    lineHeight: 1.8,
                    fontSize: "16px",
                    fontWeight: 400
                  }}
                >
                  {announcement.description}
                </Typography>
              </Paper>

              {/* File Attachment */}
              {announcement.file && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      mb: 4,
                      p: 2,
                      background: "linear-gradient(145deg, #e0f2fe 0%, #b3e5fc 100%)",
                      border: "1px solid rgba(3, 169, 244, 0.2)",
                      borderRadius: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      href={announcement.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<AttachFileIcon />}
                      sx={{
                        background: "linear-gradient(135deg, #0288d1 0%, #0277bd 100%)",
                        color: "#fff",
                        "&:hover": { 
                          background: "linear-gradient(135deg, #0277bd 0%, #01579b 100%)",
                          boxShadow: "0 6px 20px rgba(2, 136, 209, 0.4)"
                        },
                        textTransform: "none",
                        padding: "12px 24px",
                        borderRadius: 2,
                        fontSize: "15px",
                        fontWeight: 600,
                        boxShadow: "0 4px 15px rgba(2, 136, 209, 0.3)",
                      }}
                    >
                      📎 View Attachment
                    </Button>
                  </Paper>
                </motion.div>
              )}

              {/* Date Information */}
              <Paper
                elevation={3}
                sx={{
                  mb: 4,
                  p: 3,
                  background: "linear-gradient(145deg, #f3e5f5 0%, #e1bee7 100%)",
                  border: "1px solid rgba(156, 39, 176, 0.2)",
                  borderRadius: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CalendarTodayIcon sx={{ color: "#8e24aa", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#4a148c" }}>
                    Schedule
                  </Typography>
                </Box>
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#6a1b9a", fontWeight: 600 }}>
                      Start Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#4a148c", fontWeight: 500 }}>
                      {new Date(announcement.startDate).toLocaleString("en-IN", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "#6a1b9a", fontWeight: 600 }}>
                      End Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#4a148c", fontWeight: 500 }}>
                      {new Date(announcement.endDate).toLocaleString("en-IN", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Creator Information */}
              <Paper
                elevation={3}
                sx={{
                  mb: 4,
                  p: 3,
                  background: "linear-gradient(145deg, #e8f5e8 0%, #c8e6c9 100%)",
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                  borderRadius: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon sx={{ color: "#388e3c", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#2e7d32" }}>
                    Created By
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#4caf50", width: 48, height: 48 }}>
                    {announcement.createdBy?.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#1b5e20" }}>
                      {announcement.createdBy?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#388e3c" }}>
                      {announcement.createdBy?.email}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Target Type */}
              <Paper
                elevation={2}
                sx={{
                  mb: 4,
                  p: 2,
                  background: "linear-gradient(145deg, #fff3e0 0%, #ffe0b2 100%)",
                  border: "1px solid rgba(255, 152, 0, 0.2)",
                  borderRadius: 2,
                  textAlign: "center"
                }}
              >
                <Chip
                  label={`Target: ${announcement.targetType}`}
                  sx={{
                    background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "14px",
                    px: 2,
                    py: 1,
                    boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)",
                  }}
                />
              </Paper>

              {/* Departments */}
              {announcement.department?.length > 0 && (
                <Paper
                  elevation={2}
                  sx={{
                    mb: 3,
                    p: 3,
                    background: "linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)",
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    borderRadius: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <BusinessIcon sx={{ color: "#1976d2", mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                      Departments
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {announcement.department.map((d, index) => (
                      <motion.div
                        key={d._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Chip
                          label={d.departmentName}
                          sx={{
                            background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                            color: "white",
                            fontWeight: 500,
                            "&:hover": { 
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 15px rgba(33, 150, 243, 0.4)"
                            },
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 10px rgba(33, 150, 243, 0.2)",
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Teams */}
              {announcement.team?.length > 0 && (
                <Paper
                  elevation={2}
                  sx={{
                    mb: 3,
                    p: 3,
                    background: "linear-gradient(145deg, #f3e5f5 0%, #e1bee7 100%)",
                    border: "1px solid rgba(156, 39, 176, 0.2)",
                    borderRadius: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <GroupsIcon sx={{ color: "#7b1fa2", mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#4a148c" }}>
                      Teams
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {announcement.team.map((t, index) => (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Chip
                          label={t.teamName}
                          sx={{
                            background: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
                            color: "white",
                            fontWeight: 500,
                            "&:hover": { 
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 15px rgba(156, 39, 176, 0.4)"
                            },
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 10px rgba(156, 39, 176, 0.2)",
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Employees */}
              {announcement.employee?.length > 0 && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: "linear-gradient(145deg, #e8f5e8 0%, #c8e6c9 100%)",
                    border: "1px solid rgba(76, 175, 80, 0.2)",
                    borderRadius: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PersonIcon sx={{ color: "#388e3c", mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2e7d32" }}>
                      Employees
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {announcement.employee.map((e, index) => (
                      <motion.div
                        key={e._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Chip
                          avatar={
                            <Avatar sx={{ bgcolor: "#4caf50", color: "white", fontSize: "12px" }}>
                              {e.name?.charAt(0)}
                            </Avatar>
                          }
                          label={e.name}
                          sx={{
                            background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                            color: "white",
                            fontWeight: 500,
                            pl: 1,
                            "&:hover": { 
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 15px rgba(76, 175, 80, 0.4)"
                            },
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 10px rgba(76, 175, 80, 0.2)",
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Floating Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box sx={{ position: "fixed", bottom: 30, right: 30, zIndex: 1000 }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconButton
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  width: 60,
                  height: 60,
                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    boxShadow: "0 12px 35px rgba(102, 126, 234, 0.6)",
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <CampaignIcon sx={{ fontSize: 30 }} />
              </IconButton>
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default AnnouncementDetail;