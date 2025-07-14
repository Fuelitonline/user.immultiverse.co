import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Cancel, EditAttributes, Visibility, VisibilityOff } from "@mui/icons-material";
import Loading from "../../../../../public/Loading/Index";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGet, usePost } from "../../../../hooks/useApi";
import { z } from "zod";
import InputAdornment from '@mui/material/InputAdornment'; 
import { useTheme } from "@emotion/react";
const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(), // Make password optional
  role: z.string().min(1, "Role is required"),
  position: z.string().min(1, "Position is required"),
  department: z.string().optional(),
  reportingManager: z.string().optional(),
});

function AddOrUpdateEmp({ openModalUpdate, onClose, empId }) {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sendPassword, setSendPassword] = useState(false); // Checkbox state
  const { mutateAsync: updateEmployee, isLoading: isSubmitting } =
    usePost("employee/update");
  const [showPassword, setShowPassword] = useState(false);

  const { data: employeesData } = useGet("employee/all");
  const { data: departmentsData } = useGet("department/all");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    if (departmentsData?.data) {
      setDepartments(departmentsData.data.message[0]);
    }
    if (employeesData?.data) {
      setEmployees(employeesData.data.message[0]);
     
    }
  }, [departmentsData, employeesData]);

  useEffect(() => {
    if (empId) {
      const employee = employees.find((emp) => emp._id === empId);
      if (employee) {
        reset(employee);
      }
    } else {
      reset();
    }
  }, [empId, employees, reset]);

  const handleCloseModal = () => {
    onClose();
    reset();
  };
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleAddOrUpdateEmployee = async (data) => {
    try {
      const updateData = {
        employeeId: empId,
        name: data.name,
        email: data.email,
        role: data.role,
        position: data.position,
        department: data.department,
        reportingManager: data.reportingManager,
      };

      // Include password only if the checkbox is checked
      if (sendPassword && data.password) {
        updateData.password = data.password;
      }
     console.log(updateData)
      await updateEmployee({ updateData });
      toast.success("Employee updated successfully");
      handleCloseModal();
    } catch (error) {
      toast.error("An error occurred while saving the employee");
    }
  };

  return (
    <Dialog
      open={openModalUpdate}
      onClose={handleCloseModal}
      PaperProps={{
        sx: { borderRadius: "25px", minWidth: 300, boxShadow: 24, padding: 2 },
      }}
    >
      {isSubmitting && <Loading />}
      <DialogTitle>
        {empId ? "Update Employee" : "Add New Employee"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={!sendPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendPassword}
                  onChange={(e) => setSendPassword(e.target.checked)}
                />
              }
              label="Reset Password"
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={departments}
                  getOptionLabel={(option) => option.departmentName}
                  onChange={(event, newValue) => field.onChange(newValue?._id)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Department"
                      variant="outlined"
                      error={!!errors.department}
                      helperText={errors.department?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="reportingManager"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.position})`
                  }
                  onChange={(event, newValue) => field.onChange(newValue?._id)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reporting Manager"
                      variant="outlined"
                      error={!!errors.reportingManager}
                      helperText={errors.reportingManager?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={[
                    "Senior Developer",
                    "Junior Developer",
                    "Designer",
                    "Manager",
                    "HR",
                  ]}
                  onChange={(event, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Position"
                      variant="outlined"
                      error={!!errors.position}
                      helperText={errors.position?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={["Admin", "Employee", "Manager", "HR"]}
                  onChange={(event, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Role"
                      variant="outlined"
                      error={!!errors.role}
                      helperText={errors.role?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <IconButton
          onClick={handleCloseModal}
          sx={{
            backgroundColor: "#f52c1d",
            color: "white",
            "&:hover": {
              backgroundColor: "#eb4034",
            },
            borderRadius: "10px",
          }}
        >
          <Cancel />
          <Typography>Cancel</Typography>
        </IconButton>
        <IconButton
          onClick={handleSubmit(handleAddOrUpdateEmployee)}
          sx={{
            backgroundColor: "#16820c",
            color: "white",
            "&:hover": {
              backgroundColor: "#319928",
            },
            borderRadius: "10px",
          }}
        >
          <EditAttributes />
          <Typography>{empId ? "Update" : "Add"}</Typography>
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddOrUpdateEmp;
