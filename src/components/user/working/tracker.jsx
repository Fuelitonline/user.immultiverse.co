import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  useTheme,
  Avatar,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../../middlewares/auth';
import { useGet, usePost } from '../../../hooks/useApi';
import { DateTime } from 'luxon';
import { PlayArrow, Stop, CalendarToday, CalendarMonth } from '@mui/icons-material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

const WorkTrackerTabs = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [entries, setEntries] = useState([]);
  const [totalWorkTime, setTotalWorkTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [intervalId, setIntervalId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(DateTime.local().month); // 1-based month
  const [selectedYear, setSelectedYear] = useState(DateTime.local().year);
  const { data : ipAddress}  = useGet('/company/policy/ip-address-get')
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const userId = user?._id;
  const [localIP, setPublicIP] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const [screenshot, setScreenshot] = useState(null);  // To store the base64 screenshot
  const [screenshotInterval, setScreenshotInterval] = useState(null);

  const {mutate:sendScreenshotMutation} = usePost('employee/tracking-file-upload')
  const startRecording = async () => {
    console.log('Starting recording...');
    try {
      // Check if the app has screen capture access
      const hasAccess = await window.electronApi.main.getScreenAccess();
      if (!hasAccess) {
        await window.electronApi.main.openScreenSecurity();
        return;
      }

      // Get screen sources (screens/windows available for capture)
      const sources = await window.electronApi.main.getScreenSources();
      if (sources.length === 0) {
        alert('No screen sources available');
        return;
      }

      // Select the first available source for screen capture
      const selectedSource = sources[0];

      // Request the screen media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
          },
        },
      });

      // Play the video stream in the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }

      setIsRecording(true);

      // Set up the interval to capture a screenshot every 30 seconds
      const intervalId = setInterval(() => {
        captureScreenshot();
      }, 120000); // 30000 milliseconds = 30 seconds
      setScreenshotInterval(intervalId);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Function to stop the recording
  const stopRecording = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }

    setIsRecording(false);

    // Clear the screenshot interval when stopping the recording
    if (screenshotInterval) {
      clearInterval(screenshotInterval);
      setScreenshotInterval(null);
    }
  };
  const sendScreenshotToServer = async (base64Image, userId) => {
    console.log(base64Image, userId, 'jai batttt')
      const send = await sendScreenshotMutation({
        employeeId: userId,
        file: base64Image
      })
   
      console.log(send)
  };
  // Function to capture a screenshot and update the state
  const captureScreenshot = async () => {
    try {
      const screenshotBase64 = await window.electronApi.main.captureScreenshot();
      console.log('Captured screenshot:', screenshotBase64);
      setScreenshot(screenshotBase64); // Update the state with the base64 screenshot
       console.log(screenshotBase64.base64Image, userId)
      await sendScreenshotToServer(screenshotBase64.base64Image, userId);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  // Function to send the screenshot to the server



  useEffect(() => {
    const fetchPublicIP = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setPublicIP(response.data.ip);
      } catch (err) {
        setError('Could not fetch public IP address');
      }
    };

    fetchPublicIP();
  }, []);
   

  // Fetch daily records based on month and year
  const { data: dailyRecords, isLoading: isFetchingDailyRecords, error: fetchError, refetch: fetchDailyRecords } = useGet(
    'employee/work-tracking/daily-records',
    {
      userId,
      startDate: DateTime.fromObject({ year: selectedYear, month: selectedMonth, day: 1 }).toISODate(),
      endDate: DateTime.fromObject({ year: selectedYear, month: selectedMonth }).endOf('month').toISODate()
    }
  );
  const [currentStatus, setCurrentStatus] = useState(dailyRecords?.data?.data?.currentStatus?.isPunchedIn || null);
  // Mutation for saving records
  const { mutate: saveRecord, isLoading: isSavingRecord } = usePost('employee/work-tracking/save', {}, 'dailyRecords');

  useEffect(() => {
    if (fetchError) {
      setError('Failed to fetch daily records. Please try again later.');
      return;
    }
    if (dailyRecords) {
      setEntries(dailyRecords?.data?.data?.records || []);
      setTotalWorkTime(formatDuration(dailyRecords?.data?.data?.totalWorkTime * 3600000)); // Convert hours to milliseconds
      setCurrentStatus(dailyRecords?.data?.data?.currentStatus?.isPunchedIn || null);
    }
  }, [dailyRecords, fetchError]);



  useEffect(() => {
    const storedPunchInTime = localStorage.getItem('punchInTime');
    if (storedPunchInTime) {
      const startTime = DateTime.fromISO(storedPunchInTime);
      if (startTime.isValid) {
        setPunchInTime(startTime);
        startDurationCounter(startTime);
      }
    }
  }, []);

  useEffect(() => {
    if (tabIndex === 1) {
      fetchDailyRecords();
    }
  }, [tabIndex, selectedMonth, selectedYear]);

  const startDurationCounter = (startTime) => {
    // Clear any existing interval to avoid multiple intervals running
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    const id = setInterval(() => {
      const now = DateTime.local();
      const durationMs = now.diff(startTime, 'milliseconds').milliseconds;
      setDuration(formatDuration(durationMs));
    }, 1000);
    setIntervalId(id);
  };

  const stopDurationCounter = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };


  useEffect(() => {
      if(!dailyRecords?.data?.data?.currentStatus?.isPunchedIn){
          localStorage.removeItem('punchInTime');
      }
  },[dailyRecords])

  const getPublicIp = async () => {
    try {
      // Fetch the public IP using ipify
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;  // Return the public IP address
    } catch (error) {
      console.error('Error retrieving public IP:', error);
      return null;  // Return null in case of an error
    }
  };
 

  const handlePunchIn = async () => {
    setLoading(true);
  
    try {
      // Uncomment if you need the network IP check
      // const ip = await getPublicIp();
      // console.log(ip, ipAddress?.data?.data?.routerIp);
      // if (ip === ipAddress?.data?.data?.routerIp) {
  
      const now = DateTime.local();
      const punchInData = {
        userId,
        punchIn: now.toISO(),  // Get the current time in ISO format
        punchOut: null,  // Set punchOut as null since this is a punch-in action
        comment
      };
  
      // Call the saveRecord function (assuming it's the function for punching in)
      saveRecord(punchInData, {
        onSuccess: (data) => {
          if (data?.data !== null) {
            setPunchInTime(now); // Store the punch-in time locally
            localStorage.setItem('punchInTime', now.toISO()); // Store in localStorage
            startDurationCounter(now); // Start the counter for punch duration
            setError(null); // Reset error message on successful punch-in
            fetchDailyRecords(); // Fetch updated daily records
            startRecording();
          }
          else {
            setError(data?.error?.error || 'Failed to punch in. Please try again later.');
          }
          setLoading(false); // Set loading to false after success
        },
        onError: (error) => {
          console.error('Punch-in failed:', error);
          setError(error?.response?.error?.error || 'Failed to punch in. Please try again later.');
          setLoading(false); // Set loading to false after error
        }
      });
  
      // } else {
      //   setError('You are not allowed to punch in from this network');
      //   setLoading(false);
      // }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred. Please try again later.');
      setLoading(false); // Set loading to false in case of an unexpected error
    }
  };
  

  function convertFractionOfDay(fractionOfDay) {
    // Total seconds in a day
    const secondsInDay = 24 * 60 * 60;

    // Convert the fraction of day to total seconds
    const totalSeconds = fractionOfDay * secondsInDay;

    // Calculate days, hours, minutes, seconds
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Format the result
    return `${days}d-${hours}h-${minutes}m-${seconds}s`;
}

  const handlePunchOut = () => {


   
    const now = DateTime.local();
    saveRecord({
      userId,
      punchIn: punchInTime && punchInTime.toISO(),
      punchOut: now.toISO(),
      comment
    }, {
      onSuccess: (data) => {
         console.log(data)
        setPunchOutTime(now);
        stopDurationCounter();
        localStorage.removeItem('punchInTime');
        setPunchInTime(null);
        setPunchOutTime(null);
        setComment('');
        setDuration('00:00:00');
        fetchDailyRecords();
        setError(null);
        stopRecording();
      },
      onError: (error) => {
        console.error('Punch-out failed:', error);
        setError('Failed to punch out. Please try again later.');
      }
    });
  };

  const formatDuration = (durationMs) => {
    const hours = String(Math.floor(durationMs / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((durationMs % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const renderTab1 = () => (
    <Box p={1} width={'100%'} >
      <Grid sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}>
        <Grid sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.2rem',
        }}>
             <Avatar src={user?.avatar} sx={{ width: 40, height: 40 }} />
              <Typography sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginTop: '1rem',
                padding: '5px 20px ',
                
              }}> 👋 {user?.name  ? user?.name : user?.companyName} </Typography>
              <Grid display={'flex'} alignItems={'center'} gap={'0.5rem'}>
              <Typography sx={{
  color: dailyRecords?.data?.data?.currentStatus?.isPunchedIn === true ? 'green' : 'red'
}}>
                    You are punch {dailyRecords?.data?.data?.currentStatus?.isPunchedIn === true ? 'In' : 'Out'} 

              </Typography>
              <Typography sx={{
              }}>
                    punch in - {dailyRecords?.data?.data?.currentStatus?.punchIn ? DateTime.fromISO(dailyRecords?.data?.data?.currentStatus?.punchIn).toFormat('dd MMM yyyy hh:mm:ss a') : 'N/A'}
              </Typography>
              </Grid>
              {punchInTime && (
        <Typography variant="body1"  sx={{
          marginTop: '5px 30px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          padding: '5px 20px',
          borderRadius: '5px',
        }}>
          Current Duration: {duration}
        </Typography>
      )}
        </Grid>
        <Grid width={'100%'} mt={2}>
          <TextField
            label="Comment"
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            width={'100%'}
            variant="outlined"
            placeholder='Enter your comment here...'
            autoFocus
          />
        </Grid>
        <Grid>
  {/* Display "Punch Out" button if punchInTime is set and punchOutTime is not set */}
  { currentStatus ? (
    <Grid item>
      <IconButton
        variant="contained"
        color="secondary"
        onClick={handlePunchOut}
        style={{ 
          backgroundColor: '#e03a61',
          borderRadius: '5px',
          fontSize: '14px',
          padding: '5px 10px',
          color: 'white',
         }}
      >
       {loading ? (
  <CircularProgress size={20} />
) : (
  <>
    Punch Out <LogoutIcon sx={{ marginLeft: '5px', color: 'white' }} />
  </>
)}
      </IconButton>
    </Grid>
  ) : (
    // Otherwise, display the "Punch In" button if punchInTime is not set and not saving record
    <Grid item>
      <IconButton
        variant="contained"
        color="primary"
        onClick={handlePunchIn}
        disabled={punchInTime !== null || isSavingRecord}
        style={{ 
          backgroundColor: '#487ae6',
          borderRadius: '5px',
          fontSize: '14px',
          padding: '5px 10px',
          color: 'white',
         }}
      >
{loading ? (
  <CircularProgress size={20} />
) : (
  <>
    Punch In <LoginIcon sx={{ marginLeft: '5px', color: 'white' }} />
  </>
)}

      
      </IconButton>
    </Grid>
  )}
</Grid>
      </Grid>
     
      {error && (
        <Typography variant="body2" color="error" style={{ marginTop: 16 }}>
          {error}
        </Typography>
      )}
    </Box>
  );

  const renderTab2 = () => (
    <Box p={2} sx={{
      borderRadius: '25px',
    }}>
      <Grid container gap={2} sx={{
        borderRadius: '25px',
        padding: '5px',
        backgroundColor: useTheme().palette.background.default,
        fontSize: '12px',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Typography gutterBottom>
        Total Work Time for {DateTime.fromObject({ year: selectedYear, month: selectedMonth }).toFormat('MMMM yyyy')}
      </Typography>
      <Typography gutterBottom>
       {dailyRecords?.data?.data?.totalWorkTime ? formatDuration(dailyRecords?.data?.data?.totalWorkTime * 3600000) : '00:00:00'}
      </Typography>
      </Grid>
      
      <Grid container spacing={2} style={{ marginTop: 16 }}>
        <Grid item xs={12} md={6}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Month"
              sx={{
                borderRadius: '20px',
                backgroundColor: useTheme().palette.background.default,
                border: 'none',
                outline: 'none',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                },
                '& .MuiSelect-select': {
                  padding: '8px 16px',
                },
                '& .MuiSelect-icon': {
                  color: 'rgba(0, 0, 0, 0.54)',
                },
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1)?.map(month => (
                <MenuItem key={month} value={month}>{DateTime.fromObject({ month }).toFormat('MMMM')}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
      value={selectedYear}
      onChange={handleYearChange}
      label="Year"
      sx={{
        borderRadius: '20px',
        backgroundColor: useTheme().palette.background.default,
        border: 'none',
        outline: 'none',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
        },
        '&.Mui-focused': {
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
        },
        '& .MuiSelect-select': {
          padding: '8px 16px',
        },
        '& .MuiSelect-icon': {
          color: 'rgba(0, 0, 0, 0.54)',
        },
      }}
    >
      {Array.from({ length: 5 }, (_, i) => DateTime.local().year - i).map(year => (
        <MenuItem key={year} value={year}>
          {year}
        </MenuItem>
      ))}
    </Select>
          </FormControl>
        </Grid>
      </Grid>
      <TableContainer component={Paper} style={{ marginTop: 16 , boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', height: '55vh', overflow: 'auto'}}>
        <Table>
          <TableHead >
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>First Punch In</TableCell>
              <TableCell>Last Punch In</TableCell>
              <TableCell>Total Entries</TableCell>
              <TableCell>Total Working Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries?.map((entry, index) => (
              <TableRow key={index} sx={{
                backgroundColor: theme.palette.background.default,
              }}>
                <TableCell>{DateTime.fromISO(entry.day).toFormat('MM/dd/yyyy')}</TableCell>
                <TableCell>{entry.firstPunchIn ? DateTime.fromISO(entry.firstPunchIn).toFormat('hh:mm:ss a') : 'N/A'}</TableCell>
                <TableCell>{entry.lastPunchIn ? DateTime.fromISO(entry.lastPunchIn).toFormat('hh:mm:ss a') : 'N/A'}</TableCell>
                <TableCell>{entry.totalEntries}</TableCell>
                <TableCell>{entry.totalWorkingTime ? formatDuration(entry.totalWorkingTime * 3600000) : '00:00:00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{
      borderRadius: '25px',
      width: '100%',
       }}>
     <Tabs
  value={tabIndex}
  onChange={handleTabChange}
  sx={{
    width: '100%',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '5px',
    display: 'flex',
    color: 'white',
    alignItems: 'center', // Center items vertically
    '& .MuiTabs-indicator': {
      color: 'white',
      backgroundColor: 'white', // Indicator color
      height: '7px', // Adjust the height of the indicator
      bottom: 0, // Align the indicator to the bottom of the tab container
    },
    '& .MuiTab-root': {
      color: 'white', // Apply white color to the tab text
      minHeight: '48px', // Ensure sufficient height for tabs to center the indicator
      ml: 1, 
    },
    '&css-55nji4-MuiButtonBase-root-MuiTab-root .Mui-selected': {
      color: 'white !important' , // Ensure selected tab text is white
    },
  }}
>
        <Tab label="Punch In/Out" />
        <Tab label="Daily Records"/>
      </Tabs>
      {tabIndex === 0 && renderTab1()}
      {tabIndex === 1 && renderTab2()}
    </Box>
  );
};

export default WorkTrackerTabs;
