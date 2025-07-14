import React, { useState } from 'react';
import ProgressTracker from './ProgressTracker';
import { Button, TextField, Container, Box, Typography } from '@mui/material';
import SideStyle from '../AuthSideStyle';
import UserInformation from '../../../components/user/ragistartion/UserInformation';
import UserVerification from '../../../components/user/ragistartion/UserVerification';
import RegisterSuccess from '../../../components/user/ragistartion/RagisterSuccess';
import { Grid } from '@mui/system';


const stages = ['Personal Info', 'Account Info', 'Registration Success'];


  /**
   * The RagisterUser component is a multi-step registration form.
   * It displays a progress tracker, and then renders one of the following
   * components based on the current step:
   * - UserVerification: renders a page for the user to enter their email and phone number.
   * - UserInformation: renders a page for the user to enter their company name and address.
   * - RegisterSuccess: renders a success message after the user has completed the registration process.
   *
   * The component also keeps track of the user's input in the `formData` state,
   * and provides a `handleInputChange` function to update the state when the user enters new data.
   * The component also provides `handleNext` and `handlePrevious` functions to navigate
   * between the different stages of the registration process.
   * The component also provides a `handleSubmit` function to handle the form submission
   * on the final stage.
   * The component also provides a `handleStageComplete` function to handle the completion of each stage.
   */

const RagisterUser = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [formData, setFormData] = useState({});
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      handleSubmit(); // Handle form submission on the final stage
    }
  };

  const handlePrevious = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission logic here
    alert('Form submitted!');
  };

  const handleStageComplete = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    handleNext();
  };
console.log(currentStage,'current')
  return (
    <Grid  container sx={{ height: "100vh", overflow: "hidden" }}>
       <Grid  item xs={12} sm={3} width={'50vh'}>
       <SideStyle text = {'Register Now ...'}/>
       </Grid>
      
     
      <Grid
     item 
     xs={12} 
     sm={6}
      >
        <Grid>
        <ProgressTracker currentStage={currentStage} stages={stages} />
        </Grid>
        <Grid  sx={{display: "flex", justifyContent: "center", ml: 2}} >
       <Typography
          variant="h4"
          align="center"
          sx={{ mb: 3, fontWeight: "bold", color: "#053E0E" }}
        >
          Join Us Now
        </Typography>
       </Grid>
        <Grid  sx={{background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",}}>
          {currentStage === 0 && (
            <UserVerification onStageComplete={handleStageComplete} />
          )}
          {currentStage === 1 && (
            <UserInformation onStageComplete={handleStageComplete}/>
          )}
          {currentStage === 2 && (
            <RegisterSuccess/>
          )}
          
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RagisterUser;
