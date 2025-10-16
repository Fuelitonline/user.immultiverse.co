import React from "react";
// Removed: import ReactApexChart from "react-apexcharts"; // Replaced with pure CSS/MUI implementation
import { Paper, Typography, Box, useTheme } from "@mui/material"; // Added Box for easier layout
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Component to display the Leave Status as a styled Donut Chart (Pure CSS)
const Chart = ({ data }) => {
	const theme = useTheme();
	const navigate = useNavigate(); // Initialize useNavigate hook

	// Extract values from the passed data
	const totalLeaves = data?.value || 0; // Total leaves (fallback to 0 if missing)
	const remainingLeaves = data?.remaining || 0; // Remaining leaves (fallback to 0 if missing)
	const leaveType = data?.name || "Total Leave"; // Leave type (fallback to "Total Leave" if missing)

	// Calculate leaves used
	const leavesUsed = totalLeaves - remainingLeaves;

	// Map data.name to desired heading
	const headingMap = {
		"Remaining Leave": "Total Leave",
		"Sick Leave": "Sick Leave",
		"Casual Leave": "Casual Leave",
		"Total Leave": "Total Leave",
	};
	const chartHeading = headingMap[leaveType] || "Total Leave";

	// Define color schemes for used and remaining leaves (consistent with dashboard palette)
	const colors = {
		"Annual Leave": "#4CAF50",
		"Sick Leave": "#FF7043",
		"Casual Leave": "#FFB74D",
		"UsedColor": "#673ab7", // Deep Purple for Used (Default)
		"RemainingColor": "#e8f5e9", // Very Light Green for Remaining (Consistent light dashboard background)
	};

	// Determine specific colors
	const usedLeavesColor = colors[leaveType] || colors.UsedColor;
	const remainingLeavesColor = colors.RemainingColor;

	// Calculate percentage and degrees for the CSS conic-gradient
	const usedPercentage = totalLeaves > 0 ? (leavesUsed / totalLeaves) : 0;
	const usedDegrees = usedPercentage * 360;

	// Handle click to navigate to the leave page
	const handleCardClick = () => {
		navigate('/profileleave');
	};

	// ----------------------------------------------------------------------
	// Pure CSS Donut Chart Styles
	// ----------------------------------------------------------------------
	const chartContainerStyle = {
		width: '120px',
		height: '120px',
		borderRadius: '50%',
		position: 'relative',
		// Create the donut segments using conic-gradient
		background: `conic-gradient(${usedLeavesColor} 0deg ${usedDegrees}deg, ${remainingLeavesColor} ${usedDegrees}deg 360deg)`,
		boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
		flexShrink: 0, // Prevent shrinking in flex layout
	};

	const innerHoleStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '90px', // Inner hole size
		height: '90px',
		borderRadius: '50%',
		backgroundColor: theme.palette.background.paper, // White background for the hole
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		// Add subtle inner shadow for depth
		boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)',
	};


	return (
		<Paper
			onClick={handleCardClick} // Add click handler to the Paper component
			sx={{
				padding: 3,
				height: "32vh",
				minHeight: '280px', // Ensure minimum height on desktop
				borderRadius: "12px",
				// Apply flat dashboard UI style
				background: '#f7f9fc', // Very light background
				boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", // Subtle shadow
				transition: "all 0.3s ease",
				"&:hover": {
					transform: "translateY(-2px)", // Subtle hover lift
					boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)", // Slightly darker shadow on hover
					cursor: "pointer", // Add pointer cursor to indicate clickability
				},
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start", // Align items to the start (left)
				justifyContent: "space-between", // Space between title, chart, and legend
			}}
		>
			{/* 1. Chart Heading */}
			<Typography
				variant="subtitle1"
				sx={{
					fontWeight: 600,
					color: theme.palette.text.primary,
					mb: 2,
					fontSize: '1rem',
					fontFamily: 'Inter, sans-serif',
				}}
			>
				{chartHeading} Status
			</Typography>

			{/* 2. Chart and Total Value Container (Centered) */}
			<Box
				sx={{
					width: '100%',
					flex: 1,
					display: 'flex',
					justifyContent: 'center', // Center the donut chart horizontally
					alignItems: 'center',
					py: 2,
				}}
			>
				{/* Pure CSS Donut Chart */}
				<div style={chartContainerStyle}>
					<div style={innerHoleStyle}>
						<Typography variant="h5" fontWeight={700} color={theme.palette.text.primary} sx={{ lineHeight: 1 }}>
							{totalLeaves}
						</Typography>
						<Typography variant="caption" color={theme.palette.text.secondary}>
							Total
						</Typography>
					</div>
				</div>
			</Box>

			{/* 3. Custom Legend (Replacing ApexChart Legend) */}
			<Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-around', mt: 2 }}>
				
				{/* Used Leaves Legend */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{ width: 10, height: 10, borderRadius: '4px', bgcolor: usedLeavesColor, flexShrink: 0 }} />
					<Box>
						<Typography variant="body2" fontWeight={600} color={theme.palette.text.primary} sx={{ lineHeight: 1.2 }}>
							{leavesUsed}
						</Typography>
						<Typography variant="caption" color={theme.palette.text.secondary}>
							Used Leaves
						</Typography>
					</Box>
				</Box>

				{/* Remaining Leaves Legend */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{ width: 10, height: 10, borderRadius: '4px', bgcolor: remainingLeavesColor, flexShrink: 0 }} />
					<Box>
						<Typography variant="body2" fontWeight={600} color={theme.palette.text.primary} sx={{ lineHeight: 1.2 }}>
							{remainingLeaves}
						</Typography>
						<Typography variant="caption" color={theme.palette.text.secondary}>
							Remaining
						</Typography>
					</Box>
				</Box>
			</Box>
		</Paper>
	);
};

export default Chart;
