import React from "react";
import { Popover, Box, Typography, Grid, IconButton, Tooltip } from "@mui/material";
import { Parallax } from "react-parallax";
import { SwitchAccount } from "@mui/icons-material";
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import PublishIcon from '@mui/icons-material/Publish';

const TeamPopover = ({
  id,
  open,
  anchorEl,
  handleClose,
  selectedTeam = {}, // Default to empty object
  employees = [], // Default to empty array
}) => {
  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: "center", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "15px",
          backgroundColor: "white",
          width: "80vh",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
          height: "30lvh",
          overflowY: "auto",
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          background: "rgba(255, 255, 255, 0.8)",
          borderRadius: "15px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            position: "sticky",
            top: "0",
            backgroundColor: "white",
            color: "green",
            borderRadius: "15px",
            p: "7px 10px",
            zIndex: "1000",
          }}
        >
          Team Members: <span>{selectedTeam?.teamName || "Unnamed Team"}</span>
        </Typography>
        <Typography
          sx={{
            mt: 2,
            color: "black",
            borderRadius: "15px",
            fontWeight: "bold",
            borderBottom: "4px solid rgba(0, 0, 0, 0.2)",
            padding: "7px 10px",
          }}
        >
          Team Lead:{" "}
          {employees.find((emp) => emp._id === selectedTeam?.teamLead)?.name ||
            "Unknown"}
        </Typography>

        {selectedTeam?.teamMembers?.length > 0 ? (
          selectedTeam.teamMembers.map((member) => (
            <Grid
              key={member}
              sx={{
                mt: 2,
                color: "black",
                borderRadius: "15px",
                padding: "7px 10px",
                borderBottom: "4px solid rgba(0, 0, 0, 0.2)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>
                {employees.find((emp) => emp._id === member)?.name || "Unknown Member"}
              </Typography>
              <Grid sx={{ display: "flex", gap: "10px" }}>
                <Tooltip title="Switch Team">
                  <IconButton
                    title="Switch Team"
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      color: "black",
                      borderRadius: "5px",
                      padding: "2px 5px",
                    }}
                  >
                    <FlipCameraAndroidIcon sx={{ color: "green" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove From Team">
                  <IconButton
                    title="Remove From Team"
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      color: "black",
                      borderRadius: "5px",
                      padding: "2px 5px",
                    }}
                  >
                    <DeleteSweepIcon sx={{ color: "red" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Promote as Team Lead">
                  <IconButton
                    title="Promote as Team Lead"
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      color: "black",
                      borderRadius: "5px",
                      padding: "2px 5px",
                    }}
                  >
                    <PublishIcon sx={{ color: "blue" }} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          ))
        ) : (
          <Typography sx={{ mt: 2, textAlign: "center", color: "gray" }}>
            No members in this team
          </Typography>
        )}
      </Box>
    </Popover>
  );
};

export default TeamPopover;