import React, { useState, useCallback, useEffect } from 'react';
import { useGet, usePost } from '../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment-timezone'; // Use moment-timezone for consistent timezone handling

function EventTab({ selectedDate, selectedDateRange, description, setDescription, setErrorMessage, onEventAdded }) {
  const queryClient = useQueryClient();
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [customEventType, setCustomEventType] = useState(''); // State for custom event type
  const [eventStart, setEventStart] = useState(
    selectedDateRange?.start && moment(selectedDateRange.start).isValid()
      ? moment(selectedDateRange.start).tz('UTC').format('YYYY-MM-DDTHH:mm')
      : selectedDate && moment(selectedDate).isValid()
      ? moment(selectedDate).tz('UTC').format('YYYY-MM-DDTHH:mm')
      : ''
  );
  const [eventEnd, setEventEnd] = useState(
    selectedDateRange?.end && moment(selectedDateRange.end).isValid()
      ? moment(selectedDateRange.end).tz('UTC').format('YYYY-MM-DDTHH:mm')
      : ''
  );
  const { data: eventTypes, isLoading: eventTypesLoading, isError: eventTypesError } = useGet(
    '/event/types',
    {},
    {},
    { queryKey: ['eventTypes'] }
  );
  const { data: eventsData, isLoading: eventsLoading, isError: eventsError } = useGet(
    '/event',
    {
      date: selectedDateRange?.start && moment(selectedDateRange.start).isValid()
        ? moment(selectedDateRange.start).tz('UTC').format('YYYY-MM-DD')
        : selectedDate && moment(selectedDate).isValid()
        ? moment(selectedDate).tz('UTC').format('YYYY-MM-DD')
        : null,
    },
    {},
    {
      queryKey: [
        'events',
        selectedDateRange?.start && moment(selectedDateRange.start).isValid()
          ? moment(selectedDateRange.start).tz('UTC').format('YYYY-MM-DD')
          : selectedDate && moment(selectedDate).isValid()
          ? moment(selectedDate).tz('UTC').format('YYYY-MM-DD')
          : null,
      ],
    }
  );
  const addEventMutation = usePost('/event/add', {}, 'events');

  // Normalize event types and events
  const types = Array.isArray(eventTypes?.data?.data) ? eventTypes.data.data : [];
  const events = Array.isArray(eventsData?.data)
    ? eventsData.data
    : Array.isArray(eventsData?.data?.data)
    ? eventsData.data.data
    : [];

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

  // Determine the dates to use for event creation
  const eventDates = selectedDateRange && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()
    ? getDatesInRange(selectedDateRange.start, selectedDateRange.end)
    : selectedDate && moment(selectedDate).isValid()
    ? [moment(selectedDate).toISOString()]
    : [];

  // Filter events for the selected date or date range
  const filteredEvents = events.filter((event) => {
    const eventDate = moment(event.start).tz('UTC').format('YYYY-MM-DD');
    if (selectedDateRange?.start && selectedDateRange?.end) {
      const startDate = moment(selectedDateRange.start).tz('UTC').format('YYYY-MM-DD');
      const endDate = moment(selectedDateRange.end).tz('UTC').format('YYYY-MM-DD');
      return moment(eventDate).isBetween(startDate, endDate, 'day', '[]');
    }
    return eventDate === moment(selectedDate).tz('UTC').format('YYYY-MM-DD');
  });

  useEffect(() => {
    console.log('Event Types Data:', eventTypes);
    console.log('Normalized Types:', types);
    console.log('Event Types Loading:', eventTypesLoading);
    console.log('Event Types Error:', eventTypesError);
    console.log('Events Data:', eventsData);
    console.log('Normalized Events:', events);
    console.log('Filtered Events:', filteredEvents);
    console.log('Events Loading:', eventsLoading);
    console.log('Events Error:', eventsError);
    console.log('Selected Date:', selectedDate ? moment(selectedDate).tz('UTC').format('YYYY-MM-DD') : 'null');
    console.log('Selected Date Range:', selectedDateRange);
    console.log('Event Dates:', eventDates);
  }, [
    eventTypes,
    types,
    eventTypesLoading,
    eventTypesError,
    eventsData,
    events,
    filteredEvents,
    eventsLoading,
    eventsError,
    selectedDate,
    selectedDateRange,
    eventDates,
  ]);

  const isValidDate = (dateString) => {
    return dateString && !isNaN(new Date(dateString).getTime());
  };

  const handleSubmit = useCallback(async () => {
    if (!eventTitle.trim() || !eventType || !eventStart || !eventEnd || !description.trim()) {
      setErrorMessage('All event fields are required');
      return;
    }
    if (eventType === 'Other' && !customEventType.trim()) {
      setErrorMessage('Custom event type is required when "Other" is selected');
      return;
    }
    if (!isValidDate(eventStart) || !isValidDate(eventEnd)) {
      setErrorMessage('Invalid start or end date/time');
      return;
    }
    if (eventDates.length === 0) {
      setErrorMessage('No valid date(s) selected');
      return;
    }
    try {
      setErrorMessage('');
      // Create an event for each date in the range
      for (const date of eventDates) {
        const startDateTime = moment(date).tz('UTC').set({
          hour: moment(eventStart).tz('UTC').hour(),
          minute: moment(eventStart).tz('UTC').minute(),
        }).toISOString();
        const endDateTime = moment(date).tz('UTC').set({
          hour: moment(eventEnd).tz('UTC').hour(),
          minute: moment(eventEnd).tz('UTC').minute(),
        }).toISOString();
        const eventData = {
          title: eventTitle,
          type: eventType === 'Other' ? customEventType : eventType,
          start: startDateTime,
          end: endDateTime,
          description,
        };
        await addEventMutation.mutateAsync(eventData);
      }
      setEventTitle('');
      setEventType('');
      setCustomEventType('');
      setEventStart('');
      setEventEnd('');
      setDescription('');
      onEventAdded(); // Trigger callback to invalidate queries
      // Invalidate events query for the date range
      queryClient.invalidateQueries([
        'events',
        selectedDateRange?.start && moment(selectedDateRange.start).isValid()
          ? moment(selectedDateRange.start).tz('UTC').format('YYYY-MM-DD')
          : selectedDate && moment(selectedDate).isValid()
          ? moment(selectedDate).tz('UTC').format('YYYY-MM-DD')
          : null,
      ]);
    } catch (error) {
      setErrorMessage(`Failed to save event: ${error.message}`);
    }
  }, [
    eventTitle,
    eventType,
    customEventType,
    eventStart,
    eventEnd,
    description,
    eventDates,
    setDescription,
    setErrorMessage,
    addEventMutation,
    queryClient,
    selectedDate,
    selectedDateRange,
    onEventAdded,
  ]);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">Event Title</label>
        <input
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="Enter event title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">Date Range</label>
        <div className="text-gray-600 text-sm mb-2">
          {eventDates.length > 0 ? (
            eventDates.length === 1 ? (
              moment(eventDates[0]).tz('UTC').format('MMMM D, YYYY')
            ) : (
              `${moment(eventDates[0]).tz('UTC').format('MMM D, YYYY')} - ${moment(eventDates[eventDates.length - 1]).tz('UTC').format('MMM D, YYYY')}`
            )
          ) : (
            <span className="text-red-500">No valid date selected</span>
          )}
        </div>
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">Event Type</label>
        {eventTypesLoading ? (
          <p className="text-gray-500 text-xs">Loading event types...</p>
        ) : eventTypesError ? (
          <p className="text-red-500 text-xs">Error loading event types</p>
        ) : (
          <select
            className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="">Select event type</option>
            {types.length > 0 ? (
              types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No types available
              </option>
            )}
            <option value="Other">Other</option>
          </select>
        )}
      </div>
      {eventType === 'Other' && (
        <div>
          <label className="text-gray-600 font-medium text-xs block mb-1">Custom Event Type</label>
          <input
            className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            placeholder="Enter custom event type"
            value={customEventType}
            onChange={(e) => setCustomEventType(e.target.value)}
          />
        </div>
      )}
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">Start Time</label>
        <input
          type="time"
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          value={eventStart ? moment(eventStart).tz('UTC').format('HH:mm') : ''}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':');
            const newStart = moment(eventDates[0] || selectedDate).tz('UTC').set({ hour: hours, minute: minutes }).format('YYYY-MM-DDTHH:mm');
            setEventStart(newStart);
          }}
        />
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">End Time</label>
        <input
          type="time"
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          value={eventEnd ? moment(eventEnd).tz('UTC').format('HH:mm') : ''}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':');
            const newEnd = moment(eventDates[eventDates.length - 1] || selectedDate).tz('UTC').set({ hour: hours, minute: minutes }).format('YYYY-MM-DDTHH:mm');
            setEventEnd(newEnd);
          }}
        />
      </div>
      <div>
        <label className="text-gray-600 font-medium text-xs block mb-1">Event Description</label>
        <textarea
          className="w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          placeholder="What is the event about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
        />
      </div>
      <div
        id="event-submit"
        onClick={handleSubmit}
        className="hidden"
      />
      {eventsLoading ? (
        <p className="text-gray-500 text-xs mt-2">Loading events...</p>
      ) : eventsError ? (
        <p className="text-red-500 text-xs mt-2">Error loading events</p>
      ) : filteredEvents.length > 0 ? (
        <div className="mt-2">
          <p className="text-gray-600 font-medium text-xs mb-1">
            Existing Events for{' '}
            {eventDates.length > 0
              ? eventDates.length === 1
                ? moment(eventDates[0]).tz('UTC').format('MMMM D, YYYY')
                : `${moment(eventDates[0]).tz('UTC').format('MMM D, YYYY')} - ${moment(eventDates[eventDates.length - 1]).tz('UTC').format('MMM D, YYYY')}`
              : 'Selected Date'}
          </p>
          <div className="max-h-[100px] overflow-y-auto">
            {filteredEvents.map((event, index) => (
              <div
                key={event._id || index}
                className="p-2 mb-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="text-sm font-semibold text-gray-800">{event.title || 'Unnamed Event'}</p>
                <p className="text-xs text-gray-500">
                  {moment(event.start).tz('UTC').format('h:mm A')} -{' '}
                  {moment(event.end).tz('UTC').format('h:mm A')}
                </p>
                <p className="text-xs text-gray-500">Type: {event.type || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-xs mt-2">
          No events for{' '}
          {eventDates.length > 0
            ? eventDates.length === 1
              ? moment(eventDates[0]).tz('UTC').format('MMMM D, YYYY')
              : `${moment(eventDates[0]).tz('UTC').format('MMM D, YYYY')} - ${moment(eventDates[eventDates.length - 1]).tz('UTC').format('MMM D, YYYY')}`
            : 'selected date'}
        </p>
      )}
    </div>
  );
}

export default EventTab;