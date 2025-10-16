import {
  Box,
  Grid,
  Typography,
  Paper,
  TextField,
  Divider,
  Fade,
  InputAdornment,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Person, Email as EmailIcon, Phone, Home, Edit, Save, Close, Info  } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useGet, usePost } from '../../hooks/useApi';
import { useAuth } from '../../middlewares/auth';

function BasicInfoTab() {
  const { user } = useAuth();
  const { data: emp, error: empError, isLoading: empLoading, refetch } = useGet('employee/employee-details', {
    empId: user?._id,
  });
  const { mutateAsync: updateEmployee } = usePost('employee/update');

  const [basicInfo, setBasicInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
  });
  const [isEditing, setIsEditing] = useState(false);

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

  const handleBasicInfoChange = (field) => (event) => {
    setBasicInfo((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = async () => {
    try {
      const updateData = {
        employeeId: emp?.data?.data?._id,
        name: basicInfo.fullName,
        email: basicInfo.email,
        phone: basicInfo.phone,
        address: {
          ...emp?.data?.data?.address,
          street: basicInfo.street,
        },
      };
      await updateEmployee({ updateData });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  if (empLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress sx={{ color: '#2563eb' }} size={48} />
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
    <Fade in={true} timeout={600}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '24px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Info sx={{ color: '#2563eb', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#1e293b',
                  fontWeight: 700,
                  letterSpacing: -0.5,
                }}
              >
                Basic Information
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Your personal details
              </Typography>
            </Box>
          </Box>
          {(user?.role === 'superAdmin' || user?.role === 'admin' || user?.role === 'Manager' || user?._id === emp?.data?.data?._id) && (
            <Tooltip title={isEditing ? 'Cancel Edit' : 'Edit Details'} arrow placement="left">
              <IconButton
                onClick={handleEditClick}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: isEditing ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  color: isEditing ? '#dc2626' : '#2563eb',
                  transition: 'all 0.3s',
                  '&:hover': {
                    background: isEditing ? 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {isEditing ? <Close sx={{ fontSize: 22 }} /> : <Edit sx={{ fontSize: 22 }} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ mb: 4, borderColor: '#e2e8f0' }} />

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
                    <Person sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  background: '#ffffff',
                  transition: 'all 0.3s',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#60a5fa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-disabled': {
                    background: '#f8fafc',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                  }
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
                    <EmailIcon sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  background: '#ffffff',
                  transition: 'all 0.3s',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#60a5fa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-disabled': {
                    background: '#f8fafc',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                  }
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
                    <Phone sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  background: '#ffffff',
                  transition: 'all 0.3s',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#60a5fa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-disabled': {
                    background: '#f8fafc',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                  }
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
                    <Home sx={{ color: '#2563eb' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  background: '#ffffff',
                  transition: 'all 0.3s',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#60a5fa',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)',
                  },
                  '&.Mui-disabled': {
                    background: '#f8fafc',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: '#2563eb',
                  }
                },
              }}
            />
          </Grid>
        </Grid>

        {isEditing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
            <Button
              variant="outlined"
              onClick={handleEditClick}
              startIcon={<Close />}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 3,
                py: 1.25,
                borderWidth: '2px',
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': {
                  borderWidth: '2px',
                  borderColor: '#cbd5e1',
                  background: '#f8fafc',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<Save />}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 3,
                py: 1.25,
                background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)',
                  boxShadow: '0 12px 32px rgba(37, 99, 235, 0.4)',
                  transform: 'translateY(-2px)',
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