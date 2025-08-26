import React, { useState, useCallback, useEffect } from "react";
import { usePost, useGet } from "../../hooks/useApi";
import { useAuth } from "../../middlewares/auth/authContext";
import { useQueryClient } from '@tanstack/react-query';
import moment from "moment-timezone";

function MeetingTab({ selectedDate, selectedDateRange, setErrorMessage, onMeetingAdded }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [meetingName, setMeetingName] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [access, setAccess] = useState([]);
  const [registrants, setRegistrants] = useState([]);
  const [startTimeDate, setStartTimeDate] = useState(
    selectedDateRange?.start && moment(selectedDateRange.start).isValid()
      ? moment(selectedDateRange.start).tz('UTC').format("YYYY-MM-DDTHH:mm")
      : selectedDate && moment(selectedDate).isValid()
      ? moment(selectedDate).tz('UTC').format("YYYY-MM-DDTHH:mm")
      : ""
  );
  const [endTimeDate, setEndTimeDate] = useState(
    selectedDateRange?.end && moment(selectedDateRange.end).isValid()
      ? moment(selectedDateRange.end).tz('UTC').format("YYYY-MM-DDTHH:mm")
      : selectedDate && moment(selectedDate).isValid()
      ? moment(selectedDate).tz('UTC').format("YYYY-MM-DDTHH:mm")
      : ""
  );
  const [error, setError] = useState("");

  // Fetch employees
  const { data: employees, error: employeesError, isLoading: employeesLoading } = useGet(
    "employee/all",
    {},
    {},
    { queryKey: ["employees"] }
  );

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

  // Determine the dates to use for meeting creation
  const meetingDates = selectedDateRange && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()
    ? getDatesInRange(selectedDateRange.start, selectedDateRange.end)
    : selectedDate && moment(selectedDate).isValid()
    ? [moment(selectedDate).toISOString()]
    : [];

  // Configure usePost for JSON payload
  const meetingMutation = usePost(
    "/meetings/create",
    {},
    "meetings"
  );

  // Debug logging
  useEffect(() => {
    console.log("Employees Data:", employees);
    console.log("Employees Loading:", employeesLoading);
    console.log("Employees Error:", employeesError);
    console.log("Selected Date:", selectedDate || "null");
    console.log("Selected Date Range:", selectedDateRange);
    console.log("Meeting Dates:", meetingDates);
    console.log("Start Time Date:", startTimeDate);
    console.log("End Time Date:", endTimeDate);
  }, [
    employees,
    employeesLoading,
    employeesError,
    selectedDate,
    selectedDateRange,
    meetingDates,
    startTimeDate,
    endTimeDate,
  ]);

  const isValidDate = (dateString) => {
    return dateString && !isNaN(new Date(dateString).getTime());
  };

  const validateDates = (start, end) => {
    if (!start || !end) return false;
    const startDate = moment(start).tz('UTC');
    const endDate = moment(end).tz('UTC');
    return startDate.isBefore(endDate);
  };

  const handleCheckboxChange = useCallback(
    (e, emp) => {
      const isChecked = e.target.checked;
      setAccess((prev) =>
        isChecked ? [...prev, emp.name] : prev.filter((name) => name !== emp.name)
      );
      setRegistrants((prev) =>
        isChecked ? [...prev, emp._id] : prev.filter((id) => id !== emp._id)
      );
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (
      !meetingName.trim() ||
      !meetingDescription.trim() ||
      !meetingLink.trim() ||
      !startTimeDate ||
      !endTimeDate ||
      registrants.length === 0 ||
      meetingDates.length === 0
    ) {
      const errorMsg = "All meeting fields, at least one registrant, and valid date(s) are required";
      setError(errorMsg);
      setErrorMessage(errorMsg);
      return;
    }
    if (!isValidDate(startTimeDate) || !isValidDate(endTimeDate)) {
      const errorMsg = "Invalid start or end date/time";
      setError(errorMsg);
      setErrorMessage(errorMsg);
      return;
    }
    if (!validateDates(startTimeDate, endTimeDate)) {
      const errorMsg = "End date/time must be after start date/time";
      setError(errorMsg);
      setErrorMessage(errorMsg);
      return;
    }

    try {
      setError("");
      setErrorMessage("");
      // Create a meeting for each date in the range
      for (const date of meetingDates) {
        // For single date, use the same date for both start and end
        const isSingleDate = meetingDates.length === 1;
        const startDateTime = moment(date).tz('UTC').set({
          hour: moment(startTimeDate).tz('UTC').hour(),
          minute: moment(startTimeDate).tz('UTC').minute(),
        }).toISOString();
        const endDateTime = moment(isSingleDate ? date : selectedDateRange?.end || date).tz('UTC').set({
          hour: moment(endTimeDate).tz('UTC').hour(),
          minute: moment(endTimeDate).tz('UTC').minute(),
        }).toISOString();

        // Validate that end time is after start time for each meeting
        if (!moment(endDateTime).isAfter(startDateTime)) {
          const errorMsg = `End time must be after start time for meeting on ${moment(date).format('YYYY-MM-DD')}`;
          setError(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        const meetingData = {
          meetingName,
          meetingDescription: meetingDescription,
          meetingLink,
          start_time_Date: startDateTime,
          end_time_Date: endDateTime,
          meetingDuration: moment(endDateTime).diff(moment(startDateTime), 'minutes') + " minutes",
          registrants: registrants,
          meetingBy: user?._id || "",
          meetingFor: registrants.map(id => {
            const emp = employees?.data?.message?.[0]?.find(e => e._id === id);
            return { email: emp?.email || "" };
          }).filter(e => e.email),
          meetingHost: user?.email || ""
        };
        console.log("Sending payload for date:", date, { meetingData });
        await meetingMutation.mutateAsync({ meetingData });
      }

      // Reset form
      setMeetingName("");
      setMeetingDescription("");
      setMeetingLink("");
      setAccess([]);
      setRegistrants([]);
      setStartTimeDate(
        selectedDateRange?.start && moment(selectedDateRange.start).isValid()
          ? moment(selectedDateRange.start).tz('UTC').format("YYYY-MM-DDTHH:mm")
          : selectedDate && moment(selectedDate).isValid()
          ? moment(selectedDate).tz('UTC').format("YYYY-MM-DDTHH:mm")
          : ""
      );
      setEndTimeDate(
        selectedDateRange?.end && moment(selectedDateRange.end).isValid()
          ? moment(selectedDateRange.end).tz('UTC').format("YYYY-MM-DDTHH:mm")
          : selectedDate && moment(selectedDate).isValid()
          ? moment(selectedDate).tz('UTC').format("YYYY-MM-DDTHH:mm")
          : ""
      );
      // Trigger callback to notify parent
      onMeetingAdded();
      // Invalidate meetings query
      queryClient.invalidateQueries(["meetings"]);
    } catch (error) {
      const errorMsg = `Failed to save meeting: ${error.message}`;
      setError(errorMsg);
      setErrorMessage(errorMsg);
      console.error("Meeting submission error:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
  }, [
    meetingName,
    meetingDescription,
    meetingLink,
    startTimeDate,
    endTimeDate,
    registrants,
    meetingDates,
    user,
    setErrorMessage,
    meetingMutation,
    onMeetingAdded,
    queryClient,
    employees,
    selectedDate,
    selectedDateRange
  ]);

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">
          Meeting Name
        </label>
        <input
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="Enter meeting name"
          value={meetingName}
          onChange={(e) => setMeetingName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">
          Date Range
        </label>
        <div className="text-gray-600 text-sm mb-2">
          {meetingDates.length > 0 && startTimeDate && endTimeDate ? (
            meetingDates.length === 1 ? (
              <span>
                {moment(startTimeDate).tz('Asia/Kolkata').format('MMMM D, YYYY, h:mm A')} -{' '}
                {moment(endTimeDate).tz('Asia/Kolkata').format('h:mm A')}
              </span>
            ) : (
              <span>
                {moment(startTimeDate).tz('Asia/Kolkata').format('MMM D, YYYY, h:mm A')} -{' '}
                {moment(endTimeDate).tz('Asia/Kolkata').format('MMM D, YYYY, h:mm A')}
              </span>
            )
          ) : (
            <span className="text-red-500">No valid date or time selected</span>
          )}
        </div>
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">
          Meeting Description
        </label>
        <textarea
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="What is the meeting about?"
          value={meetingDescription}
          onChange={(e) => setMeetingDescription(e.target.value)}
          rows="3"
        />
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">
          Meeting Link
        </label>
        <input
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="Enter meeting link (e.g., Zoom, Google Meet)"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
        />
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">
          Start Time
        </label>
        <input
          type="time"
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          value={startTimeDate ? moment(startTimeDate).tz('UTC').format('HH:mm') : ''}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':');
            const newStart = moment(meetingDates[0] || selectedDate).tz('UTC').set({ hour: hours, minute: minutes }).format('YYYY-MM-DDTHH:mm');
            setStartTimeDate(newStart);
          }}
        />
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">
          End Time
        </label>
        <input
          type="time"
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          value={endTimeDate ? moment(endTimeDate).tz('UTC').format('HH:mm') : ''}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':');
            const baseDate = meetingDates.length === 1 ? moment(meetingDates[0] || selectedDate) : moment(selectedDateRange?.end || meetingDates[0] || selectedDate);
            const newEnd = baseDate.tz('UTC').set({ hour: hours, minute: minutes }).format('YYYY-MM-DDTHH:mm');
            setEndTimeDate(newEnd);
          }}
        />
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">Access</label>
        <div className="border border-gray-200 rounded-lg p-2 max-h-24 overflow-y-auto">
          {employeesLoading ? (
            <p className="text-gray-500 text-xs">Loading employees...</p>
          ) : employeesError ? (
            <p className="text-red-500 text-xs">Error loading employees</p>
          ) : employees?.data?.message?.[0]?.length > 0 ? (
            employees.data.message[0].map((emp) => (
              <div key={emp._id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-300 rounded"
                  value={emp.name}
                  data-id={emp._id}
                  checked={access.includes(emp.name)}
                  onChange={(e) => handleCheckboxChange(e, emp)}
                />
                <label className="text-sm text-gray-700">{emp.name}</label>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-xs">No employees available</p>
          )}
        </div>
      </div>
      <button
        id="meeting-submit"
        onClick={handleSubmit}
        className="hidden"
      />
    </div>
  );
}

export default MeetingTab;