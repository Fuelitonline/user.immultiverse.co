// src/components/listView/projectDetail.js
import React, { useEffect, useState } from "react";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProjectDetailsListView = ({
  id,
  taskName,
  estimateTime,
  spentTime,
  assignee,
  priority,
  status,
  progress,
}) => {
  const [data, setData] = useState({
    taskName,
    estimateTime,
    spentTime,
    assignee,
    priority,
    status,
    progress,
  });

  useEffect(() => {
    setData({
      id,
      taskName,
      estimateTime,
      spentTime,
      assignee,
      priority,
      status,
      progress,
    });
  }, [id, taskName, estimateTime, spentTime, assignee, priority, status, progress]);

  const navigate = useNavigate();

  const statusColors = {
    "In Review": { bg: "rgba(0, 0, 255, 0.2)", text: "#00008b" },
    "Done": { bg: "rgba(0, 128, 0, 0.2)", text: "#006400" },
    "In Progress": { bg: "rgba(177, 17, 240, 0.2)", text: "#b111f0" },
    "To Do": { bg: "rgba(255, 165, 0, 0.2)", text: "#ff8c00" },
  };

  const priorityColors = {
    High: { color: "red", arrow: <ArrowDropUp /> },
    Medium: { color: "orange", arrow: <ArrowDropUp /> },
    Low: { color: "green", arrow: <ArrowDropDown /> },
  };

  const { bg: statusBgColor, text: statusTextColor } = statusColors[data.status] || { bg: "white", text: "black" };
  const { color: priorityColor, arrow: priorityArrow } = priorityColors[data.priority] || { color: "black", arrow: "→" };

  return (
    <Box
      onClick={() => navigate(`/projects/task/${data.id}`)}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "1rem",
        backgroundColor: "white",
        borderRadius: "25px",
        padding: "10px",
        paddingLeft: "40px",
        boxSizing: "border-box",
        overflowX: "auto",
        cursor: "pointer",
      }}
    >
      <Box sx={{ flexBasis: "15%", minWidth: "130px", textAlign: "left" }}>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "gray" }}>
          Task Name
        </Typography>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "black" }}>
          {data.taskName}
        </Typography>
      </Box>
      <Box sx={{ flex: "1 1 0", minWidth: "90px", textAlign: "left" }}>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "gray" }}>
          Estimate Time
        </Typography>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "black" }}>
          {data.estimateTime}
        </Typography>
      </Box>
      <Box sx={{ flex: "1 1 0", minWidth: "110px", textAlign: "left" }}>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "gray" }}>
          Spent Time
        </Typography>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "black" }}>
          {data.spentTime}
        </Typography>
      </Box>
      <Box sx={{ flex: "1 1 0", minWidth: "100px", textAlign: "left" }}>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "gray" }}>
          Assignee
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "10px", sm: "12px", md: "14px" },
            color: "black",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <img
            src={data?.assignee?.avatar}
            alt="assignee"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
            }}
          />
          {data?.assignee?.name}
        </Typography>
      </Box>
      <Box sx={{ flex: "1 1 0", minWidth: "80px", textAlign: "left" }}>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: "gray" }}>
          Priority
        </Typography>
        <Typography
          sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, color: priorityColor, display: "flex", alignItems: "center" }}
        >
          {priorityArrow} {data.priority}
        </Typography>
      </Box>
      <Box sx={{ flex: "1 1 0", minWidth: "80px", textAlign: "center" }}>
        <Typography sx={{ fontSize: { xs: "10px", sm: "12px", md: "14px" }, textAlign: 'center', borderRadius: "10px", color: statusTextColor, bgcolor: statusBgColor }}>
          {data.status}
        </Typography>
      </Box>
      <Box sx={{ flex: "1 1 0", minWidth: "100px", textAlign: "center" }}>
        <CircularProgress
          variant="determinate"
          value={data.progress}
          size={24}
          sx={{ color: 'primary.main' }}
        />
      </Box>
    </Box>
  );
};

export default ProjectDetailsListView;
