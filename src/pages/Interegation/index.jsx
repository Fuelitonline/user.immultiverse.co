import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  Modal, 
  Tab,
  Avatar,
  Divider,
  Fade,
  Paper,
  InputAdornment,
  Dialog,
  DialogContent
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { 
  Search, 
  Settings, 
  ArrowForward, 
  Close, 
  Notifications, 
  CheckCircle,
  AddCircleOutline
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';

function IntegrationShowcase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [openModal, setOpenModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const integrations = [
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Securely accept payments and transfer funds globally with ease.',
      longDescription: 'PayPal offers a trusted platform for global payments, supporting multiple currencies and secure transactions for businesses of all sizes.',
      logoUrl: 'https://www.freepnglogos.com/uploads/paypal-logo-png-2.png',
      category: 'payment',
      popular: true,
      features: ['Global Reach', 'Instant Payments', 'Secure Transactions'],
      status: 'connected'
    },
    {
      id: 'cashfree',
      name: 'Cashfree',
      description: `India's leading payment gateway with seamless integration.`,
      longDescription: 'Cashfree provides a robust payment gateway tailored for the Indian market, with support for UPI, cards, and multi-currency transactions.',
      logoUrl: 'https://logowik.com/content/uploads/images/cashfree-payments7934.logowik.com.webp',
      category: 'payment',
      popular: true,
      features: ['UPI Support', 'Quick Setup', 'Multi-Currency'],
    },
    {
      id: 'email',
      name: 'Email Integration',
      description: 'Automate notifications with your preferred email service.',
      longDescription: 'Connect your email service to send automated notifications, personalized campaigns, and real-time alerts with ease.',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png',
      category: 'communication',
      popular: false,
      features: ['Automated Emails', 'Custom Templates', 'Real-Time Alerts'],
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Power your online business with robust payment solutions.',
      longDescription: 'Stripe provides comprehensive payment processing with support for subscriptions, fraud prevention, and seamless API integration.',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
      category: 'payment',
      popular: true,
      features: ['Subscription Billing', 'Fraud Protection', 'API Integration'],
      status: 'connected'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Boost your marketing with powerful email automation tools.',
      longDescription: 'Mailchimp empowers businesses with advanced email marketing, audience segmentation, and detailed campaign analytics.',
      logoUrl: 'https://eep.io/images/yzco4xsimv0y/10ZRu9hZ1QQ5u1QQMu7qN1/57f679c6e8f6dd60a01d54f870fae6b7/MC_50-50_-_Brand_Assets_03.png?w=1960&fm=avif&q=60',
      category: 'communication',
      popular: false,
      features: ['Campaign Analytics', 'Audience Segmentation', 'Email Designer'],
    },
    {
      id: 'google',
      name: 'Google Services',
      description: `Leverage Google's APIs for enhanced app functionality.`,
      longDescription: `Integrate with Google's suite of APIs to access cloud services, analytics, and powerful tools for your application.`,
      logoUrl: 'https://img.icons8.com/?size=100&id=TrfQakUG7cDq&format=png&color=000000',
      category: 'service',
      popular: true,
      features: ['Cloud Integration', 'Analytics', 'API Access'],
      status: 'connected'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Streamline team communication with real-time notifications.',
      longDescription: 'Slack enhances team collaboration with real-time messaging, channel-based communication, and integration with your favorite tools.',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg',
      category: 'communication',
      popular: false,
      features: ['Team Collaboration', 'Real-Time Alerts', 'Channel Integration'],
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows by connecting your apps effortlessly.',
      longDescription: 'Zapier connects your apps to automate repetitive tasks, enabling no-code workflows and seamless app integrations.',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/zapier-1.svg',
      category: 'automation',
      popular: true,
      features: ['App Connectivity', 'Workflow Automation', 'No-Code Setup'],
    },
  ];

  const categories = {
    'all': 'All',
    'payment': 'Payment',
    'communication': 'Communication',
    'service': 'Service',
    'automation': 'Automation'
  };

  const filteredIntegrations = integrations.filter(integration =>
    (tabValue === 'all' || integration.category === tabValue) &&
    (integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     integration.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const popularIntegrations = integrations.filter(integration => integration.popular);
  
  const connectedIntegrations = integrations.filter(integration => integration.status === 'connected');

  const handleOpenModal = (integration) => {
    setSelectedIntegration(integration);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedIntegration(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ 
      bgcolor: '#f8fafd', 
      minHeight: '100vh',
      position:'relative',
      width:'100%',
      pb: 8,
      pt: 2
    }}>
        <Dialog

          open={openModal}
          onClose={handleCloseModal}
          closeAfterTransition
        >
           <DialogContent>
            <Box
              sx={{
                width: { xs: '90%', sm: 500 },
                maxWidth: 500,
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
              }}
            >
              {selectedIntegration && (
                <>
                  <Box sx={{ 
                    bgcolor: alpha('#4F46E5', 0.05), 
                    py: 3, 
                    px: 3, 
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    <img
                      src={selectedIntegration.logoUrl}
                      alt={`${selectedIntegration.name} logo`}
                      style={{ 
                        width: 'min-contant', 
                        height: 56,
                        bgcolor: 'white',
                        padding: '8px',
                        mr: 2
                      }}
                      variant="rounded"
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedIntegration.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {selectedIntegration.category.charAt(0).toUpperCase() + selectedIntegration.category.slice(1)}
                      </Typography>
                    </Box>
                    <IconButton 
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: '#64748b',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '&:hover': {
                          backgroundColor: 'white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        }
                      }} 
                      onClick={handleCloseModal}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 3, color: '#334155' }}>
                      {selectedIntegration.longDescription}
                    </Typography>
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#0f172a' }}>
                      Key Features
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                      {selectedIntegration.features.map((feature, idx) => (
                        <Chip 
                          key={idx} 
                          label={feature} 
                          sx={{ 
                            bgcolor: alpha('#4F46E5', 0.1),
                            color: '#4F46E5',
                            fontWeight: 500,
                          }} 
                        />
                      ))}
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      {selectedIntegration.status === 'connected' ? (
                        <>
                          <Button
                            variant="outlined"
                            color="error"
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 500,
                              px: 3
                            }}
                          >
                            Disconnect
                          </Button>
                          <Button
                            variant="contained"
                            component={Link}
                            to={`/integration/${selectedIntegration?.id?.toLowerCase()}`}
                            sx={{ 
                              bgcolor: '#4F46E5',
                              '&:hover': { bgcolor: '#4338ca' },
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 3,
                              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'                            }}
                          >
                            Configure
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<AddCircleOutline />}
                          component={Link}
                            to={`/integration/${selectedIntegration?.id?.toLowerCase()}`}
                          sx={{ 
                            bgcolor: '#4F46E5',
                            '&:hover': { bgcolor: '#4338ca' },
                            
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                          }}
                        >
                          Connect
                        </Button>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      <Container maxWidth="lg">


        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 3, 
                bgcolor: 'white', 
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }
              }
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent'
                },
                '&:hover fieldset': {
                  borderColor: 'transparent'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                  borderWidth: 1
                }
              }
            }}
          />
        </Box>

        {/* Tabs & Content */}
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <TabList 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { 
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  minWidth: 'auto',
                  px: 3,
                  py: 1.5
                },
                '& .Mui-selected': {
                  color: '#4F46E5',
                  fontWeight: 600
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4F46E5',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {Object.entries(categories).map(([key, label]) => (
                <Tab key={key} label={label} value={key} />
              ))}
            </TabList>
          </Box>

          {/* Connected Integrations */}
          {connectedIntegrations.length > 0 && tabValue === 'all' && (
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  Connected Integrations
                </Typography>
                <Button 
                  variant="text" 
                  size="small"
                  sx={{ 
                    color: '#4F46E5',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Manage all
                </Button>
              </Box>
              <Grid container spacing={3}>
                {connectedIntegrations.map(integration => (
                  <Grid item xs={12} sm={6} md={4} key={`connected-${integration.id}`}>
                    <Card
                      sx={{ 
                        borderRadius: 3,
                        minHeight : '30vh',
                         bgcolor:'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        p: 0,
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleOpenModal(integration)}
                    >
                      <Box sx={{ p: 2.5, display: 'flex', flexDirection:'column', gap:1,alignItems: 'center' }}>
                        <img
                          src={integration.logoUrl}
                          alt={`${integration.name} logo`}
                          style={{ 
                            width:'min-contant',
                            height: 88,
                            bgcolor: 'white',
                            padding: '6px',
                            mr: 2,
                          }}
                          variant="rounded"
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              {integration.name}
                            </Typography>
                            <Chip 
                              icon={<CheckCircle sx={{ fontSize: 14 }} />}
                              label="Connected" 
                              size="small" 
                              sx={{ 
                                ml: 1.5,
                                bgcolor: alpha('#22c55e', 0.1),
                                color: '#16a34a',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                '& .MuiChip-icon': {
                                  color: '#16a34a'
                                }
                              }} 
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, lineHeight: 1.3 }}>
                            {integration.description}
                          </Typography>
                        </Box>
                        <IconButton size="small" sx={{ ml: 1, color: '#94a3b8' }}>
                          <ArrowForward fontSize="small" />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Popular Integrations */}
          {tabValue === 'all' && (
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  Popular Integrations
                </Typography>
                <Button 
                  variant="text" 
                  size="small"
                  sx={{ 
                    color: '#4F46E5',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  View all
                </Button>
              </Box>
              <Grid container spacing={3}>
                {popularIntegrations.slice(0, 3).map(integration => (
                  <Grid item xs={12} sm={6} md={4} key={`popular-${integration.id}`}>
                    <Card
                      sx={{ 
                        bgcolor:'white',
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        minHeight : '40vh',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleOpenModal(integration)}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                         <Box sx={{ p: 2.5, display: 'flex', flexDirection:'column', gap:1,alignItems: 'center' }}>
                          <img
                            src={integration.logoUrl}
                            alt={`${integration.name} logo`}
                            style={{ 
                             width:'min-contant',
                            height: 88,
                            bgcolor: 'white',
                            padding: '6px',
                            mr: 2,
                            }}
                            variant="rounded"
                          />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                {integration.name}
                              </Typography>
                              {integration.status === 'connected' && (
                                <Chip 
                                  icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                  label="Connected" 
                                  size="small" 
                                  sx={{ 
                                    ml: 1.5,
                                    bgcolor: alpha('#22c55e', 0.1),
                                    color: '#16a34a',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    '& .MuiChip-icon': {
                                      color: '#16a34a'
                                    }
                                  }} 
                                />
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 400 }}>
                              {integration.category.charAt(0).toUpperCase() + integration.category.slice(1)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
                          {integration.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {integration.features.slice(0, 3).map((feature, idx) => (
                            <Chip 
                              key={idx} 
                              label={feature} 
                              size="small" 
                              sx={{ 
                                bgcolor: alpha('#4F46E5', 0.1),
                                color: '#4F46E5',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }} 
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* All Integrations */}
          <TabPanel value={tabValue} sx={{ p: 0 }}>
            <Grid container spacing={3}>
              {filteredIntegrations.map(integration => (
                <Grid item xs={12} sm={6} md={4} key={integration.id}>
                  <Fade in timeout={300}>
                    <Card
                      sx={{ 
                        borderRadius: 3,
                        minHeight : '40vh',
                         bgcolor:'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleOpenModal(integration)}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                             <Box sx={{ p: 2.5, display: 'flex', flexDirection:'column', gap:1,alignItems: 'center' }}>
                          <img
                            src={integration.logoUrl}
                            alt={`${integration.name} logo`}
                            style={{ 
                              width:'min-contant',
                            height: 88,
                            bgcolor: 'white',
                            padding: '6px',
                            mr: 2,
                            }}
                            variant="rounded"
                          />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                {integration.name}
                              </Typography>
                              {integration.status === 'connected' && (
                                <Chip 
                                  icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                  label="Connected" 
                                  size="small" 
                                  sx={{ 
                                    ml: 1.5,
                                    bgcolor: alpha('#22c55e', 0.1),
                                    color: '#16a34a',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    '& .MuiChip-icon': {
                                      color: '#16a34a'
                                    }
                                  }} 
                                />
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 400 }}>
                              {integration.category.charAt(0).toUpperCase() + integration.category.slice(1)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
                          {integration.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {integration.features.slice(0, 3).map((feature, idx) => (
                            <Chip 
                              key={idx} 
                              label={feature} 
                              size="small" 
                              sx={{ 
                                bgcolor: alpha('#4F46E5', 0.1),
                                color: '#4F46E5',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }} 
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
              
              {/* Add New Integration Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    height: '100%',
                    border: '2px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(241, 245, 249, 0.5)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.08)',
                      bgcolor: 'rgba(241, 245, 249, 0.8)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <AddCircleOutline sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#64748b' }}>
                      Add New Integration
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                      Browse the marketplace for more tools
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Empty State */}
              {filteredIntegrations.length === 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%',
                  py: 8
                }}>
                  <Box 
                    component="img" 
                    src="/api/placeholder/240/160" 
                    alt="No results" 
                    sx={{ width: 160, height: 160, opacity: 0.7, mb: 3 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155', mb: 1 }}>
                    No integrations found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3, textAlign: 'center', maxWidth: 400 }}>
                    We couldn't find any integrations matching your search. Try adjusting your filters or search term.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setSearchQuery('');
                      setTabValue('all');
                    }}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      color: '#4F46E5',
                      borderColor: '#4F46E5'
                    }}
                  >
                    Clear filters
                  </Button>
                </Box>
              )}
            </Grid>
          </TabPanel>
        </TabContext>

        {/* Modal for Integration Details */}
        
      </Container>
    </Box>
  );
}

export default IntegrationShowcase;