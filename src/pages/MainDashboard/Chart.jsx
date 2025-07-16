import React from "react";
import ReactApexChart from "react-apexcharts";
import { Paper, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const Chart = ({ data }) => {
  const theme = useTheme();
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Extract values from the passed data
  const totalLeaves = data?.value || 0; // Total leaves taken (fallback to 0 if missing)
  const remainingLeaves = data?.remaining || 0; // Remaining leaves (fallback to 0 if missing)
  const leaveType = data?.name || "Total Leave"; // Leave type (fallback to "Total Leave" if missing)

  // Map data.name to desired heading
  const headingMap = {
    "Remaining Leave": "Total Leave",
    "Sick Leave": "Sick Leave",
    "Casual Leave": "Casual Leave",
    "Total Leave": "Total Leave",
  };
  const chartHeading = headingMap[leaveType] || "Total Leave";

  // Define updated darker color schemes for each leave type
  const colors = {
    "Annual Leave": "#4CAF50", // Soft Green (Modern and calming)
    "Sick Leave": "#FF7043", // Soft Coral (Gentle, warm tone)
    "Casual Leave": "#FFB74D", // Light Amber (Warm and inviting)
    "Remaining Leave": "#8fcfb3", // Light Red (Attention-grabbing yet soft)
    "Total Leave": "#8e44ad", // Default purple for total leave
  };

  // Get the color for the used leaves based on the leave type name
  const usedLeavesGradient = colors[leaveType] || colors["Total Leave"]; // Default to "Total Leave" color

  // Chart options and data for ApexCharts
  const options = {
    chart: {
      type: "donut",
      toolbar: {
        show: false, // Show the toolbar (you can hide it if needed)
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradients: true, // Add smooth gradient animation on load
      },
    },
    colors: [usedLeavesGradient, colors["Remaining Leave"]], // Used and Remaining leaves colors
    labels: ["Used Leaves", "Remaining Leaves"], // Sections for used and remaining leaves
    plotOptions: {
      pie: {
        donut: {
          size: "10%", // Adjust donut size for a more prominent central hole
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltips
      followCursor: true,
      offsetX: 10, // Position tooltip slightly below the chart
      theme: "dark", // Dark tooltip theme
    },
    stroke: {
      width: 0, // Slightly thicker border to enhance separation
      colors: ["grey"], // White border for the donut segments
    },
    legend: {
      show: true, // Show legend
      position: "bottom", // Position the legend at the bottom
      horizontalAlign: "center", // Align legend items horizontally
      labels: {
        colors: theme.palette.text.primary, // Set the legend text color to theme text color
        fontSize: "14px", // Font size for the legend text
        fontFamily: "Arial, sans-serif", // Font family for the legend text
      },
      markers: {
        width: 10, // Width of the marker (color box)
        height: 10, // Height of the marker (color box)
        radius: 0, // Make the marker square, set to 50% for circles
        offsetX: -10, // Adjust the horizontal distance between the marker and the text
      },
      offsetX: 0, // Adjust horizontal position (if needed)
      offsetY: 0, // Adjust vertical position (if needed)
    },
    dropShadow: {
      enabled: true,
      top: 5,
      left: 5,
      blur: 4,
      opacity: 0.2,
    },
  };

  // Donut chart data series for used and remaining leaves
  const series = [totalLeaves - remainingLeaves, remainingLeaves]; // Used and remaining leaves

  // Handle click to navigate to the leave page
  const handleCardClick = () => {
    // Navigate to the leave page with the leave type as a parameter
    navigate('/profileleave');
  };

  return (
    <Paper
      onClick={handleCardClick} // Add click handler to the Paper component
      sx={{
        padding: 3,
        height: "32vh",
        borderRadius: "12px",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "scale(1.06)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
          cursor: "pointer", // Add pointer cursor to indicate clickability
        },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          justifyContent: "center",
        }}
      >
        <Typography
          
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            textAlign: "left",
            mb: 2,
            fontSize: '1rem'
          }}
        >
          {chartHeading}
        </Typography>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ReactApexChart
            options={options || {}}
            series={series || []}
            type="donut"
            width={350} // Use percentage width to scale with parent
            height={150} // Adjusted height to fit within 32vh
          />
          
        </div>
      </div>
    </Paper>
  );
};

export default Chart;