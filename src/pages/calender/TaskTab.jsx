import React, { useRef, useCallback, useState } from "react";
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

function TaskTab({ description, setDescription, file, setFile, setErrorMessage, selectedDate, selectedDateRange, onTaskAdded }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [assignFor, setAssignFor] = useState([]);
  const [startDate, setStartDate] = useState(
    selectedDateRange?.start && moment(selectedDateRange.start).isValid()
      ? moment(selectedDateRange.start).tz('UTC').format("YYYY-MM-DD")
      : selectedDate && moment(selectedDate).isValid()
      ? moment(selectedDate).tz('UTC').format("YYYY-MM-DD")
      : ""
  );
  const [endDate, setEndDate] = useState(
    selectedDateRange?.end && moment(selectedDateRange.end).isValid()
      ? moment(selectedDateRange.end).tz('UTC').format("YYYY-MM-DD")
      : selectedDate && moment(selectedDate).isValid()
      ? moment(selectedDate).tz('UTC').format("YYYY-MM-DD")
      : ""
  );
  const taskMutation = usePost("/employee/daily-work/create", {}, "dailyWork");

  // Fetch employees using useGet
  const { data: employeesData, error: employeesError, isLoading: employeesLoading } = useGet(
    "employee/all",
    {},
    {},
    { queryKey: ["employees"] }
  );

  // Extract and sort the employee array
  const employees = (employeesData?.data?.message?.[0] || []).sort((a, b) => a.name.localeCompare(b.name));

  // Log for debugging
  console.log('TaskTab - Props:', { description, file, selectedDate, selectedDateRange, assignFor });
  console.log('TaskTab - Employees:', { employees, employeesLoading, employeesError });

  // Function to convert file to buffer array
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file); // read as ArrayBuffer (raw binary)
      reader.onload = () => {
        const buffer = new Uint8Array(reader.result);
        resolve(Array.from(buffer)); // convert to array of numbers (buffer style)
      };
      reader.onerror = (error) => reject(error);
    });

  // Function to generate an array of dates in the selected range
  const getDatesInRange = useCallback((start, end) => {
    if (!start || !end || !moment(start).isValid() || !moment(end).isValid()) return [];
    const startDate = moment(start).startOf('day');
    const endDate = moment(end).startOf('day');
    const dates = [];
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.toISOString());
      currentDate.add(1, 'day');
    }
    return dates;
  }, []);

  // Determine the dates to use for task creation
  const taskDates = selectedDateRange && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()
    ? getDatesInRange(selectedDateRange.start, selectedDateRange.end)
    : selectedDate && moment(selectedDate).isValid()
    ? [moment(selectedDate).toISOString()]
    : [];

  const isValidDate = (dateString) => {
    return dateString && !isNaN(new Date(dateString).getTime());
  };

  const validateDates = (start, end) => {
    if (!start || !end) return false;
    const startDate = moment(start).tz('UTC').startOf('day');
    const endDate = moment(end).tz('UTC').startOf('day');
    return startDate.isSameOrBefore(endDate);
  };

  const handleDragEnter = useCallback(() => setDragActive(true), []);
  const handleDragLeave = useCallback(() => setDragActive(false), []);
  const handleDragOver = useCallback((e) => e.preventDefault(), []);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
    },
    [setFile]
  );

  const handleFileSelect = useCallback(
    (e) => {
      if (e.target.files[0]) setFile(e.target.files[0]);
      else setErrorMessage("No file selected");
    },
    [setFile, setErrorMessage]
  );

  const triggerFileInput = useCallback(() => fileInputRef.current.click(), []);

  const getFileSizeText = useCallback((file) => {
    const size = file.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: "file",
    drop: (item) => {
      if (item.files[0]) setFile(item.files[0]);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  const handleAssignChange = useCallback((event, newValue) => {
    setAssignFor(newValue.map(employee => employee._id));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (
      !description.trim() ||
      assignFor.length === 0 ||
      taskDates.length === 0 ||
      !startDate ||
      !endDate
    ) {
      setErrorMessage("Task description, file, at least one assigned person, and valid start/end dates are required");
      return;
    }
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      setErrorMessage("Invalid start or end date");
      return;
    }
    if (!validateDates(startDate, endDate)) {
      setErrorMessage("End date must be on or after start date");
      return;
    }

    try {
      setErrorMessage("");
      
      // Convert file to buffer array if file exists
      let bufferArray = null;
      let fileName = null;
      let fileType = null;
      
      if (file) {
        bufferArray = await toBase64(file);
        fileName = file.name;
        fileType = file.type;
      }

      // Create a task for each date in the range
      for (const date of taskDates) {
        const startDateFormatted = moment(date).tz('UTC').format('YYYY-MM-DD');
        const endDateFormatted = moment(taskDates.length === 1 ? date : selectedDateRange?.end || date).tz('UTC').format('YYYY-MM-DD');

        // Prepare JSON payload
        const jsonPayload = {
          description: description,
          startDate: startDateFormatted,
          endDate: endDateFormatted,
          assignFor: assignFor,
          ...(file && {
            file: {
              buffer: bufferArray,
              name: fileName,
              type: fileType,
              size: file.size
            }
          })
        };

        // Send JSON request instead of FormData
        await taskMutation.mutateAsync(jsonPayload);
      }

      // Reset form after successful submission
      setDescription("");
      setFile(null);
      setAssignFor([]);
      setStartDate(
        selectedDateRange?.start && moment(selectedDateRange.start).isValid()
          ? moment(selectedDateRange.start).tz('UTC').format("YYYY-MM-DD")
          : selectedDate && moment(selectedDate).isValid()
          ? moment(selectedDate).tz('UTC').format("YYYY-MM-DD")
          : ""
      );
      setEndDate(
        selectedDateRange?.end && moment(selectedDateRange.end).isValid()
          ? moment(selectedDateRange.end).tz('UTC').format("YYYY-MM-DD")
          : selectedDate && moment(selectedDate).isValid()
          ? moment(selectedDate).tz('UTC').format("YYYY-MM-DD")
          : ""
      );
      onTaskAdded();
    } catch (error) {
      setErrorMessage(`Failed to save task: ${error.message}`);
    }
  }, [
    description,
    file,
    assignFor,
    taskDates,
    startDate,
    endDate,
    setDescription,
    setFile,
    setErrorMessage,
    taskMutation,
    onTaskAdded,
    selectedDate,
    selectedDateRange
  ]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
      {/* Task Description */}
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={1}>
          Task Description
        </Typography>
        <TextareaAutosize
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="What did you work on today?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            fontSize: '12px',
            outline: 'none',
          }}
        />
      </Box>

      {/* Date Range */}
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={1}>
          Date Range
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {taskDates.length > 0 && startDate && endDate ? (
            taskDates.length === 1 ? (
              moment(startDate).tz('Asia/Kolkata').format('MMMM D, YYYY')
            ) : (
              `${moment(startDate).tz('Asia/Kolkata').format('MMM D, YYYY')} - ${moment(endDate).tz('Asia/Kolkata').format('MMM D, YYYY')}`
            )
          ) : (
            <Typography color="error" variant="body2">
              No valid date selected
            </Typography>
          )}
        </Typography>
      </Box>

      {/* Assign To */}
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="medium" mb={1}>
          Assign To
        </Typography>
        {employeesLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading employees...
          </Typography>
        ) : employeesError ? (
          <Typography variant="body2" color="error">
            Error loading employees: {employeesError.message}
          </Typography>
        ) : employees.length > 0 ? (
          <Autocomplete
            multiple
            options={employees}
            getOptionLabel={(option) => `${option.name} - ${option.position}`}
            value={employees.filter(employee => assignFor.includes(employee._id))}
            onChange={handleAssignChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                placeholder="Search employees"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {employeesLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
                maxHeight: '90px',
                overflowY: 'auto',
                fontSize: '12px',
                '&:hover': {
                  borderColor: '#6366f1',
                },
                '&.Mui-focused': {
                  borderColor: '#6366f1',
                  boxShadow: '0 0 0 1px #6366f1',
                },
              },
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No employees available
          </Typography>
        )}
      </Box>

      {/* File Upload */}
      <Box
        ref={drop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: dragActive || isOver ? '#6366f1' : '#e5e7eb',
          bgcolor: dragActive || isOver ? '#eef2ff' : '#f9fafb',
          borderRadius: '12px',
          p: 4,
          textAlign: 'center',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#6366f1',
            bgcolor: '#eef2ff',
          },
        }}
      >
        {!file ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <AttachFileIcon sx={{ color: '#6366f1', fontSize: 32 }} />
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              Drag & drop a file here, or
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={triggerFileInput}
              sx={{
                textTransform: 'none',
                fontSize: '12px',
                fontWeight: '600',
                borderColor: '#6366f1',
                color: '#6366f1',
                borderRadius: '8px',
                px: 4,
                py: 1,
                '&:hover': {
                  bgcolor: '#eef2ff',
                  borderColor: '#4f46e5',
                },
              }}
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileSelect}
            />
            <Typography variant="caption" color="text.secondary">
              Supported file types: images, PDFs, documents, videos
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', p: 2, borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <GetFileThumbnail fileType={file.type} fileUrl={URL.createObjectURL(file)} />
              <Box>
                <Typography variant="body2" color="text.primary" fontWeight="medium">
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getFileSizeText(file)}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={() => setFile(null)}
              sx={{ minWidth: 0, p: 0, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Button>
          </Box>
        )}
      </Box>

      {/* Submit Button */}
      <Button
        id="task-submit"
        onClick={handleSubmit}
        disabled={taskMutation.isLoading || !file || !description.trim() || assignFor.length === 0 || taskDates.length === 0}
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