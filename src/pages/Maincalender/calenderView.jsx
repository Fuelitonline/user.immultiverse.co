import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../../middlewares/auth/authContext';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { useGet, usePost } from '../../hooks/useApi';
import { Tooltip } from '@mui/material';
import AddTaskDialog from './AddTaskDialog';

// Logo path
const logo = "https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/logo.png";

// Set moment to use UTC internally
moment.tz.setDefault('UTC');
moment.locale("en-GB");
const localizer = momentLocalizer(moment);

const today = new Date();

function CalendarActions({ size, getTimes, getEmployeeName }) {
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dailyWork, setDailyWork] = useState([]);
  const { user } = useAuth();
  const calendarRef = useRef(null);

  // Calculate startDate and endDate for the current month
  const startDate = moment({ year: currentYear, month: currentMonth - 1, day: 1 }).tz('UTC').startOf('month').format('YYYY-MM-DD');
  const endDate = moment({ year: currentYear, month: currentMonth - 1, day: 1 }).tz('UTC').endOf('month').format('YYYY-MM-DD');

  // Fetch data
  const { data: getEventsData, isLoading: isEventsLoading, error: eventsError } = useGet(
    '/event',
    {
      employeeId: user?._id,
      startDate,
      endDate,
    },
    {},
    { queryKey: ['events', user?._id, startDate, endDate] }
  );
  const { data: getMeetingsData, isLoading: isMeetingsLoading, error: meetingsError } = useGet(
    '/meetings/get',
    {
      employeeId: user?._id,
      startDate,
      endDate,
    },
    {},
    { queryKey: ['meetings', user?._id, startDate, endDate] }
  );
  const { data: getDailyWorkData, isLoading: isDailyWorkLoading, error: dailyWorkError, refetch } = useGet(
    '/employee/daily-work/get',
    {
      employeeId: user?._id,
      startDate,
      endDate,
    },
    {},
    { queryKey: ['dailyWork', user?._id, startDate, endDate] }
  );

  const handleDeleteTask = usePost('/employee/daily-work/delete');

  useEffect(() => {
    if (getDailyWorkData?.data?.data) {
      setDailyWork(getDailyWorkData.data.data);
      if (calendarRef.current) {
        calendarRef.current.forceUpdate();
      }
    } else {
      setDailyWork([]);
    }
  }, [getDailyWorkData]);

  useEffect(() => {
    const eventsData = Array.isArray(getEventsData?.data?.data) ? getEventsData.data.data : [];
    const meetings = Array.isArray(getMeetingsData?.data?.data?.data) ? getMeetingsData.data.data.data : [];
    const dailyWork = Array.isArray(getDailyWorkData?.data?.data?.data) ? getDailyWorkData.data.data.data : [];

    console.log('Raw API Data:', { eventsData, meetings, dailyWork });

    const transformedEvents = [
      ...eventsData.map((event) => ({
        id: event._id,
        title: event.title || 'Unnamed Event',
        start: event.start && moment(event.start).isValid() ? moment(event.start).tz('UTC').toDate() : new Date(),
        end: event.end && moment(event.end).isValid() ? moment(event.end).tz('UTC').toDate() : new Date(),
        color: '#10b981',
        details: `Event - ${event.description || 'No description'}`,
        type: 'event',
        createdAt: new Date(event.createdAt || Date.now()),
      })),
      ...meetings.map((meeting) => ({
        id: meeting._id,
        title: meeting.meetingName || 'Unnamed Meeting',
        start: meeting.start_time_Date && moment(meeting.start_time_Date).isValid()
          ? moment(meeting.start_time_Date).tz('UTC').toDate()
          : meeting.meetingDate && moment(meeting.meetingDate).isValid()
          ? moment(meeting.meetingDate).tz('UTC').toDate()
          : new Date(),
        end: meeting.end_time_Date && moment(meeting.end_time_Date).isValid()
          ? moment(meeting.end_time_Date).tz('UTC').toDate()
          : meeting.meetingDate && meeting.meetingDuration && moment(meeting.meetingDate).isValid()
          ? moment(meeting.meetingDate).tz('UTC').add(parseInt(meeting.meetingDuration), 'minutes').toDate()
          : new Date(),
        color: '#9810FA',
        details: `Meeting - ${meeting.meetingAgenda || meeting.meetingDescription || 'No description'}`,
        type: 'meeting',
        host: meeting.meetingHost,
        link: meeting.meetingLink,
        by: meeting.meetingBy,
        for: meeting.meetingFor,
        duration: meeting.meetingDuration,
        createdAt: new Date(meeting.createdAt || Date.now()),
      })),
      ...dailyWork.map((work) => ({
        id: work._id,
        title: work.description || 'Unnamed Task',
        start: work.startDate && moment(work.startDate).isValid()
          ? moment(work.startDate).tz('UTC').toDate()
          : new Date(),
        end: work.endDate && moment(work.endDate).isValid()
          ? moment(work.endDate).tz('UTC').toDate()
          : work.startDate && moment(work.startDate).isValid()
          ? moment(work.startDate).tz('UTC').add(1, 'hours').toDate()
          : new Date(),
        color: '#f59e0b',
        details: `Task Work - ${work.description || 'No description'}`,
        type: 'dailyWork',
        createdAt: new Date(work.createdAt || Date.now()),
      })),
    ];

    const seenIds = new Set();
    const uniqueEvents = transformedEvents.filter((event) => {
      if (seenIds.has(event.id)) {
        console.warn('Duplicate event ID detected:', event.id, event);
        return false;
      }
      seenIds.add(event.id);
      return true;
    });
    setEvents(uniqueEvents);

    console.log('Transformed Events:', uniqueEvents);
    console.log('Total Events:', uniqueEvents.length);
  }, [getEventsData, getMeetingsData, getDailyWorkData]);

  const handleNavigate = (date) => {
    const newMonth = date.getMonth() + 1;
    const newYear = date.getFullYear();
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    getTimes && getTimes(newMonth, newYear);
  };

  const onSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDescription("");
    setFile(null);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setLoadingState(true);
    try {
      await handleDeleteTask.mutateAsync({ id });
      refetch();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setLoadingState(false);
    }
  };

  const dayPropGetter = (date) => {
    const isCurrentDate =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    return {
      style: {
        backgroundColor: isCurrentDate ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
        borderRadius: '4px',
        transition: 'background 0.3s ease',
      },
    };
  };

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: 'none',
      transition: 'all 0.3s ease',
      maxWidth: '90%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  });

  const defaultDate = useMemo(() => new Date(), []);

  const eventsByDate = useMemo(() => {
    const eventsMap = {};
    events.forEach((event) => {
      const dateKey = moment(event.start).tz('UTC').format('YYYY-MM-DD');
      if (!eventsMap[dateKey]) {
        eventsMap[dateKey] = [];
      }
      eventsMap[dateKey].push(event);
    });
    console.log('Events by Date:', eventsMap);
    return eventsMap;
  }, [events]);

  const legendItems = [
    { type: 'Event', color: '#10b981' },
    { type: 'Meeting', color: '#9810FA' },
    { type: 'Task', color: '#f59e0b' },
  ];

  const getErrorMessage = (error) => {
    if (!error) return null;
    const status = error.response?.status;
    switch (status) {
      case 401:
        return 'Authentication failed. Please check your credentials or log in again.';
      case 403:
        return 'You do not have permission to access this data.';
      case 404:
        return 'The requested data was not found. Please verify the API endpoint.';
      case 500:
        return 'Server error occurred. Please try again later or contact support.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full h-full relative">
      <style jsx>{`
        .rbc-calendar {
          background: transparent !important;
          font-family: 'Inter', sans-serif !important;
          border-radius: 1rem;
          overflow: hidden;
        }

        .rbc-toolbar {
          background: linear-gradient(to right, #bfdbfe, #ddd6fe);
          color: white;
          padding: 0.5rem;
          border-radius: 0.5rem 0.5rem 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rbc-toolbar-label {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
        }

        .rbc-month-view {
          background: transparent !important;
          position: relative;
          z-index: 1;
          margin-top: -10px;
        }

        .rbc-month-row {
          min-height: 60px !important;
          background: transparent !important;
        }

        .rbc-date-cell {
          padding: 0.25rem !important;
          text-align: left;
          background: transparent !important;
          position: relative;
          font-size: 0.75rem;
        }

        .rbc-date-cell a {
          position: absolute;
          top: 0.15rem;
          left: 0.15rem;
          color: #333;
          font-size: 0.75rem;
          font-weight: 500;
          z-index: 2;
        }

        .rbc-off-range {
          background: transparent !important;
          color: #999 !important;
        }

        .rbc-off-range a {
          color: #999 !important;
        }

        .rbc-today {
          background: rgba(254, 242, 242, 0.6) !important;
          border-radius: 0.5rem;
        }

        .rbc-event {
          background: transparent !important;
          font-weight: 500;
          border-radius: 0.5rem !important;
          z-index: 1;
          font-size: 0.75rem !important;
          padding: 0.25rem 0.5rem !important;
          color: transparent !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          margin-top: 1.2rem;
        }

        .rbc-event:hover {
          background: transparent !important;
          color: transparent !important;
        }

        .rbc-btn-group button.rbc-toolbar-button {
          color: white !important;
          background: rgba(255, 255, 255, 0.2) !important;
          border: none !important;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          text-transform: none;
          border-radius: 0.25rem;
          margin-left: 0.5rem;
        }

        .rbc-btn-group button.rbc-toolbar-button:hover {
          background: rgba(255, 255, 255, 0.4) !important;
        }

        .tooltip-created-at {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          color: #d1d5db;
          font-size: 0.75rem;
          font-weight: 300;
        }

        .event-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: white;
          display: inline-block;
          margin-right: 4px;
          margin-bottom: 1px;
        }

        .rbc-show-more {
          display: none !important;
        }

        .rbc-selected {
          background-color: rgba(79, 70, 229, 0.3) !important;
        }
      `}</style>
      {(isEventsLoading || isMeetingsLoading || isDailyWorkLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {(eventsError || meetingsError || dailyWorkError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <p className="text-red-500 font-semibold text-center">
            {eventsError
              ? getErrorMessage(eventsError)
              : meetingsError
              ? getErrorMessage(meetingsError)
              : getErrorMessage(dailyWorkError)}
          </p>
        </div>
      )}
      <div className="p-4 md:p-6 h-full relative z-10">
        <img
          src={logo}
          alt="Calendar Logo"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30%] max-w-[300px] opacity-30 pointer-events-none z-0"
        />
        <Calendar
          ref={calendarRef}
          localizer={localizer}
          events={events}
          eventPropGetter={eventPropGetter}
          defaultDate={defaultDate}
          startAccessor={(event) => event.start}
          endAccessor={(event) => event.end}
          onNavigate={handleNavigate}
          dayPropGetter={dayPropGetter}
          onSelectSlot={onSelectSlot}
          selectable="true"
          views={['week', 'month', 'agenda', 'day']}
          defaultView="month"
          style={{
            height: size.height,
            width: size.width,
            fontFamily: '"Inter", "Roboto", sans-serif',
            border: 'none',
            background: 'transparent',
            zIndex: 20,
          }}
          components={{
            event: ({ event }) => {
              const dateKey = moment(event.start).tz('UTC').format('YYYY-MM-DD');
              const eventsOnDate = eventsByDate[dateKey] || [];
              const dotColor = eventsOnDate[0]?.color || '#dc2626';
              return (
                <Tooltip
                  title={
                    <DateTooltip
                      events={eventsOnDate}
                      getEmployeeName={getEmployeeName}
                    />
                  }
                  arrow
                  placement="top"
                >
                  <span className="flex items-center">
                    <span
                      className="event-dot"
                      style={{
                        border: `2px solid ${dotColor}`,
                        width: '6px',
                        height: '6px',
                      }}
                      title={eventsOnDate.map(e => e.title).join(', ')}
                    ></span>
                  </span>
                </Tooltip>
              );
            },
            header: ({ label }) => (
              <div className="flex justify-center items-center mb-4 px-2">
                <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
              </div>
            ),
          }}
        />
        <AddTaskDialog
          open={openDialog}
          onClose={handleCloseDialog}
          selectedDate={selectedDate}
          description={description}
          setDescription={setDescription}
          file={file}
          setFile={setFile}
          loading={loadingState}
          setLoading={setLoadingState}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          dailyWork={dailyWork}
          refetch={refetch}
          handleDelete={handleDelete}
        />
      </div>
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Legend</h4>
        <div className="flex gap-4">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="event-dot" style={{ border: `2px solid ${item.color}` }}></span>
              <span className="text-xs text-gray-600">{item.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateTooltip({ events, getEmployeeName }) {
  return (
    <div className="p-3 max-w-sm bg-gray-900 text-white rounded-lg shadow-md max-h-60 overflow-y-auto">
      {events.map((event, index) => (
        <div key={`${event.id}-${event.type}-${index}`} className="mb-3 last:mb-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-white">{event.title}</h4>
            <p className="text-xs font-light text-gray-300">
              Created: {moment(event.createdAt).tz('Asia/Kolkata').format('MMM D, YYYY')}
            </p>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarToday className="text-gray-300 text-xs" />
            <span className="text-gray-300 text-xs">
              {`${moment(event.start).tz('Asia/Kolkata').format('MMMM D, YYYY, h:mm A')} - ${moment(event.end).tz('Asia/Kolkata').format('h:mm A')}`}
            </span>
          </div>
          <p className="text-gray-300 text-xs mt-2">{event.details}</p>
          <p className="text-gray-300 text-xs mt-1">Type: {event.type || 'N/A'}</p>
          {event.type === 'meeting' && (
            <>
              <p className="text-gray-300 text-xs mt-1">Host: {event.host || 'N/A'}</p>
              <p className="text-gray-300 text-xs mt-1">By: {event.by || 'N/A'}</p>
              <p className="text-gray-300 text-xs mt-1">For: {event.for?.join(', ') || 'N/A'}</p>
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-300 underline"
                >
                  Meeting Link
                </a>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function CalendarView({ size, getTimes, getEmployeeName }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <CalendarActions
        size={size}
        getTimes={getTimes}
        getEmployeeName={getEmployeeName}
      />
    </DndProvider>
  );
}

export default CalendarView;