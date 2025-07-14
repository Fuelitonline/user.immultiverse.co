import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import EmpDetails from "./empDetails";
import ProfileNav from "../../components/user/profiveNav";
// import EmplyoeeDetailTab from "../MainDashboard/tabDetails";
import { useTheme } from "@emotion/react";
import { alpha, styled } from "@mui/material/styles";
import { useAuth } from "../../middlewares/auth";
import { motion } from "framer-motion";

// Neumorphic Card Styling
const NeuCard = styled(Box)(({ theme }) => ({
  borderRadius: "16px",
  overflow: "hidden",
  transition: "all 0.3s ease-in-out",
    "&:hover": {
    boxShadow: `12px 12px 24px ${theme.palette.grey[500]}, -12px -12px 24px ${theme.palette.grey[100]}`,
    transform: "translateY(-4px)",
  },
}));

// Inner Container Styling
const InnerContainer = styled(Box)(({ theme }) => ({
  borderRadius: "12px",
  padding: theme.spacing(2),
}));

function ProfilePage() {
  const { user } = useAuth();
  const theme = useTheme();
  const id = user?._id;
  const isAuthorized = user?.role === "admin" || id === user?._id || user?.role === "superAdmin" || user?.role === "Manager";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "1500px",
        mx: "auto",
        px: 4,
        gap: 4,
        pb: 6,
        overflowX: "hidden",
      }}
     
    >
      {/* Profile Navigation */}
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000, mb: 9 }}>
          <Grid item xs={12} container justifyContent='flex-end'>
            <ProfileNav />
          </Grid>
        </Grid>
      </Box>

      {/* Profile Details Section */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {/* <Grid container spacing={3}> */}
          <Grid item xs={5}>
            <NeuCard>
              <Box p={3}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <EmpDetails />
                </motion.div>
              </Box>
            </NeuCard>
          </Grid>
                </Box>
    </Box>
  );
}

export default ProfilePage;