


import { useEffect, useState, useRef } from 'react';
import { Notifications, SwitchAccessShortcut, Person, Lock, Logout } from "@mui/icons-material";
import { Box, Grid, IconButton, Badge, Typography, useTheme, useMediaQuery, Paper, Avatar, Menu, MenuItem, Fade, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { CSSTransition } from 'react-transition-group';
import './index.css';
import { useAuth } from '../../../middlewares/auth';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../../../theme/themeSwitcher';
import Announcement from '../../announcement/Announcement';
import { socket } from "../../../utils/socket";
import axios from "axios";
import { School, Business } from "@mui/icons-material";
import { server_url } from '../../../utils/server';



const BASE_LMS_URL = import.meta.env.VITE_LMS_URL || "https://lms.immultiverse.co";
const BASE_HRM_URL = import.meta.env.VITE_HRM_URL || "https://hr.immultiverse.co";
const BASE_API_URL = import.meta.env.VITE_SERVER_URL || server_url; 
// const NOTIFICATION_SOUND_PATH = "/sound/notification.mp3";
const NOTIFICATION_SOUND_PATH = "/sound/notification.mp3";

function ProfileNav() {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const audioRef = useState(new Audio(NOTIFICATION_SOUND_PATH))[0];
  const notificationTabRef = useRef(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${server_url}/notification/get-notifications`, {
       
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  
      });
      setNotifications(res.data?.data || []);
      const unreadCount = (res.data?.data || []).filter(n => !n.isRead).length;
      setNotificationCount(unreadCount);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  // ✅ Mark notifications as read
  const markAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
      if (unreadIds.length === 0) return;

   await axios.post(
  `${server_url}/notification/read-notifications`,
  { notificationIds: unreadIds },
  { 
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  }
);


      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);
    } catch (err) {
      console.error("Error marking notifications as read", err);
    }
  };

  // ✅ Load initial notifications + Socket setup
  useEffect(() => {
    if (!user?._id) return;

    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission !== "granted") {
          console.log("Notification permission not granted. System notifications will not be shown.");
        }
      });
    }

    fetchNotifications();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinRoom", user._id);

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("new-notification", (notif) => {
      audioRef.play().catch(e => console.error("Error playing sound:", e));

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notif.message.split(":")[0] || "New Notification", {
          body: notif.message,
          icon: '/images/logo.png'
        });
      }

      setNotifications((prev) => [notif, ...prev]);
      setNotificationCount((prev) => prev + 1);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socket.off("new-notification");
    };
  }, [token, user]);

  const handleNotificationClick = () => {
    setShowNotifications(true);
    markAsRead();
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
    <Box sx={{ height: '120px' }} > {/* Spacer to offset fixed nav */}
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: '220px',
        right: 0,
        height: '50px',
        zIndex: 9999,
        background: '#fff',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '1rem',
      }}
      className="glass-effect"
    >
      <Announcement limit={3} showNav={false} />
    </Box>
    <Box
      sx={{
        position: 'fixed',
        top: 50,
        left: '220px',
        right: 0,
        height: '70px',
        zIndex: 1,
        marginBottom: '2rem',
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
      {/* 🔔 Mode Switcher Icon */}
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

      {/* 🔔 Notification Icon */}
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

      {/* 👤 Profile Section */}
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
            src={user?.avatar || user?.companyLogo}
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
          >
            {user?.name?.charAt(0) || user?.companyName?.charAt(0)}
          </Avatar>
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

      {/* ⚙️ Profile Menu */}
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
          to={`/employee/${user?._id}`}
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

      {/* 🎨 Theme Switcher */}
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

      {/* 🔔 Notification Tab */}
      <CSSTransition
        in={showNotifications}
        timeout={300}
        classNames="notification-tab"
        unmountOnExit
        nodeRef={notificationTabRef}
      >
        <Paper
          ref={notificationTabRef}
          elevation={4}
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: "1rem",
            width: isSmDown ? "90vw" : "320px",
            maxHeight: "400px",
            overflowY: "auto",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
            padding: "1rem",
            zIndex: 1200
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
          <Box mt={2}>
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No notifications available
              </Typography>
            ) : (
              notifications.map((n) => (
                <Box
                  key={n._id || Math.random()}
                  sx={{
                    p: 1,
                    mb: 1,
                    borderRadius: "10px",
                    backgroundColor: n.isRead ? theme.palette.grey[100] : theme.palette.primary.light,
                    opacity: n.isRead ? 0.7 : 1,
                    transition: 'background-color 0.3s ease, opacity 0.3s ease'
                  }}
                >
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                    {n.message || "New notification"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Paper>
      </CSSTransition>

      {/* 🚀 Mode Dialog */}
      <Dialog
        open={showModeDialog}
        onClose={handleModeDialogClose}
        scroll="body"
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 400 }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          },
        }}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: isSmDown ? '90vw' : '640px',
            overflow: 'hidden',
            margin: isSmDown ? '0.5rem' : '1rem',
            position: 'absolute',
            top: '2rem',
            border: `1px solid ${theme.palette.grey[200]}`,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: '1.5rem 2rem',
            borderBottom: `1px solid ${theme.palette.grey[200]}`,
            background: `linear-gradient(90deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.dark,
              letterSpacing: '-0.02em',
              fontSize: isSmDown ? '1.5rem' : '1.75rem',
              background: theme.palette.primary.main,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Choose Your Mode
          </Typography>
          <IconButton onClick={handleModeDialogClose} size="medium">
            <CloseIcon sx={{ fontSize: '1.75rem', color: theme.palette.text.secondary, '&:hover': { color: theme.palette.error.main } }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: '2rem', backgroundColor: theme.palette.background.default, display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: '500px' }}>
            <Grid item xs={6}>
              {/* LMS URL wahi hai */}
              <Link to={BASE_LMS_URL} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: '1.5rem',
                    borderRadius: '20px',
                    background: `linear-gradient(145deg, ${theme.palette.info.light}20, ${theme.palette.info.main}10)`,
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    border: `1px solid ${theme.palette.info.main}30`,
                    boxShadow: `0 4px 12px ${theme.palette.info.main}20`,
                    '&:hover': {
                      background: `linear-gradient(145deg, ${theme.palette.info.main}30, ${theme.palette.info.dark}20)`,
                      transform: 'translateY(-6px)',
                      boxShadow: `0 8px 24px ${theme.palette.info.main}40`,
                      borderColor: theme.palette.info.main,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: isSmDown ? '64px' : '80px',
                      height: isSmDown ? '64px' : '80px',
                      backgroundColor: theme.palette.info.light,
                      border: `3px solid ${theme.palette.info.main}`,
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.info.main,
                        transform: 'scale(1.1)',
                        boxShadow: `0 4px 16px ${theme.palette.info.main}30`,
                      },
                    }}
                  >
                    <School sx={{ color: theme.palette.info.dark, fontSize: isSmDown ? '2.5rem' : '3rem' }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.info.dark,
                      textAlign: 'center',
                      letterSpacing: '-0.01em',
                      fontSize: isSmDown ? '1.25rem' : '1.5rem',
                    }}
                  >
                    LMS
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.info.dark,
                      textAlign: 'center',
                      fontSize: isSmDown ? '0.85rem' : '1rem',
                      fontWeight: 400,
                      opacity: 0.8,
                    }}
                  >
                    Lead Management System
                  </Typography>
                </Box>
              </Link>
            </Grid>
            <Grid item xs={6}>
              {/* HRM URL wahi hai */}
              <Link to={BASE_HRM_URL} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: '1.5rem',
                    borderRadius: '20px',
                    background: `linear-gradient(145deg, ${theme.palette.success.light}20, ${theme.palette.success.main}10)`,
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    border: `1px solid ${theme.palette.success.main}30`,
                    boxShadow: `0 4px 12px ${theme.palette.success.main}20`,
                    '&:hover': {
                      background: `linear-gradient(145deg, ${theme.palette.success.main}30, ${theme.palette.success.dark}20)`,
                      transform: 'translateY(-6px)',
                      boxShadow: `0 8px 24px ${theme.palette.success.main}40`,
                      borderColor: theme.palette.success.main,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: isSmDown ? '64px' : '80px',
                      height: isSmDown ? '64px' : '80px',
                      backgroundColor: theme.palette.success.light,
                      border: `3px solid ${theme.palette.success.main}`,
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.success.main,
                        transform: 'scale(1.1)',
                        boxShadow: `0 4px 16px ${theme.palette.success.main}30`,
                      },
                    }}
                  >
                    <Business sx={{ color: theme.palette.success.dark, fontSize: isSmDown ? '2.5rem' : '3rem' }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.success.dark,
                      textAlign: 'center',
                      letterSpacing: '-0.01em',
                      fontSize: isSmDown ? '1.25rem' : '1.5rem',
                    }}
                  >
                    HRM
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.success.dark,
                      textAlign: 'center',
                      fontSize: isSmDown ? '0.85rem' : '1rem',
                      fontWeight: 400,
                      opacity: 0.8,
                    }}
                  >
                    Human Resource Management
                  </Typography>
                </Box>
              </Link>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: '1.5rem 2rem', justifyContent: 'flex-end', backgroundColor: theme.palette.background.paper }}>
          <Button
            onClick={handleModeDialogClose}
            sx={{
              textTransform: 'none',
              color: '#fff',
              background: theme.palette.primary.main,
              borderRadius: '10px',
              padding: '10px 28px',
              fontWeight: 600,
              fontSize: isSmDown ? '0.9rem' : '1rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: theme.palette.primary.main,
                boxShadow: `0 6px 16px ${theme.palette.grey[400]}30`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Box>
    </>
  );
}

export default ProfileNav;