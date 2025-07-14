// src/components/PayrollForm.js
import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Card,
    CardContent,
} from '@mui/material';
import axios from 'axios';

const PayrollForm = () => {
    const [baseSalary, setBaseSalary] = useState(0);
    const [incentives, setIncentives] = useState([{ id: Date.now(), type: '', amount: 0 }]);
    const [deductions, setDeductions] = useState([{ id: Date.now(), type: '', amount: 0 }]);
    const [totalPay, setTotalPay] = useState(0);
    const [formula, setFormula] = useState('');

    const handleBaseSalaryChange = (e) => {
        setBaseSalary(Number(e.target.value));
    };

    const handleIncentiveChange = (id, field, value) => {
        setIncentives(incentives.map(incentive => incentive.id === id ? { ...incentive, [field]: value } : incentive));
    };

    const handleDeductionChange = (id, field, value) => {
        setDeductions(deductions.map(deduction => deduction.id === id ? { ...deduction, [field]: value } : deduction));
    };

    const addIncentive = () => {
        setIncentives([...incentives, { id: Date.now(), type: '', amount: 0 }]);
    };

    const removeIncentive = (id) => {
        setIncentives(incentives.filter(incentive => incentive.id !== id));
    };

    const addDeduction = () => {
        setDeductions([...deductions, { id: Date.now(), type: '', amount: 0 }]);
    };

    const removeDeduction = (id) => {
        setDeductions(deductions.filter(deduction => deduction.id !== id));
    };

    const calculateIncentives = () => {
        let totalIncentives = 0;
        const baseSalaryContext = baseSalary;

        // Basic formula evaluation
        try {
            totalIncentives = eval(formula.replace(/x/g, baseSalaryContext));
        } catch (e) {
            console.error("Invalid formula:", e);
        }

        return totalIncentives;
    };

    const calculateTotalPay = () => {
        const totalIncentives = calculateIncentives() + incentives.reduce((sum, { amount }) => sum + (parseFloat(amount) || 0), 0);
        const totalDeductions = deductions.reduce((sum, { amount }) => sum + (parseFloat(amount) || 0), 0);
        const total = baseSalary + totalIncentives - totalDeductions;
        setTotalPay(total);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payrollData = {
            baseSalary,
            incentives,
            deductions,
            totalPay,
        };

        try {
            const response = await axios.post('http://localhost:5000/payroll', payrollData);
            console.log('Payroll created:', response.data);
        } catch (error) {
            console.error('Error creating payroll:', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h4" align="center" gutterBottom>
                        Payroll Control
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Base Salary"
                            type="number"
                            value={baseSalary}
                            onChange={handleBaseSalaryChange}
                            margin="normal"
                        />

                        <Box marginBottom={2}>
                            <Typography variant="h6">Incentives:</Typography>
                            {incentives.map(({ id, type, amount }) => (
                                <Box key={id} display="flex" alignItems="center" marginBottom={2}>
                                    <TextField
                                        label="Incentive Type"
                                        value={type}
                                        onChange={(e) => handleIncentiveChange(id, 'type', e.target.value)}
                                        margin="normal"
                                        style={{ flex: 1, marginRight: '8px' }}
                                    />
                                    <TextField
                                        label="Amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => handleIncentiveChange(id, 'amount', e.target.value)}
                                        margin="normal"
                                        style={{ flex: 1, marginRight: '8px' }}
                                    />
                                    <Button variant="outlined" color="secondary" onClick={() => removeIncentive(id)}>
                                        Remove
                                    </Button>
                                </Box>
                            ))}
                            <Button variant="contained" onClick={addIncentive}>
                                Add Incentive
                            </Button>
                        </Box>

                        <Box marginBottom={2}>
                            <Typography variant="h6">Deductions:</Typography>
                            {deductions.map(({ id, type, amount }) => (
                                <Box key={id} display="flex" alignItems="center" marginBottom={2}>
                                    <TextField
                                        label="Deduction Type"
                                        value={type}
                                        onChange={(e) => handleDeductionChange(id, 'type', e.target.value)}
                                        margin="normal"
                                        style={{ flex: 1, marginRight: '8px' }}
                                    />
                                    <TextField
                                        label="Amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => handleDeductionChange(id, 'amount', e.target.value)}
                                        margin="normal"
                                        style={{ flex: 1, marginRight: '8px' }}
                                    />
                                    <Button variant="outlined" color="secondary" onClick={() => removeDeduction(id)}>
                                        Remove
                                    </Button>
                                </Box>
                            ))}
                            <Button variant="contained" onClick={addDeduction}>
                                Add Deduction
                            </Button>
                        </Box>

                        <TextField
                            fullWidth
                            label="Formula for Incentives (e.g., x * 0.1)"
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                            margin="normal"
                        />
                        <Button variant="contained" onClick={calculateTotalPay} style={{ marginTop: '16px' }}>
                            Calculate Total Pay
                        </Button>

                        <Typography variant="h5" align="center" style={{ marginTop: '16px' }}>
                            Total Pay: {totalPay}
                        </Typography>

                        <Button variant="contained" color="primary" type="submit" style={{ marginTop: '16px' }}>
                            Submit Payroll
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PayrollForm;
