import React, { useEffect, useState } from 'react';
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
  Zoom,
  Stack
} from '@mui/material';
import { Edit, AccountBalance, Close } from '@mui/icons-material';
import { useGet, usePost } from '../../hooks/useApi';
import { useAuth } from '../../middlewares/auth';
import ProfileNav from "../../components/user/profiveNav";

function BankDetails() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [empDetails, setEmpDetails] = useState({});
  const [formData, setFormData] = useState({ ...empDetails });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();
  const id = user?._id;
  const { data: emp, isLoading: empLoading, refetch } = useGet('employee/employee-details', { empId: user?._id });
  
  useEffect(() => {
    if (emp?.data?.data) {
      setEmpDetails(emp.data.data);
      setFormData({ ...emp.data.data });
    }
  }, [emp]);

  const { mutateAsync: updateEmployee } = usePost("employee/update");

  const handleOpen = () => {
    setOpen(true);
    setFormData({ ...empDetails });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      bankDetails: { 
        ...formData.bankDetails, 
        [e.target.name]: e.target.value 
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updateData = {
        employeeId: empDetails?._id,
        bankDetails: {
          bankName: formData.bankDetails?.bankName,
          accountNumber: formData.bankDetails?.accountNumber,
          ifscCode: formData.bankDetails?.ifscCode,
          branch: formData.bankDetails?.branch
        }
      };
      await updateEmployee({ updateData });
      refetch();
      handleClose();
    } catch (error) {
      console.error("Error updating bank details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canViewSensitive = user?.role === "superAdmin" || user?.role === "admin" || user?.role === "Manager" || id == user?._id;

  const maskSensitiveInfo = (info) => {
    return canViewSensitive ? info : '••••••';
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} container justifyContent="flex-end">
        <ProfileNav />
      </Grid>
      <Grid item xs={12}>
        <Paper 
          elevation={6}
          sx={{
            width: '100%',
            borderRadius: '20px',
            padding: '32px',
            backgroundColor: theme.palette.background.paper,
            height: '65vh',
            overflow: 'auto',
            borderTop: `4px solid ${theme.palette.primary.main}`,
            position: 'relative',
            boxShadow: `0 8px 24px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'}`,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: theme.shadows[10]
            }
          }}
        >
          {empLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress color="primary" size={60} thickness={4} />
            </Box>
          ) : (
            <Fade in={!empLoading} timeout={500}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 1.5
                    }}
                  >
                    <AccountBalance fontSize="large" /> Bank Details
                  </Typography>
                  {(user?.role === "superAdmin" || id == user?._id || user?.role === "admin" || user?.role === "Manager") && (
                    <Tooltip title="Edit Bank Details" arrow>
                      <IconButton 
                        onClick={handleOpen} 
                        sx={{ 
                          color: theme.palette.primary.main,
                          backgroundColor: theme.palette.mode === 'light' 
                            ? 'rgba(69, 114, 237, 0.1)' 
                            : 'rgba(209, 105, 178, 0.1)',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'light' 
                              ? 'rgba(69, 114, 237, 0.2)' 
                              : 'rgba(209, 105, 178, 0.2)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s'
                        }}
                      >
                        <Edit sx={{ fontSize: 28 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Grid container spacing={3}>
                  {['bankName', 'accountNumber', 'ifscCode', 'branch'].map((field) => (
                    <Grid item xs={12} sm={6} md={3} key={field}>
                      <Chip 
                        label={`${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}: ${maskSensitiveInfo(empDetails?.bankDetails?.[field] || 'Not Available')}`}
                        sx={{ 
                          backgroundColor: theme.palette.mode === 'light' ? '#e3f2fd' : '#1e1e2f',
                          borderRadius: '12px',
                          fontWeight: 500,
                          width: '100%',
                          justifyContent: 'flex-start',
                          height: 'auto',
                          padding: '12px 16px',
                          '& .MuiChip-label': {
                            whiteSpace: 'normal',
                            padding: 0
                          },
                          transition: 'background-color 0.3s',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'light' ? '#bbdefb' : '#2e2e44'
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>
          )}
        </Paper>
      </Grid>

      {/* Dialog for Editing Bank Details */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Zoom}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          Edit Bank Details
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Stack spacing={3}>
            <TextField
              name="bankName"
              label="Bank Name"
              fullWidth
              value={formData.bankDetails?.bankName || ''}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#1e1e2f'
                }
              }}
            />
            <TextField
              name="accountNumber"
              label="Account Number"
              fullWidth
              value={formData.bankDetails?.accountNumber || ''}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#1e1e2f'
                }
              }}
            />
            <TextField
              name="ifscCode"
              label="IFSC Code"
              fullWidth
              value={formData.bankDetails?.ifscCode || ''}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#1e1e2f'
                }
              }}
            />
            <TextField
              name="branch"
              label="Branch"
              fullWidth
              value={formData.bankDetails?.branch || ''}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#1e1e2f'
                }
              }}
            />
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
                backgroundColor: theme.palette.grey[100]
              }
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
              backgroundColor: theme.palette.primary.main,
              padding: '8px 20px',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s'
            }}
          >
            {isSubmitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default BankDetails;