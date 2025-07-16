import React, { useState } from 'react';
import { Box, Grid, Typography, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// CustomEventCalendar Component
const CustomEventCalendar = ({ events, onAddEvent }) => {
  const [openModal, setOpenModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', description: '' });
  const [selectedDate, setSelectedDate] = useState(null);

  const handleOpenModal = (date) => {
    setSelectedDate(date);
    setNewEvent({ ...newEvent, start: date ? format(date, 'yyyy-MM-dd') : '', description: '' });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewEvent({ title: '', start: '', end: '', description: '' });
    setSelectedDate(null);
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      onAddEvent({
        ...newEvent,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
        id: Date.now(),
        description: newEvent.description || 'No description provided',
      });
      handleCloseModal();
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        height: '540px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        background: '#ffffff',
      }}
    >
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          Event Calendar
        </Typography>
        
      </Box>
      <Grid container spacing={0} sx={{ p: 3, display: 'flex', alignItems: 'stretch' }}>
        <Grid item xs={12} md={8} sx={{ pr: 2 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: '12px',
              background: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              height: '100%',
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                onChange={(newDate) => handleOpenModal(newDate)}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ pl: 2 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: '12px',
              background: '#f8fafc',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderLeft: '4px solid #3b82f6',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#1e3a8a',
                mb: 2,
                fontSize: '1.2rem',
                textAlign: 'left',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '8px',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Upcoming Events
            </Typography>
            <Grid container direction="column" spacing={1.5} sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <Grid item key={index}>
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: '8px',
                        background: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(59,130,246,0.2)',
                          transform: 'translateY(-2px)',
                          background: '#eff6ff',
                        },
                        maxHeight: '80px',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.primary"
                        sx={{ fontWeight: 500, fontSize: '0.9rem', fontFamily: '"Poppins", sans-serif' }}
                      >
                        {event.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: '0.75rem', fontFamily: '"Poppins", sans-serif' }}
                      >
                        {format(event.start, 'PPP')} - {format(event.end, 'PPP')}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: '0.75rem', fontStyle: 'italic', fontFamily: '"Poppins", sans-serif' }}
                      >
                        {event.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={2}
                  sx={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  No events scheduled
                </Typography>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      
    </Box>
  );
};

// CustomEventSection Component
const CustomEventSection = () => {
  const [events, setEvents] = useState([]);

  const handleAddEvent = (event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  return (
    <CustomEventCalendar events={events} onAddEvent={handleAddEvent} />
  );
};

export default CustomEventSection;