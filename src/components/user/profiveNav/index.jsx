import { useEffect, useState, useRef, useCallback } from 'react';
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
import apiClient from "../../../helpers/axios/axiosService";
import { useGet } from "../../../hooks/useApi";
import { ALLOWED_PORTALS } from '../../../constants/portals';


const BASE_LMS_URL = import.meta.env.VITE_LMS_URL || "https://lms.immultiverse.co";
const BASE_HRM_URL = import.meta.env.VITE_HRM_URL || "https://hr.immultiverse.co";
const NOTIFICATION_SOUND_PATH = "/sound/notification.mp3";

function ProfileNav() {
    const theme = useTheme();
    const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handlePortalSwitch = (portal) => {
        const currentHost = window.location.hostname;
        let redirectUrl = '';

        if (currentHost === "localhost" || currentHost === "127.0.0.1") {
            // local
            redirectUrl = ALLOWED_PORTALS[portal].local;
        } else {
            // production
            redirectUrl = ALLOWED_PORTALS[portal].prod;
        }

        window.location.href = redirectUrl;
    };

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [showModeDialog, setShowModeDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const audioRef = useState(new Audio(NOTIFICATION_SOUND_PATH))[0];
    const notificationTabRef = useRef(null);
    const notificationIconRef = useRef(null); // Added a ref for the notification icon

    // Helper to check if a notification is read by the current user
    const isNotificationRead = useCallback((notification) => {
        return notification.readBy?.includes(user?._id);
    }, [user]);

    // Fetch notifications using the custom useGet hook
    const { data, isLoading: loading } = useGet(
        `/notification/get-notifications?page=${page}&limit=20`,
        {},
        {},
        { enabled: !!user?._id }
    );


    // Update state when data changes (Fixes infinite loop)
    useEffect(() => {
        if (data?.data?.data?.notifications) {
            const newNotifications = data.data.data.notifications;

            // Use the functional update form of setNotifications to prevent infinite loop
            setNotifications(prev => {
                const existingIds = new Set(prev.map(notif => notif._id));
                const uniqueNewNotifications = newNotifications.filter(
                    (newNotif) => !existingIds.has(newNotif._id)
                );

                // If on page 1, replace the list; otherwise, append unique new notifications
                return page === 1 ? uniqueNewNotifications : [...prev, ...uniqueNewNotifications];
            });

            setHasMore(page < data.data.data.totalPages);
        }
    }, [data, page]);

    // Calculate unread count based on the notifications array
    useEffect(() => {
        const allUnreadCount = notifications.filter(n => !isNotificationRead(n)).length;
        setNotificationCount(allUnreadCount);
    }, [notifications, isNotificationRead]);

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications
                .filter((n) => !isNotificationRead(n))
                .map((n) => n._id);

            if (unreadIds.length === 0) return;

            await apiClient.post("/notification/read-notifications", {
                notificationIds: unreadIds,
            });

            // ✅ Local state update
            setNotifications((prev) =>
                prev.map((n) =>
                    unreadIds.includes(n._id)
                        ? { ...n, readBy: [...(n.readBy || []), user._id] }
                        : n
                )
            );
            setNotificationCount(0);
        } catch (err) {
            console.error("Error marking notifications as read", err);
        }
    };

    // Load initial notifications + Socket setup
    useEffect(() => {
        if (!user?._id) {
            setPage(1);
            setNotifications([]);
            setNotificationCount(0);
            return;
        }

        if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
                if (permission !== "granted") {
                    console.log("Notification permission not granted.");
                }
            });
        }

        if (!socket.connected) {
            socket.connect();
        }

        // join user room
        socket.emit("joinRoom", user._id);

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);
        });

        socket.on("new-notification", (notif) => {
            audioRef.play().catch((e) => console.error("Error playing sound:", e));

            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(notif.message.split(":")[0] || "New Notification", {
                    body: notif.message,
                    icon: "/images/logo.png",
                });
            }

            // Prepend new notification if not already present
            setNotifications((prev) => {
                if (!prev.some((n) => n._id === notif._id)) {
                    return [notif, ...prev];
                }
                return prev;
            });

            // Increment unread count
            setNotificationCount((prev) => prev + 1);
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
        });

        return () => {
            socket.off("new-notification");
        };
    }, [user?._id, audioRef]);


    // Infinite Scroll Logic with useCallback for performance
    const handleScroll = useCallback(() => {
        const { scrollTop, scrollHeight, clientHeight } = notificationTabRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    }, [loading, hasMore]);

    useEffect(() => {
        const tabRef = notificationTabRef.current;
        if (showNotifications && tabRef) {
            tabRef.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (tabRef) {
                tabRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [showNotifications, handleScroll]);

    // New useEffect to handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the notification tab and not on the notification icon itself
            if (
                notificationTabRef.current &&
                !notificationTabRef.current.contains(event.target) &&
                notificationIconRef.current &&
                !notificationIconRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const handleNotificationClick = () => {
        setShowNotifications(true);
        markAllAsRead();
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
            <Box />
            {/* <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: '220px',
                    right: 0,
                    height: '50px',
                    zIndex: 99,
                    background: '#fff',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}
                className="glass-effect"
            > */}

            {/* </Box> */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: '220px',
                    right: 0,
                    height: '70px',
                    zIndex: 99,
                    marginBottom: '2rem',
                    background: '#fff',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: isSmDown ? '0.5rem 1rem' : '0.75rem 2rem',
                    paddingLeft: 0,
                    gap: '1rem',
                }}
                className="glass-effect"
            >

                <Announcement limit={3} showNav={false} />
                {/* 🔔 Mode Switcher Icon */}
                {((Array.isArray(user?.access) && user.access.length > 0) || user?.role === "superAdmin") && (
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
                        <SwitchAccessShortcut
                            sx={{ color: theme.palette.primary.main, fontSize: isSmDown ? '1.3rem' : '1.5rem' }}
                        />
                    </IconButton>
                )}



                {/* 🔔 Notification Icon */}
                <IconButton
                    ref={notificationIconRef} // Added ref here
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
                <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                        padding: 0,
                        borderRadius: '24px',
                        '&:hover': {
                            backgroundColor: 'transparent',
                        },
                    }}
                >
                    <Grid
                        container
                        alignItems="center"
                        sx={{
                            width: 'auto',
                            cursor: 'pointer',
                        }}
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
                </IconButton>

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
                        to="/profile/change-password"
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
                            <Box>
                                <Button
                                    size="small"
                                    onClick={markAllAsRead}
                                    sx={{ textTransform: "none", fontSize: "0.75rem", mr: 1 }}
                                >
                                    Mark all as read
                                </Button>
                                <IconButton onClick={handleCloseNotification} size="small">
                                    <CloseIcon sx={{ fontSize: '1.25rem', color: theme.palette.text.secondary }} />
                                </IconButton>
                            </Box>
                        </Box>

                        <Box mt={2}>
                            {/* Conditional Rendering Logic: show loading, no notifications, or the list */}
                            {loading && notifications.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Loading...
                                    </Typography>
                                </Box>
                            ) : !loading && notifications.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    No notifications available
                                </Typography>
                            ) : (
                                notifications.map((n) => (
                                    <Box
                                        key={n._id}
                                        sx={{
                                            p: 1,
                                            mb: 1,
                                            borderRadius: "10px",
                                            // Conditional background color based on status
                                            backgroundColor: isNotificationRead(n)
                                                ? theme.palette.grey[200]
                                                : theme.palette.info.light,
                                            opacity: isNotificationRead(n) ? 0.7 : 1,
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

                            {/* Show "Loading more..." only when fetching subsequent pages */}
                            {loading && hasMore && notifications.length > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Loading more...
                                    </Typography>
                                </Box>
                            )}

                            {/* Show "All notifications loaded." when there's no more data */}
                            {!hasMore && notifications.length > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        All notifications loaded.
                                    </Typography>
                                </Box>
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
                             {(user?.role === "superAdmin" || user?.access?.includes("lms")) && (
                                <Grid item xs={6}>
                                    {/* LMS URL */}
                                    {/* <Link to={BASE_LMS_URL} style={{ textDecoration: 'none' }}> */}
                                    <Box onClick={() => handlePortalSwitch("lms")}
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
                                    {/* </Link> */}
                                </Grid>
                            )}
                            {(user?.role === "superAdmin" || user?.access?.includes("hrm")) && (
                                <Grid item xs={6}>
                                    {/* HRM URL */}
                                    {/* <Link to={BASE_HRM_URL} style={{ textDecoration: 'none' }}> */}
                                    <Box
                                        onClick={() => handlePortalSwitch("hrm")}
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
                                    {/* </Link> */}
                                </Grid>
                            )}
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
        </>
    );
}

export default ProfileNav;