// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Typography,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   IconButton,
//   Pagination,
//   PaginationItem,
//   Autocomplete,
//   useTheme,
//   Tooltip,
// } from "@mui/material";
// import Add from "@mui/icons-material/Add";
// import { CSSTransition, TransitionGroup } from "react-transition-group";
// import { Cancel } from "@mui/icons-material";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useGet, usePost } from "../../hooks/useApi";
// import { toast, ToastContainer } from "react-toastify";
// import ProfileNav from "../../components/user/profiveNav";
// import EmployeeList from "../../components/listView/emplyoee";
// import Loading from "../../../public/Loading/Index";

// import departmentImgage from "../../../src/assets/images/deparment.jpg";
// import { Country, State, City } from 'country-state-city';
// import EmployeeTable from "../Attendence/attendenceAndLeave/EmployeeTable";
// import TreeView from "../../components/emplyoee/TreeView";
// import GlassEffect from "../../theme/glassEffect";
// import AccountTreeIcon from '@mui/icons-material/AccountTree';
// import TableChartIcon from '@mui/icons-material/TableChart';
// // import DashBoard from "../../components/emplyoee/dashboard";
// import IncantiveFormDialog from "../../components/emplyoee/IncantivesCreation/IncantiveForm";
// import { useAuth } from "../../middlewares/auth";
// import { useLocation, useNavigate } from "react-router-dom";

// // Define Zod schema for validation
// const employeeSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   phone: z.string().min(1, "Phone number is required").max(10, "Invalid phone number"),
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters long").regex(/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"),
//   role: z.string().min(1, "Role is required"),
//   position: z.string().min(1, "Position is required"),
//   department: z.string().optional(),
//   reportingManager: z.string().optional(),
//   dob: z.string().min(1, "Date of birth is required"),
//   panCard: z.string().optional(),
//   aadhar: z.string().optional(),
//   qualification: z.string().optional(),
//   address: z.object({
//     street: z.string().min(1, "Street address is required"),
//     city: z.string().min(1, "City is required"),
//     state: z.string().min(1, "State is required"),
//     zip: z.string().min(1, "ZIP code is required"),
//     country: z.string().min(1, "Country is required"),
//   }),
//   bankDetails: z.object({
//     bankName: z.string().optional(),
//     accountNumber: z.string().optional(),
//     ifscCode: z.string().optional(),
//     branch: z.string().optional(),
//   }),
//   socialMedia: z.object({           
//     twitter: z.string().optional(),
//     linkedin: z.string().optional(),
//   }),
//   files: z.object({
//     tenth: z.string().optional(),
//     twelfth: z.string().optional(),
//     aadhar: z.string().optional(),
//     panCard: z.string().optional(),
//     highEducation: z.string().optional(),
//   }).optional(),
// });

// function Employees() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [openModal, setOpenModal] = useState(false);
//   const [departmentModal, setDepartmentModal] = useState(false);
//   const [activeTab, setActiveTab] = useState("Dashboard");
//   const [departmentHead, setDepartmentHead] = useState("");
//   const [departmentName, setDepartmentName] = useState("");
//   const [employee, setEmployee] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [teams, setTeams] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [countries, setCountries] = useState([]);
//   const [treeView, setTreeView] = useState(false);
//   const [open, setOpen] = useState(false);
//   const [position, setPosition] = useState([
//     "Senior Developer",
//     "Junior Developer",
//     "Designer",
//   ]);
//   const { user } = useAuth();
//   const {
//     control,
//     handleSubmit,
//     reset,
//     setValue,
//     getValues,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: zodResolver(employeeSchema),
//     defaultValues: {
//       name: "",
//       phone: "+91",
//       email: "",
//       password: "",
//       role: "",
//       position: "",
//     },
//   });

//   const setIncantiveModal = (value) => {
//     setOpen(value);
//   };

//   const handleOpen = () => setOpen(true);

//   useEffect(() => {
//     const countryOptions = Country.getAllCountries().map(country => ({
//       value: country.isoCode,
//       label: country.name
//     }));
//     setCountries(countryOptions);
//   }, []);

//   const inputStyles = {
//     color: useTheme().palette.text.primary,
//     "& .MuiInputBase-root": {
//       color: useTheme().palette.text.primary,
//     },
//     "& .MuiInputLabel-root": {
//       color: useTheme().palette.text.primary,
//     },
//     "& .MuiOutlinedInput-root": {
//       "& fieldset": {
//         borderColor: "#ced1d6",
//         borderRadius: "15px",
//         boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//         border: "none",
//       },
//       "&:hover fieldset": {
//         borderColor: "#398bf7",
//       },
//       "&.Mui-focused fieldset": {
//         borderColor: "#398bf7",
//       },
//     },
//   };

//   const { mutateAsync: createEmployee, isLoading: isCreatingEmployee } =
//     usePost("employee/create");
//   const { mutateAsync: createDepartment, isLoading: isCreatingDepartment } =
//     usePost("department/create");
//   const {
//     data: employees,
//     refetch: refetchEmployees,
//     isLoading,
//   } = useGet("employee/all", {}, {}, { queryKey: "employees" });
//   const {
//     data: departmentsData,
//     refetch: refetchDepartments,
//     isLoading: isLoadingDepartment,
//   } = useGet("department/all", {}, {}, { queryKey: "departments" });

//   useEffect(() => {
//     if (employees?.data?.message && departmentsData?.data?.message) {
//       setEmployee(employees?.data?.message[0]);
//       setDepartments(departmentsData?.data?.message[0]);
//     }
//   }, [employees, departmentsData]);

//   const totalPages = Math.ceil(employee?.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentEmployees = employee?.slice(
//     startIndex,
//     startIndex + itemsPerPage
//   );

//   const handlePageChange = (event, value) => {
//     setCurrentPage(value);
//   };

//   const getManagers = () => {
//     return employee?.filter((emp) => emp.role === "Manager");
//   };

//   const handleEmplyoeeModal = () => setOpenModal(true);
//   const handleCloseModal = () => {
//     setOpenModal(false);
//     reset();
//   };

//   const handleDepartmentModal = () => setDepartmentModal(true);
//   const handleDepartmentCloseModal = () => {
//     setDepartmentModal(false);
//     setDepartmentHead("");
//     setDepartmentName("");
//   };

//   const handleCountryChange = (newValue) => {
//     const selectedCountry = newValue?.value || '';
//     setValue('address.country', selectedCountry);
//     const stateOptions = State.getStatesOfCountry(selectedCountry).map(state => ({
//       value: state.isoCode,
//       label: state.name,
//     }));
//     setStates(stateOptions);
//     setCities([]);
//     setValue('address.state', '');
//     setValue('address.city', '');
//   };

//   const handleStateChange = (newValue) => {
//     const selectedState = newValue?.value || '';
//     setValue('address.state', selectedState);
//     const selectedCountry = getValues('address.country');
//     const cityOptions = City.getCitiesOfState(selectedCountry, selectedState).map(city => ({
//       value: city.name,
//       label: city.name,
//     }));
//     setCities(cityOptions);
//     setValue('address.city', '');
//   };

//   const handleAddEmployee = async (data) => {
//     try {
//       const create = await createEmployee(data);
//       if (create.data) {
//         toast.success(create.data.message);
//         refetchEmployees();
//         handleCloseModal();
//       } else {
//         toast.error(
//           create.error?.error ||
//           create.error?.message ||
//           "Failed to create employee"
//         );
//       }
//     } catch (error) {
//       toast.error("An error occurred while creating the employee");
//     }
//   };

//   const handleDepartmentAdd = async () => {
//     if (!departmentName || !departmentHead) {
//       toast.error("Department name and Head are required");
//       return;
//     }
//     const departmentDetails = {
//       departmentName,
//       departmentHead,
//     };
//     try {
//       const create = await createDepartment({ departmentDetails });
//       if (create.data) {
//         toast.success(create.data.message);
//         refetchDepartments();
//         handleDepartmentCloseModal();
//       } else {
//         toast.error(
//           create.error?.error ||
//           create.error?.message ||
//           "Failed to create department"
//         );
//       }
//     } catch (error) {
//       toast.error("An error occurred while creating the department");
//     }
//   };

//   useEffect(() => {
//     const newTabPath = location.pathname.split("/").pop();
//     setActiveTab(newTabPath);
//   }, [location.pathname]);

//   return (
//     <>
//       <Box
//         sx={{
//           width: "83%",
//           display: "flex",
//           flexDirection: "column",
//           gap: "0rem",
//         }}
//       >
//         {isLoading || (isLoadingDepartment && <Loading />)}
//         <ToastContainer />
        
//           <Grid container spacing={1} p={0}>
        
//           <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
//           <ProfileNav />
//         </Grid>
//         </Grid>
//         <Grid mt={"0rem"}>
//           <TransitionGroup>
//             <CSSTransition key={activeTab} timeout={0} classNames="fade">
//               <div className={`tab-content ${activeTab}`}>
//                 {activeTab === "Dashboard" && (
//                   <>
//                     <GlassEffect.GlassContainer>
//                       <DashBoard employees={employees} />
//                     </GlassEffect.GlassContainer>
//                   </>
//                 )}
//                 {activeTab === "Employees" && (
//                   <>
//                     <GlassEffect.GlassContainer>
//                       <Grid sx={{
//                         borderRadius: "10px",
//                         margin: "0 1rem",
//                         mt: "0.5rem",
//                         maxHeight: '80vh',
//                         overflow: 'hidden',
//                         padding: "1rem",
//                         boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
//                       }}>
//                         <Grid sx={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'space-between',
//                           mb: 1
//                         }}>
//                           <Grid sx={{
//                             width: '60%',
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: 1
//                           }}>
//                             <IconButton
//                               onClick={handleEmplyoeeModal}
//                               sx={{
//                                 backgroundColor: useTheme().palette.primary.main,
//                                 borderRadius: "15px",
//                                 padding: "8px 25px",
//                                 ml: 1,
//                                 "&:hover": {
//                                   backgroundColor: "#7de8ca",
//                                 },
//                               }}
//                             >
//                               <Add sx={{ color: "white", fontSize: "18px" }} />
//                               <Typography sx={{ ml: 1, color: "white", fontWeight: "200" }}>
//                                 Add Employee
//                               </Typography>
//                             </IconButton>
//                             <Tooltip title='Change View'>
//                               <IconButton
//                                 onClick={() => setTreeView(!treeView)}
//                                 sx={{
//                                   backgroundColor: useTheme().palette.primary.main,
//                                   borderRadius: "15px",
//                                   padding: "8px 25px",
//                                   "&:hover": {
//                                     backgroundColor: "#7de8ca",
//                                   },
//                                 }}
//                               >
//                                 {!treeView ? (<AccountTreeIcon sx={{ color: 'white' }} />) : (<TableChartIcon sx={{ color: 'white' }} />)}
//                               </IconButton>
//                             </Tooltip>
//                             {(user?.role === 'superAdmin' || user?.role === 'admin') && (
//                               <IconButton
//                                 onClick={handleOpen}
//                                 sx={{
//                                   backgroundColor: useTheme().palette.primary.main,
//                                   borderRadius: "15px",
//                                   padding: "8px 25px",
//                                   "&:hover": {
//                                     backgroundColor: "#7de8ca",
//                                   }
//                                 }}
//                               >
//                                 <Typography sx={{ ml: 1, color: "white", fontWeight: "200" }}>
//                                   Create Incentive Model
//                                 </Typography>
//                               </IconButton>
//                             )}
//                           </Grid>
//                           {!treeView && (
//                             <Pagination
//                               count={totalPages}
//                               page={currentPage}
//                               onChange={handlePageChange}
//                               sx={{
//                                 mt: 0,
//                                 display: "flex",
//                                 justifyContent: "flex-end",
//                                 mb: 0,
//                                 mr: 5,
//                               }}
//                               renderItem={(item) => (
//                                 <PaginationItem
//                                   {...item}
//                                   component="button"
//                                   sx={{
//                                     borderRadius: "50%",
//                                     backgroundColor:
//                                       item.page === currentPage ? "#398bf7" : "#ced1d6",
//                                     color:
//                                       item.page === currentPage ? "#398bf7" : "#000",
//                                     "&:hover": {
//                                       bgcolor:
//                                         item.page === currentPage
//                                           ? "#398bf7"
//                                           : "#398bf7",
//                                     },
//                                     mb: 1,
//                                   }}
//                                 />
//                               )}
//                             />
//                           )}
//                         </Grid>
//                         {!treeView && (
//                           <EmployeeList employees={currentEmployees} />
//                         )}
//                         {treeView && (
//                           <TreeView employee={employee} />
//                         )}
//                       </Grid>
//                     </GlassEffect.GlassContainer>
//                   </>
//                 )}
                
//                 {activeTab === "Attendance" && (
//                   <GlassEffect.GlassContainer>
//                     <Grid sx={{ width: "100%", height: "83vh", borderRadius: "10px", padding: "1rem", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
//                       <EmployeeTable employees={employee} />
//                     </Grid>
//                   </GlassEffect.GlassContainer>
//                 )}
//               </div>
//             </CSSTransition>
//           </TransitionGroup>
//         </Grid>
//         <Dialog
//           open={openModal}
//           onClose={handleCloseModal}
//           PaperProps={{
//             sx: {
//               borderRadius: "25px",
//               backgroundColor: useTheme().palette.background.default,
//             },
//           }}
//         >
//           {isCreatingEmployee && <Loading />}
//           <DialogTitle>Add New Employee</DialogTitle>
//           <DialogContent>
//             <Grid mt={2} container spacing={2}>
//               <Grid item xs={6}>
//                 <Controller
//                   name="name"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       autoFocus
//                       label="Name*"
//                       variant="outlined"
//                       fullWidth
//                       error={!!errors.name}
//                       helperText={errors.name?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="phone"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Phone*"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.phone}
//                       helperText={errors.phone?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="email"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Email*"
//                       type="email"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.email}
//                       helperText={errors.email?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="password"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Password*"
//                       type="password"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.password}
//                       helperText={errors.password?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="dob"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="D.O.B*"
//                       type="date"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.dob}
//                       InputLabelProps={{ shrink: true }}
//                       helperText={errors.dob?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Controller
//                   name="address.street"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Address*"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.address?.street}
//                       helperText={errors.address?.street?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="address.country"
//                   control={control}
//                   render={({ field }) => (
//                     <Autocomplete
//                       {...field}
//                       options={countries}
//                       getOptionLabel={(option) => option.label}
//                       onChange={(event, newValue) => {
//                         handleCountryChange(newValue);
//                         field.onChange(newValue?.value || '');
//                       }}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="Country"
//                           variant="outlined"
//                           error={!!errors.address?.country}
//                           helperText={errors.address?.country?.message}
//                           sx={{
//                             "& .MuiOutlinedInput-root": {
//                               border: "none",
//                               borderRadius: "15px",
//                               boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//                               "&:hover": {
//                                 boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
//                               },
//                               "&.Mui-focused": {
//                                 boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
//                               },
//                             },
//                           }}
//                         />
//                       )}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="address.state"
//                   control={control}
//                   render={({ field }) => (
//                     <Autocomplete
//                       {...field}
//                       options={states}
//                       getOptionLabel={(option) => option.label}
//                       onChange={(event, newValue) => {
//                         handleStateChange(newValue);
//                         field.onChange(newValue?.value || '');
//                       }}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="State"
//                           variant="outlined"
//                           error={!!errors.address?.state}
//                           helperText={errors.address?.state?.message}
//                           sx={{
//                             "& .MuiOutlinedInput-root": {
//                               border: "none",
//                               borderRadius: "15px",
//                               boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//                               "&:hover": {
//                                 boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
//                               },
//                               "&.Mui-focused": {
//                                 boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
//                               },
//                             },
//                           }}
//                         />
//                       )}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="address.city"
//                   control={control}
//                   render={({ field }) => (
//                     <Autocomplete
//                       {...field}
//                       options={cities}
//                       getOptionLabel={(option) => option.label}
//                       onChange={(event, newValue) => {
//                         field.onChange(newValue?.value || '');
//                       }}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="City"
//                           variant="outlined"
//                           error={!!errors.address?.city}
//                           helperText={errors.address?.city?.message}
//                           sx={{
//                             "& .MuiOutlinedInput-root": {
//                               border: "none",
//                               borderRadius: "15px",
//                               boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//                               "&:hover": {
//                                 boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
//                               },
//                               "&.Mui-focused": {
//                                 boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
//                               },
//                             },
//                           }}
//                         />
//                       )}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="address.zip"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Pin Code*"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.address?.zip}
//                       helperText={errors.address?.zip?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="panCard"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Pan Card"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.panCard}
//                       helperText={errors.panCard?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="aadhar"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Aadhar Card"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.aadhar}
//                       helperText={errors.aadhar?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="bankDetails.bankName"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Bank Name"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.bankDetails?.bankName}
//                       helperText={errors.bankDetails?.bankName?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="bankDetails.accountNumber"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Account Number"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.bankDetails?.accountNumber}
//                       helperText={errors.bankDetails?.accountNumber?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="bankDetails.ifscCode"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="IFSC Code"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.bankDetails?.ifscCode}
//                       helperText={errors.bankDetails?.ifscCode?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="bankDetails.branch"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Branch"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.bankDetails?.branch}
//                       helperText={errors.bankDetails?.branch?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="department"
//                   control={control}
//                   render={({ field }) => (
//                     <Autocomplete
//                       options={departments}
//                       getOptionLabel={(option) => option.departmentName}
//                       onChange={(event, newValue) => field.onChange(newValue ? newValue._id : null)}
//                       value={departments?.find((dept) => dept._id === field.value) || null}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="Select Department"
//                           variant="outlined"
//                           fullWidth
//                           error={!!errors.department}
//                           helperText={errors.department?.message}
//                           sx={inputStyles}
//                         />
//                       )}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="reportingManager"
//                   control={control}
//                   render={({ field }) => (
//                     <Autocomplete
//                       options={getManagers()}
//                       getOptionLabel={(option) => `${option.name} (${option.position})`}
//                       onChange={(event, newValue) => field.onChange(newValue ? newValue._id : null)}
//                       value={employee?.find((mgr) => mgr._id === field.value) || null}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="Reporting Manager"
//                           variant="outlined"
//                           fullWidth
//                           error={!!errors.reportingManager}
//                           helperText={errors.reportingManager?.message}
//                           sx={inputStyles}
//                         />
//                       )}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="position"
//                   control={control}
//                   render={({ field }) => (
//                     <Autocomplete
//                       freeSolo
//                       options={position}
//                       onChange={(event, value) => {
//                         field.onChange(value);
//                       }}
//                       onInputChange={(event, value) => {
//                         field.onChange(value);
//                       }}
//                       value={field.value || ""}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="Position*"
//                           variant="outlined"
//                           fullWidth
//                           error={!!errors.position}
//                           helperText={errors.position?.message}
//                           sx={inputStyles}
//                         />
//                       )}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="role"
//                   control={control}
//                   render={({ field }) => (
//                     <Autocomplete
//                       freeSolo
//                       options={["Admin", "Employee", "Manager", "HR"]}
//                       onChange={(e, value) => field.onChange(value)}
//                       value={field.value || null}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="Role*"
//                           variant="outlined"
//                           fullWidth
//                           error={!!errors.role}
//                           helperText={errors.role?.message}
//                           sx={inputStyles}
//                         />
//                       )}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="socialMedia.twitter"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Twitter"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.socialMedia?.twitter}
//                       helperText={errors.socialMedia?.twitter?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="socialMedia.linkedin"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="LinkedIn"
//                       type="text"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.socialMedia?.linkedin}
//                       helperText={errors.socialMedia?.linkedin?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="qualification"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="Qualification"
//                       variant="outlined"
//                       fullWidth
//                       error={!!errors.qualification}
//                       helperText={errors.qualification?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="files.tenth"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="10th Certificate"
//                       type="file"
//                       InputLabelProps={{ shrink: true }}
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.files?.tenth}
//                       helperText={errors.files?.tenth?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="files.twelfth"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="12th Certificate"
//                       InputLabelProps={{ shrink: true }}
//                       type="file"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.files?.twelfth}
//                       helperText={errors.files?.twelfth?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="files.highEducation"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="High Education Certificate"
//                       type="file"
//                       InputLabelProps={{ shrink: true }}
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.files?.highEducation}
//                       helperText={errors.files?.highEducation?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="files.aadhar"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       InputLabelProps={{ shrink: true }}
//                       label="Aadhaar Card"
//                       type="file"
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.files?.aadhar}
//                       helperText={errors.files?.aadhar?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <Controller
//                   name="files.panCard"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       margin="dense"
//                       label="PAN Card"
//                       type="file"
//                       InputLabelProps={{ shrink: true }}
//                       fullWidth
//                       variant="outlined"
//                       error={!!errors.files?.panCard}
//                       helperText={errors.files?.panCard?.message}
//                       sx={inputStyles}
//                     />
//                   )}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions sx={{ mr: 2 }}>
//             <IconButton
//               onClick={handleCloseModal}
//               sx={{
//                 backgroundColor: "#4287f5",
//                 borderRadius: "15px",
//                 padding: "8px 25px",
//                 "&:hover": {
//                   backgroundColor: "#6ea4fa",
//                 },
//               }}
//             >
//               <Cancel sx={{ color: "white", fontSize: "18px" }} />
//               <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
//                 Cancel
//               </Typography>
//             </IconButton>
//             <IconButton
//               onClick={handleSubmit(handleAddEmployee)}
//               disabled={isSubmitting}
//               sx={{
//                 backgroundColor: "#4287f5",
//                 borderRadius: "15px",
//                 padding: "8px 25px",
//                 "&:hover": {
//                   backgroundColor: "#6ea4fa",
//                 },
//               }}
//             >
//               <Add sx={{ color: "white", fontSize: "18px" }} />
//               <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
//                 Add
//               </Typography>
//             </IconButton>
//           </DialogActions>
//         </Dialog>
//         <Dialog
//           open={departmentModal}
//           onClose={handleDepartmentCloseModal}
//           PaperProps={{
//             sx: {
//               borderRadius: "25px",
//             },
//           }}
//         >
//           <DialogTitle>Add New Department</DialogTitle>
//           <DialogContent>
//             <Grid mt={2} container spacing={2}>
//               <Grid item xs={12} width={"100%"}>
//                 <img
//                   src={departmentImgage}
//                   alt="departmentImgage"
//                   height={"200px"}
//                   width={"100%"}
//                   style={{
//                     borderRadius: "15px",
//                     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
//                     marginBottom: "20px",
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <Autocomplete
//                   options={employee || []}
//                   getOptionLabel={(option) =>
//                     `${option?.name} ${option?.email} (${option?.position}) `
//                   }
//                   value={
//                     employee?.find((option) => option?._id === departmentHead) ||
//                     null
//                   }
//                   onChange={(event, newValue) => {
//                     setDepartmentHead(newValue?._id || []);
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       label="Department Head"
//                       variant="outlined"
//                       fullWidth
//                       sx={{
//                         "& .MuiInputLabel-root": {
//                           color: "#000",
//                           borderRadius: "15px",
//                         },
//                         "& .MuiOutlinedInput-root": {
//                           "& fieldset": {
//                             borderColor: "#ced1d6",
//                             borderRadius: "15px",
//                             boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//                             border: "none",
//                           },
//                           "&:hover fieldset": {
//                             borderColor: "#398bf7",
//                           },
//                           "&.Mui-focused fieldset": {
//                             borderColor: "#398bf7",
//                           },
//                         },
//                       }}
//                     />
//                   )}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   autoFocus
//                   label="Department Name"
//                   type="text"
//                   variant="outlined"
//                   value={departmentName}
//                   onChange={(e) => setDepartmentName(e.target.value)}
//                   fullWidth
//                   sx={{
//                     "& .MuiInputLabel-root": {
//                       color: "#000",
//                       borderRadius: "15px",
//                     },
//                     "& .MuiOutlinedInput-root": {
//                       "& fieldset": {
//                         borderColor: "#ced1d6",
//                         borderRadius: "15px",
//                         boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//                         border: "none",
//                       },
//                       "&:hover fieldset": {
//                         borderColor: "#398bf7",
//                       },
//                       "&.Mui-focused fieldset": {
//                         borderColor: "#398bf7",
//                       },
//                     },
//                   }}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions sx={{ mr: 2 }}>
//             <IconButton
//               onClick={handleDepartmentCloseModal}
//               sx={{
//                 backgroundColor: "#4287f5",
//                 borderRadius: "15px",
//                 padding: "8px 25px",
//                 "&:hover": {
//                   backgroundColor: "#6ea4fa",
//                 },
//               }}
//             >
//               <Cancel sx={{ color: "white", fontSize: "18px" }} />
//               <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
//                 Cancel
//               </Typography>
//             </IconButton>
//             <IconButton
//               onClick={handleDepartmentAdd}
//               disabled={isSubmitting}
//               sx={{
//                 backgroundColor: "#4287f5",
//                 borderRadius: "15px",
//                 padding: "8px 25px",
//                 "&:hover": {
//                   backgroundColor: "#6ea4fa",
//                 },
//               }}
//             >
//               <Add sx={{ color: "white", fontSize: "18px" }} />
//               <Typography sx={{ ml: 1, color: "white", fontWeight: "500" }}>
//                 Add
//               </Typography>
//             </IconButton>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </>
//   );
// }

// export default Employees;