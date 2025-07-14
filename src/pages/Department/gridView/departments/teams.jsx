import React, { useEffect, useState } from 'react';
import { Box, Grid, IconButton, Typography, Button, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { IconContext } from "react-icons";
import TeamTreeChart from './TeamTree'; // Assuming this component renders the team tree
import Loading from '../../../../../public/Loading/Index.jsx'; // Assuming this is a loading spinner component
import { TbBrandTeams } from "react-icons/tb";
import { PiTargetFill } from "react-icons/pi";
import IncantiveFormDialog from '../../../Profile/IncantivesCreation/IncantiveForm.jsx';

const TeamSection = ({ teams = [], employees = [], isLoadingTeams, handleOpenModal, handleOpenNewMemberAdder }) => {
  const [selectedTeam, setSelectedTeam] = useState(teams.length > 0 ? teams[0] : null);
  const [treeView, setTreeView] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [openTagertModel, setOpenTargetModel] = useState(false);

  // Handle team selection
  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setTreeView(false);
    setClicked(true);
  };

  const setIncantiveModal = () => setOpenTargetModel(false);

  useEffect(() => {
    setTreeView(true);
    setClicked(false);
  }, [clicked]);

  const open = (id) => {
    console.log(id, 'iddd');
    handleOpenNewMemberAdder(id);
  };

  const theme = useTheme();

  return (
    <>
      {/* Header with Add Team button */}
      <Grid
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          sx={{
            fontSize: "24px",
            fontWeight: 600,
            color: useTheme().palette.text.primary,
          }}
        >
          Teams
        </Typography>
        <Grid display={'flex'} gap={2}>
          <IconButton
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: "12px",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            onClick={handleOpenModal}
          >
            <IconContext.Provider value={{ color: "white", className: "global-class-name" }}>
              <TbBrandTeams sx={{ color: "white", fontSize: "20px" }} />
            </IconContext.Provider>
            <Typography sx={{ ml: 1, color: "white", fontWeight: 500 }}>
              Add Team
            </Typography>
          </IconButton>
          <IconButton
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: "12px",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            onClick={() => setOpenTargetModel(!openTagertModel)}
          >
            <IconContext.Provider value={{ color: "white", className: "global-class-name" }}>
              <PiTargetFill sx={{ color: "white", fontSize: "20px" }} />
            </IconContext.Provider>
            <Typography sx={{ ml: 1, color: "white", fontWeight: 500 }}>
              Create Targets
            </Typography>
          </IconButton>
        </Grid>
      </Grid>

      {/* Team List and Team Tree */}
      <Grid
        sx={{
          padding: "1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          width: "100%",
        }}
        container
        spacing={2}
      >
        {/* Loading State */}
        {isLoadingTeams && <Loading />}

        {/* Team List */}
        <Grid item xs={12}>
          <Grid
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {teams?.length > 0 ? (
              teams.map((team) => (
                <Grid key={team._id}> {/* Changed from team.id to team._id */}
                  <Button
                    sx={{
                      padding: "1rem 1.5rem",
                      textAlign: "center",
                      backgroundColor:
                        selectedTeam?._id === team._id
                          ? theme.palette.primary.main
                          : 'white',
                      borderRadius: "16px",
                      boxShadow: selectedTeam?._id === team._id
                        ? "0 6px 12px rgba(0, 0, 0, 0.2)"
                        : "0 4px 8px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: selectedTeam?._id === team._id
                          ? theme.palette.primary.dark
                          : theme.palette.grey[200],
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                    onClick={() => handleTeamClick(team)}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: selectedTeam?._id === team._id ? "white" : "black",
                        fontSize: "14px",
                        fontWeight: selectedTeam?._id === team._id ? 600 : 400,
                      }}
                    >
                      {team.teamName}
                    </Typography>
                  </Button>
                </Grid>
              ))
            ) : (
              <Typography sx={{ padding: "1rem", textAlign: "center" }}>
                No teams available
              </Typography>
            )}
          </Grid>
        </Grid>
        <IncantiveFormDialog open={openTagertModel} close={setIncantiveModal} teams={teams} />
        {/* Team Tree View */}
        {treeView && selectedTeam && (
          <Grid item xs={12} sx={{ height: '57vh' }}>
            <TeamTreeChart team={selectedTeam} employees={employees} open={open} />
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default TeamSection;