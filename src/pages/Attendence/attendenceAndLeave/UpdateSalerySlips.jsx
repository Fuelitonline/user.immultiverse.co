import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import FormulaIcon from "@mui/icons-material/Functions";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { evaluate } from "mathjs";
import { useGet, usePost } from "../../../hooks/useApi";
import { styled } from "@mui/system";



const ModernButton = styled(Button)({
  background: "linear-gradient(45deg, #00c6ff 0%, #0072ff 100%)",
  borderRadius: "30px",
  padding: "10px 24px",
  color: "#fff",
  fontWeight: "bold",
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(0, 114, 255, 0.4)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 6px 20px rgba(0, 114, 255, 0.6)",
    background: "linear-gradient(45deg, #00e6ff 0%, #0096ff 100%)",
  },
});

const ModernDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    padding: "16px",
    transform: "translateZ(0)",
  },
});

const SalaryManagementSheet = ({ employees, month, year }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [formulaDialog, setFormulaDialog] = useState(null);
  const [columnFormulas, setColumnFormulas] = useState({});

  // API Hooks
  const { data: saleries, isLoading } = useGet("/company/salery/get-salery", { month, year });
  const handleSaleryUpdate = usePost("/company/salery/create-or-update-salery");

  // Initialize columns and rows
  useEffect(() => {
    if (!employees || !saleries?.data?.data) return;

    const baseColumns = [
      { field: "employeeName", headerName: "Employee Name", width: 200, editable: false },
      { field: "ctc", headerName: "CTC", width: 150, editable: true,type: "number", },
      { field: "basePay", headerName: "Base Pay", type: "number", width: 150, editable: true },
      { field: "bonus", headerName: "Bonus", type: "number", width: 150, editable: true },
      { field: "deductions", headerName: "Deductions", type: "number", width: 150, editable: true },
      { field: "tax", headerName: "Tax", type: "number", width: 150, editable: true },
      { field: "allowance", headerName: "Allowance", type: "number", width: 150, editable: true },
      { field: "absentDays", headerName: "Absent Days", type: "number", width: 150, editable: true },
      { field: "extraHours", headerName: "Extra Hours", type: "number", width: 150, editable: true },
      {
        field: "extraHoursPayRate",
        headerName: "Extra Hours Rate",
        type: "number",
        width: 150,
        editable: true,
      },
      { field: "netPay", headerName: "Net Pay", type: "number", width: 150, editable: false },
      {
        field: "customAllowances",
        headerName: "Custom Allowances",
        width: 300,
        renderCell: (params) => (
          <CustomEntriesManager
            entries={params.row.customAllowances || []}
            onAddEntry={(entry) =>
              handleCustomEntryChange(params.row.id, "customAllowances", "add", entry)
            }
            onRemoveEntry={(index) =>
              handleCustomEntryChange(params.row.id, "customAllowances", "remove", index)
            }
            onUpdateEntry={(index, field, value) =>
              handleCustomEntryChange(
                params.row.id,
                "customAllowances",
                "update",
                index,
                field,
                value
              )
            }
          />
        ),
      },
      {
        field: "customDeductions",
        headerName: "Custom Deductions",
        width: 300,
        renderCell: (params) => (
          <CustomEntriesManager
            entries={params.row.customDeductions || []}
            onAddEntry={(entry) =>
              handleCustomEntryChange(params.row.id, "customDeductions", "add", entry)
            }
            onRemoveEntry={(index) =>
              handleCustomEntryChange(params.row.id, "customDeductions", "remove", index)
            }
            onUpdateEntry={(index, field, value) =>
              handleCustomEntryChange(
                params.row.id,
                "customDeductions",
                "update",
                index,
                field,
                value
              )
            }
          />
        ),
      },
    ];

    const columnsWithFormula = baseColumns
      .map((col) =>
        col.type === "number"
          ? [
              col,
              {
                field: `${col.field}Formula`,
                headerName: `${col.headerName} Formula`,
                width: 200,
                renderCell: (params) => (
                  <Tooltip title="Set Column Formula">
                    <IconButton
                      color="primary"
                      onClick={() => openFormulaDialog(col.field)}
                      sx={{ "&:hover": { transform: "scale(1.2)" } }}
                    >
                      <FormulaIcon />
                    </IconButton>
                  </Tooltip>
                ),
              },
            ]
          : [col]
      )
      .flat();

    setColumns(columnsWithFormula);

    const initialRows = employees.map((emp) => {
      const existingSalary = saleries.data.data.find((s) => s.employeeId === emp._id) || {};
      return {
        id: emp._id,
        employeeName: emp.name,
        ctc: existingSalary.ctc || 0,
        basePay: existingSalary.basePay || 0,
        bonus: existingSalary.bonus || 0,
        deductions: existingSalary.deductions || 0,
        tax: existingSalary.tax || 0,
        allowance: existingSalary.allowance || 0,
        absentDays: existingSalary.absentDays || 0,
        extraHours: existingSalary.extraHours || 0,
        extraHoursPayRate: existingSalary.extraHoursPayRate || 0,
        netPay: existingSalary.netPay || 0,
        customAllowances: existingSalary.customAllowances || [],
        customDeductions: existingSalary.customDeductions || [],
      };
    });

    setRows(initialRows);
  }, [employees, saleries]);

  const openFormulaDialog = (field) => {
    setFormulaDialog({
      field,
      formula: columnFormulas[field] || "=",
    });
  };

  const handleRowEdit = (newRow) => {
    const updatedRow = { ...newRow };
    const totalAllowances = (updatedRow.customAllowances || []).reduce(
      (sum, allowance) => sum + (parseFloat(allowance.value) || 0),
      0
    );
    const totalDeductions = (updatedRow.customDeductions || []).reduce(
      (sum, deduction) => sum + (parseFloat(deduction.value) || 0),
      0
    );

    updatedRow.netPay =
      (updatedRow.basePay || 0) +
      (updatedRow.bonus || 0) +
      (updatedRow.allowance || 0) +
      totalAllowances -
      (updatedRow.deductions || 0) -
      (updatedRow.tax || 0) -
      totalDeductions;

    setRows((prevRows) =>
      prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
    console.log(updatedRow);
    return updatedRow;
  };

  const handleCustomEntryChange = (rowId, entryType, action, ...args) => {
    setRows((prevRows) => {
      const newRows = prevRows.map((row) => {
        if (row.id !== rowId) return row;

        const currentEntries = Array.isArray(row[entryType]) ? [...row[entryType]] : [];

        switch (action) {
          case "add":
            const newEntry = args[0] || { type: "", value: 0 };
            currentEntries.push(newEntry);
            break;

          case "remove":
            const indexToRemove = args[0];
            if (indexToRemove >= 0 && indexToRemove < currentEntries.length) {
              currentEntries.splice(indexToRemove, 1);
            }
            break;

          case "update":
            const [index, field, value] = args;
            if (index >= 0 && index < currentEntries.length) {
              currentEntries[index] = {
                ...currentEntries[index],
                [field]: field === "value" ? parseFloat(value) || 0 : value,
              };
            }
            break;

          default:
            break;
        }

        // Recalculate netPay after modifying custom entries
        const totalAllowances = (entryType === "customAllowances" ? currentEntries : row.customAllowances || []).reduce(
          (sum, allowance) => sum + (parseFloat(allowance.value) || 0),
          0
        );
        const totalDeductions = (entryType === "customDeductions" ? currentEntries : row.customDeductions || []).reduce(
          (sum, deduction) => sum + (parseFloat(deduction.value) || 0),
          0
        );

        return {
          ...row,
          [entryType]: currentEntries,
          netPay:
            (row.basePay || 0) +
            (row.bonus || 0) +
            (row.allowance || 0) +
            totalAllowances -
            (row.deductions || 0) -
            (row.tax || 0) -
            totalDeductions,
        };
      });
      return newRows;
    });
  };

  const applyColumnFormula = (field, formula) => {
    const excelColumnMap = {
      A: "employeeName",
      B:"ctc",
      C: "basePay",
      D: "bonus",
      E: "deductions",
      F: "tax",
      G: "allowance",
      H: "absentDays",
      I: "extraHours",
      J: "extraHoursPayRate",
    };

    const updatedRows = rows.map((row) => {
      try {
        const processedFormula = formula.replace(/\$?([A-I])(\d+)/g, (match, col) => {
  
          const fieldName = excelColumnMap[col];
          return row[fieldName] || 0;
        });
    
        const result = evaluate(processedFormula.replace("=", ""));
        row = { ...row, [field]: result };
      } catch (error) {
        console.error("Formula evaluation error:", error);
        row = { ...row, [field]: 0 };
      }

      const totalAllowances = (row.customAllowances || []).reduce(
        (sum, allowance) => sum + (parseFloat(allowance.value) || 0),
        0
      );
      const totalDeductions = (row.customDeductions || []).reduce(
        (sum, deduction) => sum + (parseFloat(deduction.value) || 0),
        0
      );

      row.netPay =
        (row.basePay || 0) +
        (row.bonus || 0) +
        (row.allowance || 0) +
        totalAllowances -
        (row.deductions || 0) -
        (row.tax || 0) -
        totalDeductions;

      return row;
    });

    setRows(updatedRows);
    setColumnFormulas((prev) => ({ ...prev, [field]: formula }));
    setFormulaDialog(null);
  };

  const handleSave = async () => {
    try {
      for (const row of rows) {
        const saleryData = {
          employeeId: row.id,
          employeeName: row.employeeName,
          ctc: row.ctc,
          basePay: row.basePay,
          bonus: row.bonus,
          deductions: row.deductions,
          tax: row.tax,
          allowance: row.allowance,
          netPay: row.netPay,
          absentDays: row.absentDays,
          extraHours: row.extraHours,
          extraHoursPayRate: row.extraHoursPayRate,
          customAllowances: row.customAllowances || [],
          customDeductions: row.customDeductions || [],
          month,
          year,
        };
        await handleSaleryUpdate.mutateAsync({ saleryData });
      }
      alert("Salary slips saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save salary slips.");
    }
  };

  const CustomEntriesManager = ({ entries, onAddEntry, onRemoveEntry, onUpdateEntry }) => (
    <Grid container display={'flex'} width={'100%'} height={'100%'} overflow={'scroll'} >
      
      {entries.map((entry, index) => (
        <Grid container item key={index} spacing={1} alignItems="center">
          <Grid item xs={5}>
            <input
              value={entry.type}
              onChange={(e) => onUpdateEntry(index, "type", e.target.value)}
              placeholder="Type (e.g., Travel)"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                background: "#fff",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
              }}
            />
          </Grid>
          <Grid item xs={5}>
            <input
              type="number"
              value={entry.value}
              onChange={(e) => onUpdateEntry(index, "value", e.target.value)}
              placeholder="0"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                background: "#fff",
                textAlign: "right",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton
              onClick={() => onRemoveEntry(index)}
              sx={{
                color: "#ff1744",
                "&:hover": { transform: "scale(1.2)", color: "#d50000" },
              }}
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Grid item>
        <ModernButton
          onClick={() => onAddEntry({ type: "", value: 0 })}
          startIcon={<AddCircleOutlineIcon />}
          size="small"
        >
        </ModernButton>
      </Grid>
    </Grid>
  );

  if (isLoading) {
    return (
      <Typography variant="h6" sx={{ color: "#fff", textAlign: "center" }}>
        Loading...
      </Typography>
    );
  }

  return (
    <Box sx={{ height: 700, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        processRowUpdate={handleRowEdit}
        slots={{ toolbar: GridToolbar }}
        sx={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          "& .MuiDataGrid-cell": {
            border: "1px solid #e0e0e0",
            transition: "background 0.2s ease",
            "&:hover": { backgroundColor: "#f5f7fa" },
          },
          "& .MuiDataGrid-columnHeader": {
            background: "linear-gradient(90deg, #0288d1 0%, #0277bd 100%)",
            color: "#fff",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-toolbarContainer": {
            background: "#fafafa",
            borderRadius: "12px 12px 0 0",
          },
        }}
      />
      <Box sx={{ mt: 3, textAlign: "right" }}>
        <ModernButton variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          Save Salary Data
        </ModernButton>
      </Box>
      <ModernDialog
        open={!!formulaDialog}
        onClose={() => setFormulaDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#0288d1" }}>
          Set Column Formula
        </DialogTitle>
        <DialogContent>
          <input
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #0288d1",
              background: "#fff",
              boxShadow: "0 2px 10px rgba(2, 136, 209, 0.1)",
              marginTop: "16px",
              fontSize: "16px",
            }}
            value={formulaDialog?.formula || "="}
            onChange={(e) =>
              setFormulaDialog((prev) => ({ ...prev, formula: e.target.value }))
            }
            placeholder="Enter formula (e.g., =B2*1.1)"
          />
          <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
            Use cell references like B2, C3. Example: =B2*1.1
          </Typography>
        </DialogContent>
        <DialogActions>
          <ModernButton onClick={() => setFormulaDialog(null)}>Cancel</ModernButton>
          <ModernButton
            onClick={() => applyColumnFormula(formulaDialog.field, formulaDialog.formula)}
          >
            Apply Formula
          </ModernButton>
        </DialogActions>
      </ModernDialog>
    </Box>
  );
};

export default SalaryManagementSheet;