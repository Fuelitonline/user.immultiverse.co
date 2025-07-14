import React, { useState } from 'react';
import { useGet } from '../../../hooks/useApi';
import {
  DialogActions, Button, Radio, RadioGroup, FormControlLabel, FormControl,
  InputLabel, Select, MenuItem, Typography, Chip, Grid, TextField, Box, Fade,
} from '@mui/material';
import { styled } from '@mui/system';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: '#fff',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 8px ${theme.palette.primary.light}`,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: '#757575',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

function TargetBased({ teams, Cancle }) {
  const [selectedOption, setSelectedOption] = useState('weekly');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [targetValues, setTargetValues] = useState({});
  const [incentiveValues, setIncentiveValues] = useState({});
  const [selectedTeam, setSelectedTeam] = useState('');
  const { data: stages } = useGet('/leads/get-stage-workFlow', {}, {}, { queryKey: 'stages' });

  const savedNodes = stages?.data?.data?.stage?.nodes || [];
  const statuses = savedNodes.map((data) => data?.data?.label) || [];

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSelectChange = (event) => {
    setSelectedStatuses(event.target.value);
  };

  const handleTargetChange = (status, event) => {
    setTargetValues({ ...targetValues, [status]: event.target.value });
  };

  const handleIncentiveChange = (status, event) => {
    setIncentiveValues({ ...incentiveValues, [status]: event.target.value });
  };

  const handleClose = () => {
    Cancle();
  };

  const handleSubmit = async()=>{
       const data = {
           targetType : selectedOption,
           teamId : selectedTeam,
           targets : Object.keys(targetValues).map((status) => ({
               targetName : status,
               targetValue : targetValues[status],
               incentiveValue : incentiveValues[status],
           }))
       }
       console.log(data, 'data');
  }

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ p: 2 }}>
        {/* Target Selection */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: '700',
            color: '#1a237e',
            mb: 2,
            letterSpacing: 0.5,
          }}
        >
          Target Selection
        </Typography>
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <RadioGroup
            value={selectedOption}
            onChange={handleRadioChange}
            row
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              p: 1,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              '& .MuiFormControlLabel-root': {
                m: 0,
                mr: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              },
              '& .MuiRadio-root': {
                color: '#757575',
                '&.Mui-checked': {
                  color: '#4caf50',
                },
              },
            }}
          >
            {['Weekly', 'Monthly', 'Yearly', 'Quarterly', 'Half-Yearly'].map((option) => (
              <FormControlLabel
                key={option}
                value={option.toLowerCase()}
                control={<Radio />}
                label={option}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: 500,
                    color: selectedOption === option.toLowerCase() ? '#4caf50' : '#757575',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Team Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ fontWeight: 500, color: '#757575' }}>Select Team</InputLabel>
          <Select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            sx={{
              borderRadius: 12,
              background: '#fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4caf50',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4caf50',
                boxShadow: '0 0 8px rgba(76, 175, 80, 0.3)',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 224,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              },
            }}
          >
            {teams.map((data) => (
              <MenuItem key={data?._id} value={data?._id}>
                <Chip
                  label={data?.teamName}
                  sx={{
                    background: 'linear-gradient(90deg, #4caf50, #81c784)',
                    color: '#fff',
                    fontWeight: 500,
                    mr: 1,
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status Selection */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: '700',
            color: '#1a237e',
            mb: 2,
            letterSpacing: 0.5,
          }}
        >
          Stage Selection
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ fontWeight: 500, color: '#757575' }}>Status</InputLabel>
          <Select
            multiple
            value={selectedStatuses}
            onChange={handleSelectChange}
            renderValue={(selected) => selected.join(', ')}
            sx={{
              borderRadius: 12,
              background: '#fff',
              color:'black',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
                color:'black',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4caf50',
                color:'black',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4caf50',
                boxShadow: '0 0 8px rgba(76, 175, 80, 0.3)',
                color:'black',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 224,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              },
            }}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                <Chip
                  label={status}
                  sx={{
                    background: 'linear-gradient(90deg, #4caf50, #81c784)',
                    color: 'black',
                    fontWeight: 500,
                    mr: 1,
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Dynamic Target and Incentive Inputs */}
        {selectedStatuses.map((status) => (
          <Fade in={true} timeout={500} key={status}>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label={`Target for ${status}`}
                    fullWidth
                    value={targetValues[status] || ''}
                    onChange={(e) => handleTargetChange(status, e)}
                    type="number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label={`Incentive for ${status}`}
                    fullWidth
                    value={incentiveValues[status] || ''}
                    onChange={(e) => handleIncentiveChange(status, e)}
                    type="number"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        ))}

        {/* Actions */}
        <DialogActions sx={{ p: 0, mt: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: '600',
              color: '#f44336',
              borderColor: '#f44336',
              borderRadius: 12,
              px: 4,
              py: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(244, 67, 54, 0.1)',
                borderColor: '#d32f2f',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: '600',
              background: 'linear-gradient(90deg, #4caf50, #81c784)',
              color: '#fff',
              borderRadius: 12,
              px: 4,
              py: 1,
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(90deg, #388e3c, #66bb6a)',
                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Fade>
  );
}

export default TargetBased;