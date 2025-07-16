import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Fade,
  Tooltip,
  Avatar,
  Link
} from '@mui/material';
import { useTheme } from '@emotion/react';
import { useDrop } from 'react-dnd';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { server_url } from '../../utils/server';
import GetFileThumbnail from '../Profile/getFileThumnail';
import moment from 'moment';

function AddTaskDialog({
  open,
  onClose,
  selectedDate,
  description,
  setDescription,
  file,
  setFile,
  loading,
  setLoading,
  selectedTab,
  setSelectedTab,
  dailyWork,
  refetch,
  handleDelete,
  handlePopoverOpen,
  openFeedbackIndex,
  handleToggleFeedback
}) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!description.trim() || !file) {
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('description', description);
    formData.append('date', selectedDate);
    formData.append('file', file);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      };
      
      await axios.post(`${server_url}/emplyoee/daily-work/create`, formData, config);
      onClose();
      refetch();
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return moment(date).format('dddd, MMMM D, YYYY');
  };

  const getFileSizeText = (file) => {
    const size = file.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'file',
    drop: (item) => {
      const validFiles = item.files;
      if (validFiles.length > 0) setFile(validFiles[0]);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  function generetRandomColor() {
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#f43f5e', // Rose
      '#10b981', // Emerald
      '#14b8a6', // Teal
      '#06b6d4', // Cyan
      '#0ea5e9', // Sky
      '#3b82f6', // Blue
      '#8b5cf6', // Violet
      '#a855f7', // Purple
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      transitionDuration={300}
      maxWidth="md"
      PaperProps={{
        sx: {
          minWidth: 640,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          fontFamily: '"Inter", "Roboto", sans-serif',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 3,
        pt: 3,
        pb: 1
      }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}
          >
            {selectedTab === 0 ? 'Add New Task' : 'Your Daily Work'}
          </Typography>
          {selectedDate && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6b7280', 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5,
                mt: 0.5
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 14 }} />
              {formatDate(selectedDate)}
            </Typography>
          )}
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{
            color: '#6b7280',
            '&:hover': { bgcolor: '#f3f4f6' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        sx={{
          px: 3,
          mb: 2,
          '& .MuiTabs-indicator': { backgroundColor: '#6366f1', height: '3px' },
        }}
      >
        <Tab
          icon={<AddCircleOutlineIcon sx={{ fontSize: 16, mr: 1 }} />}
          iconPosition="start"
          label="Add Task"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: selectedTab === 0 ? '#6366f1' : '#6b7280',
            fontSize: '0.9rem',
            px: 2,
            // minHeight:3,
            minHeight: '48px'
          }}
        />
        <Tab
          icon={<VisibilityIcon sx={{ fontSize: 16, mr: 1 }} />}
          iconPosition="start"
          label="View Work"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: selectedTab === 1 ? '#6366f1' : '#6b7280',
            fontSize:  '0.9rem',
            px: 2,
            minHeight: '48px'
          }}
        />
      </Tabs>

      <DialogContent sx={{ p: 3, pb: 1 }}>
        {selectedTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              placeholder="What did you work on today?"
              variant="outlined"
              InputProps={{
                sx: { borderRadius: '10px' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#fff',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  '&:hover fieldset': { borderColor: '#6366f1' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root': { color: '#6b7280', fontWeight: 500 },
              }}
            />
            
            <Box
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              ref={drop}
              sx={{
                border: `2px dashed ${dragActive || isOver ? '#6366f1' : '#d1d5db'}`,
                borderRadius: '12px',
                p: 3,
                textAlign: 'center',
                bgcolor: dragActive || isOver ? '#eef2ff' : '#f9fafb',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { borderColor: '#6366f1', bgcolor: '#eef2ff' },
              }}
            >
              {!file ? (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <AttachFileIcon sx={{ fontSize: 36, color: '#6366f1' }} />
                    <Typography variant="body1" sx={{ color: '#4b5563', fontWeight: 500 }}>
                      Drag & drop a file here, or
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={triggerFileInput}
                      sx={{
                        textTransform: 'none',
                        color: '#6366f1',
                        borderColor: '#6366f1',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#eef2ff', borderColor: '#4f46e5' },
                      }}
                    >
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      onChange={handleFileSelect}
                    />
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                      Supported file types: images, PDFs, documents, videos
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  mt: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  bgcolor: 'white', 
                  p: 2, 
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <GetFileThumbnail fileType={file.type} fileUrl={URL.createObjectURL(file)} />
                    <Box>
                      <Typography variant="body1" sx={{ color: '#1f2937', fontWeight: 500 }}>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {getFileSizeText(file)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton 
                    onClick={() => setFile(null)} 
                    size="small"
                    sx={{ color: '#6b7280' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {selectedTab === 1 && (
          <Box sx={{ 
            maxHeight: '500px', 
            overflow: 'auto', 
            pr: 1, 
            width: '100%',
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 2
          }}>
            {dailyWork.length > 0 ? (
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                padding: 1,
                width: '110vh'
              }}>
                {dailyWork.map((work, index) => (
                  <Paper
                    key={index}
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      flex: '1 0 calc(33.333% - 0px)',
                      width: '33%',
                      bgcolor: '#fff',
                      height: 'auto',
                      minHeight: openFeedbackIndex === index ? 'auto' : '20lvh',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      transition: 'transform 0.2s ease',
                      border: '1px solid #f3f4f6',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937', textAlign: 'left' }}>
                          {work.description}  <span><KeyboardDoubleArrowRightIcon sx={{ fontSize: 16, color: '#6366f1', ml: 2 }}/>     <PersonIcon sx={{ fontSize: 16, color: '#6366f1' }} /> {work?.employeeId?.name}</span>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 14 }} />
                          {new Date(work.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Add Feedback">
                          <IconButton
                            onClick={(e) => handlePopoverOpen(e, work.file, work._id)}
                            size="small"
                            sx={{ 
                              color: '#6366f1', 
                              bgcolor: '#eef2ff', 
                              '&:hover': { bgcolor: '#dbeafe' } 
                            }}
                          >
                            <FeedbackIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Task">
                          <IconButton
                            onClick={() => handleDelete(work._id)}
                            size="small"
                            sx={{ 
                              color: '#ef4444', 
                              bgcolor: '#fef2f2', 
                              '&:hover': { bgcolor: '#fee2e2' } 
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Link to={work.file} target="_blank" rel="noopener noreferrer">
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 1,
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          bgcolor: '#f9fafb',
                          '&:hover': { bgcolor: '#f3f4f6' }
                        }}>
                          <GetFileThumbnail fileType={work.fileType} fileUrl={work.file} />
                          <Typography variant="body2" sx={{ ml: 1, color: '#4b5563' }}>
                            View File
                          </Typography>
                        </Box>
                      </Link>
                    </Box>
                    
                    {work.feedBack?.length > 0 && (
                      <>
                        <Button 
                          onClick={() => handleToggleFeedback(index)} 
                          size="small" 
                          sx={{ mt: 2, color: '#4f46e5', textTransform: 'none' }}
                        >
                          {openFeedbackIndex === index ? 'Hide Feedback' : 'Show Feedback'}
                        </Button>

                        {openFeedbackIndex === index && (
                          <Box sx={{ mt: 2, bgcolor: '#f9fafb', p: 2, borderRadius: '8px' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                              Feedback:
                            </Typography>
                            {work.feedBack.map((fb, idx) => (
                              <Box key={idx} sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: 1.5, 
                                mt: idx > 0 ? 2 : 0,
                                pb: idx < work.feedBack.length - 1 ? 2 : 0,
                                borderBottom: idx < work.feedBack.length - 1 ? '1px solid #e5e7eb' : 'none'
                              }}>
                                <Avatar sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: generetRandomColor(),
                                  fontSize: '14px',
                                  fontWeight: 600
                                }}>
                                  {(fb.feedbackGiverName || 'A').charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#4b5563' }}>
                                    {fb.feedbackGiverName || user?.companyName}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                                    "{fb.feedback}"
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </Paper>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center', 
                py: 6,
                width: '100%',
                textAlign: 'center'
              }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f3f4f6',
                  mb: 2
                }}>
                  <CalendarTodayIcon sx={{ fontSize: 28, color: '#9ca3af' }} />
                </Box>
                <Typography sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                  No work logged for this date
                </Typography>
                <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Switch to the "Add Task" tab to log your work
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2, bgcolor: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            color: '#6b7280',
            fontWeight: 600,
            px: 1,
            '&:hover': { bgcolor: '#e5e7eb' },
          }}
        >
          Cancel
        </Button>
        {selectedTab === 0 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !file || !description.trim()}
            sx={{
              textTransform: 'none',
              bgcolor: '#6366f1',
              px: 1,
              py: 1,
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' },
              '&:disabled': { bgcolor: '#d1d5db' },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Task'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AddTaskDialog;