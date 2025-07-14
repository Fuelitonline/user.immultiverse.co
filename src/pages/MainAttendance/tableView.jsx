import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Tooltip,
  IconButton,
  Fade,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { useGet } from '../../hooks/useApi';
import { DateTime } from 'luxon';
import { useAuth } from '../../middlewares/auth';

const DailyRecordsTable = ({ initialMonth = DateTime.local().month, initialYear = DateTime.local().year }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const userId = user?._id;

  const currentDate = DateTime.now();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.month);
  const [selectedYear, setSelectedYear] = useState(currentDate.year);
  const [entries, setEntries] = useState([]);
  const [totalWorkTime, setTotalWorkTime] = useState('00:00:00');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'day', direction: 'desc' });
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: policyData = {}, error: policyError } = useGet(
    'company/policy/attendece-get',
    { employeeId: `${userId}` }
  );

  const { data: dailyRecords = {}, error: fetchError, isLoading } = useGet(
    'employee/work-tracking/daily-records',
    {
      userId,
      startDate: DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: 1 }).toISODate(),
      endDate: DateTime.fromObject({ year: selectedYear, month: selectedMonth }).endOf('month').toISODate(),
    }
  );

  console.log('dailyRecords:', dailyRecords);
  console.log('policyData:', policyData);

  const formatDuration = (durationHours) => {
    if (!durationHours || isNaN(durationHours)) return '00:00:00';
    const totalSeconds = durationHours * 3600;
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (fetchError) {
      setError('Failed to fetch daily records. Please try again later.');
      setLoading(false);
      return;
    }

    if (!dailyRecords || !dailyRecords.data || !dailyRecords.data.data) {
      setEntries([]);
      setTotalWorkTime('00:00:00');
      setLoading(false);
      return;
    }

    const fetchedEntries = dailyRecords.data.data.records || [];

    const sortedEntries = [...fetchedEntries].sort((a, b) => {
      if (sortConfig.key === 'day') {
        const diff = DateTime.fromISO(a.day).diff(DateTime.fromISO(b.day)).milliseconds;
        return sortConfig.direction === 'asc' ? diff : -diff;
      }

      if (sortConfig.key === 'totalWorkingTime') {
        return sortConfig.direction === 'asc'
          ? (a.totalWorkingTime || 0) - (b.totalWorkingTime || 0)
          : (b.totalWorkingTime || 0) - (a.totalWorkingTime || 0);
      }

      if (sortConfig.key === 'totalEntries') {
        return sortConfig.direction === 'asc'
          ? (a.totalEntries || 0) - (b.totalEntries || 0)
          : (b.totalEntries || 0) - (a.totalEntries || 0);
      }

      return 0;
    });

    setEntries(sortedEntries);
    setTotalWorkTime(formatDuration((dailyRecords.data.data.totalWorkTime || 0) * 3600000));
    setLoading(false);
  }, [dailyRecords, fetchError, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const convertToWorkDays = (totalWorkTime, workingHours) => {
    const calculateDailyWorkTime = (start, end) => {
      const startTime = DateTime.fromFormat(start || '09:00', 'HH:mm');
      const endTime = DateTime.fromFormat(end || '17:00', 'HH:mm');
      const duration = endTime.diff(startTime, 'seconds').seconds;
      return duration > 0 ? duration : 8 * 3600;
    };

    const dailyWorkTime = workingHours
      ? calculateDailyWorkTime(workingHours.start, workingHours.end)
      : 8 * 3600;
    const [hours, minutes, seconds] = totalWorkTime.split(':').map(num => Number(num) || 0);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const fullWorkDays = Math.floor(totalSeconds / dailyWorkTime);
    const remainingSeconds = totalSeconds % dailyWorkTime;
    const remainingHours = Math.floor(remainingSeconds / 3600);
    const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
    const remainingSecondsLeft = Math.floor(remainingSeconds % 60);

    if (fullWorkDays > 0) {
      return `${fullWorkDays} day${fullWorkDays > 1 ? 's' : ''} ${remainingHours}h ${remainingMinutes}m ${remainingSecondsLeft}s`;
    }
    return `${remainingHours}h ${remainingMinutes}m ${remainingSecondsLeft}s`;
  };

  const workDaysResult = convertToWorkDays(
    totalWorkTime,
    policyData?.data?.data?.workingHours || { start: '09:00', end: '17:00' }
  );

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value || DateTime.local().month);
    setLoading(true);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value || DateTime.local().year);
    setLoading(true);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setLoading(true);
  };

  const getSortDirectionIcon = (name) => {
    if (sortConfig.key === name) {
      return sortConfig.direction === 'asc' ? (
        <ArrowUpward fontSize="small" sx={{ ml: 0.5, fontSize: 16 }} />
      ) : (
        <ArrowDownward fontSize="small" sx={{ ml: 0.5, fontSize: 16 }} />
      );
    }
    return null;
  };

  const getStatusColor = (entry) => {
    const standardWorkTime = 8 * 3600;
    const entryTime = (entry?.totalWorkingTime || 0) * 3600;
    if (entryTime >= standardWorkTime) return 'success';
    if (entryTime >= standardWorkTime * 0.75) return 'warning';
    return 'error';
  };

  return (
    <Box
      sx={{
        width: '100%',
        margin: 'auto',
        borderRadius: '24px',
        padding: { xs: '1.5rem', md: '2rem' },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, rgba(44, 62, 80, 0.95), rgba(30, 42, 56, 0.95))'
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95))',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
      }}
    >
      <Card
        elevation={8}
        sx={{
          mb: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(145deg, rgba(60, 80, 100, 0.9), rgba(40, 60, 80, 0.9))'
            : 'linear-gradient(145deg, #ffffff, #f0f4f8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          overflow: 'visible',
          width: '100%',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <CardHeader
          title={
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: theme.palette.text.primary,
                letterSpacing: '0.5px',
                fontFamily: "'Poppins', sans-serif",
                fontSize: isMobile ? '1.1rem' : '1.5rem',
                background: 'linear-gradient(90deg, #2c3e50, #4a6a88)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <CalendarIcon sx={{ fontSize: isMobile ? 20 : 24, color: theme.palette.text.primary }} />
              Attendance Dashboard
            </Typography>
          }
          subheader={
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mt: 0.5,
                fontFamily: "'Roboto', sans-serif",
                fontSize: isMobile ? '0.85rem' : '1rem',
                opacity: 0.8,
              }}
            >
              View and manage employee attendance records
            </Typography>
          }
          action={
            <Tooltip title="Refresh data">
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  color: '#fff',
                  background: 'linear-gradient(45deg, #4a6a88, #6a8aa8)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3a5a78, #5a7a98)',
                    transform: 'scale(1.15)',
                  },
                  transition: 'all 0.3s ease',
                  borderRadius: '12px',
                  padding: '10px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  animation: loading ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <RefreshIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider sx={{ mx: 2, borderColor: alpha(theme.palette.divider, 0.4), borderWidth: '2px' }} />
        <CardContent sx={{ padding: { xs: '1rem', md: '1.5rem' } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={8}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '400px',
                  mx: 'auto',
                  background: 'linear-gradient(145deg, #ffffff, #e6ecef)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                  p: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                  },
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                }}
              >
                <Tooltip title="Total work time for the selected period">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon sx={{ fontSize: isMobile ? '0.9rem' : '1rem', color: theme.palette.text.primary }} />
                      <Typography variant="subtitle1" sx={{ fontSize: isMobile ? '0.75rem' : '0.85rem', fontFamily: "'Roboto', sans-serif", color: theme.palette.text.primary, fontWeight: 600 }}>
                        Total Work
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontSize: isMobile ? '0.75rem' : '0.85rem', fontFamily: "'Roboto', sans-serif", color: theme.palette.text.primary, fontWeight: 700 }}>
                      {workDaysResult}
                    </Typography>
                  </Box>
                </Tooltip>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                variant="filled"
                fullWidth
                size="small"
                sx={{
                  '& .MuiFilledInput-root': {
                    borderRadius: '12px',
                    background: '#A3BFFA',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: '#8DA9FA',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    '&:before': {
                      borderBottom: 'none',
                    },
                    '&:after': {
                      borderBottom: 'none',
                    },
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontFamily: "'Roboto', sans-serif",
                    color: '#2C3E50',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#2C3E50',
                  },
                }}
              >
                <Select
                  value={selectedMonth || DateTime.local().month}
                  onChange={handleMonthChange}
                  displayEmpty
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
                      <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', fontFamily: "'Roboto', sans-serif" }}>
                        {DateTime.fromObject({ month: value || DateTime.local().month }).toFormat('MMM')}
                      </Typography>
                    </Box>
                  )}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <MenuItem key={month} value={month} sx={{ fontFamily: "'Roboto', sans-serif" }}>
                      {DateTime.fromObject({ month }).toFormat('MMMM')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                variant="filled"
                fullWidth
                size="small"
                sx={{
                  '& .MuiFilledInput-root': {
                    borderRadius: '12px',
                    background: '#FCE38A',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: '#FAD165',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    '&:before': {
                      borderBottom: 'none',
                    },
                    '&:after': {
                      borderBottom: 'none',
                    },
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    fontFamily: "'Roboto', sans-serif",
                    color: '#2C3E50',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#2C3E50',
                  },
                }}
              >
                <Select
                  value={selectedYear || DateTime.local().year}
                  onChange={handleYearChange}
                  displayEmpty
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
                      <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem', fontFamily: "'Roboto', sans-serif" }}>
                        {value || DateTime.local().year}
                      </Typography>
                    </Box>
                  )}
                >
                  {Array.from({ length: 5 }, (_, i) => DateTime.local().year - i).map((year) => (
                    <MenuItem key={year} value={year} sx={{ fontFamily: "'Roboto', sans-serif" }}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          borderRadius: '24px',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(145deg, rgba(60, 80, 100, 0.9), rgba(40, 60, 80, 0.9))'
            : 'linear-gradient(145deg, #ffffff, #f0f4f8)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        <Fade in={!loading} timeout={1000}>
          <TableContainer
            component={Paper}
            sx={{
              height: '100%',
              background: 'transparent',
              width: '100%',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                width: '10px',
                height: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderRadius: '5px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                borderRadius: '5px',
                '&:hover': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                },
              },
            }}
          >
            {loading || isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  p: 4,
                  background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25)',
                  },
                }}
              >
                <CircularProgress size={70} thickness={4.5} sx={{ color: '#4a6a88' }} />
                <Typography variant="body1" sx={{ mt: 2, color: theme.palette.text.primary, fontFamily: "'Roboto', sans-serif", fontWeight: 500 }}>
                  Loading attendance records...
                </Typography>
              </Box>
            ) : error ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  p: 4,
                  background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25)',
                  },
                }}
              >
                <InfoIcon sx={{ fontSize: 72, color: theme.palette.text.primary, mb: 2 }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                  Error
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: "'Roboto', sans-serif", opacity: 0.8 }}>
                  {error}
                </Typography>
              </Box>
            ) : entries.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  p: 4,
                  background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
                  borderRadius: '20px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25)',
                  },
                }}
              >
                <InfoIcon sx={{ fontSize: 72, color: theme.palette.text.primary, mb: 2 }} />
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                  No Records Found
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: "'Roboto', sans-serif", opacity: 0.8 }}>
                  There are no attendance records for the selected period.
                </Typography>
              </Box>
            ) : (
              <Table stickyHeader sx={{ minWidth: isMobile ? '400px' : '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      onClick={() => requestSort('day')}
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4a6a88, #6a8aa8)',
                        color: '#ffffff',
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #3a5a78, #5a7a98)',
                          transition: 'background 0.2s',
                        },
                        p: isMobile ? 1.2 : 2,
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        width: '15%',
                        fontFamily: "'Roboto', sans-serif",
                        textAlign: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <CalendarIcon fontSize="small" sx={{ color: '#ffffff', fontSize: isMobile ? 16 : 18 }} />
                        <Typography variant="subtitle2">Date</Typography>
                        {getSortDirectionIcon('day')}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4a6a88, #6a8aa8)',
                        color: '#ffffff',
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        p: isMobile ? 1.2 : 2,
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        width: '15%',
                        fontFamily: "'Roboto', sans-serif",
                        textAlign: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <TimeIcon fontSize="small" sx={{ color: '#ffffff', fontSize: isMobile ? 16 : 18 }} />
                        <Typography variant="subtitle2">First Punch</Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4a6a88, #6a8aa8)',
                        color: '#ffffff',
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        p: isMobile ? 1.2 : 2,
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        width: '15%',
                        fontFamily: "'Roboto', sans-serif",
                        textAlign: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <TimeIcon fontSize="small" sx={{ color: '#ffffff', fontSize: isMobile ? 16 : 18 }} />
                        <Typography variant="subtitle2">Last Punch</Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      onClick={() => requestSort('totalEntries')}
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4a6a88, #6a8aa8)',
                        color: '#ffffff',
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #3a5a78, #5a7a98)',
                          transition: 'background 0.2s',
                        },
                        p: isMobile ? 1.2 : 2,
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        width: '15%',
                        fontFamily: "'Roboto', sans-serif",
                        textAlign: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Typography variant="subtitle2">Entries</Typography>
                        {getSortDirectionIcon('totalEntries')}
                      </Box>
                    </TableCell>
                    <TableCell
                      onClick={() => requestSort('totalWorkingTime')}
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4a6a88, #6a8aa8)',
                        color: '#ffffff',
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #3a5a78, #5a7a98)',
                          transition: 'background 0.2s',
                        },
                        p: isMobile ? 1.2 : 2,
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        width: '15%',
                        fontFamily: "'Roboto', sans-serif",
                        textAlign: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <TimeIcon fontSize="small" sx={{ color: '#ffffff', fontSize: isMobile ? 16 : 18 }} />
                        <Typography variant="subtitle2">Work Time</Typography>
                        {getSortDirectionIcon('totalWorkingTime')}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4a6a88, #6a8aa8)',
                        color: '#ffffff',
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        p: isMobile ? 1.2 : 2,
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        width: '25%',
                        fontFamily: "'Roboto', sans-serif",
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="subtitle2">Comment</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                          background: 'linear-gradient(145deg, #f0f4f8, #ffffff)',
                          '& .MuiTypography-root': {
                            color: theme.palette.text.primary,
                          },
                          '& .MuiSvgIcon-root': {
                            color: theme.palette.text.primary,
                          },
                          '& .MuiChip-root': {
                            backgroundColor: alpha('#ffffff', 0.3),
                            '&:hover': {
                              backgroundColor: alpha('#ffffff', 0.4),
                            },
                          },
                          transition: 'all 0.3s ease-in-out',
                        },
                        background: '#ffffff',
                        borderLeft: `4px solid ${theme.palette[getStatusColor(entry)].main}`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '& .MuiTableCell-root': {
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        },
                      }}
                    >
                      <TableCell sx={{ p: isMobile ? 1 : 1.5, fontSize: isMobile ? '0.75rem' : '0.9rem', textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: "'Roboto', sans-serif", color: theme.palette.text.primary }}>
                          {entry.day ? DateTime.fromISO(entry.day).toFormat('EEE, MMM dd, yyyy') : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ p: isMobile ? 1 : 1.5, textAlign: 'center' }}>
                        {entry.firstPunchIn ? (
                          <Chip
                            size="small"
                            label={DateTime.fromISO(entry.firstPunchIn).toFormat('hh:mm:ss a')}
                            color="primary"
                            variant="outlined"
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 'medium',
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              fontFamily: "'Roboto', sans-serif",
                              transition: 'all 0.2s',
                              backgroundColor: alpha('#A3BFFA', 0.2),
                              border: `1px solid #A3BFFA`,
                              '&:hover': {
                                backgroundColor: alpha('#8DA9FA', 0.4),
                                color: '#2C3E50',
                              },
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="N/A"
                            variant="outlined"
                            sx={{
                              borderRadius: '8px',
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              fontFamily: "'Roboto', sans-serif",
                              backgroundColor: alpha(theme.palette.grey[200], 0.2),
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ p: isMobile ? 1 : 1.5, textAlign: 'center' }}>
                        {entry.lastPunchIn ? (
                          <Chip
                            size="small"
                            label={DateTime.fromISO(entry.lastPunchIn).toFormat('hh:mm:ss a')}
                            color="secondary"
                            variant="outlined"
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 'medium',
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              fontFamily: "'Roboto', sans-serif",
                              transition: 'all 0.2s',
                              backgroundColor: alpha('#E0C3FC', 0.2),
                              border: `1px solid #E0C3FC`,
                              '&:hover': {
                                backgroundColor: alpha('#D1A3FF', 0.4),
                                color: '#2C3E50',
                              },
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="N/A"
                            variant="outlined"
                            sx={{
                              borderRadius: '8px',
                              fontSize: isMobile ? '0.7rem' : '0.8rem',
                              fontFamily: "'Roboto', sans-serif",
                              backgroundColor: alpha(theme.palette.grey[200], 0.2),
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ p: isMobile ? 1 : 1.5, textAlign: 'center' }}>
                        <Chip
                          size="small"
                          label={entry.totalEntries || 0}
                          color="default"
                          sx={{
                            minWidth: '40px',
                            borderRadius: '8px',
                            fontWeight: 'medium',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            fontFamily: "'Roboto', sans-serif",
                            transition: 'all 0.2s',
                            backgroundColor: alpha(theme.palette.grey[200], 0.2),
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.grey[300], 0.4),
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: isMobile ? 1 : 1.5, textAlign: 'center' }}>
                        <Chip
                          size="small"
                          label={entry.totalWorkingTime ? formatDuration(entry.totalWorkingTime) : '00:00:00'}
                          color={getStatusColor(entry)}
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 'medium',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            fontFamily: "'Roboto', sans-serif",
                            transition: 'all 0.2s',
                            backgroundColor: alpha(theme.palette[getStatusColor(entry)].light, 0.2),
                            border: `1px solid ${theme.palette[getStatusColor(entry)].main}`,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette[getStatusColor(entry)].light, 0.4),
                              color: theme.palette[getStatusColor(entry)].contrastText,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: isMobile ? 1 : 1.5, fontSize: isMobile ? '0.75rem' : '0.9rem', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: "'Roboto', sans-serif", opacity: 0.8 }}>
                          {entry.comment || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Fade>
      </Box>
    </Box>
  );
};

export default DailyRecordsTable;