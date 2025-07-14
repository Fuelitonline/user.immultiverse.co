import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Box, TextField, Select, MenuItem, Button,
  Popover, IconButton, Chip, Stack, FormControl, InputLabel, Grid, Fade,
  InputAdornment, Tooltip
} from '@mui/material';
import { Edit, CheckCircle, Cancel, Search, Update } from '@mui/icons-material';
import ProfileNav from '../../../components/user/profiveNav';

const initialIncentives = [
  {
    id: 1, employeeName: 'John Doe', employeeId: 'EMP001', department: 'Sales',
    targetName: 'Q1 Sales', achievedValue: 120, targetValue: 100, incentiveAmount: 5000,
    status: 'Approved', remarks: 'Great performance'
  },
  {
    id: 2, employeeName: 'Jane Smith', employeeId: 'EMP002', department: 'IT',
    targetName: 'Project Delivery', achievedValue: 80, targetValue: 100, incentiveAmount: 2000,
    status: 'Pending', remarks: 'Needs review'
  },
  {
    id: 3, employeeName: 'Alice Johnson', employeeId: 'EMP003', department: 'HR',
    targetName: 'Recruitment Q2', achievedValue: 90, targetValue: 100, incentiveAmount: 3000,
    status: 'Rejected', remarks: 'Missed targets'
  },
];

const departments = ['Sales', 'IT', 'HR', 'Finance'];
const statuses = ['Approved', 'Pending', 'Rejected', 'On Process'];

const columnWidths = {
  employeeName: '150px',
  employeeId: '150px',
  department: '150px',
  targetName: '150px',
  achievedValue: '150px',
  targetValue: '150px',
  incentiveAmount: '150px',
  status: '150px',
  remarks: '150px',
  actions: '150px'
};

const headerStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#374151',
  px: '12px',
  py: '10px',
  borderRight: '1px solid #D1D5DB',
  bgcolor: '#E5E7EB',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
  textAlign: 'center'
};

const cellStyle = {
  fontSize: '12px',
  color: '#1F2937',
  px: '12px',
  py: '10px',
  borderRight: '1px solid #D1D5DB',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textAlign: 'center'
};

const Incentive = () => {
  const [incentives, setIncentives] = useState(initialIncentives);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: '', employeeId: '', department: '', targetName: '',
    achievedValue: '', targetValue: '', incentiveAmount: '', remarks: ''
  });
  const [filters, setFilters] = useState({
    search: '', department: 'All Department', fromDate: '', toDate: '', status: ''
  });
  const [editId, setEditId] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [selectedIncentiveId, setSelectedIncentiveId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminApproval, setAdminApproval] = useState(null);

  const handleOpenPopover = (event, incentive = null) => {
    if (incentive) {
      setFormData(incentive);
      setEditId(incentive.id);
    } else {
      setFormData({
        employeeName: '', employeeId: '', department: '', targetName: '',
        achievedValue: '', targetValue: '', incentiveAmount: '', remarks: ''
      });
      setEditId(null);
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setAdminApproval(null);
  };

  const handleStatusPopoverOpen = (event, id, currentStatus) => {
    setStatusAnchorEl(event.currentTarget);
    setSelectedIncentiveId(id);
    setNewStatus(currentStatus);
  };

  const handleStatusPopoverClose = () => {
    setStatusAnchorEl(null);
    setSelectedIncentiveId(null);
    setNewStatus('');
    setAdminApproval(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'achievedValue' || name === 'targetValue') {
        const achieved = parseFloat(newData.achievedValue) || 0;
        const target = parseFloat(newData.targetValue) || 0;
        newData.incentiveAmount = target ? ((achieved / target) * 5000).toFixed(2) : '';
      }
      return newData;
    });
  };

  const handleSave = () => {
    if (editId) {
      setIncentives(incentives.map((item) =>
        item.id === editId ? { ...formData, id: editId } : item
      ));
    } else {
      setIncentives([...incentives, { ...formData, id: incentives.length + 1, status: 'Pending' }]);
    }
    handleClosePopover();
  };

  const handleStatusChangeRequest = () => {
    setAdminApproval('pending');
    setTimeout(() => {
      setAdminApproval('approved');
      setIncentives(incentives.map((item) =>
        item.id === selectedIncentiveId ? { ...item, status: newStatus } : item
      ));
      handleStatusPopoverClose();
    }, 2000);
  };

  const handleAction = (id, action) => {
    setIncentives(incentives.map((item) =>
      item.id === id ? { ...item, status: action } : item
    ));
  };

  const handleApproveAll = () => {
    setIncentives(incentives.map((item) =>
      item.status === 'Pending' ? { ...item, status: 'Approved' } : item
    ));
  };

  const handleExport = () => {
    alert('Exporting data to CSV...');
  };

  const handleGenerateReport = () => {
    alert('Generating report...');
  };

  const filteredIncentives = incentives.filter((item) =>
    (filters.search === '' ||
      item.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(filters.search.toLowerCase())) &&
    (filters.department === 'All Department' || item.department === filters.department) &&
    (filters.status === '' || item.status === filters.status)
  );

  return (
    <Box sx={{
        fontFamily: 'Inter, sans-serif',
        width: '98%',
        mx: 'auto',
        minHeight: '100vh',
        py: 4,
        mr: 2,
        overflow: 'hidden',
        bgcolor: '#F9FAFB',
      }}>

      <Grid container spacing={1} p={3}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <ProfileNav />
        </Grid>

        <Grid item xs={12}>
          <Card sx={{
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
              maxWidth: '100%',
            }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1F2937', letterSpacing: '-0.02em' }}>
                  Incentive Management
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    placeholder="Search by Name/ID"
                    variant="outlined"
                    size="small"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', '& fieldset': { border: '1px solid #D1D5DB' },
                        '&:hover fieldset': { border: '1px solid #9CA3AF' }, '&.Mui-focused fieldset': { border: '2px solid #3B82F6' },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#6B7280', fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ fontSize: '14px' }}>Department</InputLabel>
                    <Select
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                      label="Department"
                      sx={{ fontSize: '14px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFFFF' }}
                    >
                      <MenuItem value="All Department">All Department</MenuItem>
                      {departments.map((dep) => (
                        <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={filters.fromDate}
                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFFFF' } }}
                  />
                  <TextField
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={filters.toDate}
                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFFFF' } }}
                  />
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ fontSize: '14px' }}>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      label="Status"
                      sx={{ fontSize: '14px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFFFF' }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      {statuses.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'flex-end' }}>
                <Button variant="contained" sx={{ bgcolor: '#388e3c', '&:hover': { bgcolor: '#2e7d32' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }} onClick={handleApproveAll}>
                  Approve All Pending
                </Button>
                <Button variant="outlined" sx={{ borderColor: '#3B82F6', color: '#3B82F6', '&:hover': { bgcolor: '#DBEAFE' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }} onClick={handleExport}>
                  Export Data
                </Button>
                <Button variant="outlined" sx={{ borderColor: '#3B82F6', color: '#3B82F6', '&:hover': { bgcolor: '#DBEAFE' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }} onClick={handleGenerateReport}>
                  Generate Reports
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }} onClick={handleOpenPopover}>
                  Add Incentive
                </Button>
              </Stack>

              <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                <Box sx={{ border: '1px solid #D1D5DB', borderRadius: '10px', minWidth: '1300px', bgcolor: '#FFFFFF' }}>
                  <Box sx={{ display: 'flex', bgcolor: '#E5E7EB', height: '48px', borderBottom: '1px solid #D1D5DB' }}>
                    <Typography sx={{ ...headerStyle, width: columnWidths.employeeName }}>Employee Name</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.employeeId }}>Employee ID</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.department }}>Department</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.targetName }}>Target Name</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.achievedValue }}>Achieved Value</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.targetValue }}>Target Value</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.incentiveAmount }}>Incentive Amount</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.status }}>Status</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.remarks }}>Remarks</Typography>
                    <Typography sx={{ ...headerStyle, width: columnWidths.actions, borderRight: 'none' }}>Actions</Typography>
                  </Box>
                  {filteredIncentives.map((row, index) => (
                    <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', py: '12px', px: '8px', bgcolor: index % 2 === 0 ? '#F9FAFB' : '#E7EAEE', borderBottom: index === filteredIncentives.length - 1 ? 'none' : '1px solid #D1D5DB', '&:hover': { bgcolor: '#DBEAFE' } }}>
                      <Typography sx={{ ...cellStyle, width: columnWidths.employeeName, color: '#3B82F6', cursor: 'pointer' }} onClick={() => alert(`Details for ${row.employeeName}`)}>
                        {row.employeeName}
                      </Typography>
                      <Typography sx={{ ...cellStyle, width: columnWidths.employeeId }}>{row.employeeId}</Typography>
                      <Typography sx={{ ...cellStyle, width: columnWidths.department }}>{row.department}</Typography>
                      <Typography sx={{ ...cellStyle, width: columnWidths.targetName }}>{row.targetName}</Typography>
                      <Typography sx={{ ...cellStyle, width: columnWidths.achievedValue }}>{row.achievedValue}</Typography>
                      <Typography sx={{ ...cellStyle, width: columnWidths.targetValue }}>{row.targetValue}</Typography>
                      <Typography sx={{ ...cellStyle, width: columnWidths.incentiveAmount }}>{row.incentiveAmount}</Typography>
                      <Box sx={{ ...cellStyle, width: columnWidths.status }}>
                        <Chip
                          label={row.status}
                          color={
                            row.status === 'Approved' ? 'success' :
                            row.status === 'Pending' ? 'warning' :
                            row.status === 'On Process' ? 'info' : 'error'
                          }
                          size="small"
                          sx={{ fontSize: '12px' }}
                        />
                      </Box>
                      <Typography sx={{ ...cellStyle, width: columnWidths.remarks }}>{row.remarks}</Typography>
                      <Box sx={{ width: columnWidths.actions, display: 'flex', flexDirection: 'column', gap: 1, borderRight: 'none', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Incentive">
                            <IconButton onClick={(e) => handleOpenPopover(e, row)} sx={{ '&:hover': { bgcolor: '#DBEAFE' } }}>
                              <Edit sx={{ color: '#3B82F6', fontSize: '20px' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update Status">
                            <IconButton onClick={(e) => handleStatusPopoverOpen(e, row.id, row.status)} sx={{ '&:hover': { bgcolor: '#DBEAFE' } }}>
                              <Update sx={{ color: '#F59E0B', fontSize: '20px' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Approve">
                            <IconButton onClick={() => handleAction(row.id, 'Approved')} sx={{ '&:hover': { bgcolor: '#DBEAFE' } }}>
                              <CheckCircle sx={{ color: '#388e3c', fontSize: '20px' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton onClick={() => handleAction(row.id, 'Rejected')} sx={{ '&:hover': { bgcolor: '#DBEAFE' } }}>
                              <Cancel sx={{ color: '#EF4444', fontSize: '20px' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
                transformOrigin={{ vertical: 'center', horizontal: 'center' }}
                PaperProps={{
                  sx: {
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    bgcolor: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                    p: 3,
                    width: { xs: '90vw', sm: 450 },
                    maxHeight: '80vh',
                    overflowY: 'auto'
                  }
                }}
              >
                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1F2937', mb: 3 }}>
                  {editId ? 'Edit Incentive' : 'Add Incentive'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Employee Name"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleFormChange}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleFormChange}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: '14px' }}>Department</InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={handleFormChange}
                        label="Department"
                        sx={{ fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' }}
                      >
                        {departments.map((dep) => (
                          <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target Name"
                      name="targetName"
                      value={formData.targetName}
                      onChange={handleFormChange}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Achieved Value"
                      name="achievedValue"
                      type="number"
                      value={formData.achievedValue}
                      onChange={handleFormChange}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target Value"
                      name="targetValue"
                      type="number"
                      value={formData.targetValue}
                      onChange={handleFormChange}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Incentive Amount"
                      name="incentiveAmount"
                      value={formData.incentiveAmount}
                      InputProps={{ readOnly: true }}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleFormChange}
                      multiline
                      rows={2}
                      sx={{ '& .MuiOutlinedInput-root': { fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }}
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ borderColor: '#EF4444', color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }}
                        onClick={handleClosePopover}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Popover>

              <Popover
                open={Boolean(statusAnchorEl)}
                anchorEl={statusAnchorEl}
                onClose={handleStatusPopoverClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                PaperProps={{
                  sx: {
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    bgcolor: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                    p: 3,
                    width: 300
                  }
                }}
              >
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', mb: 2 }}>
                  Update Status
                </Typography>
                {adminApproval === 'pending' ? (
                  <Typography sx={{ color: '#F59E0B', mb: 2 }}>Awaiting Admin Approval...</Typography>
                ) : adminApproval === 'approved' ? (
                  <Typography sx={{ color: '#388e3c', mb: 2 }}>Status Updated Successfully!</Typography>
                ) : (
                  <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontSize: '14px' }}>Status</InputLabel>
                      <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        label="Status"
                        sx={{ fontSize: '14px', borderRadius: '10px', bgcolor: '#F9FAFB' }}
                      >
                        {statuses.map((status) => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }}
                        onClick={handleStatusChangeRequest}
                      >
                        Submit
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ borderColor: '#EF4444', color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }}
                        onClick={handleStatusPopoverClose}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </>
                )}
              </Popover>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Incentive;