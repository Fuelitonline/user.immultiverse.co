import { CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import PropTypes from 'prop-types';

/**
 * GetProgress component to display an employee's progress as a circular indicator
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee data object
 * @param {string} props.date - Date to match progress against
 * @param {Array} props.progress - Array of progress records
 * @returns {JSX.Element|string} Circular progress indicator or empty string if no progress
 */
function GetProgress({ employee, date, progress }) {
  const progresses = progress?.find(
    (p) => p.date?.split("T")[0] === date && p.employeeId === employee._id
  );

  if (!progresses?.process) {
    return '';
  }

  const progressValue = parseFloat(progresses?.process?.toFixed(2));

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress 
        variant="determinate" 
        value={progressValue} 
        color={progressValue < 75 ? 'error' : 'success'} 
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary" }}
        >
          {`${Math.round(progressValue)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * PropTypes for the GetProgress component
 * @type {Object}
 */
GetProgress.propTypes = {
  employee: PropTypes.shape({
    _id: PropTypes.string.isRequired, // Unique identifier for the employee
  }).isRequired,
  date: PropTypes.string.isRequired, // Date string to filter progress records
  progress: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired, // Date of the progress record (ISO format)
      employeeId: PropTypes.string.isRequired, // Employee ID associated with the progress
      process: PropTypes.number, // Progress value (percentage)
    })
  ), // Array of progress objects, optional
};

export default GetProgress;