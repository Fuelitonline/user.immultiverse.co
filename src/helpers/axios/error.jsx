// ErrorBoundary.js
import React, { Component } from 'react';
import { Typography, Button, Box, Container } from '@mui/material';

// ErrorFallback component with an online free image
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Container
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        maxWidth: 400,
        marginBottom: 3,
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1593642532973-d31b6557f36d" // Free image URL from Unsplash
        alt="Error"
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
        }}
      />
    </Box>
    <Typography variant="h4" color="error" gutterBottom>
      Oops! Something went wrong.
    </Typography>
    <Typography variant="body1" color="textSecondary" gutterBottom>
      {error.message || 'An unexpected error occurred. Please try again later.'}
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={resetErrorBoundary}
      sx={{ marginTop: 2 }}
    >
      Try Again
    </Button>
  </Container>
);

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error to an error reporting service here
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
