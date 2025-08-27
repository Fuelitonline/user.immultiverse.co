import React, { useState, useCallback, useEffect } from 'react';
import { useGet, usePost } from '../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment-timezone';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3B4A54', // Muted charcoal for primary actions
    },
    secondary: {
      main: '#E8ECEF', // Light beige-gray for secondary elements
    },
    background: {
      default: '#F5F5F5', // Off-white background
      paper: '#FFFFFF', // Clean white for paper components
    },
    text: {
      primary: '#333333', // Dark gray for text
      secondary: '#666666', // Lighter gray for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#333333',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#666666',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#E0E0E0',
            },
            '&:hover fieldset': {
              borderColor: '#B0B0B0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3B4A54',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          backgroundColor: '#3B4A54',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#4A5B66',
          },
        },
      },
    },
  },
});

function EventTab({ selectedDate, selectedDateRange, description, setDescription, setErrorMessage, onEventAdded }) {
  const queryClient = useQueryClient();
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [customEventType, setCustomEventType] = useState('');
  const [eventStart, setEventStart] = useState(
    selectedDateRange?.start && moment(selectedDateRange.start).isValid()
      ? moment(selectedDateRange.start).tz('UTC').format('YYYY-MM-DDTHH:mm')
      : selectedDate && moment(selectedDate).isValid()
      ? moment(selectedDate).tz('UTC').format('YYYY-MM-DDTHH:mm')
      : ''
  );
  const [eventEnd, set_WindowEnd] = useState(
    selectedDateRange?.end && moment(selectedDateRange.end).isValid()
      ? moment(selectedDateRange.end).tz('UTC').format('YYYY-MM-DDTHH:mm')
      : ''
  );

  const { data: eventTypes, isLoading: eventTypesLoading, isError: eventTypesError } = useGet(
    '/employee/event/types',
    {},
    {},
    { queryKey: ['eventTypes'] }
  );
  const { data: eventsData, isLoading: eventsLoading, isError: eventsError } = useGet(
    '/employee/event',
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
  const addEventMutation = usePost('/employee/event/add', {}, 'events');

  const types = Array.isArray(eventTypes?.data?.data) ? eventTypes.data.data : [];
  const events = Array.isArray(eventsData?.data)
    ? eventsData.data
    : Array.isArray(eventsData?.data?.data)
    ? eventsData.data.data
    : [];

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

  const eventDates = selectedDateRange && moment(selectedDateRange.start).isValid() && moment(selectedDateRange.end).isValid()
    ? getDatesInRange(selectedDateRange.start, selectedDateRange.end)
    : selectedDate && moment(selectedDate).isValid()
    ? [moment(selectedDate).toISOString()]
    : [];

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
      onEventAdded();
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
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100%' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Event Title */}
          <TextField
            label="Event Title"
            variant="outlined"
            fullWidth
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Enter event title"
            size="small"
          />

          {/* Date Range Display */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Date Range
            </Typography>
            <Typography variant="body2" color={eventDates.length > 0 ? 'text.primary' : 'error'}>
              {eventDates.length > 0 ? (
                eventDates.length === 1 ? (
                  moment(eventDates[0]).tz('UTC').format('MMMM D, YYYY')
                ) : (
                  `${moment(eventDates[0]).tz('UTC').format('MMM D, YYYY')} - ${moment(eventDates[eventDates.length - 1]).tz('UTC').format('MMM D, YYYY')}`
                )
              ) : (
                'No valid date selected'
              )}
            </Typography>
          </Box>

          {/* Event Type */}
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Event Type</InputLabel>
            {eventTypesLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading event types...
              </Typography>
            ) : eventTypesError ? (
              <Alert severity="error">Error loading event types</Alert>
            ) : (
              <Select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                label="Event Type"
              >
                <MenuItem value="">Select event type</MenuItem>
                {types.length > 0 ? (
                  types.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No types available
                  </MenuItem>
                )}
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            )}
          </FormControl>

          {/* Custom Event Type */}
          {eventType === 'Other' && (
            <TextField
              label="Custom Event Type"
              variant="outlined"
              fullWidth
              value={customEventType}
              onChange={(e) => setCustomEventType(e.target.value)}
              placeholder="Enter custom event type"
              size="small"
            />
          )}

          {/* Start Time */}
          <TextField
            label="Start Time"
            type="time"
            variant="outlined"
            fullWidth
            value={eventStart ? moment(eventStart).tz('UTC').format('HH:mm') : ''}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':');
              const newStart = moment(eventDates[0] || selectedDate).tz('UTC').set({ hour: hours, minute: minutes }).format('YYYY-MM-DDTHH:mm');
              setEventStart(newStart);
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }} // 5-minute steps
            size="small"
          />

          {/* End Time */}
          <TextField
            label="End Time"
            type="time"
            variant="outlined"
            fullWidth
            value={eventEnd ? moment(eventEnd).tz('UTC').format('HH:mm') : ''}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':');
              const newEnd = moment(eventDates[eventDates.length - 1] || selectedDate).tz('UTC').set({ hour: hours, minute: minutes }).format('YYYY-MM-DDTHH:mm');
              setEventEnd(newEnd);
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            size="small"
          />

          {/* Event Description */}
          <TextField
            label="Event Description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is the event about?"
            size="small"
          />

          {/* Submit Button */}
          <Button variant="contained" onClick={handleSubmit} sx={{ alignSelf: 'flex-start' }}>
            Add Event
          </Button>

          {/* Events List */}
          {eventsLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading events...
            </Typography>
          ) : eventsError ? (
            <Alert severity="error">Error loading events</Alert>
          ) : filteredEvents.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Existing Events for{' '}
                {eventDates.length > 0
                  ? eventDates.length === 1
                    ? moment(eventDates[0]).tz('UTC').format('MMMM D, YYYY')
                    : `${moment(eventDates[0]).tz('UTC').format('MMM D, YYYY')} - ${moment(eventDates[eventDates.length - 1]).tz('UTC').format('MMM D, YYYY')}`
                  : 'Selected Date'}
              </Typography>
              <Box sx={{ maxHeight: 100, overflowY: 'auto', bgcolor: 'background.paper', p: 1, borderRadius: '8px' }}>
                {filteredEvents.map((event, index) => (
                  <Paper key={event._id || index} sx={{ p: 2, mb: 1, bgcolor: 'background.paper', border: '1px solid #E0E0E0' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {event.title || 'Unnamed Event'}
                    </Typography>
                    <Typography variant="body2">
                      {moment(event.start).tz('UTC').format('h:mm A')} - {moment(event.end).tz('UTC').format('h:mm A')}
                    </Typography>
                    <Typography variant="body2">Type: {event.type || 'N/A'}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No events for{' '}
              {eventDates.length > 0
                ? eventDates.length === 1
                  ? moment(eventDates[0]).tz('UTC').format('MMMM D, YYYY')
                  : `${moment(eventDates[0]).tz('UTC').format('MMM D, YYYY')} - ${moment(eventDates[eventDates.length - 1]).tz('UTC').format('MMM D, YYYY')}`
                : 'selected date'}
            </Typography>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default EventTab;