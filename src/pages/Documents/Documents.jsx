import { 
    Box, 
    Typography, 
    CircularProgress,
    Paper,
    useTheme,
    Fade,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    Stack,
    Grid
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Info, Person, School, Work, Business, Description } from '@mui/icons-material';
import { useGet } from '../../hooks/useApi';
import { useAuth } from '../../middlewares/auth';
import BasicInfoTab from './BasicInfoTab';
import IdentityBankTab from './IdentityBankTab';
import EducationalDocumentsTab from './EducationalDocumentsTab';
import PreviousEmploymentTab from './PreviousEmploymentTab';
import CompanyRelatedTab from './CompanyRelatedTab';
import ProfileNav from '../../components/user/profiveNav';

function DocumentsPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [basicInfo, setBasicInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [activeStep, setActiveStep] = useState(0);
    const { data: emp, isLoading: empLoading } = useGet('employee/employee-details', { empId: user?._id });
    const theme = useTheme();

    useEffect(() => {
        if (emp?.data?.data) {
            setFormData({ ...emp.data.data });
            setBasicInfo({
                fullName: emp.data.data.fullName || '',
                email: emp.data.data.email || '',
                phone: emp.data.data.phone || '',
                address: emp.data.data.address || ''
            });
        }
    }, [emp]);

    const handleBasicInfoChange = (field) => (e) => {
        setBasicInfo(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleStepChange = (step) => {
        setActiveStep(step);
    };

    const steps = [
        { label: "Basic Info", icon: <Info /> },
        { label: "Identity & Bank", icon: <Person /> },
        { label: "Educational Documents", icon: <School /> },
        { label: "Previous Employment", icon: <Work /> },
        { label: "Company-related", icon: <Business /> },
    ];

    const documentCategories = [
        { title: "Identity & Bank", icon: <Person />, documents: ["Government-issued ID proof (Aadhaar / Passport / Voter ID)", "PAN Card (mandatory for tax & salary)", "Passport-size Photographs", "Cancelled Cheque / Bank Passbook Copy (for salary account setup)"] },
        { title: "Educational Documents", icon: <School />, documents: ["10th Marksheet / Certificate", "12th Marksheet / Certificate", "Diploma Certificate (if applicable)", "Bachelor’s Degree Certificate & Marksheets", "Master’s Degree Certificate & Marksheets (if applicable)"] },
        { title: "Previous Employment Documents", icon: <Work />, documents: ["Experience Letter / Relieving Letter", "Last 3 Months’ Salary Slips"] },
        { title: "Company-related", icon: <Business />, documents: ["Signed Offer Letter / Appointment Letter"] }
    ];

    // Custom StepConnector to control progress line
    const CustomConnector = ({ activeStep, index }) => (
        <StepConnector
            sx={{
                '& .MuiStepConnector-line': {
                    height: 3,
                    bgcolor: theme.palette.grey[400],
                    transition: 'all 0.3s ease',
                    ...(index <= activeStep && {
                        bgcolor: theme.palette.primary.main,
                    }),
                },
            }}
        />
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: 1200,
                mx: 'auto',
                py: 4,
                px: { xs: 2, sm: 3, md: 4 },
                minHeight: 'auto',
                fontFamily: 'Poppins, sans-serif',
            }}
        >
            {/* Sticky Profile Navigation */}
            <Box sx={{ width: '100%', mb: 9 }}>
                <Grid container spacing={2} sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
                    <Grid item xs={12} container justifyContent='flex-end'>
                        <ProfileNav />
                    </Grid>
                </Grid>
            </Box>

            <Paper
                elevation={6}
                sx={{
                    width: '100%',
                    borderRadius: '16px',
                    p: { xs: 2, sm: 3, md: 4 },
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    minHeight: '60vh',
                    overflow: 'hidden',
                    boxShadow: `0 8px 24px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'}`,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 32px ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.4)'}`,
                    },
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                {empLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress color="primary" size={56} thickness={4.5} />
                    </Box>
                ) : (
                    <Fade in={!empLoading} timeout={500}>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 600,
                                    color: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 3,
                                    fontSize: { xs: '1.75rem', sm: '2.25rem' },
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: 0.5,
                                }}
                            >
                                <Description fontSize="large" /> Documents
                            </Typography>
                            {/* Stepper Component with Dynamic Progress Line */}
                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 7 }}>
                                {steps.map((step, index) => (
                                    <Step 
                                        key={step.label} 
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <StepLabel
                                            onClick={() => handleStepChange(index)}
                                            StepIconComponent={(props) => (
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        backgroundColor: props.active || props.completed ? theme.palette.primary.main : theme.palette.grey[400],
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {React.cloneElement(step.icon, { fontSize: 'small' })}
                                                </Box>
                                            )}
                                            connector={<CustomConnector activeStep={activeStep} index={index} />}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily: 'Poppins, sans-serif',
                                                    textTransform: 'none',
                                                    color: activeStep === index ? theme.palette.primary.main : theme.palette.text.secondary,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {step.label}
                                            </Typography>
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                            <Stack spacing={3}>
                                {activeStep === 0 && (
                                    <BasicInfoTab
                                        basicInfo={basicInfo}
                                        handleBasicInfoChange={handleBasicInfoChange}
                                        disabled={true}
                                    />
                                )}
                                {activeStep === 1 && (
                                    <IdentityBankTab
                                        category={documentCategories[0]}
                                        formData={formData}
                                        handleFileChange={handleBasicInfoChange}
                                        newFiles={{}}
                                    />
                                )}
                                {activeStep === 2 && (
                                    <EducationalDocumentsTab
                                        category={documentCategories[1]}
                                        formData={formData}
                                        handleFileChange={handleBasicInfoChange}
                                        newFiles={{}}
                                    />
                                )}
                                {activeStep === 3 && (
                                    <PreviousEmploymentTab
                                        category={documentCategories[2]}
                                        formData={formData}
                                        handleFileChange={handleBasicInfoChange}
                                        newFiles={{}}
                                    />
                                )}
                                {activeStep === 4 && (
                                    <CompanyRelatedTab
                                        category={documentCategories[3]}
                                        formData={formData}
                                        handleFileChange={handleBasicInfoChange}
                                        newFiles={{}}
                                    />
                                )}
                            </Stack>
                        </Box>
                    </Fade>
                )}
            </Paper>
        </Box>
    );
}

export default DocumentsPage;