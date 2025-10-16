
// import React, { useRef, useCallback, useState, useEffect } from "react";
// import { useDrop } from "react-dnd";
// import { useAuth } from "../../middlewares/auth/authContext";
// import { useQueryClient } from '@tanstack/react-query';
// import AttachFileIcon from "@mui/icons-material/AttachFile";
// import CloseIcon from "@mui/icons-material/Close";
// import GetFileThumbnail from "./getFileThumnail";
// import { usePost, useGet } from "../../hooks/useApi";
// import moment from 'moment-timezone';
// import {
//   Box,
//   Typography,
//   TextareaAutosize,
//   Button,
//   CircularProgress,
//   Autocomplete,
//   TextField,
//   InputAdornment,
// } from "@mui/material";

// // Define a default color
// const DEFAULT_MEETING_COLOR = '#ef4444'; // Red

// // --- START: MeetingTab Component ---
// function MeetingTab({
//   file,
//   setFile,
//   setErrorMessage,
//   selectedDate,
//   selectedDateRange,
//   onMeetingAdded
// }) {
//   const { user } = useAuth();
//   const queryClient = useQueryClient();
//   const fileInputRef = useRef(null);
//   const [dragActive, setDragActive] = useState(false);

//   // States specific to meeting
//   const [meetingTitle, setMeetingTitle] = useState("");
//   const [meetingLocation, setMeetingLocation] = useState("");
//   const [meetingDescription, setMeetingDescription] = useState(""); // Local state for description
//   const [attendees, setAttendees] = useState(""); // Comma separated emails
//   const [color, setColor] = useState(DEFAULT_MEETING_COLOR);
//   const [bgColor, setBgColor] = useState("#fee2e2"); // Light version of default
//   const [assignFor, setAssignFor] = useState([]); // Employee IDs for internal attendees

//   // Date/Time States
//   const initialStartDateISO = selectedDateRange?.start || selectedDate;
//   const initialEndDateISO = selectedDateRange?.end || selectedDate;

//   // Initialize Date and Time parts
//   const [startDateDisplay, setStartDateDisplay] = useState(
//     initialStartDateISO && moment(initialStartDateISO).isValid()
//       ? moment(initialStartDateISO).tz('UTC').format("YYYY-MM-DD")
//       : ""
//   );
//   const [startTimeDisplay, setStartTimeDisplay] = useState(
//     initialStartDateISO && moment(initialStartDateISO).isValid()
//       ? moment(initialStartDateISO).tz('UTC').format("HH:mm")
//       : moment().format("HH:mm")
//   );
//   const [endDateDisplay, setEndDateDisplay] = useState(
//     initialEndDateISO && moment(initialEndDateISO).isValid()
//       ? moment(initialEndDateISO).tz('UTC').format("YYYY-MM-DD")
//       : ""
//   );
//   const [endTimeDisplay, setEndTimeDisplay] = useState(
//     initialEndDateISO && moment(initialEndDateISO).isValid()
//       ? moment(initialEndDateISO).tz('UTC').format("HH:mm")
//       : moment().add(1, 'hour').format("HH:mm")
//   );

//   // Update local date states when props change
//   useEffect(() => {
//     const newStartDateISO = selectedDateRange?.start || selectedDate;
//     const newEndDateISO = selectedDateRange?.end || selectedDate;

//     setStartDateDisplay(
//       newStartDateISO && moment(newStartDateISO).isValid()
//         ? moment(newStartDateISO).tz('UTC').format("YYYY-MM-DD")
//         : ""
//     );
//     setEndDateDisplay(
//       newEndDateISO && moment(newEndDateISO).isValid()
//         ? moment(newEndDateISO).tz('UTC').format("YYYY-MM-DD")
//         : ""
//     );

//     if (newStartDateISO && moment(newStartDateISO).isValid()) {
//       setStartTimeDisplay(moment(newStartDateISO).tz('UTC').format("HH:mm"));
//     }
//     if (newEndDateISO && moment(newEndDateISO).isValid()) {
//       setEndTimeDisplay(moment(newEndDateISO).tz('UTC').format("HH:mm"));
//     }
//   }, [selectedDate, selectedDateRange]);

//   // Hooks and logic
//   const meetingMutation = usePost("/meetings/create", {}, "meetings");

//   const { data: employeesData, error: employeesError, isLoading: employeesLoading } = useGet(
//     "employee/all",
//     {},
//     {},
//     { queryKey: ["employees"] }
//   );

//   const employees = (employeesData?.data?.message?.[0] || []).sort((a, b) => a.name.localeCompare(b.name));

//   const toBase64 = useCallback((file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsArrayBuffer(file);
//       reader.onload = () => {
//         const buffer = new Uint8Array(reader.result);
//         resolve(Array.from(buffer));
//       };
//       reader.onerror = (error) => reject(error);
//     }), []);

//   const handleDragEnter = useCallback(() => setDragActive(true), []);
//   const handleDragLeave = useCallback(() => setDragActive(false), []);
//   const handleDragOver = useCallback((e) => e.preventDefault(), []);

//   const handleDrop = useCallback(
//     (e) => {
//       e.preventDefault();
//       setDragActive(false);
//       if (e.dataTransfer.files && e.dataTransfer.files[0] && typeof setFile === 'function') {
//         setFile(e.dataTransfer.files[0]);
//       } else {
//         setErrorMessage("File upload failed: setFile is not available");
//       }
//     },
//     [setFile, setErrorMessage]
//   );

//   const handleFileSelect = useCallback(
//     (e) => {
//       if (e.target.files && e.target.files[0] && typeof setFile === 'function') {
//         setFile(e.target.files[0]);
//       } else {
//         setErrorMessage("No file selected or setFile is not available");
//       }
//     },
//     [setFile, setErrorMessage]
//   );

//   const triggerFileInput = useCallback(() => fileInputRef.current?.click(), []);

//   const handleFileRemove = useCallback(() => {
//     if (typeof setFile === 'function') {
//       setFile(null);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     } else {
//       setErrorMessage("Cannot remove file: setFile is not available");
//     }
//   }, [setFile, setErrorMessage]);

//   const getFileSizeText = useCallback((file) => {
//     if (!file) return "";
//     const size = file.size;
//     if (size < 1024) return `${size} B`;
//     if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
//     return `${(size / (1024 * 1024)).toFixed(1)} MB`;
//   }, []);

//   const [{ isOver }, drop] = useDrop({
//     accept: "file",
//     collect: (monitor) => ({ isOver: monitor.isOver() }),
//   });

//   const handleAssignChange = useCallback((event, newValue) => {
//     setAssignFor(newValue.map(employee => employee._id));
//   }, []);

//   const parseAttendees = useCallback((emailsString) => {
//     return (emailsString || '')
//       .split(',')
//       .map(email => email.trim())
//       .filter(email => email.length > 0);
//   }, []);

//   const getDatesInRange = useCallback((startDateStr, endDateStr) => {
//     if (!startDateStr || !endDateStr || !moment(startDateStr).isValid() || !moment(endDateStr).isValid()) return [];
//     const startDate = moment(startDateStr).startOf('day');
//     const endDate = moment(endDateStr).startOf('day');
//     const dates = [];
//     let currentDate = startDate.clone();
//     while (currentDate.isSameOrBefore(endDate)) {
//       dates.push(currentDate.format('YYYY-MM-DD'));
//       currentDate.add(1, 'day');
//     }
//     return dates;
//   }, []);

//   const getLightColor = useCallback((hex) => {
//     const r = parseInt(hex.slice(1, 3), 16);
//     const g = parseInt(hex.slice(3, 5), 16);
//     const b = parseInt(hex.slice(5, 7), 16);
//     const lighten = (c) => Math.min(255, c + 150);
//     const lr = lighten(r);
//     const lg = lighten(g);
//     const lb = lighten(b);
//     const toHex = (c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0');
//     return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
//   }, []);

//   const handleColorChange = useCallback((e) => {
//     const newColor = e.target.value;
//     setColor(newColor);
//     setBgColor(getLightColor(newColor));
//   }, [getLightColor]);

//   const handleSubmit = useCallback(async () => {
//     const startDateTimeString = `${startDateDisplay}T${startTimeDisplay}:00Z`;
//     const endDateTimeString = `${endDateDisplay}T${endTimeDisplay}:00Z`;

//     const startMoment = moment.utc(startDateTimeString, "YYYY-MM-DDTHH:mm:ssZ", true);
//     const endMoment = moment.utc(endDateTimeString, "YYYY-MM-DDTHH:mm:ssZ", true);

//     if (
//       !meetingTitle?.trim() ||
//       !meetingDescription?.trim() ||
//       assignFor.length === 0 ||
//       !startMoment.isValid() ||
//       !endMoment.isValid() ||
//       !color ||
//       !meetingLocation?.trim()
//     ) {
//       setErrorMessage("Title, Description, Location, Assigned person, valid Start/End Date/Time, and Color are required.");
//       return;
//     }

//     if (!endMoment.isSameOrAfter(startMoment)) {
//       setErrorMessage("End date and time must be on or after start date and time.");
//       return;
//     }

//     const durationMinutes = endMoment.diff(startMoment, 'minutes');
//     if (durationMinutes <= 0) {
//       setErrorMessage("End time must be after start time.");
//       return;
//     }

//     const parsedAttendees = parseAttendees(attendees);

//     const meetingDates = startDateDisplay && endDateDisplay && startDateDisplay !== endDateDisplay
//       ? getDatesInRange(startDateDisplay, endDateDisplay)
//       : [startDateDisplay];

//     const nowUtc = moment().tz('UTC');
//     const firstMeetingDateTime = moment.utc(meetingDates[0]).tz('UTC').set({
//       hour: startMoment.hour(),
//       minute: startMoment.minute(),
//     });

//     if (firstMeetingDateTime.isBefore(nowUtc)) {
//       setErrorMessage("Cannot schedule a meeting for a date or time that is in the past.");
//       return;
//     }

//     try {
//       setErrorMessage("");

//       let filePayload = {};
//       if (file && typeof setFile === 'function') {
//         const bufferArray = await toBase64(file);
//         filePayload.file = {
//           buffer: bufferArray,
//           name: file.name,
//           type: file.type,
//           size: file.size
//         };
//       } else if (file) {
//         console.warn("setFile is not a function, skipping file upload");
//       }

//       for (const dateStr of meetingDates) {
//         const dateMoment = moment.utc(dateStr);
//         const startDateTime = dateMoment.clone().set({
//           hour: startMoment.hour(),
//           minute: startMoment.minute(),
//         }).toISOString();
//         const endDateTime = dateMoment.clone().set({
//           hour: endMoment.hour(),
//           minute: endMoment.minute(),
//         }).toISOString();

//         const meetingFor = [
//           ...assignFor.map(id => {
//             const emp = employees.find(e => e._id === id);
//             return { email: emp?.email || "" };
//           }).filter(e => e.email),
//           ...parsedAttendees.map(email => ({ email }))
//         ];

//         const meetingData = {
//           meetingName: meetingTitle.trim(),
//           meetingDescription: meetingDescription.trim(),
//           meetingLink: meetingLocation.trim(),
//           start_time_Date: startDateTime,
//           end_time_Date: endDateTime,
//           meetingDuration: durationMinutes + " minutes",
//           registrants: assignFor,
//           meetingBy: user?._id || "",
//           meetingFor: meetingFor,
//           meetingHost: user?.email || "",
//           color: color,
//           bgColor: bgColor,
//           ...filePayload
//         };

//         console.log("Sending payload for date:", dateStr, { meetingData });
//         await meetingMutation.mutateAsync({ meetingData });
//       }

//       setMeetingTitle("");
//       setMeetingDescription("");
//       setMeetingLocation("");
//       if (typeof setFile === 'function') {
//         setFile(null);
//       }
//       setAssignFor([]);
//       setAttendees("");
//       setColor(DEFAULT_MEETING_COLOR);
//       setBgColor("#fee2e2");

//       const defaultStart = selectedDateRange?.start || selectedDate;
//       const defaultEnd = selectedDateRange?.end || selectedDate;
//       setStartDateDisplay(defaultStart && moment(defaultStart).isValid() ? moment(defaultStart).tz('UTC').format("YYYY-MM-DD") : "");
//       setStartTimeDisplay(defaultStart && moment(defaultStart).isValid() ? moment(defaultStart).tz('UTC').format("HH:mm") : moment().format("HH:mm"));
//       setEndDateDisplay(defaultEnd && moment(defaultEnd).isValid() ? moment(defaultEnd).tz('UTC').format("YYYY-MM-DD") : "");
//       setEndTimeDisplay(defaultEnd && moment(defaultEnd).isValid() ? moment(defaultEnd).tz('UTC').format("HH:mm") : moment().add(1, 'hour').format("HH:mm"));

//       onMeetingAdded();
//       queryClient.invalidateQueries(["meetings"]);
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
//       setErrorMessage(`Failed to save meeting: ${errorMessage}`);
//     }
//   }, [
//     meetingTitle,
//     meetingDescription,
//     meetingLocation,
//     file,
//     assignFor,
//     attendees,
//     color,
//     bgColor,
//     startDateDisplay,
//     startTimeDisplay,
//     endDateDisplay,
//     endTimeDisplay,
//     setErrorMessage,
//     meetingMutation,
//     onMeetingAdded,
//     parseAttendees,
//     handleFileRemove,
//     toBase64,
//     getDatesInRange,
//     user,
//     employees,
//     selectedDate,
//     selectedDateRange,
//     queryClient,
//     setFile
//   ]);

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
//       <Box>
//         <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//           Meeting Title
//         </Typography>
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Enter meeting title"
//           value={meetingTitle}
//           onChange={(e) => setMeetingTitle(e.target.value)}
//           variant="outlined"
//           sx={{
//             '& .MuiOutlinedInput-root': {
//               bgcolor: '#fff',
//               border: '1px solid #e5e7eb',
//               borderRadius: '4px',
//               boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//               fontSize: '12px',
//               padding: '4px 8px',
//               height: '32px',
//               '& input': { padding: '0' },
//               '&.Mui-focused': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' },
//             },
//           }}
//         />
//       </Box>

//       <Box>
//         <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//           Location
//         </Typography>
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Room or Online Link"
//           value={meetingLocation}
//           onChange={(e) => setMeetingLocation(e.target.value)}
//           variant="outlined"
//           sx={{
//             '& .MuiOutlinedInput-root': {
//               bgcolor: '#fff',
//               border: '1px solid #e5e7eb',
//               borderRadius: '4px',
//               boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//               fontSize: '12px',
//               padding: '4px 8px',
//               height: '32px',
//               '& input': { padding: '0' },
//               '&.Mui-focused': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' },
//             },
//           }}
//         />
//       </Box>

//       <Box>
//         <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//           Date & Time (UTC)
//         </Typography>
//         <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={0.5}>
//           <TextField
//             type="date"
//             value={startDateDisplay}
//             onChange={(e) => setStartDateDisplay(e.target.value)}
//             fullWidth
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             sx={{
//               '& .MuiInputBase-root': {
//                 fontSize: '10px',
//                 height: '36px',
//                 lineHeight: '1.4rem',
//               },
//               '& input': {
//                 paddingRight: "10px",
//               },
//             }}
//           />
//           <TextField
//             type="time"
//             value={startTimeDisplay}
//             onChange={(e) => setStartTimeDisplay(e.target.value)}
//             fullWidth
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             sx={{
//               '& .MuiInputBase-root': {
//                 fontSize: '11px',
//                 height: '36px',
//                 lineHeight: '1.4rem',
//               },
//               '& input': {
//                 padding: '6px 6px',
//               },
//             }}
//           />
//           <TextField
//             type="date"
//             value={endDateDisplay}
//             onChange={(e) => setEndDateDisplay(e.target.value)}
//             fullWidth
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             sx={{
//               '& .MuiInputBase-root': {
//                 fontSize: '10px',
//                 height: '36px',
//                 lineHeight: '1.4rem',
//               },
//               '& input': {
//                 padding: '6px 12px',
//               },
//             }}
//           />
//           <TextField
//             type="time"
//             value={endTimeDisplay}
//             onChange={(e) => setEndTimeDisplay(e.target.value)}
//             fullWidth
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             sx={{
//               '& .MuiInputBase-root': {
//                 fontSize: '11px',
//                 height: '36px',
//                 lineHeight: '1.4rem',
//               },
//               '& input': {
//                 padding: '6px 12px',
//               },
//             }}
//           />
//         </Box>
//       </Box>

//       <Box>
//         <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//           Agenda/Description
//         </Typography>
//         <TextareaAutosize
//           className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
//           placeholder="What will be discussed?"
//           value={meetingDescription}
//           onChange={(e) => setMeetingDescription(e.target.value)}
//           rows={2}
//           style={{
//             width: '100%',
//             padding: '5px',
//             borderRadius: '4px',
//             border: '1px solid #e5e7eb',
//             backgroundColor: '#fff',
//             boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//             fontSize: '11px',
//             outline: 'none',
//             minHeight: '40px'
//           }}
//         />
//       </Box>

//       <Box>
//         <Typography
//           variant="caption"
//           color="text.secondary"
//           fontWeight="medium"
//           mb={0.25}
//           lineHeight={1}
//         >
//           Internal Attendees (Employees)
//         </Typography>
//         {employeesLoading ? (
//           <Typography variant="caption" color="text.secondary">
//             Loading employees...
//           </Typography>
//         ) : employeesError ? (
//           <Typography variant="caption" color="error">
//             Error loading employees: {employeesError.message}
//           </Typography>
//         ) : employees.length > 0 ? (
//           <Autocomplete
//             multiple
//             options={employees}
//             getOptionLabel={(option) => option.name}
//             value={employees.filter((employee) => assignFor.includes(employee._id))}
//             onChange={handleAssignChange}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 variant="outlined"
//                 size="small"
//                 placeholder="Select internal employees"
//                 InputProps={{
//                   ...params.InputProps,
//                   sx: {
//                     height: 26,
//                     padding: "0 4px",
//                   },
//                   endAdornment: (
//                     <>
//                       {employeesLoading ? (
//                         <CircularProgress color="inherit" size={12} />
//                       ) : null}
//                       {params.InputProps.endAdornment}
//                     </>
//                   ),
//                 }}
//               />
//             )}
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 bgcolor: '#fff',
//                 border: '1px solid #e5e7eb',
//                 borderRadius: '4px',
//                 boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//                 fontSize: '11px',
//                 padding: '0 4px',
//                 minHeight: '38px',
//                 maxHeight: '44px',
//                 overflowY: 'auto',
//                 '& input': {
//                   padding: '0 !important',
//                   fontSize: '11px',
//                 },
//                 '& .MuiChip-root': {
//                   height: '16px',
//                   fontSize: '9px',
//                   margin: '1px',
//                 },
//                 '& .MuiSvgIcon-root': {
//                   fontSize: '15px',
//                 },
//               },
//             }}
//           />
//         ) : (
//           <Typography variant="caption" color="text.secondary">
//             No employees available
//           </Typography>
//         )}
//       </Box>

//       <Box>
//         <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//           External Attendees (Emails)
//         </Typography>
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Comma-separated emails"
//           value={attendees}
//           onChange={(e) => setAttendees(e.target.value)}
//           variant="outlined"
//           InputProps={{
//             startAdornment: <InputAdornment position="start" sx={{ fontSize: '12px', margin: 0, paddingRight: '4px' }}>@</InputAdornment>,
//           }}
//           sx={{
//             '& .MuiOutlinedInput-root': {
//               bgcolor: '#fff',
//               border: '1px solid #e5e7eb',
//               borderRadius: '4px',
//               boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//               fontSize: '12px',
//               padding: '4px 8px',
//               height: '32px',
//               '& input': { padding: '0' },
//               '&.Mui-focused': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' },
//             },
//           }}
//         />
//       </Box>

//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Box>
//           <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//             Color
//           </Typography>
//           <Box display="flex" alignItems="center" gap={1}>
//             <input
//               type="color"
//               value={color}
//               onChange={handleColorChange}
//               style={{
//                 width: '24px',
//                 height: '24px',
//                 padding: '0',
//                 border: '1px solid #e5e7eb',
//                 borderRadius: '4px',
//                 cursor: 'pointer',
//                 backgroundColor: 'transparent',
//               }}
//             />
//             <Typography variant="caption" fontWeight="medium" sx={{
//               border: '1px solid #e5e7eb',
//               borderRadius: '4px',
//               p: 0.25,
//               minWidth: '70px',
//               textAlign: 'center',
//               bgcolor: '#fff',
//               boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//             }}>
//               {color.toUpperCase()}
//             </Typography>
//           </Box>
//         </Box>
//       </Box>

 

//       <Button
//         id="meeting-submit"
//         onClick={handleSubmit}
//         disabled={meetingMutation.isLoading || !meetingTitle?.trim() || !meetingDescription?.trim() || assignFor.length === 0 || !color || !meetingLocation?.trim()}
//         sx={{ display: 'none' }}
//       >
//         {meetingMutation.isLoading ? (<CircularProgress size={20} color="inherit" />) : ("Schedule Meeting")}
//       </Button>
//     </Box>
//   );
// }

// export default MeetingTab;




import React, { useRef, useCallback, useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useAuth } from "../../middlewares/auth/authContext";
import { useQueryClient } from '@tanstack/react-query';
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import GetFileThumbnail from "./getFileThumnail";
import { usePost, useGet } from "../../hooks/useApi";
import moment from 'moment-timezone';
import {
  Box,
  Typography,
  TextareaAutosize,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
  InputAdornment,
} from "@mui/material";

// Define default colors
const DEFAULT_MEETING_COLOR = '#7c3aec'; // Red (Background)
const DEFAULT_TEXT_COLOR = '#ffffff'; // White (Text)

// --- START: MeetingTab Component ---
function MeetingTab({
  file,
  setFile,
  setErrorMessage,
  selectedDate,
  selectedDateRange,
  onMeetingAdded
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // States specific to meeting
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingDescription, setMeetingDescription] = useState(""); // Local state for description
  const [attendees, setAttendees] = useState(""); // Comma separated emails
  const [color, setColor] = useState(DEFAULT_MEETING_COLOR); // Background color
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR); // <-- NEW STATE FOR TEXT COLOR
  const [bgColor, setBgColor] = useState("#fee2e2"); // Light version of default (unused in payload but kept for component logic)
  const [assignFor, setAssignFor] = useState([]); // Employee IDs for internal attendees

  // Date/Time States
  const initialStartDateISO = selectedDateRange?.start || selectedDate;
  const initialEndDateISO = selectedDateRange?.end || selectedDate;

  // Initialize Date and Time parts
  const [startDateDisplay, setStartDateDisplay] = useState(
    initialStartDateISO && moment(initialStartDateISO).isValid()
      ? moment(initialStartDateISO).tz('UTC').format("YYYY-MM-DD")
      : ""
  );
  const [startTimeDisplay, setStartTimeDisplay] = useState(
    initialStartDateISO && moment(initialStartDateISO).isValid()
      ? moment(initialStartDateISO).tz('UTC').format("HH:mm")
      : moment().format("HH:mm")
  );
  const [endDateDisplay, setEndDateDisplay] = useState(
    initialEndDateISO && moment(initialEndDateISO).isValid()
      ? moment(initialEndDateISO).tz('UTC').format("YYYY-MM-DD")
      : ""
  );
  const [endTimeDisplay, setEndTimeDisplay] = useState(
    initialEndDateISO && moment(initialEndDateISO).isValid()
      ? moment(initialEndDateISO).tz('UTC').format("HH:mm")
      : moment().add(1, 'hour').format("HH:mm")
  );

  // Update local date states when props change
  useEffect(() => {
    const newStartDateISO = selectedDateRange?.start || selectedDate;
    const newEndDateISO = selectedDateRange?.end || selectedDate;

    setStartDateDisplay(
      newStartDateISO && moment(newStartDateISO).isValid()
        ? moment(newStartDateISO).tz('UTC').format("YYYY-MM-DD")
        : ""
    );
    setEndDateDisplay(
      newEndDateISO && moment(newEndDateISO).isValid()
        ? moment(newEndDateISO).tz('UTC').format("YYYY-MM-DD")
        : ""
    );

    if (newStartDateISO && moment(newStartDateISO).isValid()) {
      setStartTimeDisplay(moment(newStartDateISO).tz('UTC').format("HH:mm"));
    }
    if (newEndDateISO && moment(newEndDateISO).isValid()) {
      setEndTimeDisplay(moment(newEndDateISO).tz('UTC').format("HH:mm"));
    }
  }, [selectedDate, selectedDateRange]);

  // Hooks and logic
  const meetingMutation = usePost("/meetings/create", {}, "meetings");

  const { data: employeesData, error: employeesError, isLoading: employeesLoading } = useGet(
    "employee/all",
    {},
    {},
    { queryKey: ["employees"] }
  );

  const employees = (employeesData?.data?.message?.[0] || []).sort((a, b) => a.name.localeCompare(b.name));

  const toBase64 = useCallback((file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const buffer = new Uint8Array(reader.result);
        resolve(Array.from(buffer));
      };
      reader.onerror = (error) => reject(error);
    }), []);

  const handleDragEnter = useCallback(() => setDragActive(true), []);
  const handleDragLeave = useCallback(() => setDragActive(false), []);
  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0] && typeof setFile === 'function') {
        setFile(e.dataTransfer.files[0]);
      } else {
        setErrorMessage("File upload failed: setFile is not available");
      }
    },
    [setFile, setErrorMessage]
  );

  const handleFileSelect = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0] && typeof setFile === 'function') {
        setFile(e.target.files[0]);
      } else {
        setErrorMessage("No file selected or setFile is not available");
      }
    },
    [setFile, setErrorMessage]
  );

  const triggerFileInput = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileRemove = useCallback(() => {
    if (typeof setFile === 'function') {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setErrorMessage("Cannot remove file: setFile is not available");
    }
  }, [setFile, setErrorMessage]);

  const getFileSizeText = useCallback((file) => {
    if (!file) return "";
    const size = file.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: "file",
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  const handleAssignChange = useCallback((event, newValue) => {
    setAssignFor(newValue.map(employee => employee._id));
  }, []);

  const parseAttendees = useCallback((emailsString) => {
    return (emailsString || '')
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }, []);

  const getDatesInRange = useCallback((startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr || !moment(startDateStr).isValid() || !moment(endDateStr).isValid()) return [];
    const startDate = moment(startDateStr).startOf('day');
    const endDate = moment(endDateStr).startOf('day');
    const dates = [];
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }
    return dates;
  }, []);

  // Removed getLightColor and handleColorChange to keep only necessary color logic
  // and simplify the background color logic which wasn't being used in the payload
  // but keeping color and new textColor state updates.

  const handleSubmit = useCallback(async () => {
    const startDateTimeString = `${startDateDisplay}T${startTimeDisplay}:00Z`;
    const endDateTimeString = `${endDateDisplay}T${endTimeDisplay}:00Z`;

    const startMoment = moment.utc(startDateTimeString, "YYYY-MM-DDTHH:mm:ssZ", true);
    const endMoment = moment.utc(endDateTimeString, "YYYY-MM-DDTHH:mm:ssZ", true);

    if (
      !meetingTitle?.trim() ||
      !meetingDescription?.trim() ||
      assignFor.length === 0 ||
      !startMoment.isValid() ||
      !endMoment.isValid() ||
      !meetingLocation?.trim()
    ) {
      setErrorMessage("Title, Description, Location, Assigned person, valid Start/End Date/Time, Color, and Text Color are required.");
      return;
    }

    if (!endMoment.isSameOrAfter(startMoment)) {
      setErrorMessage("End date and time must be on or after start date and time.");
      return;
    }

    const durationMinutes = endMoment.diff(startMoment, 'minutes');
    if (durationMinutes <= 0) {
      setErrorMessage("End time must be after start time.");
      return;
    }

    const parsedAttendees = parseAttendees(attendees);

    const meetingDates = startDateDisplay && endDateDisplay && startDateDisplay !== endDateDisplay
      ? getDatesInRange(startDateDisplay, endDateDisplay)
      : [startDateDisplay];

    const nowUtc = moment().tz('UTC');
    const firstMeetingDateTime = moment.utc(meetingDates[0]).tz('UTC').set({
      hour: startMoment.hour(),
      minute: startMoment.minute(),
    });

    if (firstMeetingDateTime.isBefore(nowUtc)) {
      setErrorMessage("Cannot schedule a meeting for a date or time that is in the past.");
      return;
    }

    try {
      setErrorMessage("");

      let filePayload = {};
      if (file && typeof setFile === 'function') {
        const bufferArray = await toBase64(file);
        filePayload.file = {
          buffer: bufferArray,
          name: file.name,
          type: file.type,
          size: file.size
        };
      } else if (file) {
        console.warn("setFile is not a function, skipping file upload");
      }

      for (const dateStr of meetingDates) {
        const dateMoment = moment.utc(dateStr);
        const startDateTime = dateMoment.clone().set({
          hour: startMoment.hour(),
          minute: startMoment.minute(),
        }).toISOString();
        const endDateTime = dateMoment.clone().set({
          hour: endMoment.hour(),
          minute: endMoment.minute(),
        }).toISOString();

        const meetingFor = [
          ...assignFor.map(id => {
            const emp = employees.find(e => e._id === id);
            return { email: emp?.email || "" };
          }).filter(e => e.email),
          ...parsedAttendees.map(email => ({ email }))
        ];

        const meetingData = {
          meetingName: meetingTitle.trim(),
          meetingDescription: meetingDescription.trim(),
          meetingLink: meetingLocation.trim(),
          start_time_Date: startDateTime,
          end_time_Date: endDateTime,
          meetingDuration: durationMinutes + " minutes",
          registrants: assignFor,
          meetingBy: user?._id || "",
          meetingFor: meetingFor,
          meetingHost: user?.email || "",
          color: color, // Background Color
          textColor: textColor, // <-- NEW PAYLOAD FIELD
          bgColor: bgColor, // Kept this field, though it seems redundant with 'color' in this context
          ...filePayload
        };

        console.log("Sending payload for date:", dateStr, { meetingData });
        await meetingMutation.mutateAsync({ meetingData });
      }

      // Reset form after successful submission
      setMeetingTitle("");
      setMeetingDescription("");
      setMeetingLocation("");
      if (typeof setFile === 'function') {
        setFile(null);
      }
      setAssignFor([]);
      setAttendees("");
      setColor(DEFAULT_MEETING_COLOR);
      setTextColor(DEFAULT_TEXT_COLOR); // <-- NEW RESET
      setBgColor("#fee2e2");

      const defaultStart = selectedDateRange?.start || selectedDate;
      const defaultEnd = selectedDateRange?.end || selectedDate;
      setStartDateDisplay(defaultStart && moment(defaultStart).isValid() ? moment(defaultStart).tz('UTC').format("YYYY-MM-DD") : "");
      setStartTimeDisplay(defaultStart && moment(defaultStart).isValid() ? moment(defaultStart).tz('UTC').format("HH:mm") : moment().format("HH:mm"));
      setEndDateDisplay(defaultEnd && moment(defaultEnd).isValid() ? moment(defaultEnd).tz('UTC').format("YYYY-MM-DD") : "");
      setEndTimeDisplay(defaultEnd && moment(defaultEnd).isValid() ? moment(defaultEnd).tz('UTC').format("HH:mm") : moment().add(1, 'hour').format("HH:mm"));

      onMeetingAdded();
      queryClient.invalidateQueries(["meetings"]);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      setErrorMessage(`Failed to save meeting: ${errorMessage}`);
    }
  }, [
    meetingTitle,
    meetingDescription,
    meetingLocation,
    file,
    assignFor,
    attendees,
    color,
    textColor, // <-- ADDED dependency
    bgColor,
    startDateDisplay,
    startTimeDisplay,
    endDateDisplay,
    endTimeDisplay,
    setErrorMessage,
    meetingMutation,
    onMeetingAdded,
    parseAttendees,
    handleFileRemove,
    toBase64,
    getDatesInRange,
    user,
    employees,
    selectedDate,
    selectedDateRange,
    queryClient,
    setFile
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
          Meeting Title
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter meeting title"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              fontSize: '12px',
              padding: '4px 8px',
              height: '32px',
              '& input': { padding: '0' },
              '&.Mui-focused': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' },
            },
          }}
        />
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
          Location
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Room or Online Link"
          value={meetingLocation}
          onChange={(e) => setMeetingLocation(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              fontSize: '12px',
              padding: '4px 8px',
              height: '32px',
              '& input': { padding: '0' },
              '&.Mui-focused': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' },
            },
          }}
        />
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
          Date & Time (UTC)
        </Typography>
        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={0.5}>
          <TextField
            type="date"
            value={startDateDisplay}
            onChange={(e) => setStartDateDisplay(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '10px',
                height: '36px',
                lineHeight: '1.4rem',
              },
              '& input': {
                paddingRight: "10px",
              },
            }}
          />
          <TextField
            type="time"
            value={startTimeDisplay}
            onChange={(e) => setStartTimeDisplay(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '11px',
                height: '36px',
                lineHeight: '1.4rem',
              },
              '& input': {
                padding: '6px 6px',
              },
            }}
          />
          <TextField
            type="date"
            value={endDateDisplay}
            onChange={(e) => setEndDateDisplay(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '10px',
                height: '36px',
                lineHeight: '1.4rem',
              },
              '& input': {
                padding: '6px 12px',
              },
            }}
          />
          <TextField
            type="time"
            value={endTimeDisplay}
            onChange={(e) => setEndTimeDisplay(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '11px',
                height: '36px',
                lineHeight: '1.4rem',
              },
              '& input': {
                padding: '6px 12px',
              },
            }}
          />
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
          Agenda/Description
        </Typography>
        <TextareaAutosize
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="What will be discussed?"
          value={meetingDescription}
          onChange={(e) => setMeetingDescription(e.target.value)}
          rows={2}
          style={{
            width: '100%',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            fontSize: '11px',
            outline: 'none',
            minHeight: '40px'
          }}
        />
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="medium"
          mb={0.25}
          lineHeight={1}
        >
          Internal Attendees (Employees)
        </Typography>
        {employeesLoading ? (
          <Typography variant="caption" color="text.secondary">
            Loading employees...
          </Typography>
        ) : employeesError ? (
          <Typography variant="caption" color="error">
            Error loading employees: {employeesError.message}
          </Typography>
        ) : employees.length > 0 ? (
          <Autocomplete
            multiple
            options={employees}
            getOptionLabel={(option) => option.name}
            value={employees.filter((employee) => assignFor.includes(employee._id))}
            onChange={handleAssignChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                placeholder="Select internal employees"
                InputProps={{
                  ...params.InputProps,
                  sx: {
                    height: 26,
                    padding: "0 4px",
                  },
                  endAdornment: (
                    <>
                      {employeesLoading ? (
                        <CircularProgress color="inherit" size={12} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '11px',
                padding: '0 4px',
                minHeight: '38px',
                maxHeight: '44px',
                overflowY: 'auto',
                '& input': {
                  padding: '0 !important',
                  fontSize: '11px',
                },
                '& .MuiChip-root': {
                  height: '16px',
                  fontSize: '9px',
                  margin: '1px',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '15px',
                },
              },
            }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            No employees available
          </Typography>
        )}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
          External Attendees (Emails)
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Comma-separated emails"
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: <InputAdornment position="start" sx={{ fontSize: '12px', margin: 0, paddingRight: '4px' }}>@</InputAdornment>,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              fontSize: '12px',
              padding: '4px 8px',
              height: '32px',
              '& input': { padding: '0' },
              '&.Mui-focused': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' },
            },
          }}
        />
      </Box>

      {/* Color Pickers: Background Color and Text Color (COMBINED) */}
      <Box display="flex" gap={2}>
        {/* Meeting Background Color Picker (Original 'Color') */}
        <Box flex={1}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Background Color
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)} // Updated to direct setColor
              style={{
                width: '24px',
                height: '24px',
                padding: '0',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            />
            <Typography variant="caption" fontWeight="medium" sx={{
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              p: 0.25,
              minWidth: '70px',
              textAlign: 'center',
              bgcolor: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              {color.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        {/* Text Color Picker (NEW) */}
        <Box flex={1}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Text Color
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)} // <-- NEW HANDLER
              style={{
                width: '24px',
                height: '24px',
                padding: '0',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            />
            <Typography variant="caption" fontWeight="medium" sx={{
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              p: 0.25,
              minWidth: '70px',
              textAlign: 'center',
              bgcolor: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              {textColor.toUpperCase()}
            </Typography>
          </Box>
        </Box>
      </Box>
 

      {/* File Upload (Keeping the drag/drop context for reference, though DND is usually complex in single files) */}
      <Box
        ref={drop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          border: '1px dashed',
          borderColor: isOver || dragActive ? '#6366f1' : '#e5e7eb',
          bgcolor: isOver || dragActive ? '#eef2ff' : '#f9fafb',
          borderRadius: '6px',
          p: 1,
          textAlign: 'center',
          transition: 'all 0.2s',
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
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileSelect}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', p: 0.5, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GetFileThumbnail fileType={file.type} fileUrl={URL.createObjectURL(file)} />
              <Box>
                <Typography variant="body2" color="text.primary" fontWeight="medium" fontSize={12}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize={9}>
                  {getFileSizeText(file)}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={handleFileRemove}
              sx={{ minWidth: 0, p: 0, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </Button>
          </Box>
        )}
      </Box>


      <Button
        id="meeting-submit"
        onClick={handleSubmit}
        disabled={meetingMutation.isLoading || !meetingTitle?.trim() || !meetingDescription?.trim() || assignFor.length === 0 || !color || !textColor || !meetingLocation?.trim()} // <-- ADDED textColor to disabled check
        sx={{ display: 'none' }}
      >
        {meetingMutation.isLoading ? (<CircularProgress size={20} color="inherit" />) : ("Schedule Meeting")}
      </Button>
    </Box>
  );
}

export default MeetingTab;
