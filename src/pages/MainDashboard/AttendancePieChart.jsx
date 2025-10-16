import React, { useMemo, useState } from "react";
import { Paper, Typography, useTheme, Box } from "@mui/material";
import { DateTime } from "luxon";
import { useGet } from "../../hooks/useApi";
import { useAuth } from "../../middlewares/auth";
import { useNavigate } from "react-router-dom";

const AttendanceDonutChart = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(DateTime.now().minus({ months: 1 }).month);
  const [selectedYear, setSelectedYear] = useState(DateTime.now().minus({ months: 1 }).year);

  const id = user?._id || "";

  // Calculate date range for selected month
  const startDate = DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: 1 }).toISODate();
  const endDate = DateTime.fromObject({ year: selectedYear, month: selectedMonth }).endOf("month").toISODate();

  // Total days in the selected month
  const totalDaysInMonth = DateTime.fromObject({ year: selectedYear, month: selectedMonth }).daysInMonth;

  // Fetch data from API
  const { data: dailyRecords } = useGet(
    "employee/work-tracking/daily-records",
    { userId: id, startDate, endDate },
    { enabled: !!id }
  );

  const { data: policyData } = useGet("company/policy/attendece-get", { employeeId: id }, { enabled: !!id });

  const { data: leaves } = useGet('employee/leave/get-by-id', { employeeId: id }, { enabled: !!id });

  // FIX: Safely extract with defaults (prevents undefined access)
  const workingHours = policyData?.data?.data?.workingHours || 8;
  const halfDayThreshold = workingHours * 0.5;
  const workingDays = policyData?.data?.data?.workingDays || {};

  // Extract records safely
  const records = dailyRecords?.data?.data?.records || [];
  const leaveRequests = leaves?.data?.data?.leaveRequests || [];

  // Calculate attendance (Present = worked any time >0 on working days, or leave, or sandwich; Absent = working days with no work, no leave, not sandwich)
  const attendanceCounts = useMemo(() => {
    // FIX: Use the safely extracted values
    let present = 0;
    let totalWorkingDays = 0;
    const potentialAbsent = new Set();

    // Filter leave requests for the current month
    const monthStartDt = DateTime.fromObject({ year: selectedYear, month: selectedMonth });
    const leaveRequestsInMonth = leaveRequests.filter((leave) => {
      if (!leave?.date || !["Approved", "Pending"].includes(leave.status)) return false;
      const leaveDt = DateTime.fromISO(leave.date);
      return leaveDt.hasSame(monthStartDt, 'month');
    });

    const monthStart = DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: 1 });

    // First pass: count total working days, present (work or leave), and collect potential absents
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dt = monthStart.plus({ days: day - 1 });
      const weekday = dt.weekday; // 1=Mon ... 7=Sun
      const momentDay = weekday === 7 ? 0 : weekday - 1; // Map to 0=Sun ... 6=Sat
      const isWorkingDay = workingDays[momentDay] ?? true;

      if (isWorkingDay) {
        totalWorkingDays++;

        const dateStr = dt.toFormat('yyyy-MM-dd');

        // Check if leave
        const hasLeave = leaveRequestsInMonth.some((leave) => {
          const leaveDt = DateTime.fromISO(leave.date);
          return leaveDt.toFormat('yyyy-MM-dd') === dateStr;
        });

        if (hasLeave) {
          present++;
          continue;
        }

        // Check if record with any working time >0
        const record = records.find((r) => r.day === dateStr);
        const hasWork = record && record.totalWorkingTime > 0;

        if (hasWork) {
          present++;
          continue;
        }

        // Potential absent
        potentialAbsent.add(dateStr);
      }
    }

    // Get non-working day numbers (0-6)
    const nonWorkingDayNums = [];
    for (let d = 0; d < 7; d++) {
      if (!(workingDays[d] ?? true)) {
        nonWorkingDayNums.push(d);
      }
    }

    // Sandwich leave logic
    const sandwichDates = new Set();
    nonWorkingDayNums.forEach((nonWorkingDay) => {
      for (let day = 1; day <= totalDaysInMonth; day++) {
        const dt = monthStart.plus({ days: day - 1 });
        const weekday = dt.weekday;
        const mDay = weekday === 7 ? 0 : weekday - 1;
        if (mDay === nonWorkingDay) {
          const nonWorkingDateStr = dt.toFormat('yyyy-MM-dd');
          const dayBefore = dt.minus({ days: 1 });
          const dayAfter = dt.plus({ days: 1 });
          const beforeStr = dayBefore.toFormat('yyyy-MM-dd');
          const afterStr = dayAfter.toFormat('yyyy-MM-dd');

          // Only consider if before and after are in the same month (potentialAbsent only has this month)
          if (potentialAbsent.has(beforeStr) && potentialAbsent.has(afterStr)) {
            sandwichDates.add(nonWorkingDateStr);
            sandwichDates.add(beforeStr);
            sandwichDates.add(afterStr);
          }
        }
      }
    });

    // Count turned-to-sandwich working days (only the before/after which were potential absents)
    const turnedToSandwich = [...sandwichDates].filter((date) => potentialAbsent.has(date)).length;

    // Final counts
    const finalPresent = present + turnedToSandwich;
    const finalAbsent = potentialAbsent.size - turnedToSandwich;

    return { present: finalPresent, absent: finalAbsent };
  }, [records, leaveRequests, workingHours, workingDays, selectedYear, selectedMonth, totalDaysInMonth]);

  const totalDays = attendanceCounts.present + attendanceCounts.absent;

  const colors = {
    Present: "#10b981", // Match first code's attended green
    Absent: "#ef4444", // Match first code's absent red
  };

  const presentPercentage = totalDays > 0 ? attendanceCounts.present / totalDays : 0;
  const presentDegrees = presentPercentage * 360;

  const chartContainerStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    position: "relative",
    background: `conic-gradient(${colors.Present} 0deg ${presentDegrees}deg, ${colors.Absent} ${presentDegrees}deg 360deg)`,
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    flexShrink: 0,
  };

  const innerHoleStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.02)",
  };

  return (
    <Paper
      onClick={() => navigate('/profileattendance')}
      sx={{
        padding: 3,
        height: "32vh",
        minHeight: "280px",
        borderRadius: "12px",
        background: "#f7f9fc",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
        },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: "1rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Last Month Attendance
        </Typography>
      </Box>

      {/* Donut Chart */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
        <div style={chartContainerStyle}>
          <div style={innerHoleStyle}>
            <Typography variant="h5" fontWeight={700} color={theme.palette.text.primary} sx={{ lineHeight: 1 }}>
              {attendanceCounts.present}
            </Typography>
            <Typography variant="caption" color={theme.palette.text.secondary}>
              Present
            </Typography>
          </div>
        </div>
      </Box>

      {/* Legend */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "space-around", mt: 2 }}>
        {/* Present */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "4px", bgcolor: colors.Present }} />
          <Box>
            <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
              {attendanceCounts.present}
            </Typography>
            <Typography variant="caption" color={theme.palette.text.secondary}>
              Days Present
            </Typography>
          </Box>
        </Box>

        {/* Absent */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "4px", bgcolor: colors.Absent }} />
          <Box>
            <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>
              {attendanceCounts.absent}
            </Typography>
            <Typography variant="caption" color={theme.palette.text.secondary}>
              Days Absent
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default AttendanceDonutChart;