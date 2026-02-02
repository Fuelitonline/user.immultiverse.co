import React, { useRef } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { Download } from "@mui/icons-material";
import PayslipTemplate from "./payslipTemplate";
import { getMonthName } from "../../../utils/payroll";
import { useDownloadSalaryPDF } from "../../../hooks/useDownloadSalaryPDF";



const SalarySlipPreview = ({ slip, user }) => {
  const payslipRef = useRef(null);

  const { mutateAsync, isPending } = useDownloadSalaryPDF();

  const downloadPDF = async () => {
    try {
      const pdfBuffer = await mutateAsync(slip._id);

      console.log("PDF BUFFER LENGTH:", pdfBuffer.byteLength);

      const blob = new Blob([pdfBuffer], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `salary-slip-${slip.month}-${slip.year}.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };




  return (
    <Box>
      {/* Download Button - Outside PDF */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "#f8f9fa",
          p: 2,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          startIcon={
            isPending  ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Download />
            )
          }
          disabled={isPending }
          onClick={downloadPDF}
            sx={{
            textTransform: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(102, 126, 234, 0.6)",
            },
          }}
        >
          {isPending  ? "Generating PDF..." : "Download PDF"}
        </Button>

      </Box>

      {/* PDF Content */}
      <Box
        ref={payslipRef}
        sx={{
          p: 3,
          bgcolor: "#fff",
          maxHeight: "calc(90vh - 100px)",
          overflow: "auto",
        }}
      >
        <PayslipTemplate slip={slip} user={user} />
      </Box>
    </Box>
  );
};

export default SalarySlipPreview;