import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLogin } from 'react-icons/ai'; // Icon for Login button
import { borderRadius } from '@mui/system';

function TokenExpire() {
  const [open, setOpen] = React.useState(true);  // Modal is open by default
  const navigate = useNavigate();  // Hook to navigate to the login page

  // Handle redirect to login page
  const handleRedirectToLogin = () => {
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        // Prevent closing when clicking outside
        if (reason === 'backdropClick') {
          e.preventDefault();
        }
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        borderRadius: 2,
        boxShadow: 24,
        backdropFilter: 'blur(10px)', // Glassmorphism effect
        transition: 'all 0.3s ease-in-out',
      }}
      PaperProps={{sx: {borderRadius:3, width: '60vh', background: 'linear-gradient(135deg, #00796b, #1de9b6)'}}}
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          textAlign: 'center',
          color: '#fff',
          fontFamily: '"Roboto", sans-serif', // Modern font
          fontWeight: '600',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          py: 3,
        }}
      >
        <Typography variant="h5" component="div">
          Session Expired or Unauthorized
        </Typography>
      </DialogTitle>



      <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
        <Button
          onClick={handleRedirectToLogin}
          variant="contained"
          color="primary"
          sx={{
            padding: '14px 35px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600,
            fontFamily: '"Roboto", sans-serif',  // Consistent font for buttons
            textTransform: 'none',
            borderRadius: '30px',  // Smooth rounded button
            boxShadow: 3,           // Elevated shadow
            background: '#f44336',  // Bright red for action
            '&:hover': {
              background: '#d32f2f', // Darker red on hover
              boxShadow: 6,           // Stronger shadow on hover
            },
            transition: 'all 0.3s ease', // Smooth transition for hover effect
          }}
          startIcon={<AiOutlineLogin />}
        >
          Go to Login
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TokenExpire;
