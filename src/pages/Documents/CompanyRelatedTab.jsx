import { 
    Box, 
    Grid, 
    Typography, 
    Paper, 
    Divider, 
    useTheme, 
    Fade, 
    Zoom, 
    Chip, 
    Avatar, 
    Tooltip
} from '@mui/material';
import React, { useState } from 'react';
import { Business, Description, HelpOutline } from '@mui/icons-material';

function CompanyRelatedTab({ category, formData, handleFileChange, newFiles }) {
    const theme = useTheme();
    const [dragOver, setDragOver] = useState({}); // Track drag-over state for each document

    // Shortened document names and their tooltip instructions
    const documentLabels = category.documents.map(doc => ({
        label: doc.split(' ').slice(0, 2).join(' '), // Shorten to first two words
        instruction: {
            'Incorporation Certificate': 'Upload a clear scan or photo of your Incorporation Certificate (PDF, JPG, or PNG).',
            'GST Certificate': 'Upload your GST Registration Certificate (PDF or image).',
            'Company PAN': 'Upload your Company PAN Card (PDF or image).',
            'MOA': 'Upload your Memorandum of Association (PDF only).',
            'AOA': 'Upload your Articles of Association (PDF only).',
        }[doc] || `Upload a valid ${doc} in PDF, JPG, or PNG format.` // Fallback instruction
    }));

    // Handle drag-and-drop
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
            console.log({ doc, file, newFiles, formData }); // Debug log
            handleFileChange(doc)({ target: { files: [file] } });
        } else {
            alert('Please upload a PDF, JPG, or PNG file.');
        }
    };

    return (
        <Fade in={true} timeout={800}>
            <Paper 
                elevation={5}
                sx={{
                    p: 3,
                    borderRadius: '16px',
                    background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                    boxShadow: `0 10px 40px ${theme.palette.grey[400]}30`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 14px 56px ${theme.palette.grey[500]}40`,
                    },
                    maxWidth: 900,
                    mx: 'auto',
                    width: '100%',
                    border: `1px solid ${theme.palette.primary.light}30`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <Business sx={{ color: theme.palette.primary.main, fontSize: 30 }} />
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: theme.palette.primary.dark,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                        }}
                    >
                        {category.title}
                    </Typography>
                </Box>
                <Divider 
                    sx={{ 
                        mb: 2.5, 
                        borderColor: theme.palette.primary.light,
                        borderWidth: 1.2,
                    }} 
                />
                <Grid container spacing={2}>
                    {category.documents.map((doc, docIndex) => (
                        <Grid item xs={12} key={docIndex}>
                            <Zoom in={true} style={{ transitionDelay: `${docIndex * 150}ms` }}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: theme.palette.background.default,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: theme.palette.grey[100],
                                        boxShadow: `0 0 0 4px ${theme.palette.primary.light}20`,
                                    },
                                    mb: 1,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                color: theme.palette.text.primary,
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}
                                        >
                                            <Description sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                                            {documentLabels[docIndex].label}
                                        </Typography>
                                        <Tooltip 
                                            title={documentLabels[docIndex].instruction} 
                                            arrow
                                            placement="bottom"
                                        >
                                            <HelpOutline 
                                                sx={{ 
                                                    color: theme.palette.info.main, 
                                                    fontSize: 16,
                                                    cursor: 'pointer'
                                                }} 
                                            />
                                        </Tooltip>
                                    </Box>
                                    <Box
                                        component="label"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '200px',
                                            height: '40px',
                                            border: `2px dashed ${dragOver[doc] ? theme.palette.primary.main : theme.palette.grey[400]}`,
                                            borderRadius: '8px',
                                            backgroundColor: dragOver[doc] ? theme.palette.primary.light : theme.palette.grey[50],
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: dragOver[doc] ? theme.palette.primary.light : theme.palette.grey[100],
                                                borderColor: theme.palette.primary.light,
                                            },
                                        }}
                                        onDragOver={handleDragOver(doc)}
                                        onDragLeave={handleDragLeave(doc)}
                                        onDrop={handleDrop(doc)}
                                    >
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: dragOver[doc] ? theme.palette.primary.contrastText : theme.palette.primary.main,
                                                fontWeight: 500,
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Upload or Drag & Drop
                                        </Typography>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.png"
                                            onChange={(e) => {
                                                console.log({ doc, newFiles, formData }); // Debug log
                                                handleFileChange(doc)(e);
                                            }}
                                            hidden
                                        />
                                    </Box>
                                    {(newFiles[doc] || (Array.isArray(formData?.files) && formData.files.find(file => file?.name?.toLowerCase()?.includes(doc.toLowerCase())))) && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                            <Chip 
                                                label="Uploaded" 
                                                color="success" 
                                                size="small" 
                                                sx={{ fontWeight: 500, fontSize: '0.8rem' }}
                                            />
                                            {newFiles[doc] && (
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: theme.palette.text.secondary,
                                                        maxWidth: '300px',
                                                        textOverflow: 'ellipsis',
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {newFiles[doc].name}
                                                </Typography>
                                            )}
                                            {Array.isArray(formData?.files) && formData.files.find(file => file?.name?.toLowerCase()?.includes(doc.toLowerCase())) && (
                                                <Tooltip 
                                                    title={formData.files.find(file => file?.name?.toLowerCase()?.includes(doc.toLowerCase())).name} 
                                                    arrow
                                                >
                                                    <Avatar
                                                        component="a"
                                                        href={formData.files.find(file => file?.name?.toLowerCase()?.includes(doc.toLowerCase())).url}
                                                        download
                                                        sx={{
                                                            width: 30,
                                                            height: 30,
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                boxShadow: theme.shadows[8]
                                                            },
                                                            backgroundColor: theme.palette.primary.light
                                                        }}
                                                    >
                                                        <Description sx={{ fontSize: 18 }} />
                                                    </Avatar>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Zoom>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Fade>
    );
}

export default CompanyRelatedTab;