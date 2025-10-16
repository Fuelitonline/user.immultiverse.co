import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, Paper,
  IconButton, Snackbar, Alert, CircularProgress, Tooltip, FormControl, InputLabel, Select,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, TextField,
  ToggleButtonGroup, ToggleButton, Card, CardContent, Chip, alpha, Accordion, AccordionSummary, AccordionDetails
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
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Pagination from '@mui/material/Pagination';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useGet, usePost } from "../../hooks/useApi";
import { useAuth } from "../../middlewares/auth";
import ProfileNav from "../../components/user/profiveNav";
import GlassEffect from "../../theme/glassEffect";
import { useTheme } from "@emotion/react";
import LeaveRequestForm from "./LeaveRequestForm";

const commonStyles = {
  header: (theme) => ({
    background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
    borderRadius: '34px',
    p: 1.5,
    color: '#fff',
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.2)',
    mb: 4,
  }),
  statsChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#fff',
    borderRadius: '25px',
    px: 3,
    py: '8px',
    fontWeight: 600,
    fontSize: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  filterHeader: (theme) => ({
    background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
    color: '#fff',
    borderRadius: '16px',
    p: 2.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  tableContainer: (theme) => ({
    borderRadius: '0px 0px 16px 16px',
    border: `2px solid ${theme.palette.primary.light}`,
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.08)',
    maxHeight: '60vh',
    overflowY: 'auto',
    background: '#fff',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
      borderRadius: '4px',
    },
  }),
  tableHead: (theme) => ({
    background: `White`,
    position: 'sticky',
    top: 0,
    zIndex: 2,
  }),
  tableCell: (theme) => ({
    color: 'var(--text-color-2)',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    '&:last-child': { borderRight: 'none' },
    py: 2,
  }),
  inputField: (theme) => ({
    borderRadius: '12px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.light },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
    '& .MuiInputLabel-root': { color: theme.palette.primary.main, fontWeight: 500 },
    '& .MuiInputBase-input': { color: theme.palette.text.primary },
    '& .MuiSelect-select': { color: theme.palette.text.primary },
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
    backgroundColor: '#f8fbff',
  }),
  button: (theme) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: '#fff',
    borderRadius: '12px',
    px: 4,
    py: 1.5,
    fontWeight: 'bold',
    textTransform: 'none',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: theme.palette.primary.dark,
      transform: 'scale(1.03)',
      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
    },
  }),
  card: (theme) => ({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
    },
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
    border: `1px solid ${alpha('#1976D2', 0.1)}`,
  }),
};

const LeaveFilter = ({ filters, handleFilterChange, theme }) => (
  <Box>
    <Paper sx={{ borderRadius: '0 0 16px 16px', p: 3, background: '#f8fbff' }}>
      <Grid container spacing={2}>
        {[
          { name: 'leaveType', label: 'Leave Type', options: ['', 'Casual Leave', 'Sick Leave'], type: 'select', icon: <EventNoteIcon sx={{ color: '#1976D2', fontSize: 20 }} /> },
          { name: 'status', label: 'Status', options: ['', 'Pending', 'Approved', 'Rejected'], type: 'select', icon: <AssignmentTurnedInIcon sx={{ color: '#1976D2', fontSize: 20 }} /> },
          { name: 'startDate', label: 'Start Date', type: 'date', icon: <CalendarTodayIcon sx={{ color: '#1976D2', fontSize: 20 }} /> },
          { name: 'endDate', label: 'End Date', type: 'date', icon: <CalendarTodayIcon sx={{ color: '#1976D2', fontSize: 20 }} /> },
          { name: 'leavePaymentType', label: 'Payment Type', options: ['', 'Paid', 'Unpaid'], type: 'select', icon: <EventNoteIcon sx={{ color: '#1976D2', fontSize: 20 }} /> },
          { name: 'duration', label: 'Duration', options: ['', 'Full Day', 'Morning', 'Evening'], type: 'select', icon: <AccessTimeIcon sx={{ color: '#1976D2', fontSize: 20 }} /> },
        ].map(({ name, label, options, type, icon }) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            {type === 'select' ? (
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>{label}</InputLabel>
                <Select
                  name={name}
                  value={filters[name] || ''}
                  onChange={handleFilterChange}
                  label={label}
                  startAdornment={<InputAdornment position="start">{icon}</InputAdornment>}
                  sx={commonStyles.inputField(theme)}
                >
                  {options.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt || 'All'}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                size="small"
                label={label}
                variant="outlined"
                type={type}
                name={name}
                value={filters[name] || ''}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
                }}
                sx={commonStyles.inputField(theme)}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Paper>
  </Box>
);

const LeaveTable = ({ filteredLeaveRequests, user, userId, loading, handleActionLeave, theme }) => {
  return (
    <TableContainer component={Paper} sx={commonStyles.tableContainer(theme)}>
      <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead sx={commonStyles.tableHead(theme)}>
          <TableRow>
            {['Leave Type', 'Date', 'Duration', 'Payment Type', 'Status', 'Reason'].map((header) => (
              <TableCell key={header} sx={commonStyles.tableCell(theme)}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLeaveRequests.length > 0 ? (
            filteredLeaveRequests.map((item) => (
              <TableRow
                key={item._id || Date.now()}
                sx={{
                  '&:hover': { backgroundColor: '#f8fbff', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' },
                  '&:last-child td': { borderBottom: 0 },
                  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem', py: 2 }}>
                  <Chip label={item.leaveType || 'N/A'} size="small" sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 600 }} />
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem', py: 2 }}>
                  {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'N/A'}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem', py: 2 }}>
                  {item.leaveDuration === 'Half Day' ? `${item.halfDayType || 'N/A'}` : item.leaveDuration || 'N/A'}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem', py: 2 }}>
                  <Chip
                    label={item.leavePaymentType || 'N/A'}
                    size="small"
                    sx={{
                      backgroundColor: item.leavePaymentType === 'Paid' ? '#E8F5E9' : '#FFF3E0',
                      color: item.leavePaymentType === 'Paid' ? '#4CAF50' : '#FF9800',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem', py: 2 }}>
                  <Chip
                    label={item.status || 'Unknown'}
                    size="small"
                    color={item.status === 'Approved' ? 'success' : item.status === 'Pending' ? 'warning' : 'error'}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem', py: 2 }}>
                  <Tooltip title={item.reason || 'No reason provided'}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', maxWidth: '150px', cursor: 'pointer' }}>
                      {item.reason?.substring(0, 20) || 'N/A'}...
                    </Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No leave requests found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const LeaveGrid = ({ filteredLeaveRequests, user, userId, loading, handleActionLeave, theme }) => {
  return (
    <Grid container spacing={3}>
      {filteredLeaveRequests.length > 0 ? (
        filteredLeaveRequests.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id || Date.now()}>
            <Card sx={commonStyles.card(theme)}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={item.leaveType || 'N/A'}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      borderRadius: '12px',
                    }}
                  />
                  <Chip
                    label={item.status || 'Unknown'}
                    color={item.status === 'Approved' ? 'success' : item.status === 'Pending' ? 'warning' : 'error'}
                    sx={{ fontWeight: 600, borderRadius: '12px' }}
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: theme.palette.text.primary }}>
                  {item.reason || 'No reason provided'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.time ? new Date(item.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventNoteIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.leaveDuration === 'Half Day' ? item.halfDayType || 'N/A' : item.leaveDuration || 'N/A'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color={item.leavePaymentType === 'Paid' ? 'success.main' : 'warning.main'}>
                    Payment: {item.leavePaymentType || 'N/A'}
                  </Typography>
                </Box>
                {(user.role === 'superAdmin' || user?.junior?.includes(userId)) && (
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {loading?.id === item._id && loading?.action === 'Approved' ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Tooltip title="Approve">
                        <IconButton
                          color="success"
                          disabled={item.status === 'Approved' || item.status === 'Rejected'}
                          onClick={() => handleActionLeave(item._id, 'Approved')}
                          sx={{
                            boxShadow: '0 3px 8px rgba(76, 175, 80, 0.3)',
                            '&:hover': { transform: 'scale(1.1)', backgroundColor: theme.palette.success.light },
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {loading?.id === item._id && loading?.action === 'Rejected' ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Tooltip title="Reject">
                        <IconButton
                          color="error"
                          disabled={item.status === 'Approved' || item.status === 'Rejected'}
                          onClick={() => handleActionLeave(item._id, 'Rejected')}
                          sx={{
                            boxShadow: '0 3px 8px rgba(239, 83, 80, 0.3)',
                            '&:hover': { transform: 'scale(1.1)', backgroundColor: theme.palette.error.light },
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body1">
              No leave requests match the selected filters
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

const LeaveModal = ({ openModal, handleCloseModal, leaveData, setLeaveData, formErrors, handleSubmit, loading, theme }) => (
  <Dialog
    open={openModal}
    onClose={handleCloseModal}
    PaperProps={{
      sx: {
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)',
        borderRadius: '20px',
        width: 450,
        maxHeight: '80vh',
        overflowY: 'auto',
        margin: 'auto',
        mt: '5%',
        boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      },
    }}
    BackdropProps={{
      sx: { backgroundColor: 'rgba(25, 118, 210, 0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' },
    }}
  >
    <DialogTitle sx={{
      textAlign: 'center',
      fontWeight: 'bold',
      color: theme.palette.primary.main,
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
          borderColor: theme.palette.primary.light,
          color: theme.palette.primary.main,
          fontWeight: 500,
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
          sx={commonStyles.button(theme)}
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
  const [viewMode, setViewMode] = useState('list');
  const [expandedFilter, setExpandedFilter] = useState(false);
  const [leaveData, setLeaveData] = useState({
    leaveType: "",
    date: "",
    reason: "",
    leaveDuration: "",
    halfDayType: "",
    time: "",
    leavePaymentType: "Paid",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
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
    leavePaymentType: "",
  });

  const apiEndpoint = user.role === 'superAdmin' || user.role === 'Manager' ? 'employee/leave/get-all' : 'employee/leave/get-by-id';
const apiParams = user.role === 'superAdmin' || user.role === 'Manager'
  ? { page: currentPage, limit: perPage }
  : { employeeId: userId, page: currentPage, limit: perPage };


  const { data: leaves, isLoading, refetch } = useGet(apiEndpoint, apiParams);
  const handleSubmitLeave = usePost("/employee/leave/create");
  const handleUpdateLeave = usePost("/employee/leave/update");

  useEffect(() => {
    if (leaves?.data?.data?.leaveRequests) {
      setLeaveRequest(Array.isArray(leaves.data.data.leaveRequests) ? leaves.data.data.leaveRequests : []);
    } else {
      setLeaveRequest([]);
    }
  }, [leaves]);

  useEffect(() => {
  if (leaves?.data?.data?.leaveRequests) {
    const res = leaves.data.data;
    setLeaveRequest(res.leaveRequests || []);
    
    if (res.pagination) {
      setTotalPages(res.pagination.totalPages || 1);
      setCurrentPage(res.pagination.currentPage || 1);
      setPerPage(res.pagination.perPage || 10);
      setTotalCount(res.pagination.total || 0);
    }
  } else {
    setLeaveRequest([]);
  }
}, [leaves]);


  useEffect(() => {
  refetch();
}, [currentPage]);



  const validateForm = useCallback(() => {
    const errors = {};
    if (!leaveData.leaveType) errors.leaveType = "Leave type is required";
    if (!leaveData.date) errors.date = "Date is required";
    if (!leaveData.leaveDuration) errors.leaveDuration = "Leave duration is required";
    if (leaveData.leaveDuration === 'Half Day' && !leaveData.halfDayType) errors.halfDayType = "Half day type is required";
    if (!leaveData.time) errors.time = "Time is required";
    if (!leaveData.reason.trim()) errors.reason = "Reason is required";
    if (!leaveData.leavePaymentType) errors.leavePaymentType = "Payment type is required";
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
        leavePaymentType: leaveData.leavePaymentType || 'Paid',
      };
      if (!handleSubmitLeave.mutateAsync) throw new Error("usePost hook is not initialized");
      const res = await handleSubmitLeave.mutateAsync(leaveDetails);

      if (res.data) {
        setLeaveRequest((prev) => [
          {
            ...leaveDetails,
            _id: res.data?.data?._id || Date.now(),
            status: "Pending",
            date: new Date(leaveDetails.date).toISOString(),
          },
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
    setLeaveData({ leaveType: "", date: "", reason: "", leaveDuration: "", halfDayType: "", time: "", leavePaymentType: "Paid" });
    setFormErrors({});
  }, []);

  const handleCloseSnackbar = useCallback(() => setOpenSnackbar(false), []);

  const handleViewChange = useCallback((event, newViewMode) => {
    if (newViewMode) setViewMode(newViewMode);
  }, []);

  const filteredLeaveRequests = useMemo(() => {
    return leaveRequest.filter((item) => {
      let matches = true;
      if (filters.leaveType && item.leaveType !== filters.leaveType) matches = false;
      if (filters.status && item.status !== filters.status) matches = false;
      if (filters.startDate && new Date(item.date) < new Date(filters.startDate)) matches = false;
      if (filters.endDate && new Date(item.date) > new Date(filters.endDate)) matches = false;
      if (filters.leavePaymentType && item.leavePaymentType !== filters.leavePaymentType) matches = false;
      if (filters.duration) {
        if (filters.duration === 'Full Day' && item.leaveDuration !== 'Full Day') matches = false;
        if (filters.duration === 'Morning' && (item.leaveDuration !== 'Half Day' || item.halfDayType !== 'Morning')) matches = false;
        if (filters.duration === 'Evening' && (item.leaveDuration !== 'Half Day' || item.halfDayType !== 'Evening')) matches = false;
      }
      return matches;
    });
  }, [leaveRequest, filters]);

  const totalLeaves = leaveRequest.length;
  const approvedLeaves = leaveRequest.filter(l => l.status === 'Approved').length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ backgroundColor: '#f8fbff', minHeight: '100vh', py: 4, width: '100%', mt: 4 }}>
        <Box sx={{ maxWidth: '1600px', mx: 'auto', px: 4 }}>
          <Box sx={{ mb: 3 }}>
            <ProfileNav />
          </Box>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbarSeverity}
              sx={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 16px rgba(25, 118, 210, 0.1)' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>

          {/* Header Section */}
          <Box sx={commonStyles.header(theme)}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#fff', fontSize: '1.5rem' }}>
                  Leave Management
                </Typography>
              </Grid>

              <Grid item>
                <Box sx={commonStyles.statsChip}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Total: {totalLeaves} Requests
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={commonStyles.statsChip}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ✅ Approved: {approvedLeaves}
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewChange}
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '26px',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    overflow: 'hidden',
                  }}
                >
                  <ToggleButton
                    value="list"
                    sx={{
                      borderRadius: 0,
                      p: '8px',
                      color: theme.palette.primary.main,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 600,
                      }
                    }}
                  >
                    <ViewListIcon sx={{ mr: 1 }} /> List
                  </ToggleButton>
                  <ToggleButton
                    value="grid"
                    sx={{
                      borderRadius: 0,
                      p: '6px',
                      color: theme.palette.primary.main,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 600,
                      }
                    }}
                  >
                    <ViewModuleIcon sx={{ mr: 1 }} /> Grid
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={handleOpenModal}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    color: '#fff',
                    borderRadius: '24px',
                    px: 3,
                    py: '8px',
                    fontWeight: 600,
                    textTransform: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.35)',
                    },
                  }}
                >
                  NEW REQUEST
                </Button>
              </Grid>
            </Grid>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', width: '100%' }}>
              <CircularProgress color="primary" size={50} />
            </Box>
          ) : (
            <>
              {/* Accordion for Filters */}
              <Accordion
                expanded={expandedFilter}
                onChange={(event, isExpanded) => setExpandedFilter(isExpanded)}
                sx={{
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                  borderRadius: '16px',
                  border: 'none',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />}
                  sx={{
                    background: 'var(--background-bg-2)',
                    borderRadius: '16px 16px 0 0',
                    '& .MuiAccordionSummary-content': {
                      margin: '12px 0',
                    },
                  }}
                >
                  <Typography sx={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
                    Advanced Filters
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, background: '#f8fbff', borderRadius: '0 0 16px 16px' }}>
                  <LeaveFilter
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    theme={theme}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Content Based on View Mode */}
              <Box>
                {viewMode === 'list' ? (
                  <LeaveTable
                    filteredLeaveRequests={filteredLeaveRequests}
                    user={user}
                    userId={userId}
                    loading={loading}
                    handleActionLeave={handleActionLeave}
                    theme={theme}
                  />
                ) : (
                  <LeaveGrid
                    filteredLeaveRequests={filteredLeaveRequests}
                    user={user}
                    userId={userId}
                    loading={loading}
                    handleActionLeave={handleActionLeave}
                    theme={theme}
                  />
                )}

                {/* Pagination */}
                {/* 👇 Pagination & Rows per Page Controls */}
<Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mt: 3,
    px: 2,
  }}
>
  {/* Rows per page selector */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography variant="body2">Rows per page:</Typography>
    <FormControl size="small" sx={{width: '150px'}}>
      <Select
        value={perPage}
        onChange={(e) => {
          setPerPage(e.target.value);
          setCurrentPage(1); // reset to first page when limit changes
        }}
      >
        {[5, 10, 25, 50].map((num) => (
          <MenuItem key={num} value={num}>
            {num}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>

  {/* Pagination */}
  <Pagination
    count={totalPages}
    page={currentPage}
    onChange={(e, page) => setCurrentPage(page)}
    color="primary"
    shape="rounded"
  />
</Box>


              </Box>
            </>
          )}

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
      </Box>
    </LocalizationProvider>
  );
};

export default LeavePage;