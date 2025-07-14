import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useGet, usePost } from "../../../hooks/useApi.jsx";
import { toast, ToastContainer } from 'react-toastify';
import Loading from "../../../../public/Loading/Index..js";
import { useAuth } from "../../../middlewares/auth/index.js";
import { useDispatch } from "react-redux";

// Define the validation schema using zod
const schema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectDetails: z.string().min(1, "Project details are required"),
  clientName: z.string().min(1, "Client name is required"),
  clientAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "ZIP code is required"),
  }),
  clientContact: z.object({
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"), // Assuming 10-digit phone number
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email address is required"),
  }),
  techStack: z.string().min(1, "Tech stack is required"),
  additionalNotes: z.string().optional(), // Optional field
  additionalFields: z.array(z.string()).optional(), // Optional array of strings
});

const AddProjectForm = ({success}) => {
  const {user} = useAuth()
  
  const [accessTo, setAccessTo] = useState([]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      projectName: "",
      projectDetails: "",
      clientName: "",
      clientAddress: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
      clientContact: {
        phone: "",
        email: "",
      },
      techStack: "",
      additionalNotes: "",
      additionalFields: [], // Initialize with an empty array
      
    },
  });
  const [loading, setLoading] = useState(false);
  const { mutateAsync, isLoading, isError, error } = usePost('/project/create',{}, 'projects');
  const dispatch = useDispatch();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalFields",
  });

  const onSubmit = async (data) => {
    const dataSubmit = {
      ...data,
      accessTo
    }
    try {
      setLoading(true);
      const res = await mutateAsync(dataSubmit);
      
      if (res.data !== null) {

        toast.success(res.data.message);
        dispatch(dispatch({
          type: "PROJECT_UPDATE",
          payload: true
        }))
        setLoading(false);
        success(true)
      }
      else {
        res?.error?.error && toast.error(res.error.error);
        toast.error(res.error.message);
        setLoading(false);
      }
    } catch (error) {
      toast.error('Failed to create or update project.');
      setLoading(false);
    }
  };

  return (
    <>
    {loading && <Loading/>}
    <Paper
      style={{
        
        margin: "auto",
        maxWidth: '100%',
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
         <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ backgroundColor: "transparent" }}
      >
        <Grid container spacing={2} bgcolor={"transparent"}>
          {/* Header */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color={"#262626"}>
              Add New Project
            </Typography>
          </Grid>
          {/* Client Name */}
          <Grid item xs={12} md={4}>
            <Controller
              name="clientName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Client Name*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.clientName}
                  helperText={errors.clientName?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={8} container gap={2}>
          <Grid item xs={16} md={5} container gap={0}>
            <Controller
              name="clientContact.phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.clientContact?.phone}
                  helperText={errors.clientContact?.phone?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
            </Grid>
            <Grid item xs={12} md={6} container gap={0}>
            <Controller
              name="clientContact.email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.clientContact?.email}
                  helperText={errors.clientContact?.email?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
            </Grid>
          </Grid>
          {/* Client Address */}
          <Grid item xs={12} md={11.6} container gap={2}>
          <Grid item xs={12} md={12} container gap={0}>
            <Controller
              name="clientAddress.street"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Street*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.clientAddress?.street}
                  helperText={errors.clientAddress?.street?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
            </Grid>
            <Grid item xs={12} md={4.0} container gap={0}>
            <Controller
              name="clientAddress.city"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="City*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.clientAddress?.city}
                  helperText={errors.clientAddress?.city?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
            </Grid>
            <Grid item xs={12} md={3.4} container gap={0}>
            <Controller
              name="clientAddress.state"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="State*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.clientAddress?.state}
                  helperText={errors.clientAddress?.state?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
            </Grid>
            <Grid item xs={12} md={4.1} container gap={0}>
            <Controller
              name="clientAddress.zip"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ZIP Code*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.clientAddress?.zip}
                  helperText={errors.clientAddress?.zip?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
            </Grid>
          </Grid>
          {/* Project Name */}
          <Grid item xs={11.6} md={5.6}>
            <Controller
              name="projectName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Name*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.projectName}
                  helperText={errors.projectName?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
          </Grid>
          {/* Tech Stack */}
          <Grid item xs={12} md={6}>
            <Controller
              name="techStack"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tech Stack*"
                  variant="outlined"
                  fullWidth
                  error={!!errors.techStack}
                  helperText={errors.techStack?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
          </Grid>
          {/* Project Details */}
          <Grid item xs={11.6}>
            <Controller
              name="projectDetails"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Details*"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.projectDetails}
                  helperText={errors.projectDetails?.message}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
          </Grid>
          {/* Additional Notes */}
          <Grid item xs={11.6}>
            <Controller
              name="additionalNotes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Additional Notes"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "20px", // Border radius
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "grey", // Border color
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main", // Border color on hover
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main", // Border color when focused
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "grey", // Set label color to grey
                    },
                  }}
                />
              )}
            />
          </Grid>
          {fields.length > 0 && (
            <Grid item xs={11.6}>
              <Typography fontSize={{ xs: "12px", sm: "14px", md: "16px" }}>Additional Fields</Typography>
            </Grid>
          )}
          {fields.map((item, index) => (
            <Grid item xs={12} md={5.8} key={item.id}>
              <Controller
                name={`additionalFields.${index}`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`Additional Field ${index + 1}`}
                    variant="outlined"
                    fullWidth
                    error={!!errors.additionalFields?.[index]}
                    helperText={errors.additionalFields?.[index]?.message}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "20px", // Border radius
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", // Default box shadow
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "grey", // Border color
                        },
                        "&:hover fieldset": {
                          borderColor: "primary.main", // Border color on hover
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main", // Border color when focused
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Box shadow when focused
                        },
                      },
                      "& .MuiFormLabel-root": {
                        color: "grey", // Set label color to grey
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => remove(index)}>
                          <RemoveIcon  sx={{color: "red"}}/>
                        </IconButton>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={() => append("")}
              startIcon={<AddIcon />}
            >
              Add More Fields
            </Button>
          </Grid>
          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" sx={{
               backgroundColor: "#4287f5",
               padding: 1,
               borderRadius: "15px",
               padding: "10px 50px",
               '&:hover': {
                 backgroundColor: "#6ea4fa",
               }
            }}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
    </>
  );
};

export default AddProjectForm;
