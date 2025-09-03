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
  CardHeader,
} from "@mui/material";
import ProfileNav from '../../components/user/profiveNav';

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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">{error.message || "Failed to load"}</Alert>;
  }

  const announcement = data?.data?.data;

  if (!announcement) {
    return <Typography>No data found</Typography>;
  }

  return (
    <Box sx={{ mx: "auto", mt: 8, p: 3, maxWidth: "800px", width: "100%" }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ProfileNav />
      </Box>
      <Card sx={{ boxShadow: 4, borderRadius: 2, overflow: "visible", mt: 10 }}>
        <CardHeader
          title={
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>
              {announcement.title}
            </Typography>
          }
          sx={{
            background: "linear-gradient(90deg, #4572ed 0%, #6a8eff 100%)",
            color: "#fff",
            p: 2,
            borderRadius: "4px 4px 0 0",
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: "#333", lineHeight: 1.6 }}>
            {announcement.description}
          </Typography>

          {announcement.file && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                href={announcement.file}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  backgroundColor: "#4572ed",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#3559c3" },
                  textTransform: "none",
                  padding: "8px 16px",
                  borderRadius: 1,
                }}
              >
                View Attachment
              </Button>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              <strong>Start Date:</strong>{" "}
              {new Date(announcement.startDate).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              <strong>End Date:</strong>{" "}
              {new Date(announcement.endDate).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
            <strong>Created By:</strong> {announcement.createdBy?.name} ({announcement.createdBy?.email})
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
            <strong>Target Type:</strong> {announcement.targetType}
          </Typography>

          {announcement.department?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#333" }}>
                Departments:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {announcement.department.map((d) => (
                  <Chip
                    key={d._id}
                    label={d.departmentName}
                    sx={{
                      backgroundColor: "#e3f2fd",
                      color: "#4572ed",
                      "&:hover": { backgroundColor: "#d1e4ff" },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {announcement.team?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#333" }}>
                Teams:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {announcement.team.map((t) => (
                  <Chip
                    key={t._id}
                    label={t.teamName}
                    sx={{
                      backgroundColor: "#e3f2fd",
                      color: "#4572ed",
                      "&:hover": { backgroundColor: "#d1e4ff" },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {announcement.employee?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#333" }}>
                Employees:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {announcement.employee.map((e) => (
                  <Chip
                    key={e._id}
                    label={e.name}
                    sx={{
                      backgroundColor: "#e3f2fd",
                      color: "#4572ed",
                      "&:hover": { backgroundColor: "#d1e4ff" },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnnouncementDetail;