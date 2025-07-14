// src/components/ProjectTabsOption.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, IconButton, Typography } from '@mui/material';
import { Menu, GridView, CalendarViewMonth } from '@mui/icons-material';
import { setViewType } from '../../../redux/actions/changeViewType/tabs';

function ProjectTabsOption() {
  const dispatch = useDispatch();
  const activeButton = useSelector((state) => state.changeTabView.viewType);

  // Function to handle button click
  const handleButtonClick = (buttonName) => {
    dispatch(setViewType(buttonName));
  };

  // Styling for the buttons
  const buttonStyle = {
    height: '50px',
    width: '50px',
    color: 'black',
    backgroundColor: 'white',
    borderRadius: '15px',
  };

  const activeButtonStyle = {
    ...buttonStyle,
    border: '2px solid #157bd4', // Light blue border for active button
  };

  return (
    <Grid
      container
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        
      }}
    >
      <Grid item xs={7} sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6">Tasks</Typography>
      </Grid>
      
      <Grid container item xs={4} spacing={2} justifyContent="center">
        <Grid item>
          <IconButton
            sx={activeButton === 'menu' ? activeButtonStyle : buttonStyle}
            onClick={() => handleButtonClick('menu')}
          >
            <Menu />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            sx={activeButton === 'gridView' ? activeButtonStyle : buttonStyle}
            onClick={() => handleButtonClick('gridView')}
          >
            <GridView />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            sx={activeButton === 'calendarView' ? activeButtonStyle : buttonStyle}
            onClick={() => handleButtonClick('calendarView')}
          >
            <CalendarViewMonth />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ProjectTabsOption;
