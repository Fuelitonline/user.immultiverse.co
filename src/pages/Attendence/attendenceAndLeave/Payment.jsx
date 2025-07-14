import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { usePost } from "../../../hooks/useApi";
import PropTypes from "prop-types";


const AddPaymentMethodModal = ({ open, handleClose ,saved}) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [autoPaymentDate, setAutoPaymentDate] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); 

  // Stripe fields
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeCurrency, setStripeCurrency] = useState("");
  const [stripeAccountHolderName, setStripeAccountHolderName] = useState("");
  const [stripePlan, setStripePlan] = useState("");

  // PayPal fields
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalSecretKey, setPaypalSecretKey] = useState("");
  const [paypalCurrency, setPaypalCurrency] = useState("");
  const [paypalPlan, setPaypalPlan] = useState("");

  // Bank Transfer fields
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankRoutingNumber, setBankRoutingNumber] = useState("");
  const [bankAccountHolderName, setBankAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("");

  // Other Payment Method fields
  const [otherPaymentProvider, setOtherPaymentProvider] = useState("");
  const [otherAccountIdentifier, setOtherAccountIdentifier] = useState("");
const handleSubmitPaymentMethod = usePost('/company/salery/create-model')
  // Handlers for input changes
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };



  const handleAutoPaymentDateChange = (event) => {
    setAutoPaymentDate(event.target.value);
  };

  // Stripe handlers
  const handleStripeSecretKeyChange = (event) =>
    setStripeSecretKey(event.target.value);
  const handleStripeCurrencyChange = (event) =>
    setStripeCurrency(event.target.value);
  const handleStripeAccountHolderNameChange = (event) =>
    setStripeAccountHolderName(event.target.value);
  const handleStripePlanChange = (event) => setStripePlan(event.target.value);

  // PayPal handlers
  const handlePaypalClientIdChange = (event) =>
    setPaypalClientId(event.target.value);
  const handlePaypalSecretKeyChange = (event) =>
    setPaypalSecretKey(event.target.value);
  const handlePaypalCurrencyChange = (event) =>
    setPaypalCurrency(event.target.value);
  const handlePaypalPlanChange = (event) => setPaypalPlan(event.target.value);

  // Bank Transfer handlers
  const handleBankAccountNumberChange = (event) =>
    setBankAccountNumber(event.target.value);
  const handleBankRoutingNumberChange = (event) =>
    setBankRoutingNumber(event.target.value);
  const handleBankAccountHolderNameChange = (event) =>
    setBankAccountHolderName(event.target.value);
  const handleBankNameChange = (event) => setBankName(event.target.value);
  const handleAccountTypeChange = (event) => setAccountType(event.target.value);

  // Other Payment Method handlers
  const handleOtherPaymentProviderChange = (event) =>
    setOtherPaymentProvider(event.target.value);
  const handleOtherAccountIdentifierChange = (event) =>
    setOtherAccountIdentifier(event.target.value);

  // Form submission handler
  const handleSubmit = async () => {
    if (!paymentMethod || !autoPaymentDate) {
      alert('Please fill all required fields!');
      return;
    }
  
    const paymentData = {
      paymentMethod,
      autoPaymentDate,
      stripe: {
        secretKey: stripeSecretKey,
        currency: stripeCurrency,
        accountHolderName: stripeAccountHolderName,
        plan: stripePlan,
      },
      paypal: {
        clientId: paypalClientId,
        secretKey: paypalSecretKey,
        currency: paypalCurrency,
        plan: paypalPlan,
      },
      bankTransfer: {
        accountNumber: bankAccountNumber,
        routingNumber: bankRoutingNumber,
        accountHolderName: bankAccountHolderName,
        bankName,
        accountType,
      },
      other: {
        provider: otherPaymentProvider,
        accountIdentifier: otherAccountIdentifier,
      },
    };
  
    try {
      const res = await handleSubmitPaymentMethod.mutateAsync(paymentData);
  
      if (res?.data !== null) {
        // Success - Show success snackbar
        setSnackbarMessage(res?.data?.message);
        setSnackbarSeverity('success');
        handleClose()
      } else {
        // Failure - Show failure snackbar
        setSnackbarMessage(res?.error?.error);
        setSnackbarSeverity('error');
      }
    } catch (error) {
      // Error - Show error snackbar
      setSnackbarMessage('Error occurred while processing payment.');
      setSnackbarSeverity('error');
    }
  
    // Open the Snackbar
    setOpenSnackbar(true);
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { minWidth: 300, borderRadius: 5 , boxShadow: 24 , padding: 2, backgroundColor: useTheme().palette.background.default} }}>
            <Snackbar
      open={openSnackbar}
      autoHideDuration={6000}
      onClose={() => setOpenSnackbar(false)}
    >
      <Alert
        onClose={() => setOpenSnackbar(false)} 
        severity={snackbarSeverity} 
        sx={{ width: '100%' }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
      <DialogTitle>Set Up Auto Payment Method for Company</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="payment-method-label">Payment Method</InputLabel>
          <Select
            labelId="payment-method-label"
            value={paymentMethod}
            label="Payment Method"
            onChange={handlePaymentMethodChange}
          >
            <MenuItem value="stripe">Stripe</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
            <MenuItem value="bank">Bank Transfer</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
      <InputLabel id="payment-method-label">Payment Date</InputLabel>
      <Select
        labelId="payment-Date-label"
        value={autoPaymentDate}
        label="Payment Date"
        onChange={handleAutoPaymentDateChange}
      >
        
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <MenuItem key={day} value={day}>
            {day}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
         

        {/* Render fields for selected payment method */}
        {paymentMethod === "stripe" && (
          <>
            <TextField
              label="Stripe Secret Key"
              fullWidth
              value={stripeSecretKey}
              onChange={handleStripeSecretKeyChange}
              margin="normal"
            />
            <TextField
              label="Stripe Currency"
              fullWidth
              value={stripeCurrency}
              onChange={handleStripeCurrencyChange}
              margin="normal"
            />
            <TextField
              label="Stripe Account Holder Name"
              fullWidth
              value={stripeAccountHolderName}
              onChange={handleStripeAccountHolderNameChange}
              margin="normal"
            />
            <TextField
              label="Stripe Plan (e.g., Monthly)"
              fullWidth
              value={stripePlan}
              onChange={handleStripePlanChange}
              margin="normal"
            />
          </>
        )}

        {paymentMethod === "paypal" && (
          <>
            <TextField
              label="PayPal Client ID"
              fullWidth
              value={paypalClientId}
              onChange={handlePaypalClientIdChange}
              margin="normal"
            />
            <TextField
              label="PayPal Secret Key"
              fullWidth
              value={paypalSecretKey}
              onChange={handlePaypalSecretKeyChange}
              margin="normal"
            />
            <TextField
              label="PayPal Currency"
              fullWidth
              value={paypalCurrency}
              onChange={handlePaypalCurrencyChange}
              margin="normal"
            />
            <TextField
              label="PayPal Plan (e.g., Monthly)"
              fullWidth
              value={paypalPlan}
              onChange={handlePaypalPlanChange}
              margin="normal"
            />
          </>
        )}

        {paymentMethod === "bank" && (
          <>
            <TextField
              label="Bank Account Number"
              fullWidth
              value={bankAccountNumber}
              onChange={handleBankAccountNumberChange}
              margin="normal"
            />
            <TextField
              label="Bank Routing Number"
              fullWidth
              value={bankRoutingNumber}
              onChange={handleBankRoutingNumberChange}
              margin="normal"
            />
            <TextField
              label="Bank Account Holder Name"
              fullWidth
              value={bankAccountHolderName}
              onChange={handleBankAccountHolderNameChange}
              margin="normal"
            />
            <TextField
              label="Bank Name"
              fullWidth
              value={bankName}
              onChange={handleBankNameChange}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="account-type-label">Account Type</InputLabel>
              <Select
                labelId="account-type-label"
                value={accountType}
                onChange={handleAccountTypeChange}
              >
                <MenuItem value="checking">Checking</MenuItem>
                <MenuItem value="savings">Savings</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {paymentMethod === "other" && (
          <>
            <TextField
              label="Other Payment Provider"
              fullWidth
              value={otherPaymentProvider}
              onChange={handleOtherPaymentProviderChange}
              margin="normal"
            />
            <TextField
              label="Account Identifier"
              fullWidth
              value={otherAccountIdentifier}
              onChange={handleOtherAccountIdentifierChange}
              margin="normal"
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
AddPaymentMethodModal.propTypes = {

  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  /**
   * Callback function triggered after successfully saving the payment method (optional).
   */
  saved: PropTypes.func,
};
export default AddPaymentMethodModal;
