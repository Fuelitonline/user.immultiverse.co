import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Select, MenuItem, Table, TableHead, TableBody, TableRow, TableCell,
  Modal, IconButton, InputAdornment, FormControl, InputLabel, Grid, CircularProgress, Alert, Autocomplete,
  Pagination, Chip, Skeleton, Card, CardContent, TableContainer, Divider, Tooltip
} from '@mui/material';
import { 
  Receipt, CheckCircle, Cancel, Schedule, Refresh, CloudUpload, Visibility, Search, Add, 
  FilterList, Clear, FileDownload, AttachMoney, DateRange, Category
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { usePost, useGet, usePut } from '../../hooks/useApi';
import ProfileNav from '../../components/user/profiveNav';

// Debounced search hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const EmployeeReimbursement = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [minAmountFilter, setMinAmountFilter] = useState('');
  const [maxAmountFilter, setMaxAmountFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({ 
    description: '', 
    amount: '', 
    expenseDate: '', 
    category: '', 
    receipt: null, 
    reopenReason: '' 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localCategories, setLocalCategories] = useState([]);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const queryClient = useQueryClient();
  
  const { mutate: createReimbursement, isLoading: isSubmittingCreate } = usePost(
    '/reimbursement/create', 
    {}, 
    'reimbursement/get'
  );
  
  const { mutate: reopenReimbursement, isLoading: isSubmittingReopen } = usePut(
    selectedReimbursement ? `/reimbursement/${selectedReimbursement.id}/reopen` : '',
    'reimbursement/get'
  );

  const { data: reimbursementData, isLoading: isFetchingReimbursements, error: reimbursementError } = useGet(
    "/reimbursement/get",
    {
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter || undefined,
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined,
      minAmount: minAmountFilter || undefined,
      maxAmount: maxAmountFilter || undefined,
      search: debouncedSearchTerm || undefined,
      page: currentPage,
      limit: itemsPerPage,
    },
    {},
    { refetchOnWindowFocus: false, retry: 2 }
  );

  const { data: categoryData, isLoading: isFetchingCategories, error: categoryError } = useGet(
    '/reimbursement/category', 
    {}, 
    {}, 
    { refetchOnWindowFocus: false, retry: 2 }
  );

  // Safely extract data with null checks
  const reimbursements = reimbursementData?.data?.data?.data || [];
  const pagination = reimbursementData?.data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  const normalizedReimbursements = reimbursements.map(item => ({
    id: item._id || '',
    reimId: item.reimId || 'N/A',
    description: item.description || 'No description provided',
    amount: item.amount || 0,
    expenseDate: item.expenseDate ? new Date(item.expenseDate).toISOString().split('T')[0] : 'N/A',
    category: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Uncategorized',
    status: item.status?.toLowerCase() || 'unknown',
    receipt: item.receiptUrl || null,
    processedDate: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : null,
    canReopen: item.reopenAllowed || false,
    rejectionReason: item.decision?.reason || null,
    reopen: item.reopen || null,
  }));

  const categories = categoryData
    ? (Array.isArray(categoryData) ? categoryData : categoryData.data?.data || []).map(c => 
        c ? c.charAt(0).toUpperCase() + c.slice(1) : 'Unknown'
      )
    : localCategories;

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value) || '') : value 
    }));
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, receipt: file }));
  };

  const openModal = (type, reimbursement = null) => {
    setModalType(type);
    setSelectedReimbursement(reimbursement);
    setFormData(reimbursement
      ? { 
          description: reimbursement.description, 
          amount: reimbursement.amount.toString(), 
          expenseDate: reimbursement.expenseDate, 
          category: reimbursement.category, 
          receipt: null, 
          reopenReason: '' 
        }
      : { 
          description: '', 
          amount: '', 
          expenseDate: '', 
          category: '', 
          receipt: null, 
          reopenReason: '' 
        }
    );
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = () => {
    setError(null);
    setLoading(true);

    if (modalType === 'create') {
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('amount', parseFloat(formData.amount) || 0);
      formDataToSend.append('expenseDate', formData.expenseDate);
      formDataToSend.append('category', formData.category.toLowerCase());
      if (formData.receipt) formDataToSend.append('receipt', formData.receipt);

      createReimbursement(formDataToSend, {
        onSuccess: () => {
          queryClient.invalidateQueries(['reimbursement/get']);
          setShowModal(false);
          setLoading(false);
          setFormData({ description: '', amount: '', expenseDate: '', category: '', receipt: null, reopenReason: '' });
        },
        onError: err => {
          setError(err.message || 'Failed to submit reimbursement');
          setLoading(false);
        },
      });
    } else if (modalType === 'reopen') {
      if (!formData.reopenReason.trim() || !formData.receipt) {
        setError('Reason and file are required to reopen');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('reason', formData.reopenReason.trim());
      formDataToSend.append('file', formData.receipt);

      reopenReimbursement(formDataToSend, {
        onSuccess: () => {
          queryClient.invalidateQueries(['reimbursement/get']);
          setShowModal(false);
          setLoading(false);
          setFormData({ description: '', amount: '', expenseDate: '', category: '', receipt: null, reopenReason: '' });
        },
        onError: err => {
          setError(err.message || 'Failed to reopen reimbursement');
          setLoading(false);
        },
      });
    }
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
    setCurrentPage(1);
  };

  const isFormValid = modalType === 'create'
    ? formData.description.trim() && formData.amount && !isNaN(parseFloat(formData.amount)) && formData.expenseDate && formData.category && formData.receipt instanceof File
    : formData.reopenReason.trim() && formData.receipt instanceof File;

  const getCategoryColor = category => {
    if (!category || category === 'Uncategorized') return '#6B7280';
    const colors = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#EC4899', '#6B7280', '#FF6F61', '#4A90E2'];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'pending': return <Schedule sx={{ color: 'warning.main' }} />;
      case 're-open': return <Refresh sx={{ color: 'info.main' }} />;
      case 'rejected': return <Cancel sx={{ color: 'error.main' }} />;
      default: return <Schedule sx={{ color: 'grey.500' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success.main';
      case 'pending': return 'warning.main';
      case 're-open': return 'info.main';
      case 'rejected': return 'error.main';
      default: return 'grey.500';
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <TableBody>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          {[...Array(7)].map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton variant="text" width="100%" height={40} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, startDateFilter, endDateFilter, minAmountFilter, maxAmountFilter, debouncedSearchTerm]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '1400px',
      mx: 'auto',
      px: { xs: 2, sm: 4 },
      mt: 4,
      gap: 4,
      py: 6,
      overflowX: 'hidden',
    }}>
      <Box sx={{ mb: 3, backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 1000}}>
        <ProfileNav />
      </Box>

      {/* Header Section */}
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ p: 4, color: 'white' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Expense Reimbursements
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Track and manage your expense reimbursement requests
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<AttachMoney />} 
                  label={`Total: ₹${reimbursements.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  icon={<Receipt />} 
                  label={`${pagination.total} Requests`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => openModal('create')}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  backdropFilter: 'blur(10px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                New Request
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Filters Section */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <FilterList sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Filters & Search</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={clearAllFilters}
              sx={{ ml: 'auto', borderRadius: 2 }}
            >
              Clear All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search descriptions, categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  bgcolor: 'white', 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: 'primary.main' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ bgcolor: 'white', borderRadius: 2 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="re-open">Re-open</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                fullWidth
                options={categories}
                value={categoryFilter || null}
                onChange={(e, value) => setCategoryFilter(value || '')}
                renderInput={params => (
                  <TextField 
                    {...params} 
                    label="Category" 
                    placeholder="All categories"
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                  />
                )}
                disabled={isFetchingCategories || categoryError}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDateFilter}
                onChange={e => setStartDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDateFilter}
                onChange={e => setEndDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Amount (₹)"
                type="number"
                value={minAmountFilter}
                onChange={e => setMinAmountFilter(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Amount (₹)"
                type="number"
                value={maxAmountFilter}
                onChange={e => setMaxAmountFilter(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Items per page</InputLabel>
                <Select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  label="Items per page"
                  sx={{ bgcolor: 'white', borderRadius: 2 }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Main Content */}
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {reimbursementError ? (
          <Alert severity="error" sx={{ m: 3 }}>
            {reimbursementError.message || 'Failed to fetch reimbursements'}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Request ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Expense Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                
                {isFetchingReimbursements ? (
                  <LoadingSkeleton />
                ) : normalizedReimbursements.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box sx={{ 
                          py: 8, 
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2
                        }}>
                          <Receipt sx={{ fontSize: 64, color: 'grey.300' }} />
                          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                            No reimbursements found
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            {debouncedSearchTerm || statusFilter !== 'all' || categoryFilter || startDateFilter || endDateFilter || minAmountFilter || maxAmountFilter
                              ? 'Try adjusting your filters or search terms'
                              : 'Create your first reimbursement request to get started'}
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => openModal('create')}
                            sx={{ 
                              bgcolor: '#4B5EAA', 
                              color: 'white', 
                              borderRadius: 2, 
                              '&:hover': { bgcolor: '#3B4F9A' } 
                            }}
                          >
                            Create New Request
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    {normalizedReimbursements.map((r, i) => (
                      <TableRow 
                        key={r.id} 
                        sx={{ 
                          bgcolor: i % 2 === 0 ? 'white' : '#f8fafc', 
                          '&:hover': { bgcolor: '#f1f5f9', cursor: 'pointer' },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                            {r.reimId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={r.description}
                          >
                            {r.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney sx={{ color: 'success.main', fontSize: 18 }} />
                            <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                              {r.amount.toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DateRange sx={{ color: 'text.secondary', fontSize: 18 }} />
                            <Typography>{r.expenseDate}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<Category />}
                            label={r.category}
                            size="small"
                            sx={{
                              bgcolor: getCategoryColor(r.category),
                              color: 'white',
                              fontWeight: 'medium'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(r.status)}
                            <Typography sx={{ 
                              color: getStatusColor(r.status),
                              fontWeight: 'medium',
                              textTransform: 'capitalize'
                            }}>
                              {r.status.replace('-', ' ')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                onClick={() => openModal('view', r)} 
                                sx={{ 
                                  bgcolor: '#e3f2fd', 
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: '#bbdefb' }
                                }}
                                size="small"
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {r.status === 'rejected' && r.canReopen === false && (
                              <Tooltip title="Reopen Request">
                                <IconButton 
                                  onClick={() => openModal('reopen', r)} 
                                  sx={{ 
                                    bgcolor: '#fff3e0', 
                                    color: 'warning.main',
                                    '&:hover': { bgcolor: '#ffe0b2' }
                                  }}
                                  size="small"
                                >
                                  <Refresh fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </Table>
            </TableContainer>

            {/* Pagination */}
            {!isFetchingReimbursements && normalizedReimbursements.length > 0 && (
              <Box sx={{ 
                p: 3, 
                bgcolor: '#f8fafc', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, pagination.total)} to{' '}
                  {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} results
                </Typography>
                
                <Pagination
                  count={pagination.totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Create/Reopen Modal */}
      <Modal open={showModal && modalType !== 'view'} onClose={() => setShowModal(false)}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          bgcolor: 'white', 
          borderRadius: 4, 
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)', 
          width: { xs: '95vw', sm: 600 }, 
          maxHeight: '90vh', 
          overflow: 'auto' 
        }}>
          <Box sx={{ 
            p: 3, 
            background: modalType === 'create' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white', 
            borderRadius: '16px 16px 0 0' 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {modalType === 'create' ? 'Create New Reimbursement' : 'Reopen Reimbursement Request'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
              {modalType === 'create' 
                ? 'Submit your expense details for reimbursement'
                : 'Provide additional information to reopen your request'}
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            
            {modalType === 'reopen' && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 'medium' }}>Important:</Typography>
                <Typography variant="body2">
                  You can only reopen this request once. Please ensure all information and documents are correct.
                </Typography>
              </Alert>
            )}

            <Grid container spacing={3}>
              {modalType === 'create' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      placeholder="Describe your expense in detail..."
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: 'primary.main' }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Amount (₹)"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      InputProps={{ 
                        inputProps: { min: 0, step: 0.01 },
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: 'primary.main' }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Expense Date"
                      name="expenseDate"
                      type="date"
                      value={formData.expenseDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: 'primary.main' }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={categories}
                      value={formData.category}
                      onChange={(e, value) => setFormData(prev => ({ ...prev, category: value || '' }))}
                      onInputChange={(e, value) => setFormData(prev => ({ ...prev, category: value || '' }))}
                      renderInput={params => (
                        <TextField 
                          {...params} 
                          label="Category" 
                          placeholder="Select or type a category..."
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: 'primary.main' }
                            }
                          }}
                        />
                      )}
                      disabled={isFetchingCategories || categoryError}
                    />
                  </Grid>
                </>
              )}

              {modalType === 'reopen' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Reopening"
                    name="reopenReason"
                    value={formData.reopenReason}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    placeholder="Provide a detailed explanation for why you're reopening this request..."
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: 'primary.main' }
                      }
                    }}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 4, 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: 3, 
                  textAlign: 'center',
                  transition: 'border-color 0.3s ease',
                  '&:hover': { borderColor: 'primary.main' }
                }}>
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Upload {modalType === 'create' ? 'Receipt' : 'Supporting Document'}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                    Drag and drop your file here, or click to browse
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Choose File
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleFileUpload} 
                      hidden 
                    />
                  </Button>
                  {formData.receipt && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                      <Typography sx={{ color: 'success.main', fontWeight: 'medium' }}>
                        ✓ {formData.receipt.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main' }}>
                        File uploaded successfully
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          <Divider />
          
          <Box sx={{ 
            p: 3, 
            bgcolor: '#f8fafc', 
            borderRadius: '0 0 16px 16px', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2 
          }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowModal(false)} 
              sx={{ 
                borderColor: '#cbd5e1', 
                color: 'text.secondary',
                borderRadius: 2,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmittingCreate || isSubmittingReopen || loading}
              sx={{
                bgcolor: isFormValid && !isSubmittingCreate && !isSubmittingReopen && !loading ? 'primary.main' : 'grey.400',
                color: 'white',
                borderRadius: 2,
                px: 4,
                minWidth: 120,
                '&:hover': { 
                  bgcolor: isFormValid && !isSubmittingCreate && !isSubmittingReopen && !loading ? 'primary.dark' : 'grey.400' 
                }
              }}
            >
              {isSubmittingCreate || isSubmittingReopen || loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                modalType === 'create' ? 'Submit Request' : 'Reopen Request'
              )}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Enhanced View Modal */}
      <Modal open={showModal && modalType === 'view'} onClose={() => setShowModal(false)}>
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          bgcolor: '#f1f5f9', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          {/* Header */}
          <Paper sx={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1000, 
            bgcolor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ 
              px: { xs: 2, sm: 4 }, 
              py: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={() => setShowModal(false)} 
                  sx={{ 
                    bgcolor: '#f1f5f9', 
                    '&:hover': { bgcolor: '#e2e8f0' },
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6">←</Typography>
                </IconButton>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Reimbursement Details
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Request ID: {selectedReimbursement?.reimId}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {selectedReimbursement?.status === 'rejected' && selectedReimbursement?.canReopen === true && (
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={() => openModal('reopen', selectedReimbursement)}
                    sx={{ 
                      bgcolor: 'warning.main', 
                      color: 'white', 
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'warning.dark' }
                    }}
                  >
                    Reopen Request
                  </Button>
                )}
                {selectedReimbursement?.receipt && (
                  <Button
                    variant="outlined"
                    startIcon={<FileDownload />}
                    href={selectedReimbursement.receipt}
                    target="_blank"
                    sx={{ borderRadius: 2 }}
                  >
                    Download Receipt
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Content */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}>
            <Grid container spacing={4}>
              {/* Basic Information Card */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ 
                  borderRadius: 4, 
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Receipt />
                      Basic Information
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 3, 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          borderRadius: 2,
                          backdropFilter: 'blur(10px)'
                        }}>
                          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Description</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                            {selectedReimbursement?.description || 'No description provided'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ 
                          p: 3, 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          borderRadius: 2,
                          backdropFilter: 'blur(10px)'
                        }}>
                          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Amount</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            ₹{selectedReimbursement?.amount?.toLocaleString() || '0'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ 
                          p: 3, 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          borderRadius: 2,
                          backdropFilter: 'blur(10px)'
                        }}>
                          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Expense Date</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                            {selectedReimbursement?.expenseDate || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 3, 
                          bgcolor: 'rgba(255,255,255,0.1)', 
                          borderRadius: 2,
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Category</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                              {selectedReimbursement?.category || 'Uncategorized'}
                            </Typography>
                          </Box>
                          <Category sx={{ fontSize: 32, opacity: 0.6 }} />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Status & Timeline Card */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 4, height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule />
                      Status & Timeline
                    </Typography>
                    
                    {/* Current Status */}
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(0,0,0,0.02)', 
                      borderRadius: 2, 
                      mb: 3,
                      border: `2px solid ${getStatusColor(selectedReimbursement?.status)}20`
                    }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>Current Status</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          p: 1, 
                          bgcolor: `${getStatusColor(selectedReimbursement?.status)}20`, 
                          borderRadius: 2 
                        }}>
                          {getStatusIcon(selectedReimbursement?.status)}
                        </Box>
                        <Typography variant="h6" sx={{ 
                          color: getStatusColor(selectedReimbursement?.status),
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}>
                          {selectedReimbursement?.status?.replace('-', ' ') || 'Unknown'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Timeline */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>Timeline</Typography>
                      
                      {selectedReimbursement?.processedDate && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 2, 
                          bgcolor: '#f8fafc', 
                          borderRadius: 2,
                          border: '1px solid #e2e8f0'
                        }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            bgcolor: 'primary.main', 
                            borderRadius: '50%' 
                          }} />
                          <Box>
                            <Typography sx={{ fontWeight: 'medium' }}>Request Processed</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {selectedReimbursement.processedDate}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      
                      {selectedReimbursement?.status === 're-open' && selectedReimbursement?.reopen?.decidedAt && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 2, 
                          bgcolor: 'warning.light', 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'warning.main'
                        }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            bgcolor: 'warning.main', 
                            borderRadius: '50%' 
                          }} />
                          <Box>
                            <Typography sx={{ fontWeight: 'medium', color: 'warning.main' }}>
                              Request Re-opened
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                              {new Date(selectedReimbursement.reopen.decidedAt).toISOString().split('T')[0]}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Rejection Reason Card */}
              {selectedReimbursement?.status === 'rejected' && selectedReimbursement?.rejectionReason && (
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    borderRadius: 4, 
                    borderLeft: '6px solid', 
                    borderColor: 'error.main',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{ 
                        color: 'error.main', 
                        fontWeight: 'bold', 
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Cancel />
                        Rejection Reason
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: 'error.light', 
                        borderRadius: 2, 
                        color: 'error.dark',
                        border: '1px solid',
                        borderColor: 'error.main'
                      }}>
                        <Typography variant="body1">
                          {selectedReimbursement.rejectionReason}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Reopen Reason Card */}
              {selectedReimbursement?.status === 're-open' && selectedReimbursement?.reopen?.reason && (
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    borderRadius: 4, 
                    borderLeft: '6px solid', 
                    borderColor: 'warning.main',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{ 
                        color: 'warning.main', 
                        fontWeight: 'bold', 
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Refresh />
                        Reopen Reason
                      </Typography>
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: 'warning.light', 
                        borderRadius: 2, 
                        color: 'warning.dark',
                        border: '1px solid',
                        borderColor: 'warning.main'
                      }}>
                        <Typography variant="body1">
                          {selectedReimbursement.reopen.reason}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Receipt Card */}
              <Grid item xs={12} lg={selectedReimbursement?.reopen?.file ? 6 : 12}>
                <Card sx={{ borderRadius: 4, height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Receipt />
                      Original Receipt
                    </Typography>
                    
                    <Box sx={{ 
                      p: 4, 
                      bgcolor: '#f8fafc', 
                      borderRadius: 3, 
                      textAlign: 'center', 
                      minHeight: 300, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '2px dashed #cbd5e1'
                    }}>
                      {selectedReimbursement?.receipt ? (
                        <>
                          <Receipt sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                            {selectedReimbursement.receipt.split('/').pop() || 'Receipt File'}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                            Uploaded receipt document
                          </Typography>
                          
                          {/* Receipt Preview */}
                          <Box sx={{ 
                            p: 3, 
                            bgcolor: 'white', 
                            borderRadius: 2, 
                            border: '2px solid #e2e8f0', 
                            maxWidth: 280, 
                            width: '100%',
                            mb: 3,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                              EXPENSE RECEIPT
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ textAlign: 'left', mb: 2 }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Date: {selectedReimbursement.expenseDate}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Amount: ₹{selectedReimbursement.amount?.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Category: {selectedReimbursement.category}
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              {selectedReimbursement.description}
                            </Typography>
                          </Box>
                          
                          <Button
                            variant="contained"
                            startIcon={<Visibility />}
                            href={selectedReimbursement.receipt}
                            target="_blank"
                            sx={{ 
                              bgcolor: 'primary.main', 
                              color: 'white', 
                              borderRadius: 2,
                              px: 4,
                              '&:hover': { bgcolor: 'primary.dark' }
                            }}
                          >
                            View Full Receipt
                          </Button>
                        </>
                      ) : (
                        <>
                          <Receipt sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                            No Receipt Available
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No receipt was uploaded for this request
                          </Typography>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Reopen Attachment Card */}
              {selectedReimbursement?.status === 're-open' && selectedReimbursement?.reopen?.file && (
                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: 4, height: '100%' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: 'warning.main'
                      }}>
                        <CloudUpload />
                        Reopen Attachment
                      </Typography>
                      
                      <Box sx={{ 
                        p: 4, 
                        bgcolor: 'warning.light', 
                        borderRadius: 3, 
                        textAlign: 'center', 
                        minHeight: 300, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '2px dashed',
                        borderColor: 'warning.main'
                      }}>
                        <CloudUpload sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1, color: 'warning.dark' }}>
                          {selectedReimbursement.reopen.file.split('/').pop() || 'Reopen Document'}
                        </Typography>
                        <Typography sx={{ color: 'warning.dark', mb: 3 }}>
                          Additional documentation for reopen request
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Visibility />}
                          href={selectedReimbursement.reopen.file}
                          target="_blank"
                          sx={{ 
                            bgcolor: 'warning.main', 
                            color: 'white',
                            borderRadius: 2,
                            px: 4,
                            '&:hover': { bgcolor: 'warning.dark' }
                          }}
                        >
                          View Attachment
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EmployeeReimbursement;