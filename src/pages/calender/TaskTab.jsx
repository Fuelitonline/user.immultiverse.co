


// import React, { useRef, useCallback, useState, useEffect } from "react";
// import { useDrop } from "react-dnd";
// import AttachFileIcon from "@mui/icons-material/AttachFile";
// import CloseIcon from "@mui/icons-material/Close";
// import GetFileThumbnail from "./getFileThumnail";
// import { usePost, useGet } from "../../hooks/useApi";
// import moment from 'moment-timezone';
// import {
//   Box,
//   Typography,
//   TextareaAutosize,
//   Button,
//   CircularProgress,
//   Autocomplete,
//   TextField,
//   // InputAdornment, // Not needed
// } from "@mui/material";

// // Define default colors
// const DEFAULT_TASK_COLOR = '#EA2A2A'
// const DEFAULT_TEXT_COLOR = '#ffffff'; // White (Text for good contrast)

// // --- EMAIL VALIDATION REGEX (commented out as it's not directly used in the current visible logic) ---
// // const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // const UPPERCASE_REGEX = /[A-Z]/;
// // ---

// function TaskTab({ description, setDescription, file, setFile, setErrorMessage, selectedDate, selectedDateRange, onTaskAdded }) {
//   const fileInputRef = useRef(null);
//   const [dragActive, setDragActive] = useState(false);

//   const [taskTitle, setTaskTitle] = useState("");
//   const [color, setColor] = useState(DEFAULT_TASK_COLOR);
//   const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR); // <-- NEW STATE FOR TEXT COLOR
//   const [assignFor, setAssignFor] = useState([]);

//   const taskMutation = usePost("/employee/daily-work/create", {}, "dailyWork");

//   // Fetch employees using useGet
//   const { data: employeesData, /* error: employeesError, */ isLoading: employeesLoading } = useGet(
//     "employee/all",
//     {},
//     {},
//     { queryKey: ["employees"] }
//   );

//   // Extract and sort the employee array
//   const employees = (employeesData?.data?.message?.[0] || []).sort((a, b) => a.name.localeCompare(b.name));

//   // Function to convert file to buffer array
//   const toBase64 = useCallback((file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsArrayBuffer(file);
//       reader.onload = () => {
//         const buffer = new Uint8Array(reader.result);
//         resolve(Array.from(buffer));
//       };
//       reader.onerror = (error) => reject(error);
//     }), []);

//   const handleDragEnter = useCallback(() => setDragActive(true), []);
//   const handleDragLeave = useCallback(() => setDragActive(false), []);
//   const handleDragOver = useCallback((e) => e.preventDefault(), []);

//   const handleDrop = useCallback(
//     (e) => {
//       e.preventDefault();
//       setDragActive(false);
//       if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
//     },
//     [setFile]
//   );

//   const handleFileSelect = useCallback(
//     (e) => {
//       if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
//       else setErrorMessage("No file selected");
//     },
//     [setFile, setErrorMessage]
//   );

//   const triggerFileInput = useCallback(() => fileInputRef.current.click(), []);

//   // Function to remove file and reset the input field
//   const handleFileRemove = useCallback(() => {
//     setFile(null);
//     if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//     }
//   }, [setFile]);

//   const getFileSizeText = useCallback((file) => {
//     const size = file.size;
//     if (size < 1024) return `${size} B`;
//     if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
//     return `${(size / (1024 * 1024)).toFixed(1)} MB`;
//   }, []);

//   const [{ isOver }, drop] = useDrop({
//     accept: "file",
//     collect: (monitor) => ({ isOver: monitor.isOver() }),
//   });

//   const handleAssignChange = useCallback((event, newValue) => {
//     setAssignFor(newValue.map(employee => employee._id));
//   }, []);

//   // Function to parse and validate guest emails (UPDATED FOR STRICT LOWERCASE CHECK)

//   const handleSubmit = useCallback(async () => {
//     // Determine the dates from props
//     const initialStartDateISO = selectedDateRange?.start || selectedDate;
//     const initialEndDateISO = selectedDateRange?.end || selectedDate;

//     const startMoment = initialStartDateISO && moment(initialStartDateISO).isValid()
//         ? moment(initialStartDateISO).tz('UTC').startOf('day')
//         : null;
//     const endMoment = initialEndDateISO && moment(initialEndDateISO).isValid()
//         ? moment(initialEndDateISO).tz('UTC').startOf('day')
//         : null;


//     // Validation for required fields
//     if (
//       !taskTitle.trim() ||
//       !description.trim() ||
//       assignFor.length === 0 ||
//       !startMoment ||
//       !endMoment 
//     ) {
//       setErrorMessage("Task Title, Description, Assigned person, Dates (from calendar) are required.");
//       return;
//     }

//     // Date Validation
//     if (!endMoment.isSameOrAfter(startMoment)) {
//       setErrorMessage("End date must be on or after start date.");
//       return;
//     }

//     try {
//       setErrorMessage("");

//       // --- FILE PAYLOAD PREPARATION ---
//       let filePayload = {};

//       if (file) {
//         const bufferArray = await toBase64(file);
//         filePayload.file = {
//               buffer: bufferArray,
//               name: file.name,
//               type: file.type,
//               size: file.size
//         };
//       }
//       // --- END FILE PAYLOAD PREPARATION ---

//       // 1. Start Date (YYYY-MM-DD in UTC)
//       const startDateFormatted = startMoment.format('YYYY-MM-DD');

//       // 2. End Date FIX: If it's a multi-day event, add one day for calendar compatibility.
//       let finalEndDateFormatted;

//       if (endMoment.isAfter(startMoment, 'day')) {
//           // It's a multi-day event, so add one day to the end date (e.g., 18 -> 19).
//           finalEndDateFormatted = endMoment.clone().add(1, 'day').format('YYYY-MM-DD');
//       } else {
//           // Single day event, use the original end date.
//           finalEndDateFormatted = endMoment.format('YYYY-MM-DD');
//       }

//       // Prepare base JSON payload
//       const jsonPayload = {
//         title: taskTitle.trim(),
//         description: description,
//         startDate: startDateFormatted,
//         endDate: finalEndDateFormatted, // Use the corrected end date
//         assignFor: assignFor,
//         color: color,
//         textColor: textColor, // <-- NEW PAYLOAD FIELD
//       };

//       // Final payload combining task data and file data (if present)
//       const finalPayload = {
//           ...jsonPayload,
//           ...filePayload
//       };

//       await taskMutation.mutateAsync(finalPayload);


//       // Reset form after successful submission
//       setTaskTitle("");
//       setDescription("");
//       handleFileRemove();
//       setAssignFor([]);
//       setColor(DEFAULT_TASK_COLOR);
//       setTextColor(DEFAULT_TEXT_COLOR); // <-- NEW RESET
//       
//       onTaskAdded();

//     } catch (error) {
//       const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
//       setErrorMessage(`Failed to save task: ${errorMessage}`);
//     }
//   }, [
//     taskTitle,
//     description,
//     file,
//     assignFor,
//     color,
//     textColor, // <-- ADDED dependency
//     setDescription,
//     setErrorMessage,
//     taskMutation,
//     onTaskAdded,
//     selectedDate,
//     selectedDateRange,
//     handleFileRemove,
//     toBase64
//   ]);

//   return (
//     // ✅ Further Reduced main gap to 1
//     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
//       {/* Task Title */}
//       <Box>
//         <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}> {/* ✅ Reduced mb further */}
//           Task Title
//         </Typography>
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Enter a short title"
//           value={taskTitle}
//           onChange={(e) => setTaskTitle(e.target.value)}
//           variant="outlined"
//           sx={{
//             '& .MuiOutlinedInput-root': {
//               bgcolor: '#fff',
//               border: '1px solid #e5e7eb',
//               borderRadius: '4px',
//               boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//               fontSize: '12px', // ✅ Smaller font
//               padding: '4px 8px',
//               height: '32px', // ✅ Fixed height for compact look
//               '& input': {
//                 padding: '0', 
//               },
//               '&.Mui-focused': {
//                 borderColor: '#6366f1',
//                 boxShadow: '0 0 0 1px #6366f1',
//               },
//             },
//           }}
//         />
//       </Box>

//       {/* Task Description */}
//       <Box>
//         <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//           Description
//         </Typography>
//         <TextareaAutosize
//           className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
//           placeholder="What to do?"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           rows={2} // ✅ Reduced rows to 2 for compactness
//           style={{
//             width: '100%',
//             padding: '5px', // ✅ Reduced padding
//             borderRadius: '4px',
//             border: '1px solid #e5e7eb',
//             backgroundColor: '#fff',
//             boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//             fontSize: '11px', // ✅ Smaller font
//             outline: 'none',
//             minHeight: '40px' // Ensure a minimum readable height
//           }}
//         />
//       </Box>

//       {/* Assign To (Employees) */}
// <Autocomplete
//   multiple
//   options={employees}
//   getOptionLabel={(option) => option.name}
//   value={employees.filter(employee => assignFor.includes(employee._id))}
//   onChange={handleAssignChange}
//   renderInput={(params) => (
//     <TextField
//       {...params}
//       variant="outlined"
//       size="small"
//       placeholder="Select employees"
//       InputProps={{
//         ...params.InputProps,
//         sx: {
//           height: 38, // 👈 reduce overall input height
//           padding: "0 4px",
//         },
//         endAdornment: (
//           <>
//             {employeesLoading ? <CircularProgress color="inherit" size={12} /> : null}
//             {params.InputProps.endAdornment}
//           </>
//         ),
//       }}
//     />
//   )}
//   sx={{
//     '& .MuiOutlinedInput-root': {
//       bgcolor: '#fff',
//       border: '1px solid #e5e7eb',
//       borderRadius: '4px',
//       boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//       maxHeight: '50px', // 👈 reduce dropdown input area height
//       overflowY: 'auto',
//       fontSize: '12px',
//       padding: '0 4px',
//       minHeight: '26px', // 👈 smaller minimum height
//       '& input': {
//         padding: '0 !important', // 👈 tighter input spacing
//         fontSize: '12px',
//       },
//       '& .MuiChip-root': {
//         height: '18px', // 👈 smaller chips
//         fontSize: '10px',
//         margin: '1px',
//       },
//       '& .MuiSvgIcon-root': { 
//         fontSize: '16px', // 👈 smaller dropdown/clear icon
//       },
//     },
//   }}
// />


//       {/* Color Pickers: Task Color and Text Color (COMBINED) */}
//       <Box display="flex" gap={2}>
//         {/* Task Background Color Picker (Original 'Color') */}
//         <Box flex={1}>
//           <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//             Background Color
//           </Typography>
//           <Box display="flex" alignItems="center" gap={1}>
//               <input
//                   type="color"
//                   value={color}
//                   onChange={(e) => setColor(e.target.value)}
//                   style={{
//                       width: '24px', // Smallest size
//                       height: '24px',
//                       padding: '0',
//                       border: '1px solid #e5e7eb',
//                       borderRadius: '4px',
//                       cursor: 'pointer',
//                       backgroundColor: 'transparent',
//                   }}
//               />
//               <Typography variant="caption" fontWeight="medium" sx={{
//                   border: '1px solid #e5e7eb',
//                   borderRadius: '4px',
//                   p: 0.25, // Minimal padding
//                   minWidth: '70px',
//                   textAlign: 'center',
//                   bgcolor: '#fff',
//                   boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//               }}>
//                 {color.toUpperCase()}
//               </Typography>
//           </Box>
//         </Box>

//         {/* Text Color Picker (NEW) */}
//         <Box flex={1}>
//           <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
//             Text Color
//           </Typography>
//           <Box display="flex" alignItems="center" gap={1}>
//               <input
//                   type="color"
//                   value={textColor}
//                   onChange={(e) => setTextColor(e.target.value)}
//                   style={{
//                       width: '24px',
//                       height: '24px',
//                       padding: '0',
//                       border: '1px solid #e5e7eb',
//                       borderRadius: '4px',
//                       cursor: 'pointer',
//                       backgroundColor: 'transparent',
//                   }}
//               />
//               <Typography variant="caption" fontWeight="medium" sx={{
//                     border: '1px solid #e5e7eb',
//                     borderRadius: '4px',
//                     p: 0.25,
//                     minWidth: '70px',
//                     textAlign: 'center',
//                     bgcolor: '#fff',
//                     boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//                 }}>
//                   {textColor.toUpperCase()}
//               </Typography>
//           </Box>
//         </Box>
//       </Box>


//       {/* File Upload */}
//       <Box
//         ref={drop}
//         onDragEnter={handleDragEnter}
//         onDragLeave={handleDragLeave}
//         onDragOver={handleDragOver}
//         onDrop={handleDrop}
//         sx={{
//           border: '1px dashed', // Thinner dashed border
//           borderColor: dragActive || isOver ? '#6366f1' : '#e5e7eb',
//           bgcolor: dragActive || isOver ? '#eef2ff' : '#f9fafb',
//           borderRadius: '6px', // Smaller border radius
//           p: 1, // Minimal padding
//           textAlign: 'center',
//           transition: 'all 0.2s',
//           '&:hover': {
//             borderColor: '#6366f1',
//             bgcolor: '#eef2ff',
//           },
//         }}
//       >
//         {!file ? (
//           <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center',    alignItems: 'center', gap: 1 }}>
//             <AttachFileIcon sx={{ color: '#6366f1', fontSize: 16 }} />
//             <Typography variant="caption" color="text.secondary" fontWeight="medium" lineHeight={1}>
//               Drop file or
//             </Typography>
//             <Button
//               variant="outlined"
//               color="primary"
//               onClick={triggerFileInput}
//               sx={{
//                 textTransform: 'none',
//                 fontSize: '10px', // Smallest button font
//                 fontWeight: '600',
//                 borderColor: '#6366f1',
//                 color: '#6366f1',
//                 borderRadius: '4px',
//                 px: 1,
//                 py: 0,
//                 lineHeight: 1.5,
//                 '&:hover': {
//                   bgcolor: '#eef2ff',
//                   borderColor: '#4f46e5',
//                 },
//               }}
//             >
//               Browse
//             </Button>
//             <input
//               ref={fileInputRef}
//               type="file"
//               hidden
//               onChange={handleFileSelect}
//             />
//           </Box>
//         ) : (
//           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', p: 0.5, borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <GetFileThumbnail fileType={file.type} fileUrl={URL.createObjectURL(file)} />
//               <Box>
//                 <Typography variant="body2" color="text.primary" fontWeight="medium" fontSize={12}>
//                   {file.name}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary" fontSize={9}>
//                   {getFileSizeText(file)}
//                 </Typography>
//               </Box>
//             </Box>
//             <Button
//               onClick={handleFileRemove}
//               sx={{ minWidth: 0, p: 0, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
//             >
//               <CloseIcon sx={{ fontSize: 12 }} />
//             </Button>
//           </Box>
//         )}
//       </Box>

//       {/* Submit Button (Hidden) */}
//       <Button
//         id="task-submit"
//         onClick={handleSubmit}
//         disabled={taskMutation.isLoading || !taskTitle.trim() || !description.trim() || assignFor.length === 0 || !color || !textColor || !selectedDate} // <-- Added textColor to disabled check
//         sx={{
//           display: 'none',
//         }}
//       >
//         {taskMutation.isLoading ? (
//           <CircularProgress size={20} color="inherit" />
//         ) : (
//           "Save Task"
//         )}
//       </Button>
//     </Box>
//   );

// }

// export default TaskTab;


import React, { useRef, useCallback, useState, useEffect } from "react";
import { useDrop } from "react-dnd";
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
} from "@mui/material";

// Define default colors
const DEFAULT_TASK_COLOR = '#EA2A2A';
const DEFAULT_TEXT_COLOR = '#ffffff'; // White (Text for good contrast)

function TaskTab({ description, setDescription, file, setFile, setErrorMessage, selectedDate, selectedDateRange, onTaskAdded }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [color, setColor] = useState(DEFAULT_TASK_COLOR);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [assignFor, setAssignFor] = useState([]);

  const taskMutation = usePost("/employee/daily-work/create", {}, "dailyWork");

  // Fetch employees using useGet
  const { data: employeesData, isLoading: employeesLoading } = useGet(
    "employee/all",
    {},
    {},
    { queryKey: ["employees"] }
  );

  // Extract and sort the employee array
  const employees = (employeesData?.data?.message?.[0] || []).sort((a, b) => a.name.localeCompare(b.name));

  // Function to convert file to buffer array
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
      if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
    },
    [setFile]
  );

  const handleFileSelect = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
      else setErrorMessage("No file selected");
    },
    [setFile, setErrorMessage]
  );

  const triggerFileInput = useCallback(() => fileInputRef.current.click(), []);

  // Function to remove file and reset the input field
  const handleFileRemove = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setFile]);

  const getFileSizeText = useCallback((file) => {
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

  const handleSubmit = useCallback(async () => {
    // Determine the dates from props
    const initialStartDateISO = selectedDateRange?.start || selectedDate;
    const initialEndDateISO = selectedDateRange?.end || selectedDate;

    const startMoment = initialStartDateISO && moment(initialStartDateISO).isValid()
      ? moment(initialStartDateISO).tz('UTC').startOf('day')
      : null;
    const endMoment = initialEndDateISO && moment(initialEndDateISO).isValid()
      ? moment(initialEndDateISO).tz('UTC').startOf('day')
      : null;

    // Validation for required fields
    if (
      !taskTitle.trim() ||
      !description.trim() ||
      assignFor.length === 0 ||
      !startMoment ||
      !endMoment
    ) {
      setErrorMessage("Task Title, Description, Assigned person, Dates (from calendar) are required.");
      return;
    }

    // Date Validation
    if (!endMoment.isSameOrAfter(startMoment)) {
      setErrorMessage("End date must be on or after start date.");
      return;
    }

    try {
      setErrorMessage("");

      // --- FILE PAYLOAD PREPARATION ---
      let filePayload = {};

      if (file) {
        const bufferArray = await toBase64(file);
        filePayload.file = {
          buffer: bufferArray,
          name: file.name,
          type: file.type,
          size: file.size
        };
      }
      // --- END FILE PAYLOAD PREPARATION ---

      // 1. Start Date (YYYY-MM-DD in UTC)
      const startDateFormatted = startMoment.format('YYYY-MM-DD');

      // 2. End Date: Use the exact end date without adding an extra day
      const finalEndDateFormatted = endMoment.format('YYYY-MM-DD');

      // Prepare base JSON payload
      const jsonPayload = {
        title: taskTitle.trim(),
        description: description,
        startDate: startDateFormatted,
        endDate: finalEndDateFormatted, // Use the exact end date
        assignFor: assignFor,
        color: color,
        textColor: textColor,
      };

      // Final payload combining task data and file data (if present)
      const finalPayload = {
        ...jsonPayload,
        ...filePayload
      };

      await taskMutation.mutateAsync(finalPayload);

      // Reset form after successful submission
      setTaskTitle("");
      setDescription("");
      handleFileRemove();
      setAssignFor([]);
      setColor(DEFAULT_TASK_COLOR);
      setTextColor(DEFAULT_TEXT_COLOR);
      onTaskAdded();

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      setErrorMessage(`Failed to save task: ${errorMessage}`);
    }
  }, [
    taskTitle,
    description,
    file,
    assignFor,
    color,
    textColor,
    setDescription,
    setErrorMessage,
    taskMutation,
    onTaskAdded,
    selectedDate,
    selectedDateRange,
    handleFileRemove,
    toBase64
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
      {/* Task Title */}
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
          Task Title
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter a short title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
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
              '& input': {
                padding: '0',
              },
              '&.Mui-focused': {
                borderColor: '#6366f1',
                boxShadow: '0 0 0 1px #6366f1',
              },
            },
          }}
        />
      </Box>

      {/* Task Description */}
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
          Description
        </Typography>
        <TextareaAutosize
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="What to do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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

      {/* Assign To (Employees) */}
      <Autocomplete
        multiple
        options={employees}
        getOptionLabel={(option) => option.name}
        value={employees.filter(employee => assignFor.includes(employee._id))}
        onChange={handleAssignChange}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            placeholder="Select employees"
            InputProps={{
              ...params.InputProps,
              sx: {
                height: 38,
                padding: "0 4px",
              },
              endAdornment: (
                <>
                  {employeesLoading ? <CircularProgress color="inherit" size={12} /> : null}
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
            maxHeight: '50px',
            overflowY: 'auto',
            fontSize: '12px',
            padding: '0 4px',
            minHeight: '26px',
            '& input': {
              padding: '0 !important',
              fontSize: '12px',
            },
            '& .MuiChip-root': {
              height: '18px',
              fontSize: '10px',
              margin: '1px',
            },
            '& .MuiSvgIcon-root': {
              fontSize: '16px',
            },
          },
        }}
      />

      {/* Color Pickers: Task Color and Text Color */}
      <Box display="flex" gap={2}>
        {/* Task Background Color Picker */}
        <Box flex={1}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Background Color
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
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

        {/* Text Color Picker */}
        <Box flex={1}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={0.25} lineHeight={1}>
            Text Color
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
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

      {/* Submit Button (Hidden) */}
      <Button
        id="task-submit"
        onClick={handleSubmit}
        disabled={taskMutation.isLoading || !taskTitle.trim() || !description.trim() || assignFor.length === 0 || !color || !textColor || !selectedDate}
        sx={{
          display: 'none',
        }}
      >
        {taskMutation.isLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          "Save Task"
        )}
      </Button>
    </Box>
  );
}

export default TaskTab;

