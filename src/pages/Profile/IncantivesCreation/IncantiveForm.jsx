import React, { useState } from 'react';
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, Button, 
  Typography, Box, Slide, AppBar, Tabs, Tab, useTheme 
} from '@mui/material';
import TargetBased from './TargetBased';

const IncantiveFormDialog = ({ open, close, teams }) => {
  const [value, setValue] = useState(0);
  const theme = useTheme(); // Access MUI theme for consistent styling

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClose = () => {
    close(false);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Slide direction="up" in={value === index} mountOnEnter unmountOnExit>
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        </Slide>
      )}
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)', // Subtle gradient
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: '700',
          fontSize: '1.75rem',
          color: '#1a237e', // Deep indigo for modern contrast
          background: 'linear-gradient(90deg, #e8eaf6 0%, #c5cae9 100%)',
          py: 2,
          px: 3,
          position: 'relative',
          borderBottom: 'none',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          Target & Incentives
        </Typography>
        <AppBar
          position="sticky"
          sx={{
            background: 'transparent',
            boxShadow: 'none',
            mt: 2,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="fullWidth"
            sx={{
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)', // Glassmorphism effect
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              '& .MuiTabs-indicator': {
                height: 4,
                background: 'linear-gradient(90deg, #4caf50, #81c784)', // Green gradient indicator
                borderRadius: '4px 4px 0 0',
              },
            }}
          >
            <Tab
              label="Target Based"
              sx={{
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                color: value === 0 ? '#4caf50 !important' : '#757575',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#4caf50',
                  background: 'rgba(76, 175, 80, 0.1)',
                },
              }}
            />
            <Tab
              label="Payment Based"
              sx={{
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                color: value === 1 ? '#4caf50 !important' : '#757575',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#4caf50',
                  background: 'rgba(76, 175, 80, 0.1)',
                },
              }}
            />
            <Tab
              label="Call Based"
              sx={{
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                color: value === 2 ? '#4caf50 !important' : '#757575',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#4caf50',
                  background: 'rgba(76, 175, 80, 0.1)',
                },
              }}
            />
          </Tabs>
        </AppBar>
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: '80vh',
          overflowY: 'auto',
          px: 4,
          py: 3,
          background: '#fff',
          borderRadius: '0 0 12px 12px',
        }}
      >
        <TabPanel value={value} index={0}>
          <TargetBased teams={teams} Cancle={handleClose} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography variant="h6" color="textSecondary">
            Payment Based Content (Coming Soon)
          </Typography>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Typography variant="h6" color="textSecondary">
            Call Based Content (Coming Soon)
          </Typography>
        </TabPanel>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: '1px solid #eee',
          background: '#fafafa',
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: '600',
            color: '#f44336',
            borderColor: '#f44336',
            borderRadius: 2,
            px: 3,
            '&:hover': {
              background: 'rgba(244, 67, 54, 0.1)',
              borderColor: '#d32f2f',
            },
          }}
        >
          Cancel
        </Button>

      </DialogActions>
    </Dialog>
  );
};

export default IncantiveFormDialog;