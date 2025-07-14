import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SideStyle from "../AuthSideStyle/index.jsx"; // Ensure this path is correct
import { useAuth } from "../../../middlewares/auth/authContext.jsx";
import { usePost } from "../../../hooks/useApi.jsx";
import Loading from "../../../../public/Loading/Index.jsx";
import { IoReloadCircleSharp } from "react-icons/io5";



const schema = yup.object().shape({
  emailOrPhone: yup.string().required("Email or Phone number is required"),
  password: yup.string().required("Password is required"),
  additionalInfo: yup.string().when("toggle", {
    is: true,
    then: yup.string().required("Workplace ID is required"),
  }),
});

function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);
  const handleLoginMutate = usePost(toggle ? "/employee/login" : "/user/login");
  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleDialogClose = () => setOpenDialog(false);
  const handleDialogOpen = () => setOpenDialog(true);

  const handleLogin = async (data) => {
    try {
      const dataSubmit = {
        emailOrPhone: data.emailOrPhone,
        password: data.password,
        ...(toggle && { loginId: data.loginId }), // Correctly maps "loginId" when toggle is true
      };
      setLoading(true);
      const res = await handleLoginMutate.mutateAsync({dataSubmit }); // Fixed object structure

      if (res.data) { // Simplified null check
        login(res.data.message?.data, res.data.message?.token);
        setTimeout(() => {
          toast.success("Login successful");
          navigate("/profiledashboard");
          setLoading(false);
        }, 2000);
      } else {
        toast.error(res.error?.error || "Login failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ height: "100vh", overflow: "hidden" }}>
      {/* Left Side - SideStyle */}
      <Grid item xs={12} sm={4}>
        <SideStyle text={'Login Now ...'}/>
      </Grid>

      {/* Right Side - Login Form */}
      <Grid
        item
        xs={12}
        sm={8}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          p: { xs: 2, sm: 3 },
        }}
      >
       
        <ToastContainer />
        <Grid
          sx={{
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
            maxWidth: "450px",
            width: "100%",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}
          >
            Sign In
          </Typography>
          <form onSubmit={handleSubmit(handleLogin)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="emailOrPhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="outlined"
                      fullWidth
                      label="Email or Phone"
                      error={!!errors.emailOrPhone}
                      helperText={errors.emailOrPhone?.message}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      label="Password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                    />
                  )}
                />
              </Grid>
              {toggle && (
                <Grid item xs={12}>
                  <Controller
                    name="loginId" // Fixed field name to match dataSubmit
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        fullWidth
                        label="Workplace ID"
                        error={!!errors.additionalInfo}
                        helperText={errors.additionalInfo?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                      />
                    )}
                  
                />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={toggle}
                      onChange={() => setToggle(!toggle)}
                      color="primary"
                    />
                  }
                  label="Login to Workplace"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled = {loading}
                  sx={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1565c0, #2196f3)",
                    },
                  }}
                >
                {loading ?   <CircularProgress color="success" /> : 'Sign In'}  
                </Button>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                <Typography variant="body2">
                  Don’t have an account? <Link to="/register">Register</Link>
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ cursor: "pointer", color: "#1976d2" }}
                  onClick={handleDialogOpen}
                >
                  Download Software
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Grid>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
            Download Software
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} direction="column">
              <Grid item>
                <Typography variant="body1" sx={{ fontWeight: "600" }}>
                  For Windows
                </Typography>
                <Link
                  to="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/win32/x64/Multiverse-1.0.5+Setup.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outlined" fullWidth sx={{ mt: 1 }}>
                    Download
                  </Button>
                </Link>
              </Grid>
              <Grid item>
                <Typography variant="body1" sx={{ fontWeight: "600" }}>
                  For Mac (Intel)
                </Typography>
                <Link
                  to="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darwin/x64/Multiverse-1.0.5-x64.dmg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outlined" fullWidth sx={{ mt: 1 }}>
                    Download
                  </Button>
                </Link>
              </Grid>
              <Grid item>
                <Typography variant="body1" sx={{ fontWeight: "600" }}>
                  For Mac (Silicon)
                </Typography>
                <Link
                  to="https://mutliverse-app-version.s3.ap-south-1.amazonaws.com/Multiverse/darwin/arm64/Multiverse-1.0.5-arm64.dmg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outlined" fullWidth sx={{ mt: 1 }}>
                    Download
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  );
}

export default LoginPage;