import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Divider,
  Paper,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import EditIcon from '@mui/icons-material/Edit';
import UploadIcon from '@mui/icons-material/Upload';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BasicDetail from '../MainDashboard/basicDetail'; // Adjust path as needed
import { useGet, usePost } from '../../hooks/useApi';
import { useAuth } from '../../middlewares/auth';

function EmpDetails() {
  const [empDetails, setEmpDetails] = useState({});
  const [avatar, setAvatar] = useState('');
  const [isUploaded, setIsUploaded] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState('basic');
  const { mutateAsync: updateEmployee } = usePost('employee/update');
  const { user } = useAuth();
  const { data: emp, error: empError, isLoading: empLoading, refetch } = useGet(`employee/employee-details`, { empId: user?._id });
  const theme = useTheme();

  useEffect(() => {
    if (emp?.data?.data) {
      const data = emp.data.data;
      setEmpDetails(data);
      setAvatar(data.avatar || '');
      setFormData({
        name: data.name || '',
        role: data.role || '',
        position: data.position || '',
        email: data.email || '',
        phone: data.phone || '',
        companyName: data.companyName || '',
        socialMedia: {
          twitter: data.socialMedia?.twitter || '',
          linkedin: data.socialMedia?.linkedin || '',
        },
      });
    }
  }, [emp]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        setIsUploaded(true);
        setIsEdit(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'twitter' || name === 'linkedin') {
      setFormData({
        ...formData,
        socialMedia: { ...formData.socialMedia, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      const updateData = { ...formData, employeeId: empDetails._id };
      await updateEmployee({ updateData });
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'active') return '#4caf50';
    return '#f44336';
  };

  if (empLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (empError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error fetching employee details: {empError.message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3, p: 0, fontFamily: "'Poppins', sans-serif", justifyContent: 'center' }}>
      {/* Single Card with Sidebar on Left */}
      <Paper
        elevation={4}
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: `0 4px 12px ${alpha(theme.palette.grey[400], 0.1)}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: `0 6px 16px ${alpha(theme.palette.grey[500], 0.2)}`,
          },
          display: 'flex',
          flexDirection: 'row',
          height: 'fit-content',
        }}
      >
        {/* Sidebar with Icons and Names */}
        <Box
          p={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            background: '#AABDAD',
            borderColor: 'rgba(30, 58, 138, 0.3)',
            hoverShadow: '0 8px 24px rgba(30, 58, 138, 0.4)',
            minWidth: '150px',
            textTransform: 'uppercase',
          }}
        >
          <Tooltip title="Basic Information">
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: alpha('#fff', 0.2),
                  '&:hover': { backgroundColor: alpha('#fff', 0.4) },
                  mr: 1,
                }}
              >
                <IconButton
                  onClick={() => setActiveSection('basic')}
                  sx={{ color: activeSection === 'basic' ? '#fff' : alpha('#fff', 0.7), p: 1, mb: 0.5 }}
                >
                  <BadgeIcon />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, color: '#fff', ml: 1, fontSize: 14 }}>
                Basic Info
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Personal Information">
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  ml:4,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: alpha('#fff', 0.2),
                  '&:hover': { backgroundColor: alpha('#fff', 0.4) },
                  mr: 1,
                }}
              >
                <IconButton
                  onClick={() => setActiveSection('personal')}
                  sx={{ color: activeSection === 'personal' ? '#fff' : alpha('#fff', 0.7), p: 0.5 }}
                >
                  <PersonIcon />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, color: '#fff', ml: 1, fontSize: 14 }}>
                Personal Info
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Bank Details">
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: alpha('#fff', 0.2),
                  '&:hover': { backgroundColor: alpha('#fff', 0.4) },
                  mr: 1,
                }}
              >
                <IconButton
                  onClick={() => setActiveSection('bank')}
                  sx={{ color: activeSection === 'bank' ? '#fff' : alpha('#fff', 0.7), p: 0.5 }}
                >
                  <AccountBalanceIcon />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, color: '#fff', ml: 1, fontSize: 14 }}>
                Bank Info
              </Typography>
            </Box>
          </Tooltip>
        </Box>

        {/* Vertical Divider */}
        <Divider orientation="vertical" flexItem sx={{ mx: 0 }} />

        {/* Employee Details Section */}
        <Box p={3} sx={{ flex: 3, position: 'relative' }}>
          <Grid container spacing={2} alignItems="center">
            {/* Avatar Section */}
            <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  mb: 2,
                  p: 1,
                  borderRadius: '50%',
                  background: alpha(theme.palette.primary.light, 0.2),
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                  }}
                  src={avatar}
                >
                  {empDetails.name?.charAt(0)?.toUpperCase() || 'N/A'}
                </Avatar>
                <Tooltip title="Upload photo">
                  <IconButton
                    component="label"
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                    {isEdit ? <UploadIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Chip
                label={empDetails.status?.toUpperCase() || 'N/A'}
                sx={{
                  fontWeight: 500,
                  color: '#fff',
                  backgroundColor: getStatusColor(empDetails.status),
                  borderRadius: '6px',
                }}
                size="small"
              />
            </Grid>

            {/* Details Section */}
            <Grid item xs={12} sm={9}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {empDetails.name || 'N/A'}
                </Typography>
                {(user.role === 'superAdmin' || user.role === 'Admin' || user.role === 'Manager' || user._id === empDetails._id) && (
                  <Tooltip title="Edit details">
                    <IconButton
                      onClick={handleEditClick}
                      size="small"
                      sx={{
                        color: theme.palette.primary.main,
                        backgroundColor: theme.palette.background.paper,
                        border: `2px solid ${theme.palette.primary.main}`,
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <AdminPanelSettingsIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {empDetails.role || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Position
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {empDetails.position || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {empDetails.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {empDetails.phone || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: "center" }}>
                      <BusinessIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Company
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {empDetails.companyName || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Social Media Links */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {empDetails.socialMedia?.twitter && (
                  <Tooltip title="Twitter">
                    <IconButton
                      component="a"
                      href={empDetails.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                        backgroundColor: theme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#f5f5f5', 0.8),
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? alpha('#000', 0.4) : alpha('#e0e0e0', 0.8),
                        },
                      }}
                    >
                      <XIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {empDetails.socialMedia?.linkedin && (
                  <Tooltip title="LinkedIn">
                    <IconButton
                      component="a"
                      href={empDetails.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{
                        color: '#0a66c2',
                        backgroundColor: alpha('#0a66c2', 0.1),
                        '&:hover': {
                          backgroundColor: alpha('#0a66c2', 0.2),
                        },
                      }}
                    >
                      <LinkedInIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Dynamic Section using BasicDetail */}
      <Box sx={{ mt: 2 }}>
        <BasicDetail empDetails={empDetails} activeSection={activeSection} />
      </Box>

      {/* Edit Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[4],
            width: '100%',
            maxWidth: 550,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 2,
            px: 3,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Employee Details
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              { label: 'Name', name: 'name' },
              { label: 'Role', name: 'role' },
              { label: 'Position', name: 'position' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Phone', name: 'phone' },
              { label: 'Company Name', name: 'companyName' },
              { label: 'Twitter', name: 'twitter', value: formData.socialMedia?.twitter },
              { label: 'LinkedIn', name: 'linkedin', value: formData.socialMedia?.linkedin },
            ].map((field) => (
              <Grid item xs={12} sm={field.name === 'email' ? 12 : 6} key={field.name}>
                <TextField
                  fullWidth
                  label={field.label}
                  name={field.name}
                  type={field.type || 'text'}
                  value={field.value !== undefined ? field.value : formData[field.name] || ''}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.background.paper, 0.7),
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              borderColor: alpha(theme.palette.text.primary, 0.2),
              color: theme.palette.text.primary,
              px: 3,
              '&:hover': {
                borderColor: alpha(theme.palette.text.primary, 0.3),
                backgroundColor: alpha(theme.palette.text.primary, 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1.5,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmpDetails;