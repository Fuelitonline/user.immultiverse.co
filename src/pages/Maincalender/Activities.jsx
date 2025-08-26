import React, { useState, useEffect, useMemo, Component } from "react";
import {
  Assignment,
  ExpandLess,
  ExpandMore,
  MeetingRoom,
  Timelapse,
  PersonPin,
  EventNote,
  FileCopy,
  VideoCall,
  Feedback,
  Event,
  Close,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import moment from "moment-timezone";
import GetFileThumbnail from "../Profile/getFileThumnail";
import { Link } from "react-router-dom";
import { useGet, usePost } from "../../hooks/useApi";

// Error Boundary Component
class ActivitiesErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center bg-red-50 rounded-lg">
          <h2 className="text-base text-red-600 font-semibold">Something went wrong</h2>
          <p className="text-gray-600 text-xs mt-1.5">Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function Activities({
  currentMonth,
  currentYear,
  selectedDateRange,
  user,
  handleToggleFeedback,
  openFeedback,
  handlePopoverOpen,
  handlePopoverClose,
  handleFeedbackChange,
  handleSubmitFeedback,
  loading,
  feedback,
}) {
  const [filter, setFilter] = useState("all");
  const [localFeedbacks, setLocalFeedbacks] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [events, setEvents] = useState([]);
  const [dailyWork, setDailyWork] = useState([]);

  // Determine the date range for fetching data
  const dateParams = useMemo(() => {
    if (selectedDateRange?.start && selectedDateRange?.end && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()) {
      return {
        startDate: moment(selectedDateRange.start).tz('UTC').format('YYYY-MM-DD'),
        endDate: moment(selectedDateRange.end).tz('UTC').format('YYYY-MM-DD'),
      };
    }
    // Fallback to currentMonth and currentYear
    const startOfMonth = moment([currentYear, currentMonth - 1]).tz('UTC').startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment([currentYear, currentMonth - 1]).tz('UTC').endOf('month').format('YYYY-MM-DD');
    return {
      startDate: startOfMonth,
      endDate: endOfMonth,
    };
  }, [selectedDateRange, currentMonth, currentYear]);

  // Fetch meetings
  const {
    data: getMeetings,
    isLoading: isMeetingsLoading,
    error: meetingsError,
  } = useGet("meetings/get", {
    startDate: dateParams.startDate,
    endDate: dateParams.endDate,
  }, {}, { queryKey: ["meetings", dateParams.startDate, dateParams.endDate] });

  // Fetch daily work (tasks)
  const { data: getDailyWorkData, refetch } = useGet(
    "/employee/daily-work/get",
    {
      employeeId: user?._id,
      startDate: dateParams.startDate,
      endDate: dateParams.endDate,
    },
    {},
    { queryKey: ["dailyWork", user?._id, dateParams.startDate, dateParams.endDate] }
  );

  // Fetch events
  const {
    data: getEventsData,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useGet(
    "/event",
    {
      startDate: dateParams.startDate,
      endDate: dateParams.endDate,
    },
    {},
    { queryKey: ["events", dateParams.startDate, dateParams.endDate] }
  );

  // Fetch employees
  const { data: employees } = useGet(
    "employee/all",
    {},
    {},
    { queryKey: "employees" }
  );

  const handleGiveFeedback = usePost("/employee/daily-work/update");

  // Update daily work state with multi-day task splitting
  useEffect(() => {
    if (getDailyWorkData?.data?.data) {
      const tasks = Array.isArray(getDailyWorkData.data.data.data) ? getDailyWorkData.data.data.data : [];
      console.log('Raw Daily Work Data:', tasks);

      const expandedTasks = tasks.flatMap((task, index) => {
        const startMoment = task.startDate && moment(task.startDate).isValid() ? moment(task.startDate).tz('UTC') : moment().tz('UTC');
        const endMoment = task.endDate && moment(task.endDate).isValid() ? moment(task.endDate).tz('UTC') : startMoment.clone();

        // If start and end are the same day, create a single task
        if (startMoment.isSame(endMoment, 'day')) {
          const taskEntry = {
            ...task,
            date: startMoment.toDate(),
            originalId: task._id,
            taskId: `${task._id}-0`,
          };
          console.log('Single-day Task:', taskEntry);
          return [taskEntry];
        }

        // For multi-day tasks, create an entry for each day
        const taskEntries = [];
        let currentDay = startMoment.clone().startOf('day');
        const endDay = endMoment.clone().startOf('day');
        let dayIndex = 0;

        while (currentDay.isSameOrBefore(endDay, 'day')) {
          const taskEntry = {
            ...task,
            date: currentDay.toDate(),
            originalId: task._id,
            taskId: `${task._id}-${dayIndex}`,
            isMultiDay: true,
            fullDuration: `${startMoment.format('MMMM D, YYYY')} to ${endMoment.format('MMMM D, YYYY')}`,
          };
          console.log('Multi-day Task Entry:', taskEntry);
          taskEntries.push(taskEntry);
          currentDay.add(1, 'day');
          dayIndex++;
        }
        return taskEntries;
      });

      // Deduplicate tasks by originalId
      const seenIds = new Set();
      const uniqueTasks = expandedTasks.filter((task) => {
        if (seenIds.has(task.originalId)) {
          console.warn('Duplicate task originalId detected:', task.originalId, task);
          return false;
        }
        seenIds.add(task.originalId);
        return true;
      });

      console.log('Processed Daily Work:', uniqueTasks);
      setDailyWork(uniqueTasks);
    } else {
      setDailyWork([]);
    }
  }, [getDailyWorkData]);

  // Update events state
  useEffect(() => {
    if (isEventsLoading || eventsError || !getEventsData?.data?.data) {
      setEvents([]);
      return;
    }
    if (Array.isArray(getEventsData.data.data)) {
      const eventData = getEventsData.data.data.map((event) => ({
        ...event,
        eventDate: event.start,
        meetingName: event.title,
        meetingAgenda: event.description,
        meetingDuration: moment(event.end).diff(moment(event.start), "minutes"),
        type: event.type,
        eventBy: event.createdBy || user?._id,
        originalId: event._id,
      }));
      console.log('Processed Events:', eventData);
      setEvents(eventData);
    } else {
      console.error("getEventsData.data is not an array:", getEventsData.data);
      setEvents([]);
    }
  }, [getEventsData, isEventsLoading, eventsError, user]);

  // Update meetings state
  useEffect(() => {
    if (isMeetingsLoading || meetingsError || !getMeetings?.data?.data) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.eventDate)
      );
      return;
    }
    if (Array.isArray(getMeetings.data.data)) {
      const meetings = getMeetings.data.data.map((meeting) => ({
        ...meeting,
        meetingDate: meeting.start_time_Date,
        meetingName: meeting.meetingName,
        meetingAgenda: meeting.meetingDescription,
        meetingDuration: moment(meeting.end_time_Date).diff(
          moment(meeting.start_time_Date),
          "minutes"
        ),
        meetingBy: meeting.meetingBy || user?._id,
        originalId: meeting._id,
      }));
      console.log('Processed Meetings:', meetings);
      setEvents((prevEvents) => [
        ...prevEvents.filter((event) => event.eventDate),
        ...meetings,
      ]);
    } else {
      console.error("getMeetings.data.data is not an array:", getMeetings.data.data);
    }
  }, [getMeetings, isMeetingsLoading, meetingsError, user]);

  const combinedData = useMemo(() => {
    const seenIds = new Set();
    const mergedData = [
      ...(Array.isArray(dailyWork) ? dailyWork : []),
      ...(Array.isArray(events) ? events : []),
    ].filter((item) => {
      if (seenIds.has(item.originalId)) {
        console.warn('Duplicate item in combinedData:', item.originalId, item);
        return false;
      }
      seenIds.add(item.originalId);
      return true;
    }).sort((a, b) => {
      const dateA = a.date
        ? new Date(a.date)
        : a.meetingDate
        ? new Date(a.meetingDate)
        : new Date(a.eventDate);
      const dateB = b.date
        ? new Date(b.date)
        : b.meetingDate
        ? new Date(b.meetingDate)
        : new Date(b.eventDate);
      return dateA - dateB;
    });

    console.log('Combined Data:', mergedData);
    return mergedData;
  }, [dailyWork, events]);

  const getStatus = (date) => {
    if (!date || !moment(date).isValid()) {
      return "Unknown";
    }
    const now = moment().tz('UTC');
    const eventTime = moment.utc(date);
    if (now.isAfter(eventTime)) return "Completed";
    if (now.isBefore(eventTime)) return "Upcoming";
    return "Ongoing";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "Ongoing":
        return "bg-orange-500";
      case "Upcoming":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (date) => {
    if (!date || !moment(date).isValid()) {
      return "Invalid Date";
    }
    return moment(date).tz('UTC').format("MMMM D, YYYY, h:mm A");
  };

  const copyToClipboard = (text) => {
    if (typeof text !== "string") {
      alert("No valid link to copy");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const handleSubmitFeedbackLocal = async (id) => {
    const data = {
      feedback,
      id,
      feedbackGiverName: user?.name || user?.companyName || "Anonymous",
    };
    try {
      await handleGiveFeedback.mutateAsync(data);
      refetch();
      setLocalFeedbacks((prev) => ({
        ...prev,
        [id]: [
          ...(prev[id] || []),
          {
            feedback,
            feedbackGiverName: user?.name || user?.companyName || "Anonymous",
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      handlePopoverClose();
    }
  };

  const customHandlePopoverOpen = (event, file, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
    if (handlePopoverOpen) {
      handlePopoverOpen(event, file, id);
    }
  };

  const customHandlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
    if (handlePopoverClose) {
      handlePopoverClose();
    }
  };

  const filteredData = combinedData.filter((item) => {
    // Filter by date range
    const itemDate = item.date
      ? moment(item.date).tz('UTC').format('YYYY-MM-DD')
      : item.meetingDate
      ? moment(item.meetingDate).tz('UTC').format('YYYY-MM-DD')
      : moment(item.eventDate).tz('UTC').format('YYYY-MM-DD');
    const isWithinRange = moment(itemDate).isBetween(dateParams.startDate, dateParams.endDate, 'day', '[]');

    // Apply type filter
    if (!isWithinRange) return false;
    if (filter === "all") return true;
    if (filter === "task") return !!item.date && !item.meetingDate && !item.eventDate;
    if (filter === "meeting") return !!item.meetingDate;
    if (filter === "event") return !!item.eventDate;
    return true;
  });

  const getEmployeeName = (id) => {
    const employee = employees?.data?.message?.[0]?.find((emp) => emp._id === id);
    return employee ? `${employee.name}` : "Imperial Milestones";
  };

  const renderItem = (item, index) => {
    if (!item) return null;
    const isDailyWork = !!item.date && !item.meetingDate && !item.eventDate;
    const isMeeting = !!item.meetingDate;
    const isEvent = !!item.eventDate;
    const status = isMeeting ? getStatus(item.meetingDate) : isEvent ? getStatus(item.eventDate) : null;
    const statusColor = isMeeting || isEvent ? getStatusColor(status) : null;

    return (
      <div
        key={`${item.taskId || item._id}-${index}`}
        className="mb-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow relative"
      >
        {(isMeeting || isEvent) && status !== "Unknown" && (
          <div className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full ${statusColor}`} />
        )}
        <div className="p-2">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDailyWork
                    ? "bg-green-100 text-green-600"
                    : isMeeting
                    ? "bg-blue-100 text-blue-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {isDailyWork ? (
                  <Assignment fontSize="small" />
                ) : isMeeting ? (
                  <MeetingRoom fontSize="small" />
                ) : (
                  <Event fontSize="small" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {isDailyWork
                    ? item.description || "No Description"
                    : isMeeting
                    ? item.meetingName || "Unnamed Meeting"
                    : item.title || "Unnamed Event"}
                  {(isDailyWork || isMeeting || isEvent) && (
                    <span className="inline-flex items-center gap-1 ml-1 text-xs">
                      <PersonIcon className="text-indigo-500 text-[10px]" />
                      {getEmployeeName(
                        isDailyWork
                          ? item.assignFor?._id
                          : item.meetingBy || item.eventBy
                      ) || "Unknown"}
                    </span>
                  )}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                  <CalendarTodayIcon className="text-[10px]" />
                  {isDailyWork
                    ? item.isMultiDay
                      ? `Day of ${item.fullDuration}`
                      : formatDate(item.date)
                    : isMeeting
                    ? `${formatDate(item.meetingDate)} - ${moment(item.meetingDate).tz('UTC').add(item.meetingDuration, "minutes").format("h:mm A")}`
                    : `${formatDate(item.eventDate)} - ${moment(item.eventDate).tz('UTC').add(item.meetingDuration, "minutes").format("h:mm A")}`}
                </p>
                {(isMeeting || isEvent) && (
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                    <Timelapse className="text-[10px]" />
                    <span>
                      {item.meetingDuration
                        ? `${item.meetingDuration} min`
                        : "Duration Unknown"}
                    </span>
                  </div>
                )}
                {isEvent && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    Type: {item.type || "N/A"}
                  </p>
                )}
              </div>
            </div>
            {isDailyWork ? (
              <button
                onClick={() => handleToggleFeedback(item.taskId)}
                className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                {openFeedback === item.taskId ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )}
              </button>
            ) : (
              <span
                className={`text-white ${statusColor} px-1.5 py-0.5 rounded-full text-xs font-medium`}
              >
                {status}
              </span>
            )}
          </div>
          {isDailyWork && (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 p-1.5 border border-gray-200 rounded-lg bg-gray-50">
                  {item.file && item.fileType ? (
                    <GetFileThumbnail fileType={item.fileType} fileUrl={item.file} />
                  ) : (
                    <span className="text-gray-500 text-xs ml-1">No File</span>
                  )}
                  {item.file && (
                    <a
                      href={item.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs ml-1 hover:underline"
                    >
                      {item.fileType || "Document"}
                    </a>
                  )}
                </div>
                <div className="group relative">
                  <button
                    onClick={(e) => customHandlePopoverOpen(e, item.file, item.taskId)}
                    className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                  >
                    <Feedback fontSize="small" />
                  </button>
                  <span className="absolute hidden group-hover:block bg-gray-800 text-white text-[10px] rounded-md px-1 py-0.5 -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    Add Feedback
                  </span>
                </div>
              </div>
              <div className={`${openFeedback === item.taskId ? "block" : "hidden"}`}>
                <div className="bg-gray-50 p-2 border border-gray-200 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-800 mb-1.5">Feedback</h4>
                  {(item?.feedBack?.length > 0 || localFeedbacks[item.taskId]?.length > 0) ? (
                    [...(item.feedBack || []), ...(localFeedbacks[item.taskId] || [])].map(
                      (fb, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 bg-white mb-1 border border-gray-200 rounded-lg shadow-sm"
                        >
                          <p className="text-xs text-gray-700">
                            {fb.feedback || "No feedback text"}
                          </p>
                          <p className="text-gray-500 text-[10px] text-right mt-0.5">
                            {fb.feedbackGiverName || "Imperial Milestones"} •{" "}
                            {moment(fb.timestamp).tz('UTC').format("MMM D, YYYY")}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-gray-500 text-xs text-center">No feedback yet</p>
                  )}
                </div>
              </div>
            </>
          )}
          {(isMeeting || isEvent) && (
            <div className="mt-1.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <PersonPin fontSize="small" />
                </div>
                <p className="text-xs text-gray-700">
                  Organized by{" "}
                  <span className="font-semibold">
                    {getEmployeeName(item.meetingBy || item.eventBy) || "Unknown Organizer"}
                  </span>
                </p>
              </div>
              <div className="mb-1.5">
                <p className="text-xs font-semibold text-gray-800">
                  {isMeeting ? "Agenda" : "Description"}
                </p>
                <p className="bg-gray-50 p-1.5 border border-gray-200 rounded-lg text-xs text-gray-700">
                  {item.meetingAgenda || item.description || "No description provided"}
                </p>
              </div>
              {isMeeting && (
                <>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Access:{" "}
                    {item.registrants?.length > 0
                      ? item.registrants
                          .map((id) => getEmployeeName(id) || "Unknown")
                          .join(", ")
                      : "None"}
                  </p>
                  <hr className="mb-1.5 border-gray-200" />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => copyToClipboard(item.meetingLink)}
                      className={`text-gray-600 text-xs flex items-center gap-1 hover:text-gray-800 transition-colors ${
                        !item.meetingLink ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!item.meetingLink}
                    >
                      <FileCopy className="text-[10px]" />
                      Copy Link
                    </button>
                    <a
                      href={item.meetingLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-blue-600 text-white px-2 py-0.5 rounded-lg text-xs flex items-center gap-1 hover:bg-blue-700 transition-colors ${
                        !item.meetingLink ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <VideoCall fontSize="small" />
                      Join Meeting
                    </a>
                  </div>
                </>
              )}
              {isEvent && (
                <p className="text-gray-500 text-xs mt-0.5">
                  Type: {item.type || "N/A"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ActivitiesErrorBoundary>
      <div className="p-4 h-[88vh] overflow-auto border border-gray-200 rounded-xl bg-gray-50">
        {(isMeetingsLoading || isEventsLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
            <svg
              className="animate-spin h-8 w-8 text-indigo-500"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {(meetingsError || eventsError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
            <p className="text-red-600 font-semibold">
              Error loading data. Please try again.
            </p>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 mb-4 border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <EventNote fontSize="small" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Activities</h2>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All</option>
            <option value="task">Task</option>
            <option value="event">Event</option>
            <option value="meeting">Meeting</option>
          </select>
        </div>
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            Showing activities for:{' '}
            {dateParams.startDate === dateParams.endDate
              ? moment(dateParams.startDate).tz('UTC').format('MMMM D, YYYY')
              : `${moment(dateParams.startDate).tz('UTC').format('MMM D, YYYY')} - ${moment(dateParams.endDate).tz('UTC').format('MMM D, YYYY')}`}
          </p>
        </div>
        {Array.isArray(filteredData) && filteredData.length > 0 ? (
          filteredData.map((item, index) => renderItem(item, index))
        ) : (
          <div className="text-center p-10">
            <EventNote className="text-gray-400 text-4xl mb-3" />
            <p className="text-gray-600 text-base">No activities scheduled yet</p>
            <p className="text-gray-500 text-xs mt-1.5">
              Your scheduled meetings, events, and daily tasks will appear here
            </p>
          </div>
        )}
        <div
          className={`absolute ${anchorEl ? "block" : "hidden"} bg-white border border-gray-200 rounded-xl p-3 w-72 z-50 shadow-lg`}
          style={{
            top: anchorEl ? anchorEl.getBoundingClientRect().bottom + 8 : 0,
            right: 12,
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Add Feedback</h3>
            <button
              onClick={customHandlePopoverClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <Close fontSize="small" />
            </button>
          </div>
          <textarea
            value={feedback || ""}
            onChange={handleFeedbackChange}
            className="w-full h-20 p-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none mb-2 resize-none"
            placeholder="Share your thoughts on this work..."
          />
          <button
            onClick={() => handleSubmitFeedbackLocal(selectedId)}
            className={`w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs hover:bg-blue-700 transition-colors ${
              loading || !feedback?.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading || !feedback?.trim()}
          >
            {loading ? (
              <svg
                className="animate-spin h-4 w-4 text-white mx-auto"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </div>
    </ActivitiesErrorBoundary>
  );
}

export default Activities;