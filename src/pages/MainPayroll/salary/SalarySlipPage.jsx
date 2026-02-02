import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import {
  ViewModule,
  ViewList,
  Search,
  Download,
  FilterList,
  CalendarMonth,
  Close,
  Visibility,
} from "@mui/icons-material";
import { useGet } from "../../../hooks/useApi";
import { useAuth } from "../../../middlewares/auth";
import SalarySlipPreview from "./SalarySlipPreview";
import { getMonthName } from "../../../utils/payroll";

const getDaysInMonth = (month, year) =>
  new Date(year, month, 0).getDate();


const SalarySlipPage = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [openPreview, setOpenPreview] = useState(false);


  console.log(user, 'user info in SalarySlipPage');
  const params = useMemo(() => {
    const p = {};
    if (month) p.month = month;
    if (year) p.year = year;
    return p;
  }, [month, year]);

  const { data, isLoading } = useGet(
    "company/salery/employee-salary-slips",
    params
  );

  const slips = Array.isArray(data?.data?.data) ? data.data.data : [];

  const filteredSlips = useMemo(() => {
    return slips.filter((slip) => {
      const monthName = getMonthName(slip.month).toLowerCase();
      const yearStr = slip.year.toString();
      const status = (slip.status || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      return (
        monthName.includes(search) ||
        yearStr.includes(search) ||
        status.includes(search)
      );
    });
  }, [slips, searchTerm]);

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleViewSlip = (slip) => {
    setSelectedSlip(slip);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  if (isLoading) {
    return (
      <Box p={3}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8f9fa", minHeight: "100vh", width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            My Salary Slips
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View and download your salary slips
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              border: "1px solid #e0e0e0",
              "&.Mui-selected": {
                bgcolor: "#667eea",
                color: "#fff",
                "&:hover": {
                  bgcolor: "#5568d3",
                },
              },
            },
          }}
        >
          <ToggleButton value="grid">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewList />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          bgcolor: "#fff",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search slips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Select
              fullWidth
              size="small"
              value={month}
              displayEmpty
              onChange={(e) => setMonth(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <CalendarMonth fontSize="small" color="action" />
                </InputAdornment>
              }
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="">All Months</MenuItem>
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} md={2}>
            <Select
              fullWidth
              size="small"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              sx={{
                borderRadius: 2,
              }}
            >
              {[2024, 2025, 2026].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} md={2}>
            <Chip
              label={`${filteredSlips.length} Slip${
                filteredSlips.length !== 1 ? "s" : ""
              }`}
              sx={{
                bgcolor: "#e8eaf6",
                color: "#3f51b5",
                fontWeight: 600,
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<FilterList />}
              onClick={() => {
                setMonth("");
                setYear(new Date().getFullYear());
                setSearchTerm("");
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Content */}
      {filteredSlips.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography color="text.secondary" variant="h6">
            No salary slips found
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            Try adjusting your filters
          </Typography>
        </Paper>
      ) : viewMode === "grid" ? (
        <Grid container spacing={3}>
          {filteredSlips.map((slip) => (
            <Grid item xs={12} sm={6} md={4} key={slip._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e0e0e0",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardActionArea onClick={() => handleViewSlip(slip)}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {getMonthName(slip.month)} {slip.year}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          Issued: {new Date(slip.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={slip.status}
                        size="small"
                        color={slip.status === "Success" ? "success" : "warning"}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: "#f0f4ff",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Net Pay
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        ₹{slip.netPay.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Working Days
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {getDaysInMonth(slip.month, slip.year) - (slip.absentDays || 0)}/{getDaysInMonth(slip.month, slip.year)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" color="text.secondary">
                          Deductions
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          ₹{(slip.totalDeductions || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<Visibility />}
                      sx={{
                        mt: 2,
                        textTransform: "none",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: 2,
                        py: 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSlip(slip);
                      }}
                    >
                      View Slip
                    </Button>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e0e0e0",
          }}
        >
          {filteredSlips.map((slip, index) => (
            <Box
              key={slip._id}
              sx={{
                p: 2.5,
                borderBottom:
                  index < filteredSlips.length - 1 ? "1px solid #e0e0e0" : "none",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#f8f9fa",
                },
              }}
              onClick={() => handleViewSlip(slip)}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography fontWeight="600" color="text.primary">
                    {getMonthName(slip.month)} {slip.year}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(slip.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Net Pay
                  </Typography>
                  <Typography fontWeight="700" color="primary">
                    ₹{slip.netPay.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Typography variant="caption" color="text.secondary">
                    Days
                  </Typography>
                  <Typography fontWeight="600">
                    {30 - (slip.absentDays || 0)}/30
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Chip
                    label={slip.status}
                    size="small"
                    color={slip.status === "Success" ? "success" : "warning"}
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSlip(slip);
                    }}
                  >
                    View
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Paper>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Salary Slip Preview
          </Typography>
          <IconButton onClick={handleClosePreview} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedSlip && (
            <SalarySlipPreview slip={selectedSlip} user={user} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SalarySlipPage;