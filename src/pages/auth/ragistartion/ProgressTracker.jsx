import React from "react";
import { Stepper, Step, StepLabel, StepConnector, styled } from "@mui/material";
import { keyframes } from "@emotion/react";

// Animation for active step
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Custom Step Connector with gradient
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    borderColor: "rgba(0, 128, 0, 0.3)", // Adjusted to a green tint
    borderTopWidth: 3,
    borderRadius: 5,
    background: "linear-gradient(90deg, #34C759, #28A745)", // Green gradient
    opacity: 0.8,
  },
}));


// Custom Step Icon
const CustomStepIcon = styled("div")(({ theme, active, completed }) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: completed
    ? "linear-gradient(45deg, #053E0E, #0A7921)"
    : active
    ? "#fff"
    : "rgba(255, 255, 255, 0.3)",
  color: completed || active ? "#fff" : "#053E0E",
  fontWeight: "bold",
  fontSize: "1rem",
  opacity:0.7,
  boxShadow: active ? "0 0 10px rgba(5, 62, 14, 0.8)" : "none",
  animation: active ? `${pulse} 1.5s infinite ease-in-out` : "none",
  transition: "all 0.3s ease",
}));

/**
 * Displays a horizontal stepper to track the progress of the registration process with a modern design.
 *
 * @prop {number} currentStage - The current stage of the registration process (0-based index).
 * @prop {string[]} stages - An array of strings representing the stages of the registration process.
 *
 * @returns {React.ReactElement} - A stylish horizontal stepper component with the active stage highlighted.
 */
const ProgressTracker = ({ currentStage, stages }) => {
  return (
    <Stepper
      activeStep={currentStage}
      alternativeLabel
      connector={<CustomConnector />}
      sx={{
        width: "100vh",
        padding: "20px 20px",
        ml:3

        // background: "linear-gradient(135deg, rgba(3, 41, 8, 0.34) 0%, rgba(5, 62, 14, 0.34) 50%, rgba(10, 121, 33, 0.34) 100%)",
        
        // boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
      }}
    >
      {stages.map((stage, index) => (
        <Step key={index}>
          <StepLabel
            StepIconComponent={(props) => (
              <CustomStepIcon {...props} active={index === currentStage} completed={index < currentStage}>
                {index + 1}
              </CustomStepIcon>
            )}
            sx={{
              "& .MuiStepLabel-label": {
                color: index <= currentStage ? "#fff" : "rgba(255, 255, 255, 0.6)",
                fontWeight: "500",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                transition: "color 0.3s ease",
              },
              "& .MuiStepLabel-label.Mui-active": {
                color: "#fff",
                fontWeight: "700",
              },
              "& .MuiStepLabel-label.Mui-completed": {
                color: "#fff",
              },
            }}
          >
            {stage}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default ProgressTracker;