import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useDispatch } from "react-redux";
import { setEmail, setPassword, setPhoneNumber } from "../../../redux/actions/userRagistration/index.js"; // Adjust path
import { usePost } from "../../../hooks/useApi.jsx"; // Adjust path
import Loading from "../../../../public/Loading/Index.jsx"; // Adjust path
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import './verification.css'


// Styled Form Container
const FormContainer = styled(Container)(({ theme }) => ({
  position: "absolute",
  zIndex: 999,
  top: "55%",
  left: "65%",
  transform: "translate(-50%, -50%)",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  padding: "30px",
  borderRadius: "16px",
  maxWidth: "600px",
  width: "50%",
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
  // animation: `${fadeIn} 0.8s ease-out`,
  "&:hover": {
    boxShadow: "0 16px 50px rgba(0, 0, 0, 0.2)",
  },
}));

// Validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[@$!%*?&#]/, "Password must contain at least one special character"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
  phoneOtp: yup.string().when("phoneVerified", {
    is: true,
    then: yup.string().length(4, "OTP must be 4 digits").required("OTP is required"),
  }),
  emailOtp: yup.string().when("emailVerified", {
    is: true,
    then: yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
  }),
});

// Password strength validator
const validatePasswordStrength = (password) => {
  const strength = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[@$!%*?&#]/.test(password),
  };
  return Object.keys(strength).filter((key) => !strength[key]);
};

// Styled Phone Input Wrapper
const StyledPhoneInputWrapper = styled(Box)(({ disabled }) => ({
  "& .PhoneInput": {
    height: "56px",
    borderRadius: "10px",
    background: "#fff",
    border: "1px solid #053E0E",
    boxShadow: "0 2px 8px rgba(5, 62, 14, 0.1)",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    "&:hover": !disabled && {
      borderColor: "#0A7921",
      boxShadow: "0 4px 12px rgba(5, 62, 14, 0.2)",
    },
    "&:focus-within": !disabled && {
      borderColor: "#053E0E",
      boxShadow: "0 0 8px rgba(5, 62, 14, 0.4)",
    },
    ...(disabled && {
      background: "#f5f5f5",
      borderColor: "#ccc",
      cursor: "not-allowed",
    }),
  },
  "& .PhoneInputCountry": {
    marginRight: "8px",
  },
  "& .PhoneInputInput": {
    border: "none",
    outline: "none",
    fontSize: "1rem",
    color: "#424242",
    background: "transparent",
    width: "100%",
    "&::placeholder": { color: "#999" },
    ...(disabled && { color: "#888" }),
  },
  "& .PhoneInputCountryIcon": {
    borderRadius: "4px",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  },
}));

const EnhancedPhoneInput = React.memo(({ field, getValues, setValue, disabled }) => {
  return (
    <StyledPhoneInputWrapper disabled={disabled}>
      <PhoneInput
        {...field}
        defaultCountry="IN"
        international
        placeholder="Enter phone number"
        onChange={(value) => setValue("phone", value, { shouldValidate: true })}
        value={getValues("phone")}
        disabled={disabled}
      />
    </StyledPhoneInputWrapper>
  );
});

function UserVerification({ onStageComplete }) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange", // Validate on change for better responsiveness
  });

  const [otpSent, setOtpSent] = useState({ email: false, phone: false });
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(null);
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState([]);
  const [resendCooldown, setResendCooldown] = useState({ email: 0, phone: 0 });
  const [disableEmail, setDisableEmail] = useState(false);
  const [disablePhone, setDisablePhone] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const emailOtpRefs = useRef([]);
  const phoneOtpRefs = useRef([]);
  const sendPhoneOtpMutation= usePost("one-time-password/send-phone");
  const  sendEmailOtpMutation = usePost("one-time-password/send-email");
  const verifyPhoneOtpMutation  = usePost("one-time-password/verify-phone");
  const verifyEmailOtpMutation = usePost("one-time-password/verify-email");

  // Optimize timer with a single useEffect
  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => ({
        email: Math.max(prev.email - 1, 0),
        phone: Math.max(prev.phone - 1, 0),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Memoized handlers to prevent re-creation on every render
  const handleSendOtp = useCallback(
    async (type) => {
      const emailValue = getValues("email");
      const phoneValue = getValues("phone");

      if (type === "phone") {
        if (!phoneValue || !isValidPhoneNumber(phoneValue)) {
          toast.warn("Please enter a valid phone number");
          return;
        }
        if (resendCooldown.phone > 0) {
          toast.warn(`Please wait ${resendCooldown.phone}s before resending OTP`);
          return;
        }
        setLoading(true);
        try {
          const res = await sendPhoneOtpMutation.mutateAsync({ phoneNumber: phoneValue });
          if(res.data){
            toast.success(res?.data?.message);
            setOtpSent((prev) => ({ ...prev, phone: true }));
            setResendCooldown((prev) => ({ ...prev, phone: 150 }));
          }
         else{
          toast.error(res?.error?.error ||"Failed to send phone OTP");
         }
        } catch (error) {
          toast.error(res?.error?.error ||"Failed to send phone OTP");
        }
        setLoading(false);
      } else if (type === "email") {
        const isEmailValid = await trigger("email");
        if (!isEmailValid) return;
        setLoading(true);
        try {
          const res = await sendEmailOtpMutation.mutateAsync({ email: emailValue });
          if(res?.data){
            toast.success(res?.data?.message);
            setOtpSent((prev) => ({ ...prev, email: true }));
            setResendCooldown((prev) => ({ ...prev, email: 150 }));
          }else{
            toast.error(res?.error?.error || "Failed to send email OTP");
          }
        
        } catch (error) {
          toast.error(res?.error?.error || "Failed to send email OTP");
        }
        setLoading(false);
      }
    },
    [getValues, trigger, resendCooldown, sendPhoneOtpMutation, sendEmailOtpMutation]
  );

  const handleVerify = useCallback(
    async (type) => {
      const otp = getValues(`${type}Otp`);
      if (!otp) return;

      setLoading(true);
      try {
        if (type === "phone") {
          const res = await verifyPhoneOtpMutation.mutateAsync({ phoneNumber: getValues("phone"), otp });
          if (res?.data) {
            setPhoneVerified(true);
            setPhoneVerificationStatus("success");
            setDisablePhone(true);
            toast.success(res.data.message);
          } else {
            setPhoneVerified(false);
            setPhoneVerificationStatus("error");
            toast.error(res?.error?.error || "Invalid OTP");
          }
        } else if (type === "email") {
          const res = await verifyEmailOtpMutation.mutateAsync({ email: getValues("email"), otp });
          if (res?.data) {
            setEmailVerified(true);
            setEmailVerificationStatus("success");
            setDisableEmail(true);
            toast.success(res.data.message);
          } else {
            setEmailVerified(false);
            setEmailVerificationStatus("error");
            toast.error(res?.error?.error || "Invalid OTP");
          }
        }
      } catch (error) {
        toast.error(`Failed to verify ${type} OTP`);
      }
      setLoading(false);
    },
    [getValues, verifyPhoneOtpMutation, verifyEmailOtpMutation]
  );

  const handleOtpChange = useCallback(
    (event, index, type) => {
      const { value } = event.target;
      const otpLength = type === "phone" ? 4 : 6;

      if (/^\d?$/.test(value)) {
        const currentOtp = getValues(`${type}Otp`) || "";
        const newOtp = currentOtp.padEnd(otpLength, " ").split("");
        newOtp[index] = value;
        const updatedOtp = newOtp.join("");
        setValue(`${type}Otp`, updatedOtp, { shouldValidate: true });

        if (value && index < otpLength - 1) {
          (type === "phone" ? phoneOtpRefs : emailOtpRefs).current[index + 1]?.focus();
        } else if (!value && index > 0) {
          (type === "phone" ? phoneOtpRefs : emailOtpRefs).current[index - 1]?.focus();
        }
      }
    },
    [getValues, setValue]
  );

  const handlePasswordChange = useCallback(
    (e) => {
      const password = e.target.value;
      setValue("password", password, { shouldValidate: true });
      setPasswordStrength(validatePasswordStrength(password));
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data, event) => {
      event.preventDefault();
      onStageComplete();
      if (emailVerified && phoneVerified) {
        try {
          dispatch(setEmail(data.email));
          const normalizedPhone = data.phone.replace(/[^\d]/g, "");
          dispatch(setPhoneNumber(normalizedPhone));
          dispatch(setPassword(data.password));
        } catch (error) {
          console.error("Error:", error);
          toast.error("Failed to submit form");
        }
      } else {
        toast.warn("Please complete email and phone verification");
      }
    },
    [emailVerified, phoneVerified, dispatch, onStageComplete]
  );

  return (
    <Box
      sx={{
        width:'100%',
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        overflow: "hidden",
      }}
    >
      {/* {loading && <Loading />} */}
      <ToastContainer />
      <FormContainer sx={{maxWidth:'100%',}}>
       
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} position={'relative'} mb={emailVerified ? 2 :8}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={disableEmail}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      "& .MuiInputLabel-root": { color: "#424242" },
                    }}
                  />
                )}
              />
              {!emailVerified && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => handleSendOtp("email")}
                    disabled={disableEmail || resendCooldown.email > 0}
                    sx={{
                      mt: 1,
                      borderRadius: "8px",
                      position:'absolute',
                      left: resendCooldown.email > 0 || otpSent.email ? 200 : 20,
                      top:resendCooldown.email > 0 || otpSent.email? 160 : 90,
                      color: resendCooldown.email > 0 ? "red" : "#053E0E",
                      borderColor: "#053E0E",
                      "&:hover": { borderColor: "#0A7921", background: "rgba(5, 62, 14, 0.1)" },
                    }}
                  >
                    {resendCooldown.email > 0 ? `Resend in ${resendCooldown.email}s` : "Send Email OTP"}
                  </Button>
                  {otpSent.email && (
                    <Grid container spacing={1} sx={{ mt: 2 }}>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Grid item xs={2} key={index}>
                          <TextField
                            inputRef={(el) => (emailOtpRefs.current[index] = el)}
                            variant="outlined"
                            fullWidth
                            type="text"
                            inputProps={{ maxLength: 1, pattern: "[0-9]*" }}
                            error={!!errors.emailOtp}
                            helperText={errors.emailOtp?.message}
                            onChange={(e) => handleOtpChange(e, index, "email")}
                            disabled={disableEmail}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                height: "45px",
                                background: "#fff",
                              },
                              "& .MuiInputBase-input": { textAlign: "center" },
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  {emailVerificationStatus && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: emailVerificationStatus === "success" ? "green" : "red" }}
                    >
                      {emailVerificationStatus === "success" ? (
                        <>
                          <CheckCircleIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                          OTP Verified Successfully
                        </>
                      ) : (
                        <>
                          <ErrorIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                          Incorrect OTP
                        </>
                      )}
                    </Typography>
                  )}
                  {otpSent.email && !emailVerified && (
                    <Button
                      variant="contained"
                      onClick={() => handleVerify("email")}
                      disabled={disableEmail}
                      sx={{
                        mt: 2,
                        position:'absolute',
                        left:20,
                        top:150,
                        borderRadius: "8px",
                        background: "linear-gradient(45deg, #053E0E, #0A7921)",
                        "&:hover": { background: "linear-gradient(45deg, #032908, #053E0E)" },
                      }}
                    >
                      Verify Email OTP
                    </Button>
                  )}
                </>
              )}
            </Grid>
            <Grid item xs={12} position={'relative'} mb={phoneVerified ? 2 :8}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <EnhancedPhoneInput
                    field={field}
                    getValues={getValues}
                    setValue={setValue}
                    disabled={disablePhone}
                  />
                )}
              />
              {!phoneVerified && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => handleSendOtp("phone")}
                    disabled={disablePhone || resendCooldown.phone > 0}
                    sx={{
                      mt: 1,
                      position:'absolute',
                      left: resendCooldown.phone > 0 || otpSent.phone? 200 : 20,
                      top:resendCooldown.phone > 0  || otpSent.phone ?160 : 90,
                      borderRadius: "8px",
                      color: resendCooldown.phone > 0 ? "red" : "#053E0E",
                      borderColor: "#053E0E",
                      "&:hover": { borderColor: "#0A7921", background: "rgba(5, 62, 14, 0.1)" },
                    }}
                  >
                    {resendCooldown.phone > 0 ? `Resend in ${resendCooldown.phone}s` : "Send Phone OTP"}
                  </Button>
                  {otpSent.phone && (
                    <Grid container spacing={1} sx={{ mt: 2 }}>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Grid item xs={3} key={index}>
                          <TextField
                            inputRef={(el) => (phoneOtpRefs.current[index] = el)}
                            variant="outlined"
                            fullWidth
                            type="text"
                            inputProps={{ maxLength: 1, pattern: "[0-9]*" }}
                            error={!!errors.phoneOtp}
                            helperText={errors.phoneOtp?.message}
                            onChange={(e) => handleOtpChange(e, index, "phone")}
                            disabled={disablePhone}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                height: "45px",
                                background: "#fff",
                              },
                              "& .MuiInputBase-input": { textAlign: "center" },
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  {phoneVerificationStatus && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: phoneVerificationStatus === "success" ? "green" : "red" }}
                    >
                      {phoneVerificationStatus === "success" ? (
                        <>
                          <CheckCircleIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                          OTP Verified Successfully
                        </>
                      ) : (
                        <>
                          <ErrorIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                          Incorrect OTP
                        </>
                      )}
                    </Typography>
                  )}
                  {otpSent.phone && !phoneVerified && (
                    <Button
                      variant="contained"
                      onClick={() => handleVerify("phone")}
                      disabled={disablePhone}
                      sx={{
                        mt: 2,
                        borderRadius: "8px",
                        position:'absolute',
                        left:20,
                        top:150,
                        background: "linear-gradient(45deg, #053E0E, #0A7921)",
                        "&:hover": { background: "linear-gradient(45deg, #032908, #053E0E)" },
                      }}
                    >
                      Verify Phone OTP
                    </Button>
                  )}
                </>
              )}
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    label="Password"
                    type="password"
                    onChange={handlePasswordChange}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                  />
                )}
              />
              {passwordStrength.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(255, 0, 0, 0.1)", borderRadius: "8px" }}>
                  <Typography variant="body2" color="error.main">
                    <strong>Password Requirements:</strong>
                    <ul style={{ paddingLeft: "20px" }}>
                      {[
                        { key: "minLength", text: "At least 8 characters" },
                        { key: "hasUppercase", text: "One uppercase letter" },
                        { key: "hasLowercase", text: "One lowercase letter" },
                        { key: "hasNumber", text: "One number" },
                        { key: "hasSpecial", text: "One special character" },
                      ].map((req) => (
                        <li
                          key={req.key}
                          style={{ color: passwordStrength.includes(req.key) ? "red" : "green" }}
                        >
                          {req.text}
                        </li>
                      ))}
                    </ul>
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Button
                type="submit"
                variant="contained"
                // disabled={!emailVerified || !phoneVerified}
                sx={{
                  padding: "12px 40px",
                  borderRadius: "10px",
                  background: "linear-gradient(45deg, #053E0E, #0A7921)",
                  "&:hover": { background: "linear-gradient(45deg, #032908, #053E0E)" },
                  "&:disabled": { background: "grey" },
                }}
              >
                Next
              </Button>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#424242" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#053E0E", fontWeight: "bold" }}>
                  Login here
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </FormContainer>
    </Box>
  );
}

export default UserVerification;