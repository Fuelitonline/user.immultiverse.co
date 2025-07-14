import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Box, Grid, Popover, List, ListItem, ListItemText
} from '@mui/material';
import { Pending, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';

// Mock data for cards
const initialLeaves = [
  { id: 1, employeeName: 'John Doe', leaveType: 'Annual Leave', status: 'Approved' },
  { id: 2, employeeName: 'Jane Smith', leaveType: 'Sick Leave', status: 'Requested' },
  { id: 3, employeeName: 'Mike Johnson', leaveType: 'Personal Leave', status: 'Rejected' },
  { id: 4, employeeName: 'Sarah Wilson', leaveType: 'Half Day', status: 'Approved' },
  { id: 5, employeeName: 'David Brown', leaveType: 'Half Day', status: 'Requested' },
];

const cardStyle = (status) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  bgcolor: 
    status === 'Requested' ? '#F59E0B' :
    status === 'Approved' ? '#388E3C' :
    status === 'Rejected' ? '#EF4444' : '#6B7280',
  color: '#FFFFFF',
  p: 2,
  transition: 'transform 0.2s, box-shadow 0.15s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
  }
});

const iconBgStyle = (status) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mr: 1
});

const Leavecards = () => {
  const [leaves] = useState(initialLeaves);
  const [cardPopoverAnchor, setCardPopoverAnchor] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const requestedCount = leaves.filter(leave => leave.status === 'Requested').length;
  const approvedCount = leaves.filter(leave => leave.status === 'Approved').length;
  const rejectedCount = leaves.filter(leave => leave.status === 'Rejected').length;
  const halfDayCount = leaves.filter(leave => leave.leaveType === 'Half Day').length;

  const getEmployeesByStatus = (status) => 
    leaves.filter(leave => leave.status === status).map(leave => leave.employeeName);

  const getHalfDayEmployees = () => 
    leaves.filter(leave => leave.leaveType === 'Half Day').map(leave => leave.employeeName);

  const handleCardPopoverOpen = (event, status) => {
    setCardPopoverAnchor(event.currentTarget);
    setSelectedStatus(status);
  };

  const handleCardPopoverClose = () => {
    setCardPopoverAnchor(null);
    setSelectedStatus(null);
  };

  return (
    <>
      <Grid container spacing={2} mb={4} sx={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
        {['Requested', 'Approved', 'Rejected', 'Half Day'].map((status) => (
          <Grid item xs={12} sm={6} md={3} key={status}>
            <Card sx={cardStyle(status)}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                    {status === 'Half Day' ? 'Half Day Leaves' : `${status} Leaves`}
                  </Typography>
                  <Typography 
                    sx={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', mt: 1, cursor: 'pointer' }}
                    onClick={(e) => handleCardPopoverOpen(e, status)}
                  >
                    {status === 'Requested' ? requestedCount :
                     status === 'Approved' ? approvedCount :
                     status === 'Rejected' ? rejectedCount : halfDayCount}
                  </Typography>
                </Box>
                <Box sx={iconBgStyle(status)}>
                  {status === 'Requested' && <Pending sx={{ color: '#F59E0B', fontSize: 24 }} />}
                  {status === 'Approved' && <CheckCircle sx={{ color: '#388E3C', fontSize: 24 }} />}
                  {status === 'Rejected' && <Cancel sx={{ color: '#EF4444', fontSize: 24 }} />}
                  {status === 'Half Day' && <HourglassEmpty sx={{ color: '#6B7280', fontSize: 24 }} />}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Popover
        open={Boolean(cardPopoverAnchor)}
        anchorEl={cardPopoverAnchor}
        onClose={handleCardPopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            bgcolor: '#FFFFFF',
            p: 2,
            maxHeight: '300px',
            overflowY: 'auto'
          }
        }}
      >
        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', mb: 2 }}>
          {selectedStatus === 'Half Day' ? 'Half Day Employees' : `${selectedStatus} Leave Employees`}
        </Typography>
        <List dense>
          {(selectedStatus === 'Half Day' ? getHalfDayEmployees() : getEmployeesByStatus(selectedStatus)).map((name, index) => (
            <ListItem key={index}>
              <ListItemText primary={name} sx={{ color: '#1F2937' }} />
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};

export default Leavecards;