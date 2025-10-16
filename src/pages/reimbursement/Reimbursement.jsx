import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Select, MenuItem, Table, TableHead, TableBody, TableRow, TableCell,
  Modal, IconButton, InputAdornment, FormControl, InputLabel, Grid, CircularProgress, Alert, Autocomplete,
  Pagination, Chip, Skeleton, Card, CardContent, TableContainer, Divider, Tooltip, ToggleButtonGroup, ToggleButton,
  alpha, Avatar
} from '@mui/material';
import {
  Receipt, CheckCircle, Cancel, Schedule, Refresh, CloudUpload, Visibility, Search, Add,
  FilterList, Clear, FileDownload, AttachMoney, DateRange, Category, ViewList, ViewModule,
} from '@mui/icons-material';
import { useGet, usePost, makeApiCall } from '../../hooks/useApi';
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

const getInitials = (name) => {
  if (!name) return '';
  const names = name.trim().split(' ');
  return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0];
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
  const [viewMode, setViewMode] = useState('list');
  const [expanded, setExpanded] = useState(false);
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

  const { data: reimbursementData, isLoading: isFetchingReimbursements, refetch: refetchReimbursements } = useGet(
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
    }
  );

  const { data: categoryData, isLoading: isFetchingCategories } = useGet(
    '/reimbursement/category'
  );

  const { mutateAsync: createReimbursement, isLoading: isSubmittingCreate } = usePost('/reimbursement/create');

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
    employee: item.description || 'Unknown Employee',
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

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (modalType === 'create') {
        const formDataToSend = new FormData();
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('amount', parseFloat(formData.amount) || 0);
        formDataToSend.append('expenseDate', formData.expenseDate);
        formDataToSend.append('category', formData.category.toLowerCase());
        if (formData.receipt) formDataToSend.append('receipt', formData.receipt);

        await createReimbursement(formDataToSend);
        refetchReimbursements();
        setShowModal(false);
        setFormData({ description: '', amount: '', expenseDate: '', category: '', receipt: null, reopenReason: '' });
      } else if (modalType === 'reopen') {
        if (!formData.reopenReason.trim() || !formData.receipt) {
          setError('Reason and file are required to reopen');
          setLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('reason', formData.reopenReason.trim());
        formDataToSend.append('file', formData.receipt);

        const endpoint = `/reimbursement/${selectedReimbursement.id}/reopen`;
        await makeApiCall('PUT', endpoint, formDataToSend, {});
        refetchReimbursements();
        setShowModal(false);
        setFormData({ description: '', amount: '', expenseDate: '', category: '', receipt: null, reopenReason: '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'pending': return '#ff9800';
      case 're-open': return '#2196f3';
      case 'rejected': return '#f44336';
      default: return '#9e9e9e';
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

  const handleViewChange = (event, newViewMode) => {
    if (newViewMode) setViewMode(newViewMode);
  };

  // Grid View Component
  const ReimbursementGrid = () => (
    <Grid container spacing={3}>
      {normalizedReimbursements.length > 0 ? (
        normalizedReimbursements.map((r) => (
          <Grid item xs={12} sm={6} md={4} key={r.id}>
            <Card sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
              },
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
              border: `1px solid ${alpha('#1976D2', 0.1)}`,
              my: 2,
              mx: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={r.category}
                    sx={{
                      backgroundColor: alpha(getCategoryColor(r.category), 0.1),
                      color: getCategoryColor(r.category),
                      fontWeight: 600,
                      borderRadius: '12px',
                    }}
                  />
                  <Chip
                    label={r.status.replace('-', ' ').toUpperCase()}
                    sx={{
                      bgcolor: getStatusColor(r.status),
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: '12px',
                      height: 24,
                      '& .MuiChip-label': { fontSize: '0.75rem' }
                    }}
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#1976D2' }}>
                  {r.description}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Receipt sx={{ fontSize: 16, color: '#1976D2' }} />
                      <Typography variant="body2" color="text.secondary">
                        {r.reimId}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DateRange sx={{ fontSize: 16, color: '#1976D2' }} />
                      <Typography variant="body2" color="text.secondary">
                        {r.expenseDate}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney sx={{ fontSize: 16, color: '#1976D2' }} />
                    <Typography variant="body2" color="text.secondary">
                      ₹{r.amount.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={() => openModal('view', r)}
                      size="small"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {r.status === 'rejected' && r.canReopen === true && (
                    <Tooltip title="Reopen Request">
                      <IconButton
                        onClick={() => openModal('reopen', r)}
                        size="small"
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body1">
              No reimbursements found
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );

  const ViewToggle = () => (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={handleViewChange}
      sx={{
        backgroundColor: '#f8fbff',
        borderRadius: '22px',
        border: `1px solid ${alpha('#1976D2', 0.2)}`,
        overflow: 'hidden',
        height: '35px',
      }}
    >
      <ToggleButton value="list" sx={{ borderRadius: 0, '&.Mui-selected': { backgroundColor: '#1976D2', color: '#fff'} }}>
        <ViewList />
      </ToggleButton>
      <ToggleButton value="grid" sx={{ borderRadius: 0, '&.Mui-selected': { backgroundColor: '#1976D2', color: '#fff'} }}>
        <ViewModule />
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const startIndex = Math.min(((currentPage - 1) * itemsPerPage) + 1, pagination.total);
  const endIndex = Math.min(currentPage * itemsPerPage, pagination.total);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '1400px',
      mx: 'auto',
      px: { xs: 2, sm: 4 },
      mt: 5,
      py: 2,
      overflowX: 'hidden',
      backgroundColor: '#f8fbff',
      minHeight: '100vh',
    }}>
      <Box sx={{ mb: 3, backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 1000 }}>
        <ProfileNav />
      </Box>

      {/* Header Section */}
      <Paper elevation={3} sx={{ borderRadius: 8, overflow: 'hidden', background: 'var(--background-bg-2)' }}>
        <Box sx={{ p: 2, color: 'white' }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#fff', fontSize: '1.5rem' }}>
                Expense Reimbursements
              </Typography>
            </Grid>
            <Grid item>
              <Box  sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', height: 'auto' }}>
                <Chip
                  icon={<AttachMoney />}
                  label={`Total: ₹${reimbursements.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)', color: '#fff',
                    borderRadius: '25px',
                    px: 3,
                    py: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<Receipt />}
                  label={`${pagination.total} Requests`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)', color: '#fff',
                    borderRadius: '25px',
                    px: 3,
                    py: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                />
              </Box>
            </Grid>
            <Grid item>
              <ViewToggle />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => openModal('create')}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: 6,
                  px: 4,
                  py: 1,
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

      {/* Header with View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
          Results
        </Typography>
        
      </Box>

      {/* Filters Section */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#1976D2',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <Typography variant="h6" fontWeight="bold">Advanced Filters</Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              bgcolor: 'white',
              color: '#1976D2',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              borderRadius: 2
            }}
          >
            {expanded ? 'Hide' : 'Show'}
          </Button>
        </Box>
        {expanded && (
          <Box sx={{ p: 3, bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FilterList sx={{ color: '#1976D2' }} />
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
                        <Search sx={{ color: '#1976D2' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#1976D2' }
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
                  sx={{ p: '0px' }}
                  options={categories}
                  value={categoryFilter || null}
                  onChange={(e, value) => setCategoryFilter(value || '')}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Category"
                      placeholder="All categories"
                      sx={{ bgcolor: 'white', borderRadius: 2, padding: '0px' }}
                    />
                  )}
                  disabled={isFetchingCategories}
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
            </Grid>
          </Box>
        )}
      </Paper>



      {/* Main Content */}
      <Paper elevation={3} sx={{ borderRadius: '0px 0px 16px 16px', overflow: 'hidden', background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)' }}>
        {isFetchingReimbursements ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#1976D2', 0.05) }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Request ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Discription</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <LoadingSkeleton />
            </Table>
          </TableContainer>
        ) : normalizedReimbursements.length === 0 ? (
          <Box sx={{
            py: 8,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Receipt sx={{ fontSize: 64, color: '#9e9e9e' }} />
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
                bgcolor: '#1976D2',
                color: 'white',
                borderRadius: 2,
                '&:hover': { bgcolor: '#1565C0' }
              }}
            >
              Create New Request
            </Button>
          </Box>
        ) : (
          <>
            {viewMode === 'list' ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha('#1976D2', 0.05) }}>
                      <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Request ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Discription</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2, color: '#1976D2' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {normalizedReimbursements.map((r, i) => {
                      const fullEmployee = r.employee;
                      const nameParts = fullEmployee.split(' ');
                      const initials = getInitials(fullEmployee);
                      const name = nameParts.slice(0, 2).join(' ');
                      const designation = nameParts.slice(2).join(' ') || '';
                      return (
                        <TableRow
                          key={r.id}
                          sx={{
                            '&:hover': { bgcolor: alpha('#1976D2', 0.05), cursor: 'pointer' },
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <TableCell>
                            <Typography sx={{ fontWeight: 'medium' }}>
                              {r.reimId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2" fontWeight="medium">
                                {name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              ₹{r.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography color="text.secondary">
                              {r.expenseDate}
                            </Typography>
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
                            <Chip
                              label={r.status.replace('-', ' ').toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(r.status),
                                color: 'white',
                                fontWeight: 'medium',
                                height: 24,
                                '& .MuiChip-label': { fontSize: '0.75rem' }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  onClick={() => openModal('view', r)}
                                  size="small"
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {r.status === 'rejected' && r.canReopen === true && (
                                <Tooltip title="Reopen Request">
                                  <IconButton
                                    onClick={() => openModal('reopen', r)}
                                    size="small"
                                  >
                                    <Refresh fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <ReimbursementGrid />
            )}
            {/* Pagination */}
            <Box sx={{
              p: 3,
              bgcolor: alpha('#1976D2', 0.05),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ width: '160px', }}>
                  <InputLabel>Rows per page</InputLabel>
                  <Select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    label="Rows per page"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Showing {startIndex} to {endIndex} of {pagination.total} results
                </Typography>
              </Box>

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
                      bgcolor: '#1976D2',
                      color: 'white',
                      '&:hover': { bgcolor: '#1565C0' }
                    }
                  }
                }}
              />
            </Box>
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
          overflow: 'auto',
          border: `1px solid ${alpha('#1976D2', 0.1)}`
        }}>
          <Box sx={{
            p: 3,
            background: modalType === 'create'
              ? 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)'
              : 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
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
                          '&:hover fieldset': { borderColor: '#1976D2' }
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
                          '&:hover fieldset': { borderColor: '#1976D2' }
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
                          '&:hover fieldset': { borderColor: '#1976D2' }
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
                              '&:hover fieldset': { borderColor: '#1976D2' }
                            }
                          }}
                        />
                      )}
                      disabled={isFetchingCategories}
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
                        '&:hover fieldset': { borderColor: '#FF9800' }
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
                  '&:hover': { borderColor: '#1976D2' }
                }}>
                  <CloudUpload sx={{ fontSize: 48, color: '#1976D2', mb: 2 }} />
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
                      bgcolor: '#1976D2',
                      color: 'white',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: '#1565C0' }
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
            bgcolor: alpha('#1976D2', 0.05),
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
              disabled={!isFormValid || isSubmittingCreate || loading}
              sx={{
                bgcolor: isFormValid && !isSubmittingCreate && !loading ? '#1976D2' : '#9e9e9e',
                color: 'white',
                borderRadius: 2,
                px: 4,
                minWidth: 120,
                '&:hover': {
                  bgcolor: isFormValid && !isSubmittingCreate && !loading ? '#1565C0' : '#9e9e9e'
                }
              }}
            >
              {isSubmittingCreate || loading ? (
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
          bgcolor: '#f8fbff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <Paper sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            bgcolor: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderBottom: `1px solid ${alpha('#1976D2', 0.1)}`
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
                    bgcolor: alpha('#1976D2', 0.1),
                    color: '#1976D2',
                    '&:hover': { bgcolor: alpha('#1976D2', 0.2) },
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6">←</Typography>
                </IconButton>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
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
                      bgcolor: '#FF9800',
                      color: 'white',
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#F57C00' }
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
                    sx={{ borderRadius: 2, borderColor: '#1976D2', color: '#1976D2' }}
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
                  background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
                  color: 'white',
                  border: `1px solid ${alpha('#ffffff', 0.1)}`
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
                <Card sx={{ borderRadius: 4, height: '100%', border: `1px solid ${alpha('#1976D2', 0.1)}` }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1976D2' }}>
                      <Schedule />
                      Status & Timeline
                    </Typography>

                    {/* Current Status */}
                    <Box sx={{
                      p: 3,
                      bgcolor: alpha('#1976D2', 0.05),
                      borderRadius: 2,
                      mb: 3,
                      border: `2px solid ${alpha(getStatusColor(selectedReimbursement?.status), 0.2)}`
                    }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>Current Status</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={selectedReimbursement?.status?.replace('-', ' ').toUpperCase() || 'Unknown'}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(selectedReimbursement?.status),
                            color: 'white',
                            fontWeight: 'bold',
                            height: 24,
                            '& .MuiChip-label': { fontSize: '0.875rem' }
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Timeline */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1, color: '#1976D2' }}>Timeline</Typography>

                      {selectedReimbursement?.processedDate && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          bgcolor: '#f8fbff',
                          borderRadius: 2,
                          border: `1px solid ${alpha('#1976D2', 0.1)}`
                        }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            bgcolor: '#1976D2',
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
                          bgcolor: alpha('#FF9800', 0.05),
                          borderRadius: 2,
                          border: `1px solid ${alpha('#FF9800', 0.2)}`
                        }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            bgcolor: '#FF9800',
                            borderRadius: '50%'
                          }} />
                          <Box>
                            <Typography sx={{ fontWeight: 'medium', color: '#FF9800' }}>
                              Request Re-opened
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                    borderColor: '#f44336',
                    height: '100%',
                    border: `1px solid ${alpha('#f44336', 0.1)}`
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{
                        color: '#f44336',
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
                        bgcolor: alpha('#f44336', 0.05),
                        borderRadius: 2,
                        color: '#f44336',
                        border: `1px solid ${alpha('#f44336', 0.2)}`
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
                    borderColor: '#FF9800',
                    height: '100%',
                    border: `1px solid ${alpha('#FF9800', 0.1)}`
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{
                        color: '#FF9800',
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
                        bgcolor: alpha('#FF9800', 0.05),
                        borderRadius: 2,
                        color: '#FF9800',
                        border: `1px solid ${alpha('#FF9800', 0.2)}`
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
                <Card sx={{ borderRadius: 4, height: '100%', border: `1px solid ${alpha('#1976D2', 0.1)}` }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{
                      fontWeight: 'bold',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: '#1976D2'
                    }}>
                      <Receipt />
                      Original Receipt
                    </Typography>

                    <Box sx={{
                      p: 4,
                      bgcolor: alpha('#1976D2', 0.05),
                      borderRadius: 3,
                      textAlign: 'center',
                      minHeight: 300,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px dashed ${alpha('#1976D2', 0.2)}`
                    }}>
                      {selectedReimbursement?.receipt ? (
                        <>
                          <Receipt sx={{ fontSize: 64, color: '#1976D2', mb: 2 }} />
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
                            border: `2px solid ${alpha('#1976D2', 0.1)}`,
                            maxWidth: 280,
                            width: '100%',
                            mb: 3,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center', color: '#1976D2' }}>
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
                              bgcolor: '#1976D2',
                              color: 'white',
                              borderRadius: 2,
                              px: 4,
                              '&:hover': { bgcolor: '#1565C0' }
                            }}
                          >
                            View Full Receipt
                          </Button>
                        </>
                      ) : (
                        <>
                          <Receipt sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }} />
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
                  <Card sx={{ borderRadius: 4, height: '100%', border: `1px solid ${alpha('#FF9800', 0.1)}` }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#FF9800'
                      }}>
                        <CloudUpload />
                        Reopen Attachment
                      </Typography>

                      <Box sx={{
                        p: 4,
                        bgcolor: alpha('#FF9800', 0.05),
                        borderRadius: 3,
                        textAlign: 'center',
                        minHeight: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px dashed ${alpha('#FF9800', 0.2)}`
                      }}>
                        <CloudUpload sx={{ fontSize: 64, color: '#FF9800', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1, color: '#FF9800' }}>
                          {selectedReimbursement.reopen.file.split('/').pop() || 'Reopen Document'}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                          Additional documentation for reopen request
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Visibility />}
                          href={selectedReimbursement.reopen.file}
                          target="_blank"
                          sx={{
                            bgcolor: '#FF9800',
                            color: 'white',
                            borderRadius: 2,
                            px: 4,
                            '&:hover': { bgcolor: '#F57C00' }
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