import React from "react";
import { Box, Typography, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { getMonthName } from "../../../utils/payroll";

const getDaysInMonth = (month, year) => {
  // month = 1-12
  return new Date(year, month, 0).getDate();
};


const PayslipTemplate = ({ slip, user }) => {
  if (!slip || !user) return null;

  const totalDaysInMonth = getDaysInMonth(slip.month, slip.year);
  const payableDays = totalDaysInMonth - (slip.absentDays || 0) - (slip.halfDays || 0) * 0.5;
  const lopDays = (slip.absentDays || 0) + (slip.halfDays || 0) * 0.5;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Calculate EARNINGS total (not Gross Salary)
  const calculateEarningsTotal = () => {
    const earnings = [
      slip.basePay || 0,
      slip.hra || 0,
      slip.bonus || 0,
      slip.totalIncentive || 0,
      slip.medicalAllowance || 0,
      slip.conveyanceAllowance || 0,
      slip.specialAllowance || 0,
    ];

    // Add custom allowances
    if (slip.customAllowances && Array.isArray(slip.customAllowances)) {
      slip.customAllowances.forEach(allowance => {
        earnings.push(allowance.value || 0);
      });
    }

    return earnings.reduce((sum, amount) => sum + amount, 0);
  };

  // Calculate DEDUCTIONS total
  const calculateDeductionsTotal = () => {
    const deductions = [
      slip.pfEmployee || 0,
      slip.esiEmployee || 0,
      slip.incomeTax || 0,
      slip.professionalTax || 0,
      slip.lopAmount || 0,
    ];

    // Add custom deductions
    if (slip.customDeductions && Array.isArray(slip.customDeductions)) {
      slip.customDeductions.forEach(deduction => {
        deductions.push(deduction.value || 0);
      });
    }

    return deductions.reduce((sum, amount) => sum + amount, 0);
  };

  const earningsTotal = calculateEarningsTotal();
  const deductionsTotal = calculateDeductionsTotal();

  // Convert number to words (Indian numbering system)
  const numberToWords = (num) => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convert = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
      return "";
    };

    let n = Math.floor(num);
    if (n === 0) return "Zero";

    let result = "";

    // Crores
    if (n >= 10000000) {
      result += convert(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }

    // Lakhs
    if (n >= 100000) {
      result += convert(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }

    // Thousands
    if (n >= 1000) {
      result += convert(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }

    // Remaining
    if (n > 0) {
      result += convert(n);
    }

    return result.trim();
  };

  { console.log("LOGO URL:", user.companyLogoBase64) }


  const amountInWords = numberToWords(slip.netPay);

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        fontFamily: "'Arial', sans-serif",
        fontSize: "12px",
        color: "#000",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Company Logo */}
        <Box sx={{ textAlign: "left", mb: 2 }}>
          {user.companyLogoBase64 ? (
            <img
              src={user?.companyLogoBase64?.startsWith("data:image") 
       ? user.companyLogoBase64 
       : user?.companyLogoBase64 
         ? `data:image/jpeg;base64,${user.companyLogoBase64}` 
         : ''}
              alt="Company Logo"
              style={{ maxHeight: "80px", maxWidth: "200px" }}
            />

          ) : (
            <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: "bold", color: "#1a237e" }}>
              {user.companyName || "N/A"}
            </Typography>
          )}
        </Box>

        {/* Company Header with CIN */}
        <Box sx={{ textAlign: "end", mb: 2 }}>
          <Typography
            variant="caption"
            sx={{ fontSize: "10px", color: "black", display: "block", mb: 0.5, fontWeight: "500" }}
          >
            CIN: {user.companyCIN || "N/A"}
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ fontSize: "16px", color: "#1a237e", mb: 0.5 }}
          >
            {user.companyName || "N/A"}
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "black", lineHeight: 1.4, fontWeight: "700" }}>
            {user.companyAddress?.street || "N/A"}
            <br />
            {user.companyAddress?.city || "N/A"}, {user.companyAddress?.state || "N/A"}, {user.companyAddress?.postalCode || "N/A"}
            <br />
            {user.companyAddress?.country || "N/A"}
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "black", mt: 0.5, fontWeight: "700" }}>
            E-mail: {user.companyEmail || "N/A"} | Tel. No: {user.companyPhone || "N/A"}
          </Typography>
        </Box>
      </Box>



      {/* Payslip Title */}
      <Typography
        align="center"
        fontWeight="bold"
        sx={{ fontSize: "14px" }}
      >
        Payslip for the month of {getMonthName(slip.month)} {slip.year}
      </Typography>

      {/* Employee and Payment Details Grid */}
      <Grid container spacing={2} sx={{ mb: 2, px: 1, borderLeft: "2px solid black" }}>
        {/* Left Column */}
        <Grid item xs={4}>
          <DetailRow
            label="Employee Code"
            value={slip.employeeId?.empId || user.loginId}
          />
          <DetailRow
            label="Employee Name"
            value={slip.employeeId?.name || user.name}
          />
          <DetailRow
            label="Department"
            value={slip.employeeId?.position || user.position}
          />
          <DetailRow
            label="Date of Joining"
            value={
              slip.employeeId?.joiningDate
                ? new Date(slip.employeeId.joiningDate).toLocaleDateString("en-GB")
                : "N/A"
            }
          />
          <DetailRow label="PF Number" value="N/A" />
        </Grid>

        {/* Right Column */}
        <Grid item xs={4}>
          <DetailRow label="Payment Mode" value="Bank Transfer" />
          <DetailRow
            label="Bank Name"
            value={slip.employeeId?.bankDetails?.bankName || "N/A"}
          />
          <DetailRow
            label="Bank Account"
            value={slip.employeeId?.bankDetails?.accountNumber || "N/A"}
          />
          <DetailRow
            label="PAN Number"
            value={slip.employeeId?.panCard || "N/A"}
          />
          <DetailRow label="UAN" value="N/A" />
        </Grid>

        {/* Working Days Info */}

        <Grid item xs={4}>
          <DetailRow label="Working Days" value={totalDaysInMonth.toFixed(2)} />
          <DetailRow label="Payable Days" value={payableDays.toFixed(2)} />
          <DetailRow label="LOP Days" value={lopDays.toFixed(2)} />
          <DetailRow label="ESI Number" value="N/A" />
        </Grid>
      </Grid>




      {/* Earnings and Deductions Table */}
      <TableContainer>
        <Table size="small" sx={{ " & th": { border: "2px solid black", px: 1, py: 0.5 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: "11px" }}>
                EARNINGS
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "11px", width: "150px" }}>
                ACTUAL AMOUNT
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "11px" }}>
                DEDUCTIONS
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", fontSize: "11px", width: "150px" }}>
                ACTUAL AMOUNT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ borderLeft: "2px solid black", borderBottom: "2px solid black", borderRight: "2px solid black", px: 1, py: 0.5 }}>
            {/* Earnings List */}
            {(() => {
              const earnings = [
                { name: "Basic", actual: slip.basePay || 0 },
                { name: "HRA", actual: slip.hra || 0 },
                { name: "Bouns", actual: slip.bonus || 0 },
                { name: "Incentive", actual: slip.totalIncentive || 0 },
                { name: "Medical Allowance", actual: slip.medicalAllowance || 0 },+
                { name: "Conveyance Allowance", actual: slip.conveyanceAllowance || 0 },
                { name: "Special Allowance", actual: slip.specialAllowance || 0 },
              ];

              // Add custom allowances
              if (slip.customAllowances && Array.isArray(slip.customAllowances)) {
                slip.customAllowances.forEach((allowance, index) => {
                  earnings.push({
                    name: allowance.type || `Allowance ${index + 1}`,
                    actual: allowance.value || 0
                  });
                });
              }

              const deductions = [
                { name: "PF Contribution", value: slip.pfEmployee || 0 },
                { name: "ESI Contribution", value: slip.esiEmployee || 0 },
                { name: "Income Tax", value: slip.incomeTax || 0 },
                { name: "Professional Tax", value: slip.professionalTax || 0 },
                { name: "LOP Days", value: slip.lopAmount || 0 },
              ];

              // Add custom deductions
              if (slip.customDeductions && Array.isArray(slip.customDeductions)) {
                slip.customDeductions.forEach((deduction, index) => {
                  deductions.push({
                    name: deduction.type || `Deduction ${index + 1}`,
                    value: deduction.value || 0
                  });
                });
              }

              const maxRows = Math.max(earnings.length, deductions.length);
              const rows = [];

              for (let i = 0; i < maxRows; i++) {
                const earning = earnings[i];
                const deduction = deductions[i];

                rows.push(
                  <TableRow key={i}>
                    <TableCell sx={{ fontSize: "10px" }}>
                      {earning?.name || ""}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "10px", fontWeight: 600 }}>
                      {earning ? formatCurrency(earning.actual) : ""}
                    </TableCell>
                    <TableCell sx={{ fontSize: "10px" }}>
                      {deduction?.name || ""}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "10px", fontWeight: 600 }}>
                      {deduction ? formatCurrency(deduction.value) : ""}
                    </TableCell>
                  </TableRow>
                );
              }

              return rows;
            })()}

            {/* Totals Row - EARNINGS ka total aur DEDUCTIONS ka total */}
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: "11px" }}>Total Earnings :</TableCell>
              <TableCell align="right" sx={{ fontSize: "10px", fontWeight: "bold" }}>
                {formatCurrency(earningsTotal).replace("₹", "")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "11px" }}>Total Deductions :</TableCell>
              <TableCell align="right" sx={{ fontSize: "10px", fontWeight: "bold" }}>
                {formatCurrency(deductionsTotal).replace("₹", "")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Gross Salary and Net Pay Calculation */}
      <Box sx={{ mt: 2, mb: 2 }}>
        {/* Gross Salary Calculation */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <Typography sx={{ fontSize: "11px", fontWeight: "bold" }}>
              Gross Salary (Earnings Total):
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right" sx={{ fontSize: "11px", fontWeight: "bold" }}>
              {formatCurrency(earningsTotal)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography sx={{ fontSize: "11px", fontWeight: "bold" }}>
              Less: Total Deductions:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right" sx={{ fontSize: "11px", fontWeight: "bold" }}>
              - {formatCurrency(deductionsTotal)}
            </Typography>
          </Grid>
        </Grid>

        {/* Net Pay */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            borderRadius: 1,
            border: "2px solid black",
          }}
        >
          <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
            NET PAY (Earnings - Deductions) :
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
            {formatCurrency(slip.netPay)}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: "11px", mt: 1, fontStyle: "italic" }}>
          AMOUNT IN WORDS : {amountInWords}
        </Typography>
      </Box>

      {/* Salary Details */}
      <Box sx={{ mb: 2, p: 1.5, borderRadius: 1 }}>
        <Typography sx={{ fontSize: "11px", fontWeight: "bold", mb: 0.5 }}>
          Salary details :
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography sx={{ fontSize: "10px" }}>
              Fixed Annual Salary : Rs {(slip.ctc || 0).toLocaleString("en-IN")}.00
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography sx={{ fontSize: "10px" }}>
              Variable Annual Salary : Rs 0.00
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography sx={{ fontSize: "10px" }}>
              CTC Effective date :{" "}
              {slip.employeeId?.joiningDate
                ? new Date(slip.employeeId.joiningDate).toLocaleDateString("en-GB")
                : "N/A"}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Divider sx={{ my: 1 }} />
      <Typography
        align="center"
        sx={{ fontSize: "10px", color: "#666", fontStyle: "italic" }}
      >
        This is a system generated payslip and doesn't need a signature
      </Typography>
    </Box>
  );
};

// Helper component for detail rows
const DetailRow = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.3 }}>
    <Typography sx={{ fontSize: "11px" }}>{label} :</Typography>
    <Typography sx={{ fontSize: "11px", fontWeight: 500 }}>{value || "N/A"}</Typography>
  </Box>
);

export default PayslipTemplate;