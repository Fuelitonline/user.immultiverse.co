import { Box, Grid, Typography } from "@mui/material";
import ArrowDropUp from "@mui/icons-material/ArrowDropUp";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import React from "react";

function GridView({ id, taskName, spentTime, assignee = {}, priority = "Low" }) {
  const priorityColors = {
    High: { color: "red", arrow: <ArrowDropUp /> },
    Medium: { color: "orange", arrow: <ArrowDropUp /> },
    Low: { color: "green", arrow: <ArrowDropDown /> },
  };

  const { color: priorityColor = "gray", arrow: priorityArrow = <ArrowDropDown /> } = priorityColors[priority] || {};

  return (
    <Box
      sx={{
        width: "100%",
        padding: { xs: "8px", sm: "12px", md: "16px" },
        border: "1px solid #ddd",
        borderRadius: "15px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        backgroundColor: "white",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "grey", textAlign: "left" }}>
            {id || "N/A"}
          </Typography>
          <Typography variant="h5" sx={{ fontSize: { xs: "16px", sm: "18px", md: "20px" }, textAlign: "left" }}>
            {taskName || "Unnamed Task"}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "14px", md: "16px" },
              color: priorityColor,
              display: "flex",
              alignItems: "center",
            }}
          >
            {priorityArrow} {priority || "Low"}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "14px", md: "16px" },
              color: "black",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <img
              src={assignee?.avatar || "https://via.placeholder.com/24"} // Default placeholder image
              alt="assignee"
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
              }}
            />
            {assignee?.name || "Unknown Assignee"}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "14px", md: "16px" },
              color: "black",
              textAlign: "left",
            }}
          >
            {spentTime || "0h"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default GridView;