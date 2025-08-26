import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DeleteIcon from '@mui/icons-material/Delete';
import Assignment from '@mui/icons-material/Assignment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventIcon from '@mui/icons-material/Event';
import Timelapse from '@mui/icons-material/Timelapse';
import FileCopy from '@mui/icons-material/FileCopy';
import VideoCall from '@mui/icons-material/VideoCall';
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import moment from 'moment-timezone';
import { useGet } from '../../hooks/useApi';
import TaskTab from './TaskTab';
import MeetingTab from './MeetingTab';
import EventTab from './EventTab';
import GetFileThumbnail from '../Profile/getFileThumnail';

function AddTaskDialog({
  open,
  onClose,
  selectedDate,
  selectedDateRange,
  description,
  setDescription,
  file,
  setFile,
  dailyWork,
  handleDelete,
  handlePopoverOpen,
  openFeedbackIndex,
  handleToggleFeedback,
}) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState(0); // Default to Tasks tab
  const [subTab, setSubTab] = useState(1); // Default to View tab
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Align with API's limit

  // Normalize dates to UTC ISO strings
  const normalizedSelectedDate = selectedDate && moment(selectedDate).isValid()
    ? moment(selectedDate).tz('UTC').startOf('day').toISOString()
    : null;
  const normalizedDateRange = selectedDateRange?.start && selectedDateRange?.end && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()
    ? {
        start: moment(selectedDateRange.start).tz('UTC').startOf('day').toISOString(),
        end: moment(selectedDateRange.end).tz('UTC').startOf('day').toISOString(),
      }
    : null;

  // Use single date for queries (selectedDate or dateRange.start)
  const queryDate = normalizedSelectedDate || normalizedDateRange?.start;

  // Debugging logs
  console.log('AddTaskDialog - Received selectedDate:', selectedDate);
  console.log('AddTaskDialog - Received selectedDateRange:', selectedDateRange);
  console.log('AddTaskDialog - Normalized selectedDate:', normalizedSelectedDate);
  console.log('AddTaskDialog - Normalized selectedDateRange:', normalizedDateRange);
  console.log('AddTaskDialog - Query date:', queryDate);

  // Fetch data for Tasks, Meetings, and Events for the specific date
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useGet(
    '/employee/daily-work/get',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['tasks', queryDate, currentPage], enabled: !!queryDate }
  );
  const { data: meetingsData, isLoading: meetingsLoading, error: meetingsError } = useGet(
    '/meetings/get',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['meetings', queryDate, currentPage], enabled: !!queryDate }
  );
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useGet(
    '/event',
    { date: queryDate ? moment(queryDate).tz('UTC').format('YYYY-MM-DD') : null, page: currentPage, limit: itemsPerPage },
    {},
    { queryKey: ['events', queryDate, currentPage], enabled: !!queryDate }
  );
  const { data: employees, error: employeesError } = useGet(
    '/employee/all',
    {},
    {},
    { queryKey: ['employees'] }
  );

  // Normalize data
  const tasks = Array.isArray(tasksData?.data?.data?.data) ? tasksData.data.data.data : [];
  const meetings = Array.isArray(meetingsData?.data?.data?.data)
    ? meetingsData.data.data.data.map(meeting => ({
        ...meeting,
        start_time_Date: meeting.meetingDate,
        end_time_Date: moment(meeting.meetingDate).add(parseInt(meeting.meetingDuration), 'minutes').toISOString(),
        meetingName: meeting.meetingName,
        meetingDescription: meeting.meetingAgenda,
        registrants: meeting.access
      }))
    : [];
  const events = Array.isArray(eventsData?.data)
    ? eventsData.data
    : Array.isArray(eventsData?.data?.data)
    ? eventsData.data.data
    : [];

  // Normalize pagination data
  const pagination = {
    tasks: tasksData?.data?.pagination || {
      total: tasks.length,
      totalPages: Math.ceil(tasks.length / itemsPerPage),
      currentPage: currentPage,
      limit: itemsPerPage,
    },
    meetings: meetingsData?.data?.pagination || {
      total: meetings.length,
      totalPages: Math.ceil(meetings.length / itemsPerPage),
      currentPage: currentPage,
      limit: itemsPerPage,
    },
    events: eventsData?.data?.pagination || {
      total: events.length,
      totalPages: Math.ceil(events.length / itemsPerPage),
      currentPage: currentPage,
      limit: itemsPerPage,
    },
  };

  console.log('AddTaskDialog - Tasks:', tasks);
  console.log('AddTaskDialog - Meetings:', meetings);
  console.log('AddTaskDialog - Events:', events);
  console.log('AddTaskDialog - Pagination:', pagination);
  console.log('AddTaskDialog - Employees:', employees);

  useEffect(() => {
    // Update currentPage based on API pagination
    if (mainTab === 0 && tasksData?.data?.pagination?.page) {
      setCurrentPage(tasksData.data.pagination.page);
    } else if (mainTab === 1 && meetingsData?.data?.pagination?.page) {
      setCurrentPage(meetingsData.data.pagination.page);
    } else if (mainTab === 2 && eventsData?.data?.pagination?.page) {
      setCurrentPage(eventsData.data.pagination.page);
    }
  }, [mainTab, tasksData, meetingsData, eventsData]);

  const handleTaskAdded = useCallback(() => {
    queryClient.invalidateQueries(['tasks', queryDate, currentPage]);
    setCurrentPage(1);
    onClose();
  }, [queryClient, queryDate, onClose]);

  const handleMeetingAdded = useCallback(() => {
    queryClient.invalidateQueries(['meetings', queryDate, currentPage]);
    setCurrentPage(1);
    onClose();
  }, [queryClient, queryDate, onClose]);

  const handleEventAdded = useCallback(() => {
    queryClient.invalidateQueries(['events', queryDate, currentPage]);
    setCurrentPage(1);
    onClose();
  }, [queryClient, queryDate, onClose]);

  const getEmployeeName = (employee) => {
    if (!employee) return 'Unknown';
    if (typeof employee === 'object' && employee?._id && employee?.name) return employee.name;
    if (!employees?.data?.message?.[0]) return 'Unknown';
    return employees.data.message[0].find((emp) => emp?._id === employee?._id)?.name || 'Unknown';
  };

  const getStatus = (date) => {
    if (!date || !moment(date).isValid()) return 'Unknown';
    const now = moment().tz('UTC');
    const eventTime = moment(date).tz('UTC');
    if (now.isAfter(eventTime)) return 'Completed';
    if (now.isBefore(eventTime)) return 'Upcoming';
    return 'Ongoing';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'Ongoing':
        return 'bg-orange-500';
      case 'Upcoming':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const copyToClipboard = (text) => {
    if (!text || typeof text !== 'string') {
      setErrorMessage('No valid link to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      setErrorMessage('Link copied to clipboard!');
      setTimeout(() => setErrorMessage(''), 2000);
    }).catch(() => {
      setErrorMessage('Failed to copy link');
    });
  };

  const getDatesInRange = (start, end) => {
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
  };

  const renderContent = (data, type) => {
    console.log('renderContent - type:', type, 'data:', data, 'currentPage:', currentPage);

    if (!queryDate) {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-red-500 font-medium text-xs">No date selected</p>
        </div>
      );
    }

    if (tasksLoading && type === 'tasks') {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <svg
            className="animate-spin h-5 w-5 text-indigo-500 mb-2"
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
          <p className="text-gray-500 font-medium text-xs">Loading {type}...</p>
        </div>
      );
    }

    if (tasksError && type === 'tasks') {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-red-500 font-medium text-xs">
            Error loading tasks: {tasksError?.message || 'Unknown error'}
          </p>
        </div>
      );
    }

    if (meetingsLoading && type === 'meetings') {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <svg
            className="animate-spin h-5 w-5 text-indigo-500 mb-2"
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
          <p className="text-gray-500 font-medium text-xs">Loading {type}...</p>
        </div>
      );
    }

    if (meetingsError && type === 'meetings') {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-red-500 font-medium text-xs">
            Error loading meetings: {meetingsError?.message || 'Unknown error'}
          </p>
        </div>
      );
    }

    if (eventsLoading && type === 'events') {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <svg
            className="animate-spin h-5 w-5 text-indigo-500 mb-2"
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
          <p className="text-gray-500 font-medium text-xs">Loading {type}...</p>
        </div>
      );
    }

    if (eventsError && type === 'events') {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-red-500 font-medium text-xs">
            Error loading events: {eventsError?.message || 'Unknown error'}
          </p>
        </div>
      );
    }

    const safeData = Array.isArray(data) ? data : [];
    if (safeData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <CalendarTodayIcon className="text-gray-400 text-sm" />
          </div>
          <p className="text-gray-500 font-medium mb-1 text-xs">No {type} logged for this date</p>
          <p className="text-gray-400 text-[10px]">Switch to the "Add {type}" tab to log your {type}</p>
        </div>
      );
    }

    const totalItems = type === 'tasks' ? pagination.tasks.total :
                       type === 'meetings' ? pagination.meetings.total :
                       pagination.events.total;
    const totalPages = type === 'tasks' ? pagination.tasks.totalPages :
                       type === 'meetings' ? pagination.meetings.totalPages :
                       pagination.events.totalPages;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = safeData.slice(startIndex, endIndex);
    console.log('renderContent - Pagination:', { totalItems, totalPages, startIndex, endIndex, paginatedData });

    return (
      <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto p-2">
        {paginatedData.map((item, index) => {
          const isMeeting = type === 'meetings';
          const isEvent = type === 'events';
          const isDailyWork = type === 'tasks';
          const duration = isMeeting ? parseInt(item.meetingDuration) || 0 : 0;
          const status = isMeeting ? getStatus(item.start_time_Date) : isEvent ? getStatus(item.start) : item.status;
          const statusColor = status ? getStatusColor(status) : null;
          return (
            <div
              key={item._id || index}
              className="mb-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow relative"
            >
              {(isMeeting || isEvent || isDailyWork) && status !== 'Unknown' && (
                <div className={`absolute top-1 right-1 h-2 w-2 rounded-full ${statusColor}`} />
              )}
              <div className="p-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isDailyWork
                          ? 'bg-green-100 text-green-600'
                          : isMeeting
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}
                    >
                      {isDailyWork ? (
                        <Assignment fontSize="small" />
                      ) : isMeeting ? (
                        <MeetingRoomIcon fontSize="small" />
                      ) : (
                        <EventIcon fontSize="small" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        {isDailyWork
                          ? item.description || 'No Description'
                          : isMeeting
                          ? item.meetingName || 'Unnamed Meeting'
                          : item.title || 'Unnamed Event'}
                      </h3>
                      <p className="text-gray-500 text-[10px] mt-0.5 flex items-center gap-1">
                        <CalendarTodayIcon className="text-[9px]" />
                        {isDailyWork
                          ? item.startDate === item.endDate
                            ? moment(item.startDate).tz('Asia/Kolkata').format('MMMM D, YYYY')
                            : `${moment(item.startDate).tz('Asia/Kolkata').format('MMMM D, YYYY')} - ${moment(item.endDate).tz('Asia/Kolkata').format('MMMM D, YYYY')}`
                          : isMeeting
                          ? `${moment(item.start_time_Date).tz('Asia/Kolkata').format('MMMM D, YYYY, h:mm A')} - ${moment(item.end_time_Date).tz('Asia/Kolkata').format('h:mm A')}`
                          : `${moment(item.start).tz('Asia/Kolkata').format('MMMM D, YYYY, h:mm A')} - ${moment(item.end).tz('Asia/Kolkata').format('h:mm A')}`}
                      </p>
                      {isMeeting && (
                        <div className="flex items-center gap-1 text-gray-500 text-[10px] mt-0.5">
                          <Timelapse className="text-[9px]" />
                          <span>
                            {item.meetingDuration || duration
                              ? `${item.meetingDuration || duration} min`
                              : 'Duration Unknown'}
                          </span>
                        </div>
                      )}
                      {isEvent && (
                        <p className="text-gray-500 text-[10px] mt-0.5">
                          Type: {item.type || 'N/A'}
                        </p>
                      )}
                      {isDailyWork && (
                        <p className="text-gray-500 text-[10px] mt-0.5">
                          Assigned To: {getEmployeeName(item.assignFor)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {isDailyWork ? (
                      <>
                        <button
                          onClick={() => handleToggleFeedback(index)}
                          className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          {openFeedbackIndex === index ? (
                            <KeyboardDoubleArrowRight className="text-indigo-500 text-[9px]" />
                          ) : (
                            <FeedbackIcon className="text-indigo-500 text-[9px]" />
                          )}
                        </button>
                        <div className="group relative">
                          <button
                            onClick={(e) => handlePopoverOpen(e, item.file, item._id)}
                            className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                          >
                            <FeedbackIcon className="text-[9px]" />
                          </button>
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-[9px] rounded-md px-1 py-0.5 -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            Add Feedback
                          </span>
                        </div>
                        <div className="group relative">
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-red-100 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <DeleteIcon className="text-[9px]" />
                          </button>
                          <span className="absolute hidden group-hover:block bg-gray-800 text-white text-[9px] rounded-md px-1 py-0.5 -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            Delete Task
                          </span>
                        </div>
                      </>
                    ) : (
                      <span
                        className={`text-white ${statusColor} px-1.5 py-0.5 rounded-full text-[10px] font-medium`}
                      >
                        {status}
                      </span>
                    )}
                  </div>
                </div>
                {isDailyWork && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 p-1.5 border border-gray-200 rounded-lg bg-gray-50">
                        {item.file && item.fileType ? (
                          <>
                            <GetFileThumbnail fileType={item.fileType} fileUrl={item.file} />
                            <a
                              href={item.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-[10px] ml-1 hover:underline"
                            >
                              {item.fileType || 'Document'}
                            </a>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[10px] ml-1">No File</span>
                        )}
                      </div>
                    </div>
                    {item.feedBack?.length > 0 && openFeedbackIndex === index && (
                      <div className="bg-gray-50 p-2 border border-gray-200 rounded-lg">
                        <h4 className="text-[10px] font-semibold text-gray-800 mb-1">Feedback</h4>
                        {item.feedBack.map((fb, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 bg-white mb-1 border border-gray-200 rounded-lg shadow-sm"
                          >
                            <p className="text-[10px] text-gray-700">{fb.feedback || 'No feedback text'}</p>
                            <p className="text-gray-500 text-[9px] text-right mt-0.5">
                              {fb.feedbackGiverName || 'Imperial Milestones'} •{' '}
                              {moment(fb.timestamp).tz('Asia/Kolkata').format('MMM D, YYYY')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {(isMeeting || isEvent) && (
                  <div className="mt-1">
                    <div className="mb-1">
                      <p className="text-[10px] font-semibold text-gray-800">
                        {isMeeting ? 'Agenda' : 'Description'}
                      </p>
                      <p className="bg-gray-50 p-1.5 border border-gray-200 rounded-lg text-[10px] text-gray-700">
                        {item.meetingDescription || item.description || 'No description provided'}
                      </p>
                    </div>
                    {isMeeting && (
                      <>
                        <p className="text-gray-500 text-[10px] mt-0.5">
                          Attendees:{' '}
                          {item.meetingFor?.length > 0
                            ? item.meetingFor.map((attendee) => attendee.email).join(', ')
                            : item.registrants?.length > 0
                            ? item.registrants.map((id) => getEmployeeName(id)).join(', ')
                            : 'None'}
                        </p>
                        <hr className="mb-1 border-gray-200" />
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => copyToClipboard(item.meetingLink)}
                            className={`text-gray-600 text-[10px] flex items-center gap-1 hover:text-gray-800 transition-colors ${
                              !item.meetingLink ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={!item.meetingLink}
                          >
                            <FileCopy className="text-[9px]" />
                            Copy Link
                          </button>
                          <a
                            href={item.meetingLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 hover:bg-blue-700 transition-colors ${
                              !item.meetingLink ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={(e) => !item.meetingLink && e.preventDefault()}
                          >
                            <VideoCall fontSize="small" />
                            Join Meeting
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-2 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-indigo-500 hover:bg-indigo-100'
              }`}
            >
              <ChevronLeftIcon className="text-[10px]" />
              Previous
            </button>
            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-indigo-500 hover:bg-indigo-100'
              }`}
            >
              Next
              <ChevronRightIcon className="text-[10px]" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-opacity-50 transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-[400px] rounded-xl shadow-lg bg-white font-sans">
        <div className="flex justify-between items-center px-3 pt-3 pb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mainTab === 0
                ? 'Tasks'
                : mainTab === 1
                ? 'Meetings'
                : mainTab === 2
                ? 'Events'
                : 'Select an Option'}
            </h2>
            {(normalizedDateRange || normalizedSelectedDate) && (
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <CalendarTodayIcon className="text-xs" />
                <span className="text-xs">
                  {normalizedDateRange && normalizedDateRange.start !== normalizedDateRange.end
                    ? `${moment(normalizedDateRange.start).tz('Asia/Kolkata').format('MMM D, YYYY')} - ${moment(normalizedDateRange.end).tz('Asia/Kolkata').format('MMM D, YYYY')}`
                    : moment(normalizedSelectedDate || normalizedDateRange.start).tz('Asia/Kolkata').format('dddd, MMMM D, YYYY')}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
          >
            <CloseIcon className="text-base" />
          </button>
        </div>
        <div className="flex px-3 mb-2 border-b-2 border-indigo-500">
          <button
            className={`flex items-center gap-1 px-2 py-1.5 text-xs font-semibold ${
              mainTab === 0 ? 'text-indigo-500' : 'text-gray-500'
            } hover:text-indigo-600`}
            onClick={() => setMainTab(0)}
          >
            <AddCircleOutlineIcon className="text-sm" />
            Tasks
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1.5 text-xs font-semibold ${
              mainTab === 1 ? 'text-indigo-500' : 'text-gray-500'
            } hover:text-indigo-600`}
            onClick={() => setMainTab(1)}
          >
            <AddCircleOutlineIcon className="text-sm" />
            Meetings
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1.5 text-xs font-semibold ${
              mainTab === 2 ? 'text-indigo-500' : 'text-gray-500'
            } hover:text-indigo-600`}
            onClick={() => setMainTab(2)}
          >
            <AddCircleOutlineIcon className="text-sm" />
            Events
          </button>
        </div>
        {mainTab !== null && (
          <div className="flex px-3 mb-2 border-b border-gray-200">
            <button
              className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold ${
                subTab === 0 ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-500'
              } hover:text-indigo-600`}
              onClick={() => setSubTab(0)}
            >
              <AddCircleOutlineIcon className="text-sm" />
              Add {mainTab === 0 ? 'Task' : mainTab === 1 ? 'Meeting' : 'Event'}
            </button>
            <button
              className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold ${
                subTab === 1 ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-gray-500'
              } hover:text-indigo-600`}
              onClick={() => setSubTab(1)}
            >
              <VisibilityIcon className="text-sm" />
              View {mainTab === 0 ? 'Tasks' : mainTab === 1 ? 'Meetings' : 'Events'}
            </button>
          </div>
        )}
        <div className="px-3 pb-2">
          {errorMessage && (
            <p className="text-red-500 text-xs mb-2">{errorMessage}</p>
          )}
          {employeesError && (
            <p className="text-red-500 text-xs mb-2">
              Error loading employees: {employeesError?.message || 'Unknown error'}
            </p>
          )}
          {subTab === 0 && mainTab !== null && (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto px-1">
              {mainTab === 0 && (
                <TaskTab
                  description={description}
                  setDescription={setDescription}
                  file={file}
                  setFile={setFile}
                  setErrorMessage={setErrorMessage}
                  selectedDate={normalizedSelectedDate || normalizedDateRange?.start}
                  selectedDateRange={normalizedDateRange}
                  onTaskAdded={handleTaskAdded}
                />
              )}
              {mainTab === 1 && (
                <MeetingTab
                  selectedDate={normalizedSelectedDate || normalizedDateRange?.start}
                  selectedDateRange={normalizedDateRange}
                  setErrorMessage={setErrorMessage}
                  onMeetingAdded={handleMeetingAdded}
                />
              )}
              {mainTab === 2 && (
                <EventTab
                  selectedDate={normalizedSelectedDate || normalizedDateRange?.start}
                  selectedDateRange={normalizedDateRange}
                  description={description}
                  setDescription={setDescription}
                  setErrorMessage={setErrorMessage}
                  onEventAdded={handleEventAdded}
                />
              )}
            </div>
          )}
          {subTab === 1 && mainTab !== null && (
            renderContent(
              mainTab === 0 ? tasks : mainTab === 1 ? meetings : events,
              mainTab === 0 ? 'tasks' : mainTab === 1 ? 'meetings' : 'events'
            )
          )}
        </div>
        <div className="flex justify-end p-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-gray-500 font-semibold px-2 py-1 hover:bg-gray-200 rounded text-xs"
          >
            Cancel
          </button>
          {subTab === 0 && mainTab !== null && (
            <button
              onClick={() => {
                if (mainTab === 0) {
                  document.querySelector('#task-submit')?.click();
                } else if (mainTab === 1) {
                  document.querySelector('#meeting-submit')?.click();
                } else if (mainTab === 2) {
                  document.querySelector('#event-submit')?.click();
                }
              }}
              className="ml-2 bg-indigo-500 text-white font-semibold px-2 py-1 rounded-lg shadow-md hover:bg-indigo-600 hover:shadow-lg transition-all duration-200 text-xs"
            >
              Save {mainTab === 0 ? 'Task' : mainTab === 1 ? 'Meeting' : 'Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddTaskDialog;