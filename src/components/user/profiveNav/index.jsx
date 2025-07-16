import { useEffect, useState } from 'react';
import { Notifications, School, Business, SwitchAccessShortcut, Person, Lock, Logout } from "@mui/icons-material";
import { Box, Grid, IconButton, Badge, Typography, useTheme, useMediaQuery, Paper, Dialog, DialogContent, DialogActions, Button, Avatar, Fade, Menu, MenuItem } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { CSSTransition } from 'react-transition-group';
import { useAuth } from '../../../middlewares/auth';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../../../theme/themeSwitcher';
import './index.css';

function ProfileNav() {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    setNotificationCount(4); // Simulate fetching notifications
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setNotificationCount(0);
  };

  const handleCloseNotification = () => {
    setShowNotifications(false);
  };

  const handleModeDialogOpen = () => {
    setShowModeDialog(true);
  };

  const handleModeDialogClose = () => {
    setShowModeDialog(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: '220px',
        right: 0,
        height: '70px',
        zIndex: 1100,
        background: '#fff',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: isSmDown ? '0.5rem 1rem' : '0.75rem 2rem',
        gap: '1rem',
      }}
      className="glass-effect"
    >
      <IconButton
        sx={{
          backgroundColor: theme.palette.grey[50],
          borderRadius: '50%',
          width: isSmDown ? '36px' : '40px',
          height: isSmDown ? '36px' : '40px',
          border: `1px solid ${theme.palette.grey[300]}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
            transform: 'scale(1.05)',
            boxShadow: `0 4px 12px ${theme.palette.grey[400]}30`,
          },
        }}
        onClick={handleModeDialogOpen}
      >
        <SwitchAccessShortcut sx={{ color: theme.palette.primary.main, fontSize: isSmDown ? '1.3rem' : '1.5rem' }} />
      </IconButton>

      <IconButton
        sx={{
          backgroundColor: theme.palette.grey[50],
          borderRadius: '50%',
          width: isSmDown ? '36px' : '40px',
          height: isSmDown ? '36px' : '40px',
          border: `1px solid ${theme.palette.grey[300]}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
            transform: 'scale(1.05)',
            boxShadow: `0 4px 12px ${theme.palette.grey[400]}30`,
          },
        }}
        onClick={handleNotificationClick}
      >
        <Badge
          badgeContent={notificationCount}
          color="error"
          overlap="circular"
          sx={{
            '.MuiBadge-dot': {
              borderRadius: '50%',
              height: '10px',
              width: '10px',
              top: '5px',
              right: '5px',
            },
          }}
        >
          <Notifications sx={{ color: theme.palette.primary.main, fontSize: isSmDown ? '1.3rem' : '1.5rem' }} />
        </Badge>
      </IconButton>

      <Grid
        container
        alignItems="center"
        sx={{
          width: 'auto',
          cursor: 'pointer',
        }}
        onClick={handleMenuOpen}
      >
        <Grid item>
          <Avatar
            src={user?.avatar || user?.name}
            alt="profile"
            sx={{
              width: isSmDown ? '32px' : '36px',
              height: isSmDown ? '32px' : '36px',
              border: `2px solid ${theme.palette.primary.main}`,
              backgroundColor: '#000',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: `0 4px 12px ${theme.palette.grey[400]}30`,
              },
            }}
          />
        </Grid>
        <Grid item>
          <Typography
            variant={isSmDown ? 'caption' : 'body2'}
            sx={{
              fontSize: isSmDown ? '0.85rem' : '1rem',
              fontWeight: 500,
              color: theme.palette.text.primary,
              ml: 1,
            }}
          >
            {user?.name || user?.companyName || 'User'}
          </Typography>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            mt: 1,
            width: isSmDown ? '200px' : '220px',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          component={Link}
          to="/profile"
          onClick={handleMenuClose}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          <Person sx={{ mr: 1, color: theme.palette.text.secondary }} />
          Profile
        </MenuItem>
        
        <MenuItem
          component={Link}
          to="/profilechange-password"
          onClick={handleMenuClose}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          <Lock sx={{ mr: 1, color: theme.palette.text.secondary }} />
          Change Password
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          <Logout sx={{ mr: 1, color: theme.palette.text.secondary }} />
          Logout
        </MenuItem>
      </Menu>

      <Grid item>
        <IconButton
          sx={{
            backgroundColor: theme.palette.grey[50],
            borderRadius: '50%',
            width: isSmDown ? '36px' : '40px',
            height: isSmDown ? '36px' : '40px',
            border: `1px solid ${theme.palette.grey[300]}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              transform: 'scale(1.05)',
              boxShadow: `0 4px 12px ${theme.palette.grey[400]}30`,
            },
          }}
        >
          <ThemeSwitcher />
        </IconButton>
      </Grid>

      <CSSTransition
        in={showNotifications}
        timeout={300}
        classNames="notification-tab"
        unmountOnExit
      >
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: '1rem',
            width: isSmDown ? '90vw' : '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            padding: '1rem',
            zIndex: 1200,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Notifications
            </Typography>
            <IconButton onClick={handleCloseNotification} size="small">
              <CloseIcon sx={{ fontSize: '1.25rem', color: theme.palette.text.secondary }} />
            </IconButton>
          </Box>
          <Box>
            {notificationCount > 0 ? (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                You have {notificationCount} new notifications.
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                No new notifications.
              </Typography>
            )}
            {[...Array(notificationCount || 1)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Notification {index + 1}: Sample message
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </CSSTransition>

      <Dialog
        open={showModeDialog}
        onClose={handleModeDialogClose}
        scroll="body"
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 400 }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          },
        }}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '20px',
            background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '600px',
            overflow: 'hidden',
            margin: isSmDown ? '1rem' : '2rem',
            position: 'absolute',
            top: '1rem',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'top',
            p: 2,
            borderBottom: `1px solid ${theme.palette.grey[200]}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              letterSpacing: '-0.02em',
            }}
          >
            Select Mode
          </Typography>
          <IconButton onClick={handleModeDialogClose} size="small">
            <CloseIcon sx={{ fontSize: '1.5rem', color: theme.palette.text.secondary }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 4, backgroundColor: theme.palette.background.default, display: 'flex', justifyContent: 'top' }}>
          <Grid container spacing={3} justifyContent="top" sx={{ maxWidth: '500px' }}>
            <Grid item xs={6}>
              <Link to="https://lms.immultiverse.co" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    borderRadius: '16px',
                    background: `linear-gradient(145deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.default} 100%)`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: `1px solid ${theme.palette.grey[200]}`,
                    '&:hover': {
                      background: theme.palette.primary.light,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 6px 16px ${theme.palette.grey[400]}40`,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: isSmDown ? '56px' : '72px',
                      height: isSmDown ? '56px' : '72px',
                      backgroundColor: theme.palette.grey[100],
                      border: `2px solid ${theme.palette.primary.main}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light,
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <School sx={{ color: theme.palette.primary.main, fontSize: isSmDown ? '2.2rem' : '2.8rem' }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      textAlign: 'center',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    LMS
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      fontSize: isSmDown ? '0.75rem' : '0.875rem',
                    }}
                  >
                    Learning Management System
                  </Typography>
                </Box>
        
              </Link>
            </Grid>
            <Grid item xs={6}>
              <Link to="https://hrm.immultiverse.co" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    borderRadius: '16px',
                    background: `linear-gradient(145deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.default} 100%)`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: `1px solid ${theme.palette.grey[200]}`,
                    '&:hover': {
                      background: theme.palette.primary.light,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 6px 16px ${theme.palette.grey[400]}40`,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: isSmDown ? '56px' : '72px',
                      height: isSmDown ? '56px' : '72px',
                      backgroundColor: theme.palette.grey[100],
                      border: `2px solid ${theme.palette.primary.main}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light,
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Business sx={{ color: theme.palette.primary.main, fontSize: isSmDown ? '2.2rem' : '2.8rem' }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      textAlign: 'center',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    HRM
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      fontSize: isSmDown ? '0.75rem' : '0.875rem',
                    }}
                  >
                    Human Resource Management
                  </Typography>
                </Box>
              </Link>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end', backgroundColor: theme.palette.background.paper }}>
          <Button
            onClick={handleModeDialogClose}
            sx={{
              textTransform: 'none',
              color: '#fff',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '8px',
              padding: '8px 24px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: `0 4px 12px ${theme.palette.grey[400]}30`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProfileNav;