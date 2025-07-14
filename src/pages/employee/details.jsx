// import { Box, Grid, Typography, Paper, useMediaQuery } from "@mui/material";
// import React, { useEffect, useState } from "react";
// import EmpDetails from "../Profile/empDetails";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { useGet } from "../../hooks/useApi";
// import ProfileNav from "../../components/user/profiveNav";
// import CalenderView from "../Profile/calenderView";
// import EmplyoeeDetailTab from "../Profile/tabDetails";
// import DailyRecordsTable from "../Profile/attendence/tableView";
// import CalendarViewAttendence from "../Profile/attendence/calenderView";
// import Payrolle from "../Profile/payrolle";
// import Leave from "../Profile/leave/Leave";
// import { useTheme } from "@emotion/react";
// import GlassEffect from "../../theme/glassEffect";
// import WorkHistory from "./WorkHistory";
// import { useAuth } from "../../middlewares/auth";
// import { alpha } from "@mui/material/styles";

// function EmplyoeeDetails() {
//   const { id } = useParams();
//   const [activeTab, setActiveTab] = useState("Basic Details");
//   const { user } = useAuth();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
//   const tabs = user?.role === 'admin' || id == user?._id || user?.role === 'superAdmin' || user?.role === 'Manager' 
//     ? ["Basic Details", "Attendance", "Leave", "Payroll", "Work History"]
//     : ["Basic Details"];
  
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleTabChange = (tab) => {
//     if (tab === 'Work History') {
//       const newLink = `/employee/${id}/work-history`;
//       navigate(newLink);
      
//       if (['admin', 'superAdmin', 'manager'].includes(user?.role?.toLowerCase())) {
//         setActiveTab(tab);
//       } else {
//         console.log('You do not have permission to view Work History.');
//       }
//     } else {
//       navigate(`/employee/${id}/${(tab).toLowerCase().split(' ').join('-')}`);
//       setActiveTab(tab);
//     }
//   };

//   useEffect(() => {
//     const currentPath = location.pathname;
//     let tabName = currentPath.split('/').pop();
//     tabName = tabName.split('-')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(" ");
    
//     if (tabName && tabs.includes(tabName)) {
//       setActiveTab(tabName);
//     } else {
//       setActiveTab('Basic Details');
//     }
//   }, [location.pathname, tabs]);

//   const renderContent = () => {
//     switch (activeTab) {
//       case "Basic Details":
//         return (
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={5}>
//               <Paper 
//                 elevation={0}
//                 sx={{ 
//                   borderRadius: 3, 
//                   overflow: 'hidden',
//                   height: '100%',
//                   background: theme.palette.mode === 'dark' 
//                     ? alpha(theme.palette.background.paper, 0.8)
//                     : alpha(theme.palette.background.paper, 0.9),
//                   backdropFilter: 'blur(10px)',
//                   border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
//                 }}
//               >
//                 <EmpDetails />
//               </Paper>
//             </Grid>
            
//             <Grid item xs={12} md={7}>
//               <Paper 
//                 elevation={0}
//                 sx={{ 
//                   borderRadius: 3, 
//                   overflow: 'hidden',
//                   height: '100%',
//                   background: theme.palette.mode === 'dark' 
//                     ? alpha(theme.palette.background.paper, 0.8)
//                     : alpha(theme.palette.background.paper, 0.9),
//                   backdropFilter: 'blur(10px)',
//                   border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
//                 }}
//               >
//                 <Box p={1} display="flex" flexDirection="column" gap={3}>
//                   <Paper 
//                     elevation={0}
//                     sx={{ 
//                       borderRadius: 2,
//                       background: theme.palette.mode === 'dark' 
//                       ? alpha(theme.palette.background.paper, 0.8)
//                       : alpha(theme.palette.background.paper, 0.9),
                      
//                     }}
//                   >
//                     {user?.role === 'admin' || id == user?._id || user?.role === 'superAdmin' || user?.role === 'Manager' ? (
//                       <CalenderView
//                         getTimes={(month, year) => console.log(month, year)}
//                         size={{ height: 400, width: "600" }}
//                       />
//                     ) : (
//                       <Box
//                         sx={{
//                           position: 'relative',
//                           borderRadius: 2,
//                           height: 300,
//                           width: '100%',
//                           display: 'flex',
//                           justifyContent: 'center',
//                           alignItems: 'center',
//                           color: alpha(theme.palette.text.primary, 0.5),
//                           '&::before': {
//                             content: '""',
//                             position: 'absolute',
//                             top: 0,
//                             left: 0,
//                             right: 0,
//                             bottom: 0,
//                             background: alpha(theme.palette.background.paper, 0.7),
//                             backdropFilter: 'blur(4px)',
//                             zIndex: 1,
//                           }
//                         }}
//                       >
//                         <Typography variant="h6" sx={{ position: 'relative', zIndex: 2 }}>
//                           Access Restricted
//                         </Typography>
//                       </Box>
//                     )}
//                   </Paper>
                  
//                   <Paper 
//                     elevation={0}
//                     sx={{ 
//                       borderRadius: 2,
//                       background: theme.palette.background.default,
//                       overflow: 'hidden'
//                     }}
//                   >
//                     <EmplyoeeDetailTab />
//                   </Paper>
//                 </Box>
//               </Paper>
//             </Grid>
//           </Grid>
//         );
        
//       case "Attendance":
//         return (
//           <Grid container spacing={3}>
//             <Grid item xs={12} lg={6}>
//               <Paper 
//                 elevation={0}
//                 sx={{ 
//                   borderRadius: 3, 
//                   overflow: 'hidden',
//                   height: '70vh',
//                   background: theme.palette.mode === 'dark' 
//                     ? alpha(theme.palette.background.paper, 0.8)
//                     : alpha(theme.palette.background.paper, 0.9),
//                   backdropFilter: 'blur(10px)',
//                   border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
//                 }}
//               >
//                 <Box p={0} height="100%" sx={{ overflowY: 'auto' }}>
//                   <DailyRecordsTable />
//                 </Box>
//               </Paper>
//             </Grid>
            
//             <Grid item xs={12} lg={6}>
//               <Paper 
//                 elevation={0}
//                 sx={{ 
//                   borderRadius: 3, 
//                   overflow: 'hidden',
//                   height: '70vh',
//                   background: theme.palette.mode === 'dark' 
//                     ? alpha(theme.palette.background.paper, 0.8)
//                     : alpha(theme.palette.background.paper, 0.9),
//                   backdropFilter: 'blur(10px)',
//                   border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
//                 }}
//               >
//                 <Box p={2} height="100%">
//                   <CalendarViewAttendence 
//                     size={{ height: '50vh', width: "100%" }} 
//                     getTimes={(month, year) => console.log(month, year)}
//                   />
//                 </Box>
//               </Paper>
//             </Grid>
//           </Grid>
//         );
        
//       case "Leave":
//         return (
//           <Paper 
//             elevation={0}
//             sx={{ 
//               borderRadius: 3, 
//               overflow: 'hidden',
//               minHeight: '70vh',
//               background: theme.palette.mode === 'dark' 
//                 ? alpha(theme.palette.background.paper, 0.8)
//                 : alpha(theme.palette.background.paper, 0.9),
//               backdropFilter: 'blur(10px)',
//               border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
//             }}
//           >
//             <Box p={3}>
//               <Leave />
//             </Box>
//           </Paper>
//         );
        
//       case "Payroll":
//         return (
//           <Paper 
//             elevation={0}
//             sx={{ 
//               borderRadius: 3, 
//               overflow: 'hidden',
//               minHeight: '70vh',
//               background: theme.palette.mode === 'dark' 
//                 ? alpha(theme.palette.background.paper, 0.8)
//                 : alpha(theme.palette.background.paper, 0.9),
//               backdropFilter: 'blur(10px)',
//               border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
//             }}
//           >
//             <Box p={3}>
//               <Payrolle />
//             </Box>
//           </Paper>
//         );
        
//       case "Work History":
//         return (
//           <Paper 
//             elevation={0}
//             sx={{ 
//               borderRadius: 3, 
//               overflow: 'hidden',
//               height: '83vh',
//               background: theme.palette.mode === 'dark' 
//                 ? alpha(theme.palette.background.paper, 0.8)
//                 : alpha(theme.palette.background.paper, 0.9),
//               backdropFilter: 'blur(10px)',
//               border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
//             }}
//           >
//             <Box p={3} height="100%">
//               <WorkHistory />
//             </Box>
//           </Paper>
//         );
        
//       default:
//         return null;
//     }
//   };

//   return (
//     <Box 
//       sx={{ 
//         display: "flex", 
//         flexDirection: "column", 
//         width: "100%", 
//         maxWidth: "1400px", 
//         mx: "auto", 
//         px: { xs: 2, md: 4 }, 
//         gap: 3,
//         pb: 4
//       }}
//     >
//       <Box pt={3} sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
//         <Grid container spacing={2} sx={{ width: "100%", position: "sticky", top: 0, zIndex: 999 }}>
//           <Grid item xs={12} container justifyContent="flex-end">
//             <ProfileNav />
//           </Grid>
//         </Grid>
//       </Box>
      
//       {/* Tab Navigation */}
//       <Paper
//         elevation={0}
//         sx={{
//           borderRadius: 8,
//           display: "flex",
//           width: "100%",
//           overflowX: "auto",
//           background: theme.palette.mode === 'dark' 
//             ? alpha(theme.palette.background.paper, 0.2)
//             : alpha('#f0f0f0', 0.7),
//           backdropFilter: 'blur(10px)',
//           border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//           '&::-webkit-scrollbar': {
//             height: '4px',
//           },
//           '&::-webkit-scrollbar-thumb': {
//             backgroundColor: alpha(theme.palette.primary.main, 0.3),
//             borderRadius: '4px',
//           },
//         }}
//       >
//         <Box 
//           display="flex" 
//           width="100%" 
//           p={0.8}
//           sx={{
//             minWidth: isMobile ? 'max-content' : '100%',
//           }}
//         >
//           {tabs.map((tab) => (
//             <Box 
//               key={tab}
//               onClick={() => handleTabChange(tab)}
//               sx={{
//                 flex: 1,
//                 minWidth: isMobile ? '120px' : 'auto',
//                 textAlign: "center",
                
//                 borderRadius: 6,
//                 fontWeight: activeTab === tab ? 600 : 400,
//                 color: activeTab === tab 
//                   ? theme.palette.mode === 'dark' ? '#fff' : '#fff'
//                   : theme.palette.text.primary,
//                 background: activeTab === tab
//                   ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
//                   : 'transparent',
//                 cursor: "pointer",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   background: activeTab !== tab
//                     ? alpha(theme.palette.primary.main, 0.1)
//                     : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
//                   color: activeTab !== tab 
//                     ? theme.palette.primary.main
//                     : '#fff',
//                 },
//               }}
//             >
//               <Typography
//                 variant="button"
//                 fontWeight={activeTab === tab ? 600 : 400}
//                 fontSize="0.95rem"
//               >
//                 {tab}
//               </Typography>
//             </Box>
//           ))}
//         </Box>
//       </Paper>
      
//       {/* Content */}
//       <Box sx={{ width: "100%" }}>
//         {renderContent()}
//       </Box>
//     </Box>
//   );
// }

// export default EmplyoeeDetails;