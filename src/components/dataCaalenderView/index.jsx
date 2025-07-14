import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  LinearProgress,
  Tooltip,
  Avatar,
} from "@mui/material";
import { DateTime, Interval } from "luxon";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import styled from "styled-components";

/**
 * Custom Tooltip component that provides a styled tooltip.
 * @component
 * @param {Object} props - The props for the tooltip.
 * @param {string} props.title - The content to display in the tooltip.
 * @returns {JSX.Element} A Tooltip component with custom styles.
 */
const CustomTooltip = ({ title, ...props }) => (
  <Tooltip
    title={title}
    arrow
    {...props}
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: "white",
          boxShadow: "0 8px 16px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.1)",
          outline: "none",
          color: "text.primary",
          border: "none",
          borderRadius: "20px",
          padding: "12px 24px", // Adjusted padding for a more compact tooltip
          fontSize: "0.875rem",
          transform: "translateY(4px)", // Slight offset for 3D effect
        },
      },
      arrow: {
        sx: {
          color: "white",
          "&::before": {
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          },
        },
      },
    }}
  />
);

/**
 * Tries to parse a date string into a valid DateTime object.
 * @param {string} dateString - The date string to parse.
 * @returns {DateTime|null} A DateTime object if the parsing was successful, or null if not.
 */
const parseDate = (dateString) => {
  try {
    const dateTime = DateTime.fromISO(dateString, { zone: "utc" });
    return dateTime.isValid ? dateTime : null;
  } catch {
    return null;
  }
};

/**
 * Returns an array of dates in ISO format between the given start date and end date (inclusive).
 * If the end date is not provided, the current date is used.
 * @param {string} startDate - The start date string to parse.
 * @param {string} [endDate] - The end date string to parse.
 * @returns {string[]} An array of ISO-formatted dates.
 */
const getDatesInRange = (startDate, endDate) => {
  if (!startDate) return [];

  const end = endDate ? DateTime.fromISO(endDate) : DateTime.now();
  const interval = Interval.fromDateTimes(DateTime.fromISO(startDate), end);
  const dates = [];
  let currentDate = interval.start;

  while (currentDate <= interval.end) {
    dates.push(currentDate.toISODate());
    currentDate = currentDate.plus({ days: 1 });
  }

  return dates;
};

/**
 * Generates an array of ISO-formatted date strings representing each day
 * within the specified month and year.
 *
 * @param {number} year - The year for which to generate the month grid.
 * @param {number} month - The month (1-12) for which to generate the month grid.
 * @returns {string[]} An array of ISO-formatted date strings for each day in the month.
 */

const generateMonthGrid = (year, month) => {
  // Create a DateTime object for the start of the month
  const startOfMonth = DateTime.fromObject({ year, month, day: 1 });
  // Get the last day of the month
  const endOfMonth = startOfMonth.endOf("month");

  // Generate an array of dates for the month
  const daysInMonth = [];
  let currentDate = startOfMonth;

  while (currentDate <= endOfMonth) {
    daysInMonth.push(currentDate.toISODate());
    currentDate = currentDate.plus({ days: 1 });
  }

  return daysInMonth;
};

const isTaskActiveOnDate = (task, date) => {
  const startDate = parseDate(task.createdAt);
  const endDate = parseDate(task.taskCompleted);
  if (!startDate) return false;

  return getDatesInRange(startDate, endDate).includes(date);
};

// New Component for Date Header
const DateHeader = ({ daysInMonth }) => {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        gap: 1,
        mb: 0,
        pt: 2.8,
        pb: 0.1,
        whiteSpace: "nowrap",

        borderBottom: "3px solid #f0f3f6",
      }}
    >
      {daysInMonth.map((date) => (
        <Box
          key={date}
          sx={{
            padding: "8px",
            border: "2px solid #f0f3f6",
            backgroundColor: "#dae6f5",
            borderRadius: 1.5,
            minWidth: "30px",
            color: "grey",
            ml: 1,
            fontWeight: "400",
            textAlign: "center",
            fontFamily: "sans-serif",
            fontSize: { xs: "0.75rem", sm: "1rem" },
          }}
        >
          {DateTime.fromISO(date).toFormat("d")}
        </Box>
      ))}
    </Box>
  );
};

// Main Calendar Component
const DataCalendarView = ({ data = [] }) => {
  const [selectedYear, setSelectedYear] = useState(DateTime.now().year);
  const [selectedMonth, setSelectedMonth] = useState(DateTime.now().month);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef(null);

  const handleMonthChange = (direction) => {
    setSelectedMonth((prevMonth) => {
      const newMonth =
        direction === "left"
          ? prevMonth === 1
            ? 12
            : prevMonth - 1
          : prevMonth === 12
          ? 1
          : prevMonth + 1;
      return newMonth;
    });
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const daysInMonth = generateMonthGrid(selectedYear, selectedMonth);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -100 : 100,
        behavior: "smooth",
      });
    }
  };

  const updateScrollProgress = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const maxScrollLeft = scrollWidth - clientWidth;
      setScrollProgress((scrollLeft / maxScrollLeft) * 100);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      updateScrollProgress();
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    updateScrollProgress();
  }, [daysInMonth]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          backgroundColor: "white",
          height: "min-content",
          borderRadius: 8,
          overflow: "hidden",
          flexDirection: "row",
          gap: 0,
          p: 0,
          boxShadow: 2,
        }}
      >
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "white",
            pt: 0,
            mt: 0,
            boxShadow: 1,
            height: "auto",
            overflow: "hidden",
           
          }}
        >
          <Typography
            height={"120px"}
            textAlign={"center"}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            All Tasks <br />
            {data.length}
          </Typography>
          <hr
            style={{
              border: "none",
              height: "3px", // Adjust thickness here
              backgroundColor: "#f0f3f6", // Set the color
            }}
          />
          <Grid
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              mt: -2.2,
            }}
          >
            {data &&
              data.map((task) => (
                <Box key={task.id} bgcolor={"#ffffff"} textAlign={"center"}>
                  <CustomTooltip
                    title={
                      <React.Fragment>
                        <Grid
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                            width: "100%",
                            backgroundColor: "white",
                          }}
                        >
                          <Typography
                            fontSize={{ xs: "0.9rem", sm: "1.2rem" }}
                            sx={{ mb: 3 }}
                          >
                            Assignee
                          </Typography>
                          <Grid
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Avatar
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              sx={{ width: 44, height: 44, marginRight: 1 }}
                            />
                            <Typography
                              fontSize={{ xs: "0.75rem", sm: "1rem" }}
                              color={"black"}
                            >
                              {task.assignee.name}
                            </Typography>
                          </Grid>
                        </Grid>
                      </React.Fragment>
                    }
                    arrow
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "1rem" },
                        alignContent: "center",
                        borderTop: "2px solid #f0f3f6",
                        borderBottom: "2px solid #f0f3f6",
                        padding: "25px 10px", // Adjusted padding for better spacing
                      }}
                    >
                      {task.taskName}
                    </Typography>
                  </CustomTooltip>
                </Box>
              ))}
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          md={10}
          sx={{
            width: "100%",
            overflowX: "auto",
            pt: 2,
            whiteSpace: "nowrap",
          }}
        >
          <Box
            sx={{
              mb: 2,
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <IconButton onClick={() => handleMonthChange("left")}>
              <ArrowBackIosIcon
                sx={{ fontSize: 20, color: "rgba(0, 123, 255, 0.5)" }}
              />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 2 }}>
              {DateTime.fromObject({ month: selectedMonth }).toFormat("MMMM")}{" "}
              {selectedYear}
            </Typography>
            <IconButton onClick={() => handleMonthChange("right")}>
              <ArrowForwardIosIcon
                sx={{ fontSize: 20, color: "rgba(0, 123, 255, 0.5)" }}
              />
            </IconButton>
            <FormControl sx={{ ml: 2, minWidth: 120 }} size="small">
              <Select
                labelId="year-select-label"
                value={selectedYear}
                onChange={handleYearChange}
                sx={{
                  border: "none", // Removes border
                  boxShadow: "none", // Removes box shadow
                  ".MuiOutlinedInput-notchedOutline": {
                    border: "none", // Removes border outline
                  },
                  ".MuiSelect-select": {
                    padding: "10px", // Adjust padding as needed
                  },
                  "&:hover": {
                    ".MuiOutlinedInput-notchedOutline": {
                      border: "none", // Removes border on hover
                    },
                  },
                  "&.Mui-focused": {
                    ".MuiOutlinedInput-notchedOutline": {
                      border: "none", // Removes border on focus
                    },
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      boxShadow: "none", // Remove shadow from dropdown menu
                    },
                  },
                }}
              >
                {Array.from(
                  { length: 60 },
                  (_, i) => DateTime.now().year - 30 + i
                ).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box position={"relative"} height={"min-content"} width={"130%"}>
            <Box ref={scrollContainerRef} width={"100%"} overflow={"auto"}>
              <DateHeader daysInMonth={daysInMonth} />
              {data.map((task) => (
                <Grid container spacing={1} key={task.id} width={"100%"}>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1,
                        pt: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {daysInMonth.map((date) => (
                        <Box
                          key={date}
                          sx={{
                            padding: "25px 8px",
                            margin: 0.5,
                            ml: 0.59,
                            border: "1px solid #ddd",
                            backgroundColor: isTaskActiveOnDate(task, date)
                              ? "rgba(0, 123, 255, 0.5)"
                              : "#dae6f5",
                            borderRadius: 1.5,
                            minWidth: "30px",
                            textAlign: "center",
                            fontSize: { xs: "0.75rem", sm: "1rem" },
                          }}
                        >
                          {/* Add any content for each day cell if needed */}
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              ))}
            </Box>
            <Box
              sx={{
                position: "absolute",
                bottom: -10,
                left: "0",
                width: "100%",
                px: 2,
              }}
            >
              <LinearProgress variant="determinate" value={scrollProgress} />
            </Box>
          </Box>
        </Grid>
      </Box>
    </>
  );
};

// Prop validation
DataCalendarView.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      taskCompleted: PropTypes.string.isRequired,
      taskName: PropTypes.string.isRequired,
      estimateTime: PropTypes.string,
      spentTime: PropTypes.string,
      assignee: PropTypes.shape({
        name: PropTypes.string,
        avatar: PropTypes.string,
      }),
      priority: PropTypes.string,
      status: PropTypes.string,
      progress: PropTypes.number,
    })
  ),
};

export default DataCalendarView;
