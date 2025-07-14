import { Add, Cancel } from "@mui/icons-material";
import {
  Box,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Autocomplete,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import Loading from "../../../../../public/Loading/Index.jsx";
import { useGet, usePost } from "../../../../hooks/useApi.jsx";
import { useAuth } from "../../../../middlewares/auth";
import GlassEffect from "../../../../theme/glassEffect.jsx";
import TeamSection from "./teams";
import { TbLayoutGridAdd } from "react-icons/tb";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import ProfileNav from "../../../../components/user/profiveNav";
import { useLocation, useNavigate } from "react-router-dom";

function Departments({ departments = [], employees = [] }) { // Removed addNew prop
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState(null);
  const [teams, setTeams] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState(null);
  const [openNewMemberAdder, setOpenNewMemberAdder] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamView, setTeamView] = useState(true);
  const [isHovered, setIsHovered] = useState(null);
  const [activeTab, setActiveTab] = useState("Departments");
  const [departmentData, setDepartmentData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [openDepartmentModal, setOpenDepartmentModal] = useState(false); // For department creation
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentHead, setNewDepartmentHead] = useState(null);

  // API Hooks
  const {
    data: departmentsData,
    refetch: refetchDepartments,
    isLoading: isLoadingDepartments,
  } = useGet("department/all", {}, {}, { queryKey: "departments" });
  const {
    data: employeesData,
    refetch: refetchEmployees,
    isLoading: isLoadingEmployees,
  } = useGet("employee/all", {}, {}, { queryKey: "employees" });
  const {
    data: teamsData,
    refetch: refetchTeams,
    isLoading: isLoadingTeams,
  } = useGet(
    `department/team-get/`,
    { departmentId: activeIndex || departmentData[0]?._id },
    {}
  );

  // Mutation Hooks
  const { mutateAsync: createTeam, isLoading: isCreatingTeam } = usePost("department/team-create");
  const { mutateAsync: addNewMember, isLoading: isAddingNewMember } = usePost("department/team-add-member");
  const { mutateAsync: createDepartment, isLoading: isCreatingDepartment } = usePost("department/create");

  useEffect(() => {
    console.log("Departments Data:", departmentsData, "Employees Data:", employeesData, "Teams Data:", teamsData);
    if (departmentsData?.data?.message && employeesData?.data?.message) {
      setDepartmentData(departmentsData?.data?.message[0] || []);
      setEmployeeData(employeesData?.data?.message[0] || []);
      if (departmentData.length > 0 && !activeIndex) {
        setActiveIndex(departmentData[0]._id);
      }
    }
    if (teamsData) {
      const teamsFromApi = teamsData?.data?.message?.[0] || teamsData?.data || [];
      console.log("Setting teams from API:", teamsFromApi);
      setTeams(teamsFromApi);
    }
  }, [departmentsData, employeesData, teamsData]);

  useEffect(() => {
    const newTabPath = location.pathname.split("/").pop();
    setActiveTab(newTabPath || "Departments");
  }, [location.pathname]);

  const handleItemClick = (id) => {
    setActiveIndex(id);
    setTeamView(true);
    refetchTeams();
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedTeam(null);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleOpenNewMemberAdder = (id) => {
    setOpenNewMemberAdder(true);
    setSelectedTeams(id);
  };

  const handleCloseNewMemberAdder = () => {
    setOpenNewMemberAdder(false);
    setSelectedTeams(null);
    setSelectedMembers([]);
    setMembers([]);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMembers([]);
    setSelectedTeamLead(null);
    setTeamName("");
    setMembers([]);
  };

  const handleAddTeam = async () => {
    if (!teamName || !selectedMembers || !selectedTeamLead) {
      toast.error("All fields are required");
      return;
    }

    const teamDetails = {
      teamName,
      teamLead: selectedTeamLead,
      teamMembers: selectedMembers,
      departmentId: activeIndex,
    };
    try {
      const data = await createTeam({ teamDetails });
      console.log("Team Creation Response:", data);
      if (data.data) {
        toast.success(data.data.message);
        refetchDepartments();
        refetchTeams();
        handleCloseModal();
      } else {
        toast.error(data.error?.error || data.error?.message || "Failed to create team");
      }
    } catch (error) {
      toast.error("An error occurred while creating the team");
    }
  };

  const handleAddMember = async () => {
    if (selectedMembers?.length === 0) {
      toast.error("Please select members");
      return;
    }
    const members = {
      teamId: selectedTeams,
      teamMembers: selectedMembers,
    };
    try {
      const result = await addNewMember({ members });
      console.log("Add Member Response:", result);
      if (result.data) {
        toast.success(result.data.message);
        refetchDepartments();
        refetchTeams();
        handleCloseNewMemberAdder();
      } else {
        toast.error(result.error?.error || result.error?.message || "Failed to add member");
      }
    } catch (error) {
      toast.error("An error occurred while adding the member");
    }
  };

  const handleOpenDepartmentModal = () => {
    setOpenDepartmentModal(true);
  };

  const handleCloseDepartmentModal = () => {
    setOpenDepartmentModal(false);
    setNewDepartmentName("");
    setNewDepartmentHead(null);
  };

  const handleCreateDepartment = async () => {
    if (!newDepartmentName || !newDepartmentHead) {
      toast.error("Department name and head are required");
      return;
    }

    const departmentDetails = {
      departmentName: newDepartmentName,
      departmentHead: newDepartmentHead,
    };
    try {
      const data = await createDepartment({ departmentDetails });
      console.log("Department Creation Response:", data);
      if (data.data) {
        toast.success(data.data.message);
        refetchDepartments();
        handleCloseDepartmentModal();
      } else {
        toast.error(data.error?.error || data.error?.message || "Failed to create department");
      }
    } catch (error) {
      toast.error("An error occurred while creating the department");
    }
  };

  const employeeList = () => {
    if (!employeeData) return [];

    if (!selectedTeams) {
      return employeeData
        ?.filter((employee) => {
          if (user?.role === "superAdmin" || user?.role === "admin") {
            return true;
          } else if (user?.junior) {
            return user.junior.includes(employee._id);
          }
          return false;
        })
        .map((employee) => ({
          label: `${employee.name} (${employee.position})`,
          _id: employee._id,
        })) || [];
    }

    const team = teams.find((tm) => tm._id === selectedTeams);
    if (!team) return [];

    const alreadyMember = [...team?.teamMembers, team?.teamLead];
    return employeeData
      ?.filter((employee) => {
        const isAlreadyMember = alreadyMember.includes(employee._id);
        if (user?.role === "superAdmin" || user?.role === "admin") {
          return !isAlreadyMember;
        } else if (user?.junior) {
          return user.junior.includes(employee._id) && !isAlreadyMember;
        }
        return !isAlreadyMember;
      })
      .map((employee) => ({
        label: `${employee.name} (${employee.position})`,
        _id: employee._id,
      })) || [];
  };

  const scrollY = useRef(0);

  const handleScroll = (e) => {
    scrollY.current = e.target.scrollTop;
  };

  const handleMouseEnter = (id) => {
    setIsHovered(id);
  };

  const handleMouseLeave = () => {
    setIsHovered(null);
  };

  const inputStyles = {
    color: theme.palette.text.primary,
    "& .MuiInputBase-root": {
      color: theme.palette.text.primary,
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.text.primary,
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#ced1d6",
        borderRadius: "15px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        border: "none",
      },
      "&:hover fieldset": {
        borderColor: "#398bf7",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#398bf7",
      },
    },
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0rem",
          padding: "1rem",
        }}
      >
        {(isLoadingDepartments || isLoadingEmployees || isLoadingTeams || isCreatingTeam || isAddingNewMember || isCreatingDepartment) && <Loading />}
        <ToastContainer />
        <Grid container spacing={1}>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
            <ProfileNav />
          </Grid>
        </Grid>
        <Grid mt={"0rem"}>
          <TransitionGroup>
            <CSSTransition key={activeTab} timeout={300} classNames="fade">
              <div className={`tab-content ${activeTab}`}>
                {activeTab === "Departments" && (
                  <GlassEffect.GlassContainer>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      {/* Departments Sidebar */}
                      <Grid
                        sx={{
                          width: "25%",
                          height: "75.5vh",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: "15px",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          overflowY: "auto",
                        }}
                        onScroll={handleScroll}
                      >
                        <Typography
                          sx={{
                            fontSize: "24px",
                            fontWeight: 700,
                            padding: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            justifyContent: "space-between",
                            color: theme.palette.primary.main,
                            fontFamily: "'Poppins', sans-serif",
                            borderBottom: "2px solid #e0e5ec",
                            position: "relative",
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              bottom: "-2px",
                              left: 0,
                              width: "40%",
                              height: "3px",
                              background: theme.palette.primary.light,
                              borderRadius: "20px",
                            },
                          }}
                        >
                          Departments ({departmentData?.length || 0})
                          <IconButton
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              color: "#fff",
                              ml: "10px",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: theme.palette.primary.dark,
                                transform: "scale(1.1)",
                              },
                            }}
                            onClick={handleOpenDepartmentModal} // Updated to trigger department modal
                          >
                            <TbLayoutGridAdd />
                          </IconButton>
                        </Typography>
                        {departmentData?.length > 0 ? (
                          departmentData.map((item, index) => (
                            <Box
                              key={item._id}
                              onClick={() => handleItemClick(item._id)}
                              sx={{
                                position: "relative",
                                margin: "0.5rem",
                                borderRadius: "12px",
                                backgroundColor: activeIndex === item._id ? "#e4edf5" : "#ffffff",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease, transform 0.2s ease",
                                "&:hover": {
                                  backgroundColor: "#f0f4f8",
                                  transform: "scale(1.05)",
                                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                                },
                                "&:after": {
                                  content: '""',
                                  position: "absolute",
                                  left: 0,
                                  bottom: 0,
                                  width: activeIndex === item._id ? "100%" : 0,
                                  height: "4px",
                                  backgroundColor: "#007bff",
                                  transition: "width 0.3s ease",
                                },
                              }}
                            >
                              <Grid
                                onMouseEnter={() => handleMouseEnter(item._id)}
                                onMouseLeave={() => handleMouseLeave(item._id)}
                                sx={{
                                  padding: "1.2rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  transition: "all 0.3s ease-in-out",
                                }}
                              >
                                <Typography
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "18px",
                                    textAlign: "left",
                                    fontWeight: 600,
                                    color: "#333",
                                    fontFamily: "'Poppins', sans-serif",
                                  }}
                                >
                                  {item?.departmentName}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                    textAlign: "center",
                                    backgroundColor: "#f5f5f5",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    color: "#666",
                                  }}
                                >
                                  {employeeData?.find((emp) => emp._id === item?.departmentHead)?.name || "Unknown"}
                                </Typography>
                              </Grid>
                            </Box>
                          ))
                        ) : (
                          <Typography sx={{ padding: "1rem", textAlign: "center" }}>
                            No departments available
                          </Typography>
                        )}
                      </Grid>
                      {/* Teams Section */}
                      <Box
                        sx={{
                          width: "73%",
                          height: "75.5vh",
                          borderRadius: "15px",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          overflowY: "auto",
                          padding: "1rem",
                        }}
                      >
                        {teamView && (
                          <TeamSection
                            teams={teams}
                            employees={employeeData || []}
                            isLoadingTeams={isLoadingTeams}
                            handleOpenNewMemberAdder={handleOpenNewMemberAdder}
                            handleOpenModal={handleOpenModal}
                          />
                        )}
                      </Box>
                    </Box>
                  </GlassEffect.GlassContainer>
                )}
              </div>
            </CSSTransition>
          </TransitionGroup>
        </Grid>
        {/* Add Team Modal */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          PaperProps={{
            sx: {
              borderRadius: "15px",
              padding: "2rem",
              backgroundColor: theme.palette.background.default,
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          {isCreatingTeam && <Loading />}
          <DialogTitle
            sx={{
              fontSize: "24px",
              fontWeight: 600,
              color: theme.palette.text.primary,
              paddingBottom: "1.5rem",
            }}
          >
            Add New Team
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: 2,
              }}
            >
              <TextField
                name="teamName"
                label="Team Name"
                fullWidth
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                sx={inputStyles}
              />
              <Autocomplete
                multiple
                options={employeeList()}
                getOptionLabel={(option) => option.label || ""}
                value={members}
                onChange={(_, newValue) => {
                  setMembers(newValue || []);
                  setSelectedMembers(newValue?.map((item) => item._id) || []);
                }}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Members"
                    variant="outlined"
                    sx={inputStyles}
                  />
                )}
              />
              <Autocomplete
                options={employeeData || []}
                getOptionLabel={(option) =>
                  `${option.name} (${option.email}) (${option.position})`
                }
                value={employeeData?.find((option) => option._id === selectedTeamLead) || null}
                onChange={(event, newValue) => {
                  setSelectedTeamLead(newValue?._id || null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Team Leader"
                    variant="outlined"
                    fullWidth
                    sx={inputStyles}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ mr: 2 }}>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                backgroundColor: "#4287f5",
                borderRadius: "15px",
                padding: "8px 25px",
                "&:hover": {
                  backgroundColor: "#6ea4fa",
                },
              }}
            >
              <Cancel sx={{ color: "white", fontSize: "18px" }} />
              <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
                Cancel
              </Typography>
            </IconButton>
            <IconButton
              onClick={handleAddTeam}
              disabled={isCreatingTeam}
              sx={{
                backgroundColor: "#4287f5",
                borderRadius: "15px",
                padding: "8px 25px",
                "&:hover": {
                  backgroundColor: "#6ea4fa",
                },
              }}
            >
              <Add sx={{ color: "white", fontSize: "18px" }} />
              <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
                Add
              </Typography>
            </IconButton>
          </DialogActions>
        </Dialog>
        {/* Add New Member Modal */}
        <Dialog
          open={openNewMemberAdder}
          onClose={handleCloseNewMemberAdder}
          PaperProps={{
            sx: {
              borderRadius: "15px",
              padding: "2rem",
              backgroundColor: theme.palette.background.default,
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          {isAddingNewMember && <Loading />}
          <DialogTitle
            sx={{
              fontSize: "24px",
              fontWeight: 600,
              color: theme.palette.text.primary,
              paddingBottom: "1.5rem",
            }}
          >
            Add New Members to Team
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: 2,
              }}
            >
              <Autocomplete
                multiple
                options={employeeList()}
                getOptionLabel={(option) => option.label || ""}
                value={members}
                onChange={(_, newValue) => {
                  setMembers(newValue || []);
                  setSelectedMembers(newValue?.map((item) => item._id) || []);
                }}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Members"
                    variant="outlined"
                    sx={inputStyles}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ mr: 2 }}>
            <IconButton
              onClick={handleCloseNewMemberAdder}
              sx={{
                backgroundColor: "#4287f5",
                borderRadius: "15px",
                padding: "8px 25px",
                "&:hover": {
                  backgroundColor: "#6ea4fa",
                },
              }}
            >
              <Cancel sx={{ color: "white", fontSize: "18px" }} />
              <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
                Cancel
              </Typography>
            </IconButton>
            <IconButton
              onClick={handleAddMember}
              disabled={isAddingNewMember}
              sx={{
                backgroundColor: "#4287f5",
                borderRadius: "15px",
                padding: "8px 25px",
                "&:hover": {
                  backgroundColor: "#6ea4fa",
                },
              }}
            >
              <Add sx={{ color: "white", fontSize: "18px" }} />
              <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
                Add
              </Typography>
            </IconButton>
          </DialogActions>
        </Dialog>
        {/* Add New Department Modal */}
        <Dialog
          open={openDepartmentModal}
          onClose={handleCloseDepartmentModal}
          PaperProps={{
            sx: {
              borderRadius: "15px",
              padding: "2rem",
              backgroundColor: theme.palette.background.default,
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          {isCreatingDepartment && <Loading />}
          <DialogTitle
            sx={{
              fontSize: "24px",
              fontWeight: 600,
              color: theme.palette.text.primary,
              paddingBottom: "1.5rem",
            }}
          >
            Add New Department
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: 2,
              }}
            >
              <TextField
                name="departmentName"
                label="Department Name"
                fullWidth
                value={newDepartmentName}
                onChange={(event) => setNewDepartmentName(event.target.value)}
                sx={inputStyles}
              />
              <Autocomplete
                options={employeeData || []}
                getOptionLabel={(option) =>
                  `${option.name} (${option.email}) (${option.position})`
                }
                value={employeeData?.find((option) => option._id === newDepartmentHead) || null}
                onChange={(event, newValue) => {
                  setNewDepartmentHead(newValue?._id || null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department Head"
                    variant="outlined"
                    fullWidth
                    sx={inputStyles}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ mr: 2 }}>
            <IconButton
              onClick={handleCloseDepartmentModal}
              sx={{
                backgroundColor: "#4287f5",
                borderRadius: "15px",
                padding: "8px 25px",
                "&:hover": {
                  backgroundColor: "#6ea4fa",
                },
              }}
            >
              <Cancel sx={{ color: "white", fontSize: "18px" }} />
              <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
                Cancel
              </Typography>
            </IconButton>
            <IconButton
              onClick={handleCreateDepartment}
              disabled={isCreatingDepartment}
              sx={{
                backgroundColor: "#4287f5",
                borderRadius: "15px",
                padding: "8px 25px",
                "&:hover": {
                  backgroundColor: "#6ea4fa",
                },
              }}
            >
              <Add sx={{ color: "white", fontSize: "18px" }} />
              <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
                Add
              </Typography>
            </IconButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default Departments;