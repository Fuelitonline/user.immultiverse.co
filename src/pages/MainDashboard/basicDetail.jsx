import {
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
  CircularProgress,
  Chip,
  Paper,
  useTheme,
  Tooltip,
  Fade,
  Stack,
  alpha
} from '@mui/material';
import React, { useState } from 'react';
import { Edit, Event, Work, Person, LocationOn, Badge, AccountBalance, Close, Numbers, VpnKey, LocationCity } from '@mui/icons-material';
import { usePost } from '../../hooks/useApi';
import { useAuth } from '../../middlewares/auth';

function BasicDetail({ empDetails, activeSection }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    dob: empDetails?.dob ? new Date(empDetails.dob).toISOString().split('T')[0] : '',
    street: empDetails?.address?.street || '',
    city: empDetails?.address?.city || '',
    state: empDetails?.address?.state || '',
    country: empDetails?.address?.country || '',
    zip: empDetails?.address?.zip || '',
  });
  const [newFiles, setNewFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();
  const { mutateAsync: updateEmployee } = usePost('employee/update');

  const getDateDifference = (startDate) => {
    if (!startDate) return { years: 0, months: 0 };
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return { years: 0, months: 0 };
      const end = new Date();
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();

      if (days < 0) {
        months -= 1;
        const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += lastMonth.getDate();
      }

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      return { years, months };
    } catch {
      return { years: 0, months: 0 };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Available';
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return 'Not Available';
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setFormData({
      dob: empDetails?.dob ? new Date(empDetails.dob).toISOString().split('T')[0] : '',
      street: empDetails?.address?.street || '',
      city: empDetails?.address?.city || '',
      state: empDetails?.address?.state || '',
      country: empDetails?.address?.country || '',
      zip: empDetails?.address?.zip || '',
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewFiles([...newFiles, ...Array.from(e.target.files)]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updateData = {
        employeeId: empDetails?._id,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
        address: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
          street: formData.street,
          zip: formData.zip,
        },
      };
      await updateEmployee({ updateData });
      handleClose();
    } catch (error) {
      console.error('Error updating employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canViewSensitive = user?.role === 'superAdmin' || user?.role === 'admin' || user?.role === 'Manager' || user?._id === empDetails?._id;

  const maskSensitiveInfo = (info) => {
    return canViewSensitive ? info || 'Not Available' : '••••••';
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontFamily: "'Poppins', sans-serif",
                padding: '10px 20px',
                borderBottom: `2px solid #2c3e50`,
                display: 'inline-block',
              }}
            >
              BASIC INFORMATION
            </Typography>
            <Grid container spacing={3} sx={{ mt: 3, mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<Event />}
                  label="Join Date"
                  value={maskSensitiveInfo(formatDate(empDetails?.joiningDate))}
                  theme={theme}
                  gradient="linear-gradient(135deg, #6D8299 0%, #3498DB 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<Work />}
                  label="Experience"
                  value={maskSensitiveInfo(
                    `${getDateDifference(empDetails?.joiningDate).years} yrs, ${getDateDifference(empDetails?.joiningDate).months} mos`
                  )}
                  theme={theme}
                  gradient="linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<Person />}
                  label="Employee ID"
                  value={maskSensitiveInfo(empDetails?.empId || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 'personal':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontFamily: '"Roboto", sans-serif',
                padding: '10px 20px',
                borderBottom: `2px solid #2c3e50`,
                display: 'inline-block',
              }}
            >
              PERSONAL INFORMATION
            </Typography>
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<Event />}
                  label="Date of Birth"
                  value={formatDate(empDetails?.dob)}
                  theme={theme}
                  gradient="linear-gradient(135deg, #8A6D99 0%, #6A4A8A 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: '16px',
                    backgroundColor: theme.palette.background.paper,
                    backdropFilter: 'blur(5px)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontFamily: '"Roboto", sans-serif',
                    }}
                  >
                    <LocationOn /> Address
                  </Typography>
                  <Grid container spacing={2}>
                    {['street', 'city', 'state', 'country', 'zip'].map((field) => (
                      <Grid item xs={12} sm={field === 'street' ? 12 : 6} key={field}>
                        <Chip
                          label={`${field.charAt(0).toUpperCase() + field.slice(1)}: ${empDetails?.address?.[field] || 'Not Available'}`}
                          sx={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            fontWeight: 500,
                            width: '100%',
                            justifyContent: 'flex-start',
                            height: 'auto',
                            padding: '10px 12px',
                            '& .MuiChip-label': {
                              whiteSpace: 'normal',
                              padding: 0,
                              fontFamily: '"Roboto", sans-serif',
                            },
                            transition: 'background-color 0.3s',
                            '&:hover': {
                              backgroundColor: '#e3f2fd',
                            },
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case 'bank':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontFamily: '"Roboto", sans-serif',
                padding: '10px 20px',
                borderBottom: `2px solid #2c3e50`,
                display: 'inline-block',
              }}
            >
              BANK DETAILS
            </Typography>
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  icon={<AccountBalance />}
                  label="Bank Name"
                  value={maskSensitiveInfo(empDetails?.bankDetails?.bankName || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #6D9982 0%, #4A8A6D 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  icon={<Numbers />}
                  label="Account Number"
                  value={maskSensitiveInfo(empDetails?.bankDetails?.accountNumber || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  icon={<VpnKey />}
                  label="IFSC Code"
                  value={maskSensitiveInfo(empDetails?.bankDetails?.ifscCode || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  icon={<LocationCity />}
                  label="Branch"
                  value={maskSensitiveInfo(empDetails?.bankDetails?.branch || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #E67E22 0%, #F39C12 100%)"
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        width: '100%',
        borderRadius: '20px',
        padding: '32px',
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: theme.palette.background.paper,
        height: 'auto',
        overflow: 'auto',
        borderTop: `6px solid #2c3e50`,
        position: 'relative',
        boxShadow: `0 10px 30px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'}`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[12],
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        },
      }}
    >
      {Object.keys(empDetails).length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress color="primary" size={60} thickness={4} />
        </Box>
      ) : (
        <Fade in={Object.keys(empDetails).length > 0} timeout={500}>
          <Box>{renderSection()}</Box>
        </Fade>
      )}
      {(user?.role === 'superAdmin' || user?._id === empDetails?._id || user?.role === 'admin' || user?.role === 'Manager') && (
        <Tooltip title="Edit Details" arrow>
          <IconButton
            onClick={handleOpen}
            sx={{
              color: '#fff',
              backgroundColor: '#2c3e50',
              '&:hover': {
                backgroundColor: '#34495e',
                transform: 'scale(1.1)',
              },
              position: 'absolute',
              top: 20,
              right: 20,
              transition: 'all 0.3s',
              borderRadius: '50%',
              padding: '8px',
            }}
          >
            <Edit sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[10],
            background: theme.palette.mode === 'light' ? '#fff' : '#1a1a2e',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#2c3e50',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            fontFamily: '"Roboto", sans-serif',
          }}
        >
          Edit Employee Details
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              name="dob"
              label="Date of Birth"
              type="date"
              fullWidth
              value={formData.dob || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true, sx: { fontFamily: '"Roboto", sans-serif' } }}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                },
                '& .MuiInputBase-input': {
                  fontFamily: '"Roboto", sans-serif',
                },
              }}
            />
            <Typography
              variant="h6"
              fontWeight={600}
              color={theme.palette.text.primary}
              sx={{ fontFamily: '"Roboto", sans-serif' }}
            >
              Address Information
            </Typography>
            <TextField
              name="street"
              label="Street"
              fullWidth
              value={formData.street || ''}
              onChange={handleChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                },
                '& .MuiInputBase-input': {
                  fontFamily: '"Roboto", sans-serif',
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Roboto", sans-serif',
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="city"
                  label="City"
                  fullWidth
                  value={formData.city || ''}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="state"
                  label="State"
                  fullWidth
                  value={formData.state || ''}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="country"
                  label="Country"
                  fullWidth
                  value={formData.country || ''}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="zip"
                  label="Zip Code"
                  fullWidth
                  value={formData.zip || ''}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: theme.palette.grey[400],
              color: theme.palette.text.primary,
              padding: '8px 20px',
              '&:hover': {
                borderColor: theme.palette.grey[600],
                backgroundColor: theme.palette.grey[100],
              },
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#2c3e50',
              padding: '8px 20px',
              '&:hover': {
                backgroundColor: '#34495e',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s',
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            {isSubmitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

const InfoCard = ({ icon, label, value, theme, gradient }) => (
  <Paper
    elevation={6}
    sx={{
      p: 3,
      borderRadius: '16px',
      background: '#ffffff',
      backdropFilter: 'blur(10px)',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      textAlign: 'left',
      transition: 'transform 0.3s, box-shadow 0.3s, background 0.3s',
      '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: theme.shadows[10],
        background: '#053E0E',
        '& .MuiTypography-root': {
          color: '#ffffff', // Text color to white on hover
        },
        '& .MuiSvgIcon-root': {
          color: '#ffffff', // Icon color to white on hover
        },
      },
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 500,
          color: theme.palette.text.primary,
          mb: 1,
          textTransform: 'uppercase',
          fontFamily: '"Roboto", sans-serif',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          color: theme.palette.text.primary,
          fontFamily: '"Roboto", sans-serif',
          fontWeight: 400,
        }}
      >
        {value}
      </Typography>
    </Box>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: alpha(theme.palette.text.primary, 0.2),
        '&:hover': {
          backgroundColor: alpha(theme.palette.text.primary, 0.4),
        },
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 24, color: theme.palette.text.primary } })}
    </Box>
  </Paper>
);

export default BasicDetail;