import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Container,
  Paper,
  Divider,
  Chip,
  Avatar,
  Stack,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AccountBalance as BankIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  CreditCard as CardIcon,
  Tag as TagIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Mock API hooks (replace with your actual hooks)
import { useGet, usePost, useDelete } from '../../hooks/useApi';

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),

  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  },
}));

const HeaderCard = styled(Card)(({ theme }) => ({

  borderRadius: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const AdminBankSettings = () => {
  // API hooks
  const { data: bankAccountsData, refetch: refetchBankAccounts, isLoading: bankAccountsLoading } = 
    useGet('integrations/bank-accounts/active', {}, {}, { queryKey: 'bankAccounts' });
  
  const { data: servicesData, refetch: refetchServices, isLoading: servicesLoading } = 
    useGet('integrations/services/active', {}, {}, { queryKey: 'services' });

  const addBankAccountMutation = usePost('/integrations/bank-accounts');
  const removeBankAccountMutation = usePost('/integrations/bank-accounts/delete');
  const addServiceMutation = usePost('/integrations/services');
  const removeServiceMutation = useDelete('/integrations/services');

  // Local state
  const [bankAccounts, setBankAccounts] = useState([]);
  const [services, setServices] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  // Update local state when API data changes
  useEffect(() => {
    if (bankAccountsData?.data) {

      setBankAccounts(bankAccountsData?.data?.data || []);
            console.log('Bank accounts data:', bankAccounts);
    }
  }, [bankAccountsData]);

  useEffect(() => {
    if (servicesData?.data) {
      setServices(servicesData.data?.data || []);
    }
  }, [servicesData]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  // Clear validation errors when field is updated
  const clearFieldError = (itemType, itemId, fieldName) => {
    const errorKey = `${itemType}_${itemId}_${fieldName}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  };

  // Parse backend validation errors
  const parseValidationErrors = (error, itemType, itemId) => {
    const errorData = error?.response?.data;
    if (!errorData || !errorData.errors) return;

    const newFieldErrors = {};
    
    // Map common validation error patterns to fields
    errorData.errors.forEach(errorMessage => {
      const lowerError = errorMessage.toLowerCase();
      
      if (itemType === 'bankAccount') {
        if (lowerError.includes('account number')) {
          newFieldErrors[`${itemType}_${itemId}_accountNumber`] = errorMessage;
        } else if (lowerError.includes('ifsc')) {
          newFieldErrors[`${itemType}_${itemId}_ifscCode`] = errorMessage;
        } else if (lowerError.includes('account name')) {
          newFieldErrors[`${itemType}_${itemId}_accountName`] = errorMessage;
        } else if (lowerError.includes('bank name')) {
          newFieldErrors[`${itemType}_${itemId}_bankName`] = errorMessage;
        } else if (lowerError.includes('branch')) {
          newFieldErrors[`${itemType}_${itemId}_branchName`] = errorMessage;
        } else {
          // Generic error for the item
          newFieldErrors[`${itemType}_${itemId}_general`] = errorMessage;
        }
      } else if (itemType === 'service') {
        if (lowerError.includes('service name')) {
          newFieldErrors[`${itemType}_${itemId}_serviceName`] = errorMessage;
        } else if (lowerError.includes('hsn')) {
          newFieldErrors[`${itemType}_${itemId}_hsnCode`] = errorMessage;
        } else {
          newFieldErrors[`${itemType}_${itemId}_general`] = errorMessage;
        }
      }
    });

    setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
    
    // Show general error message
    showNotification(errorData.message || 'Validation failed', 'error');
  };

  // Bank Account Functions
  const addBankAccount = async () => {
    try {
      setIsSubmitting(true);
      const newAccount = {
        id: Date.now(),
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branchName: '',
        isNew: true
      };

      setBankAccounts(prev => [...prev, newAccount]);
      showNotification('New bank account form added. Fill details and save.', 'info');
    } catch (error) {
      showNotification('Failed to add bank account form. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeBankAccount = async (accountId) => {
    try {
      setIsSubmitting(true);
      const account = bankAccounts.find(acc => acc.id === accountId);
      
      // Clear any field errors for this account
      const updatedFieldErrors = { ...fieldErrors };
      Object.keys(updatedFieldErrors).forEach(key => {
        if (key.startsWith(`bankAccount_${accountId}_`)) {
          delete updatedFieldErrors[key];
        }
      });
      setFieldErrors(updatedFieldErrors);
      
      if (account?.isNew) {
        setBankAccounts(prev => prev.filter(acc => acc._id !== accountId));
        showNotification('Bank account form removed.', 'success');
      } else {
        const params = { accountId };
        const response = await removeBankAccountMutation.mutateAsync(params);
        if (response?.success) {
          await refetchBankAccounts();
          showNotification('Bank account removed successfully!', 'success');
        } else {
          throw new Error('Failed to remove account');
        }
      }
    } catch (error) {
      console.error('Error removing bank account:', error);
      showNotification('Failed to remove bank account. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBankAccount = (accountId, field, value) => {
    setBankAccounts(prev => prev.map(acc => 
      acc.id === accountId ? { ...acc, [field]: value } : acc
    ));
    
    // Clear field error when user starts typing
    clearFieldError('bankAccount', accountId, field);
  };

  // Service Functions
  const addService = async () => {
    try {
      setIsSubmitting(true);
      const newService = {
        id: Date.now(),
        serviceName: '',
        hsnCode: '',
        isNew: true
      };

      setServices(prev => [...prev, newService]);
      showNotification('New service form added. Fill details and save.', 'info');
    } catch (error) {
      showNotification('Failed to add service form. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeService = async (serviceId) => {
    try {
      setIsSubmitting(true);
      const service = services.find(svc => svc.id === serviceId);
      
      // Clear any field errors for this service
      const updatedFieldErrors = { ...fieldErrors };
      Object.keys(updatedFieldErrors).forEach(key => {
        if (key.startsWith(`service_${serviceId}_`)) {
          delete updatedFieldErrors[key];
        }
      });
      setFieldErrors(updatedFieldErrors);
      
      if (service?.isNew) {
        setServices(prev => prev.filter(svc => svc.id !== serviceId));
        showNotification('Service form removed.', 'success');
      } else {
        const response = await removeServiceMutation.mutateAsync(serviceId);
        if (response?.success) {
          await refetchServices();
          showNotification('Service removed successfully!', 'success');
        } else {
          throw new Error('Failed to remove service');
        }
      }
    } catch (error) {
      console.error('Error removing service:', error);
      showNotification('Failed to remove service. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateService = (serviceId, field, value) => {
    setServices(prev => prev.map(service =>
      service.id === serviceId ? { ...service, [field]: value } : service
    ));
    
    // Clear field error when user starts typing
    clearFieldError('service', serviceId, field);
  };

  const validateBankAccount = (account) => {
    const errors = [];
    if (!account.accountName?.trim()) errors.push('Account Name is required');
    if (!account.accountNumber?.trim()) errors.push('Account Number is required');
    if (!account.bankName?.trim()) errors.push('Bank Name is required');
    if (!account.ifscCode?.trim()) errors.push('IFSC Code is required');
    if (!account.branchName?.trim()) errors.push('Branch Name is required');
    return errors;
  };

  const validateService = (service) => {
    const errors = [];
    if (!service.serviceName?.trim()) errors.push('Service Name is required');
    if (!service.hsnCode?.trim()) errors.push('HSN Code is required');
    return errors;
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setFieldErrors({}); // Clear previous errors
      
      // Validate all items
      const bankAccountErrors = [];
      const serviceErrors = [];
      
      bankAccounts.forEach(account => {
        const errors = validateBankAccount(account);
        if (errors.length > 0) {
          bankAccountErrors.push(`Account ${account.id}: ${errors.join(', ')}`);
        }
      });
      
      services.forEach(service => {
        const errors = validateService(service);
        if (errors.length > 0) {
          serviceErrors.push(`Service ${service.id}: ${errors.join(', ')}`);
        }
      });
      
      if (bankAccountErrors.length > 0 || serviceErrors.length > 0) {
        const allErrors = [...bankAccountErrors, ...serviceErrors];
        showNotification(`Validation errors: ${allErrors.join('; ')}`, 'error');
        return;
      }

      // Save new bank accounts
      const newBankAccounts = bankAccounts.filter(account => account.isNew);
      const bankAccountPromises = newBankAccounts.map(async (account) => {
        try {
          const { id, isNew, ...accountData } = account;
          const newD = await addBankAccountMutation.mutateAsync(accountData);
          console.log('New bank account added:', newD);
        } catch (error) {
          parseValidationErrors(error, 'bankAccount', account.id);
          throw error;
        }
      });
      
      // Save new services
      const newServices = services.filter(service => service.isNew);
      const servicePromises = newServices.map(async (service) => {
        try {
          const { id, isNew, ...serviceData } = service;
          return await addServiceMutation.mutateAsync(serviceData);
        } catch (error) {
          parseValidationErrors(error, 'service', service.id);
          throw error;
        }
      });

      await Promise.all([...bankAccountPromises, ...servicePromises]);
      
      showNotification('All changes saved successfully!', 'success');
      setFieldErrors({}); // Clear all errors on success
      
      // Refetch data to get updated information
      await Promise.all([refetchBankAccounts(), refetchServices()]);
    } catch (error) {
      console.error('Error saving changes:', error);
      // Error handling is done in individual promises above
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get field error
  const getFieldError = (itemType, itemId, fieldName) => {
    return fieldErrors[`${itemType}_${itemId}_${fieldName}`];
  };

  // Helper function to check if field has error
  const hasFieldError = (itemType, itemId, fieldName) => {
    return !!getFieldError(itemType, itemId, fieldName);
  };

  // Show loading state
  if (bankAccountsLoading || servicesLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const hasUnsavedChanges = bankAccounts.some(acc => acc.isNew) || services.some(svc => svc.isNew);

  return (
    <Box sx={{ 
      minHeight: '120lvh', 

    }}>
      <Container width="100%" >
        {/* Header */}
        <HeaderCard b>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  Admin Settings
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage bank accounts and services
                </Typography>
                {hasUnsavedChanges && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                    You have unsaved changes
                  </Typography>
                )}
              </Box>
              <Fab
                variant="extended"
                color="success"
                onClick={handleSave}
                disabled={isSubmitting || !hasUnsavedChanges}
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  background: hasUnsavedChanges 
                    ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                    : 'rgba(0,0,0,0.12)',
                  '&:hover': {
                    background: hasUnsavedChanges
                      ? 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                      : 'rgba(0,0,0,0.12)',
                  }
                }}
              >
                {isSubmitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : <SaveIcon sx={{ mr: 1 }} />}
                Save All Changes
              </Fab>
            </Box>
          </CardContent>
        </HeaderCard>

        <Grid container spacing={4}>
          {/* Bank Accounts Section */}
          <Grid item xs={12} lg={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: 56, 
                      height: 56,
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                    }}>
                      <BankIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        Bank Accounts
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage banking information ({bankAccounts.length} accounts)
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addBankAccount}
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      }
                    }}
                  >
                    Add Account
                  </Button>
                </Box>

                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                  <Stack spacing={3}>
                    {bankAccounts?.map((account) => (
                      <Paper 
                        key={account._id} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: account.isNew ? 'warning.main' : 'divider',
                          background: account.isNew 
                            ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                            : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              icon={<CardIcon />}
                              label={account.isNew ? 'New Account' : `Account #${account._id}`}
                              color={account.isNew ? 'warning' : 'primary'}
                              variant="outlined"
                            />
                          </Box>
                          <IconButton
                            onClick={() => removeBankAccount(account._id)}
                            color="error"
                            size="small"
                            disabled={isSubmitting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        {/* Show general error for this account */}
                        {getFieldError('bankAccount', account.id, 'general') && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {getFieldError('bankAccount', account.id, 'general')}
                          </Alert>
                        )}

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Account Name"
                              value={account.accountName || ''}
                              onChange={(e) => updateBankAccount(account.id, 'accountName', e.target.value)}
                              variant="outlined"
                              size="small"
                              required
                              error={hasFieldError('bankAccount', account.id, 'accountName')}
                              helperText={getFieldError('bankAccount', account.id, 'accountName')}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Account Number"
                              value={account.accountNumber || ''}
                              onChange={(e) => updateBankAccount(account.id, 'accountNumber', e.target.value)}
                              variant="outlined"
                              size="small"
                              required
                              error={hasFieldError('bankAccount', account.id, 'accountNumber')}
                              helperText={getFieldError('bankAccount', account.id, 'accountNumber')}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Bank Name"
                              value={account.bankName || ''}
                              onChange={(e) => updateBankAccount(account.id, 'bankName', e.target.value)}
                              variant="outlined"
                              size="small"
                              required
                              error={hasFieldError('bankAccount', account.id, 'bankName')}
                              helperText={getFieldError('bankAccount', account.id, 'bankName')}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="IFSC Code"
                              value={account.ifscCode || ''}
                              onChange={(e) => updateBankAccount(account.id, 'ifscCode', e.target.value)}
                              variant="outlined"
                              size="small"
                              required
                              error={hasFieldError('bankAccount', account.id, 'ifscCode')}
                              helperText={getFieldError('bankAccount', account.id, 'ifscCode')}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Branch Name"
                              value={account.branchName || ''}
                              onChange={(e) => updateBankAccount(account.id, 'branchName', e.target.value)}
                              variant="outlined"
                              size="small"
                              required
                              error={hasFieldError('bankAccount', account.id, 'branchName')}
                              helperText={getFieldError('bankAccount', account.id, 'branchName')}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    
                    {bankAccounts.length === 0 && (
                      <Paper sx={{ p: 4, textAlign: 'center', background: '#f5f5f5' }}>
                        <Typography variant="body1" color="text.secondary">
                          No bank accounts added yet. Click "Add Account" to get started.
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Services Section */}
          <Grid item xs={12} lg={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ 
                      bgcolor: 'secondary.main', 
                      width: 56, 
                      height: 56,
                      background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)'
                    }}>
                      <SettingsIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        Services
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage service offerings ({services.length} services)
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addService}
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
                      }
                    }}
                  >
                    Add Service
                  </Button>
                </Box>

                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                  <Stack spacing={3}>
                    {services?.map((service) => (
                      <Paper 
                        key={service?._id} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: service.isNew ? 'warning.main' : 'divider',
                          background: service.isNew 
                            ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                            : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              icon={<TagIcon />}
                              label={service.isNew ? 'New Service' : `Service #${service.id}`}
                              color={service.isNew ? 'warning' : 'secondary'}
                              variant="outlined"
                            />
                          </Box>
                          <IconButton
                            onClick={() => removeService(service?._id)}
                            color="error"
                            size="small"
                            disabled={isSubmitting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        {/* Show general error for this service */}
                        {getFieldError('service', service.id, 'general') && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {getFieldError('service', service.id, 'general')}
                          </Alert>
                        )}

                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Service Name"
                              value={service.serviceName || ''}
                              onChange={(e) => updateService(service.id, 'serviceName', e.target.value)}
                              variant="outlined"
                              size="small"
                              required
                              error={hasFieldError('service', service.id, 'serviceName')}
                              helperText={getFieldError('service', service.id, 'serviceName')}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="HSN Code"
                              value={service.hsnCode || ''}
                              onChange={(e) => updateService(service.id, 'hsnCode', e.target.value)}
                              variant="outlined"
                              size="small"
                              required
                              error={hasFieldError('service', service.id, 'hsnCode')}
                              helperText={getFieldError('service', service.id, 'hsnCode')}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    
                    {services.length === 0 && (
                      <Paper sx={{ p: 4, textAlign: 'center', background: '#f5f5f5' }}>
                        <Typography variant="body1" color="text.secondary">
                          No services added yet. Click "Add Service" to get started.
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.show}
          autoHideDuration={5000}
          onClose={() => setNotification({ show: false, message: '', type: 'success' })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={notification.type} 
            onClose={() => setNotification({ show: false, message: '', type: 'success' })}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminBankSettings;