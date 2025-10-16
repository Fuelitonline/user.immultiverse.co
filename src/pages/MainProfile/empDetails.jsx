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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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
      {/* Upper Section: Employee Details */}
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
          p: 3,
        }}
      >
        <BasicDetail empDetails={empDetails} />
      </Paper>

      {/* Lower Section: Sidebar + Dynamic Content */}
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
          minHeight: '400px',
          position: 'relative',
        }}
      >
        {/* Sidebar with Icons and Names */}
        <Box
          p={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start', // Top se start karne ke liye
            alignItems: 'center',
            gap: 2,
            borderColor: 'rgba(30, 58, 138, 0.3)',
            minWidth: '150px',
            textTransform: 'uppercase',
          }}
        >
          {[
            { title: 'Basic Info', icon: <BadgeIcon />, section: 'basic' },
            { title: 'Personal Info', icon: <PersonIcon />, section: 'personal' },
            { title: 'Bank Info', icon: <AccountBalanceIcon />, section: 'bank' },
            { title: 'Salary Info', icon: <AttachMoneyIcon />, section: 'salary' },
          ].map((item) => (
            <Tooltip title={item.title} key={item.section}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  padding: '5px 9px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: activeSection === item.section ? 'var(--background-bg-2)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => setActiveSection(item.section)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: alpha('#fff', activeSection === item.section ? 0.4 : 0.2),
                    '&:hover': { backgroundColor: alpha('#fff', 0.5) },
                    mr: 2,
                  }}
                >
                  <IconButton
                    sx={{
                      color: activeSection === item.section ? alpha('#fff', 0.7) : 'rgb(176, 176, 176)',
                      p: 1,
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    color: activeSection === item.section ? alpha('#fff', 0.9) : 'rgb(176, 176, 176)',
                    fontSize: 14,
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* Vertical Divider */}
        <Divider orientation="vertical" flexItem sx={{ mx: 0 }} />

        {/* Right Side: Dynamic Content (no details) */}
        <Box sx={{ flex: 3, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <BasicDetail empDetails={empDetails} activeSection={activeSection} showDetails={false} showTitle={true} />
        </Box>
      </Paper>

      {/* Edit Modal - Same rahega, but handleEditClick ko BasicDetail mein move kiya gaya hai, yeh ab unused, remove if needed */}
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