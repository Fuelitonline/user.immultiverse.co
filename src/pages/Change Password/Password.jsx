
import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  IconButton,
  InputAdornment,
  Grid,
  Modal,
  Fade,
  Backdrop,
  useTheme,
  alpha,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import { motion } from 'framer-motion';
import ProfileNav from '../../components/user/profiveNav'; // Assuming ProfileNav is a custom component

// Animation variants for headings
const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Animation variants for fields
const fieldVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Container animation with staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const ChangePassword = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
    forgotNew: false,
    forgotConfirm: false,
  });
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null); // null, 'email', 'otp', 'reset'
  const [openModal, setOpenModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'otp' && !/^\d{0,6}$/.test(value)) return; // Restrict OTP to 6 digits
    setForgotPasswordData({ ...forgotPasswordData, [name]: value });
    setForgotPasswordErrors({ ...forgotPasswordErrors, [name]: '' });
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.currentPassword) tempErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) tempErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 8) tempErrors.newPassword = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) tempErrors.confirmPassword = 'Confirm password is required';
    else if (formData.newPassword !== formData.confirmPassword)
      tempErrors.confirmPassword = 'Passwords do not match';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateEmail = () => {
    let tempErrors = {};
    if (!forgotPasswordData.email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(forgotPasswordData.email)) tempErrors.email = 'Invalid email address';
    setForgotPasswordErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateOtp = () => {
    let tempErrors = {};
    if (!forgotPasswordData.otp) tempErrors.otp = 'OTP is required';
    else if (forgotPasswordData.otp.length !== 6) tempErrors.otp = 'OTP must be a 6-digit number';
    setForgotPasswordErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateResetPassword = () => {
    let tempErrors = {};
    if (!forgotPasswordData.newPassword) tempErrors.newPassword = 'New password is required';
    else if (forgotPasswordData.newPassword.length < 8)
      tempErrors.newPassword = 'Password must be at least 8 characters';
    if (!forgotPasswordData.confirmPassword) tempErrors.confirmPassword = 'Confirm password is required';
    else if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword)
      tempErrors.confirmPassword = 'Passwords do not match';
    setForgotPasswordErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Password change submitted:', formData);
      alert('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (forgotPasswordStep === 'email') {
      if (validateEmail()) {
        console.log('Sending OTP to:', forgotPasswordData.email);
        setForgotPasswordStep('otp');
      }
    } else if (forgotPasswordStep === 'otp') {
      if (validateOtp()) {
        console.log('OTP verified:', forgotPasswordData.otp);
        setForgotPasswordStep('reset');
      }
    } else if (forgotPasswordStep === 'reset') {
      if (validateResetPassword()) {
        console.log('Resetting password for:', forgotPasswordData.email, forgotPasswordData.newPassword);
        alert('Password reset successfully!');
        setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
        setForgotPasswordStep(null);
        setOpenModal(false);
      }
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordStep('email');
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setForgotPasswordStep(null);
    setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    setForgotPasswordErrors({});
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '1400px',
        mx: 'auto',
        px: { xs: 2, sm: 4 },
        gap: 4,
        py: 6,
        overflowX: 'hidden',
        bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
      }}
    >
      {/* Profile Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ width: '100%', mb: 2 }}>
          <Grid container spacing={2} sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
            <Grid item xs={12} container justifyContent="flex-end">
              <ProfileNav />
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      <Container maxWidth="sm" sx={{ mt: 6, mb: 6, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
            }}
          >
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <LockIcon
                  sx={{
                    fontSize: '2.5rem',
                    color: theme.palette.primary.main,
                    mb: 2,
                    border: `2px solid ${theme.palette.primary.main}`,
                    borderRadius: '50%',
                    p: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />
              </motion.div>
              <motion.div variants={headingVariants} initial="hidden" animate="visible">
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Change Password
                </Typography>
              </motion.div>
            </Box>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <motion.div variants={headingVariants}>
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mb: 1, color: theme.palette.text.secondary }}>
                        Current Password
                      </Typography>
                    </motion.div>
                    <motion.div variants={fieldVariants}>
                      <TextField
                        fullWidth
                        name="currentPassword"
                        type={showPassword.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword}
                        placeholder="Enter current password"
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => toggleShowPassword('current')}>
                                {showPassword.current ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <motion.div variants={headingVariants}>
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mb: 1, color: theme.palette.text.secondary }}>
                        New Password
                      </Typography>
                    </motion.div>
                    <motion.div variants={fieldVariants}>
                      <TextField
                        fullWidth
                        name="newPassword"
                        type={showPassword.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword}
                        placeholder="Enter new password"
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => toggleShowPassword('new')}>
                                {showPassword.new ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>
                </Grid>
                <Box>
                  <motion.div variants={headingVariants}>
                    <Typography variant="subtitle1" sx={{ textAlign: 'left', mb: 1, color: theme.palette.text.secondary }}>
                      Confirm New Password
                    </Typography>
                  </motion.div>
                  <motion.div variants={fieldVariants}>
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      placeholder="Confirm new password"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => toggleShowPassword('confirm')}>
                              {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        bgcolor: alpha(theme.palette.background.default, 0.8),
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </motion.div>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    variants={fieldVariants}
                  >
                    <Button
                      variant="text"
                      onClick={handleForgotPasswordClick}
                      sx={{
                        textTransform: 'none',
                        color: theme.palette.primary.main,
                        fontWeight: 'medium',
                        '&:hover': {
                          color: theme.palette.primary.dark,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    variants={fieldVariants}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{
                        py: 1.5,
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        bgcolor: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      Update Password
                    </Button>
                  </motion.div>
                </Box>
              </Box>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>

      {/* Forgot Password Modal */}
      <Modal
        open={openModal}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backdropFilter: 'blur(5px)' },
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              p: 4,
              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {forgotPasswordStep === 'email' && (
                <>
                  <motion.div variants={headingVariants}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: theme.palette.text.primary,
                        mb: 3,
                        textAlign: 'center',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Forgot Password
                    </Typography>
                  </motion.div>
                  <Box component="form" onSubmit={handleForgotPasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <motion.div variants={headingVariants}>
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mb: 1, color: theme.palette.text.secondary }}>
                        Enter Your Email
                      </Typography>
                    </motion.div>
                    <motion.div variants={fieldVariants}>
                      <TextField
                        fullWidth
                        name="email"
                        type="email"
                        value={forgotPasswordData.email}
                        onChange={handleForgotPasswordChange}
                        error={!!forgotPasswordErrors.email}
                        helperText={forgotPasswordErrors.email}
                        placeholder="Enter your email"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </motion.div>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={fieldVariants}
                      >
                        <Button
                          variant="outlined"
                          onClick={handleModalClose}
                          sx={{
                            textTransform: 'none',
                            color: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={fieldVariants}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: theme.palette.primary.dark,
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          Send OTP
                        </Button>
                      </motion.div>
                    </Box>
                  </Box>
                </>
              )}
              {forgotPasswordStep === 'otp' && (
                <>
                  <motion.div variants={headingVariants}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: theme.palette.text.primary,
                        mb: 2,
                        textAlign: 'center',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Enter OTP
                    </Typography>
                  </motion.div>
                  <motion.div variants={headingVariants}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 2,
                        textAlign: 'center',
                      }}
                    >
                      An OTP has been sent to {forgotPasswordData.email}
                    </Typography>
                  </motion.div>
                  <Box component="form" onSubmit={handleForgotPasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <motion.div variants={fieldVariants}>
                      <TextField
                        fullWidth
                        name="otp"
                        type="text"
                        value={forgotPasswordData.otp}
                        onChange={handleForgotPasswordChange}
                        error={!!forgotPasswordErrors.otp}
                        helperText={forgotPasswordErrors.otp}
                        placeholder="Enter 6-digit OTP"
                        variant="outlined"
                        inputProps={{ maxLength: 6 }}
                        sx={{
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </motion.div>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={fieldVariants}
                      >
                        <Button
                          variant="outlined"
                          onClick={handleModalClose}
                          sx={{
                            textTransform: 'none',
                            color: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={fieldVariants}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: theme.palette.primary.dark,
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          Verify OTP
                        </Button>
                      </motion.div>
                    </Box>
                  </Box>
                </>
              )}
              {forgotPasswordStep === 'reset' && (
                <>
                  <motion.div variants={headingVariants}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: theme.palette.text.primary,
                        mb: 3,
                        textAlign: 'center',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Reset Password
                    </Typography>
                  </motion.div>
                  <Box component="form" onSubmit={handleForgotPasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <motion.div variants={headingVariants}>
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mb: 1, color: theme.palette.text.secondary }}>
                        New Password
                      </Typography>
                    </motion.div>
                    <motion.div variants={fieldVariants}>
                      <TextField
                        fullWidth
                        name="newPassword"
                        type={showPassword.forgotNew ? 'text' : 'password'}
                        value={forgotPasswordData.newPassword}
                        onChange={handleForgotPasswordChange}
                        error={!!forgotPasswordErrors.newPassword}
                        helperText={forgotPasswordErrors.newPassword}
                        placeholder="Enter new password"
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => toggleShowPassword('forgotNew')}>
                                {showPassword.forgotNew ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </motion.div>
                    <motion.div variants={headingVariants}>
                      <Typography variant="subtitle1" sx={{ textAlign: 'left', mb: 1, color: theme.palette.text.secondary }}>
                        Confirm New Password
                      </Typography>
                    </motion.div>
                    <motion.div variants={fieldVariants}>
                      <TextField
                        fullWidth
                        name="confirmPassword"
                        type={showPassword.forgotConfirm ? 'text' : 'password'}
                        value={forgotPasswordData.confirmPassword}
                        onChange={handleForgotPasswordChange}
                        error={!!forgotPasswordErrors.confirmPassword}
                        helperText={forgotPasswordErrors.confirmPassword}
                        placeholder="Confirm new password"
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => toggleShowPassword('forgotConfirm')}>
                                {showPassword.forgotConfirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                          borderRadius: 1,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </motion.div>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={fieldVariants}
                      >
                        <Button
                          variant="outlined"
                          onClick={handleModalClose}
                          sx={{
                            textTransform: 'none',
                            color: theme.palette.text.secondary,
                            borderColor: theme.palette.divider,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variants={fieldVariants}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: theme.palette.primary.dark,
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          Reset Password
                        </Button>
                      </motion.div>
                    </Box>
                  </Box>
                </>
              )}
            </motion.div>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default ChangePassword;
