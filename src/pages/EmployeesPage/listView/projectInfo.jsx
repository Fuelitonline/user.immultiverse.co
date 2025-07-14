import {
    ArrowDownward,
    ArrowDropDown,
    ArrowUpward,
  CalendarMonth,
  DashboardCustomize,
  Edit,
  EditAttributes,
  EditAttributesRounded,
  EditCalendarSharp,
  EditNote,
  EditNoteTwoTone,
  EditOffOutlined,
  EditOffRounded,
  EditRounded,
  EditTwoTone,
  MenuBook,
  ModeEditOutline,
  Pentagon,
  Update,
} from "@mui/icons-material";
import { Avatar, Box, Grid, IconButton, Typography } from "@mui/material";
import React from "react";

function ProjectInfo({ data }) {
  return (
    <Box width={"100%"} display={"flex"} flexDirection={"column"} gap={4}>
      <Grid
        sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}
      >
        <Grid
          p={1}
          container
          direction={"column"}
          alignContent={"flex-start"}
          gap={2}
        >
          <Typography sx={{ fontSize: "16px", color: "grey" }}>
            Project Number
          </Typography>
          <Typography
            sx={{ fontSize: "16px", color: "#19191a", textAlign: "left" }}
          >
            {data?.projectNum}
          </Typography>
        </Grid>
        <IconButton
          sx={{
            backgroundColor: "#e4ecf7",
            borderRadius: "10px",
            height: "40px",
            width: "40px",
          }}
        >
          <EditRounded sx={{ color: "black" }} />
        </IconButton>
      </Grid>
      <Grid>
        <Typography
          sx={{
            fontSize: "16px",
            color: "#19191a",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          Description
        </Typography>
        <Typography
          sx={{
            fontSize: "16px",
            color: "#747678",
            textAlign: "left",
            width: "90%",
            mt: "10px",
          }}
        >
          {data?.projectDetails}
        </Typography>
      </Grid>
      <Grid>
        <Typography
          sx={{ fontSize: "16px", color: "#4e4f52", textAlign: "left" }}
        >
          Reporter
        </Typography>
        <Grid
          mt={0.6}
          sx={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar
            src={data?.reporter?.avatar || "https://i.pravatar.cc/800"}
            sx={{ width: "30px", height: "30px" }}
          />
          <Typography
            sx={{
              fontSize: "16px",
              color: "#4e4f52",
              textAlign: "left",
              width: "90%",
            }}
          >
            {data?.reporter?.name || "Kuldeep"}
          </Typography>
        </Grid>
      </Grid>
      <Grid>
        <Typography
          sx={{ fontSize: "16px", color: "#4e4f52", textAlign: "left" }}
        >
          assignee
        </Typography>
        <Grid>
        <Grid
  mt={0.6}
  sx={{
    display: "flex",
    justifyContent: "center",
    mt: "20px",
    alignItems: "center",
    position: "relative", // Ensure positioning context for overlapping
  }}
>
  <Avatar
    src={data?.avatar || "https://i.pravatar.cc/8800"}
    sx={{
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      zIndex: 1, // Bring this avatar on top
      position: "absolute", // Allow positioning overlap
      left: "0px", 
    }}
  />
  <Avatar
    src={data?.avatar || "https://i.pravatar.cc/890"}
    sx={{
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      zIndex: 2,
      position: "absolute",
      left: "17px", // Adjust overlap
    }}
  />
  <Avatar
    src={data?.avatar || "https://i.pravatar.cc/440"}
    sx={{
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      zIndex: 3,
      position: "absolute",
      left: "33px", // Adjust overlap
    }}
  />
  <Typography 
  sx={{
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    fontSize: "12px",
    position: "absolute",
    height: "30px",
    width: "30px",
    borderRadius: "50%",
    zIndex: 4,
    backgroundColor: "#155ed4",
    color: "white",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    left: "53px", // Adjust overlap
  }}
  >
       3+
  </Typography>
</Grid>
        </Grid>
      </Grid>
      <Grid>
        <Typography textAlign={"left"} fontSize={"16px"} color={"#4e4f52"}>Priority</Typography>
        <Typography sx={{ fontSize: "16px", color: data.priority==='Medium'?'orange':data.priority==='Low'?'green':'red', textAlign: "left", display:'flex',alignItems:'center' }}>
              {data?.priority==='Medium'?<ArrowUpward sx={{color:'orange'}}/>:data?.priority==='Low'?<ArrowDownward sx={{color:'green'}}/>:<ArrowUpward sx={{color:'red'}}/>}
              {data?.priority || 'High'}
        </Typography>
      </Grid>
      <Grid>
      <Typography textAlign={"left"} fontSize={"16px"} color={"#4e4f52"}>Dead Line</Typography>
      <Typography textAlign={"left"} fontSize={"14px"} color={"#4e4f52"}>19 Oct 2024</Typography>
      </Grid>

      <Grid>
      <Typography textAlign={"left"} fontSize={"16px"} color={"#4e4f52"} sx={{display: "flex",
    justifyContent: "flex-start",
    alignItems: "center", gap: "10px"}}>
           <CalendarMonth/> Created 10 July 2024
      </Typography>
      </Grid>
    </Box>
  );
}

export default ProjectInfo;
