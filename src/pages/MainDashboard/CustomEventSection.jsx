import React, { useState } from 'react';
import { useGet } from '../../hooks/useApi';

// --- 1. Utility Functions (Unchanged from your original code) ---

/**
 * Parse UTC date string without converting to local timezone
 */
const parseUTCDate = (dateInput) => {
  if (!dateInput) return null;

  let dateString = dateInput;
  if (dateInput instanceof Date) {
    dateString = dateInput.toISOString().replace(/\.\d{3}Z$/, '');
  }

  if (typeof dateString !== 'string') {
    return null;
  }
    
  const parts = dateString.split(/[-T:.Z]/);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0));
};

/**
 * Formats a date string into a short date format (e.g., Oct 15, 2025).
 */
const formatDate = (dateString) => {
  const date = parseUTCDate(dateString);
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Formats a date string into a 12-hour time format (e.g., 10:00 AM).
 */
const formatTime = (dateString) => {
  const date = parseUTCDate(dateString);
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
};

/**
 * Checks if two date objects represent the same calendar day.
 */
const isSameDay = (date1, date2) => {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
};

/**
 * Generates an array of Date objects for the calendar grid.
 */
const getCalendarDays = (year, month) => {
  const days = [];
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  const startDate = new Date(firstDay);
  startDate.setUTCDate(startDate.getUTCDate() - firstDay.getUTCDay());

  const endDate = new Date(lastDay);
  endDate.setUTCDate(endDate.getUTCDate() + (6 - lastDay.getUTCDay()));

  let current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
};

// --- NEW Utility Function for Multiple Colors ---

/**
 * Extracts unique colors from a list of events.
 * It ensures the default color is used if none is present.
 */
const getUniqueEventColors = (events) => {
  const colors = events.map(event => event.color || '#4F46E5'); // Use default if color is missing
  return [...new Set(colors)]; // Get unique colors
};


// --- 2. Event Modal Component (Unchanged) ---

const EventModal = ({ dayInfo, isOpen, onClose }) => {
  const { events, date } = dayInfo;
  if (!isOpen || !events || events.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all overflow-hidden border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-gray-800">
            Events for {formatDate(date)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-3xl font-light leading-none transition-colors duration-200"
          >
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto bg-gray-100">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="relative">
                {event.file && event.fileType?.startsWith('image') ? (
                  <img
                    src={event.file}
                    alt={event.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x128/4F46E5/ffffff?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-20 flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: `${event.color || '#4F46E5'}aa` }}
                  >
                    <span className="opacity-80">{event.title}</span>
                  </div>
                )}
                <span
                  className="absolute bottom-2 right-2 text-xs px-2 py-1 font-semibold rounded-full shadow-sm text-white"
                  style={{ backgroundColor: event.color || '#4F46E5' }}
                >
                  {event.type}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>

                <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 text-sm space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-indigo-600">Start:</span>
                    <span className="font-semibold text-gray-700">
                      {formatDate(event.start)} at {formatTime(event.start)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-indigo-600">End:</span>
                    <span className="font-semibold text-gray-700">
                      {formatDate(event.end)} at {formatTime(event.end)}
                    </span>
                  </div>
                </div>

                {event.description && (
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-200">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 3. Main Calendar Component (MODIFIED) ---

const ModernEventCalendar = ({ events = [], isLoading = false, error = null }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayInfo, setSelectedDayInfo] = useState({ events: [], date: null });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validEvents = Array.isArray(events) ? events : [];
  const calendarDays = getCalendarDays(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth());

  const getDayEvents = (date) => {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);

    return validEvents.filter((event) => {
      const eventStart = parseUTCDate(event.start);
      const eventEnd = parseUTCDate(event.end);
      if (!eventStart || !eventEnd) return false;

      const startOfEvent = new Date(eventStart);
      const endOfEvent = new Date(eventEnd);
      startOfEvent.setUTCHours(0, 0, 0, 0);
      endOfEvent.setUTCHours(23, 59, 59, 999);

      return dayStart >= startOfEvent && dayStart <= endOfEvent;
    });
  };

  const handleDateClick = (date, dayEvents) => {
    if (dayEvents.length > 0) {
      setSelectedDayInfo({ events: dayEvents, date: date });
      setIsModalOpen(true);
    }
  };

  const changeMonth = (delta) => {
    const newDate = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + delta, 1));
    setCurrentMonth(newDate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin mb-4 text-4xl text-indigo-500">⏳</div>
          <p className="text-gray-600 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-xl shadow-md">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">Could not load events. {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fc] p-4 md:p-8 font-sans rounded-2xl shadow-2xl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-2 flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-end">
          <h1 className="text-2xl font-[700] text-[var(--text-color-2)]">🗓️ Event Calendar</h1>
          <p className="text-gray-600 font-medium text-lg">
            Total Events: <span className="font-bold text-[var(--text-color-2)]">{validEvents.length}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-indigo-500 hover:text-white rounded-full transition-all duration-200 text-xl font-bold text-gray-700 shadow-md"
            >
              &lt;
            </button>
            <h2 className="text-3xl font-extrabold text-indigo-600">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-indigo-500 hover:text-white rounded-full transition-all duration-200 text-xl font-bold text-gray-700 shadow-md"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-3 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center font-bold text-indigo-500 py-2 text-sm uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {calendarDays.map((day, idx) => {
              const dayEvents = getDayEvents(day);
              const eventCount = dayEvents.length;
              const isCurrentMonth = day.getUTCMonth() === currentMonth.getUTCMonth();
              const isToday = isSameDay(day, new Date());
              const tooltipTitle = eventCount > 0 ? `${eventCount} event(s)` : '';
              
              const uniqueColors = getUniqueEventColors(dayEvents);
              
              let cellStyle = {};
              let cellTextColor = 'text-gray-800';
              
              if (eventCount > 0 && isCurrentMonth) {
                if (eventCount === 1) {
                  // Case 1: Single Event -> Full Color Fill
                  const color = uniqueColors[0] || '#4F46E5';
                  cellStyle = {
                    backgroundColor: color,
                    boxShadow: `0 4px 10px -2px ${color}40`,
                  };
                  cellTextColor = 'text-white';
                } else if (eventCount >= 2) {
                  // Case 2: Two or More Events -> Half/Half Gradient (for 2) or Dots (for 2+)
                  const color1 = uniqueColors[0] || '#4F46E5';
                  const color2 = uniqueColors[1] || '#3B82F6'; // Default second color
                  
                  // Use a CSS linear-gradient for 50/50 split (only if 2 unique colors)
                  if (uniqueColors.length >= 2) {
                      cellStyle = {
                          // The 'Half-Half' color using gradient
                          background: `linear-gradient(to right, ${color1} 50%, ${color2} 50%)`,
                          boxShadow: `0 4px 10px -2px ${color1}40`,
                          // Ensure text is readable over a multicolored background, default to white
                          // or you can choose a neutral background color here if text readability is an issue
                          backgroundColor: color1, // Fallback
                      };
                      cellTextColor = 'text-white';
                  } else {
                      // If multiple events but only 1 unique color, treat like 1 event but show count
                       cellStyle = {
                          backgroundColor: color1,
                          boxShadow: `0 4px 10px -2px ${color1}40`,
                      };
                      cellTextColor = 'text-white';
                  }
                }
              }
              
              // Base classes
              const cellBaseClasses = `aspect-square p-2 rounded-lg font-semibold text-base transition-all flex flex-col items-center justify-center relative shadow-sm ${
                isCurrentMonth
                  ? eventCount > 0
                    ? 'cursor-pointer hover:shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100'
                  : 'bg-white text-gray-400 border border-gray-100'
              }`;

              return (
                <div
                  key={idx}
                  title={tooltipTitle}
                  className={`${cellBaseClasses} ${cellTextColor} ${isCurrentMonth && eventCount > 1 ? 'bg-gray-50' : ''}`}
                  style={cellStyle}
                  onClick={() => eventCount > 0 && handleDateClick(day, dayEvents)}
                >
                  <span className="text-lg leading-none">{day.getUTCDate()}</span>
                  
                  {/* --- MODIFIED Marker/Count Logic --- */}
                  {eventCount > 0 && isCurrentMonth && (
                    <div className="absolute inset-x-0 bottom-1 flex justify-center items-center">
                        {eventCount === 1 && (
                            // Single event marker (white dot)
                            <span
                                className={`w-1.5 h-1.5 rounded-full`}
                                style={{ backgroundColor: cellTextColor === 'text-white' ? 'white' : uniqueColors[0] || '#4F46E5' }}
                            ></span>
                        )}

                        {eventCount > 1 && (
                            <div className="flex gap-0.5 items-center justify-center">
                                {/* First event color dot */}
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: uniqueColors[0] || '#4F46E5' }}></div>
                                
                                {/* +N Count (This is what you asked for) */}
                                <span className="text-xs font-bold px-1 py-0.5 rounded-full bg-white text-gray-800 shadow-sm leading-none">
                                    +{eventCount - 1}
                                </span>
                                
                                {/* Optional: Second event color dot (if available) */}
                                {uniqueColors.length >= 2 && (
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: uniqueColors[1] || '#3B82F6' }}></div>
                                )}
                            </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EventModal
        dayInfo={selectedDayInfo}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDayInfo({ events: [], date: null });
        }}
      />
    </div>
  );
};

// --- 4. Wrapper Component (API Integration) (Unchanged) ---

const CustomEventSection = () => {
  const { data, isLoading, error } = useGet('/event', {});
  let events = [];

  if (data && Array.isArray(data?.data?.data)) {
    events = data.data.data;
  }

  return <ModernEventCalendar events={events} isLoading={isLoading} error={error} />;
};

export default CustomEventSection;