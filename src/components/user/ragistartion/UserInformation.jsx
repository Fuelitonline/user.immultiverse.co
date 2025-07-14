import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bgImage from '../../../../src/assets/images/5040007.jpg';
import { Country, State, City } from 'country-state-city';
import { usePost } from '../../../hooks/useApi.jsx';
import { useSelector } from 'react-redux';
import Loading from '../../../../public/Loading/Index.jsx';
import './UserInformation.css';

// Custom styled components
const StyledPaper = ({ children }) => (
  <Paper 
    elevation={3} 
    sx={{ 
      padding: 4, 
      borderRadius: 2,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}
  >
    {children}
  </Paper>
);

const StyledFormControl = ({ children, error }) => (
  <FormControl 
    variant="outlined" 
    fullWidth 
    sx={{ 
      mb: 2,
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover fieldset': {
          borderColor: 'primary.main',
        },
      },
      '& .MuiOutlinedInput-input': {
        padding: '14px 16px',
      },
      ...(error && {
        '& .MuiOutlinedInput-root': {
          borderColor: 'error.main',
        },
      })
    }}
  >
    {children}
  </FormControl>
);

const StyledTextField = ({ field, label, error, helperText }) => (
  <TextField
    {...field}
    variant="outlined"
    fullWidth
    label={label}
    error={!!error}
    helperText={helperText}
    sx={{ 
      mb: 2,
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover fieldset': {
          borderColor: 'primary.main',
        },
      },
      '& .MuiOutlinedInput-input': {
        padding: '14px 16px',
      }
    }}
  />
);

// Validation schema
const schema = yup.object().shape({
  companyName: yup.string().required('Company name is required'),
  street: yup.string().required('Street is required'),
  state: yup.string().required('State is required'),
  postalCode: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
  city: yup.string().required('City is required'),
  businessType: yup.string().required('Business type is required'),
});

function UserInformation({ onStageComplete }) {
  const { control, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const ragistrationProgress = useSelector(state => state.ragistrationProgress);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(2); // Assuming this is step 3 of registration
  const handleRagister = usePost('/user/ragister');

  const businessTypes = [
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'construction', label: 'Construction' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'it', label: 'Information Technology' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'transport', label: 'Transportation' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const countryOptions = Country.getAllCountries().map(country => ({
      value: country.isoCode,
      label: country.name
    }));
    setCountries(countryOptions);
  }, []);

  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    setValue('country', selectedCountry);
    const stateOptions = State.getStatesOfCountry(selectedCountry).map(state => ({
      value: state.isoCode,
      label: state.name
    }));
    setStates(stateOptions);
    setValue('state', '');
    setCities([]);
  };

  const handleStateChange = (event) => {
    const selectedState = event.target.value;
    setValue('state', selectedState);
    const selectedCountry = getValues('country');
    const cityOptions = City.getCitiesOfState(selectedCountry, selectedState).map(city => ({
      value: city.name,
      label: city.name
    }));
    setCities(cityOptions);
  };

  const onSubmit = async (data) => {
    try {
      const submitData = {
        email: ragistrationProgress.email,
        phone: ragistrationProgress.phoneNumber,
        password: ragistrationProgress.password,
        companyName: data.companyName,
        companyAddress: {
          street: data.street,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          city: data.city,
        },
        businessType: data.businessType,
      };

      setLoading(true);
      const res = await handleRagister.mutateAsync(submitData);

      if (res.data !== null) {
        toast.success(res.data.message);
        localStorage.setItem("user", JSON.stringify({ data: res?.data?.data }));
        onStageComplete();
      } else {
        toast.error(res.error.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Account Details', 'Verification', 'Company Information'];

  return (
    <Box
      sx={{
        minHeight: '100vh',

        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, md: 4 },
      }}
    >
      {loading && <Loading />}
      <ToastContainer />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <StyledPaper>
          <Box mb={4}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 600, 
              color: 'primary.main',
              mb: 3
            }}
          >
            Company Information
          </Typography>
          
          <Divider sx={{ mb: 4 }} />
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <StyledTextField 
                      field={field} 
                      label="Company Name" 
                      error={errors.companyName}
                      helperText={errors.companyName?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}
                >
                  Company Address
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <StyledTextField 
                      field={field} 
                      label="Street Address" 
                      error={errors.street}
                      helperText={errors.street?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <StyledFormControl error={!!errors.country}>
                      <InputLabel id="country-label">Country</InputLabel>
                      <Select
                        {...field}
                        labelId="country-label"
                        value={field.value || ''}
                        onChange={handleCountryChange}
                        label="Country"
                      >
                        {countries.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.country && (
                        <Typography variant="caption" color="error">
                          {errors.country.message}
                        </Typography>
                      )}
                    </StyledFormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <StyledFormControl error={!!errors.state}>
                      <InputLabel id="state-label">State/Province</InputLabel>
                      <Select
                        {...field}
                        labelId="state-label"
                        value={field.value || ''}
                        onChange={handleStateChange}
                        label="State/Province"
                        disabled={!states.length}
                      >
                        {states.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.state && (
                        <Typography variant="caption" color="error">
                          {errors.state.message}
                        </Typography>
                      )}
                    </StyledFormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <StyledFormControl error={!!errors.city}>
                      <InputLabel id="city-label">City</InputLabel>
                      <Select
                        {...field}
                        labelId="city-label"
                        value={field.value || ''}
                        label="City"
                        disabled={!cities.length}
                      >
                        {cities.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.city && (
                        <Typography variant="caption" color="error">
                          {errors.city.message}
                        </Typography>
                      )}
                    </StyledFormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <StyledTextField 
                      field={field} 
                      label="Postal Code" 
                      error={errors.postalCode}
                      helperText={errors.postalCode?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}
                >
                  Business Information
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="businessType"
                  control={control}
                  render={({ field }) => (
                    <StyledFormControl error={!!errors.businessType}>
                      <InputLabel id="business-type-label">Business Type</InputLabel>
                      <Select
                        {...field}
                        labelId="business-type-label"
                        value={field.value || ''}
                        label="Business Type"
                      >
                        {businessTypes.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.businessType && (
                        <Typography variant="caption" color="error">
                          {errors.businessType.message}
                        </Typography>
                      )}
                    </StyledFormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </StyledPaper>
      </Container>
    </Box>
  );
}

export default UserInformation;