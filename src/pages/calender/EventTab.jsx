

// // EventTab.jsx - Full Updated Code with Role Validation
// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import { useGet, usePost } from '../../hooks/useApi';
// import { useQueryClient } from '@tanstack/react-query';
// import moment from 'moment-timezone';
// import {
//   Box,
//   TextField,
//   Autocomplete,
//   Button,
//   Typography,
//   Alert,
//   Paper,
//   Chip,
//   CircularProgress,
//   TextareaAutosize
// } from '@mui/material';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { useDrop } from 'react-dnd';
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import CloseIcon from '@mui/icons-material/Close';
// import GetFileThumbnail from './getFileThumnail'; 
// import { useAuth } from '../../middlewares/auth/authContext'; 

// // Theme configuration remains the same
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#6366f1', // Indigo blue
//     },
//     secondary: {
//       main: '#eef2ff', // Light indigo
//     },
//     background: {
//       default: '#f9fafb',
//       paper: '#FFFFFF',
//     },
//     text: {
//       primary: '#333333',
//       secondary: '#666666',
//     },
//   },
//   typography: {
//     h6: {
//       fontSize: '1rem',
//       fontWeight: 500,
//       color: '#333333',
//     },
//     body2: {
//       fontSize: '0.875rem',
//       color: '#666666',
//     },
//     // ✅ Added caption style for labels
//     caption: {
//         fontSize: '0.7rem', // Smaller than default caption
//         lineHeight: 1, 
//     }
//   },
//   components: {
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           backgroundColor: '#FFFFFF',
//           borderRadius: '4px',
//           '& .MuiOutlinedInput-root': {
//             // ✅ Compact size adjustments
//             height: '32px', 
//             padding: '0 8px',
//             fontSize: '12px',
//             '& input': {
//                 padding: '0', 
//                 height: '32px',
//                 fontSize: '12px',
//             },
            
//             '& fieldset': { borderColor: '#e5e7eb' },
//             '&:hover fieldset': { borderColor: '#6366f1' },
//             '&.Mui-focused fieldset': {
//               borderColor: '#6366f1',
//               boxShadow: '0 0 0 1px #6366f1',
//             },
//           },
//         },
//       },
//     },
//     MuiAutocomplete: {
//       styleOverrides: {
//         root: {
//           '& .MuiOutlinedInput-root': {
//             backgroundColor: '#FFFFFF',
//             borderRadius: '4px',
//             // ✅ Compact size adjustments
//             minHeight: '32px', 
//             padding: '4px 8px',
//             fontSize: '12px',
            
//             '& input': {
//                 padding: '0',
//                 fontSize: '12px',
//             },
//             '& .MuiChip-root': { 
//                 height: '20px', 
//                 fontSize: '10px',
//                 margin: '1px',
//             },
//             '& .MuiSvgIcon-root': { 
//                 fontSize: '18px',
//             },
            
//             '& fieldset': { borderColor: '#e5e7eb' },
//             '&:hover fieldset': { borderColor: '#6366f1' },
//             '&.Mui-focused fieldset': {
//               borderColor: '#6366f1',
//               boxShadow: '0 0 0 1px #6366f1',
//             },
//           },
//         },
//       },
//     },
//   },
// });

// // Predefined event types
// const PREDEFINED_EVENT_TYPES = ['Meeting', 'Holiday', 'Training', 'Presentation', 'Vacation'];

// // Define roles allowed to create an event
// const AUTHORIZED_ROLES = ['manager', 'admin', 'superadmin', 'hr'];

// function EventTab({ 
//   selectedDate, 
//   selectedDateRange, 
//   description, 
//   setDescription, 
//   setErrorMessage, 
//   onEventAdded, 
//   file, 
//   setFile 
// }) {
//   const { user } = useAuth(); 
//   const queryClient = useQueryClient();
//   const fileInputRef = useRef(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [fileUrl, setFileUrl] = useState(null); 
//   const [eventTitle, setEventTitle] = useState('');
//   const [eventType, setEventType] = useState('');
//   const [color, setColor] = useState('#3f51b5');
  
//   // Normalize selected date/range for initial time setting
//   const initialDate = selectedDateRange?.start && moment(selectedDateRange.start).isValid()
//       ? selectedDateRange.start
//       : selectedDate && moment(selectedDate).isValid()
//       ? selectedDate
//       : moment().toISOString();
      
//   const [eventStart, setEventStart] = useState(
//     moment(initialDate).tz('UTC').format('YYYY-MM-DDTHH:mm')
//   );
  
//   const [eventEnd, setEventEnd] = useState(
//     selectedDateRange?.end && moment(selectedDateRange.end).isValid()
//       ? moment(selectedDateRange.end).add(1, 'hour').tz('UTC').format('YYYY-MM-DDTHH:mm')
//       : moment(initialDate).add(1, 'hour').tz('UTC').format('YYYY-MM-DDTHH:mm')
//   );

//   // API hooks
//   const { data: eventTypes, isLoading: eventTypesLoading } = useGet(
//     '/employee/event/types',
//     {},
//     {},
//     { queryKey: ['eventTypes'] }
//   );
  
//   const addEventMutation = usePost('/employee/event/add', {}, 'events');

//   // Combine predefined and API event types
//   const apiTypes = Array.isArray(eventTypes?.data?.data) ? eventTypes.data.data : [];
//   const allEventTypes = [...new Set([...PREDEFINED_EVENT_TYPES, ...apiTypes])].sort();

//   // Generate dates in range (for display only)
//   const getDatesInRange = useCallback((start, end) => {
//     if (!start || !end || !moment(start).isValid() || !moment(end).isValid()) return [];
//     const startDate = moment(start).tz('UTC').startOf('day');
//     const endDate = moment(end).tz('UTC').startOf('day');
//     const dates = [];
//     let currentDate = startDate.clone();
//     while (currentDate.isSameOrBefore(endDate)) {
//       dates.push(currentDate.toISOString());
//       currentDate.add(1, 'day');
//     }
//     return dates;
//   }, []);

//   const eventDates = selectedDateRange && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()
//     ? getDatesInRange(selectedDateRange.start, selectedDateRange.end)
//     : selectedDate && moment(selectedDate).isValid()
//     ? [moment(selectedDate).toISOString()]
//     : [];
  
//   // Convert file to base64 buffer
//   const toBase64 = useCallback(
//     (file) =>
//       new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.readAsArrayBuffer(file);
//         reader.onload = () => {
//           const buffer = new Uint8Array(reader.result);
//           resolve(Array.from(buffer));
//         };
//         reader.onerror = (error) => reject(error);
//       }),
//     []
//   );

//   // File handling functions (handleDragEnter, handleDragLeave, etc. kept as is)
//   const handleDragEnter = useCallback(() => setDragActive(true), []);
//   const handleDragLeave = useCallback(() => setDragActive(false), []);
//   const handleDragOver = useCallback((e) => e.preventDefault(), []);
//   const handleDrop = useCallback(
//     (e) => {
//       e.preventDefault();
//       setDragActive(false);
//       if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//         const newFile = e.dataTransfer.files[0];
//         setFile(newFile);
//         if (fileUrl) URL.revokeObjectURL(fileUrl);
//         setFileUrl(URL.createObjectURL(newFile));
//       } else {
//         setErrorMessage('No file dropped');
//       }
//     },
//     [setFile, setErrorMessage, fileUrl]
//   );
//   const handleFileSelect = useCallback(
//     (e) => {
//       if (e.target.files && e.target.files[0]) {
//         const newFile = e.target.files[0];
//         setFile(newFile);
//         if (fileUrl) URL.revokeObjectURL(fileUrl);
//         setFileUrl(URL.createObjectURL(newFile));
//       } else {
//         setErrorMessage('No file selected');
//       }
//     },
//     [setFile, setErrorMessage, fileUrl]
//   );
//   const handleFileRemove = useCallback(() => {
//     setFile(null);
//     if (fileUrl) {
//       URL.revokeObjectURL(fileUrl);
//       setFileUrl(null);
//     }
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   }, [setFile, fileUrl]);
//   const triggerFileInput = useCallback(() => fileInputRef.current.click(), []);
//   const getFileSizeText = useCallback((file) => {
//     if (!file) return '';
//     const size = file.size;
//     if (size < 1024) return `${size} B`;
//     if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
//     return `${(size / (1024 * 1024)).toFixed(1)} MB`;
//   }, []);

//   const [{ isOver }, drop] = useDrop({
//     accept: 'file',
//     drop: (item, monitor) => {},
//     collect: (monitor) => ({ isOver: monitor.isOver() }),
//   });

//   useEffect(() => {
//     if (file && (!fileUrl || fileUrl.includes('blob:')) && !fileUrl?.startsWith('blob:')) {
//       const newUrl = URL.createObjectURL(file);
//       setFileUrl(newUrl);
//     } else if (!file && fileUrl) {
//       URL.revokeObjectURL(fileUrl);
//       setFileUrl(null);
//     }
//     return () => {
//       if (fileUrl) {
//         URL.revokeObjectURL(fileUrl);
//       }
//     };
//   }, [file, fileUrl]);


//   // Validate date
//   const isValidDate = (dateString) => {
//     return dateString && moment(dateString).isValid();
//   };

//   // Handle form submission
//   const handleSubmit = useCallback(async () => {
    
//     // --- 1. FRONTEND ROLE CHECK ---
//     const userRole = user?.role?.toLowerCase();
//     if (!AUTHORIZED_ROLES.includes(userRole)) {
//         setErrorMessage("🚫 Permission Denied: Only Manager, Admin, SuperAdmin, or HR can create events.");
//         return;
//     }
    
//     if (!eventTitle.trim() || !eventType.trim() || !eventStart || !eventEnd || !description.trim() || !color) {
//       setErrorMessage('All event fields including Color are required');
//       return;
//     }
//     if (!isValidDate(eventStart) || !isValidDate(eventEnd)) {
//       setErrorMessage('Invalid start or end date/time');
//       return;
//     }
//     if (eventDates.length === 0) {
//       setErrorMessage('No valid date(s) selected');
//       return;
//     }

//     try {
//       setErrorMessage('');
//       let filePayload = null;
//       if (file) {
//         const bufferArray = await toBase64(file);
//         filePayload = {
//           buffer: bufferArray,
//           name: file.name,
//           type: file.type,
//           size: file.size,
//         };
//       }

//       // 1. Determine the overall Start Date (first selected day + Start Time)
//       const firstSelectedDate = moment(eventDates[0]).tz('UTC');
//       const startMoment = moment(eventStart).tz('UTC');
//       const finalStartDateTime = firstSelectedDate
//         .clone()
//         .set({
//           hour: startMoment.hour(),
//           minute: startMoment.minute(),
//           second: 0,
//           millisecond: 0,
//         })
//         .toISOString();

//       // 2. Determine the overall End Date (last selected day + End Time)
//       const lastSelectedDate = moment(eventDates[eventDates.length - 1]).tz('UTC');
//       const endMoment = moment(eventEnd).tz('UTC');
//       const finalEndDateTime = lastSelectedDate
//         .clone()
//         .set({
//           hour: endMoment.hour(),
//           minute: endMoment.minute(),
//           second: 0,
//           millisecond: 0,
//         })
//         .toISOString();
        
//       // Validation Check: End time/date must be after Start time/date
//       if (moment(finalStartDateTime).isSameOrAfter(moment(finalEndDateTime))) {
//           setErrorMessage('End Time/Date must be after Start Time/Date.');
//           return;
//       }
      
//       const eventData = {
//         title: eventTitle,
//         type: eventType.trim(),
//         start: finalStartDateTime, // Range Start
//         end: finalEndDateTime,     // Range End
//         description,
//         color,
//         selectedEmployees: [],
//       };

//       const finalEventData = filePayload ? { ...eventData, file: filePayload } : eventData;

//       // 3. Perform a single API call
//       await addEventMutation.mutateAsync(finalEventData);

//       // Reset Form
//       setEventTitle('');
//       setEventType('');
//       const resetDate = selectedDateRange?.start || selectedDate || moment().toISOString();
//       setEventStart(moment(resetDate).tz('UTC').format('YYYY-MM-DDTHH:mm'));
//       setEventEnd(moment(resetDate).add(1, 'hour').tz('UTC').format('YYYY-MM-DDTHH:mm'));
//       setDescription('');
//       setColor('#3f51b5');
//       handleFileRemove();
//       onEventAdded();
      
//       // Invalidate queries to refresh the 'View' tab
//       queryClient.invalidateQueries(['events']); 
      
//     } catch (error) {
//       // --- 2. BACKEND ERROR CATCH ---
//       const backendMessage = error.response?.data?.error || error.response?.data?.message;
      
//       if (backendMessage && backendMessage.includes("permission to create an event")) {
//           setErrorMessage("🚫 Permission Denied: You are not authorized to create events with your current role.");
//       } else {
//           const errorMessage = backendMessage || error.message || 'Unknown error occurred';
//           setErrorMessage(`Failed to save event: ${errorMessage}`);
//       }
//     }
//   }, [
//     eventTitle,
//     eventType,
//     eventStart,
//     eventEnd,
//     description,
//     eventDates,
//     color,
//     setDescription,
//     setErrorMessage,
//     addEventMutation,
//     queryClient,
//     selectedDate,
//     selectedDateRange,
//     onEventAdded,
//     file,
//     handleFileRemove,
//     toBase64,
//     user?.role 
//   ]);

//   // Start Time onChange handler
//   const handleStartTimeChange = useCallback((e) => {
//     const timeValue = e.target.value;
//     if (!timeValue) return;

//     const [hours, minutes] = timeValue.split(':');
//     const newStart = moment(eventStart)
//       .tz('UTC')
//       .set({ hour: parseInt(hours), minute: parseInt(minutes), second: 0, millisecond: 0 })
//       .format('YYYY-MM-DDTHH:mm');
//     setEventStart(newStart);
//   }, [eventStart]);

//   // End Time onChange handler
//   const handleEndTimeChange = useCallback((e) => {
//     const timeValue = e.target.value;
//     if (!timeValue) return;
    
//     const [hours, minutes] = timeValue.split(':');
//     const newEnd = moment(eventEnd)
//       .tz('UTC')
//       .set({ hour: parseInt(hours), minute: parseInt(minutes), second: 0, millisecond: 0 })
//       .format('YYYY-MM-DDTHH:mm');
//     setEventEnd(newEnd);
//   }, [eventEnd]);
  
//   // Format current eventStart/End time for the time input
//   const startTimeValue = eventStart ? moment(eventStart).tz('UTC').format('HH:mm') : '';
//   const endTimeValue = eventEnd ? moment(eventEnd).tz('UTC').format('HH:mm') : '';

//   // Check if current user role is authorized for disabling the submit button/form
//   const isAuthorized = AUTHORIZED_ROLES.includes(user?.role?.toLowerCase());

//   return (
//     <ThemeProvider theme={theme}>
//       {/* ✅ Reduced main gap from 2 to 1 */}
//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
        
//         {/* Permission Alert (Optional, but recommended) */}
//         {!isAuthorized && (
//             <Alert severity="error" sx={{ my: 0.5, p: '4px 8px', '& .MuiAlert-icon': { p: 0, mr: 1 } }}>
//                 <Typography variant="caption" fontWeight="bold">
//                     🚫 Permission Denied:
//                 </Typography> 
//                 <Typography variant="caption">
//                     Your current role (**{user?.role || 'Employee'}**) cannot create events.
//                 </Typography>
//             </Alert>
//         )}
        
//         {/* Event Title */}
//         <Box>
//           {/* ✅ Reduced mb */}
//           <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//             Event Title
//           </Typography>
//           <TextField
//             variant="outlined"
//             fullWidth
//             value={eventTitle}
//             onChange={(e) => setEventTitle(e.target.value)}
//             placeholder="Enter event title"
//             size="small"
//             disabled={!isAuthorized} 
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 height: '32px', // ✅ Fixed Height
//                 fontSize: '12px',
//                 '& input': { padding: '0', height: '32px', fontSize: '12px' },
//                 '&:hover': { borderColor: !isAuthorized ? '#e5e7eb' : '#6366f1' },
//                 '&.Mui-focused': { borderColor: !isAuthorized ? '#e5e7eb' : '#6366f1', boxShadow: !isAuthorized ? 'none' : '0 0 0 1px #6366f1' },
//               },
//             }}
//           />
//         </Box>

//         {/* Event Type - Free Style with Autocomplete */}
//         <Box>
//           {/* ✅ Reduced mb */}
//           <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//             Event Type
//           </Typography>
//           <Autocomplete
//             freeSolo
//             options={allEventTypes}
//             value={eventType}
//             onChange={(event, newValue) => setEventType(newValue || '')}
//             onInputChange={(event, newInputValue) => setEventType(newInputValue)}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 variant="outlined"
//                 fullWidth
//                 placeholder="Select or type custom type"
//                 size="small"
//                 disabled={!isAuthorized} 
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     minHeight: '32px', // ✅ Compact Height
//                     fontSize: '12px',
//                     '& input': { fontSize: '12px', padding: '0' },
//                   },
//                 }}
//               />
//             )}
//             renderOption={(props, option) => (
//               <Box component="li" {...props}>
//                 <Chip label={option} size="small" variant="outlined" sx={{ mr: 1, height: '20px', fontSize: '10px' }} />
//                 <Typography variant="caption">{option}</Typography> {/* ✅ Smaller option text */}
//               </Box>
//             )}
//             loading={eventTypesLoading}
//             loadingText="Loading event types..."
//             noOptionsText="Type to create a custom event type"
//             size="small"
//             sx={{ 
//                 '& .MuiInputBase-root': { padding: '4px 8px' }, // ✅ Override padding
//             }}
//           />
//         </Box>
        
//         {/* Date Range & Time (Combined into one section) */}
//         <Box>
//             {/* ✅ Compact date display and time inputs side-by-side */}
//             <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//                 Date Range & Time (UTC)
//             </Typography>
            
//             {/* Display Dates */}
//             <Typography 
//                 variant="body2" 
//                 color={eventDates.length > 0 ? 'text.primary' : 'error'}
//                 sx={{ fontSize: '12px', fontWeight: 'bold' }} // ✅ Smaller font
//             >
//                 {eventDates.length > 0
//                 ? eventDates.length === 1
//                     ? moment(eventDates[0]).tz('UTC').format('MMMM D, YYYY')
//                     : `${moment(eventDates[0]).tz('UTC').format('MMM D, YYYY')} - ${moment(eventDates[eventDates.length - 1]).tz('UTC').format('MMM D, YYYY')}`
//                 : 'No valid date selected'}
//             </Typography>
//             <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', mb: 0.5 }}>
//                 {eventDates.length > 0
//                     ? `Single entry spanning ${eventDates.length} day(s).`
//                     : 'Select dates on calendar.'}
//             </Typography>

//             {/* Time Inputs */}
//             <Box display="grid" gridTemplateColumns="1fr 1fr" gap={0.5} mt={0.5}>
//                 {/* Start Time */}
//                 <TextField
//                   type="time"
//                   label="Start Time" // ✅ Added label for clarity
//                   variant="outlined"
//                   fullWidth
//                   value={startTimeValue}
//                   onChange={handleStartTimeChange}
//                   InputLabelProps={{ shrink: true, sx: { fontSize: '10px', top: -3 } }} // ✅ Smaller Label
//                   inputProps={{ step: 300 }}
//                   size="small"
//                   disabled={!isAuthorized} 
//                   sx={{
//                       '& .MuiInputBase-root': { height: '32px', fontSize: '12px' },
//                   }}
//                 />
//                 {/* End Time */}
//                 <TextField
//                   type="time"
//                   label="End Time" // ✅ Added label for clarity
//                   variant="outlined"
//                   fullWidth
//                   value={endTimeValue}
//                   onChange={handleEndTimeChange}
//                   InputLabelProps={{ shrink: true, sx: { fontSize: '10px', top: -3 } }} // ✅ Smaller Label
//                   inputProps={{ step: 300 }}
//                   size="small"
//                   disabled={!isAuthorized} 
//                   sx={{
//                       '& .MuiInputBase-root': { height: '32px', fontSize: '12px' },
//                   }}
//                 />
//             </Box>
//         </Box>


//         {/* Popular Event Types Chips */}
//         <Box>
//           {/* ✅ Reduced mb */}
//           <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//             Quick Select:
//           </Typography>
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
//             {['Meeting', 'Workshop', 'Training', 'Client Visit', 'Team Building', 'Review'].map((type) => (
//               <Chip
//                 key={type}
//                 label={type}
//                 size="small"
//                 variant={eventType === type ? 'filled' : 'outlined'}
//                 onClick={() => isAuthorized && setEventType(type)} 
//                 sx={{
//                   cursor: isAuthorized ? 'pointer' : 'not-allowed',
//                   opacity: !isAuthorized ? 0.6 : 1,
//                   fontSize: '10px', // ✅ Smaller font on chip
//                   height: '20px', // ✅ Smaller chip height
//                   '&:hover': {
//                     backgroundColor: eventType === type ? 'primary.dark' : (isAuthorized ? 'action.hover' : 'inherit'),
//                   },
//                 }}
//               />
//             ))}
//           </Box>
//         </Box>

//         {/* Event Description */}
//         <Box>
//           {/* ✅ Reduced mb */}
//           <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//             Event Description
//           </Typography>
//           {/* ✅ Switched to TextareaAutosize for better compactness control */}
//           <TextareaAutosize
//             className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
//             placeholder="What is the event about?"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             rows={2} // ✅ Reduced rows to 2
//             disabled={!isAuthorized}
//             style={{
//               width: '100%',
//               padding: '5px',
//               borderRadius: '4px',
//               border: '1px solid #e5e7eb',
//               backgroundColor: '#fff',
//               boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//               fontSize: '11px', // ✅ Smaller font
//               outline: 'none',
//               minHeight: '40px', // Ensure a minimum readable height
//               opacity: !isAuthorized ? 0.6 : 1,
//               cursor: !isAuthorized ? 'not-allowed' : 'auto',
//             }}
//           />
//         </Box>

//         {/* Color Picker */}
//         <Box>
//           {/* ✅ Reduced mb */}
//           <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//             Event Color
//           </Typography>
//           {/* ✅ Compact size adjustment */}
//           <Box display="flex" alignItems="center" gap={1}>
//             <input
//               type="color"
//               value={color}
//               onChange={(e) => isAuthorized && setColor(e.target.value)} 
//               disabled={!isAuthorized} 
//               style={{
//                 width: '24px', // ✅ Smallest size
//                 height: '24px', // ✅ Smallest size
//                 padding: '0',
//                 border: '1px solid #e5e7eb',
//                 borderRadius: '4px',
//                 cursor: isAuthorized ? 'pointer' : 'not-allowed',
//                 backgroundColor: 'transparent',
//                 opacity: !isAuthorized ? 0.6 : 1,
//               }}
//             />
//             <Typography
//               variant="caption" // ✅ Smaller Typography
//               fontWeight="medium"
//               sx={{
//                 border: '1px solid #e5e7eb',
//                 borderRadius: '4px',
//                 p: 0.25, // ✅ Minimal padding
//                 minWidth: '70px', // ✅ Smaller width
//                 textAlign: 'center',
//                 bgcolor: '#fff',
//                 boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//                 fontSize: '10px', // ✅ Smallest font
//                 opacity: !isAuthorized ? 0.6 : 1,
//               }}
//             >
//               {color.toUpperCase()}
//             </Typography>
//           </Box>
//         </Box>

//         {/* File Upload */}
//         <Box
//           ref={drop}
//           onDragEnter={handleDragEnter}
//           onDragLeave={handleDragLeave}
//           onDragOver={handleDragOver}
//           onDrop={handleDrop}
//           sx={{
//             border: '1px dashed', // ✅ Thinner border
//             borderColor: dragActive || isOver ? '#6366f1' : '#e5e7eb',
//             bgcolor: dragActive || isOver ? '#eef2ff' : '#f9fafb',
//             borderRadius: '6px', // ✅ Smaller border radius
//             p: 1, // ✅ Reduced padding from 2 to 1
//             textAlign: 'center',
//             transition: 'all 0.2s',
//             pointerEvents: !isAuthorized ? 'none' : 'auto', 
//             opacity: !isAuthorized ? 0.6 : 1,
//             '&:hover': {
//               borderColor: '#6366f1',
//               bgcolor: '#eef2ff',
//             },
//           }}
//         >
//           {!file ? (
//             <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center',    alignItems: 'center', gap: 1 }}> {/* ✅ Reduced gap */}
//               <AttachFileIcon sx={{ color: '#6366f1', fontSize: 16 }} /> {/* ✅ Smaller icon */}
//               <Typography variant="caption" color="text.secondary" fontWeight="medium" lineHeight={1}> {/* ✅ Smaller font */}
//                 Drop file or
//               </Typography>
//               <Button
//                 variant="outlined"
//                 color="primary"
//                 onClick={triggerFileInput}
//                 disabled={!isAuthorized} 
//                 sx={{
//                   textTransform: 'none',
//                   fontSize: '10px', // ✅ Smallest button font
//                   fontWeight: '600',
//                   borderColor: '#6366f1',
//                   color: '#6366f1',
//                   borderRadius: '4px', // ✅ Smaller border radius
//                   px: 1, // ✅ Reduced padding
//                   py: 0, // ✅ Reduced padding
//                   lineHeight: 1.5,
//                   '&:hover': {
//                     bgcolor: '#eef2ff',
//                     borderColor: '#4f46e5',
//                   },
//                 }}
//               >
//                 Browse
//               </Button>
//               <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} disabled={!isAuthorized} />
 
//             </Box>
//           ) : (
//             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', p: 0.5, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}> {/* ✅ Reduced padding */}
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}> {/* ✅ Reduced gap */}
//                 {file.type.startsWith('image/') ? (
//                   <img
//                     src={fileUrl}
//                     alt="File preview"
//                     style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: '4px' }}
//                     onError={(e) => (e.target.src = '/fallback-image.png')} 
//                   />
//                 ) : (
//                   <GetFileThumbnail fileType={file.type} fileUrl={fileUrl} size={32} /> 
//                 )}
//                 <Box>
//                   <Typography variant="body2" color="text.primary" fontWeight="medium" fontSize={11}> {/* ✅ Smaller font */}
//                     {file.name}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary" fontSize={9}> {/* ✅ Smallest font */}
//                     {getFileSizeText(file)}
//                   </Typography>
//                 </Box>
//               </Box>
//               <Button
//                 onClick={handleFileRemove}
//                 disabled={!isAuthorized} 
//                 sx={{ minWidth: 0, p: 0, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
//               >
//                 <CloseIcon sx={{ fontSize: 12 }} /> {/* ✅ Smaller icon */}
//               </Button>
//             </Box>
//           )}
//         </Box>

//         {/* Hidden Submit Button */}
//         <Button
//           id="event-submit"
//           onClick={handleSubmit}
//           disabled={addEventMutation.isLoading || !isAuthorized || !eventTitle.trim() || !eventType.trim() || !eventStart || !eventEnd || !description.trim() || !color || eventDates.length === 0}
//           sx={{ display: 'none' }}
//         >
//           {addEventMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Event'}
//         </Button>
//       </Box>
//     </ThemeProvider>
//   );
// }

// export default EventTab;



import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useGet, usePost } from '../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment-timezone';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Alert,
  Paper,
  Chip,
  CircularProgress,
  TextareaAutosize
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDrop } from 'react-dnd';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import GetFileThumbnail from './getFileThumnail'; 
import { useAuth } from '../../middlewares/auth/authContext'; 

// Theme configuration remains the same
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo blue
    },
    secondary: {
      main: '#eef2ff', // Light indigo
    },
    background: {
      default: '#f9fafb',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#333333',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#666666',
    },
    caption: {
        fontSize: '0.7rem',
        lineHeight: 1, 
    }
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          '& .MuiOutlinedInput-root': {
            height: '32px', 
            padding: '0 8px',
            fontSize: '12px',
            '& input': {
                padding: '0', 
                height: '32px',
                fontSize: '12px',
            },
            '& fieldset': { borderColor: '#e5e7eb' },
            '&:hover fieldset': { borderColor: '#6366f1' },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 1px #6366f1',
            },
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '4px',
            minHeight: '32px', 
            padding: '4px 8px',
            fontSize: '12px',
            '& input': {
                padding: '0',
                fontSize: '12px',
            },
            '& .MuiChip-root': { 
                height: '20px', 
                fontSize: '10px',
                margin: '1px',
            },
            '& .MuiSvgIcon-root': { 
                fontSize: '18px',
            },
            '& fieldset': { borderColor: '#e5e7eb' },
            '&:hover fieldset': { borderColor: '#6366f1' },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 1px #6366f1',
            },
          },
        },
      },
    },
  },
});

// Predefined event types
const PREDEFINED_EVENT_TYPES = ['Meeting', 'Holiday', 'Training', 'Presentation', 'Vacation'];

// Define roles allowed to create an event
const AUTHORIZED_ROLES = ['manager', 'admin', 'superadmin', 'hr'];

function EventTab({ 
  selectedDate, 
  selectedDateRange, 
  description, 
  setDescription, 
  setErrorMessage, 
  onEventAdded, 
  file, 
  setFile 
}) {
  const { user } = useAuth(); 
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileUrl, setFileUrl] = useState(null); 
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [color, setColor] = useState('#079669');
  const [textColor, setTextColor] = useState('#FFFFFF'); // Added textColor state with default white
  
  // Normalize selected date/range for initial time setting
  const initialDate = selectedDateRange?.start && moment(selectedDateRange.start).isValid()
      ? selectedDateRange.start
      : selectedDate && moment(selectedDate).isValid()
      ? selectedDate
      : moment().toISOString();
      
  const [eventStart, setEventStart] = useState(
    moment(initialDate).tz('UTC').format('YYYY-MM-DDTHH:mm')
  );
  
  const [eventEnd, setEventEnd] = useState(
    selectedDateRange?.end && moment(selectedDateRange.end).isValid()
      ? moment(selectedDateRange.end).add(1, 'hour').tz('UTC').format('YYYY-MM-DDTHH:mm')
      : moment(initialDate).add(1, 'hour').tz('UTC').format('YYYY-MM-DDTHH:mm')
  );

  // API hooks
  const { data: eventTypes, isLoading: eventTypesLoading } = useGet(
    '/employee/event/types',
    {},
    {},
    { queryKey: ['eventTypes'] }
  );
  
  const addEventMutation = usePost('/employee/event/add', {}, 'events');

  // Combine predefined and API event types
  const apiTypes = Array.isArray(eventTypes?.data?.data) ? eventTypes.data.data : [];
  const allEventTypes = [...new Set([...PREDEFINED_EVENT_TYPES, ...apiTypes])].sort();

  // Generate dates in range (for display only)
  const getDatesInRange = useCallback((start, end) => {
    if (!start || !end || !moment(start).isValid() || !moment(end).isValid()) return [];
    const startDate = moment(start).tz('UTC').startOf('day');
    const endDate = moment(end).tz('UTC').startOf('day');
    const dates = [];
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.toISOString());
      currentDate.add(1, 'day');
    }
    return dates;
  }, []);

  const eventDates = selectedDateRange && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()
    ? getDatesInRange(selectedDateRange.start, selectedDateRange.end)
    : selectedDate && moment(selectedDate).isValid()
    ? [moment(selectedDate).toISOString()]
    : [];
  
  // Convert file to base64 buffer
  const toBase64 = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          const buffer = new Uint8Array(reader.result);
          resolve(Array.from(buffer));
        };
        reader.onerror = (error) => reject(error);
      }),
    []
  );

  // File handling functions
  const handleDragEnter = useCallback(() => setDragActive(true), []);
  const handleDragLeave = useCallback(() => setDragActive(false), []);
  const handleDragOver = useCallback((e) => e.preventDefault(), []);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const newFile = e.dataTransfer.files[0];
        setFile(newFile);
        if (fileUrl) URL.revokeObjectURL(fileUrl);
        setFileUrl(URL.createObjectURL(newFile));
      } else {
        setErrorMessage('No file dropped');
      }
    },
    [setFile, setErrorMessage, fileUrl]
  );
  const handleFileSelect = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) {
        const newFile = e.target.files[0];
        setFile(newFile);
        if (fileUrl) URL.revokeObjectURL(fileUrl);
        setFileUrl(URL.createObjectURL(newFile));
      } else {
        setErrorMessage('No file selected');
      }
    },
    [setFile, setErrorMessage, fileUrl]
  );
  const handleFileRemove = useCallback(() => {
    setFile(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setFile, fileUrl]);
  const triggerFileInput = useCallback(() => fileInputRef.current.click(), []);
  const getFileSizeText = useCallback((file) => {
    if (!file) return '';
    const size = file.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: 'file',
    drop: (item, monitor) => {},
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  useEffect(() => {
    if (file && (!fileUrl || fileUrl.includes('blob:')) && !fileUrl?.startsWith('blob:')) {
      const newUrl = URL.createObjectURL(file);
      setFileUrl(newUrl);
    } else if (!file && fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file, fileUrl]);

  // Validate date
  const isValidDate = (dateString) => {
    return dateString && moment(dateString).isValid();
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // --- 1. FRONTEND ROLE CHECK ---
    const userRole = user?.role?.toLowerCase();
    if (!AUTHORIZED_ROLES.includes(userRole)) {
        setErrorMessage("🚫 Permission Denied: Only Manager, Admin, SuperAdmin, or HR can create events.");
        return;
    }
    
    if (!eventTitle.trim() || !eventType.trim() || !eventStart || !eventEnd || !description.trim() || !color || !textColor) {
      setErrorMessage('All event fields including Color and Text Color are required');
      return;
    }
    if (!isValidDate(eventStart) || !isValidDate(eventEnd)) {
      setErrorMessage('Invalid start or end date/time');
      return;
    }
    if (eventDates.length === 0) {
      setErrorMessage('No valid date(s) selected');
      return;
    }

    try {
      setErrorMessage('');
      let filePayload = null;
      if (file) {
        const bufferArray = await toBase64(file);
        filePayload = {
          buffer: bufferArray,
          name: file.name,
          type: file.type,
          size: file.size,
        };
      }

      // 1. Determine the overall Start Date (first selected day + Start Time)
      const firstSelectedDate = moment(eventDates[0]).tz('UTC');
      const startMoment = moment(eventStart).tz('UTC');
      const finalStartDateTime = firstSelectedDate
        .clone()
        .set({
          hour: startMoment.hour(),
          minute: startMoment.minute(),
          second: 0,
          millisecond: 0,
        })
        .toISOString();

      // 2. Determine the overall End Date (last selected day + End Time)
      const lastSelectedDate = moment(eventDates[eventDates.length - 1]).tz('UTC');
      const endMoment = moment(eventEnd).tz('UTC');
      const finalEndDateTime = lastSelectedDate
        .clone()
        .set({
          hour: endMoment.hour(),
          minute: endMoment.minute(),
          second: 0,
          millisecond: 0,
        })
        .toISOString();
        
      // Validation Check: End time/date must be after Start time/date
      if (moment(finalStartDateTime).isSameOrAfter(moment(finalEndDateTime))) {
          setErrorMessage('End Time/Date must be after Start Time/Date.');
          return;
      }
      
      const eventData = {
        title: eventTitle,
        type: eventType.trim(),
        start: finalStartDateTime,
        end: finalEndDateTime,
        description,
        color,
        textColor, // Added textColor to eventData
        selectedEmployees: [],
      };

      const finalEventData = filePayload ? { ...eventData, file: filePayload } : eventData;

      // 3. Perform a single API call
      await addEventMutation.mutateAsync(finalEventData);

      // Reset Form
      setEventTitle('');
      setEventType('');
      const resetDate = selectedDateRange?.start || selectedDate || moment().toISOString();
      setEventStart(moment(resetDate).tz('UTC').format('YYYY-MM-DDTHH:mm'));
      setEventEnd(moment(resetDate).add(1, 'hour').tz('UTC').format('YYYY-MM-DDTHH:mm'));
      setDescription('');
      setColor('#3f51b5');
      setTextColor('#FFFFFF'); // Reset textColor
      handleFileRemove();
      onEventAdded();
      
      // Invalidate queries to refresh the 'View' tab
      queryClient.invalidateQueries(['events']); 
      
    } catch (error) {
      // --- 2. BACKEND ERROR CATCH ---
      const backendMessage = error.response?.data?.error || error.response?.data?.message;
      
      if (backendMessage && backendMessage.includes("permission to create an event")) {
          setErrorMessage("🚫 Permission Denied: You are not authorized to create events with your current role.");
      } else {
          const errorMessage = backendMessage || error.message || 'Unknown error occurred';
          setErrorMessage(`Failed to save event: ${errorMessage}`);
      }
    }
  }, [
    eventTitle,
    eventType,
    eventStart,
    eventEnd,
    description,
    eventDates,
    color,
    textColor, // Added textColor to dependency array
    setDescription,
    setErrorMessage,
    addEventMutation,
    queryClient,
    selectedDate,
    selectedDateRange,
    onEventAdded,
    file,
    handleFileRemove,
    toBase64,
    user?.role 
  ]);

  // Start Time onChange handler
  const handleStartTimeChange = useCallback((e) => {
    const timeValue = e.target.value;
    if (!timeValue) return;

    const [hours, minutes] = timeValue.split(':');
    const newStart = moment(eventStart)
      .tz('UTC')
      .set({ hour: parseInt(hours), minute: parseInt(minutes), second: 0, millisecond: 0 })
      .format('YYYY-MM-DDTHH:mm');
    setEventStart(newStart);
  }, [eventStart]);

  // End Time onChange handler
  const handleEndTimeChange = useCallback((e) => {
    const timeValue = e.target.value;
    if (!timeValue) return;
    
    const [hours, minutes] = timeValue.split(':');
    const newEnd = moment(eventEnd)
      .tz('UTC')
      .set({ hour: parseInt(hours), minute: parseInt(minutes), second: 0, millisecond: 0 })
      .format('YYYY-MM-DDTHH:mm');
    setEventEnd(newEnd);
  }, [eventEnd]);
  
  // Format current eventStart/End time for the time input
  const startTimeValue = eventStart ? moment(eventStart).tz('UTC').format('HH:mm') : '';
  const endTimeValue = eventEnd ? moment(eventEnd).tz('UTC').format('HH:mm') : '';

  // Check if current user role is authorized for disabling the submit button/form
  const isAuthorized = AUTHORIZED_ROLES.includes(user?.role?.toLowerCase());

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
        
        {/* Permission Alert */}
        {!isAuthorized && (
            <Alert severity="error" sx={{ my: 0.5, p: '4px 8px', '& .MuiAlert-icon': { p: 0, mr: 1 } }}>
                <Typography variant="caption" fontWeight="bold">
                    🚫 Permission Denied:
                </Typography> 
                <Typography variant="caption">
                    Your current role (**{user?.role || 'Employee'}**) cannot create events.
                </Typography>
            </Alert>
        )}
        
        {/* Event Title */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Event Title
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Enter event title"
            size="small"
            disabled={!isAuthorized} 
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '32px',
                fontSize: '12px',
                '& input': { padding: '0', height: '32px', fontSize: '12px' },
                '&:hover': { borderColor: !isAuthorized ? '#e5e7eb' : '#6366f1' },
                '&.Mui-focused': { borderColor: !isAuthorized ? '#e5e7eb' : '#6366f1', boxShadow: !isAuthorized ? 'none' : '0 0 0 1px #6366f1' },
              },
            }}
          />
        </Box>

        {/* Event Type - Free Style with Autocomplete */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Event Type
          </Typography>
          <Autocomplete
            freeSolo
            options={allEventTypes}
            value={eventType}
            onChange={(event, newValue) => setEventType(newValue || '')}
            onInputChange={(event, newInputValue) => setEventType(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                fullWidth
                placeholder="Select or type custom type"
                size="small"
                disabled={!isAuthorized} 
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '32px',
                    fontSize: '12px',
                    '& input': { fontSize: '12px', padding: '0' },
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Chip label={option} size="small" variant="outlined" sx={{ mr: 1, height: '20px', fontSize: '10px' }} />
                <Typography variant="caption">{option}</Typography>
              </Box>
            )}
            loading={eventTypesLoading}
            loadingText="Loading event types..."
            noOptionsText="Type to create a custom event type"
            size="small"
            sx={{ 
                '& .MuiInputBase-root': { padding: '4px 8px' },
            }}
          />
        </Box>
        
        {/* Date Range & Time */}
        <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
                Date Range & Time (UTC)
            </Typography>
            
            {/* Display Dates */}
            <Typography 
                variant="body2" 
                color={eventDates.length > 0 ? 'text.primary' : 'error'}
                sx={{ fontSize: '12px', fontWeight: 'bold' }}
            >
                {eventDates.length > 0
                ? eventDates.length === 1
                    ? moment(eventDates[0]).tz('UTC').format('MMMM D, YYYY')
                    : `${moment(eventDates[0]).tz('UTC').format('MMM D, YYYY')} - ${moment(eventDates[eventDates.length - 1]).tz('UTC').format('MMM D, YYYY')}`
                : 'No valid date selected'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px', mb: 0.5 }}>
                {eventDates.length > 0
                    ? `Single entry spanning ${eventDates.length} day(s).`
                    : 'Select dates on calendar.'}
            </Typography>

            {/* Time Inputs */}
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={0.5} mt={0.5}>
                <TextField
                  type="time"
                  label="Start Time"
                  variant="outlined"
                  fullWidth
                  value={startTimeValue}
                  onChange={handleStartTimeChange}
                  InputLabelProps={{ shrink: true, sx: { fontSize: '10px', top: -3 } }}
                  inputProps={{ step: 300 }}
                  size="small"
                  disabled={!isAuthorized} 
                  sx={{
                      '& .MuiInputBase-root': { height: '32px', fontSize: '12px' },
                  }}
                />
                <TextField
                  type="time"
                  label="End Time"
                  variant="outlined"
                  fullWidth
                  value={endTimeValue}
                  onChange={handleEndTimeChange}
                  InputLabelProps={{ shrink: true, sx: { fontSize: '10px', top: -3 } }}
                  inputProps={{ step: 300 }}
                  size="small"
                  disabled={!isAuthorized} 
                  sx={{
                      '& .MuiInputBase-root': { height: '32px', fontSize: '12px' },
                  }}
                />
            </Box>
        </Box>

        {/* Popular Event Types Chips */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Quick Select:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {['Meeting', 'Workshop', 'Training', 'Client Visit', 'Team Building', 'Review'].map((type) => (
              <Chip
                key={type}
                label={type}
                size="small"
                variant={eventType === type ? 'filled' : 'outlined'}
                onClick={() => isAuthorized && setEventType(type)} 
                sx={{
                  cursor: isAuthorized ? 'pointer' : 'not-allowed',
                  opacity: !isAuthorized ? 0.6 : 1,
                  fontSize: '10px',
                  height: '20px',
                  '&:hover': {
                    backgroundColor: eventType === type ? 'primary.dark' : (isAuthorized ? 'action.hover' : 'inherit'),
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Event Description */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Event Description
          </Typography>
          <TextareaAutosize
            className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            placeholder="What is the event about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            disabled={!isAuthorized}
            style={{
              width: '100%',
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              fontSize: '11px',
              outline: 'none',
              minHeight: '40px',
              opacity: !isAuthorized ? 0.6 : 1,
              cursor: !isAuthorized ? 'not-allowed' : 'auto',
            }}
          />
        </Box>

        {/* Event Color */}
        <Box display="flex" gap={2}>
        <Box flex={1}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Event Color
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <input
              type="color"
              value={color}
              onChange={(e) => isAuthorized && setColor(e.target.value)} 
              disabled={!isAuthorized} 
              style={{
                width: '24px',
                height: '24px',
                padding: '0',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: isAuthorized ? 'pointer' : 'not-allowed',
                backgroundColor: 'transparent',
                opacity: !isAuthorized ? 0.6 : 1,
              }}
            />
            <Typography
              variant="caption"
              fontWeight="medium"
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                p: 0.25,
                minWidth: '70px',
                textAlign: 'center',
                bgcolor: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '10px',
                opacity: !isAuthorized ? 0.6 : 1,
              }}
            >
              {color.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        {/* Text Color */}
        <Box flex={1}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Text Color
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <input
              type="color"
              value={textColor}
              onChange={(e) => isAuthorized && setTextColor(e.target.value)} 
              disabled={!isAuthorized} 
              style={{
                width: '24px',
                height: '24px',
                padding: '0',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: isAuthorized ? 'pointer' : 'not-allowed',
                backgroundColor: 'transparent',
                opacity: !isAuthorized ? 0.6 : 1,
              }}
            />
            <Typography
              variant="caption"
              fontWeight="medium"
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                p: 0.25,
                minWidth: '70px',
                textAlign: 'center',
                bgcolor: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '10px',
                opacity: !isAuthorized ? 0.6 : 1,
              }}
            >
              {textColor.toUpperCase()}
            </Typography>
          </Box>
        </Box>
        </Box>

        {/* File Upload */}
        <Box
          ref={drop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            border: '1px dashed',
            borderColor: dragActive || isOver ? '#6366f1' : '#e5e7eb',
            bgcolor: dragActive || isOver ? '#eef2ff' : '#f9fafb',
            borderRadius: '6px',
            p: 1,
            textAlign: 'center',
            transition: 'all 0.2s',
            pointerEvents: !isAuthorized ? 'none' : 'auto',
            opacity: !isAuthorized ? 0.6 : 1,
            '&:hover': {
              borderColor: '#6366f1',
              bgcolor: '#eef2ff',
            },
          }}
        >
          {!file ? (
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <AttachFileIcon sx={{ color: '#6366f1', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="medium" lineHeight={1}>
                Drop file or
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={triggerFileInput}
                disabled={!isAuthorized} 
                sx={{
                  textTransform: 'none',
                  fontSize: '10px',
                  fontWeight: '600',
                  borderColor: '#6366f1',
                  color: '#6366f1',
                  borderRadius: '4px',
                  px: 1,
                  py: 0,
                  lineHeight: 1.5,
                  '&:hover': {
                    bgcolor: '#eef2ff',
                    borderColor: '#4f46e5',
                  },
                }}
              >
                Browse
              </Button>
              <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} disabled={!isAuthorized} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', p: 0.5, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {file.type.startsWith('image/') ? (
                  <img
                    src={fileUrl}
                    alt="File preview"
                    style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: '4px' }}
                    onError={(e) => (e.target.src = '/fallback-image.png')} 
                  />
                ) : (
                  <GetFileThumbnail fileType={file.type} fileUrl={fileUrl} size={32} /> 
                )}
                <Box>
                  <Typography variant="body2" color="text.primary" fontWeight="medium" fontSize={11}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize={9}>
                    {getFileSizeText(file)}
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={handleFileRemove}
                disabled={!isAuthorized} 
                sx={{ minWidth: 0, p: 0, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
              >
                <CloseIcon sx={{ fontSize: 12 }} />
              </Button>
            </Box>
          )}
        </Box>

        {/* Hidden Submit Button */}
        <Button
          id="event-submit"
          onClick={handleSubmit}
          disabled={addEventMutation.isLoading || !isAuthorized || !eventTitle.trim() || !eventType.trim() || !eventStart || !eventEnd || !description.trim() || !color || !textColor || eventDates.length === 0}
          sx={{ display: 'none' }}
        >
          {addEventMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Event'}
        </Button>
      </Box>
    </ThemeProvider>
  );
}

export default EventTab;