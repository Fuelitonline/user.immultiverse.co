import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  IconButton,
  Autocomplete,
  Typography
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import { Cancel } from '@mui/icons-material';
import departmentImgage from '../../assets/images/deparment.jpg';
import { toast } from 'react-toastify';

const DepartmentForm = ({
  departmentModal,
  setDepartmentModal,
  departmentHead,
  setDepartmentHead,
  departmentName,
  setDepartmentName,
  createDepartment,
  refetchDepartments,
  employee,
}) => {
  const handleDepartmentCloseModal = () => {
    setDepartmentModal(false);
    setDepartmentHead('');
    setDepartmentName('');
  };

  const handleDepartmentAdd = async () => {
    if (!departmentName || !departmentHead) {
      toast.error('Department name and Head are required');
      return;
    }
    const departmentDetails = { departmentName, departmentHead };
    try {
      const create = await createDepartment({ departmentDetails });
      if (create.data) {
        toast.success(create.data.message);
        refetchDepartments();
        handleDepartmentCloseModal();
      } else {
        toast.error(create.error?.error || create.error?.message || 'Failed to create department');
      }
    } catch (error) {
      toast.error('An error occurred while creating the department');
    }
  };

  return (
    <Dialog
      open={departmentModal}
      onClose={handleDepartmentCloseModal}
      PaperProps={{ sx: { borderRadius: '25px' } }}
    >
      <DialogTitle>Add New Department</DialogTitle>
      <DialogContent>
        <Grid mt={2} container spacing={2}>
          <Grid item xs={12} width="100%">
            <img
              src={departmentImgage}
              alt="departmentImgage"
              height="200px"
              width="100%"
              style={{ borderRadius: '15px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', marginBottom: '20px' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={employee || []}
              getOptionLabel={(option) => `${option?.name} ${option?.email} (${option?.position})`}
              value={employee?.find((option) => option?._id === departmentHead) || null}
              onChange={(event, newValue) => setDepartmentHead(newValue?._id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department Head"
                  variant="outlined"
                  fullWidth
                  sx={{
                    '& .MuiInputLabel-root': { color: '#000', borderRadius: '15px' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#ced1d6',
                        borderRadius: '15px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                      },
                      '&:hover fieldset': { borderColor: '#398bf7' },
                      '&.Mui-focused fieldset': { borderColor: '#398bf7' },
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoFocus
              label="Department Name"
              type="text"
              variant="outlined"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: '#000', borderRadius: '15px' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ced1d6',
                    borderRadius: '15px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                  },
                  '&:hover fieldset': { borderColor: '#398bf7' },
                  '&.Mui-focused fieldset': { borderColor: '#398bf7' },
                },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ mr: 2 }}>
        <IconButton
          onClick={handleDepartmentCloseModal}
          sx={{
            bgcolor: '#4287f5',
            borderRadius: '15px',
            padding: '8px 25px',
            '&:hover': { bgcolor: '#6ea4fa' },
          }}
        >
          <Cancel sx={{ color: 'white', fontSize: '18px' }} />
          <Typography sx={{ color: 'white', fontWeight: '500' }}>Cancel</Typography>
        </IconButton>
        <IconButton
          onClick={handleDepartmentAdd}
          sx={{
            bgcolor: '#4287f5',
            borderRadius: '15px',
            padding: '8px 25px',
            '&:hover': { bgcolor: '#6ea4fa' },
          }}
        >
          <Add sx={{ color: 'white', fontSize: '18px' }} />
          <Typography sx={{ color: 'white', fontWeight: '500' }}>Add</Typography>
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentForm;