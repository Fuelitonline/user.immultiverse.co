import React from 'react';
import {
  Grid, TextField, FormControl, Select, MenuItem, Typography, InputAdornment,
  Autocomplete, Card, Box, Switch,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';

const commonStyles = {
  inputField: (theme) => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f9fafb',
      borderRadius: '10px',
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: theme.palette.grey[300],
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.light,
        transform: 'scale(1.01)',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 8px ${theme.palette.primary.light}50`,
        borderWidth: 2,
      },
    },
    '& input': {
      padding: '10px 12px',
      fontSize: '0.85rem',
    },
    '& .MuiInputAdornment-root': {
      marginRight: '4px',
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.75rem',
      marginLeft: '4px',
    },
  }),
  label: (theme) => ({
    fontWeight: 600,
    fontSize: '0.9rem',
    marginBottom: '6px',
    color: theme.palette.text.primary,
  }),
  card: (theme) => ({
    maxWidth: 650,
    margin: 'auto',
    mt: 3,
    padding: '24px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
  }),
  switchBox: (theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 18px',
    backgroundColor: '#f3f6f9',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '10px',
    marginBottom: '16px',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
  }),
};

const LeaveRequestForm = ({ leaveData, setLeaveData, formErrors, theme }) => {
  const formFields = [
    { name: 'leaveType', label: 'Leave Type', options: ['Casual Leave', 'Sick Leave'], type: 'autocomplete', icon: <EventNoteIcon /> },
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
    { name: 'reason', label: 'Reason', type: 'text', multiline: true, rows: 2 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={commonStyles.card(theme)}>
        {/* Paid/Unpaid Toggle */}
        <Box sx={commonStyles.switchBox(theme)}>
          <Typography sx={{ fontWeight: 600 }}>Leave Payment Type</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: '0.85rem',
                color: leaveData.leavePaymentType === 'Paid'
                  ? theme.palette.success.main
                  : theme.palette.warning.dark,
              }}
            >
              {leaveData.leavePaymentType === 'Paid' ? 'Paid' : 'Unpaid'}
            </Typography>
            <Switch
              checked={leaveData.leavePaymentType === 'Paid'}
              onChange={(e) =>
                setLeaveData({ ...leaveData, leavePaymentType: e.target.checked ? 'Paid' : 'Unpaid' })
              }
              color="primary"
            />
          </Box>
        </Box>

        <Grid container spacing={2}>
          {formFields.map(({ name, label, options, type, multiline, rows, icon, conditional }) => {
            if (conditional && leaveData.leaveDuration !== 'Half Day') return null;

            return (
              <Grid item xs={12} key={name}>
                <Typography sx={commonStyles.label(theme)}>{label}</Typography>

                {type === 'autocomplete' ? (
                  <Autocomplete
                    fullWidth
                    options={options}
                    value={leaveData[name] || null}
                    onChange={(e, newVal) => setLeaveData({ ...leaveData, [name]: newVal })}
                    disableClearable
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!formErrors[name]}
                        helperText={formErrors[name]}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
                        }}
                        sx={commonStyles.inputField(theme)}
                      />
                    )}
                  />
                ) : type === 'date' ? (
                  <DatePicker
                    value={leaveData[name] ? parse(leaveData[name], 'yyyy-MM-dd', new Date()) : null}
                    onChange={(newVal) =>
                      setLeaveData({ 
                        ...leaveData, 
                        [name]: newVal ? format(newVal, 'yyyy-MM-dd') : '' 
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!formErrors[name]}
                        helperText={formErrors[name]}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
                        }}
                        sx={commonStyles.inputField(theme)}
                        fullWidth
                      />
                    )}
                  />
                ) : type === 'select' ? (
                  <FormControl fullWidth>
                    <Select
                      value={leaveData[name] || ''}
                      onChange={(e) => setLeaveData({ ...leaveData, [name]: e.target.value })}
                      displayEmpty
                      sx={commonStyles.inputField(theme)}
                      startAdornment={icon && <InputAdornment position="start">{icon}</InputAdornment>}
                    >
                      {options.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors[name] && (
                      <Typography variant="caption" color="error">
                        {formErrors[name]}
                      </Typography>
                    )}
                  </FormControl>
                ) : type === 'time' ? (
                  <TimePicker
                    value={leaveData[name] ? parse(leaveData[name], 'HH:mm', new Date()) : null}
                    onChange={(newVal) =>
                      setLeaveData({ 
                        ...leaveData, 
                        [name]: newVal ? format(newVal, 'HH:mm') : '' 
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!formErrors[name]}
                        helperText={formErrors[name]}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
                        }}
                        sx={commonStyles.inputField(theme)}
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <TextField
                    fullWidth
                    value={leaveData[name] || ''}
                    onChange={(e) => setLeaveData({ ...leaveData, [name]: e.target.value })}
                    error={!!formErrors[name]}
                    helperText={formErrors[name]}
                    multiline={multiline}
                    rows={rows}
                    InputProps={{
                      startAdornment: icon ? (
                        <InputAdornment position="start">{icon}</InputAdornment>
                      ) : null,
                    }}
                    sx={commonStyles.inputField(theme)}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
      </Card>
    </LocalizationProvider>
  );
};

export default LeaveRequestForm;