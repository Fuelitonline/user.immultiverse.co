import React from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button } from "@mui/material";
import "./NotFound404.css"; // Updated CSS for styling

const NotFound404 = () => {
  // Enhanced logo animation with bounce and glow
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [1, 1.15, 1],
      opacity: 1,
      rotate: [0, 15, -15, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Smoother text fade-in with slight stagger
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 1,
        staggerChildren: 0.2,
      },
    },
  };

  // Button hover effect and entrance animation
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 1.2,
        duration: 0.6,
        type: "spring",
        stiffness: 120,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 4px 20px rgba(255, 64, 161, 0.5)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3f1b4d 100%)",
        color: "#fff",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Logo */}
      <motion.div
        variants={logoVariants}
        initial="initial"
        animate="animate"
        style={{ marginBottom: "30px", filter: "drop-shadow(0 0 10px rgba(255, 64, 161, 0.7))" }}
      >
        <img
          src="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darkLogo.png" // Replace with your logo path
          alt="Multiverse Logo"
          style={{ width: "220px", height: "auto" }}
        />
      </motion.div>

      {/* Animated Error Message */}
      <motion.div variants={textVariants} initial="hidden" animate="visible">
        <Typography
          variant="h1"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontSize: { xs: "3rem", md: "5rem" },
            textShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: "medium", fontSize: { xs: "1.5rem", md: "2rem" } }}
        >
          Oops! Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, maxWidth: "600px", px: 2, fontSize: "1.1rem" }}
        >
          You’ve ventured into an unknown dimension. This page doesn’t exist—yet. Return to the Multiverse and explore anew!
        </Typography>
      </motion.div>

      {/* Animated Button */}
      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#ff40a1",
            "&:hover": { bgcolor: "#ff3399" },
            borderRadius: "25px",
            px: 5,
            py: 1.5,
            fontSize: "1.2rem",
            textTransform: "none",
            boxShadow: "0 4px 15px rgba(255, 64, 161, 0.4)",
          }}
          onClick={() => window.location.href = "/leads"}
        >
          Return to Multiverse
        </Button>
      </motion.div>

      {/* Particle Background */}
      <div className="particles-background">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`particle particle-${i}`} />
        ))}
      </div>
    </Box>
  );
};

export default NotFound404;