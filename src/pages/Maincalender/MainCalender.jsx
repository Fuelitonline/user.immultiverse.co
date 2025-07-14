import React, { useEffect, useState } from "react";
import CalendarView from "./calenderView";
import Activities from "./Activities";
import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import ProfileNav from "../../components/user/profiveNav";
import { useGet, usePost } from "../../hooks/useApi";
import { useAuth } from "../../middlewares/auth";
import { useTheme } from "@emotion/react";
import moment from "moment";

function MainCalender() {
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
    "/emplyoee/daily-work/get",
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

  const handleGiveFeedback = usePost("/emplyoee/daily-work/update");

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

  return (
    <Box
      sx={{
        width: "98%",
        maxWidth: 1800,
        mx: "auto",
        minHeight: "100vh",
        py: 2,
        mr: 2,
      }}
    >
      <Box sx={{ width: "100%", mb: 9 }}>
        <Grid
          container
          spacing={2}
          sx={{ width: "100%", position: "sticky", top: 0, zIndex: 1000 }}
        >
          <Grid item xs={12} container justifyContent="flex-end">
            <ProfileNav />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(240, 245, 250, 0.8)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ height: "calc(100% - 60px)", width: "100%" }}>
              <CalendarView
                size={{ width: "100%", height: "84vh" }}
                getTimes={handleTimes}
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Activities
            combinedData={combinedData}
            handleToggleFeedback={handleToggleFeedback}
            openFeedback={openFeedback}
            handlePopoverOpen={handlePopoverOpen}
            handlePopoverClose={handlePopoverClose}
            handleFeedbackChange={handleFeedbackChange}
            handleSubmitFeedback={handleSubmitFeedback}
            loading={loading}
            feedback={feedback}
            getEmployeeName={getEmployeeName}
            theme={theme}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default MainCalender;