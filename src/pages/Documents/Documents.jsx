import { 
    Box, 
    Typography, 
    CircularProgress,
    Paper,
    Fade,
    Stepper,
    Step,
    StepLabel,
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
        { label: "Educational", icon: <School /> },
        { label: "Employment", icon: <Work /> },
        { label: "Company", icon: <Business /> },
    ];

    const documentCategories = [
        { title: "Identity & Bank", icon: <Person />, documents: ["Government-issued ID proof (Aadhaar / Passport / Voter ID)", "PAN Card (mandatory for tax & salary)", "Passport-size Photographs", "Cancelled Cheque / Bank Passbook Copy (for salary account setup)"] },
        { title: "Educational Documents", icon: <School />, documents: ["10th Marksheet / Certificate", "12th Marksheet / Certificate", "Diploma Certificate (if applicable)", "Bachelor's Degree Certificate & Marksheets", "Master's Degree Certificate & Marksheets (if applicable)"] },
        { title: "Previous Employment Documents", icon: <Work />, documents: ["Experience Letter / Relieving Letter", "Last 3 Months' Salary Slips"] },
        { title: "Company-related", icon: <Business />, documents: ["Signed Offer Letter / Appointment Letter"] }
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                py: 4,
                px: { xs: 2, sm: 3, md: 4 },
                fontFamily: 'Poppins, sans-serif',
            }}
        >
            {/* Profile Navigation */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 3 }}>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                    <Grid item xs={12} container justifyContent='flex-end'>
                        <ProfileNav />
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 6 }}>
                {empLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                        <CircularProgress 
                            size={64} 
                            thickness={4}
                            sx={{ color: '#2563eb' }}
                        />
                    </Box>
                ) : (
                    <Fade in={!empLoading} timeout={600}>
                        <Box>
                            {/* Modern Header */}
                            <Box sx={{ mb: 4 }}>
                                {/* <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                        background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mb: 1,
                                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                                    }}
                                >
                                    <Box sx={{ 
                                        p: 1.5, 
                                        borderRadius: '16px', 
                                        background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)'
                                    }}>
                                        <Description sx={{ color: 'white', fontSize: { xs: 28, sm: 32, md: 36 } }} />
                                    </Box>
                                    Documents Management
                                </Typography> */}
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        color: '#64748b', 
                                        ml: { xs: 0, sm: 8 },
                                        mt: { xs: 2, sm: 0 }
                                    }}
                                >
                                    Manage and upload your employment documents securely
                                </Typography>
                            </Box>

                            {/* Modern Stepper Card */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    mb: 4,
                                    borderRadius: '24px',
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%)'
                                    }
                                }}
                            >
                                <Stepper activeStep={activeStep} alternativeLabel>
                                    {steps.map((step, index) => (
                                        <Step key={index}>
                                            <StepLabel
                                                onClick={() => handleStepChange(index)}
                                                sx={{ cursor: 'pointer' }}
                                                StepIconComponent={() => (
                                                    <Box
                                                        sx={{
                                                            width: 56,
                                                            height: 56,
                                                            borderRadius: '16px',
                                                            background: activeStep >= index
                                                                ? 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)'
                                                                : '#f1f5f9',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: activeStep >= index ? 'white' : '#94a3b8',
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            border: activeStep >= index ? 'none' : '2px solid #e2e8f0',
                                                            cursor: 'pointer',
                                                            boxShadow: activeStep >= index ? '0 8px 24px rgba(37, 99, 235, 0.3)' : 'none',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px) scale(1.05)',
                                                                boxShadow: activeStep >= index 
                                                                    ? '0 12px 32px rgba(37, 99, 235, 0.4)' 
                                                                    : '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        {React.cloneElement(step.icon, { sx: { fontSize: 28 } })}
                                                    </Box>
                                                )}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: activeStep === index ? 700 : 500,
                                                        color: activeStep === index ? '#2563eb' : '#64748b',
                                                        mt: 1.5,
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    {step.label}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Paper>

                            {/* Content Sections */}
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
            </Box>
        </Box>
    );
}

export default DocumentsPage;