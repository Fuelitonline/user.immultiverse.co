import React, { useState } from 'react';
import {
  Box, TextField, Select, MenuItem, Button, Popover, IconButton, Chip, Stack, FormControl, InputLabel,
  Typography, Tooltip, InputAdornment, Pagination, List, ListItem, ListItemText, Dialog, DialogContent, DialogTitle,
  ListItemIcon, Grid
} from '@mui/material';
import { Visibility, Edit, FileDownload, CheckCircle, Cancel, Search as SearchIcon, Description, Image, Delete } from '@mui/icons-material';
import * as XLSX from 'xlsx';

// Mock data for table
const initialLeaves = [
  {
    id: 1, employeeName: 'John Doe', employeeId: 'EMP001', department: 'Engineering',
    leaveType: 'Annual Leave', startDate: '2024-02-15', endDate: '2024-02-19',
    days: 5, appliedDate: '2024-02-01', status: 'Approved', files: [], images: []
  },
  {
    id: 2, employeeName: 'Jane Smith', employeeId: 'EMP002', department: 'Marketing',
    leaveType: 'Sick Leave', startDate: '2024-02-20', endDate: '2024-02-22',
    days: 3, appliedDate: '2024-02-18', status: 'Requested', files: [], images: []
  },
  {
    id: 3, employeeName: 'Mike Johnson', employeeId: 'EMP003', department: 'Sales',
    leaveType: 'Personal Leave', startDate: '2024-02-25', endDate: '2024-02-26',
    days: 2, appliedDate: '2024-02-15', status: 'Rejected', files: [], images: []
  },
  {
    id: 4, employeeName: 'Sarah Wilson', employeeId: 'EMP004', department: 'HR',
    leaveType: 'Half Day', startDate: '2024-03-01', endDate: '2024-03-01',
    days: 0.5, appliedDate: '2024-02-20', status: 'Approved', files: [], images: []
  },
  {
    id: 5, employeeName: 'David Brown', employeeId: 'EMP005', department: 'Finance',
    leaveType: 'Half Day', startDate: '2024-02-28', endDate: '2024-02-28',
    days: 0.5, appliedDate: '2024-02-25', status: 'Requested', files: [], images: []
  },
];

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
const statuses = ['Approved', 'Requested', 'Rejected'];
const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Half Day'];

const columnWidths = {
  employeeName: '150px',
  employeeId: '150px',
  department: '150px',
  leaveType: '150px',
  startDate: '150px',
  endDate: '150px',
  duration: '100px',
  appliedDate: '150px',
  status: '150px',
  files: '200px',
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

const Leavetable = () => {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: '', employeeId: '', department: '', leaveType: '',
    startDate: '', endDate: '', days: '', appliedDate: '', status: 'Requested',
    files: [], images: []
  });
  const [filters, setFilters] = useState({
    search: '', department: 'All Department', status: ''
  });
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const rowsPerPage = 5;

  const handleOpenPopover = (event, leave = null) => {
    if (leave) {
      setFormData(leave);
      setEditId(leave.id);
    } else {
      setFormData({
        employeeName: '', employeeId: '', department: '', leaveType: '',
        startDate: '', endDate: '', days: '', appliedDate: '', status: 'Requested',
        files: [], images: []
      });
      setEditId(null);
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'leaveType' && value === 'Half Day') {
        newData.days = 0.5;
        newData.endDate = newData.startDate;
      } else if (name === 'startDate' || name === 'endDate') {
        const start = new Date(newData.startDate);
        const end = new Date(newData.endDate);
        if (start && end && end >= start && newData.leaveType !== 'Half Day') {
          const diffTime = Math.abs(end - start);
          newData.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        } else {
          newData.days = '';
        }
      }
      return newData;
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const fileData = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            name: file.name,
            type: file.type,
            data: reader.result
          });
          reader.readAsDataURL(file);
        });
      })
    );
    setFormData((prev) => ({
      ...prev,
      files: editId ? [...prev.files, ...fileData] : fileData
    }));
  };

  const handleImageChange = async (e) => {
    const images = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    const imageData = await Promise.all(
      images.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            name: file.name,
            type: file.type,
            data: reader.result
          });
          reader.readAsDataURL(file);
        });
      })
    );
    setFormData((prev) => ({
      ...prev,
      images: editId ? [...prev.images, ...imageData] : imageData
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleViewFiles = (files, images) => {
    setSelectedFiles(files);
    setSelectedImages(images);
    setViewDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      setLeaves(leaves.map((item) =>
        item.id === editId ? { ...formData, id: editId } : item
      ));
    } else {
      setLeaves([...leaves, { ...formData, id: leaves.length + 1 }]);
    }
    handleClosePopover();
  };

  const handleView = (id) => {
    console.log(`View details for leave ID: ${id}`);
  };

  const handleEdit = (id) => {
    const leave = leaves.find((item) => item.id === id);
    handleOpenPopover({ currentTarget: document.body }, leave);
  };

  const handleApprove = (id) => {
    setLeaves(leaves.map((item) =>
      item.id === id ? { ...item, status: 'Approved' } : item
    ));
  };

  const handleReject = (id) => {
    setLeaves(leaves.map((item) =>
      item.id === id ? { ...item, status: 'Rejected' } : item
    ));
  };

  const handleApproveAll = () => {
    setLeaves(leaves.map((item) =>
      item.status === 'Requested' ? { ...item, status: 'Approved' } : item
    ));
  };

  const handleExport = () => {
    try {
      const exportData = filteredLeaves.map(({ files, images, ...rest }) => rest);
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave_Requests');
      XLSX.writeFile(workbook, 'leave_requests.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data to Excel.');
    }
  };

  const filteredLeaves = leaves.filter((item) =>
    (filters.search === '' ||
      item.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(filters.search.toLowerCase())) &&
    (filters.department === 'All Department' || item.department === filters.department) &&
    (filters.status === '' || item.status === filters.status)
  );

  const paginatedLeaves = filteredLeaves.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getLeaveTypeColor = (leaveType) => {
    switch (leaveType) {
      case 'Annual Leave': return 'primary';
      case 'Sick Leave': return 'error';
      case 'Personal Leave': return 'info';
      case 'Half Day': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
                  <SearchIcon sx={{ color: '#6B7280', fontSize: '20px' }} />
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
        <Button
          variant="contained"
          sx={{ bgcolor: '#388e3c', '&:hover': { bgcolor: '#2e7d32' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none' }}
          onClick={handleApproveAll}
        >
          Approve All Pending
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: '#3B82F6',
            color: '#3B82F6',
            '&:hover': { bgcolor: '#DBEAFE' },
            fontSize: '14px',
            borderRadius: '8px',
            textTransform: 'none'
          }}
          startIcon={<FileDownload />}
          onClick={handleExport}
        >
          Export Data
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#3B82F6',
            '&:hover': { bgcolor: '#2563EB' },
            fontSize: '14px',
            borderRadius: '8px',
            textTransform: 'none'
          }}
          onClick={handleOpenPopover}
        >
          Add Leave
        </Button>
      </Stack>

      <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Box sx={{ border: '1px solid #D1D5DB', borderRadius: '10px', minWidth: '1400px', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', bgcolor: '#E5E7EB', height: '48px', borderBottom: '1px solid #D1D5DB' }}>
            <Typography sx={{ ...headerStyle, width: columnWidths.employeeName }}>Employee Name</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.employeeId }}>Employee ID</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.department }}>Department</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.leaveType }}>Leave Type</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.startDate }}>Start Date</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.endDate }}>End Date</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.duration }}>Duration</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.appliedDate }}>Applied Date</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.status }}>Status</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.files }}>Files/Images</Typography>
            <Typography sx={{ ...headerStyle, width: columnWidths.actions, borderRight: 'none' }}>Actions</Typography>
          </Box>
          {paginatedLeaves.map((row, index) => (
            <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', py: '12px', px: '8px', bgcolor: index % 2 === 0 ? '#F9FAFB' : '#E7EAEE', borderBottom: index === paginatedLeaves.length - 1 ? 'none' : '1px solid #D1D5DB', '&:hover': { bgcolor: '#DBEAFE' } }}>
              <Typography sx={{ ...cellStyle, width: columnWidths.employeeName, color: '#3B82F6', cursor: 'pointer' }} onClick={() => handleView(row.id)}>
                {row.employeeName}
              </Typography>
              <Typography sx={{ ...cellStyle, width: columnWidths.employeeId }}>{row.employeeId}</Typography>
              <Typography sx={{ ...cellStyle, width: columnWidths.department }}>{row.department}</Typography>
              <Box sx={{ ...cellStyle, width: columnWidths.leaveType }}>
                <Chip
                  label={row.leaveType}
                  color={getLeaveTypeColor(row.leaveType)}
                  size="small"
                  sx={{ fontSize: '12px' }}
                />
              </Box>
              <Typography sx={{ ...cellStyle, width: columnWidths.startDate }}>{row.startDate}</Typography>
              <Typography sx={{ ...cellStyle, width: columnWidths.endDate }}>{row.endDate}</Typography>
              <Typography sx={{ ...cellStyle, width: columnWidths.duration }}>{row.days === 0.5 ? 'Half Day' : `${row.days} Days`}</Typography>
              <Typography sx={{ ...cellStyle, width: columnWidths.appliedDate }}>{row.appliedDate}</Typography>
              <Box sx={{ ...cellStyle, width: columnWidths.status }}>
                <Chip
                  label={row.status}
                  color={
                    row.status === 'Approved' ? 'success' :
                    row.status === 'Requested' ? 'warning' : 'error'
                  }
                  size="small"
                  sx={{ fontSize: '12px' }}
                />
              </Box>
              <Box sx={{ ...cellStyle, width: columnWidths.files }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {row.files.length > 0 && (
                    <Chip
                      label={`${row.files.length} File${row.files.length > 1 ? 's' : ''}`}
                      size="small"
                      onClick={() => handleViewFiles(row.files, row.images)}
                      icon={<Description />}
                    />
                  )}
                  {row.images.length > 0 && (
                    <Chip
                      label={`${row.images.length} Image${row.images.length > 1 ? 's' : ''}`}
                      size="small"
                      onClick={() => handleViewFiles(row.files, row.images)}
                      icon={<Image />}
                    />
                  )}
                </Stack>
              </Box>
              <Box sx={{ width: columnWidths.actions, display: 'flex', flexDirection: 'column', gap: 1, borderRight: 'none', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => handleView(row.id)} sx={{ '&:hover': { bgcolor: '#DBEAFE' } }}>
                      <Visibility sx={{ color: '#3B82F6', fontSize: '20px' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Leave">
                    <IconButton onClick={() => handleEdit(row.id)} sx={{ '&:hover': { bgcolor: '#DBEAFE' } }}>
                      <Edit sx={{ color: '#3B82F6', fontSize: '20px' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Approve">
                    <IconButton onClick={() => handleApprove(row.id)} sx={{ '&:hover': { bgcolor: '#DBEAFE' } }}>
                      <CheckCircle sx={{ color: '#388e3c', fontSize: '20px' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton onClick={() => handleReject(row.id)} sx={{ '&:hover': { bgcolor: '#DBEAFE' } }}>
                      <Cancel sx={{ color: '#EF4444', fontSize: '20px' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid #D1D5DB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#FFFFFF',
        borderRadius: '0 0 10px 10px'
      }}>
        <Typography sx={{ fontSize: '14px', color: '#374151' }}>
          Showing <b>{(page - 1) * rowsPerPage + 1}</b> to{' '}
          <b>{Math.min(page * rowsPerPage, filteredLeaves.length)}</b> of{' '}
          <b>{filteredLeaves.length}</b> results
        </Typography>
        <Pagination
          count={Math.ceil(filteredLeaves.length / rowsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
          size="small"
        />
      </Box>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontSize: '20px', fontWeight: 600, color: '#1F2937' }}>
          View Files and Images
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>Files</Typography>
            <List>
              {selectedFiles.map((file, index) => (
                <ListItem key={file.name}>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                  <Button
                    variant="outlined"
                    size="small"
                    href={file.data}
                    download={file.name}
                    sx={{ ml: 2 }}
                  >
                    Download
                  </Button>
                </ListItem>
              ))}
              {selectedFiles.length === 0 && (
                <Typography sx={{ color: '#6B7280' }}>No files uploaded</Typography>
              )}
            </List>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>Images</Typography>
            <Grid container spacing={2}>
              {selectedImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <img
                      src={image.data}
                      alt={image.name}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                    <Typography sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      bgcolor: 'rgba(0,0,0,0.6)', 
                      color: 'white', 
                      p: 1, 
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {image.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
              {selectedImages.length === 0 && (
                <Typography sx={{ color: '#6B7280' }}>No images uploaded</Typography>
              )}
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2)',
            bgcolor: 'linear-gradient(to bottom, #ffffff, #f0f4f4f8)',
            p: 4,
            width: { xs: '90vw', sm: '400px' },
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '2px solid #3B82F6'
          }
        }}
      >
        <Typography sx={{ fontSize: '22px', fontWeight: 'bold', color: '#1F2937', mb: 3, textAlign: 'center' }}>
          {editId ? 'Edit Leave' : 'Add Leave'}
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Employee Name"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleFormChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '14px',
                borderRadius: '8px',
                bgcolor: '#F9FAFB',
                '&:hover fieldset': { borderColor: '#3B82F6' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
          <TextField
            fullWidth
            label="Employee ID"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleFormChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '14px',
                borderRadius: '8px',
                bgcolor: '#F9FAFB',
                '&:hover fieldset': { borderColor: '#3B82F6' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: '14px' }}>Department</InputLabel>
            <Select
              name="department"
              value={formData.department}
              onChange={handleFormChange}
              label="Department"
              sx={{ fontSize: '14px', borderRadius: '8px', bgcolor: '#F9FAFB' }}
            >
              {departments.map((dep) => (
                <MenuItem key={dep} value={dep}>{dep}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: '14px' }}>Leave Type</InputLabel>
            <Select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleFormChange}
              label="Leave Type"
              sx={{ fontSize: '14px', borderRadius: '8px', bgcolor: '#F9FAFB' }}
            >
              {leaveTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Start Date"
            name="startDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={handleFormChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '14px',
                borderRadius: '8px',
                bgcolor: '#F9FAFB',
                '&:hover fieldset': { borderColor: '#3B82F6' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
          <TextField
            fullWidth
            label="End Date"
            name="endDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={handleFormChange}
            disabled={formData.leaveType === 'Half Day'}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '14px',
                borderRadius: '8px',
                bgcolor: '#F9FAFB',
                '&:hover fieldset': { borderColor: '#3B82F6' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
          <TextField
            fullWidth
            label="Days"
            name="days"
            value={formData.days}
            InputProps={{ readOnly: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '14px',
                borderRadius: '8px',
                bgcolor: '#F9FAFB',
                '& .hover fieldset': { borderColor: '#3B82F6' },
                '& .Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
          <TextField
            fullWidth
            label="Applied Date"
            name="appliedDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.appliedDate}
            onChange={handleFormChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '14px',
                borderRadius: '8px',
                bgcolor: '#F9FAFB',
                '&:hover fieldset': { borderColor: '#3B82F6' },
                '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
              }
            }}
          />
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1 }}>Current Files</Typography>
            <List dense>
              {formData.files.map((file, index) => (
                <ListItem key={index} secondaryAction={(
                  <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                    <Delete sx={{ color: '#EF4444' }} />
                  </IconButton>
                )}>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
              {formData.files.length === 0 && (
                <Typography sx={{ color: '#6B7280' }}>No files uploaded</Typography>
              )}
            </List>
            <TextField
              fullWidth
              type="file"
              label="Upload New Files"
              name="files"
              onChange={handleFileChange}
              inputProps={{ multiple: true }}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '14px',
                  borderRadius: '8px',
                  bgcolor: '#F9FAFB',
                  '&:hover fieldset': { borderColor: '#3B82F6' },
                  '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
                }
              }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1 }}>Current Images</Typography>
            <List dense>
              {formData.images.map((image, index) => (
                <ListItem key={index} secondaryAction={(
                  <IconButton edge="end" onClick={() => handleRemoveImage(index)}>
                    <Delete sx={{ color: '#EF4444' }} />
                  </IconButton>
                )}>
                  <ListItemIcon>
                    <Image />
                  </ListItemIcon>
                  <ListItemText primary={image.name} />
                </ListItem>
              ))}
              {formData.images.length === 0 && (
                <Typography sx={{ color: '#6B7280' }}>No images uploaded</Typography>
              )}
            </List>
            <TextField
              fullWidth
              type="file"
              label="Upload New Images"
              name="images"
              onChange={handleImageChange}
              inputProps={{ multiple: true, accept: 'image/*' }}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '14px',
                  borderRadius: '8px',
                  bgcolor: '#F9FAFB',
                  '&:hover fieldset': { borderColor: '#3B82F6' },
                  '&.Mui-focused fieldset': { borderColor: '#3B82F6' }
                }
              }}
            />
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, fontSize: '14px', borderRadius: '8px', textTransform: 'none', px: 4 }}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: '#EF4444', color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } , fontSize: '14px', borderRadius: '8px', textTransform: 'none', px: 4 }}
              onClick={handleClosePopover}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};

export default Leavetable;