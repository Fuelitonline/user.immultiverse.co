// src/components/ConfirmationDialog.js
import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

/**
 * ConfirmationDialog Component - A reusable dialog for confirming actions.
 * @param {Object} props - The props for the component.
 * @param {boolean} props.open - Controls whether the dialog is open or closed.
 * @param {Function} props.onClose - Callback to close the dialog.
 * @param {Function} props.onConfirm - Callback to execute when the action is confirmed.
 * @param {string} props.message - The message to display in the dialog.
 * @returns {JSX.Element} The confirmation dialog.
 */
const ConfirmationDialog = ({ open, onClose, onConfirm, message }) => (
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: { minWidth: 300, borderRadius: 5, boxShadow: 24, padding: 2 },
    }}
  >
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        sx={{
          color: 'white',
          backgroundColor: '#fa2045',
          '&:hover': {
            backgroundColor: '#f73657',
          },
        }}
      >
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

// Define PropTypes
ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,           // Dialog visibility, required
  onClose: PropTypes.func.isRequired,        // Function to close dialog, required
  onConfirm: PropTypes.func.isRequired,      // Function to confirm action, required
  message: PropTypes.string.isRequired,      // Message to display, required
};

// Optional: Default props (not strictly necessary here, but included for completeness)
ConfirmationDialog.defaultProps = {
  open: false,
  onClose: () => {},
  onConfirm: () => {},
  message: 'Are you sure you want to proceed?',
};

export default ConfirmationDialog;