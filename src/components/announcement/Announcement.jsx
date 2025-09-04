import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useGet } from "../../hooks/useApi";
import CampaignIcon from "@mui/icons-material/Campaign";
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
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error.message || "Failed to load announcements"}
      </Alert>
    );
  }

  const data = Array.isArray(announcementData) ? announcementData : [];

  return (
    <Box sx={{ width: "100%", bgcolor: "#f3f4f6" }}>
      {/* 🔔 Marquee Bar */}
      {data.length > 0 ? (
        <Box
          sx={{
            bgcolor: "#4572ed",
            color: "white",
            height: 50,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            cursor: "pointer",
            width: "100%",
          }}
        >
          <CampaignIcon sx={{ mr: 1 }} />
          <motion.div
            style={{ whiteSpace: "nowrap" }}
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          >
            {data.map((item, index) => (
              <span
                key={item.id}
                onClick={() => navigate(`/announcements/${item.id}`)}

                style={{ marginRight: "50px", fontWeight: 500 }}
              >
                {item.title} - {item.description}
              </span>
            ))}
          </motion.div>
        </Box>
      ) : (
        <Box
          sx={{
            bgcolor: "#4572ed",
            color: "white",
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography>No Announcements</Typography>
        </Box>
      )}

      {/* 🔔 Popup */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0,0,0,0.6)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component={motion.div}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              sx={{
                bgcolor: "white",
                borderRadius: 3,
                p: 4,
                width: { xs: "90%", sm: "70%", md: "50%" },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, mt:20 }}>
                {selectedAnnouncement.title}
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {selectedAnnouncement.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                <strong>Start:</strong>{" "}
                {new Date(selectedAnnouncement.startDate).toLocaleString()} |{" "}
                <strong>End:</strong>{" "}
                {new Date(selectedAnnouncement.endDate).toLocaleString()}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setSelectedAnnouncement(null)}
                sx={{
                  bgcolor: "#4572ed",
                  "&:hover": { bgcolor: "#3653c9" },
                  borderRadius: 2,
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Announcement;
