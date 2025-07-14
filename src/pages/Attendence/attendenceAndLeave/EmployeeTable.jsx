import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Grid,
  TablePagination,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import { DateTime } from "luxon";
import { useGet } from "../../../hooks/useApi";
import GetLeaveStatusAndAction from "./GetLeave";
import { Link } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { Padding } from "@mui/icons-material";
import AddPaymentMethodModal from "./Payment";
import GetPaymentDate from "./GetPaymentDate";
import { useAuth } from "../../../middlewares/auth";
import UpdateSalerySlips from "./UpdateSalerySlips";
import GetProgress from "./GetProgress";
import ApproveAbsent from "./ApproveAbsent";
import PropTypes from "prop-types";
import ProfileNav from '../../../components/user/profiveNav';
import GlassEffect from "../../../theme/glassEffect"; // Assuming GlassEffect is imported from a file

// Sample Employee Data
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

// Define the range of years: 100 years back to 100 years forward
const years = Array.from(
  { length: 201 },
  (_, index) => currentYear - 100 + index
);
const months = Array.from({ length: 12 }, (_, index) => index);

// Helper function to get the days in a given month using Luxon
const getDaysInMonth = (month, year) => {
  const startOfMonth = DateTime.fromObject({ month: month + 1, year });
  const daysInMonth = startOfMonth.daysInMonth;
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = startOfMonth.set({ day: index + 1 });
    return day.toFormat("d MMM yyyy"); // Format as "1 Oct 2024"
  });

  return days;
};
const getWeekdaysInMonth = (month, year) => {
  const startOfMonth = DateTime.fromObject({ month: month + 1, year });
  const daysInMonth = startOfMonth.daysInMonth;

  const weekdays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = startOfMonth.set({ day: index + 1 });
    return day.weekday % 7; // Adjust Luxon weekday to start from 0 (Sunday)
  });

  return weekdays;
};
function EmployeeTable({ employees: propEmployees }) {
  const [employeesData, setEmployeeData] = useState({}); // Employee attendance data
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // Default to October
  const [selectedYear, setSelectedYear] = useState(currentYear); // Default to 2024
  const [selectedCell, setSelectedCell] = useState(null); // Track the selected cell
  const [page, setPage] = useState(0); // Track the current page
  const [rowsPerPage, setRowsPerPage] = useState(11); // Number of rows per page
  const [employeeIds, setEmployeeIds] = useState([]); // Store employee IDs for the current page
  const [employees, setEmployee] = useState(propEmployees || []);
  const [paymentDate, setPaymentDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [paidStatus, setStatus] = useState(false);
  const [currentLeaves, setCurrentLeaves] = useState([])
  const [updateSalerySlipModel, setUpdatesalerySlipModel] = useState(false)
  const [progress, setProgress] = useState([])
  const {user} = useAuth()
  const { data: progressData } = useGet('/emplyoee/daily-work/work-progress-get-month-wise', {
    employeeId: employeeIds.join(",") ,
    year: selectedYear,
    month: selectedMonth + 1
});
const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
const [approvePopover, setApprovePopover] = useState(null)
const cellRef = useRef(null);

const handleCellClick = (date, employeeId) => {
  setApprovePopover({ date : date, employeeId :employeeId });
};
  const {
    data: employee,
    refetch: refetchEmployees,
    isLoading,
  } = useGet("employee/all", {}, {}, { queryKey: "employees" });
  const { data: leaves, refetch } = useGet(
    "employee/leave/get-all-by-month",
    {
      month: selectedMonth + 1,
      year: selectedYear,
    },
    {},
    { queryKey: "leave" }
  );

  const { data: payment } = useGet(
    "/company/salery/get-model",
    {},
    {},
    { queryKey: "payment" }
  );
  useEffect(() => {
    if (leaves?.data?.data) {
      setCurrentLeaves(leaves?.data?.data);
    }
    if (progressData?.data) {
        setProgress(progressData?.data)
    }
  }, [leaves,progressData]);
  useEffect(() => {
    if (employee?.data?.message) {
      setEmployee(propEmployees || employee?.data?.message[0]);
    }
    if (payment?.data) {
      setPaymentDate(payment?.data?.data);
    }
  }, [employee, payment, propEmployees]);
  // API Call to fetch daily records and policy data
  const { data: dailyRecords, error: recordsError , refetch:dailyRecordsRefetch} = useGet(
    "employee/work-tracking/daily-records-multipal",
    {
      userId: employeeIds.join(","),
      startDate: DateTime.fromObject({
        year: selectedYear,
        month: selectedMonth + 1,
        day: 1,
      }).toISODate(),
      endDate: DateTime.fromObject({
        year: selectedYear,
        month: selectedMonth + 1,
      })
        .endOf("month")
        .toISODate(),
    },
    { enabled: employeeIds.length > 0 }, // Only make the call when employeeIds is not empty
    { queryKey: "dailyRecords" }
  );

  const { data: policyData, error: policyError } = useGet(
    "company/policy/attendece-get",
    { employeeId: employeeIds.join(",") },
    { enabled: employeeIds.length > 0 },
    { queryKey: "policyData" }
  );

  // Deep merge function for handling nested objects and arrays
  const deepMerge = (target, source) => {
    if (
      target &&
      source &&
      typeof target === "object" &&
      typeof source === "object"
    ) {
      Object.keys(source).forEach((key) => {
        if (Array.isArray(target[key]) && Array.isArray(source[key])) {
          target[key] = [...target[key], ...source[key]];
        } else if (
          typeof target[key] === "object" &&
          typeof source[key] === "object"
        ) {
          target[key] = deepMerge({ ...target[key] }, source[key]);
        } else {
          target[key] = source[key];
        }
      });
    }
    return target;
  };

   const handleOpenPopover = ()=>{
          setApprovePopover(!approvePopover)
   }
  const fetchEmployeeData = async () => {
    if (recordsError || policyError) {
      return;
    }

    const employeeData = policyData?.data?.data || [];
    const attendanceData = dailyRecords?.data?.data?.employees || [];

    // Merge employee data with attendance data
    const mergedData = employeeData.map((employee) => {
      const attendance = attendanceData.find(
        (att) => att.userId === employee.employeeId
      );

      // Merge the employee data with the attendance (currentStatus and records)
      const mergedEmployeeData = deepMerge(
        { ...employee },
        {
          currentStatus: attendance?.currentStatus || {
            isPunchedIn: false,
            punchIn: null,
          },
          records: attendance?.records || [], // Merge the attendance records
          workingDays: attendance?.workingDays || {}, // Merge workingDays (0-6)
        }
      );

      return mergedEmployeeData;
    });
    // Set merged data into state
    setEmployeeData((prevData) => {
      const updatedData = {};
      mergedData.forEach((employee) => {
        updatedData[employee._id] = employee; // Use _id as the key, merged employee data as value
      });
      return updatedData;
    });
  };

  const isMarkAsPaidDisabled = () => {
    const selectedDate = DateTime.fromObject({
      month: selectedMonth + 1,
      year: selectedYear,
    });
    const currentDate = DateTime.local(); // Get the current date using Luxon

    // Disable if selected month/year is in the future
    return selectedDate > currentDate;
  };

  // Fetch data for the current page's employee IDs
  useEffect(() => {
    if (employeeIds.length > 0) {
      fetchEmployeeData(); // Fetch employee data if employee IDs are available
    }
  }, [employeeIds, selectedMonth, selectedYear, dailyRecords, policyData]);

  // Update employeeIds based on the current page and rowsPerPage
  useEffect(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const newEmployeeIds = employees
      ?.slice(startIndex, endIndex)
      .map((employee) => employee._id);
    setEmployeeIds(newEmployeeIds); // Set employee IDs to fetch data for the current page
  }, [page, rowsPerPage, employees]);

  const getStatusColor = (status) => {
    if (status === "Present") {
      return "#1e9ed9"; // Light blue for "Present"
    } else if (status === "Absent") {
      return "#e80c43"; // Light red for "Absent"
    } else if (status === "Weekend") {
      return "#ed8709"; // Light orange for "Weekend"
    }
    return "transparent"; // Default for empty status
  };

  const getBGColor = (status) => {
    if (status === "Present") {
      return "rgba(173, 216, 230, 0.2)"; // Light blue for "Present"
    } else if (status === "Absent") {
      return "#eddfe0"; // Light gray for "Absent"
    } else if (status === "Weekend") {
      return "#f0e5d8"; // Light yellow for "Weekend"
    }
    return "transparent"; // Default for empty status
  };

  const getStatusAbbreviation = (status) => {
    if (!status) return ""; // Return empty string if no status is available
    return status
      .split(" ") // Split the status by spaces
      .map((word) => word.charAt(0).toUpperCase()) // Get the first letter of each word and make it uppercase
      .join(""); // Join the letters back together
  };

  const handleApprove = async()=>{
      setApprovePopover(null)
      dailyRecordsRefetch()
  }
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const handleUpdated = () => {
    refetch();
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleCloseUpdateSalerySlip = ()=> setUpdatesalerySlipModel(false)

  const handlePaid = () => {
    setStatus(true);
  };

  const getEmployeeName = (id) => {
    if(employees){
      let employee = employees?.find((employee) => employee._id === id);
      return employee ? `${employee.name}` : user?.companyName;
    }
  }
  return (
    <Box sx={{
        fontFamily: 'Montserrat',
        width: '100%',
        mx: 'auto',
        minHeight: '100vh',
        py: 4,
        mr: 2,
        overflow: 'hidden',
        
      }}>
        {/* Navbar at the top */}
        <Grid container spacing={1} p={3}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <ProfileNav />
          </Grid>
          <Grid item xs={12}>
      <GlassEffect.GlassContainer>
        <Grid
          sx={{
            width: "100%", height: "80vh", borderRadius: "10px", padding: "1rem", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
          }}
        >
          <Grid
      container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "12px",
      }}
    >

          {/* Dropdowns and Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              height: "10vh",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <FormControl
                sx={{
                  minWidth: "120px",
                  background: "#ffffff",
                  borderRadius: "4px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#d1d5db" },
                    "&:hover fieldset": { borderColor: "#3b82f6" },
                  },
                }}
                size="small"
              >
                <InputLabel sx={{ color: "#374151", fontWeight: 500 }}>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Month"
                  sx={{
                    color: "#374151",
                    height: "36px",
                    fontSize: "0.875rem",
                    "& .MuiSvgIcon-root": { color: "#3b82f6" },
                  }}
                >
                  {months.map((_, index) => (
                    <MenuItem
                      key={index}
                      value={index}
                      sx={{ fontSize: "0.875rem", color: "#374151" }}
                    >
                      {DateTime.fromObject({ month: index + 1 }).toFormat("MMM")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                sx={{
                  minWidth: "120px",
                  background: "#ffffff",
                  borderRadius: "4px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#d1d5db" },
                    "&:hover fieldset": { borderColor: "#3b82f6" },
                  },
                }}
                size="small"
              >
                <InputLabel sx={{ color: "#374151", fontWeight: 500 }}>Year</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Year"
                  sx={{
                    color: "#374151",
                    height: "36px",
                    fontSize: "0.875rem",
                    "& .MuiSvgIcon-root": { color: "#3b82f6" },
                  }}
                >
                  {years.map((year) => (
                    <MenuItem
                      key={year}
                      value={year}
                      sx={{ fontSize: "0.875rem", color: "#374151" }}
                    >
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                sx={{
                  background: "#10b981",
                  color: "#ffffff",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background: "#059669",
                    boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                  },
                }}
                onClick={() => setOpen(true)}
              >
                Add Payment Method
              </Button>

              <Button
                variant="contained"
                sx={{
                  background: "#3b82f6",
                  color: "#ffffff",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background: "#2563eb",
                    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                  },
                  "&:disabled": {
                    background: "#d1d5db",
                    color: "#6b7280",
                  },
                }}
                onClick={handlePaid}
                disabled={paidStatus || isMarkAsPaidDisabled()}
              >
                Mark As Paid
              </Button>

              {(user?.role === "superAdmin" || user?.role === "Admin") && (
                <Button
                  variant="contained"
                  sx={{
                    background: "#8b5cf6",
                    color: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      background: "#7c3aed",
                      boxShadow: "0 2px 4px rgba(139, 92, 246, 0.3)",
                    },
                  }}
                  onClick={() => setUpdatesalerySlipModel(true)}
                >
                  Update Slips
                </Button>
              )}
            </Box>
          </Box>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={employees.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            sx={{
              color: "#374151",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                color: "#374151",
                fontSize: "0.875rem",
              },
              "& .MuiSvgIcon-root": { color: "#3b82f6" },
            }}
          />

          {/* Table */}
          <TableContainer
            sx={{
              maxHeight: "calc(100vh - 300px)",
              "&::-webkit-scrollbar": {
                width: "6px",
                height: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#3b82f6",
                borderRadius: "12px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f3f4f6",
                borderRadius: "12px",
              },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#374151",
                      background: "#ffffff",
                      position: "sticky",
                      left: 0,
                      zIndex: 99999,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Employee Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#374151",
                      background: "#ffffff",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Total Present
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#374151",
                      background: "#ffffff",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Total Absent
                  </TableCell>
                  {daysInMonth.map((day, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textAlign: "center",
                        color: "#374151",
                        background: "#ffffff",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {day.split(" ")[0]}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {employees
                  .slice(page * rowsPerPage, (page + 1) * rowsPerPage) // Pagination logic
                  .map((employee) => {
                    const employeeData = Object.values(employeesData).find(
                      (emp) => emp.employeeId === employee._id
                    );
                    const workingDays = employeeData?.workingDays || {};

                    // Get today's date in the format 'yyyy-MM-dd'
                    const today = DateTime.now().toFormat("yyyy-MM-dd");
                    const nonWorkingday = daysInMonth
                    .map((day, dayIndex) => {
                      const dayOfWeek = getWeekdaysInMonth(selectedMonth, selectedYear)[dayIndex];
                      return {
                        date: DateTime.fromFormat(day, "d MMM yyyy").toFormat("yyyy-MM-dd"),
                        isNonWorking: workingDays[dayOfWeek] === false, // Non-working days where workingDay is false
                      };
                    })
                    .filter((val) => val.isNonWorking && val.date <= today);

                    const leave  = currentLeaves.filter((leave)=>{
                        return leave?.employeeId === employee?._id && leave?.status === "Approved"
                    })
                    
                    const currentDay = daysInMonth.map((val) => {
                      // First, convert the non-ISO formatted date (like "1 Nov 2024") to an ISO string
                      const formattedDate = DateTime.fromFormat(val, "d MMM yyyy").toFormat("yyyy-MM-dd");
                    
                      return formattedDate;
                    }).filter((val) => {
                      // Convert the formatted date to DateTime object and compare it with today's date
                      const day = DateTime.fromISO(val);
                      return day <= DateTime.fromISO(today); // Compare DateTime objects
                    });
                   
                    return (
                      <TableRow
                        key={employee._id}
                        sx={{ borderBottom: "1px solid #e0e0e0" }}
                      >
                        <TableCell
                          sx={{
                            fontSize: "0.875rem",
                            color: "#374151",
                            position: "sticky",
                            left: 0,
                            zIndex: 999,
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <Link
                            to={`/employee/${employee._id}`}
                            style={{ textDecoration: "none", color: "#374151" }}
                          >
                            {employee.name}
                          </Link>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.875rem",
                            color: "#374151",
                          }}
                        >
                          <Typography sx={{
                            fontSize:'14px',
                            backgroundColor: '#e0f7fa',
                            color:'#006d77',
                            padding:'4px 8px',
                            textAlign:'center',
                            borderRadius:'12px'
                           }}>
                           {employeeData?.records?.length}
                           </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.875rem",
                            color: "#374151",
                          }}
                        >
                          <Typography sx={{
                            fontSize:'14px',
                            backgroundColor: '#ffebee',
                            color:'#d32f2f',
                            padding:'4px 8px',
                            textAlign:'center',
                            borderRadius:'12px'
                           }}>
                          {currentDay?.length -  (employeeData?.records?.length + nonWorkingday?.length + leave?.length)}
                          </Typography>
                        </TableCell>

                        {/* Iterate over each day of the month */}
                        {daysInMonth.map((day, dayIndex) => {
                          const dayOfWeek = getWeekdaysInMonth(
                            selectedMonth,
                            selectedYear
                          )[dayIndex];

                          // Create DateTime object for the current day in 'yyyy-MM-dd' format
                          const date = DateTime.fromFormat(
                            daysInMonth[dayIndex],
                            "d MMM yyyy"
                          );
                          const formattedDate = date.toFormat("yyyy-MM-dd");

                          // Check if the date is in the past or today
                          if (formattedDate > today) {
                            // Skip rendering the table cell if the day is in the future
                            return (
                              <TableCell
                                key={dayIndex}
                                sx={{
                                  padding: "4px",
                                  textAlign: "center",
                                  fontSize: "0.75rem",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <GetLeaveStatusAndAction
                                  employee={employee}
                                  date={formattedDate}
                                  leaves={leaves}
                                  updated={handleUpdated}
                                />
                              </TableCell>
                            );
                          }
                         
                          // Check if it's a working day
                          const isWorkingDay = workingDays[dayOfWeek] === true;

                          // Check attendance record for the employee on this day
                          const attendanceRecord = employeeData?.records?.find(
                            (record) => record.day === formattedDate
                          );
            
                          // Determine the status of the employee on this day
                          const status = !attendanceRecord
                            ? isWorkingDay
                              ? "Absent"
                              : "Weekend"
                            : "Present";

                          return (
                            <TableCell
                            ref={cellRef} 
                              key={dayIndex}
                              onClick={()=>handleCellClick(formattedDate, employee?._id)}
                              sx={{
                                color: getStatusColor(status),
                                backgroundColor: getBGColor(status),
                                padding: "4px",
                                textAlign: "center",
                                fontSize: "0.75rem",
                                border: "1px solid #e0e0e0",
                                cursor: "pointer",
                              }}
                            >
                              <Typography sx={{ padding: 0, fontSize: "0.75rem" }}>
                                {!attendanceRecord?.approvedBy && getStatusAbbreviation(status)}
                                {attendanceRecord?.approvedBy && `Approved by ${getEmployeeName(attendanceRecord?.approvedBy)}`}
                                {attendanceRecord?.requestFor && `${attendanceRecord?.requestFor} Reqested by ${getEmployeeName(attendanceRecord?.requestedBy)}`}
                                {approvePopover?.date === formattedDate && approvePopover?.employeeId === employee?._id ? (
                                  <ApproveAbsent  status={status} employee={employee} date={formattedDate} approved={handleApprove} request={attendanceRecord?.requestFor}/>
                                ):(null)}
                
                                {
                                  <GetLeaveStatusAndAction
                                    employee={employee}
                                    date={formattedDate}
                                    leaves={leaves}
                                    updated={handleUpdated}
                                  />
                                }
                                {paymentDate && (
                                  <GetPaymentDate
                                    paymentDate={paymentDate}
                                    date={dayIndex}
                                    status={paidStatus}
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                  />
                                )}
                                <GetProgress
                                    employee={employee}
                                    date={formattedDate}
                                    progress={progress}
                                />
                              </Typography>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          </Grid>
        </Grid>
      </GlassEffect.GlassContainer>
</Grid>
      {/* Modals */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            background: "white",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1f2937" }}>
          Add Payment Method
        </DialogTitle>
        <DialogContent>{/* AddPaymentMethodModal component here */}</DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{ color: "#ef4444", textTransform: "none" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={updateSalerySlipModel}
        onClose={handleCloseUpdateSalerySlip}
        PaperProps={{
          sx: {
            width: "90%",
            height: "90%",
            maxWidth: "none",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            resize: "both",
            overflow: "auto",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1f2937" }}>
          Update Salary Slips {selectedMonth}/{selectedYear} <span style={{fontSize:"12px"}}> {"( Please press enter key to apply change after edit )"}</span>
        </DialogTitle>
        <DialogContent sx={{ overflowY: "auto" }}>
           <UpdateSalerySlips employees={employees} month={selectedMonth} year={selectedYear}/>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseUpdateSalerySlip}
            sx={{ color: "#ef4444", textTransform: "none" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      </Grid>
    </Box>
  );
}
EmployeeTable.propTypes = {
  employees: PropTypes.array,
};

// PropTypes for GetLeaveStatusAndAction
GetLeaveStatusAndAction.propTypes = {
  employee: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  date: PropTypes.string.isRequired,
  leaves: PropTypes.shape({
    data: PropTypes.shape({
      data: PropTypes.arrayOf(
        PropTypes.shape({
          employeeId: PropTypes.string,
          status: PropTypes.string,
        })
      ),
    }),
  }),
  updated: PropTypes.func.isRequired,
};

// PropTypes for GetPaymentDate
GetPaymentDate.propTypes = {
  paymentDate: PropTypes.object,
  date: PropTypes.number.isRequired,
  status: PropTypes.bool.isRequired,
  selectedMonth: PropTypes.number.isRequired,
  selectedYear: PropTypes.number.isRequired,
};

// PropTypes for ApproveAbsent
ApproveAbsent.propTypes = {
  status: PropTypes.string.isRequired,
  employee: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  date: PropTypes.string.isRequired,
  approved: PropTypes.func.isRequired,
};

// PropTypes for GetProgress
GetProgress.propTypes = {
  employee: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  date: PropTypes.string.isRequired,
  progress: PropTypes.arrayOf(
    PropTypes.shape({
      employeeId: PropTypes.string,
      date: PropTypes.string,
    })
  ).isRequired,
};
export default EmployeeTable;