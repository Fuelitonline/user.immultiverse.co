import { 
    Box, 
    Grid, 
    Typography, 
    Paper, 
    Divider, 
    Fade, 
    Zoom, 
    Chip, 
    Avatar, 
    Tooltip
} from '@mui/material';
import React, { useState } from 'react';
import { School, Description, HelpOutline, CheckCircle, CloudUpload } from '@mui/icons-material';

function EducationalDocumentsTab({ category, formData, handleFileChange, newFiles }) {
    const [dragOver, setDragOver] = useState({});

    const documentLabels = category.documents.map(doc => ({
        label: doc.split(' ').slice(0, 3).join(' '),
        fullName: doc,
        instruction: {
            '10th Marksheet / Certificate': 'Upload a clear scan of your 10th standard marksheet or certificate (PDF, JPG, or PNG).',
            '12th Marksheet / Certificate': 'Upload a clear scan of your 12th standard marksheet or certificate (PDF, JPG, or PNG).',
            'Diploma Certificate (if applicable)': 'Upload your Diploma certificate if applicable (PDF, JPG, or PNG).',
            "Bachelor's Degree Certificate & Marksheets": "Upload your Bachelor's degree certificate and marksheets (PDF, JPG, or PNG).",
            "Master's Degree Certificate & Marksheets (if applicable)": "Upload your Master's degree certificate and marksheets if applicable (PDF, JPG, or PNG).",
        }[doc] || `Upload a valid ${doc} in PDF, JPG, or PNG format.`
    }));

    const handleDragOver = (doc) => (e) => {
        e.preventDefault();
        setDragOver((prev) => ({ ...prev, [doc]: true }));
    };

    const handleDragLeave = (doc) => () => {
        setDragOver((prev) => ({ ...prev, [doc]: false }));
    };

    const handleDrop = (doc) => (e) => {
        e.preventDefault();
        setDragOver((prev) => ({ ...prev, [doc]: false }));
        const file = e.dataTransfer.files[0];
        if (file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
            console.log({ doc, file, newFiles, formData });
            handleFileChange(doc)({ target: { files: [file] } });
        } else {
            alert('Please upload a PDF, JPG, or PNG file.');
        }
    };

    return (
        <Fade in={true} timeout={800}>
            <Paper 
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: '24px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    },
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <School sx={{ color: '#2563eb', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                color: '#1e293b',
                                fontWeight: 700,
                                letterSpacing: -0.5,
                            }}
                        >
                            {category.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Upload your educational certificates and marksheets
                        </Typography>
                    </Box>
                </Box>
                
                <Divider sx={{ mb: 4, borderColor: '#e2e8f0' }} />
                
                <Grid container spacing={3}>
                    {category.documents.map((doc, docIndex) => {
                        const isUploaded = newFiles[doc] || (Array.isArray(formData?.files) && formData.files.find(file => file?.name?.toLowerCase()?.includes(doc.toLowerCase())));
                        
                        return (
                            <Grid item xs={12} key={docIndex}>
                                <Zoom in={true} style={{ transitionDelay: `${docIndex * 100}ms` }}>
                                    <Box sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        background: '#ffffff',
                                        border: `2px solid ${isUploaded ? '#10b981' : '#e2e8f0'}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: isUploaded ? '#059669' : '#60a5fa',
                                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: '250px' }}>
                                                <Box sx={{ 
                                                    p: 1, 
                                                    borderRadius: '10px', 
                                                    background: isUploaded ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Description sx={{ color: isUploaded ? '#10b981' : '#64748b', fontSize: 20 }} />
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography 
                                                        variant="subtitle1" 
                                                        sx={{ 
                                                            color: '#1e293b',
                                                            fontWeight: 600,
                                                            fontSize: '1rem',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {documentLabels[docIndex].label}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                        PDF, JPG or PNG • Max 10MB
                                                    </Typography>
                                                </Box>
                                                <Tooltip title={documentLabels[docIndex].instruction} arrow placement="top">
                                                    <HelpOutline 
                                                        sx={{ 
                                                            color: '#0ea5e9', 
                                                            fontSize: 18,
                                                            cursor: 'pointer',
                                                            flexShrink: 0
                                                        }} 
                                                    />
                                                </Tooltip>
                                            </Box>
                                            {isUploaded && (
                                                <Chip
                                                    icon={<CheckCircle />}
                                                    label="Uploaded"
                                                    size="small"
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                                                        color: '#059669',
                                                        fontWeight: 600,
                                                        border: 'none',
                                                        '& .MuiChip-icon': { 
                                                            color: '#10b981' 
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        <Box
                                            component="label"
                                            onDragOver={handleDragOver(doc)}
                                            onDragLeave={handleDragLeave(doc)}
                                            onDrop={handleDrop(doc)}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: '140px',
                                                borderRadius: '12px',
                                                border: `2px dashed ${dragOver[doc] ? '#2563eb' : '#cbd5e1'}`,
                                                background: dragOver[doc] ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#f8fafc',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: '#2563eb',
                                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                                },
                                            }}
                                        >
                                            {isUploaded ? (
                                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 56,
                                                            height: 56,
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            mx: 'auto',
                                                            mb: 1.5,
                                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                        }}
                                                    >
                                                        <CheckCircle sx={{ fontSize: 28 }} />
                                                    </Avatar>
                                                    {newFiles[doc] && (
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                color: '#1e293b',
                                                                fontWeight: 600,
                                                                mb: 0.5,
                                                                maxWidth: '280px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {newFiles[doc].name}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                        Click to replace file
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                                    <Box
                                                        sx={{
                                                            width: 56,
                                                            height: 56,
                                                            borderRadius: '14px',
                                                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mx: 'auto',
                                                            mb: 1.5,
                                                        }}
                                                    >
                                                        <CloudUpload sx={{ color: '#2563eb', fontSize: 28 }} />
                                                    </Box>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: '#1e293b', 
                                                            fontWeight: 600,
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        Click to upload or drag & drop
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                        PDF, JPG or PNG (Max 10MB)
                                                    </Typography>
                                                </Box>
                                            )}
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    console.log({ doc, newFiles, formData });
                                                    handleFileChange(doc)(e);
                                                }}
                                                hidden
                                            />
                                        </Box>

                                        {Array.isArray(formData?.files) && formData.files.find(file => file?.name?.toLowerCase()?.includes(doc.toLowerCase())) && (
                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                                <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
                                                    Previously uploaded:
                                                </Typography>
                                                <Tooltip 
                                                    title="Download file" 
                                                    arrow
                                                >
                                                    <Box
                                                        component="a"
                                                        href={formData.files.find(file => file?.name?.toLowerCase()?.includes(doc.toLowerCase())).url}
                                                        download
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            p: 1.5,
                                                            borderRadius: '10px',
                                                            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                                            textDecoration: 'none',
                                                            transition: 'all 0.3s',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                            },
                                                        }}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                                            }}
                                                        >
                                                            <Description sx={{ fontSize: 18 }} />
                                                        </Avatar>
                                                        <Typography 
                                                            variant="caption" 
                                                            sx={{ 
                                                                color: '#1e293b',
                                                                fontWeight: 600,
                                                                maxWidth: '200px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {formData.files.find(file => file?.name?.toLowerCase()?.includes(doc.toLowerCase())).name}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </Box>
                                </Zoom>
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>
        </Fade>
    );
}

export default EducationalDocumentsTab;