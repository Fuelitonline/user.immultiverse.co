import React, { useState, useEffect } from 'react';
import { Button, Box } from '@mui/material';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

// Function to calculate total sales
const calculateTotalSales = (salesArray) => {
  return salesArray?.reduce((total, sale) => total + (sale?.sales || 0), 0) || 0;
};

// Incentive calculation function
const calculateTotalIncentives = (totalData, payrollData) => {
  const Sale = calculateTotalSales(totalData);
  if (payrollData?.gstRate === 0) return 0;

  const totalSale = Sale / (1 + (payrollData?.gstRate / 100));
  const incentives = payrollData?.incentive;

  if (!incentives || incentives.length === 0) return 0;

  let totalIncentive = 0;
  let remainingSale = totalSale;

  incentives.forEach((incentive, index) => {
    const { minSalesAmount, maxSalesAmount, percentage } = incentive;
    if (remainingSale > minSalesAmount) {
      if (index === 0) {
        const salesInThisSlab = Math.min(remainingSale, maxSalesAmount);
        const incentiveAmount = (salesInThisSlab * percentage) / 100;
        totalIncentive += incentiveAmount;
        remainingSale -= salesInThisSlab;
      } else {
        const salesInThisSlab = Math.min(remainingSale, maxSalesAmount) - minSalesAmount;
        if (salesInThisSlab > 0) {
          const incentiveAmount = (salesInThisSlab * percentage) / 100;
          totalIncentive += incentiveAmount;
        }
        remainingSale -= salesInThisSlab;
      }
    }
    if (remainingSale <= 0) return;
  });

  return Math.round(totalIncentive);
};

// Generate PDF function
export const generatePDF = async ({
  month,
  year,
  saleryMonth,
  employeeId,
  setIsLoading,
  payrollData = {
    basePay: 50000,
    gstRate: 18,
    incentive: [
      { minSalesAmount: 0, maxSalesAmount: 100000, percentage: 5 },
      { minSalesAmount: 100000, maxSalesAmount: 200000, percentage: 7 },
    ],
    bonus: 5000,
  },
  insativeData = {
    salesForEmployee: [{ sales: 150000 }],
    salesForJuniors: [{ sales: 50000 }],
  },
  companyData = {
    companyName: 'Think & Learn Private Limited',
    CIN: 'U80903KA2011PTC061427',
    address: 'IBC Knowledge Park, 4/1, 2nd Floor, Tower D, Bannerghatta Main Road, Bengaluru, Karnataka -560029',
    email: 'info@byjus.com',
    phone: '+91 80668 36800',
    website: 'www.byjus.com',
  },
  employeeData = {
    code: 'TNL21833191',
    name: 'Dushyant Singh Rathore',
    department: 'Business Dev.',
    joiningDate: '08.11.2019',
    bankName: 'ICICI BANK',
    accountNumber: '100701532596',
    panNumber: 'BCAPR0459K',
    pfNumber: 'PY/BOM/60674/33868',
    uan: '101249578516',
  },
  paymentData = {
    month: 'April 2021',
    workingDays: '30.00',
    payableDays: '29.00',
    lopDays: '1.00',
    esiNumber: '',
    paymentMode: 'Bank Transfer',
  },
  earnings = {
    standard: {
      basic: 29167.0,
      hra: 14583.0,
      medicalAllowance: 3000.0,
      conveyanceAllowance: 4000.0,
      specialAllowance: 5783.0,
      total: 56533.0,
    },
    actual: {
      basic: 28194.77,
      hra: 14096.9,
      medicalAllowance: 2900.0,
      conveyanceAllowance: 3866.67,
      specialAllowance: 5590.23,
      salesIncentive: 51836.0,
      total: 106485.0,
    },
  },
  deductions = {
    pfContribution: 1800.0,
    incomeTax: 13324.0,
    incentiveAdjDeduction: 41054.0,
    salesCBRecovery: 7730.0,
    total: 63908.0,
  },
  netPayDetails = {
    currency: 'INR',
    amount: 42577.0,
    amountInWords: 'FORTY TWO THOUSAND FIVE HUNDRED SEVENTY SEVEN RUPEES',
  },
  salaryDetails = {
    fixedAnnual: 'Rs 700000.00',
    variableAnnual: 'Rs 300000.00',
    ctcEffectiveDate: '08.11.2019',
  },
}) => {
  setIsLoading(true);
  try {
    console.log('generatePDF called with:', { month, year, saleryMonth, employeeId });

    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Define page dimensions and margins
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    // Font setup
    pdf.setFont('helvetica', 'normal');

    // Add company header (logo commented out to avoid delays)
    /*
    const addLogoToDocument = async () => {
      const imagePath = '/logoCompany.jpeg'; // Ensure in public/
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imagePath;
        const base64Image = await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
          };
          img.onerror = () => reject(new Error('Image load failed'));
        });
        pdf.addImage(base64Image, 'JPEG', margin, margin, 30, 30);
      } catch (error) {
        console.warn('Failed to load logo:', error.message);
        pdf.setDrawColor(255, 255, 255);
        pdf.rect(margin, margin, 30, 30, 'F');
      }
    };
    await addLogoToDocument();
    */

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(companyData.companyName, pageWidth - margin, margin + 5, { align: 'right' });

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');

    let yPos = margin + 10;
    const fullAddress = companyData.address;
    pdf.text(fullAddress, pageWidth - margin, yPos, { align: 'right' });

    yPos += 10;
    pdf.text(`E-mail: ${companyData.email} | Tel. No: ${companyData.phone}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 3;
    pdf.text(`CIN: ${companyData.CIN}`, pageWidth - margin, yPos, { align: 'right' });

    // Add payslip title
    yPos = margin + 33;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(`Payslip for the month of ${paymentData.month}`, pageWidth / 2, yPos, { align: 'center' });

    // Draw main border around employee details
    yPos = margin + 35;
    const employeeTableHeight = 32;
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPos, contentWidth, employeeTableHeight);

    // Add employee details
    pdf.setFontSize(8);
    const detailsStartY = yPos + 5;
    const columnWidth = contentWidth / 6;

    const addTableRow = (pdf, items, startX, startY, colWidth) => {
      let xPos = startX;
      items.forEach((item) => {
        const labelWidth = pdf.getStringUnitWidth(item.label) * 8 * 0.352778;
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.label, xPos + 5, startY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`: ${item.value || ''}`, xPos + 5 + labelWidth + 2, startY);
        xPos += colWidth * 2;
      });
    };

    let currentY = detailsStartY;
    addTableRow(
      pdf,
      [
        { label: 'Employee Code', value: employeeData.empId || employeeData.code },
        { label: 'Payment Mode', value: paymentData.paymentMode },
        { label: 'Working Days', value: paymentData.workingDays },
      ],
      margin,
      currentY,
      columnWidth
    );

    currentY += 6;
    addTableRow(
      pdf,
      [
        { label: 'Employee Name', value: employeeData.name },
        { label: 'Bank Name', value: employeeData.bankName },
        { label: 'Payable Days', value: paymentData.payableDays },
      ],
      margin,
      currentY,
      columnWidth
    );

    currentY += 6;
    addTableRow(
      pdf,
      [
        { label: 'Department', value: employeeData.department },
        { label: 'Bank Account', value: employeeData.accountNumber },
        { label: 'LOP Days', value: paymentData.lopDays },
      ],
      margin,
      currentY,
      columnWidth
    );

    currentY += 6;
    addTableRow(
      pdf,
      [
        { label: 'Date of Joining', value: employeeData.joiningDate },
        { label: 'PAN Number', value: employeeData.panNumber },
        { label: 'ESI Number', value: paymentData.esiNumber || '' },
      ],
      margin,
      currentY,
      columnWidth
    );

    currentY += 6;
    addTableRow(
      pdf,
      [
        { label: '', value: '' },
        { label: 'PF Number', value: employeeData.pfNumber },
        { label: 'UAN', value: employeeData.uan },
      ],
      margin,
      currentY,
      columnWidth
    );

    // Earnings and Deductions Table
    yPos = margin + 35 + employeeTableHeight;
    const earningsTableHeight = 45;
    pdf.rect(margin, yPos, contentWidth, earningsTableHeight);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);

    const colWidths = [contentWidth * 0.25, contentWidth * 0.15, contentWidth * 0.15, contentWidth * 0.3, contentWidth * 0.15];
    const headerRow = ['EARNINGS', 'STANDARD', 'ACTUAL AMOUNT', 'DEDUCTIONS', 'ACTUAL AMOUNT'];
    let xPos = margin;

    headerRow.forEach((header, index) => {
      const cellWidth = colWidths[index];
      if (index < headerRow.length - 1) {
        pdf.line(xPos + cellWidth, yPos, xPos + cellWidth, yPos + earningsTableHeight);
      }
      let textX = [1, 2, 4].includes(index) ? xPos + cellWidth - 2 : xPos + 2;
      let align = [1, 2, 4].includes(index) ? 'right' : 'left';
      pdf.text(header, textX, yPos + 5, { align });
      xPos += cellWidth;
    });

    pdf.line(margin, yPos + 7, margin + contentWidth, yPos + 7);

    pdf.setFont('helvetica', 'normal');
    const earningLabels = ['Basic', 'HRA', 'Medical Allowance', 'Conveyance Allowance', 'Special Allowance', 'Sales Incentive'];
    const deductionLabels = ['PF Contribution', 'Income Tax', 'Incentive Adj Deduction', 'Sales CB Recovery', '', ''];
    const earningKeys = ['basic', 'hra', 'medicalAllowance', 'conveyanceAllowance', 'specialAllowance', 'salesIncentive'];
    const deductionKeys = ['pfContribution', 'incomeTax', 'incentiveAdjDeduction', 'salesCBRecovery', null, null];

    let rowY = yPos + 12;
    for (let i = 0; i < 6; i++) {
      xPos = margin;
      pdf.text(earningLabels[i], xPos + 5, rowY);
      xPos += colWidths[0];
      if (i < 5 && earningKeys[i] && earnings.standard[earningKeys[i]]) {
        pdf.text(earnings.standard[earningKeys[i]]?.toFixed(2), xPos + colWidths[1] - 5, rowY, { align: 'right' });
      }
      xPos += colWidths[1];
      if (earningKeys[i] && earnings.actual[earningKeys[i]]) {
        pdf.text(earnings.actual[earningKeys[i]]?.toFixed(2), xPos + colWidths[2] - 5, rowY, { align: 'right' });
      }
      xPos += colWidths[2];
      if (deductionLabels[i]) {
        pdf.text(deductionLabels[i], xPos + 5, rowY);
      }
      xPos += colWidths[3];
      if (deductionKeys[i] && deductions[deductionKeys[i]]) {
        pdf.text(deductions[deductionKeys[i]]?.toFixed(2), xPos + colWidths[4] - 5, rowY, { align: 'right' });
      }
      rowY += 5;
    }

    pdf.line(margin, yPos + earningsTableHeight - 7, margin + contentWidth, yPos + earningsTableHeight - 7);
    rowY = yPos + earningsTableHeight - 3;

    xPos = margin;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total :', xPos + 5, rowY);
    xPos += colWidths[0];
    pdf.text(earnings.standard.total?.toFixed(2), xPos + colWidths[1] - 5, rowY, { align: 'right' });
    xPos += colWidths[1];
    pdf.text(earnings.actual.total?.toFixed(2), xPos + colWidths[2] - 5, rowY, { align: 'right' });
    xPos += colWidths[2] + colWidths[3];
    pdf.text(deductions?.total?.toFixed(2) || '0.00', xPos + colWidths[4] - 5, rowY, { align: 'right' });

    yPos = margin + 35 + employeeTableHeight + earningsTableHeight;
    const netPayHeight = 20;
    pdf.rect(margin, yPos, contentWidth, netPayHeight);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    let netPayY = yPos + 5;
    pdf.text('CURRENCY', margin + 5, netPayY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`: ${netPayDetails.currency}`, margin + 45, netPayY);

    netPayY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('NET PAY', margin + 5, netPayY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`: ${netPayDetails.amount?.toFixed(2)}`, margin + 45, netPayY);

    netPayY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('AMOUNT IN WORDS', margin + 5, netPayY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`: ${netPayDetails.amountInWords}`, margin + 45, netPayY);

    yPos = margin + 35 + employeeTableHeight + earningsTableHeight + netPayHeight;
    const salaryDetailsHeight = 15;
    pdf.rect(margin, yPos, contentWidth, salaryDetailsHeight);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Salary details :', margin + 5, yPos + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Fixed Annual Salary : ${salaryDetails.fixedAnnual}`, margin + 5, yPos + 10);
    pdf.text(`Variable Annual Salary : ${salaryDetails.variableAnnual}`, margin + contentWidth / 3 + 5, yPos + 10);
    pdf.text(`CTC Effective date : ${salaryDetails.ctcEffectiveDate}`, margin + (2 * contentWidth) / 3 + 5, yPos + 10);

    yPos = margin + 35 + employeeTableHeight + earningsTableHeight + netPayHeight + salaryDetailsHeight;
    const footerHeight = 10;
    pdf.rect(margin, yPos, contentWidth, footerHeight);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('This is a system generated payslip and doesn’t need a signature', margin + 5, yPos + 5);

    const pdfBlob = pdf.output('blob');
    console.log('PDF blob generated:', pdfBlob);
    saveAs(pdfBlob, `salary-slip-${employeeData.name}-${paymentData.month}.pdf`);

    setIsLoading(false);
    return { success: true };
  } catch (error) {
    console.error('Error in generatePDF:', error.message, error.stack);
    alert(`Failed to generate salary slip: ${error.message}. Please try again.`);
    setIsLoading(false);
    throw error;
  }
};

const SalarySlip = ({
  payrollData = {
    basePay: 50000,
    gstRate: 18,
    incentive: [
      { minSalesAmount: 0, maxSalesAmount: 100000, percentage: 5 },
      { minSalesAmount: 100000, maxSalesAmount: 200000, percentage: 7 },
    ],
    bonus: 5000,
  },
  insativeData = {
    salesForEmployee: [{ sales: 150000 }],
    salesForJuniors: [{ sales: 50000 }],
  },
  month = 'April',
  year = 2021,
  saleryMonth = 3,
  companyData = {
    companyName: 'Think & Learn Private Limited',
    CIN: 'U80903KA2011PTC061427',
    address: 'IBC Knowledge Park, 4/1, 2nd Floor, Tower D, Bannerghatta Main Road, Bengaluru, Karnataka -560029',
    email: 'info@byjus.com',
    phone: '+91 80668 36800',
    website: 'www.byjus.com',
  },
  employeeData = {
    code: 'TNL21833191',
    name: 'Dushyant Singh Rathore',
    department: 'Business Dev.',
    joiningDate: '08.11.2019',
    bankName: 'ICICI BANK',
    accountNumber: '100701532596',
    panNumber: 'BCAPR0459K',
    pfNumber: 'PY/BOM/60674/33868',
    uan: '101249578516',
  },
  paymentData = {
    month: 'April 2021',
    workingDays: '30.00',
    payableDays: '29.00',
    lopDays: '1.00',
    esiNumber: '',
    paymentMode: 'Bank Transfer',
  },
  earnings = {
    standard: {
      basic: 29167.0,
      hra: 14583.0,
      medicalAllowance: 3000.0,
      conveyanceAllowance: 4000.0,
      specialAllowance: 5783.0,
      total: 56533.0,
    },
    actual: {
      basic: 28194.77,
      hra: 14096.9,
      medicalAllowance: 2900.0,
      conveyanceAllowance: 3866.67,
      specialAllowance: 5590.23,
      salesIncentive: 51836.0,
      total: 106485.0,
    },
  },
  deductions = {
    pfContribution: 1800.0,
    incomeTax: 13324.0,
    incentiveAdjDeduction: 41054.0,
    salesCBRecovery: 7730.0,
    total: 63908.0,
  },
  netPayDetails = {
    currency: 'INR',
    amount: 42577.0,
    amountInWords: 'FORTY TWO THOUSAND FIVE HUNDRED SEVENTY SEVEN RUPEES',
  },
  salaryDetails = {
    fixedAnnual: 'Rs 700000.00',
    variableAnnual: 'Rs 300000.00',
    ctcEffectiveDate: '08.11.2019',
  },
}) => {
  const [saleryData, setSaleryData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock useGet (replace with actual API hook)
  const saleries = { data: { data: [{}] } }; // Mocked data
  useEffect(() => {
    if (saleries?.data?.data[0]) {
      setSaleryData(saleries?.data?.data[0]);
    } else {
      setSaleryData({});
    }
  }, [saleries, month, year]);

  // Calculate previous month day count
  const getPreviousMonthDayCount = (base, month, year, deductions) => {
    const monthNameToNumber = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const monthIndex = monthNameToNumber[month];
    if (monthIndex === undefined) return 0;

    const currentDate = new Date(year, monthIndex, 1);
    const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const previousMonthDayCount = lastDayOfPreviousMonth.getDate();
    const parDay = base / previousMonthDayCount;
    const remainingDay = previousMonthDayCount - deductions;

    return parDay * remainingDay;
  };

  // Self and team incentives calculation
  const selfSales = insativeData?.salesForEmployee || [];
  const teamSales = insativeData?.salesForJuniors || [];
  const selfIncentive = calculateTotalIncentives(selfSales, payrollData);
  const teamIncentive = calculateTotalIncentives(teamSales, payrollData);

  // Calculate net pay
  const netPay = earnings.actual.total - deductions.total;

  return (
    <Box sx={{ maxWidth: '900px', margin: '0 auto', p: 2 }}>
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: 1,
          p: 2,
          mb: 2,
          textAlign: 'center',
          fontSize: '0.9rem',
        }}
      >
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{companyData.companyName}</p>
        <p>Payslip for the month of {paymentData.month}</p>
        <p>Employee: {employeeData.name}</p>
        <p>Total Earnings: {earnings.actual.total?.toFixed(2)}</p>
        <p>Total Deductions: {deductions.total?.toFixed(2)}</p>
        <p>Net Pay: {netPay.toFixed(2)}</p>
        <p style={{ fontStyle: 'italic', fontSize: '0.8rem', marginTop: '20px' }}>
          Click "Download Salary Slip" to generate a detailed PDF
        </p>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => generatePDF({ month, year, saleryMonth, employeeId: employeeData.code, setIsLoading })}
        disabled={isLoading}
        sx={{
          width: '100%',
          py: 1.5,
          fontSize: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          '&:hover': {
            backgroundColor: '#003366',
            boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
          },
        }}
      >
        {isLoading ? 'Generating PDF...' : 'Download Salary Slip'}
      </Button>
    </Box>
  );
};

export default SalarySlip;