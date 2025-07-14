import React, { useState, useEffect } from 'react';
import ProfileNav from '../../components/user/profiveNav'; // Ensure this path is correct
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Button,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useGet } from '../../hooks/useApi'; // Adjust the path based on your project structure
import PropTypes from 'prop-types';

const Candidates = () => {
  const [candidatesData, setCandidatesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Department');

  // Placeholder API endpoint (replace with actual endpoint later)
  const {
    data: candidates,
    isLoading,
    error,
    refetch,
  } = useGet(
    '/candidates/all', // Placeholder API endpoint
    {}, // Query parameters (can be updated later)
    {}, // Additional options
    { queryKey: 'candidates' } // Query key for caching
  );

  // Update candidatesData when API data is fetched
  useEffect(() => {
    if (candidates?.data?.data) {
      setCandidatesData(candidates.data.data);
    }
  }, [candidates]);

  // Filter candidates based on search query and department
  const filteredCandidates = candidatesData.filter((candidate) => {
    const matchesSearch = candidate.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.appliedfor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === 'All Department' ||
      candidate.appliedfor === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const headerStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    px: '12px',
    py: '10px',
    borderRight: '1px solid #D1D5DB',
    bgcolor: '#E5E7EB',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  };

  const cellStyle = {
    fontSize: '12px',
    color: '#1F2937',
    px: '12px',
    borderRight: '1px solid #D1D5DB',
    whiteSpace: 'nowrap',
  };

  return (
    <Box
      sx={{
        fontFamily: 'Montserrat',
        width: '98%',
        mx: 'auto',
        minHeight: '100vh',
        py: 4,
        mr: 2,
        overflow: 'hidden',
        // bgcolor: '#F9FAFB',
      }}
    >
      <Grid container spacing={1} p={3}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <ProfileNav />
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
              maxWidth: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography
                  sx={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1F2937',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Candidates
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    placeholder="Search candidates, department, etc."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        '& fieldset': { border: '1px solid #D1D5DB' },
                        '&:hover fieldset': { border: '1px solid #9CA3AF' },
                        '&.Mui-focused fieldset': { border: '2px solid #3B82F6' },
                      },
                      '& .MuiInputBase-input': { padding: '10px 14px', color: '#1F2937' },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#6B7280', fontSize: '20px' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl sx={{ minWidth: 140 }}>
                    <Select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      sx={{
                        fontSize: '14px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        '& .MuiSelect-select': { padding: '10px 14px', color: '#1F2937' },
                        '& fieldset': { border: '1px solid #D1D5DB' },
                        '&:hover fieldset': { border: '1px solid #9CA3AF' },
                        '&.Mui-focused fieldset': { border: '2px solid #3B82F6' },
                      }}
                    >
                      <MenuItem value="All Department">All Department</MenuItem>
                      <MenuItem value="Information Technology">IT</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Human Resources">Human Resources</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                      <MenuItem value="Operations">Operations</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {error && (
                <Typography sx={{ color: '#EF4444', textAlign: 'center', my: 4 }}>
                  Error fetching candidates: {error.message}
                </Typography>
              )}

              {!isLoading && !error && (
                <Box
                  sx={{
                    overflowX: 'auto',
                    borderRadius: '12px',
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#F1F5F9',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#64748B',
                      borderRadius: '4px',
                      '&:hover': {
                        background: '#475569',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,
                      border: '1px solid #D1D5DB',
                      borderRadius: '12px',
                      minWidth: '2400px',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        padding: '12px',
                        gap: 0,
                        alignItems: 'center',
                        bgcolor: '#E5E7EB',
                        height: '48px',
                        borderBottom: '1px solid #D1D5DB',
                      }}
                    >
                      <Typography sx={{ ...headerStyle, width: '130px' }}>Work From</Typography>
                      <Typography sx={{ ...headerStyle, width: '220px' }}>Name</Typography>
                      <Typography sx={{ ...headerStyle, width: '160px' }}>Phone Number</Typography>
                      <Typography sx={{ ...headerStyle, width: '200px' }}>Email</Typography>
                      <Typography sx={{ ...headerStyle, width: '130px' }}>Sourcing From</Typography>
                      <Typography sx={{ ...headerStyle, width: '220px' }}>Applied For</Typography>
                      <Typography sx={{ ...headerStyle, width: '130px' }}>Role</Typography>
                      <Typography sx={{ ...headerStyle, width: '240px' }}>Education</Typography>
                      <Typography sx={{ ...headerStyle, width: '240px' }}>Last/Current Job</Typography>
                      <Typography sx={{ ...headerStyle, width: '130px' }}>Last Salary</Typography>
                      <Typography sx={{ ...headerStyle, width: '160px' }}>Work Experience</Typography>
                      <Typography sx={{ ...headerStyle, width: '130px' }}>City</Typography>
                      <Typography sx={{ ...headerStyle, width: '160px' }}>State</Typography>
                      <Typography sx={{ ...headerStyle, width: '150px', borderRight: 'none' }}>Resume</Typography>
                    </Box>
                    {filteredCandidates.map((candidate, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0,
                          py: '12px',
                          px: '8px',
                          bgcolor: index % 2 === 0 ? '#F9FAFB' : '#E7EAEE',
                          borderBottom: index === filteredCandidates.length - 1 ? 'none' : '1px solid #D1D5DB',
                          transition: 'background-color 0.2s ease',
                          '&:hover': {
                            bgcolor: '#DBEAFE',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                          },
                        }}
                      >
                        <Typography sx={{ ...cellStyle, width: '130px' }}>{candidate.workfrom}</Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            width: '220px',
                            px: '12px',
                            borderRight: '1px solid #D1D5DB',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '12px',
                              color: '#1F2937',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {candidate.name}
                          </Typography>
                        </Box>
                        <Typography sx={{ ...cellStyle, width: '160px' }}>{candidate.phone}</Typography>
                        <Typography sx={{ ...cellStyle, width: '200px' }}>{candidate.email}</Typography>
                        <Typography sx={{ ...cellStyle, width: '130px' }}>{candidate.sourcingfrom}</Typography>
                        <Typography sx={{ ...cellStyle, width: '220px' }}>{candidate.appliedfor}</Typography>
                        <Typography sx={{ ...cellStyle, width: '130px' }}>{candidate.role}</Typography>
                        <Typography sx={{ ...cellStyle, width: '240px' }}>{candidate.education}</Typography>
                        <Typography sx={{ ...cellStyle, width: '240px' }}>{candidate.lastorcurrentjob}</Typography>
                        <Typography sx={{ ...cellStyle, width: '130px' }}>{candidate.lastsalary}</Typography>
                        <Typography sx={{ ...cellStyle, width: '160px' }}>
                          {candidate.workexperience} years
                        </Typography>
                        <Typography sx={{ ...cellStyle, width: '130px' }}>{candidate.city}</Typography>
                        <Typography sx={{ ...cellStyle, width: '160px' }}>{candidate.state}</Typography>
                        <Box
                          sx={{
                            width: '150px',
                            px: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: 'none',
                          }}
                        >
                          {candidate.resume ? (
                            <Button
                              href={candidate.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="contained"
                              size="small"
                              sx={{
                                fontSize: '12px',
                                fontWeight: 500,
                                textTransform: 'none',
                                bgcolor: '#3B82F6',
                                color: '#FFFFFF',
                                borderRadius: '8px',
                                px: 2,
                                py: 0.5,
                                whiteSpace: 'nowrap',
                                '&:hover': {
                                  bgcolor: '#2563EB',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                },
                              }}
                            >
                              View
                            </Button>
                          ) : (
                            <Typography sx={{ fontSize: '14px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                              N/A
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

Candidates.propTypes = {
  // No props are passed to this component, but included for consistency
};

export default Candidates;