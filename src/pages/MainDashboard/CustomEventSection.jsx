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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal(null)}
          sx={{
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#e5e7eb' },
          }}
        >
          Add Event
        </Button>
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

      {/* Enhanced Modal with MUI Dialog */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        PaperComponent={motion.div}
        PaperProps={{
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 30 },
          transition: { duration: 0.4, ease: 'easeOut' },
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
            background: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
            maxWidth: '450px',
            top: '20%',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f5f9',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#3b82f6',
              borderRadius: '10px',
              '&:hover': {
                background: '#2563eb',
              },
            },
          },
        }}
        sx={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(0, 0, 0, 0.6)',
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: '#fff',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              fontSize: '1.25rem',
            }}
          >
            Add New Event
          </Typography>
          <Button
            component={motion.div}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCloseModal}
            sx={{
              minWidth: 'auto',
              p: 1,
              borderRadius: '50%',
              background: '#ffffff',
              color: '#1e3a8a',
              '&:hover': { background: '#e5e7eb' },
            }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: '#1e3a8a',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.95rem',
                width: '100px',
              }}
            >
              Event Title
            </Typography>
            <TextField
              fullWidth
              label="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  background: '#f8fafc',
                  '& fieldset': { borderColor: '#d1d5db' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#6b7280', fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                '& .MuiInputBase-input': { fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: '#1e3a8a',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.95rem',
                width: '100px',
              }}
            >
              Start Date
            </Typography>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={newEvent.start}
              onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  background: '#f8fafc',
                  '& fieldset': { borderColor: '#d1d5db' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#6b7280', fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                '& .MuiInputBase-input': { fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: '#1e3a8a',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.95rem',
                width: '100px',
              }}
            >
              End Date
            </Typography>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={newEvent.end}
              onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  background: '#f8fafc',
                  '& fieldset': { borderColor: '#d1d5db' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#6b7280', fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                '& .MuiInputBase-input': { fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: '#1e3a8a',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.95rem',
                width: '100px',
                mt: '16px',
              }}
            >
              Description
            </Typography>
            <TextField
              fullWidth
              label="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              multiline
              rows={3}
              placeholder="Enter event description"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  background: '#f8fafc',
                  '& fieldset': { borderColor: '#d1d5db' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#6b7280', fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                '& .MuiInputBase-input': { fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddEvent}
            disabled={!newEvent.title || !newEvent.start || !newEvent.end}
            sx={{
              flex: 1,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
              borderRadius: '10px',
              padding: '10px',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              fontSize: '0.9rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
              },
              '&:disabled': {
                background: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            Add Event
          </Button>
          <Button
            variant="outlined"
            onClick={handleCloseModal}
            sx={{
              flex: 1,
              borderRadius: '10px',
              borderColor: '#d1d5db',
              color: '#1e3a8a',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              fontSize: '0.9rem',
              '&:hover': {
                background: '#f8fafc',
                borderColor: '#3b82f6',
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
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