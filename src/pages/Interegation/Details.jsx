import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowBack,
  CheckCircle,
  ExpandLess,
  ExpandMore,
  OpenInNew,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  Grid,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  MenuItem,
  Divider,
  Paper,
  Avatar,
  Tooltip,
  Fade,
  LinearProgress,
} from '@mui/material';

export default function IntegrationDetail() {
  const { name } = useParams();
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // Integration data
  const integrations = {
    paypal: {
      id: 'paypal',
      name: 'PayPal',
      description: 'Securely accept payments and transfer funds globally with ease.',
      longDescription:
        'PayPal offers a trusted platform for global payments, supporting multiple currencies and secure transactions for businesses of all sizes.',
      logoUrl: 'https://www.freepnglogos.com/uploads/paypal-logo-png-2.png',
      category: 'payment',
      popular: true,
      features: ['Global Reach', 'Instant Payments', 'Secure Transactions'],
      status: 'connected',
      configFields: [
        { name: 'API Key', type: 'password', required: true },
        { name: 'Client ID', type: 'text', required: true },
        { name: 'Environment', type: 'select', options: ['Sandbox', 'Production'], required: true },
      ],
      documentationUrl: 'https://developer.paypal.com/docs/',
    },
    cashfree: {
      id: 'cashfree',
      name: 'Cashfree',
      description: "India's leading payment gateway with seamless integration.",
      longDescription:
        'Cashfree provides a robust payment gateway tailored for the Indian market, with support for UPI, cards, and multi-currency transactions.',
      logoUrl: 'https://logowik.com/content/uploads/images/cashfree-payments7934.logowik.com.webp',
      category: 'payment',
      popular: true,
      features: ['UPI Support', 'Quick Setup', 'Multi-Currency'],
      configFields: [
        { name: 'App ID', type: 'text', required: true },
        { name: 'Secret Key', type: 'password', required: true },
        { name: 'Mode', type: 'select', options: ['Test', 'Production'], required: true },
      ],
      documentationUrl: 'https://docs.cashfree.com/',
    },
    email: {
      id: 'email',
      name: 'Email Integration',
      description: 'Automate notifications with your preferred email service.',
      longDescription:
        'Connect your email service to send automated notifications, personalized campaigns, and real-time alerts with ease.',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
      category: 'communication',
      popular: false,
      features: ['Automated Emails', 'Custom Templates', 'Real-Time Alerts'],
      configFields: [
        { name: 'SMTP Host', type: 'text', required: true },
        { name: 'SMTP Port', type: 'number', required: true },
        { name: 'Username', type: 'text', required: true },
        { name: 'Password', type: 'password', required: true },
        { name: 'From Email', type: 'email', required: true },
      ],
      documentationUrl: 'https://example.com/email-docs',
    },
    stripe: {
      id: 'stripe',
      name: 'Stripe',
      description: 'Power your online business with robust payment solutions.',
      longDescription:
        'Stripe provides comprehensive payment processing with support for subscriptions, fraud prevention, and seamless API integration.',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
      category: 'payment',
      popular: true,
      features: ['Subscription Billing', 'Fraud Protection', 'API Integration'],
      status: 'connected',
      configFields: [
        { name: 'API Key', type: 'password', required: true },
        { name: 'Webhook Secret', type: 'password', required: false },
        { name: 'Account ID', type: 'text', required: true },
      ],
      documentationUrl: 'https://stripe.com/docs',
    },
    mailchimp: {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Boost your marketing with powerful email automation tools.',
      longDescription:
        'Mailchimp empowers businesses with advanced email marketing, audience segmentation, and detailed campaign analytics.',
      logoUrl:
        'https://eep.io/images/yzco4xsimv0y/10ZRu9hZ1QQ5u1QQMu7qN1/57f679c6e8f6dd60a01d54f870fae6b7/MC_50-50_-_Brand_Assets_03.png?w=1960&fm=avif&q=60',
      category: 'communication',
      popular: false,
      features: ['Campaign Analytics', 'Audience Segmentation', 'Email Designer'],
      configFields: [
        { name: 'API Key', type: 'password', required: true },
        { name: 'List ID', type: 'text', required: true },
      ],
      documentationUrl: 'https://mailchimp.com/developer/',
    },
    google: {
      id: 'google',
      name: 'Google Services',
      description: "Leverage Google's APIs for enhanced app functionality.",
      longDescription:
        "Integrate with Google's suite of APIs to access cloud services, analytics, and powerful tools for your application.",
      logoUrl: 'https://img.icons8.com/?size=100&id=TrfQakUG7cDq&format=png&color=000000',
      category: 'service',
      popular: true,
      features: ['Cloud Integration', 'Analytics', 'API Access'],
      status: 'connected',
      configFields: [
        { name: 'API Key', type: 'password', required: true },
        { name: 'Project ID', type: 'text', required: true },
      ],
      documentationUrl: 'https://developers.google.com/',
    },
    slack: {
      id: 'slack',
      name: 'Slack',
      description: 'Streamline team communication with real-time notifications.',
      longDescription:
        'Slack enhances team collaboration with real-time messaging, channel-based communication, and integration with your favorite tools.',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg',
      category: 'communication',
      popular: false,
      features: ['Team Collaboration', 'Real-Time Alerts', 'Channel Integration'],
      configFields: [
        { name: 'Bot Token', type: 'password', required: true },
        { name: 'Channel ID', type: 'text', required: true },
      ],
      documentationUrl: 'https://api.slack.com/',
    },
    zapier: {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows by connecting your apps effortlessly.',
      longDescription:
        'Zapier connects your apps to automate repetitive tasks, enabling no-code workflows and seamless app integrations.',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/zapier-1.svg',
      category: 'automation',
      popular: true,
      features: ['App Connectivity', 'Workflow Automation', 'No-Code Setup'],
      configFields: [
        { name: 'API Key', type: 'password', required: true },
        { name: 'Zap ID', type: 'text', required: false },
      ],
      documentationUrl: 'https://zapier.com/developer',
    },
  };

  // Get current integration based on ID
  const currentIntegration = integrations[name] || null;

  // Set connection status based on integration data
  useEffect(() => {
    if (currentIntegration && currentIntegration.status === 'connected') {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
    setError(currentIntegration ? null : 'Integration not found');
  }, [name, currentIntegration]);

  // Show notification toast
  const showToast = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  // Simulate connecting to the integration
  const handleConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      showToast(`Successfully connected to ${currentIntegration.name}`);
    }, 1500);
  };

  // Simulate disconnecting from the integration
  const handleDisconnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(false);
      setIsLoading(false);
      showToast(`Disconnected from ${currentIntegration.name}`, 'info');
    }, 1000);
  };

  // Handle save configuration
  const handleSaveConfig = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Configuration saved successfully');
    }, 1200);
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'payment':
        return { light: '#E3F2FD', main: '#2196F3' };
      case 'communication':
        return { light: '#E8F5E9', main: '#4CAF50' };
      case 'service':
        return { light: '#FFF3E0', main: '#FF9800' };
      case 'automation':
        return { light: '#F3E5F5', main: '#9C27B0' };
      default:
        return { light: '#F5F5F5', main: '#757575' };
    }
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: '#FFF5F5',
            border: '1px solid #FFCDD2',
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The integration you're looking for doesn't seem to exist.
          </Typography>
          <Button
            component={Link}
            to="/integration"
            startIcon={<ArrowBack />}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Back to Integrations
          </Button>
        </Paper>
      </Container>
    );
  }

  // Category details
  const categoryColors = getCategoryColor(currentIntegration?.category);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFC', py: 4, width: '100%' }}>
      {/* Notification Toast */}
      <Fade in={showNotification}>
        <Alert
          severity={notificationType}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            minWidth: 300,
          }}
          onClose={() => setShowNotification(false)}
        >
          {notificationMessage}
        </Alert>
      </Fade>

      {/* Loading Bar */}
      {isLoading && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 4,
          }}
        />
      )}

      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          component={Link}
          to="/integration"
          startIcon={<ArrowBack />}
          variant="text"
          color="primary"
          sx={{ mb: 4, fontWeight: 500, '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' } }}
        >
          Back to Integrations
        </Button>

        <Grid container spacing={4}>
          {/* Main Content Column */}
          <Grid item xs={12} md={8}>
            {/* Integration Header Card */}
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Box
                sx={{
                  p: 0.5,
                  bgcolor: categoryColors.light,
                  borderBottom: `3px solid ${categoryColors.main}`,
                }}
              />
              <Box sx={{ p: 4 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item>
                    <Avatar
                      variant="rounded"
                      src={currentIntegration?.logoUrl}
                      alt={`${currentIntegration?.name} logo`}
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: 'white',
                        border: '1px solid rgba(0,0,0,0.08)',
                        p: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    />
                  </Grid>
                  <Grid item xs>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h4" fontWeight="700" color="text.primary">
                        {currentIntegration?.name}
                      </Typography>
                      {currentIntegration?.popular && (
                        <Chip
                          label="Popular"
                          color="primary"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1,
                            bgcolor: categoryColors.main,
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                      )}
                      <Chip
                        label={currentIntegration?.category}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 1,
                          bgcolor: categoryColors.light,
                          color: categoryColors.main,
                          border: `1px solid ${categoryColors.main}`,
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </Box>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                      {currentIntegration?.description}
                    </Typography>
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 3,
                  }}
                >
                  <Button
                    href={currentIntegration?.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                    sx={{
                      color: categoryColors.main,
                      fontWeight: 600,
                      '&:hover': { bgcolor: `${categoryColors.light}80` },
                    }}
                  >
                    Documentation
                  </Button>
                  {isConnected ? (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDisconnect}
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={16} color="error" /> : null}
                      sx={{
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      {isLoading ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleConnect}
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
                      sx={{
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        bgcolor: categoryColors.main,
                        '&:hover': { bgcolor: `${categoryColors.main}DD` },
                      }}
                    >
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </Box>
                {isConnected && (
                  <Alert
                    icon={<CheckCircle />}
                    severity="success"
                    variant="outlined"
                    sx={{ mt: 3, borderRadius: 2 }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      Connected successfully to {currentIntegration?.name}
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Paper>

            {/* About Section */}
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  About {currentIntegration?.name}
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Typography variant="body1" color="text.secondary" lineHeight={1.8} sx={{ mb: 3 }}>
                  {currentIntegration?.longDescription}
                </Typography>
              </Box>
            </Paper>

            {/* Configuration Section */}
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 3,
                  borderBottom: isConfigExpanded ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
                }}
                onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              >
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Configuration Settings
                </Typography>
                <IconButton size="small">
                  {isConfigExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <Collapse in={isConfigExpanded}>
                <Box sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    {currentIntegration?.configFields?.map((field, index) => (
                      <Box key={index}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                          sx={{ mb: 1 }}
                        >
                          {field.name}
                          {field.required && (
                            <Typography
                              component="span"
                              color="error"
                              sx={{ ml: 0.5, fontWeight: 600 }}
                            >
                              *
                            </Typography>
                          )}
                        </Typography>
                        {field.type === 'select' ? (
                          <TextField
                            select
                            fullWidth
                            defaultValue={field.options[0]}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          >
                            {field.options.map((option, idx) => (
                              <MenuItem key={idx} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            type={field.type}
                            fullWidth
                            placeholder={`Enter your ${field.name.toLowerCase()}`}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </Stack>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveConfig}
                    disabled={isLoading}
                    sx={{
                      mt: 4,
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 3,
                      bgcolor: categoryColors.main,
                      '&:hover': { bgcolor: `${categoryColors.main}DD` },
                    }}
                  >
                    Save Configuration
                  </Button>
                </Box>
              </Collapse>
            </Paper>
          </Grid>

          {/* Sidebar Column */}
          <Grid item xs={12} md={4}>
            {/* Status Card */}
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Connection Status
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isConnected ? '#caedb9' : '#edc7af',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: isConnected ? 'success.dark' : 'warning.main',
                      mr: 1.5,
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={isConnected ? 'success.dark' : 'warning.dark'}
                  >
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {isConnected
                    ? `Your account is successfully connected to ${currentIntegration?.name}.`
                    : `Connect your account to ${currentIntegration?.name} to start using this integration.`}
                </Typography>
                {isConnected ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDisconnect}
                    disabled={isLoading}
                    fullWidth
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 },
                    }}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConnect}
                    disabled={isLoading}
                    fullWidth
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      bgcolor: categoryColors.main,
                      '&:hover': { bgcolor: `${categoryColors.main}DD` },
                    }}
                  >
                    Connect Now
                  </Button>
                )}
              </Box>
            </Paper>

            {/* Features Card */}
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 3,
                  borderBottom: isFeaturesExpanded ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
                }}
                onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
              >
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Features & Capabilities
                </Typography>
                <IconButton size="small">
                  {isFeaturesExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <Collapse in={isFeaturesExpanded}>
                <Box sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {currentIntegration?.features.map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'background.default',
                          border: '1px solid rgba(0,0,0,0.05)',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <CheckCircle
                          sx={{ color: categoryColors.main, mr: 1.5, fontSize: 18 }}
                        />
                        <Typography variant="body2" fontWeight={500} color="text.primary">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Collapse>
            </Paper>

            {/* Quick Navigation Card */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  bgcolor: categoryColors.light,
                }}
              >
                <Typography variant="h6" fontWeight={600} color={categoryColors.main}>
                  More Integrations
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  {Object.keys(integrations)
                    .filter((key) => key !== name)
                    .slice(0, 6)
                    .map((key) => (
                      <Grid item xs={4} key={key}>
                        <Tooltip title={integrations[key].name} arrow placement="top">
                          <Paper
                            elevation={0}
                            onClick={() => window.history.pushState({}, '', `/integrations/${key}`)}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: '1px solid rgba(0,0,0,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 64,
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <Box
                              component="img"
                              src={integrations[key].logoUrl}
                              alt={integrations[key].name}
                              sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          </Paper>
                        </Tooltip>
                      </Grid>
                    ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Button
                  component={Link}
                  to="/integration"
                  color="primary"
                  fullWidth
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    p: 1.5,
                    textTransform: 'none',
                  }}
                >
                  View All Integrations
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}