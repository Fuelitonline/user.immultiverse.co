// AlertComponent.js
import React from 'react';
import { Alert, Button, Snackbar } from '@mui/material';

const AlertComponent = ({ alertState, handleClose }) => {
  const { open, message, severity } = alertState;

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={open}
      autoHideDuration={3000} // Duration in milliseconds (3000ms = 3 seconds)
      onClose={handleClose}
      action={
        <Button color="inherit" onClick={handleClose}>
          Close
        </Button>
      }
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertComponent;
