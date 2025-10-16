import {
  Box,
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Paper,
  useTheme,
  Tooltip,
  Fade,
  Stack,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Card,
  CardContent,
  Grow,
  Divider,
  Avatar 
} from '@mui/material';
import React, { useState, useMemo, useCallback } from 'react';
import { Edit, Event, Work, Person, LocationOn, Badge, Close, AccountBalance, AccountBalanceWallet, MonetizationOn, TrendingUp, Numbers, VpnKey, LocationCity, AttachMoney, CardGiftcard, EmojiEvents, Wallet, AdminPanelSettings, Email, Phone, Business, X, LinkedIn } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePost } from '../../hooks/useApi';
import { useAuth } from '../../middlewares/auth';

function BasicDetail({ empDetails, activeSection, showDetails = true, showTitle = true }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [filter, setFilter] = useState('monthly');
  const [formData, setFormData] = useState({
    dob: empDetails?.dob ? new Date(empDetails.dob).toISOString().split('T')[0] : '',
    street: empDetails?.address?.street || '',
    city: empDetails?.address?.city || '',
    state: empDetails?.address?.state || '',
    country: empDetails?.address?.country || '',
    zip: empDetails?.address?.zip || '',
  });
  const [newFiles, setNewFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salaryInfoDialogOpen, setSalaryInfoDialogOpen] = useState(false);
  const [selectedSalaryCard, setSelectedSalaryCard] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const theme = useTheme();
  const { mutateAsync: updateEmployee } = usePost('employee/update');

  const staticSalaryData = useMemo(function() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.map(function(month, index) {
      return {
        month: month + ' 2025',
        basicSalary: 50000 + index * 100,
        hra: 10000,
        da: 5000,
        grossSalary: 50000 + index * 100 + 10000 + 5000 + 1000 + 500,
      };
    });
  }, []);

  // Static data for Salary Info cards
  const salaryInfoData = useMemo(function() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return {
      CTC: months.map(function(month, index) {
        return {
          period: month + ' 2025',
          amount: 800000 + index * 1000,
          quarter: Math.floor(index / 3) + 1
        };
      }),
      'In Hand Salary': months.map(function(month, index) {
        return {
          period: month + ' 2025',
          amount: 55000 + index * 200,
          quarter: Math.floor(index / 3) + 1
        };
      }),
      Bonus: months.map(function(month, index) {
        return {
          period: month + ' 2025',
          amount: index % 3 === 0 ? 15000 : 0,
          quarter: Math.floor(index / 3) + 1
        };
      }),
      Incentive: months.map(function(month, index) {
        return {
          period: month + ' 2025',
          amount: 5000 + index * 100,
          quarter: Math.floor(index / 3) + 1
        };
      }),
      Allowances: months.map(function(month, index) {
        return {
          period: month + ' 2025',
          amount: 8000 + index * 50,
          quarter: Math.floor(index / 3) + 1
        };
      })
    };
  }, []);


  const getMonthlyData = useCallback(function(component) { 
    return staticSalaryData.map(function(item) { 
      return { period: item.month, amount: item[component] }; 
    }); 
  }, [staticSalaryData]);

  const getQuarterlyData = useCallback(function(component) {
    const sums = [0, 0, 0, 0];
    staticSalaryData.forEach(function(item, i) {
      const qIndex = Math.floor(i / 3);
      sums[qIndex] += item[component];
    });
    return [
      { period: 'Q1 2025 (Jan-Mar)', amount: sums[0] },
      { period: 'Q2 2025 (Apr-Jun)', amount: sums[1] },
      { period: 'Q3 2025 (Jul-Sep)', amount: sums[2] },
      { period: 'Q4 2025 (Oct-Dec)', amount: sums[3] },
    ];
  }, [staticSalaryData]);

  const getYearlyData = useCallback(function(component) {
    const total = staticSalaryData.reduce(function(acc, item) { 
      return acc + item[component]; 
    }, 0);
    return [{ period: 'Yearly Total 2025', amount: total }];
  }, [staticSalaryData]);

  const filteredData = useMemo(function() {
    if (!selectedCard) return [];
    const component = fieldMap[selectedCard];
    if (filter === 'monthly') return getMonthlyData(component);
    if (filter === 'quarterly') return getQuarterlyData(component);
    return getYearlyData(component);
  }, [filter, selectedCard, getMonthlyData, getQuarterlyData, getYearlyData]);

  const getSummary = useCallback(function(label) {
    const component = fieldMap[label];
    if (filter === 'monthly') {
      return staticSalaryData[staticSalaryData.length - 1][component];
    } else if (filter === 'quarterly') {
      return staticSalaryData.slice(-3).reduce(function(acc, item) { 
        return acc + item[component]; 
      }, 0);
    } else {
      return staticSalaryData.reduce(function(acc, item) { 
        return acc + item[component]; 
      }, 0);
    }
  }, [filter, staticSalaryData]);

  // Helper functions for Salary Info section
  const getSalaryInfoCurrentValue = useCallback(function(cardType) {
    const data = salaryInfoData[cardType];
    if (!data || data.length === 0) return 0;
    const currentMonthIndex = 9; // October 2025
    return data[currentMonthIndex].amount;
  }, [salaryInfoData]);

  const getFilteredSalaryData = useCallback(function(cardType) {
    const data = salaryInfoData[cardType] || [];
    
    if (salaryFilter === 'monthly') {
      return data;
    } else if (salaryFilter === 'quarterly') {
      const quarterlyData = [];
      for (let q = 1; q <= 4; q++) {
        const quarterItems = data.filter(function(item) { return item.quarter === q; });
        const total = quarterItems.reduce(function(acc, item) { return acc + item.amount; }, 0);
        quarterlyData.push({
          period: `Q${q} 2025`,
          amount: total
        });
      }
      return quarterlyData;
    } else if (salaryFilter === 'yearly') {
      const total = data.reduce(function(acc, item) { return acc + item.amount; }, 0);
      return [{ period: '2025', amount: total }];
    } else if (salaryFilter === 'custom') {
      if (!customStartDate || !customEndDate) return data;
      return data;
    }
    return data;
  }, [salaryInfoData, salaryFilter, customStartDate, customEndDate]);

  const getPaginatedData = useCallback(function(data) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage]);

  const handleSalaryCardClick = function(cardType) {
    setSelectedSalaryCard(cardType);
    setSalaryInfoDialogOpen(true);
    setCurrentPage(1);
  };

  const handleSalaryDialogClose = function() {
    setSalaryInfoDialogOpen(false);
    setSelectedSalaryCard('');
    setSalaryFilter('monthly');
    setCustomStartDate('');
    setCustomEndDate('');
    setCurrentPage(1);
  };

  const handlePageChange = function(event, value) {
    setCurrentPage(value);
  };

  // Number to words function
  function convert_number(number) {
    if ((number < 0) || (number > 999999999)) { 
      return "NUMBER OUT OF RANGE!";
    }
    var Gn = Math.floor(number / 10000000);
    number -= Gn * 10000000; 
    var kn = Math.floor(number / 100000);
    number -= kn * 100000; 
    var Hn = Math.floor(number / 1000);
    number -= Hn * 1000; 
    var Dn = Math.floor(number / 100);
    number = number % 100;
    var tn= Math.floor(number / 10); 
    var one=Math.floor(number % 10); 
    var res = ""; 

    if (Gn>0) { 
      res += (convert_number(Gn) + " CRORE"); 
    } 
    if (kn>0) {
      res += (((res=="") ? "" : " ") + 
        convert_number(kn) + " LAKH"); 
    } 
    if (Hn>0) { 
      res += (((res=="") ? "" : " ") +
        convert_number(Hn) + " THOUSAND"); 
    } 

    if (Dn) { 
      res += (((res=="") ? "" : " ") + 
        convert_number(Dn) + " HUNDRED"); 
    } 

    var ones = Array("", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX","SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN","FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN","NINETEEN"); 
    var tens = Array("", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY","SEVENTY", "EIGHTY", "NINETY"); 

    if (tn>0 || one>0) { 
      if (!(res=="")) { 
        res += " AND "; 
      } 
      if (tn < 2) { 
        res += ones[tn * 10 + one]; 
      } else { 
        res += tens[tn];
        if (one>0) { 
          res += ("-" + ones[one]); 
        } 
      } 
    }

    if (res=="") { 
      res = "zero"; 
    } 
    return res;
  }

  function frac(f) {
    return f % 1;
  }

  function number2text(value) {
    var fraction = Math.round(frac(value)*100);
    var f_text  = "";

    if(fraction > 0) {
      f_text = "AND "+convert_number(fraction)+" PAISE";
    }

    return convert_number(Math.floor(value))+" RUPEES "+f_text+" ONLY";
  }

  const generateBreakdownPDF = useCallback(function() {
    const doc = new jsPDF();
    const { companyName, name, address } = empDetails;
    doc.setFontSize(18);
    doc.text(companyName || 'Company Name', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${address?.city || ''}, ${address?.state || ''} ${address?.zip || ''}`, 105, 30, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`${selectedCard} - ${filter.toUpperCase()}`, 105, 50, { align: 'center' });

    autoTable(doc, {
      startY: 60,
      head: [['Period', 'Amount (₹)']],
      body: filteredData.map(function(row) { 
        return [row.period, row.amount.toLocaleString()]; 
      }),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 1: { halign: 'right' } }
    });

    doc.save(`salary_${selectedCard.replace(/\s+/g, '_').toLowerCase()}_${filter}_2025.pdf`);
  }, [filteredData, selectedCard, filter, empDetails]);

  const generatePayslipPDF = useCallback(function() {
    const monthIndex = 9;
    const monthData = staticSalaryData[monthIndex];
    const monthName = staticSalaryData[monthIndex].month;
    const payPeriod = '2025-10';
    const payDate = '2025-10-16';
    const joiningDate = empDetails.joiningDate ? new Date(empDetails.joiningDate).toLocaleDateString('en-IN') : 'N/A';

    const ytdBasic = staticSalaryData.slice(0, monthIndex + 1).reduce(function(acc, item) { 
      return acc + item.basicSalary; 
    }, 0);
    const ytdHra = staticSalaryData.slice(0, monthIndex + 1).reduce(function(acc, item) { 
      return acc + item.hra; 
    }, 0);
    const ytdDa = staticSalaryData.slice(0, monthIndex + 1).reduce(function(acc, item) { 
      return acc + item.da; 
    }, 0);
    const ytdSpecial = (monthIndex + 1) * 1000;
    const ytdConveyance = (monthIndex + 1) * 500;
    const ytdGross = ytdBasic + ytdHra + ytdDa + ytdSpecial + ytdConveyance;

    const basic = monthData.basicSalary;
    const hra = monthData.hra;
    const da = monthData.da;
    const special = 1000;
    const conveyance = 500;
    const gross = basic + hra + da + special + conveyance;

    const pf = Math.round(basic * 0.12);
    const ytdPf = staticSalaryData.slice(0, monthIndex + 1).reduce(function(acc, item) { 
      return acc + Math.round(item.basicSalary * 0.12); 
    }, 0);
    const profTax = 1000;
    const ytdProf = (monthIndex + 1) * 1000;
    const tds = 1000;
    const ytdTds = (monthIndex + 1) * 1000;
    const leaveDed = 0;
    const ytdLeave = 0;
    const totalDed = pf + profTax + tds + leaveDed;
    const ytdTotalDed = ytdPf + ytdProf + ytdTds + ytdLeave;
    const netPay = gross - totalDed;
    const ytdNet = ytdGross - ytdTotalDed;

    const doc = new jsPDF('p', 'mm', 'a4');
    const { companyName, name, position, empId, address, bankDetails } = empDetails;

    doc.setFontSize(20);
    doc.text(companyName || 'Company Name', 105, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`${address?.city || ''}, ${address?.state || ''}, ${address?.zip || ''}`, 105, 35, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Payslip For the Month', 105, 50, { align: 'center' });
    doc.text(payPeriod, 105, 60, { align: 'center' });

    let yPos = 75;
    doc.setFontSize(12);
    doc.text(`EMPLOYEE NAME: ${name}`, 20, yPos);
    yPos += 7;
    doc.text(`DESIGNATION: ${position || 'Employee'}`, 20, yPos);
    yPos += 7;
    doc.text(`EMPLOYEE ID: ${empId || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`DATE OF JOINING: ${joiningDate}`, 20, yPos);
    yPos += 7;
    doc.text(`PAY PERIOD: ${payPeriod}`, 20, yPos);
    yPos += 7;
    doc.text(`PAY DATE: ${payDate}`, 20, yPos);
    yPos += 10;

    doc.setFillColor(144, 238, 144);
    doc.rect(150, yPos - 10, 50, 20, 'F');
    doc.setFontSize(14);
    doc.text(netPay.toFixed(2), 160, yPos + 2, { align: 'center' });
    doc.text('Employee Net Pay', 160, yPos + 8, { align: 'center' });
    doc.setFontSize(10);
    doc.text('PAID DAYS: 31', 150, yPos + 15);
    doc.text('LOP DAYS: 0', 150, yPos + 22);

    yPos += 35;
    doc.text('PF A/C NUMBER: AA/AAA/9999999/99G/9899999', 20, yPos);
    yPos += 7;
    doc.text('UAN: 111111111111', 20, yPos);
    yPos += 15;

    autoTable(doc, {
      startY: yPos,
      head: [['EARNINGS', 'AMOUNT', 'YTD']],
      body: [
        ['Basic Salary', basic.toFixed(2), ytdBasic.toFixed(2)],
        ['HRA', hra.toFixed(2), ytdHra.toFixed(2)],
        ['DA', da.toFixed(2), ytdDa.toFixed(2)],
        ['Special Allowance', special.toFixed(2), ytdSpecial.toFixed(2)],
        ['Conveyance', conveyance.toFixed(2), ytdConveyance.toFixed(2)],
        ['Gross Earnings', gross.toFixed(2), ytdGross.toFixed(2)]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { left: 20, right: 105 }
    });

    const earningsHeight = doc.lastAutoTable.finalY - yPos;

    autoTable(doc, {
      startY: yPos,
      head: [['DEDUCTIONS', 'AMOUNT', 'YTD']],
      body: [
        ['PF (12%)', pf.toFixed(2), ytdPf.toFixed(2)],
        ['Professional Tax', profTax.toFixed(2), ytdProf.toFixed(2)],
        ['TDS', tds.toFixed(2), ytdTds.toFixed(2)],
        ['Leave Deduction', leaveDed.toFixed(2), ytdLeave.toFixed(2)],
        ['TOTAL DEDUCTIONS', totalDed.toFixed(2), ytdTotalDed.toFixed(2)]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { left: 105 }
    });

    const deductionsHeight = doc.lastAutoTable.finalY - yPos;
    yPos = Math.max(yPos + earningsHeight, yPos + deductionsHeight) + 10;

    doc.setFontSize(14);
    doc.text('TOTAL NET PAYABLE', 20, yPos);
    doc.setFontSize(16);
    doc.text(netPay.toFixed(2), 100, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Amount in Words: Indian Rupee ${number2text(netPay)}`, 20, yPos);
    yPos += 10;

    doc.text('Note: This is a computer-generated payslip and does not require a signature.', 20, yPos);

    doc.save(`payslip_${payPeriod}_${empId || 'employee'}.pdf`);
  }, [staticSalaryData, empDetails]);

  const downloadPDF = useCallback(function() {
    if (selectedCard === 'Gross Salary' && filter === 'monthly') {
      generatePayslipPDF();
    } else {
      generateBreakdownPDF();
    }
  }, [generatePayslipPDF, generateBreakdownPDF]);

  const getDateDifference = function(startDate) {
    if (!startDate) return { years: 0, months: 0 };
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return { years: 0, months: 0 };
      const end = new Date();
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();

      if (days < 0) {
        months -= 1;
        const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += lastMonth.getDate();
      }

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      return { years, months };
    } catch {
      return { years: 0, months: 0 };
    }
  };

  const formatDate = function(dateString) {
    if (!dateString) return 'Not Available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Available';
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return 'Not Available';
    }
  };

  const handleOpen = function() {
    setOpen(true);
    setFormData({
      dob: empDetails?.dob ? new Date(empDetails.dob).toISOString().split('T')[0] : '',
      street: empDetails?.address?.street || '',
      city: empDetails?.address?.city || '',
      state: empDetails?.address?.state || '',
      country: empDetails?.address?.country || '',
      zip: empDetails?.address?.zip || '',
    });
  };

  const handleClose = function() {
    setOpen(false);
  };

  const handleChange = function(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = function(e) {
    setNewFiles([...newFiles, ...Array.from(e.target.files)]);
  };

  const handleSubmit = async function() {
    setIsSubmitting(true);
    try {
      const updateData = {
        employeeId: empDetails?._id,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
        address: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
          street: formData.street,
          zip: formData.zip,
        },
      };
      await updateEmployee({ updateData });
      handleClose();
    } catch (error) {
      console.error('Error updating employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canViewSensitive = user?.role === 'superAdmin' || user?.role === 'admin' || user?.role === 'Manager' || user?._id === empDetails?._id;

  const maskSensitiveInfo = function(info) {
    return canViewSensitive ? info || 'Not Available' : '••••••';
  };

  // Render Employee Details Section (common for all tabs)
  const renderEmployeeDetails = function() {
    const getStatusColor = (status) => {
      if (status === 'active') return '#4caf50';
      return '#f44336';
    };

    return (
      <Box>
        <Grid container spacing={2} alignItems="center">
          {/* Avatar Section */}
          <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                mb: 1,
                p: 1,
                borderRadius: '50%',
                background: alpha(theme.palette.primary.light, 0.2),
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                }}
                src={empDetails.avatar || ''}
              >
                {empDetails.name?.charAt(0)?.toUpperCase() || 'N/A'}
              </Avatar>
              {/* Upload icon if needed, but since no avatar change here, skip for now */}
            </Box>
            <Chip
              label={empDetails.status?.toUpperCase() || 'N/A'}
              sx={{
                fontWeight: 500,
                color: '#fff',
                backgroundColor: getStatusColor(empDetails.status),
                borderRadius: '6px',
              }}
              size="small"
            />
             {/* Social Media Links */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {empDetails.socialMedia?.twitter && (
                <Tooltip title="Twitter">
                  <IconButton
                    component="a"
                    href={empDetails.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      backgroundColor: theme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#f5f5f5', 0.8),
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? alpha('#000', 0.4) : alpha('#e0e0e0', 0.8),
                      },
                    }}
                  >
                    <X fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {empDetails.socialMedia?.linkedin && (
                <Tooltip title="LinkedIn">
                  <IconButton
                    component="a"
                    href={empDetails.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: '#0a66c2',
                      backgroundColor: alpha('#0a66c2', 0.1),
                      '&:hover': {
                        backgroundColor: alpha('#0a66c2', 0.2),
                      },
                    }}
                  >
                    <LinkedIn fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {empDetails.name || 'N/A'}
              </Typography>
              {(user.role === 'superAdmin' || user.role === 'Admin' || user.role === 'Manager' || user._id === empDetails._id) && (
                <Tooltip title="Edit details">
                  <IconButton
                    onClick={handleOpen}
                    size="small"
                    sx={{
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.background.paper,
                      border: `2px solid ${theme.palette.primary.main}`,
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <AdminPanelSettings sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {empDetails.role || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Work sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Position
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {empDetails.position || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {empDetails.email || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {empDetails.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: "center" }}>
                    <Business sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 18 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Company
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {empDetails.companyName || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>

           
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderSectionContent = function() {
    switch (activeSection) {
      case 'basic':
        return (
          <>
            {showTitle && (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontFamily: "'Poppins', sans-serif",
                  padding: '10px 20px',
                  borderBottom: `2px solid #2c3e50`,
                  display: 'inline-block',
                }}
              >
                BASIC INFORMATION
              </Typography>
            )}
            <Grid container spacing={3} sx={{ mt: 3, mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<Event />}
                  label="Join Date"
                  value={maskSensitiveInfo(formatDate(empDetails?.joiningDate))}
                  theme={theme}
                  gradient="linear-gradient(135deg, #6D8299 0%, #3498DB 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<Work />}
                  label="Experience"
                  value={maskSensitiveInfo(
                    `${getDateDifference(empDetails?.joiningDate).years} yrs, ${getDateDifference(empDetails?.joiningDate).months} mos`
                  )}
                  theme={theme}
                  gradient="linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<Person />}
                  label="Employee ID"
                  value={maskSensitiveInfo(empDetails?.empId || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)"
                />
              </Grid>
            </Grid>
          </>
        );
      case 'personal':
        return (
          <>
            {showTitle && (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontFamily: '"Roboto", sans-serif',
                  padding: '10px 20px',
                  borderBottom: `2px solid #2c3e50`,
                  display: 'inline-block',
                }}
              >
                PERSONAL INFORMATION
              </Typography>
            )}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={4}>
                <InfoCard
                  icon={<Event />}
                  label="Date of Birth"
                  value={formatDate(empDetails?.dob)}
                  theme={theme}
                  gradient="linear-gradient(135deg, #8A6D99 0%, #6A4A8A 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: '16px',
                    backgroundColor: theme.palette.background.paper,
                    backdropFilter: 'blur(5px)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontFamily: '"Roboto", sans-serif',
                    }}
                  >
                    <LocationOn /> Address
                  </Typography>
                  <Grid container spacing={2}>
                    {['street', 'city', 'state', 'country', 'zip'].map(function(field) {
                      return (
                        <Grid item xs={12} sm={field === 'street' ? 12 : 6} key={field}>
                          <Chip
                            label={`${field.charAt(0).toUpperCase() + field.slice(1)}: ${empDetails?.address?.[field] || 'Not Available'}`}
                            sx={{
                              backgroundColor: '#fff',
                              borderRadius: '12px',
                              fontWeight: 500,
                              width: '100%',
                              justifyContent: 'flex-start',
                              height: 'auto',
                              padding: '10px 12px',
                              '& .MuiChip-label': {
                                whiteSpace: 'normal',
                                padding: 0,
                                fontFamily: '"Roboto", sans-serif',
                              },
                              transition: 'background-color 0.3s',
                              '&:hover': {
                                backgroundColor: '#e3f2fd',
                              },
                            }}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </>
        );
      case 'bank':
        return (
          <>
            {showTitle && (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontFamily: '"Roboto", sans-serif',
                  padding: '10px 20px',
                  borderBottom: `2px solid #2c3e50`,
                  display: 'inline-block',
                }}
              >
                BANK DETAILS
              </Typography>
            )}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  icon={<AccountBalance />}
                  label="Bank Name"
                  value={maskSensitiveInfo(empDetails?.bankDetails?.bankName || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #6D9982 0%, #4A8A6D 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  icon={<Numbers />}
                  label="Account Number"
                  value={maskSensitiveInfo(empDetails?.bankDetails?.accountNumber || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  icon={<VpnKey />}
                  label="IFSC Code"
                  value={maskSensitiveInfo(empDetails?.bankDetails?.ifscCode || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  icon={<LocationCity />}
                  label="Branch"
                  value={maskSensitiveInfo(empDetails?.bankDetails?.branch || 'Not Available')}
                  theme={theme}
                  gradient="linear-gradient(135deg, #E67E22 0%, #F39C12 100%)"
                />
              </Grid>
            </Grid>
          </>
        );
      case 'salary':
        return (
          <>
            {showTitle && (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontFamily: '"Roboto", sans-serif',
                  padding: '10px 20px',
                  borderBottom: `2px solid #2c3e50`,
                  display: 'inline-block',
                  mb: 4,
                }}
              >
                SALARY DETAILS
              </Typography>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SalaryInfoCard
                  icon={<TrendingUp />}
                  label="CTC"
                  value={`₹${getSalaryInfoCurrentValue('CTC').toLocaleString()}`}
                  theme={theme}
                  gradient="White"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SalaryInfoCard
                  icon={<Wallet />}
                  label="Net Salary"
                  value={`₹${getSalaryInfoCurrentValue('In Hand Salary').toLocaleString()}`}
                  theme={theme}
                  gradient="White"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SalaryInfoCard
                  icon={<EmojiEvents />}
                  label="Bonus"
                  value={`₹${getSalaryInfoCurrentValue('Bonus').toLocaleString()}`}
                  theme={theme}
                  gradient="White"
                  onClick={function() { handleSalaryCardClick('Bonus'); }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SalaryInfoCard
                  icon={<MonetizationOn />}
                  label="Incentive"
                  value={`₹${getSalaryInfoCurrentValue('Incentive').toLocaleString()}`}
                  theme={theme}
                  gradient="White"
                  onClick={function() { handleSalaryCardClick('Incentive'); }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <SalaryInfoCard
                  icon={<CardGiftcard />}
                  label="Allowances"
                  value={`₹${getSalaryInfoCurrentValue('Allowances').toLocaleString()}`}
                  theme={theme}
                  gradient="White"
                  onClick={function() { handleSalaryCardClick('Allowances'); }}
                />
              </Grid>
            </Grid>
          </>
        );
      default:
        return null;
    }
  };

  const renderSection = function() {
    const details = showDetails ? renderEmployeeDetails() : null;
    const content = renderSectionContent();

    return (
      <Box sx={{ mb: 3 }}>
        {details}
        {content}
      </Box>
    );
  };

  return (
    <>
      {Object.keys(empDetails).length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress color="primary" size={60} thickness={4} />
        </Box>
      ) : (
        <Fade in={Object.keys(empDetails).length > 0} timeout={500}>
          <Box sx={{ p: 3 }}>{renderSection()}</Box>
        </Fade>
      )}
      {/* Dialogs remain the same */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[10],
            background: theme.palette.mode === 'light' ? '#fff' : '#1a1a2e',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#2c3e50',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            fontFamily: '"Roboto", sans-serif',
          }}
        >
          Edit Employee Details
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              name="dob"
              label="Date of Birth"
              type="date"
              fullWidth
              value={formData.dob || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true, sx: { fontFamily: '"Roboto", sans-serif' } }}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                },
                '& .MuiInputBase-input': {
                  fontFamily: '"Roboto", sans-serif',
                },
              }}
            />
            <Typography
              variant="h6"
              fontWeight={600}
              color={theme.palette.text.primary}
              sx={{ fontFamily: '"Roboto", sans-serif' }}
            >
              Address Information
            </Typography>
            <TextField
              name="street"
              label="Street"
              fullWidth
              value={formData.street || ''}
              onChange={handleChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                },
                '& .MuiInputBase-input': {
                  fontFamily: '"Roboto", sans-serif',
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Roboto", sans-serif',
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="city"
                  label="City"
                  fullWidth
                  value={formData.city || ''}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="state"
                  label="State"
                  fullWidth
                  value={formData.state || ''}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="country"
                  label="Country"
                  fullWidth
                  value={formData.country || ''}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="zip"
                  label="Zip Code"
                  fullWidth
                  value={formData.zip || ''}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Roboto", sans-serif',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: theme.palette.grey[400],
              color: theme.palette.text.primary,
              padding: '8px 20px',
              '&:hover': {
                borderColor: theme.palette.grey[600],
                backgroundColor: theme.palette.grey[100],
              },
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#2c3e50',
              padding: '8px 20px',
              '&:hover': {
                backgroundColor: '#34495e',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s',
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            {isSubmitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={salaryDialogOpen}
        onClose={function() { setSalaryDialogOpen(false); }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[10],
            background: theme.palette.mode === 'light' ? '#fff' : '#1a1a2e',
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#2c3e50',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            fontFamily: '"Roboto", sans-serif',
          }}
        >
          {selectedCard} - {filter.toUpperCase()}
          <IconButton onClick={function() { setSalaryDialogOpen(false); }} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={function(e) { setFilter(e.target.value); }}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Roboto", sans-serif' }}>
            {selectedCard} - {filter.toUpperCase()}
          </Typography>
          {filteredData.map(function(row, index) {
            return (
              <Typography key={index} sx={{ mb: 0.5, fontFamily: '"Roboto", sans-serif' }} variant="body2">
                {row.period}: ₹{row.amount.toLocaleString()}
              </Typography>
            );
          })}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={function() { setSalaryDialogOpen(false); }}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: theme.palette.grey[400],
              color: theme.palette.text.primary,
              padding: '8px 20px',
              '&:hover': {
                borderColor: theme.palette.grey[600],
                backgroundColor: theme.palette.grey[100],
              },
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            Close
          </Button>
          <Button
            onClick={downloadPDF}
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#2c3e50',
              padding: '8px 20px',
              '&:hover': {
                backgroundColor: '#34495e',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s',
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            Download as PDF
          </Button>
        </DialogActions>
      </Dialog>
      {/* Salary Info Dialog */}
      <Dialog
        open={salaryInfoDialogOpen}
        onClose={handleSalaryDialogClose}
        fullWidth
        maxWidth="md"
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 400 }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[20],
            background: theme.palette.mode === 'light' ? '#fff' : '#1a1a2e',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'var(--background-bg-2)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2.5,
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            fontFamily: '"Roboto", sans-serif',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-color-3)', fontFamily: '"Roboto", sans-serif' }}>
            {selectedSalaryCard} History
          </Typography>
          <IconButton onClick={handleSalaryDialogClose} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200, mt: 2 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={salaryFilter}
                  label="Filter"
                  onChange={function(e) { 
                    setSalaryFilter(e.target.value); 
                    setCurrentPage(1);
                  }}
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                  }}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              {salaryFilter === 'custom' && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={customStartDate}
                    onChange={function(e) { setCustomStartDate(e.target.value); }}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 180,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    value={customEndDate}
                    onChange={function(e) { setCustomEndDate(e.target.value); }}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 180,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
            
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: '12px',
                boxShadow: theme.shadows[2],
                maxHeight: 400,
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700,
                        backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a3a',
                        fontFamily: '"Roboto", sans-serif',
                        fontSize: '14px',
                      }}
                    >
                      Period
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        fontWeight: 700,
                        backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2a2a3a',
                        fontFamily: '"Roboto", sans-serif',
                        fontSize: '14px',
                      }}
                    >
                      Amount (₹)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getPaginatedData(getFilteredSalaryData(selectedSalaryCard)).map(function(row, index) {
                    return (
                      <TableRow 
                        key={index}
                        sx={{
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#2a2a3a',
                          },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell sx={{ fontFamily: '"Roboto", sans-serif' }}>
                          {row.period}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: '"Roboto", sans-serif', fontWeight: 500 }}>
                          ₹{row.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination 
                count={Math.ceil(getFilteredSalaryData(selectedSalaryCard).length / itemsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontFamily: '"Roboto", sans-serif',
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            onClick={handleSalaryDialogClose}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: theme.palette.grey[400],
              color: theme.palette.text.primary,
              padding: '8px 20px',
              '&:hover': {
                borderColor: theme.palette.grey[600],
                backgroundColor: theme.palette.grey[100],
              },
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'var(--background-bg-2)',
              padding: '8px 20px',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s',
              fontFamily: '"Roboto", sans-serif',
            }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const InfoCard = function({ icon, label, value, theme, gradient }) {
  return (
    <Paper
      elevation={6}
      sx={{
        p: 3,
        borderRadius: '16px',
        background: '#ffffff',
        backdropFilter: 'blur(10px)',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left',
        transition: 'transform 0.3s, box-shadow 0.3s, background 0.3s',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: theme.shadows[10],
          background: 'var(--background-bg-2)',
          '& .MuiTypography-root': {
            color: '#ffffff',
          },
          '& .MuiSvgIcon-root': {
            color: '#ffffff',
          },
        },
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: theme.palette.text.primary,
            mb: 1,
            textTransform: 'uppercase',
            fontFamily: '"Roboto", sans-serif',
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: theme.palette.text.primary,
            fontFamily: '"Roboto", sans-serif',
            fontWeight: 400,
          }}
        >
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: alpha(theme.palette.text.primary, 0.2),
          '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.4),
          },
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 24, color: theme.palette.text.primary } })}
      </Box>
    </Paper>
  );
};

const SalaryInfoCard = function({ icon, label, value, theme, gradient, onClick }) {
  return (
    <Card
  elevation={8}
  onClick={onClick}
  sx={{
    borderRadius: '20px',
    background: gradient,
    height: '100%',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(onClick && {
      '&:hover': {
        transform: 'translateY(-12px) scale(1.02)',
        boxShadow: theme.shadows[20],
        background: 'var(--background-bg-2)',

        // 👇 Hover pe saare black text/icons white ho jayenge
        '& .hover-white': {
          color: 'white !important',
        },
        '& .hover-white svg': {
          color: 'white !important',
        },
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.1)',
        opacity: 0,
        transition: 'opacity 0.3s',
      },
      '&:hover::before': {
        opacity: 1,
      },
    }),
  }}
>
  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mb: 2 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {React.cloneElement(icon, { className: 'hover-white', sx: { fontSize: 32, color: 'black' } })}
      </Box>
    </Box>

    <Typography
      className="hover-white"
      sx={{
        fontSize: 13,
        fontWeight: 600,
        color: 'black',
        mb: 1,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: '"Roboto", sans-serif',
      }}
    >
      {label}
    </Typography>

    <Typography
      className="hover-white"
      sx={{
        fontSize: 24,
        fontWeight: 700,
        color: 'black',
        fontFamily: '"Roboto", sans-serif',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {value}
    </Typography>
  </CardContent>
</Card>

  );
};

export default BasicDetail;