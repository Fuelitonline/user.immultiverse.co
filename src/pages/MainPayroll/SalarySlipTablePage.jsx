import React from 'react';
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import SalarySlip from './SalarySlip';

const SalarySlipTablePage = () => {
  const companyData = {
    companyName: "Think & Learn Private Limited",
  };

  const employeeData = {
    code: "TNL21833191",
    name: "Dushyant Singh Rathore",
  };

  const paymentData = {
    month: "April 2021",
    payableDays: "29.00",
  };

  const earnings = {
    standard: {
      basic: 29167.00,
      hra: 14583.00,
      medicalAllowance: 3000.00,
      conveyanceAllowance: 4000.00,
      specialAllowance: 5783.00,
      total: 56533.00
    },
    actual: {
      basic: 28194.77,
      hra: 14096.90,
      medicalAllowance: 2900.00,
      conveyanceAllowance: 3866.67,
      specialAllowance: 5590.23,
      salesIncentive: 51836.00,
      total: 106485.00
    }
  };

  const deductions = {
    pfContribution: 1800.00,
    incomeTax: 13324.00,
    incentiveAdjDeduction: 41054.00,
    salesCBRecovery: 7730.00,
    total: 63908.00
  };

  const netPayDetails = {
    amount: 42577.00,
  };

  return (
    <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2, mt: 3 }}>
      <CardContent>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={6} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {companyData.companyName} - Payslip for {paymentData.month}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Employee Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Info</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Earnings</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Standard</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actual</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Deductions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Code: {employeeData.code}</TableCell>
                <TableCell>Month: {paymentData.month}</TableCell>
                <TableCell>Basic</TableCell>
                <TableCell>{earnings.standard.basic.toFixed(2)}</TableCell>
                <TableCell>{earnings.actual.basic.toFixed(2)}</TableCell>
                <TableCell>PF: {deductions.pfContribution.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Name: {employeeData.name}</TableCell>
                <TableCell>Payable Days: {paymentData.payableDays}</TableCell>
                <TableCell>HRA</TableCell>
                <TableCell>{earnings.standard.hra.toFixed(2)}</TableCell>
                <TableCell>{earnings.actual.hra.toFixed(2)}</TableCell>
                <TableCell>Income Tax: {deductions.incomeTax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>Medical Allowance</TableCell>
                <TableCell>{earnings.standard.medicalAllowance.toFixed(2)}</TableCell>
                <TableCell>{earnings.actual.medicalAllowance.toFixed(2)}</TableCell>
                <TableCell>Incentive Adj: {deductions.incentiveAdjDeduction.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>Conveyance Allowance</TableCell>
                <TableCell>{earnings.standard.conveyanceAllowance.toFixed(2)}</TableCell>
                <TableCell>{earnings.actual.conveyanceAllowance.toFixed(2)}</TableCell>
                <TableCell>Sales CB Recovery: {deductions.salesCBRecovery.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>Special Allowance</TableCell>
                <TableCell>{earnings.standard.specialAllowance.toFixed(2)}</TableCell>
                <TableCell>{earnings.actual.specialAllowance.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>Sales Incentive</TableCell>
                <TableCell>-</TableCell>
                <TableCell>{earnings.actual.salesIncentive.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Net Pay: {netPayDetails.amount.toFixed(2)}</TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{earnings.standard.total.toFixed(2)}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{earnings.actual.total.toFixed(2)}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total: {deductions.total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SalarySlip
            payrollData={{}}
            insativeData={{}}
            month={paymentData.month.split(' ')[0]}
            year={paymentData.month.split(' ')[1]}
            saleryMonth={0}
            companyData={companyData}
            employeeData={employeeData}
            paymentData={paymentData}
            earnings={earnings}
            deductions={deductions}
            netPayDetails={netPayDetails}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalarySlipTablePage;