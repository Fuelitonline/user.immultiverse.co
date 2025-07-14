import React from "react";
import { Grid, Box, Typography } from "@mui/material";

function SideStyle({text}) {
  return (
    <Grid
      sx={{
        background: "linear-gradient(135deg, rgba(10, 121, 33, 0.34) 0%, rgba(5, 62, 14, 0.34) 50%, rgba(3, 41, 8, 0.34) 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: { xs: 3, sm: 4, md: 6 },
        position: "relative",
        overflow: "hidden",
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.2)", // Subtle inner shadow for depth
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "-80px",
          left: "-80px",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent)",
          borderRadius: "50%",
          opacity: 0.8,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-60px",
          right: "-60px",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)",
          borderRadius: "50%",
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: "80px",
          height: "80px",
          background: "radial-gradient(circle, rgba(10, 121, 33, 0.3), transparent)",
          borderRadius: "50%",
          opacity: 0.6,
        }}
      />
   <Box
        component="img"
        src="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/logo.png"
        alt="CRM Portal Logo"
        sx={{
          maxWidth: { xs: "250px", sm: "300px", md: "350px" },
          width: "100%",
          mb: 2,
          filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3))", // Shadow for logo
          transition: "transform 0.3s ease",
          "&:hover": { transform: "scale(1.05)" },
        }}
      />
      {/* Subtitle */}
      <Typography
        sx={{
          color: "#fff", // White for detailed text
          fontWeight: "bold",
          fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.6rem" },
          textAlign: "left",
          maxWidth: "500px",
          lineHeight: 1.6,
          mb: 0,
          ml:2
        }}
      >
       Your Enterprise Solution Hub
       
      </Typography>
      {/* <Typography
        sx={{
          color: "#fff", // White for detailed text
          fontWeight: "bold",
          textAlign: "left",
          maxWidth: "500px",
          lineHeight: 1.6,
          mb: 0,
          ml:3
        }}
      >
       
        <span style = {{
          color: "#053E0E",
        }}>Fueling Growth |  </span> <span style = {{
          color: "#053E0E"
        }}>Efficiency | </span><span style = {{
          color: "#053E0E"
        }}>Success </span>
      </Typography> */}
      {/* Get Started */}
      {/* <Typography
        sx={{
          color: "#fff",
          fontWeight: "700",
          fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.8rem" },
          mt: 3,
          cursor: "pointer",
          background: "linear-gradient(45deg, #053E0E, #0A7921)", // Gradient background
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.1)",
            textDecoration: "underline",
          },
        }}
      >
        {text}
      </Typography> */}
      {/* Logo */}
   

      {/* Main Title */}
 
    </Grid>
  );
}

export default SideStyle;