import React, { useState } from "react";
import {
  Avatar,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Paper,
  Button,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from "@mui/icons-material/EditNote";
import WorkIcon from "@mui/icons-material/Work";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import ConfirmationDialog from "../../../../components/confirmations/confirmDailog";
import AddOrUpdateEmp from "./addOrUpdateEmp";
import { usePost } from "../../../../hooks/useApi";

const commonStyles = {
  select: {
    minWidth: 180,
    height: 40,
    fontSize: 14,
    borderRadius: 1,
    bgcolor: "#f9f9f9",
  },
  button: {
    textTransform: "none",
    height: 40,
    fontSize: 14,
    borderRadius: 1,
    bgcolor: "#1976d2",
    "&:hover": { bgcolor: "#1565c0" },
  },
  iconButton: {
    p: 1,
    bgcolor: "#f9f9f9",
    borderRadius: 1,
  },
  typography: {
    fontSize: 14,
    color: "#333",
  },
  tableCellHeader: {
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  positionTag: {
    fontSize: 12,
    border: "1px solid grey",
    padding: "2px 6px",
    color: "grey",
    borderRadius: 6,
  },
};

const calculateExperience = (createdAt) => {
  if (!createdAt) return "0m";
  const createdDate = new Date(createdAt);
  const now = new Date();
  
  const diffMs = now - createdDate;
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30)); // Approximate months
  
  if (diffMonths < 1) return "0m";
  if (diffMonths < 12) return `${diffMonths}m`;
  
  const years = (diffMonths / 12).toFixed(1);
  return `${years}y`;
};

const formatPositionAbbreviation = (position) => {
  if (!position) return "";
  const words = position.split(" ");
  if (words.length <= 1) return position;
  return words.map(word => word.charAt(0).toUpperCase()).join("");
};

function EmployeeList({ employees }) {
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteableEmployee, setDeleteableEmployee] = useState(null);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [editEmpId, setEditEmpId] = useState(null);
  const { mutate: deleteEmployee } = usePost("/employee/delete");

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      employees.map((employee) => ({
        Name: employee.name || "",
        EmpID: employee.empId || "",
        Designation: employee.position || "",
        Department: employee.department || "",
        Experience: employee.createdAt ? calculateExperience(employee.createdAt) : "",
        Status: employee.status || "",
        Type: employee.workType || "",
        DOJ: formatDate(employee.createdAt),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "EmployeeData.xlsx");
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesCategory = !filterCategory || employee.department === filterCategory;
    const matchesWorkType = !workTypeFilter || employee.workType === workTypeFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      (employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       employee.empId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesWorkType && matchesSearch;
  });

  // Log the filtered employees data to the console
  console.log("Filtered Employees Data:", {
    totalEmployees: filteredEmployees.length,
    employees: filteredEmployees.map((employee) => ({
      name: employee.name,
      empId: employee.empId,
      position: employee.position,
      department: employee.department,
      experience: employee.createdAt ? calculateExperience(employee.createdAt) : "0m",
      status: employee.status,
      workType: employee.workType,
      doj: formatDate(employee.createdAt),
    })),
  });

  const handleProfileClick = (id) => {
    navigate(`/employee/${id}`);
  };

  const handleDeleteClick = (employeeId) => {
    setEmployeeToDelete(employeeId);
    setOpenDialog(true);
    setDeleteableEmployee({ id: employeeId, name: employeename });
  };

  const handleConfirmDelete = async () => {
    const id = deleteableEmployee?.id;
    if (id) {
      const result = await deleteEmployee({ id });
      if (result) {
        toast.success(result?.data?.message);
        setOpenDialog(false);
        setEmployeeToDelete(null);
        setDeleteableEmployee(null);
      } else {
        toast.error(result?.error?.error);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEmployeeToDelete(null);
    setDeleteableEmployee(null);
  };

  const handleEditClick = (employeeId) => {
    setOpenModalUpdate(true);
    setEditEmpId(employeeId);
  };

  const handleCloseModal = () => {
    setOpenModalUpdate(false);
    setEditEmpId(null);
  };

  return (
    <Box sx={{ height: "70vh", p: 2, display: "flex", flexDirection: "column" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
          gap: 1,
          p: 1,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          sx={commonStyles.select}
          displayEmpty
          renderValue={(selected) => selected || "Select Department"}
        >
          <MenuItem value="">All Department</MenuItem>
          <MenuItem value="HR">HR</MenuItem>
          <MenuItem value="IT">IT</MenuItem>
          <MenuItem value="Finance">Finance</MenuItem>
        </Select>
        <Select
          value={workTypeFilter}
          onChange={(e) => setWorkTypeFilter(e.target.value)}
          sx={commonStyles.select}
          displayEmpty
          renderValue={(selected) => selected || "Select Work Type"}
        >
          <MenuItem value="">All Work Types</MenuItem>
          <MenuItem value="Remote">Remote</MenuItem>
          <MenuItem value="Office">Office</MenuItem>
          <MenuItem value="Hybrid">Hybrid</MenuItem>
        </Select>
        {showSearchBar ? (
          <TextField
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => setShowSearchBar(false)}
            autoFocus
            sx={{
              width: 150,
              "& .MuiInputBase-root": commonStyles.select,
            }}
          />
        ) : (
          <IconButton onClick={() => setShowSearchBar(true)} sx={commonStyles.iconButton}>
            <SearchIcon sx={{ fontSize: 24, color: "#1976d2" }} />
          </IconButton>
        )}
        <Button
          variant="contained"
          onClick={exportToExcel}
          sx={commonStyles.button}
        >
          Export
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          maxHeight: "calc(70vh - 80px)",
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="employee table">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1976d2",
                color: "#ffffff",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <TableCell sx={commonStyles.tableCellHeader}>Name</TableCell>
              <TableCell sx={commonStyles.tableCellHeader}>EmpID</TableCell>
              <TableCell sx={commonStyles.tableCellHeader}>Designation</TableCell>
              <TableCell sx={commonStyles.tableCellHeader}>Department</TableCell>
              <TableCell sx={commonStyles.tableCellHeader}>Experience</TableCell>
              <TableCell sx={commonStyles.tableCellHeader}>Status</TableCell>
              <TableCell sx={commonStyles.tableCellHeader}>Type</TableCell>
              <TableCell sx={commonStyles.tableCellHeader}>DOJ</TableCell>
              <TableCell sx={commonStyles.tableCellHeader}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow
                key={employee._id}
                sx={{ "&:hover": { backgroundColor: "#f5f5f5" }, cursor: "pointer" }}
                onClick={() => handleProfileClick(employee._id)}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar src={employee.avatar || ""} sx={{ width: 40, height: 40 }} />
                    <Box>
                      <Typography variant="h6" sx={commonStyles.typography}>
                        {employee.name || ""}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 12, color: "#666" }}>
                        {employee.email || ""}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={commonStyles.typography}>
                    {employee.empId || ""}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography sx={commonStyles.positionTag}>
                      {formatPositionAbbreviation(employee.position)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={commonStyles.typography}>
                    {employee.department || ""}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={commonStyles.typography}>
                    {employee.createdAt ? calculateExperience(employee.createdAt) : "0m"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        ...commonStyles.statusDot,
                        backgroundColor: employee.status === "active" ? "green" : "red",
                      }}
                    />
                    <Typography variant="h6" sx={commonStyles.typography}>
                      {employee.status || ""}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {employee.workType === "remote" ? (
                      <>
                        <HomeIcon sx={{ color: "blue", fontSize: 18 }} />
                        <Typography variant="h6" sx={commonStyles.typography}>
                          Remote
                        </Typography>
                      </>
                    ) : employee.workType === "office" ? (
                      <>
                        <WorkIcon sx={{ color: "grey", fontSize: 18 }} />
                        <Typography variant="h6" sx={commonStyles.typography}>
                          Office
                        </Typography>
                      </>
                    ) : (
                      <>
                        <WorkIcon sx={{ color: "grey", fontSize: 18 }} />
                        <HomeIcon sx={{ color: "blue", fontSize: 18 }} />
                        <Typography variant="h6" sx={commonStyles.typography}>
                          Hybrid
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={commonStyles.typography}>
                    {formatDate(employee.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(employee._id);
                      }}
                      sx={{ color: "#d32f2f" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(employee._id);
                      }}
                      sx={{ color: "#2e7d32" }}
                    >
                      <EditNoteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${deleteableEmployee?.name || "this employee"}?`}
      />
      <AddOrUpdateEmp openModalUpdate={openModalUpdate} onClose={handleCloseModal} empId={editEmpId} />
    </Box>
  );
}

export default EmployeeList;