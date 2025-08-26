import React, { useRef, useCallback, useState } from "react";
import { useDrop } from "react-dnd";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import GetFileThumbnail from "../Profile/getFileThumnail";
import { usePost, useGet } from "../../hooks/useApi";
import moment from 'moment-timezone';

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

  // Extract the employee array from the nested structure
  const employees = employeesData?.data?.message?.[0] || [];

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
    },
    [setFile]
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

  const handleCheckboxChange = useCallback((employeeId) => {
    setAssignFor((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (
      !description.trim() ||
      !file ||
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
      // Create a task for each date in the range
      for (const date of taskDates) {
        const startDate = moment(date).tz('UTC').format('YYYY-MM-DD');
        const endDate = moment(taskDates.length === 1 ? date : selectedDateRange?.end || date).tz('UTC').format('YYYY-MM-DD');

        const formData = new FormData();
        formData.append("description", description);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        formData.append("file", file);
        // Append each employee ID separately
        assignFor.forEach((employeeId) => {
          formData.append("assignFor", employeeId);
        });
        await taskMutation.mutateAsync(formData);
      }
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
    <>
      <div>
        <label className="text-gray-500 font-medium text-sm block mb-1">
          Task Description
        </label>
        <textarea
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="What did you work on today?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        />
      </div>
      <div>
        <label className="text-gray-500 font-medium text-sm block mb-1">
          Date Range
        </label>
        <div className="text-gray-600 text-sm mb-2">
          {taskDates.length > 0 && startDate && endDate ? (
            taskDates.length === 1 ? (
              <span>
                {moment(startDate).tz('Asia/Kolkata').format('MMMM D, YYYY')}
              </span>
            ) : (
              <span>
                {moment(startDate).tz('Asia/Kolkata').format('MMM D, YYYY')} -{' '}
                {moment(endDate).tz('Asia/Kolkata').format('MMM D, YYYY')}
              </span>
            )
          ) : (
            <span className="text-red-500">No valid date selected</span>
          )}
        </div>
      </div>
      <div className="relative">
        <label className="text-gray-500 font-medium text-sm block mb-1">
          Assign To
        </label>
        {employeesLoading ? (
          <div className="text-gray-500 text-sm">Loading employees...</div>
        ) : employeesError ? (
          <div className="text-red-500 text-sm">Error loading employees: {employeesError.message}</div>
        ) : employees.length > 0 ? (
          <div
            className="w-full border border-gray-200 rounded-lg bg-white shadow-sm p-2"
            style={{
              maxHeight: "90px",
              overflowY: "auto",
            }}
          >
            {employees
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((employee) => (
                <label
                  key={employee._id}
                  className="flex items-center p-2 hover:bg-indigo-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={assignFor.includes(employee._id)}
                    onChange={() => handleCheckboxChange(employee._id)}
                    className="mr-2 h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  {employee.name} - {employee.position}
                </label>
              ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No employees available</div>
        )}
      </div>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={drop}
        className={`border-2 border-dashed ${
          dragActive || isOver ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-gray-50"
        } rounded-xl p-4 text-center transition-all duration-200 hover:border-indigo-500 hover:bg-indigo-50`}
      >
        {!file ? (
          <div className="flex flex-col items-center gap-4">
            <AttachFileIcon className="text-indigo-500 text-4xl" />
            <span className="text-gray-600 font-medium text-sm">
              Drag & drop a file here, or
            </span>
            <button
              className="text-indigo-500 border border-indigo-500 rounded-lg px-4 py-2 font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-600"
              onClick={triggerFileInput}
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileSelect}
            />
            <span className="text-gray-400 text-xs">
              Supported file types: images, PDFs, documents, videos
            </span>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <GetFileThumbnail fileType={file.type} fileUrl={URL.createObjectURL(file)} />
              <div>
                <span className="text-gray-800 font-medium text-sm">{file.name}</span>
                <p className="text-gray-500 text-xs">{getFileSizeText(file)}</p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <CloseIcon className="text-sm" />
            </button>
          </div>
        )}
      </div>
      <button
        id="task-submit"
        onClick={handleSubmit}
        className={`hidden ${
          taskMutation.isLoading || !file || !description.trim() || assignFor.length === 0 || taskDates.length === 0
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        disabled={taskMutation.isLoading || !file || !description.trim() || assignFor.length === 0 || taskDates.length === 0}
      >
        {taskMutation.isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          "Save Task"
        )}
      </button>
    </>
  );
}

export default TaskTab;