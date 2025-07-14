import {
  Box,
  Grid,
  Typography,
  Paper,
  TextField,
  Divider,
  useTheme,
  Fade,
  InputAdornment,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Person, Email as EmailIcon, Phone, Home, Edit } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useGet, usePost } from '../../hooks/useApi'; // Adjust path as needed
import { useAuth } from '../../middlewares/auth'; // Adjust path as needed

function BasicInfoTab() {
  const theme = useTheme();
  const { user } = useAuth();
  const { data: emp, error: empError, isLoading: empLoading, refetch } = useGet('employee/employee-details', {
    empId: user?._id,
  });
  const { mutateAsync: updateEmployee } = usePost('employee/update');

  // Initialize basicInfo state with default values
  const [basicInfo, setBasicInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
  });
  const [isEditing, setIsEditing] = useState(false); // Track edit mode

  // Update basicInfo when API data is fetched
  useEffect(() => {
    if (emp?.data?.data) {
      const data = emp.data.data;
      setBasicInfo({
        fullName: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        street: data.address?.street || '',
      });
    }
  }, [emp]);

  // Handle changes to form fields
  const handleBasicInfoChange = (field) => (event) => {
    setBasicInfo((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing((prev) => !prev); // Toggle edit mode
  };

  // Handle form submission to update employee data
  const handleSubmit = async () => {
    try {
      const updateData = {
        employeeId: emp?.data?.data?._id,
        name: basicInfo.fullName,
        email: basicInfo.email,
        phone: basicInfo.phone,
        address: {
          ...emp?.data?.data?.address, // Preserve other address fields
          street: basicInfo.street,
        },
      };
      await updateEmployee({ updateData });
      setIsEditing(false); // Exit edit mode after saving
      refetch(); // Refresh data after update
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  // Handle loading state
  if (empLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Handle error state
  if (empError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error fetching employee details: {empError.message}</Typography>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: `0 8px 32px ${theme.palette.grey[300]}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 48px ${theme.palette.grey[400]}`,
          },
          maxWidth: 800,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          position: 'relative', // For positioning the edit button
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.primary.dark,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            Basic Information
          </Typography>
        </Box>
        {(user?.role === 'superAdmin' || user?.role === 'admin' || user?.role === 'Manager' || user?._id === emp?.data?.data?._id) && (
          <Tooltip title={isEditing ? 'Cancel Edit' : 'Edit Details'} arrow>
            <IconButton
              onClick={handleEditClick}
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(69, 114, 237, 0.1)' : 'rgba(209, 105, 178, 0.1)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? 'rgba(69, 114, 237, 0.2)' : 'rgba(209, 105, 178, 0.2)',
                  transform: 'scale(1.1)',
                },
                position: 'absolute',
                top: 20,
                right: 20,
                transition: 'all 0.3s',
              }}
            >
              <Edit sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        )}
        <Divider
          sx={{
            mb: 3,
            borderColor: theme.palette.primary.light,
            borderWidth: 1,
          }}
        />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={basicInfo.fullName}
              onChange={handleBasicInfoChange('fullName')}
              variant="outlined"
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.background.paper,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.grey[50],
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 4px ${theme.palette.primary.light}20`,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={basicInfo.email}
              onChange={handleBasicInfoChange('email')}
              variant="outlined"
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.background.paper,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.grey[50],
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 4px ${theme.palette.primary.light}20`,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={basicInfo.phone}
              onChange={handleBasicInfoChange('phone')}
              variant="outlined"
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.background.paper,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.grey[50],
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 4px ${theme.palette.primary.light}20`,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Street Address"
              value={basicInfo.street}
              onChange={handleBasicInfoChange('street')}
              variant="outlined"
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.background.paper,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.grey[50],
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 4px ${theme.palette.primary.light}20`,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                },
              }}
            />
          </Grid>
        </Grid>
        {isEditing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: theme.palette.primary.main,
                padding: '8px 20px',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s',
              }}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Paper>
    </Fade>
  );
}

export default BasicInfoTab;