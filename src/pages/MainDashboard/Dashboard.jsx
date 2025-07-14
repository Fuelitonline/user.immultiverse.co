import { Box, Grid, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useGet } from '../../hooks/useApi';
import { useAuth } from '../../middlewares/auth';
import ProfileNav from '../../components/user/profiveNav';
import { motion } from 'framer-motion';
import CalendarViewAttendance from '../MainAttendance/calenderViewAttendance';
import AttendanceDonutChart from './AttendancePieChart';
import Chart from './Chart';
import EmployeeInfoCards from './EmployeeInfoCard';
import CustomEventSection from './CustomEventSection'; // Import the new component

function DashboardPage() {
  const { user } = useAuth();
  const id = user?._id;
  const [empDetails, setEmpDetails] = useState({});
  const [leaveData, setLeaveData] = useState([]);
  const { data: emp, isLoading: empLoading } = useGet('employee/employee-details', { empId: user?._id });
  const { data: leaves, isLoading: leavesLoading } = useGet('employee/leave/get-by-id', { employeeId: user?._id });
  const canViewSensitive = user?.role === "superAdmin" || user?.role === "admin" || user?.role === "Manager" || id === user?._id;

  const getDateDifference = (startDate) => {
    if (!startDate) return { years: 0, months: 0 };
    const start = new Date(startDate);
    const end = new Date();
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
      const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years, months };
  };

  const difference = getDateDifference(empDetails?.joiningDate);

  useEffect(() => {
    if (emp?.data?.data) {
      setEmpDetails(emp.data.data);
    }
  }, [emp]);

  useEffect(() => {
    if (leaves?.data?.data) {
      const leaveData = leaves?.data?.data?.leaveData;
      const setAbleData = [
        {
          name: "Annual Leave",
          value: leaveData?.annual || 0,
          remaining: (leaveData?.remainingCasualLeave || 0) + (leaveData?.remainingSickLeave || 0),
        },
        {
          name: "Sick Leave",
          value: leaveData?.sick || 0,
          remaining: leaveData?.remainingSickLeave || 0,
        },
        {
          name: "Casual Leave",
          value: leaveData?.casual || 0,
          remaining: leaveData?.remainingCasualLeave || 0,
        },
      ];
      setLeaveData(setAbleData);
    }
  }, [leaves]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const maskSensitiveInfo = (info) => {
    return canViewSensitive ? info : '••••••';
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '1400px',
        mx: 'auto',
        px: { xs: 2, sm: 4 },
        gap: 4,
        py: 6,
        overflowX: 'hidden',
      }}
    >
      {/* Profile Navigation */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <Grid container spacing={2} sx={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
          <Grid item xs={12} container justifyContent='flex-end'>
            <ProfileNav />
          </Grid>
        </Grid>
      </Box>

      {/* Employee Info Cards, Leave Charts, Attendance Chart, and Custom Event Section */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {empLoading || leavesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress color="primary" size={50} />
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ maxWidth: '1200px' }}>
            <Grid item xs={12}>
              <EmployeeInfoCards
                empDetails={empDetails}
                canViewSensitive={canViewSensitive}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                difference={difference}
              />
            </Grid>
            <Grid container item xs={12} spacing={4}>
              {leaveData.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Chart data={item} />
                </Grid>
              ))}
              {/* Attendance Pie Chart */}
              <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                <AttendanceDonutChart />
              </Grid>
            </Grid>
            {/* Calendar View and Custom Event Section in the same line */}
            <Grid container item xs={12} spacing={4}>
              <Grid item xs={12} md={6}>
                <CalendarViewAttendance size={{ height: { xs: '320px', md: '400px' }, width: '100%' }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomEventSection />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default DashboardPage;