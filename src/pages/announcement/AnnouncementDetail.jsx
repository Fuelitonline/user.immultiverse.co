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
  Grid,
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
      <Box sx={{ mx: "auto", p: 3 }}>
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
              background: "transparent",
              boxShadow: "none",
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
              elevation={3}
              sx={{
                background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                p: 4,
                width: "100%",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              }}
            >
                
              <Box>
              <Box sx={{position: "absolute", zIndex: 1, top: 12, right: 12}}>
                {announcement.file && (
                  <motion.div
                  whileTap={{ scale: 0.98 }}
                >
                  
                    <Button
                      variant="contained"
                      href={announcement.file}
                      target="_blank"
                      download
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
                      View Attachment
                    </Button>
                </motion.div>
              )}
              </Box>
                  <Box sx={{ display: "flex", position: "relative", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
                  <Box >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        letterSpacing: "-0.02em",
                        color: "#4572ed",
                      }}
                    >
                      {announcement.title}
                    </Typography>
                  </Box>
              </Box>
              </Box>
            </Paper>

            <CardContent sx={{ padding: "32px 4px" }}>
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

            

              {/* Date Information */}
              <Grid container spacing={2}>
                <Grid width={'48.9%'} item xs={6} sm={6} md={6} lg={6} xl={6}>
                  <Paper
                    elevation={3}
                    sx={{
                      mb: 4,
                      p: 3,
                      background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid rgba(156, 39, 176, 0.2)",
                      borderRadius: 3,
                      height: "100%",
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
                </Grid>

                {/* Creator Information */}
                <Grid width={'48.9%'} item xs={6} sm={6} md={6} lg={6} xl={6}>
                  <Paper
                    elevation={3}
                    sx={{
                      mb: 4,
                      p: 3,
                      background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid rgba(76, 175, 80, 0.2)",
                      borderRadius: 3,
                      height: "100%",
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
                </Grid>
              </Grid>

              <Grid container spacing={2} mt={2}>
                {/* Target */}
                <Grid width={'23.9%'} item xs={3} sm={3} md={3} lg={3} xl={3}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid rgba(255, 152, 0, 0.2)",
                      borderRadius: 2,
                      textAlign: "center",
                      height: "100%",
                      display: "flex", justifyContent: "center", alignItems: "center"
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
                </Grid>

                {/* Departments */}
                <Grid width={'23.9%'} item xs={3} sm={3} md={3} lg={3} xl={3}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      background: "llinear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid rgba(33, 150, 243, 0.2)",
                      borderRadius: 2,
                      height: "100%",
                      textAlign: "center",
                      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#0d47a1", mb: 1 }}>
                      Departments
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {announcement.department?.map((d) => (
                        <Chip
                          key={d._id}
                          label={d.departmentName}
                          sx={{
                            background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Teams */}
                <Grid width={'23.9%'} item xs={3} sm={3} md={3} lg={3} xl={3}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid rgba(156, 39, 176, 0.2)",
                      borderRadius: 2,
                      height: "100%",
                      textAlign: "center",
                      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#4a148c", mb: 1 }}>
                      Teams
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {announcement.team?.map((t) => (
                        <Chip
                          key={t._id}
                          label={t.teamName}
                          sx={{
                            background: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Employees */}
                <Grid width={'23.9%'} item xs={3} sm={3} md={3} lg={3} xl={3}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "1px solid rgba(76, 175, 80, 0.2)",
                      borderRadius: 2,
                      height: "100%",
                      textAlign: "center",
                      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#2e7d32", mb: 1 }}>
                      Employees
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {announcement.employee?.map((e) => (
                        <Chip
                          key={e._id}
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
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>




            </CardContent>
          </Card>
        </motion.div>

      </Box>
    </Box>
  );
};

export default AnnouncementDetail;