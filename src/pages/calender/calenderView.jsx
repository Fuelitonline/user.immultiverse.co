import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '../../middlewares/auth/authContext';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { useGet, usePost } from '../../hooks/useApi';
import { Tooltip, IconButton, Badge, Chip } from '@mui/material';
import AddTaskDialog from './AddTaskDialog';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EventIcon from '@mui/icons-material/Event';
import VideocamIcon from '@mui/icons-material/Videocam';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

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
  const [holidays, setHolidays] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
const [selectedDate, setSelectedDate] = useState(null);
const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dailyWork, setDailyWork] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const calendarRef = useRef(null);

  // Calculate startDate and endDate for the current month
  const startDate = moment({ year: currentYear, month: currentMonth - 1, day: 1 }).tz('UTC').startOf('month').format('YYYY-MM-DD');
  const endDate = moment({ year: currentYear, month: currentMonth - 1, day: 1 }).tz('UTC').endOf('month').format('YYYY-MM-DD');

  // Fetch data
  const { data: getEventsData, isLoading: isEventsLoading, error: eventsError } = useGet(
    '/event',
    { employeeId: user?._id, startDate, endDate },
    {},
    { queryKey: ['events', user?._id, startDate, endDate] }
  );
  const { data: getMeetingsData, isLoading: isMeetingsLoading, error: meetingsError } = useGet(
    '/meetings/get',
    { employeeId: user?._id, startDate, endDate },
    {},
    { queryKey: ['meetings', user?._id, startDate, endDate] }
  );
  const { data: getDailyWorkData, isLoading: isDailyWorkLoading, error: dailyWorkError, refetch } = useGet(
    '/employee/daily-work/get',
    { employeeId: user?._id, currentMonth, currentYear, date: selectedDate },
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

  // Transform and filter events
  useEffect(() => {
    const eventsData = Array.isArray(getEventsData?.data?.data) ? getEventsData.data.data : [];
    const meetings = Array.isArray(getMeetingsData?.data?.data?.data) ? getMeetingsData.data.data.data : [];
    const dailyWork = Array.isArray(getDailyWorkData?.data?.data?.data) ? getDailyWorkData.data.data.data : [];

    // Separate holidays from regular events
    const regularEvents = eventsData.filter(event => event.type !== 'Holiday');
    const holidayEvents = eventsData.filter(event => event.type === 'Holiday');

    // Set holidays for day styling
    const holidayDates = holidayEvents.map(holiday => ({
      date: moment(holiday.start).tz('UTC').format('YYYY-MM-DD'),
      title: holiday.title || 'Holiday',
      description: holiday.description || 'No description'
    }));
    setHolidays(holidayDates);

    const transformedEvents = [
      ...regularEvents.map((event) => ({
        id: event._id,
        title: event.title || 'Unnamed Event',
        start: event.start && moment(event.start).isValid() ? moment(event.start).tz('UTC').toDate() : new Date(),
        end: event.end && moment(event.end).isValid() ? moment(event.end).tz('UTC').toDate() : new Date(),
        color: '#059669',
        bgColor: '#ecfdf5',
        details: `${event.description || 'No description'}`,
        type: 'event',
        createdAt: new Date(event.createdAt || Date.now()),
        icon: EventIcon,
      })),
      ...holidayEvents.map((holiday) => ({
        id: holiday._id,
        title: holiday.title || 'Holiday',
        start: holiday.start && moment(holiday.start).isValid() ? moment(holiday.start).tz('UTC').toDate() : new Date(),
        end: holiday.end && moment(holiday.end).isValid() ? moment(holiday.end).tz('UTC').toDate() : new Date(), 
        color: '#16a34a',
        bgColor: '#dcfce7',
        details: `${holiday.description || 'Holiday'}`,
        type: 'Holiday',
        createdAt: new Date(holiday.createdAt || Date.now()),
        icon: BeachAccessIcon,
        isHoliday: true,
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
        color: '#7c3aed',
        bgColor: '#f3e8ff',
        details: `${meeting.meetingAgenda || meeting.meetingDescription || 'No description'}`,
        type: 'meeting',
        host: meeting.meetingHost,
        link: meeting.meetingLink,
        by: meeting.meetingBy,
        for: meeting.meetingFor,
        duration: meeting.meetingDuration,
        createdAt: new Date(meeting.createdAt || Date.now()),
        icon: VideocamIcon,
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
        color: '#dc2626',
        bgColor: '#fef2f2',
        details: `${work.description || 'No description'}`,
        type: 'dailyWork',
        createdAt: new Date(work.createdAt || Date.now()),
        icon: AssignmentIcon,
      })),
    ];

    const seenIds = new Set();
    const uniqueEvents = transformedEvents.filter((event) => {
      if (seenIds.has(event.id)) return false;
      seenIds.add(event.id);
      return true;
    });

    // Apply filter and search
    const filteredEvents = uniqueEvents
      .filter((event) => (filterType ? event.type === filterType : true))
      .filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()));

    setEvents(filteredEvents);
  }, [getEventsData, getMeetingsData, getDailyWorkData, filterType, searchQuery]);

  const handleNavigate = (date) => {
    const newMonth = date.getMonth() + 1;
    const newYear = date.getFullYear();
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    getTimes && getTimes(newMonth, newYear);
  };

const onSelectSlot = (slotInfo) => {
  console.log("Selected slot (raw):", slotInfo);

  let start = slotInfo.start;
  let end = slotInfo.end;

  const isStartMidnight = moment(start).startOf('day').isSame(moment(start));
  const isEndMidnight = moment(end).startOf('day').isSame(moment(end));
  if (isStartMidnight && isEndMidnight && moment(end).isAfter(moment(start))) {
    end = moment(end).tz('UTC').subtract(1, 'day').toDate();
  }

  if (moment(start).isSame(end, 'day')) {
    setSelectedDate(start);
    setSelectedDateRange(null);
    console.log('Selecting single date:', start);
  } else {
    setSelectedDate(null);
    setSelectedDateRange({ start, end });
    console.log('Selecting date range:', { start, end });
  }

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
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Check if this date is a holiday
    const dateKey = moment(date).tz('UTC').format('YYYY-MM-DD');
    const isHoliday = holidays.some(holiday => holiday.date === dateKey);
    
    return {
      className: isHoliday
        ? 'bg-green-100 border-2 border-green-300 rounded-lg holiday-cell'
        : isCurrentDate
        ? 'bg-blue-50 border-2 border-blue-200 rounded-lg'
        : isWeekend
        ? 'bg-gray-50'
        : 'bg-white hover:bg-gray-50 transition-colors duration-150',
    };
  };

  const eventPropGetter = (event) => {
    if (event.isHoliday) {
      return {
        style: {
          backgroundColor: '#16a34a',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          fontSize: '12px',
          fontWeight: '700',
          padding: '4px 8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
          width: '100%',
          margin: '2px 0',
        },
      };
    }
    
    return {
      style: {
        backgroundColor: event.bgColor,
        border: `2px solid ${event.color}`,
        borderLeft: `4px solid ${event.color}`,
        borderRadius: '6px',
        color: '#374151',
        fontSize: '12px',
        fontWeight: '500',
        padding: '4px 8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    };
  };

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
    return eventsMap;
  }, [events]);

  const legendItems = [
    { type: 'Event', color: '#059669', bgColor: '#ecfdf5', icon: EventIcon },
    { type: 'Meeting', color: '#7c3aed', bgColor: '#f3e8ff', icon: VideocamIcon },
    { type: 'Task', color: '#dc2626', bgColor: '#fef2f2', icon: AssignmentIcon },
    { type: 'Holiday', color: '#16a34a', bgColor: '#dcfce7', icon: BeachAccessIcon },
  ];

  const getErrorMessage = (error) => {
    if (!error) return null;
    const status = error.response?.status;
    switch (status) {
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'You lack permission to access this data.';
      case 404:
        return 'Data not found. Please check the API endpoint.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const EventComponent = ({ event }) => {
    const IconComponent = event.icon;
    
    if (event.isHoliday) {
      return (
        <Tooltip title={event.details} arrow>
          <div className="flex items-center justify-center text-green font-bold text-xs h-full">
            <BeachAccessIcon style={{ fontSize: '14px', marginRight: '4px', color:'black' }} color='green'/>
            <span style={{
                color: 'green',
            }}>{event.title.toUpperCase()}</span>
          </div>
        </Tooltip>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-xs">
        <IconComponent style={{ fontSize: '14px', color: event.color }} />
        <span className="font-medium truncate">{event.title}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 w-full h-full relative">
      <style jsx>{`
        .rbc-calendar {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .holiday-cell {
          position: relative;
        }

        .holiday-cell::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          opacity: 0.1;
          pointer-events: none;
          z-index: -1;
        }

        .holiday-cell .rbc-date-cell a {
          background: #16a34a !important;
          color: white !important;
          border-radius: 6px;
          font-weight: 700;
        }

        .rbc-toolbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .rbc-toolbar-label {
          font-size: 24px !important;
          font-weight: 600 !important;
          letter-spacing: -0.5px;
        }

        .rbc-month-view {
          background: white !important;
        }

        .rbc-month-row {
          min-height: 110px !important;
          border-bottom: 1px solid #f3f4f6;
        }

        .rbc-date-cell {
          padding: 8px !important;
          text-align: left;
          position: relative;
          font-size: 14px;
          border-right: 1px solid #f3f4f6;
        }

        .rbc-date-cell a {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #374151;
          font-weight: 600;
          font-size: 13px;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .rbc-date-cell a:hover {
          background: #f3f4f6;
        }

        .rbc-off-range {
          color: #9ca3af !important;
          background: #fafafa !important;
        }

        .rbc-off-range a {
          color: #9ca3af !important;
        }

        .rbc-today a {
          background: #3b82f6 !important;
          color: white !important;
          border-radius: 6px;
          font-weight: 700;
        }

        .rbc-event {
          margin: 2px 4px !important;
          border-radius: 6px !important;
        }

        .rbc-btn-group button {
          color: white !important;
          background: rgba(255, 255, 255, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          padding: 8px 16px;
          border-radius: 6px;
          margin-left: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .rbc-btn-group button:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        .rbc-btn-group button.rbc-active {
          background: rgba(255, 255, 255, 0.9) !important;
          color: #667eea !important;
        }

        .rbc-header {
          background: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0 !important;
          padding: 12px 8px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #475569 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rbc-agenda-view table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 8px;
          overflow: hidden;
        }

        .rbc-agenda-view .rbc-agenda-date-cell,
        .rbc-agenda-view .rbc-agenda-time-cell {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
        }

        .rbc-agenda-view .rbc-agenda-event-cell {
          padding: 12px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
        }

        .rbc-agenda-view .rbc-agenda-event-cell:hover {
          background: #f8fafc;
        }

        .rbc-show-more {
          background: #f3f4f6 !important;
          color: #6b7280 !important;
          border: 1px solid #e5e7eb !important;
          font-size: 11px !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-weight: 500 !important;
        }

        .holiday-label {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #16a34a;
          color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {(isEventsLoading || isMeetingsLoading || isDailyWorkLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50 rounded-xl">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading calendar...</p>
          </div>
        </div>
      )}

      {(eventsError || meetingsError || dailyWorkError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50 rounded-xl">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold mb-4">
              {eventsError
                ? getErrorMessage(eventsError)
                : meetingsError
                ? getErrorMessage(meetingsError)
                : getErrorMessage(dailyWorkError)}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <img
          src={logo}
          alt="Calendar Logo"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[35%] max-w-[300px] opacity-5 pointer-events-none z-0"
        />
        
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-1 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <IconButton 
                onClick={() => setFilterType(null)} 
                color={filterType === null ? 'primary' : 'default'}
                size="small"
                className="border border-gray-200"
              >
                <FilterListIcon />
              </IconButton>
              {legendItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Tooltip key={item.type} title={`Filter ${item.type}s`} arrow>
                    <IconButton
                      onClick={() => setFilterType(item.type.toLowerCase())}
                      color={filterType === item.type.toLowerCase() ? 'primary' : 'default'}
                      size="small"
                      style={{
                        backgroundColor: filterType === item.type.toLowerCase() ? item.bgColor : 'transparent',
                        border: `1px solid ${filterType === item.type.toLowerCase() ? item.color : '#e5e7eb'}`,
                      }}
                    >
                      <IconComponent style={{ fontSize: '18px', color: item.color }} />
                    </IconButton>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10">
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
            selectable={true} 
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            style={{
              height: size.height - 150,
              width: '100%',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              border: 'none',
              background: 'transparent',
            }}
            components={{
              event: EventComponent,
              agenda: {
                event: ({ event }) => (
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                    <div 
                      className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <event.icon style={{ fontSize: '16px', color: event.color }} />
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{event.title}</h4>
                        <Chip 
                          label={event.type} 
                          size="small" 
                          style={{ 
                            backgroundColor: event.bgColor, 
                            color: event.color,
                            fontSize: '10px',
                            height: '20px'
                          }} 
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <AccessTimeIcon style={{ fontSize: '12px' }} />
                          <span>
                            {moment(event.start).tz('Asia/Kolkata').format('h:mm A')} - {' '}
                            {moment(event.end).tz('Asia/Kolkata').format('h:mm A')}
                          </span>
                        </div>
                        {event.duration && (
                          <span className="text-gray-500">({event.duration} min)</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.details}</p>
                      {event.type === 'meeting' && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {event.host && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <PersonIcon style={{ fontSize: '12px' }} />
                              <span>Host: {event.host}</span>
                            </div>
                          )}
                          {event.link && (
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <LinkIcon style={{ fontSize: '12px' }} />
                              Join Meeting
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ),
                date: ({ label }) => (
                  <div className="text-sm font-bold text-gray-800 bg-gray-50 px-3 py-2 border-b border-gray-200">
                    {label}
                  </div>
                ),
              },
              // dateCellWrapper: ({ children, value }) => {
              //   const dateKey = moment(value).tz('UTC').format('YYYY-MM-DD');
              //   const eventsOnDate = eventsByDate[dateKey] || [];
              //   const holiday = holidays.find(holiday => holiday.date === dateKey);
                
              //   return (
              //     <div className="relative h-full">
              //       {children}
              //       {holiday && (
              //         <Tooltip title={holiday.description} arrow>
              //           <div className="absolute top-2 left-2 holiday-label z-10">
              //             {holiday.title.toUpperCase()}
              //           </div>
              //         </Tooltip>
              //       )}
              //       {eventsOnDate.length > 3 && (
              //         <div className="absolute bottom-1 right-1">
              //           <Badge
              //             badgeContent={`+${eventsOnDate.length - 3}`}
              //             color="secondary"
              //             sx={{
              //               '& .MuiBadge-badge': {
              //                 fontSize: '9px',
              //                 height: '16px',
              //                 minWidth: '16px',
              //               }
              //             }}
              //           />
              //         </div>
              //       )}
              //     </div>
              //   );
              // },
            }}
          />
        </div>

        <AddTaskDialog
          open={openDialog}
          onClose={handleCloseDialog}
          selectedDate={selectedDate}
          selectedDateRange={selectedDateRange}
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