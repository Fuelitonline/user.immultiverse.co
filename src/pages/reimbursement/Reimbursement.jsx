import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Select, MenuItem, Table, TableHead, TableBody, TableRow, TableCell,
  Modal, IconButton, InputAdornment, FormControl, InputLabel, Grid, CircularProgress, Alert, Autocomplete
} from '@mui/material';
import { Receipt, CheckCircle, Cancel, Schedule, Refresh, CloudUpload, Visibility, Search, Add } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { usePost, useGet, usePut } from '../../hooks/useApi';
import ProfileNav from '../../components/user/profiveNav';

const EmployeeReimbursement = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({ description: '', amount: '', expenseDate: '', category: '', receipt: null, reopenReason: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localCategories, setLocalCategories] = useState([]);

  const queryClient = useQueryClient();
  const { mutate: createReimbursement, isLoading: isSubmittingCreate } = usePost('/reimbursement/create', {}, 'reimbursement/get');
  const { mutate: reopenReimbursement, isLoading: isSubmittingReopen } = usePut(
    selectedReimbursement ? `/reimbursement/${selectedReimbursement.id}/reopen` : '',
    { headers: { 'Content-Type': 'multipart/form-data' } },
    'reimbursement/get'
  );
  const { data: reimbursementData, isLoading: isFetchingReimbursements, error: reimbursementError } = useGet('/reimbursement/get', {}, {}, { refetchOnWindowFocus: false, retry: 2 });
  const { data: categoryData, isLoading: isFetchingCategories, error: categoryError } = useGet('/reimbursement/category', {}, {}, { refetchOnWindowFocus: false, retry: 2 });

  // Normalize data
  const reimbursements = reimbursementData
    ? (Array.isArray(reimbursementData) ? reimbursementData : reimbursementData.data.data || []).map(item => ({
        id: item._id || '',
        description: item.description || 'N/A',
        amount: item.amount || 0,
        expenseDate: item.expenseDate ? new Date(item.expenseDate).toISOString().split('T')[0] : 'N/A',
        category: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'N/A',
        status: item.status?.toLowerCase() || 'unknown',
        receipt: item.receiptUrl || 'N/A',
        processedDate: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : null,
        canReopen: item.reopenAllowed || false,
        rejectionReason: item.decision?.reason || null,
        reopen: item.reopen || null,
      }))
    : [];

  const categories = categoryData
    ? (Array.isArray(categoryData) ? categoryData : categoryData.data.data || []).map(c => c.charAt(0).toUpperCase() + c.slice(1))
    : localCategories;

  const filteredReimbursements = reimbursements.filter(r =>
    (r.description?.toLowerCase().includes(searchTerm.toLowerCase()) || r.category?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || r.status === statusFilter)
  );

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value) || '') : value }));
  };

  const handleFileUpload = e => setFormData(prev => ({ ...prev, receipt: e.target.files[0] }));

  const openModal = (type, reimbursement = null) => {
    setModalType(type);
    setSelectedReimbursement(reimbursement);
    setFormData(reimbursement
      ? { description: reimbursement.description, amount: reimbursement.amount.toString(), expenseDate: reimbursement.expenseDate, category: reimbursement.category, receipt: null, reopenReason: '' }
      : { description: '', amount: '', expenseDate: '', category: '', receipt: null, reopenReason: '' });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = () => {
    setError(null);
    setLoading(true);

    if (modalType === 'create') {
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amount', parseFloat(formData.amount) || 0);
      formDataToSend.append('expenseDate', formData.expenseDate);
      formDataToSend.append('category', formData.category.toLowerCase());
      if (formData.receipt) formDataToSend.append('receipt', formData.receipt);

      createReimbursement(formDataToSend, {
        onSuccess: () => {
          queryClient.invalidateQueries(['reimbursement/get']);
          setShowModal(false);
          setLoading(false);
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
        },
        onError: err => {
          setError(err.message || 'Failed to reopen reimbursement');
          setLoading(false);
        },
      });
    }
  };

  const isFormValid = modalType === 'create'
    ? formData.description.trim() && formData.amount && !isNaN(parseFloat(formData.amount)) && formData.expenseDate && formData.category && formData.receipt
    : formData.reopenReason.trim() && formData.receipt;

  const getCategoryColor = category => {
    if (!category) return '#6B7280';
    const colors = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#EC4899', '#6B7280', '#FF6F61', '#4A90E2'];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '1400px',
      mx: 'auto',
      px: { xs: 2, sm: 4 },
      gap: 4,
      py: 6,
      overflowX: 'hidden',
    }}>
      <Box sx={{ mb: 3 }}><ProfileNav /></Box>
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} sx={{ textAlign: 'left' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Reimbursements</Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Manage your expense reimbursement requests</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={4}>
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
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openModal('create')}
                    sx={{ bgcolor: '#4B5EAA', color: 'white', borderRadius: 2, '&:hover': { bgcolor: '#3B4F9A' } }}
                  >
                    New
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {isFetchingReimbursements ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : reimbursementError ? (
          <Alert severity="error" sx={{ m: 3 }}>{reimbursementError.message || 'Failed to fetch reimbursements'}</Alert>
        ) : reimbursements.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}><Typography sx={{ color: 'text.secondary' }}>No reimbursements found.</Typography></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F1F5F9' }}>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Expense Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReimbursements.map((r, i) => (
                <TableRow key={r.id} sx={{ bgcolor: i % 2 === 0 ? 'white' : '#F8FAFC', '&:hover': { bgcolor: '#F1F5F9' } }}>
                  <TableCell><Typography>{r.description}</Typography></TableCell>
                  <TableCell><Typography sx={{ color: 'primary.main' }}>₹{r.amount.toLocaleString()}</Typography></TableCell>
                  <TableCell><Typography>{r.expenseDate}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ px: 2, py: 1, bgcolor: getCategoryColor(r.category), color: 'white', borderRadius: 2, display: 'inline-block' }}>
                      {r.category}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ p: 0.5, bgcolor: `${r.status === 'approved' ? 'success.main' : r.status === 'pending' ? 'warning.main' : r.status === 're-open' ? 'warning.main' : 'error.main'}20`, borderRadius: '50%' }}>
                        {r.status === 'approved' ? <CheckCircle sx={{ color: 'success.main' }} /> :
                         r.status === 'pending' ? <Schedule sx={{ color: 'warning.main' }} /> :
                         r.status === 're-open' ? <Schedule sx={{ color: 'warning.main' }} /> :
                         <Cancel sx={{ color: 'error.main' }} />}
                      </Box>
                      <Typography sx={{ color: r.status === 'approved' ? 'success.main' : r.status === 'pending' ? 'warning.main' : r.status === 're-open' ? 'warning.main' : 'error.main' }}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openModal('view', r)} sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}>
                      <Visibility />
                    </IconButton>
                    {r.status === 'rejected' && r.canReopen && (
                      <IconButton onClick={() => openModal('reopen', r)} sx={{ bgcolor: '#F3E8FF', '&:hover': { bgcolor: '#EDE9FE' } }}>
                        <Refresh sx={{ color: 'secondary.main' }} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create/Reopen Modal */}
      <Modal open={showModal && modalType !== 'view'} onClose={() => setShowModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', borderRadius: 4, boxShadow: 24, width: 600, maxHeight: '90vh', overflow: 'auto' }}>
          <Box sx={{ p: 3, bgcolor: 'linear-gradient(to right, #4B5EAA, #7C3AED)', color: 'white', borderRadius: '4px 4px 0 0' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{modalType === 'create' ? 'New Reimbursement Request' : 'Reopen Request'}</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {isFetchingCategories && <CircularProgress size={20} sx={{ display: 'block', mx: 'auto', mb: 2 }} />}
            {categoryError && <Alert severity="error" sx={{ mb: 2 }}>{categoryError.message || 'Failed to fetch categories'}</Alert>}
            {modalType === 'reopen' && (
              <Box sx={{ p: 2, bgcolor: 'warning.light', borderLeft: '4px solid', borderColor: 'warning.main', borderRadius: 2, mb: 2 }}>
                <Typography sx={{ color: 'warning.main' }}>You can only reopen this request once. Ensure all information is correct.</Typography>
              </Box>
            )}
            <Grid container spacing={2}>
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
                      rows={2}
                      placeholder="Describe your expense..."
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
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      freeSolo
                      fullWidth
                      options={categories}
                      value={formData.category}
                      onChange={(e, value) => {
                        setFormData(prev => ({ ...prev, category: value }));
                        if (value && !categories.includes(value)) setLocalCategories([...localCategories, value]);
                      }}
                      renderInput={params => <TextField {...params} label="Category" placeholder="Select or type a category..." />}
                      disabled={isFetchingCategories || categoryError}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Box sx={{ p: 2, border: '2px dashed #CBD5E1', borderRadius: 2, textAlign: 'center' }}>
                  <CloudUpload sx={{ fontSize: 30, color: 'text.secondary', mb: 1 }} />
                  <Typography sx={{ color: 'text.secondary', mb: 1 }}>Drag and drop or click to browse</Typography>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ bgcolor: '#4B5EAA', color: 'white', '&:hover': { bgcolor: '#3B4F9A' } }}
                  >
                    Choose File
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} hidden />
                  </Button>
                  {formData.receipt && <Typography sx={{ color: 'success.main', mt: 1 }}>✓ {formData.receipt.name}</Typography>}
                </Box>
              </Grid>
              {modalType === 'reopen' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Reopening"
                    name="reopenReason"
                    value={formData.reopenReason}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    placeholder="Explain why you're reopening..."
                  />
                </Grid>
              )}
            </Grid>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '0 0 4px 4px', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={() => setShowModal(false)} sx={{ borderColor: '#CBD5E1' }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmittingCreate || isSubmittingReopen || loading}
              sx={{
                bgcolor: isFormValid && !isSubmittingCreate && !isSubmittingReopen && !loading ? '#4B5EAA' : 'grey.500',
                color: 'white',
                '&:hover': { bgcolor: isFormValid && !isSubmittingCreate && !isSubmittingReopen && !loading ? '#3B4F9A' : 'grey.500' }
              }}
            >
              {isSubmittingCreate || isSubmittingReopen || loading ? <CircularProgress size={20} color="inherit" /> : modalType === 'create' ? 'Submit' : 'Reopen'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* View Modal */}
      <Modal open={showModal && modalType === 'view'} onClose={() => setShowModal(false)}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ position: 'sticky', top: 0, zIndex: 1000, bgcolor: 'white' }}>
            <Box sx={{ px: { xs: 2, sm: 4 }, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => setShowModal(false)} sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}>
                  <Typography>←</Typography>
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Reimbursement Details</Typography>
              </Box>
              {selectedReimbursement?.status === 'rejected' && selectedReimbursement?.canReopen && (
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => openModal('reopen', selectedReimbursement)}
                  sx={{ bgcolor: '#A78BFA', color: 'white', '&:hover': { bgcolor: '#977BEA' } }}
                >
                  Reopen
                </Button>
              )}
            </Box>
          </Paper>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', px: { xs: 2, sm: 4 }, py: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'white', minWidth: 300, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Basic Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', mb: 1 }}>Description</Typography>
                      <Typography sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>{selectedReimbursement?.description}</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ color: 'text.secondary', mb: 1 }}>Amount</Typography>
                        <Typography sx={{ bgcolor: 'success.light', p: 2, borderRadius: 2, color: 'success.main' }}>
                          ₹{selectedReimbursement?.amount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ color: 'text.secondary', mb: 1 }}>Expense Date</Typography>
                        <Typography sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>{selectedReimbursement?.expenseDate}</Typography>
                      </Grid>
                    </Grid>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', mb: 1 }}>Category</Typography>
                      <Box sx={{ px: 2, py: 1, bgcolor: getCategoryColor(selectedReimbursement?.category), color: 'white', borderRadius: 2, display: 'inline-block' }}>
                        {selectedReimbursement?.category}
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ color: 'text.secondary', mb: 1 }}>Status</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ p: 0.5, bgcolor: `${selectedReimbursement?.status === 'approved' ? 'success.main' : selectedReimbursement?.status === 'pending' ? 'warning.main' : selectedReimbursement?.status === 're-open' ? 'warning.main' : 'error.main'}20`, borderRadius: '50%' }}>
                          {selectedReimbursement?.status === 'approved' ? <CheckCircle sx={{ color: 'success.main' }} /> :
                           selectedReimbursement?.status === 'pending' ? <Schedule sx={{ color: 'warning.main' }} /> :
                           selectedReimbursement?.status === 're-open' ? <Schedule sx={{ color: 'warning.main' }} /> :
                           <Cancel sx={{ color: 'error.main' }} />}
                        </Box>
                        <Typography sx={{ color: selectedReimbursement?.status === 'approved' ? 'success.main' : selectedReimbursement?.status === 'pending' ? 'warning.main' : selectedReimbursement?.status === 're-open' ? 'warning.main' : 'error.main' }}>
                          {selectedReimbursement?.status.charAt(0).toUpperCase() + selectedReimbursement?.status.slice(1)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'white', minWidth: 300, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Timeline</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedReimbursement?.processedDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'text.secondary', borderRadius: '50%' }} />
                        <Box>
                          <Typography>Request Processed</Typography>
                          <Typography sx={{ color: 'text.secondary' }}>{selectedReimbursement?.processedDate}</Typography>
                        </Box>
                      </Box>
                    )}
                    {selectedReimbursement?.status === 're-open' && selectedReimbursement?.reopen?.decidedAt && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: 'text.secondary', borderRadius: '50%' }} />
                        <Box>
                          <Typography>Request Re-opened</Typography>
                          <Typography sx={{ color: 'text.secondary' }}>{new Date(selectedReimbursement.reopen.decidedAt).toISOString().split('T')[0]}</Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
              {selectedReimbursement?.status === 'rejected' && selectedReimbursement?.rejectionReason && (
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 4, borderLeft: '4px solid', borderColor: 'error.main', bgcolor: 'white', minWidth: 300, height: '100%' }}>
                    <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 'bold', mb: 2 }}>Rejection Reason</Typography>
                    <Typography sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'error.main' }}>{selectedReimbursement.rejectionReason}</Typography>
                  </Paper>
                </Grid>
              )}
              {selectedReimbursement?.status === 're-open' && selectedReimbursement?.reopen?.reason && (
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 4, borderLeft: '4px solid', borderColor: 'warning.main', bgcolor: 'white', minWidth: 300, height: '100%' }}>
                    <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 'bold', mb: 2 }}>Reopen Reason</Typography>
                    <Typography sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, color: 'warning.main' }}>{selectedReimbursement.reopen.reason}</Typography>
                  </Paper>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'white', minWidth: 300, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Receipt</Typography>
                  <Box sx={{ p: 4, bgcolor: '#F8FAFC', borderRadius: 2, textAlign: 'center', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Receipt sx={{ fontSize: 50, color: 'text.secondary', mb: 2 }} />
                    <Typography sx={{ fontWeight: 'medium', mb: 1 }}>{selectedReimbursement?.receipt.split('/').pop()}</Typography>
                    <Typography sx={{ color: 'text.secondary', mb: 3 }}>Uploaded receipt file</Typography>
                    <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '2px dashed #CBD5E1', maxWidth: 300, width: '100%', textAlign: 'center' }}>
                      <Typography sx={{ fontWeight: 'bold', mb: 2 }}>RECEIPT</Typography>
                      <Box sx={{ borderBottom: '1px solid #CBD5E1', pb: 1, mb: 1 }}>
                        <Typography sx={{ color: 'text.secondary' }}>Expense Date: {selectedReimbursement?.expenseDate}</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>Amount: ₹{selectedReimbursement?.amount.toLocaleString()}</Typography>
                      </Box>
                      <Typography sx={{ color: 'text.secondary' }}>{selectedReimbursement?.description}</Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{selectedReimbursement?.category}</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<Visibility />}
                      href={selectedReimbursement?.receipt}
                      target="_blank"
                      sx={{ mt: 3, bgcolor: '#4B5EAA', color: 'white', '&:hover': { bgcolor: '#3B4F9A' } }}
                    >
                      View Full Receipt
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              {selectedReimbursement?.status === 're-open' && selectedReimbursement?.reopen?.file && (
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'white', minWidth: 300, height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Reopen Attachment</Typography>
                    <Box sx={{ p: 4, bgcolor: '#F8FAFC', borderRadius: 2, textAlign: 'center', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Receipt sx={{ fontSize: 50, color: 'text.secondary', mb: 2 }} />
                      <Typography sx={{ fontWeight: 'medium', mb: 1 }}>{selectedReimbursement.reopen.file.split('/').pop()}</Typography>
                      <Typography sx={{ color: 'text.secondary', mb: 3 }}>Uploaded reopen attachment</Typography>
                      <Button
                        variant="contained"
                        startIcon={<Visibility />}
                        href={selectedReimbursement.reopen.file}
                        target="_blank"
                        sx={{ mt: 3, bgcolor: '#4B5EAA', color: 'white', '&:hover': { bgcolor: '#3B4F9A' } }}
                      >
                        View Reopen Attachment
                      </Button>
                    </Box>
                  </Paper>
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