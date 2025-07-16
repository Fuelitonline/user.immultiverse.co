import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, Paper, 
  IconButton, Autocomplete, Snackbar, Alert, CircularProgress, Tooltip, FormControl, InputLabel, Select, 
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, TextField
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useGet, usePost } from "../../hooks/useApi";
import { useAuth } from "../../middlewares/auth";
import ProfileNav from "../../components/user/profiveNav";
import GlassEffect from "../../theme/glassEffect";
import { useTheme } from "@emotion/react";
import LeaveRequestForm from "./LeaveRequestForm";

// Reusable style objects
const commonStyles = {
  glassPaper: (theme) => ({
    p: 4,
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.4s ease',
    '&:hover': {
      boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-4px)',
    },
  }),
  tableContainer: (theme) => ({
    borderRadius: '16px',
    border: `2px solid ${theme.palette.grey[300]}`,
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    maxHeight: '50vh', // Set a fixed height for scrolling
    overflowY: 'auto',
    background: '#fff',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
    },
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.light,
      borderRadius: '4px',
    },
  }),
  table: {
    tableLayout: 'fixed', // Ensure consistent column widths
    width: '100%',
  },
  tableHead: (theme) => ({
    position: 'sticky',
    top: 0, // Stick to the top of TableContainer
    zIndex: 1,
    backgroundColor: theme.palette.primary.light,
  }),
  tableCell: (theme) => ({
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    borderRight: `1px solid ${theme.palette.grey[300]}`,
    '&:last-child': { borderRight: 'none' },
  }),
  button: (theme) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: '#fff',
    borderRadius: '12px',
    px: 4,
    py: 1.5,
    fontWeight: 'bold',
    textTransform: 'none',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: theme.palette.primary.dark,
      transform: 'scale(1.03)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    },
  }),
  inputField: (theme) => ({
    borderRadius: '12px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[400] },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[600] },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary, fontWeight: 500 },
    '& .MuiInputBase-input': { color: theme.palette.text.primary },
    '& .MuiSelect-select': { color: theme.palette.text.primary },
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  }),
  inputFieldSmall: (theme) => ({
    borderRadius: '10px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[400] },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[600] },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.9rem' },
    '& .MuiInputBase-input': { color: theme.palette.text.primary, fontSize: '0.9rem', py: 1.2, textAlign: 'left' },
    '& .MuiSelect-select': { color: theme.palette.text.primary, fontSize: '0.9rem', py: 1.2, textAlign: 'left' },
    '& .MuiAutocomplete-input': { fontSize: '0.9rem', py: 1.2, textAlign: 'left' },
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '& .MuiInputBase-root': { height: '40px', width: '100%' },
  }),
  fieldHeading: (theme) => ({
    fontSize: '0.9rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    textAlign: 'left',
  }),
};

// Sub-component: Filters
const LeaveFilter = ({ filters, handleFilterChange, handleOpenModal, theme }) => (
  <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
    <Grid container item spacing={2} xs={12}>
      {[
        { name: 'leaveType', label: 'Leave Type', options: ['', 'Casual Leave', 'Sick Leave', 'Paid', 'Unpaid'], type: 'select', bgColor: '#E6E6FA', hoverBg: '#D8BFD8', icon: <EventNoteIcon /> },
        { name: 'status', label: 'Status', options: ['', 'Pending', 'Approved', 'Rejected'], type: 'select', bgColor: '#98FB98', hoverBg: '#90EE90', icon: <AssignmentTurnedInIcon /> },
        { name: 'startDate', label: 'Start Date', type: 'date', bgColor: '#FFB6C1', hoverBg: '#FFAEB9', icon: <CalendarTodayIcon /> },
        { name: 'endDate', label: 'End Date', type: 'date', bgColor: '#F0E68C', hoverBg: '#E6D8A2', icon: <CalendarTodayIcon /> },
      ].map(({ name, label, options, type, bgColor, hoverBg, icon }) => (
        <Grid item xs={3} key={name}>
          {type === 'select' ? (
            <FormControl fullWidth variant="outlined">
              <InputLabel>{label}</InputLabel>
              <Select
                name={name}
                value={filters[name]}
                onChange={handleFilterChange}
                label={label}
                startAdornment={
                  <InputAdornment position="start">
                    {icon}
                  </InputAdornment>
                }
                sx={{
                  ...commonStyles.inputField(theme),
                  backgroundColor: bgColor,
                  '&:hover': { backgroundColor: hoverBg },
                }}
              >
                {options.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt || 'All'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              label={label}
              variant="outlined"
              type={type}
              name={name}
              value={filters[name]}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {icon}
                  </InputAdornment>
                ),
              }}
              sx={{
                ...commonStyles.inputField(theme),
                '& .MuiInputBase-root': { backgroundColor: bgColor, borderRadius: '12px' },
                '&:hover .MuiInputBase-root': { backgroundColor: hoverBg },
              }}
            />
          )}
        </Grid>
      ))}
    </Grid>
    <Grid container item spacing={2} xs={12}>
      <Grid item xs={3}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Duration</InputLabel>
          <Select
            name="duration"
            value={filters.duration}
            onChange={handleFilterChange}
            label="Duration"
            startAdornment={
              <InputAdornment position="start">
                <AccessTimeIcon />
              </InputAdornment>
            }
            sx={{
              ...commonStyles.inputField(theme),
              backgroundColor: '#DADAEB',
              '&:hover': { backgroundColor: '#C3C8E6' },
            }}
          >
            {['', 'Full Day', 'Morning', 'Evening'].map((opt) => (
              <MenuItem key={opt} value={opt}>{opt || 'All'}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={3}>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          startIcon={<AddCircleOutlineIcon />}
          sx={{
            ...commonStyles.button(theme),
            width: '100%',
            background: 'linear-gradient(45deg, #87CEEB, #48D1CC)',
            fontSize: '1.1rem',
            border: 'none',
            '&:hover': {
              background: '#48D1CC',
              transform: 'scale(1.03)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              border: 'none',
            },
          }}
        >
          Request a Leave
        </Button>
      </Grid>
    </Grid>
  </Grid>
);

// Sub-component: Leave Table
const LeaveTable = ({ filteredLeaveRequests, user, userId, loading, handleActionLeave, theme }) => {
  return (
    <Box sx={{ mt: 4, position: 'relative' }}>
      <TableContainer component={Paper} sx={commonStyles.tableContainer(theme)}>
        <Table sx={commonStyles.table}>
          <TableHead sx={commonStyles.tableHead(theme)}>
            <TableRow>
              {['Leave Type', 'Leave Duration', 'Time', 'Status', 'Reason'].map((header) => (
                <TableCell key={header} sx={commonStyles.tableCell(theme)}>
                  {header}
                </TableCell>
              ))}
              {(user.role === 'superAdmin' || user?.junior?.includes(userId)) && (
                <TableCell sx={commonStyles.tableCell(theme)}>
                  Action
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeaveRequests.length > 0 ? (
              filteredLeaveRequests.map((item) => (
                <TableRow
                  key={item._id || Date.now()}
                  sx={{
                    '&:hover': { backgroundColor: '#f5f7fa', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
                    '&:last-child td': { borderBottom: 0 }
                  }}
                >
                  <TableCell sx={{ textAlign: 'center', borderRight: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography variant="body2" fontWeight="medium">
                      {item.leaveType || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', borderRight: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography variant="body2" fontWeight="medium">
                      {item.leaveDuration === 'Half Day' ? item.halfDayType || 'N/A' : item.leaveDuration || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', borderRight: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography variant="body2" fontWeight="medium">
                      {item.time ? new Date(item.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', borderRight: `1px solid ${theme.palette.grey[200]}` }}>
                    <Button
                      variant="text"
                      size="small"
                      sx={{
                        color: item.status === 'Approved' ? '#4caf50' : item.status === 'Pending' ? '#ffca28' : item.status === 'Rejected' ? '#ef5350' : '#bdbdbd',
                        borderRadius: '20px',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        '&:hover': { filter: 'brightness(90%)' },
                        width: '100%',
                        display: 'block',
                        margin: '0 auto',
                      }}
                    >
                      {item.status || 'Unknown'}
                    </Button>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', borderRight: `1px solid ${theme.palette.grey[200]}` }}>
                    <Tooltip title={item.reason || 'No reason provided'}>
                      <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                        {item.reason || 'N/A'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  {(user.role === 'superAdmin' || user?.junior?.includes(userId)) && (
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Grid container spacing={1} justifyContent="center">
                        <Grid item>
                          {loading?.id === item._id && loading?.action === 'Approved' ? (
                            <CircularProgress size={24} />
                          ) : (
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                disabled={item.status === 'Approved' || item.status === 'Rejected'}
                                onClick={() => handleActionLeave(item._id, 'Approved')}
                                sx={{
                                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
                                  '&:hover': { transform: 'scale(1.1)', backgroundColor: theme.palette.success.light },
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Grid>
                        <Grid item>
                          {loading?.id === item._id && loading?.action === 'Rejected' ? (
                            <CircularProgress size={24} />
                          ) : (
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                disabled={item.status === 'Approved' || item.status === 'Rejected'}
                                onClick={() => handleActionLeave(item._id, 'Rejected')}
                                sx={{
                                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
                                  '&:hover': { transform: 'scale(1.1)', backgroundColor: theme.palette.error.light },
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Grid>
                      </Grid>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={user.role === 'superAdmin' || user?.junior?.includes(userId) ? 6 : 5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No leave requests match the selected filters
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Sub-component: Leave Modal
const LeaveModal = ({ openModal, handleCloseModal, leaveData, setLeaveData, formErrors, handleSubmit, loading, theme }) => (
  <Dialog
    open={openModal}
    onClose={handleCloseModal}
    PaperProps={{
      sx: {
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
        borderRadius: '16px',
        width: 450,
        maxHeight: '80vh',
        overflowY: 'auto',
        margin: 'auto',
        mt: '5%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': { transform: 'scale(1.02)' },
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.primary.main, borderRadius: '4px' },
      },
    }}
    BackdropProps={{
      sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' },
    }}
  >
    <DialogTitle sx={{ 
      textAlign: 'center', 
      fontWeight: 'bold', 
      color: theme.palette.text.primary,
      fontSize: '1.25rem',
      letterSpacing: '-0.02em',
      pb: 1
    }}>
      Request a New Leave
    </DialogTitle>
    <DialogContent sx={{ p: 2 }}>
      <LeaveRequestForm
        leaveData={leaveData}
        setLeaveData={setLeaveData}
        formErrors={formErrors}
        theme={theme}
      />
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'flex-end', gap: 1.5, px: 3, pb: 2 }}>
      <Button
        variant="outlined"
        onClick={handleCloseModal}
        sx={{
          borderRadius: '10px',
          px: 3,
          py: 1,
          textTransform: 'none',
          borderColor: theme.palette.grey[400],
          color: theme.palette.text.primary,
          fontWeight: 500,
          fontSize: '0.9rem',
          transition: 'all 0.3s ease',
          '&:hover': { backgroundColor: '#f5f7fa', borderColor: theme.palette.grey[500], transform: 'scale(1.03)' },
        }}
      >
        Cancel
      </Button>
      {loading?.action === 'submit' ? (
        <CircularProgress size={24} />
      ) : (
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            ...commonStyles.button(theme),
            px: 3,
            py: 1,
            fontSize: '0.9rem',
            transition: 'all 0.3s ease',
          }}
        >
          Submit Leave
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

const LeavePage = () => {
  const { user } = useAuth();
  const userId = user?._id;
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [leaveData, setLeaveData] = useState({ leaveType: "", date: "", reason: "", leaveDuration: "", halfDayType: "", time: "" });
  const [formErrors, setFormErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [leaveRequest, setLeaveRequest] = useState([]);
  const [filters, setFilters] = useState({
    leaveType: "",
    status: "",
    startDate: "",
    endDate: "",
    duration: "",
  });

  const { data: leaves, isLoading, refetch } = useGet('employee/leave/get-by-id', { employeeId: userId });
  const handleSubmitLeave = usePost("/employee/leave/create");
  const handleUpdateLeave = usePost("/employee/leave/update");

  useEffect(() => {
    if (leaves?.data?.data?.leaveRequests) {
      setLeaveRequest(Array.isArray(leaves.data.data.leaveRequests) ? leaves.data.data.leaveRequests : []);
    } else {
      setLeaveRequest([]);
    }
  }, [leaves]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!leaveData.leaveType) errors.leaveType = "Leave type is required";
    if (!leaveData.date) errors.date = "Date is required";
    if (!leaveData.leaveDuration) errors.leaveDuration = "Leave duration is required";
    if (leaveData.leaveDuration === 'Half Day' && !leaveData.halfDayType) errors.halfDayType = "Half day type is required";
    if (!leaveData.time) errors.time = "Time is required";
    if (!leaveData.reason.trim()) errors.reason = "Reason is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [leaveData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      setSnackbarMessage("Please fill all required fields.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      setLoading({ id: null, action: "submit" });
      const leaveDetails = {
        ...leaveData,
        employeeId: userId,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };
      if (!handleSubmitLeave.mutateAsync) throw new Error("usePost hook is not initialized");
      const res = await handleSubmitLeave.mutateAsync(leaveDetails);

      if (res.data) {
        setLeaveRequest((prev) => [
          { ...leaveDetails, _id: res.data?.data?._id || Date.now(), status: "Pending", date: new Date(leaveDetails.date).toISOString() },
          ...prev,
        ]);
        setSnackbarMessage("Leave request submitted successfully!");
        setSnackbarSeverity("success");
        refetch();
      } else {
        setSnackbarMessage(res?.error?.error || "Failed to submit leave request.");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(`An error occurred: ${error.message || "Unknown error"}`);
      setSnackbarSeverity("error");
    } finally {
      setLoading(null);
      handleCloseModal();
      setOpenSnackbar(true);
    }
  }, [leaveData, userId, handleSubmitLeave, refetch, validateForm]);

  const handleActionLeave = useCallback(async (_id, action) => {
    try {
      setLoading({ id: _id, action });
      const leaveDetails = { _id, status: action };
      if (!handleUpdateLeave.mutateAsync) throw new Error("usePost hook is not initialized");
      const res = await handleUpdateLeave.mutateAsync(leaveDetails);

      if (res.data) {
        setLeaveRequest((prev) => prev.map((item) => (item._id === _id ? { ...item, status: action } : item)));
        setSnackbarMessage(`Leave request ${action.toLowerCase()} successfully!`);
        setSnackbarSeverity("success");
        refetch();
      } else {
        setSnackbarMessage(res?.error?.error || `Failed to ${action.toLowerCase()} leave request.`);
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage(`An error occurred: ${error.message || "Unknown error"}`);
      setSnackbarSeverity("error");
    } finally {
      setLoading(null);
      setOpenSnackbar(true);
    }
  }, [handleUpdateLeave, refetch]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleOpenModal = useCallback(() => setOpenModal(true), []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setLeaveData({ leaveType: "", date: "", reason: "", leaveDuration: "", halfDayType: "", time: "" });
    setFormErrors({});
  }, []);

  const handleCloseSnackbar = useCallback(() => setOpenSnackbar(false), []);

  const filteredLeaveRequests = useMemo(() => {
    return leaveRequest.filter((item) => {
      let matches = true;
      if (filters.leaveType && item.leaveType !== filters.leaveType) matches = false;
      if (filters.status && item.status !== filters.status) matches = false;
      if (filters.startDate && new Date(item.date) < new Date(filters.startDate)) matches = false;
      if (filters.endDate && new Date(item.date) > new Date(filters.endDate)) matches = false;
      if (filters.duration) {
        if (filters.duration === 'Full Day' && item.leaveDuration !== 'Full Day') matches = false;
        if (filters.duration === 'Morning' && (item.leaveDuration !== 'Half Day' || item.halfDayType !== 'Morning')) matches = false;
        if (filters.duration === 'Evening' && (item.leaveDuration !== 'Half Day' || item.halfDayType !== 'Evening')) matches = false;
      }
      return matches;
    });
  }, [leaveRequest, filters]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '1400px',
        mx: 'auto',
        px: 4,
        gap: 4,
        py: 6,
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ width: '100%', mb: 2 }}>
        <Grid container spacing={2} sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
          <Grid item xs={12} container justifyContent='flex-end'>
            <ProfileNav />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ pt: '10px' }}>
        <Grid container spacing={3} flexDirection="row">
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', width: '100%' }}>
              <CircularProgress color="primary" size={50} />
            </Box>
          )}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbarSeverity}
              sx={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>

          <Grid item xs={12}>
            <GlassEffect.GlassContainer>
              <Paper sx={commonStyles.glassPaper(theme)}>
                <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      letterSpacing: '-0.02em',
                      fontSize: '2rem',
                    }}
                  >
                    Leave Management
                  </Typography>
                </Grid>
                <LeaveFilter
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                  handleOpenModal={handleOpenModal}
                  theme={theme}
                />
                <LeaveTable
                  filteredLeaveRequests={filteredLeaveRequests}
                  user={user}
                  userId={userId}
                  loading={loading}
                  handleActionLeave={handleActionLeave}
                  theme={theme}
                />
              </Paper>
            </GlassEffect.GlassContainer>
          </Grid>
        </Grid>
      </Box>

      <LeaveModal
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        leaveData={leaveData}
        setLeaveData={setLeaveData}
        formErrors={formErrors}
        handleSubmit={handleSubmit}
        loading={loading}
        theme={theme}
      />
    </Box>
  );
};

export default LeavePage;