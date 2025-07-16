import React from 'react';
import {
  Grid, TextField, FormControl, Select, MenuItem, Typography, InputAdornment, Autocomplete, Card, Box,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Reusable style objects
const commonStyles = {
  inputField: (theme) => ({
    borderRadius: '8px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[300], borderWidth: '1px' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.light },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { 
      borderColor: theme.palette.primary.main, 
      borderWidth: '2px',
      boxShadow: `0 0 8px ${theme.palette.primary.light}40`,
    },
    '& .MuiInputLabel-root': { 
      color: theme.palette.text.secondary, 
      fontWeight: 500, 
      fontSize: '0.85rem',
      transform: 'translate(12px, 10px) scale(1)',
      '&.Mui-focused': { color: theme.palette.primary.main, transform: 'translate(12px, -6px) scale(0.75)' },
      '&.MuiFormLabel-filled': { transform: 'translate(12px, -6px) scale(0.75)' },
    },
    '& .MuiInputBase-input': { 
      color: theme.palette.text.primary, 
      fontSize: '0.85rem',
      padding: '10px 12px',
      fontFamily: '"Roboto", sans-serif',
    },
    '& .MuiSelect-select': { 
      padding: '8px 12px',
      fontSize: '0.85rem',
    },
    '& .MuiAutocomplete-input': { 
      padding: '8px 12px !important',
      fontSize: '0.85rem',
    },
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease-in-out',
    '& .MuiInputBase-root': { 
      height: '36px',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
    },
    '&:hover .MuiInputBase-root': {
      backgroundColor: '#f1f5f9',
      transform: 'scale(1.01)',
    },
    '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginLeft: '12px', color: theme.palette.error.main },
  }),
  fieldHeading: (theme) => ({
    fontSize: '0.9rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
    textAlign: 'left',
    padding: '6px 0 4px 0',
    fontFamily: '"Roboto", sans-serif',
  }),
  card: (theme) => ({
    maxWidth: '600px',
    margin: 'auto',
    mt: 2,
    padding: '20px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  }),
};

const LeaveRequestForm = ({ leaveData, setLeaveData, formErrors, theme }) => {
  const formFields = [
    { name: 'leaveType', label: 'Leave Type', options: ['Casual Leave', 'Sick Leave', 'Paid', 'Unpaid'], type: 'autocomplete', icon: <EventNoteIcon /> },
    { name: 'date', label: 'Date', type: 'date', icon: <CalendarTodayIcon /> },
    { name: 'leaveDuration', label: 'Leave Duration', options: ['Full Day', 'Half Day'], type: 'select' },
    { 
      name: 'halfDayType', 
      label: 'Half Day Type', 
      options: ['Morning', 'Evening'], 
      type: 'select', 
      conditional: true,
      icon: <AccessTimeIcon />,
    },
    { name: 'time', label: 'Time', type: 'time', icon: <AccessTimeIcon /> },
    { name: 'reason', label: 'Reason', type: 'text', multiline: true, rows: 4 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={commonStyles.card(theme)}>
        <Box sx={{ padding: '8px 0' }}>
          <Grid container spacing={1.5}>
            {formFields.map(({ name, label, options, type, multiline, rows, icon, conditional }) => {
              if (conditional && leaveData.leaveDuration !== 'Half Day') {
                return null;
              }
              return (
                <Grid item xs={12} key={name}>
                  <Typography sx={commonStyles.fieldHeading(theme)}>{label}</Typography>
                  {type === 'autocomplete' ? (
                    <FormControl fullWidth variant="outlined">
                      <Autocomplete
                        fullWidth
                        options={options}
                        value={leaveData[name] || null}
                        onChange={(event, newValue) => setLeaveData({ ...leaveData, [name]: newValue })}
                        freeSolo={false}
                        disableClearable
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            error={!!formErrors[name]}
                            helperText={formErrors[name]}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  {icon}
                                </InputAdornment>
                              ),
                            }}
                            sx={commonStyles.inputField(theme)}
                          />
                        )}
                        renderOption={(props, option) => (
                          <MenuItem
                            {...props}
                            sx={{ fontSize: '0.85rem', padding: '8px 12px', fontFamily: '"Roboto", sans-serif' }}
                          >
                            {option}
                          </MenuItem>
                        )}
                        ListboxProps={{
                          sx: {
                            maxHeight: '150px',
                            fontSize: '0.85rem',
                            '& .MuiAutocomplete-option': {
                              padding: '8px 12px',
                            },
                          },
                        }}
                      />
                    </FormControl>
                  ) : type === 'date' ? (
                    <DatePicker
                      value={leaveData[name] ? new Date(leaveData[name]) : null}
                      onChange={(newValue) => setLeaveData({ ...leaveData, [name]: newValue ? newValue.toISOString() : '' })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          variant="outlined"
                          error={!!formErrors[name]}
                          helperText={formErrors[name]}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {icon}
                              </InputAdornment>
                            ),
                            ...params.InputProps,
                          }}
                          sx={commonStyles.inputField(theme)}
                        />
                      )}
                    />
                  ) : type === 'select' ? (
                    <FormControl fullWidth variant="outlined">
                      <Select
                        name={name}
                        value={leaveData[name] || ''}
                        onChange={(e) => setLeaveData({ ...leaveData, [name]: e.target.value })}
                        sx={commonStyles.inputField(theme)}
                        startAdornment={(
                          <InputAdornment position="start">
                            {icon}
                          </InputAdornment>
                        )}
                      >
                        {options.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem', padding: '8px 12px', fontFamily: '"Roboto", sans-serif' }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors[name] && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                          {formErrors[name]}
                        </Typography>
                      )}
                    </FormControl>
                  ) : type === 'time' ? (
                    <TimePicker
                      value={leaveData[name] ? new Date(leaveData[name]) : null}
                      onChange={(newValue) => setLeaveData({ ...leaveData, [name]: newValue ? newValue.toISOString() : '' })}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          variant="outlined"
                          error={!!formErrors[name]}
                          helperText={formErrors[name]}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {icon}
                              </InputAdornment>
                            ),
                            ...params.InputProps,
                          }}
                          sx={commonStyles.inputField(theme)}
                        />
                      )}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      type={type}
                      value={leaveData[name] || ''}
                      onChange={(e) => setLeaveData({ ...leaveData, [name]: e.target.value })}
                      error={!!formErrors[name]}
                      helperText={formErrors[name]}
                      multiline={multiline}
                      rows={rows}
                      InputProps={{
                        startAdornment: icon ? (
                          <InputAdornment position="start">
                            {icon}
                          </InputAdornment>
                        ) : null,
                      }}
                      sx={{
                        ...commonStyles.inputField(theme),
                        '& .MuiInputBase-root': { 
                          height: multiline ? 'auto' : '36px',
                          padding: multiline ? '10px 12px' : '0',
                        },
                      }}
                    />
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Card>
    </LocalizationProvider>
  );
};

export default LeaveRequestForm;