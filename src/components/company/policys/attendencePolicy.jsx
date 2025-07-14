import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Divider,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import { set } from "lodash";
import { useParams } from "react-router-dom";
import { usePost } from "../../../hooks/useApi";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types"; // Import PropTypes
const AnimatedForm = styled(Box)({
  perspective: "1000px",
  height: "80vh",
  overflow: "auto",
  "& > div": {
    transformStyle: "preserve-3d",
    transition: "transform 0.5s ease",
    transform: "rotateY(0deg)",
    "&:hover": {
      transform: "rotateY(5deg)",
    },
  },
});

const FormContainer = styled(Box)({
 
  borderRadius: "12px",
  padding: "30px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "600px",
  transition: "box-shadow 0.3s, transform 0.3s",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
    transform: "scale(1.01)",
  },
});

const StyledTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.3s, border 0.3s",
  },
  "&:hover .MuiInputBase-root": {
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  },
  
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ced4da",
  },
  "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: "#80bdff",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#007bff",
  },
  "& .MuiFormLabel-filled": {
    transform: "translate(14px, -6px) scale(0.75)", // Adjust label position
  },
  "& .MuiFormLabel-root": {
    transition: "0.2s ease-in-out",
  },
});

const StyledButton = styled(Button)({
  
  
  borderRadius: "8px",
  transition: "background-color 0.3s, transform 0.3s",
  "&:hover": {
    
    transform: "scale(1.05)",
  },
});

const weekdays = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
];
/**
 * @fileoverview AttendancePolicy component - A form used to set the attendance policy for employees.
 * This component allows the configuration of working hours, leave counts, working days, and late punch-in rules for various employee types.
 * 
 * @component
 * @example
 * return <AttendancePolicy />
 */

/**
 * AttendancePolicy Component - A form to set the attendance policies for employees.
 * This component provides fields to set working hours, leave counts, working days, and late punch-in policy for different employee types.
 * 
 * @function
 * @returns {JSX.Element} The AttendancePolicy form.
 */
function AttendancePolicy() {
  
  /**
   * State for managing working hours (start and end time).
   * @type {Object}
   * @property {string} start - The start time of the working hours.
   * @property {string} end - The end time of the working hours.
   */
  const [workingHours, setWorkingHours] = useState({ start: "", end: "" });

  /**
   * State for managing leave count (annual, sick, casual).
   * @type {Object}
   * @property {number} annual - The number of annual leaves.
   * @property {number} sick - The number of sick leaves.
   * @property {number} casual - The number of casual leaves.
   */
  const [leaveCount, setLeaveCount] = useState({
    annual: null,
    sick: null,
    casual: null,
  });

  /**
   * State for managing employee type (full-time, part-time, contract, or intern).
   * @type {string}
   */
  const [employeeType, setEmployeeType] = useState("");

  /**
   * State for managing working days (boolean value for each weekday).
   * @type {Object}
   * @property {boolean} 0 - Represents Sunday.
   * @property {boolean} 1 - Represents Monday.
   * @property {boolean} 2 - Represents Tuesday.
   * @property {boolean} 3 - Represents Wednesday.
   * @property {boolean} 4 - Represents Thursday.
   * @property {boolean} 5 - Represents Friday.
   * @property {boolean} 6 - Represents Saturday.
   */
  const [workingDays, setWorkingDays] = useState(
    weekdays.reduce((acc, day) => ({ ...acc, [day.value]: false }), {})
  );

  /**
   * State for managing late punch-in allowance.
   * @type {number}
   */
  const [latePuchase, setLatePuchase] = useState(0);

  /**
   * Employee ID obtained from route parameters.
   * @type {string}
   */
  const empId = useParams().id;

  /**
   * Custom hook for making POST requests to submit the attendance policy data.
   * @type {Object}
   * @function
   * @param {Object} policyData - The policy data to be sent to the server.
   * @returns {Promise<Object>} - The response data from the API call.
   */
  const postPolicy = usePost("/company/policy/attendece-create");

  /**
   * Handles changes to the leave count fields (annual, sick, casual).
   * Updates sick and casual leave based on the annual leave and ensures no overflow.
   * @function
   * @param {Object} e - The event object from the form input.
   */
  const handleLeaveCountChange = (e) => {
    const { name, value } = e.target;
    if (name === "sick") {
      setLeaveCount((prev) => ({ ...prev, sick: Number(value) }));
      setLeaveCount((prev) => ({
        ...prev,
        casual: prev.annual - Number(value),
      }));
    }
    if (name === "casual") {
      setLeaveCount((prev) => ({ ...prev, casual: Number(value) }));
      setLeaveCount((prev) => ({ ...prev, sick: prev.annual - Number(value) }));
    }

    setLeaveCount((prev) => ({ ...prev, [name]: Number(value) }));
  };

  /**
   * Handles changes in the working days (checkbox for each day).
   * Toggles the working day for the selected day.
   * @function
   * @param {number} day - The value of the day (0-6 representing Sunday to Saturday).
   */
  const handleDayChange = (day) => {
    setWorkingDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  /**
   * Calculates the total number of working days selected by the user.
   * @function
   * @returns {number} - The number of working days selected.
   */
  const calculateTotalWorkingDays = () => {
    return Object.values(workingDays).filter(Boolean).length;
  };

  /**
   * Handles form submission by collecting data from the form and making an API request to save the policy.
   * @function
   * @param {Object} e - The event object from the form submission.
   * @returns {Promise<void>} - An async function to handle form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalWorkingDays = calculateTotalWorkingDays();
    const policyData = {
      employeeId: empId,
      workingHours,
      leaveCount,
      employeeType,
      workingDays,
      totalWorkingDays,
      latePuches: latePuchase,
    };
    console.log(policyData);
    const res = await postPolicy.mutateAsync({ policyData });
    console.log(res);
    if (res.data !== null) {
      toast.success(res.data.message);
    } else {
      res?.error?.error && toast.error(res.error.error);
    }
  };

  /**
   * Calculates the remaining sick leave based on the annual and casual leave counts.
   * @type {number}
   */
  const remainingSickLeaves =
    leaveCount.annual - leaveCount.sick - leaveCount.casual;

  return (
    <AnimatedForm>
      <ToastContainer />
      <FormContainer component="form" onSubmit={handleSubmit}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          color="#007bff"
          sx={{
            fontWeight: "bold",
            fontSize: "1rem",
            textAlign: "left",
          }}
        >
          Attendance Policy Form
        </Typography>

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Employee Type</InputLabel>
          <Select
            value={employeeType}
            onChange={(e) => setEmployeeType(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              },
              "& .MuiSelect-select": {
                color: "#495057",
              },
            }}
          >
            <MenuItem value="">
              <em
                style={{
                  fontSize: "1rem",
                  textAlign: "left",
                }}
              >
                Select Employee Type
              </em>
            </MenuItem>
            <MenuItem value="full-time">Full-Time</MenuItem>
            <MenuItem value="part-time">Part-Time</MenuItem>
            <MenuItem value="contract">Contract</MenuItem>
            <MenuItem value="intern">Intern</MenuItem>
          </Select>
        </FormControl>

        {["full-time", "intern"].includes(employeeType) && (
          <>
            <Typography
              variant="h6"
              gutterBottom
              color="#007bff"
              sx={{
                fontSize: "0.8rem",
                textAlign: "left",
              }}
            >
              Working Hours
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StyledTextField
                  type="time"
                  label="Start Time"
                  value={workingHours.start}
                  onChange={(e) =>
                    setWorkingHours({ ...workingHours, start: e.target.value })
                  }
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <StyledTextField
                  type="time"
                  label="End Time"
                  value={workingHours.end}
                  onChange={(e) =>
                    setWorkingHours({ ...workingHours, end: e.target.value })
                  }
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </>
        )}

        {["part-time", "contract"].includes(employeeType) && (
          <>
            <Typography
              variant="h6"
              gutterBottom
              color="#007bff"
              sx={{
                fontSize: "0.8rem",
                textAlign: "left",
              }}
            >
              Select Total Working Hours (1-12)
            </Typography>
            <FormControl fullWidth required>
              <InputLabel>Total Hours</InputLabel>
              <Select
                value={workingHours.start} // Reusing start for both
                onChange={(e) =>
                  setWorkingHours({
                    start: e.target.value,
                    end: e.target.value,
                  })
                }
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        <Divider sx={{ my: 2, backgroundColor: "#007bff" }} />
        <Typography
          variant="h6"
          gutterBottom
          color="#007bff"
          sx={{
            fontSize: "0.8rem",
            textAlign: "left",
          }}
        >
          Working Days
        </Typography>
        <Box>
          {weekdays.map((day) => (
            <FormControlLabel
              key={day.value}
              control={
                <Checkbox
                  checked={workingDays[day.value]}
                  onChange={() => handleDayChange(day.value)}
                />
              }
              label={day.label}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2, backgroundColor: "#007bff" }} />
        <Typography
          variant="h6"
          gutterBottom
          color="#007bff"
          sx={{
            fontSize: "0.8rem",
            textAlign: "left",
          }}
        >
          Leave Types
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <StyledTextField
              label="Annual Leave"
              name="annual"
              type="number"
              value={leaveCount.annual}
              onChange={handleLeaveCountChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <StyledTextField
              label="Sick Leave"
              name="sick"
              type="number"
              value={leaveCount.sick}
              onChange={handleLeaveCountChange}
              required
              fullWidth
              inputProps={{
                max: leaveCount.annual - leaveCount.casual,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <StyledTextField
              label="Casual Leave"
              name="casual"
              type="number"
              value={leaveCount.casual}
              onChange={handleLeaveCountChange}
              required
              fullWidth
              inputProps={{
                max: leaveCount.annual - leaveCount.sick,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} mt={2}>
            <StyledTextField
              label="Late PuchIn Allowed"
              name="latePuchase"
              type="number"
              value={latePuchase}
              onChange={(e) => setLatePuchase(e.target.value)} 
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

        <StyledButton type="submit" fullWidth sx={{ mt: 3, mb: 2 }}>
          Submit Policy
        </StyledButton>
      </FormContainer>
    </AnimatedForm>
  );
}

AttendancePolicy.propTypes = {
  initialWorkingHours: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string,
  }),
  initialLeaveCount: PropTypes.shape({
    annual: PropTypes.number,
    sick: PropTypes.number,
    casual: PropTypes.number,
  }),
  initialEmployeeType: PropTypes.oneOf(["", "full-time", "part-time", "contract", "intern"]),
  initialWorkingDays: PropTypes.objectOf(PropTypes.bool),
  initialLatePuchase: PropTypes.number,
};

// Default props (optional, already set in the function parameters)
AttendancePolicy.defaultProps = {
  initialWorkingHours: { start: "", end: "" },
  initialLeaveCount: { annual: null, sick: null, casual: null },
  initialEmployeeType: "",
  initialWorkingDays: weekdays.reduce((acc, day) => ({ ...acc, [day.value]: false }), {}),
  initialLatePuchase: 0,
};

export default AttendancePolicy;
