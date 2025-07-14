import React, { useState, useEffect } from "react";
import { Typography, Button, Modal, Box, TextField, Grid, Paper, IconButton, Autocomplete, Snackbar, Alert, CircularProgress, Tooltip } from "@mui/material";
import Calender from "./Calendar";
import Chart from "../../MainLeave/Chart";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';  // Approve icon
import CancelIcon from '@mui/icons-material/Cancel';  // Reject icon
import { green, red, yellow, blue } from '@mui/material/colors';
import { useGet, usePost } from "../../../hooks/useApi";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../middlewares/auth";
import Loading from "../../../../public/Loading/Index";
import GlassEffect from "../../../theme/glassEffect";
import { useTheme } from "@emotion/react";
// Mock Profile Data


// Holiday Data
const Holiday = [
  { id: 1, date: "Nov 8, 2024", day: "Friday", name: "Diwali" },
  { id: 2, date: "Dec 25, 2024", day: "Wednesday", name: "Christmas" },
];



// Default Events
const initialEvents = [
  {
    title: "Annual Leave",
    start: new Date(2024, 9, 21),
    end: new Date(2024, 9, 26),
    teamMember: "Benny Chagur",
  },
  {
    title: "Public Holiday",
    start: new Date(2024, 9, 29),
    end: new Date(2024, 9, 30),
    teamMember: "Alice Doe",
  },
];

const Leave = () => {
  const emplyeeId = useParams().id;
  const [openModal, setOpenModal] = useState(false);
  const [leaveData, setLeaveData] = useState({
    leaveType: "",
    date: "",
    reason: "",
    leaveDuration: "",
  });
  const {user} = useAuth();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading , setLoading] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); 
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [data, setData] = useState([]);
  const [leaveRequest, setLeaveRequest] = useState([]);
  const handleSubmitLeave = usePost("/employee/leave/create");
  const handleUpdateLeave = usePost("/employee/leave/update");
  const { data: leaves , isLoading, refetch} = useGet('employee/leave/get-by-id', {
    employeeId: emplyeeId
  })
  const theme = useTheme()
  useEffect(() => {
     console.log(leaves,'leaves')
     if(leaves?.data?.data){
      const leaveData = leaves?.data?.data?.leaveData;
      const remainingAnnualLeave =  (leaveData?.remainingCasualLeave + leaveData?.remainingSickLeave);
      const setAbleData = [
        {
          name: "Remaining Leave",
          value: leaveData?.annual,
          remaining: remainingAnnualLeave,
        },
        {
          name: "Sick Leave",
          value: leaveData?.sick,
          remaining: leaveData?.remainingSickLeave,
        },
        {
          name: "Casual Leave",
          value: leaveData?.casual,
          remaining: leaveData?.remainingCasualLeave,
        },
      ]
      setData(setAbleData)
      setLeaveRequest(leaves?.data?.data?.leaveRequests)
     }
  }, [leaves]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading({
        id: null,
        action : "submit"
      });
      const leaveDetails = {
        ...leaveData,
        employeeId: emplyeeId, // Assuming you have the employeeId variable properly defined elsewhere in your component
      };
      const res = await handleSubmitLeave.mutateAsync(leaveDetails); // Use leaveDetails, not just leaveData

      if (res.data !== null) {
        setLoading(null);
        // Show success message
        setSnackbarMessage("Leave request submitted successfully!");
        setSnackbarSeverity("success");
        refetch();
      } else {
        setLoading(null);
        // Show failure message
        setSnackbarMessage(res?.error?.error || "Failed to submit leave request.");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setLoading(null);
      console.error("Error submitting leave request:", error);
      setSnackbarMessage("An error occurred while submitting the leave request.");
      setSnackbarSeverity("error");
    }

    handleCloseModal(); // Close the modal after submission
    setOpenSnackbar(true); // Open the Snackbar after submission
  };

  const handleEventClick = (event) => {
    if (event.isTemporary) {
      setSelectedEvent(event);
    }
  };

const handleActionLeave = async (_id, action) => {
  try{
  setLoading({
    id: _id,
    action: action
  });
  const leaveDetails = {
    _id,
    status: action
  };
  const res = await handleUpdateLeave.mutateAsync(leaveDetails); // Use leaveDetails, not just leaveData
 
  if (res.data !== null) {
    setLoading(null);
    setSnackbarMessage( res?.data?.message ||"Leave request submitted successfully!" );
    setSnackbarSeverity("success");
    refetch();
  } else {
    setLoading(null);
    // Show failure message
    setSnackbarMessage(res?.error?.error || "Failed to submit leave request.");
    setSnackbarSeverity("error");
  }
} catch (error) {
  setLoading(null);
  console.error("Error submitting leave request:", error);
  setSnackbarMessage("An error occurred while submitting the leave request.");
  setSnackbarSeverity("error");
}

handleCloseModal(); // Close the modal after submission
setOpenSnackbar(true); // Open the Snackbar after submission
}

  return (
    <>
      <Grid container spacing={3} flexDirection={"row"}>
       {isLoading && <Loading/>}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000} // Automatically close after 6 seconds
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
            {/* Leave Management */}
        <Grid item xs={12} md={8} >
        <GlassEffect.GlassContainer>   
        <Paper
      sx={{
        padding: 4,
        background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)', // Subtle gradient
        borderRadius: '16px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.4s ease',
        height: '85vh',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-4px)', // Slight lift effect
        },
      }}
    >
      {/* Header Section */}
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        {emplyeeId === user._id && (
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: '#fff',
              borderRadius: '12px',
              padding: '10px 24px',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                background: theme.palette.primary.dark,
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                transform: 'scale(1.03)',
              },
            }}
          >
            Request a Leave
          </Button>
        )}
      </Grid>

      {/* Chart Section */}
      <Grid container spacing={3} mb={4}>
        {data?.map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper
              sx={{
                padding: 3,
                height: '32vh',
                borderRadius: '12px',
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.06)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <Chart data={item} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Leave Requests Table */}
      <Paper
        sx={{
          padding: 3,
          borderRadius: '16px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          height: '45vh',
          overflowY: 'auto',
          background: '#fff',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.light,
            borderRadius: '4px',
          },
        }}
      >
        {/* Table Header */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={2}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              Leave Type
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              Duration
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              Status
            </Typography>
          </Grid>
          <Grid item xs={user.role === 'superAdmin' || user?.junior?.includes(emplyeeId) ? 2 : 3}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              Date
            </Typography>
          </Grid>
          <Grid item xs={user.role === 'superAdmin' || user?.junior?.includes(emplyeeId) ? 2 : 3}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              Notes
            </Typography>
          </Grid>
          {(user.role === 'superAdmin' || user?.junior?.includes(emplyeeId)) && (
            <Grid item xs={2}>
              <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                Action
              </Typography>
            </Grid>
          )}
        </Grid>

        <hr style={{ borderColor: '#e8ecef', margin: '16px 0' }} />

        {/* Leave Requests List */}
        {leaveRequest && leaveRequest.length > 0 ? (
          leaveRequest.map((item, index) => (
            <Grid
              container
              spacing={2}
              key={index}
              alignItems="center"
              sx={{
                py: 1,
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f5f7fa',
                },
              }}
            >
              <Grid item xs={2}>
                <Typography variant="body2" fontWeight="medium">
                  {item.leaveType}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2" fontWeight="medium">
                  {item.leaveDuration}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor:
                      item.status === 'Approved'
                        ? '#4caf50'
                        : item.status === 'Pending'
                        ? '#ffca28'
                        : item.status === 'Rejected'
                        ? '#ef5350'
                        : '#bdbdbd',
                    color: '#fff',
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {item.status}
                </Button>
              </Grid>
              <Grid item xs={user.role === 'superAdmin' || user?.junior?.includes(emplyeeId) ? 2 : 3}>
                <Typography variant="body2" fontWeight="medium">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
              </Grid>
              <Grid item xs={user.role === 'superAdmin' || user?.junior?.includes(emplyeeId) ? 2 : 3}>
                 <Tooltip title={`${item.reason}`}>
                 <Typography variant="body2" fontWeight="medium" noWrap>
                  {item.reason}
                </Typography>
                 </Tooltip>
              </Grid>
              {(user.role === 'superAdmin' || user?.junior?.includes(emplyeeId)) && (
                <Grid item xs={2}>
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item>
                      {loading && loading?.id === item._id && loading?.action === 'Approved' ? (
                        <CircularProgress size={24} />
                      ) : (
                        <IconButton
                          color="success"
                          disabled={item.status === 'Approved' || item.status === 'Rejected'}
                          onClick={() => handleActionLeave(item._id, 'Approved')}
                          sx={{
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item>
                      {loading && loading?.id === item._id && loading?.action === 'Rejected' ? (
                        <CircularProgress size={24} />
                      ) : (
                        <IconButton
                          color="error"
                          disabled={item.status === 'Approved' || item.status === 'Rejected'}
                          onClick={() => handleActionLeave(item._id, 'Rejected')}
                          sx={{
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No leave requests available
          </Typography>
        )}
      </Paper>
    </Paper>
    </GlassEffect.GlassContainer>
        </Grid>
       

   



 

   <Grid item xs={12} md={3.7}>
    <GlassEffect.GlassContainer>
   <Paper
  sx={{
    backgroundColor: "transparent",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    marginTop: 0,
    borderRadius: 2.5,
    overflow:'hidden',
    height: '82vh',
    transition: 'all 0.3s ease-in-out', // Smooth transition for hover effects
    '&:hover': {
      boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)', // Deeper shadow on hover
      transform: 'translateY(-7px)', // Lift the Paper component a bit more on hover
    },
  }}
>
  <Typography
    variant="h6"
    sx={{
      mt: -2,
      fontWeight: "bold",
      color: "#00796b", // Dark teal color
      backgroundColor: useTheme().palette.background.default,
      padding: 1,
      fontSize: "16px",
      textAlign: "left",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 1,
      transition: 'color 0.3s ease', // Smooth color transition
      '&:hover': {
        color: '#004d40', // Darker shade of teal on hover
        textDecoration: 'underline', // Underline on hover for text interaction
      },
    }}
  >
    Upcoming Public Holidays
  </Typography>
  <Grid container direction="column" spacing={2} sx={{ marginTop: 3, padding: 2 }}>
    {Holiday.map((holiday) => (
      <Grid item key={holiday.id}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            padding: 2,
            borderRadius: 2,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow effect
            transition: 'all 0.3s ease-in-out', // Smooth transition for hover effects
            '&:hover': {
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)', // Enhanced shadow on hover
              transform: 'translateY(-4px)', // Lifting effect
              background: 'linear-gradient(135deg, #f1b6c2 0%, #d169b2 50%, #a3d1e5 100%)',

              cursor: 'pointer', // Pointer cursor on hover for interactivity
            },
          }}
        >
          <Grid item>
            <Typography variant="body2" color="text.primary">
              {holiday.date}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {holiday.day}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.primary">
              {holiday.name}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    ))}
  </Grid>
  
</Paper>
</GlassEffect.GlassContainer>
      </Grid>
      </Grid>
      {/* Leave Request Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          backgroundColor: '#fff',
          borderRadius: 2,
          width: 450,
          margin: 'auto',
          marginTop:' 5%',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          transform: 'scale(1)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
      >
        <Typography variant="h5" color="text.primary" fontWeight="bold" sx={{ mb: 2 }}>
          Request Leave
        </Typography>

        {/* Autocomplete for Leave Type */}
        <Autocomplete
          fullWidth
          options={['Casual Leave', 'Sick Leave']}
          value={leaveData.leaveType}
          onChange={(event, newValue) => {
            setLeaveData({ ...leaveData, leaveType: newValue });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Leave Type"
              variant="outlined"
              margin="normal"
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 3,
                },
              }}
            />
          )}
        />

        {/* Date Picker for Start Date */}
        <TextField
          fullWidth
          label=" Date"
          variant="outlined"
          margin="normal"
          type="date"
          onChange={(e) =>
            setLeaveData({ ...leaveData, date: e.target.value })
          }
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: 3,
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />

    

        {/* Autocomplete for Leave Duration */}
        <Autocomplete
          fullWidth
          options={['Full Day', 'Half Day']}
          value={leaveData.leaveDuration}
          onChange={(event, newValue) => {
            setLeaveData({ ...leaveData, leaveDuration: newValue });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Leave Duration"
              variant="outlined"
              margin="normal"
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 3,
                },
              }}
            />
          )}
        />

        {/* Reason Text Field */}
        <TextField
          fullWidth
          label="Reason"
          variant="outlined"
          margin="normal"
          onChange={(e) =>
            setLeaveData({ ...leaveData, reason: e.target.value })
          }
          multiline
          rows={4}
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: 3,
            },
          }}
        />

        {/* Submit Button */}
        {loading && loading?.action === 'submit' ? (
          <CircularProgress />
        ) : (
          <Button
          variant="contained"
          sx={{
            marginTop: 2,
            backgroundColor: '#4CAF50',
            borderRadius: 3,
            padding: '10px 20px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
          onClick={handleSubmit}
        >
          Submit Leave Request
        </Button>
        )
        }
      
      </Box>
    </Modal>

      {/* Leave Approval Modal */}
      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        <Box
          sx={{
            padding: 3,
            backgroundColor: "#fff",
            borderRadius: 3,
            width: 400,
            margin: "auto",
            marginTop: "10%",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography variant="h6" color="text.primary">
            Leave Approval
          </Typography>
          <Typography variant="body2" color="text.primary">
            Leave Type: {selectedEvent?.leaveType}
          </Typography>
          <Typography variant="body2" color="text.primary">
            Start Date: {selectedEvent?.startDate}
          </Typography>
          <Typography variant="body2" color="text.primary">
            End Date: {selectedEvent?.endDate}
          </Typography>
          <Typography variant="body2" color="text.primary">
            Reason: {selectedEvent?.reason}
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 2 }}
          >
            Accept
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ mt: 2, ml: 2 }}
          >
            Reject
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default Leave;
