import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Grid,
  Button,
  Typography,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard,
  TableChart,
  Event,
  Description,
  CalendarToday,
  ChatBubble,
  WifiPassword,
  CheckCircle,
  Error,
  Payment,
  LocalAtm,
  LogoutTwoTone,
  Login
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useAuth } from '../middlewares/auth';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePost } from '../hooks/useApi';

const Navbar = () => {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const routes = [
    { path: '/', name: 'Dashboard', icon: <Dashboard />, section: 'Menu' },
    { path: '/profileattendance', name: 'Attendance', icon: <TableChart />, section: 'Menu' },
    { path: '/Document', name: 'Documents', icon: <Description />, section: 'Employee' },
    { path: '/calendar', name: 'Calendar', icon: <CalendarToday />, section: 'Menu' },
    { path: '/profileleave', name: 'Leave', icon: <Event />, section: 'Employee' },
    { path: '/profilepayroll', name: 'Payroll', icon: <Payment />, section: 'Employee'},
    { path: '/reimbursement', name: 'Reimbursement', icon: <LocalAtm />, section: 'Employee'}
  ];

  const pathToIndex = routes.reduce((acc, route, index) => ({
    ...acc,
    [route.path]: index,
  }), {});

  useEffect(() => {
    const currentPath = location.pathname;
    const index = pathToIndex[currentPath];
    if (index !== undefined) {
      setSelectedIndex(index);
    }
  }, [location.pathname]);

  const handleListItemClick = (index) => {
    setSelectedIndex(index);
  };

  const createIp = usePost('/company/policy/ip-address-create');
  const getPublicIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error retrieving public IP:', error);
      return null;
    }
  };

  const createIpProtocal = async () => {
    setLoading(true);
    setSuccess(false);
    setError(false);
    try {
      const publicIp = await getPublicIp();
      if (!publicIp) throw new Error('Failed to retrieve public IP address');
      const apiResponse = await createIp.mutateAsync({ routerIp: publicIp });
      if (apiResponse?.data !== null) {
        setSuccess(true);
        setSnackbarMessage('IP Protocol created successfully!');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage(apiResponse?.error?.error || 'Failed to create IP Protocol');
        setSnackbarSeverity('error');
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const NavbarContainer = styled(motion.div)(({ theme }) => ({
    width: '220px', // Fixed width for always expanded state
    borderRight: `1px solid ${theme.palette.divider}`,
    height: '100vh',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 47, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
  }));

  const ListItemStyled = styled(motion(ListItem))(({ theme, active }) => ({
    borderRadius: '8px',
    margin: '2px 20px',
    padding: '2.5px',
    background: active ? theme.palette.primary.main : 'transparent',
    color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
    '&:hover': {
      background: active ? theme.palette.primary.dark : 'rgba(200, 200, 200, 0.1)',
    },
    transition: 'all 0.2s ease',
  }));

  const IconContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    '& svg': {
      fontSize: '1.2rem',
      transition: 'color 0.2s ease',
    },
  }));

  const SectionHeader = styled(Typography)(({ theme }) => ({
    fontSize: '14px',
    fontWeight: 600,
    color: theme.palette.text.primary,
    padding: '5px 9px',
    marginTop: '16px', // Added for line spacing before each section
    textTransform: 'uppercase',
  }));

  const drawer = (
    <NavbarContainer
      initial={{ width: '220px' }}
      animate={{ width: '220px' }}
    >
      <List sx={{ flexGrow: 1, padding: '5px 0', overflow: 'hidden' }}>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          sx={{ padding: '5px', minHeight: '50px' }}
        >
          <motion.img
            src={
              theme.palette.mode === 'dark'
                ? 'https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darkLogo.png'
                : 'https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/logo.png'
            }
            alt="Logo"
            height="50px"
            width="50px"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#264c3d',
              ml: '8px',
            }}
          >
            {user?.loginId}
          </Typography>
        </Grid>

        <Grid container flexGrow={1} sx={{ overflow: 'hidden' }}>
          <SectionHeader>MENU</SectionHeader>
          {routes.map((route, index) => {
            if (route.section !== 'Menu') return null;
            return (
              <Link to={route.path} key={index} style={{ textDecoration: 'none' }}>
                <ListItemStyled
                  button
                  selected={selectedIndex === index}
                  onClick={() => handleListItemClick(index)}
                  active={selectedIndex === index ? 'true' : undefined}
                  whileHover={{ scale: 1.02 }}
                >
                  <IconContainer>
                    {React.cloneElement(route.icon, {
                      sx: {
                        color: selectedIndex === index ? '#ffffff' : 'rgb(176, 176, 176)',
                      },
                    })}
                  </IconContainer>
                  <ListItemText
                    primary={route.name}
                    sx={{
                      ml: 2,
                      '& .MuiListItemText-primary': {
                        color: selectedIndex === index ? '#ffffff' : 'rgb(176, 176, 176)',
                        fontSize: '0.9rem',
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                </ListItemStyled>
              </Link>
            );
          })}

          <SectionHeader>EMPLOYEE</SectionHeader>
          {routes.map((route, index) => {
            if (route.section !== 'Employee') return null;
            return (
              <Link to={route.path} key={index} style={{ textDecoration: 'none' }}>
                <ListItemStyled
                  button
                  selected={selectedIndex === index}
                  onClick={() => handleListItemClick(index)}
                  active={selectedIndex === index ? 'true' : undefined}
                  whileHover={{ scale: 1.02 }}
                >
                  <IconContainer>
                    {React.cloneElement(route.icon, {
                      sx: {
                        color: selectedIndex === index ? '#ffffff' : 'rgb(176, 176, 176)',
                      },
                    })}
                  </IconContainer>
                  <ListItemText
                    primary={route.name}
                    sx={{
                      ml: 2,
                      '& .MuiListItemText-primary': {
                        color: selectedIndex === index ? '#ffffff' : 'rgb(176, 176, 176)',
                        fontSize: '0.9rem',
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                </ListItemStyled>
              </Link>
            );
          })}

          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ padding: '5px', minHeight: '80px', mt: -1 }}
          >
            <motion.img
              src="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/support.png"
              alt="Support"
              height="50px"
              width="50px"
              whileHover={{ rotate: 10 }}
              transition={{ type: 'spring', stiffness: 200 }}
            />
            <Button
              startIcon={<ChatBubble />}
              sx={{
                textTransform: 'none',
                color: 'Black',
                mt: 1,
                '&:hover': { color: 'rgb(176, 176, 176)' },
              }}
            >
              Support
            </Button>
          </Grid>

          {(user?.role === 'Admin' || user?.role === 'superAdmin') && (
            <Grid container justifyContent="center" sx={{ padding: '5px' }}>
              <Button
                onClick={createIpProtocal}
                variant="contained"
                color="primary"
                startIcon={<WifiPassword />}
                disabled={loading}
                sx={{
                  borderRadius: '20px',
                  padding: '8px 16px',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  color: '#ffffff',
                  '&:hover': { bgcolor: '#1565c0' },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Create IP'}
              </Button>
            </Grid>
          )}
        </Grid>

        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ padding: '5px', minHeight: '50px', position: 'absolute', bottom: 4, width: '100%' }}
        >
          {user ? (
            <Button
              variant="outlined"
              onClick={logout}
              startIcon={<LogoutTwoTone />}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                minWidth: '150px',
                borderColor: theme.palette.divider,
                background: 'red',
                color: 'white'
              }}
            >
              Logout
            </Button>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                startIcon={<Login />}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  minWidth: '150px',
                  background: 'var(--background-bg-2)',
                  color: 'white',
                }}
              >
                Login
              </Button>
            </Link>
          )}
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            iconMapping={{
              success: <CheckCircle />,
              error: <Error />,
            }}
            sx={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
              bgcolor: snackbarSeverity === 'success' ? '#2e7d32' : '#d32f2f',
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </List>
    </NavbarContainer>
  );

  return <nav>{drawer}</nav>;
};

export default Navbar;                              