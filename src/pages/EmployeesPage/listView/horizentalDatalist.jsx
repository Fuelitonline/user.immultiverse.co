import React, { useEffect, useState } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Grid,
  ListItem,
  ListItemText,
  styled,
  List,
  Typography,
  IconButton,
} from '@mui/material';
import GlassEffect from '../../theme/glassEffect'; // Ensure this path is correct
import { ArrowBack, RemoveRedEye } from '@mui/icons-material';
import ProjectInfo from './projectInfo';
import { Link } from 'react-router-dom';
import { useGet } from '../../hooks/useApi';
import { useDispatch, useSelector } from 'react-redux';

// Styled ListItem component
const ListItemStyled = styled(ListItem)(({ theme, active }) => ({
  backgroundColor: active ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
  height: active ? '100px' : 'auto',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: active ? '4px' : '0',
    backgroundColor: '#155ed4',
    transition: 'width 0.3s',
  },
}));

function HorizentalDatalist() {
  const [datas, setData] = useState([]);
  const [dataTypes, setDataTypes] = useState(["Project's List", "Leads's List"]);
  const [selectedValue, setSelectedValue] = useState("Project's List");
  const [selectedIndex, setSelectedIndex] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [projectDetails, setProjectDetails] = useState({});
  const dispatch = useDispatch();

  const { data: projects, loading, error, refetch } = useGet('/project/all', {}, {}, { queryKey: 'projects' });
  const {update} = useSelector((state) => state.projects);
  useEffect(() => {
    if (projects?.data?.message[0]) {

      setData(projects.data.message[0]);
    }
    if (update) {
      refetch();
      dispatch({
        type: "PROJECT_UPDATE",
        payload: false
      })
    }
  }, [projects, update]);
  

  useEffect(() => {
    if (datas.length > 0) {
      setSelectedIndex(datas[0]._id || "");
   
    }
    
  }, [datas]);

  const handleChange = (event, value) => {
    setSelectedValue(value);
    if (value === "Project's List") {
      setData(projects?.data?.message[0] || []);
      dispatch({ type: "TOGGLE_PROJECT_LEAD", payload: false });
    } else if (value === "Leads's List") {
      dispatch({ type: "TOGGLE_PROJECT_LEAD", payload: true });
      setData([{
        id: 'LEAD001',
        name: "Lead 1",
      }, {
        id: 'LEAD002',
        name: "Lead 2",
      }, {
        id: 'LEAD003',
        name: "Lead 3",
      }, {
        id: 'LEAD004',
        name: "Lead 4",
      }]);
    }
  };

  const handleListItemClick = (id) => {
    setSelectedIndex(id);
  };

  const handleProjectView = (id) => {
    const project = datas.find((item) => item._id === id);
    setProjectDetails(project);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedIndex(""); // Optional: clear selection when going back to list
  };

  return (
    <>
      {showDetails && (
        <Box
          width={"600px"}
          sx={{
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "flex-start",
            mb: 0,
            mt: -4,
          }}
        >
          <Link
            to="/projects"
            style={{
              color: "#1675f2",
              zIndex: 1000,
              textDecoration: "none",
              alignItems: "center",
              display: "flex",
              gap: 5,
            }}
            onClick={handleBackToList}
          >
            <ArrowBack /> Back to List
          </Link>
          <Typography
            variant="h5"
            sx={{
              fontSize: {
                xs: "16px",
                sm: "18px",
                md: "25px",
                textAlign: "left",
                fontFamily: 'sans-serif'
              },
            }}
          >
            {projectDetails.projectName} {`(${projectDetails.techStack})`}
          </Typography>
        </Box>
      )}
      <GlassEffect.GlassContainer>
        {showDetails ? (
          <Box
            width={"100%"}
            sx={{
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "flex-start",
              height: "100vh",
            }}
          >
            <ProjectInfo data={projectDetails} />
          </Box>
        ) : (
          <Box
            sx={{
              maxWidth: "100%",
              minWidth: "25%",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Grid container spacing={2} sx={{ padding: "10px", flexGrow: 0 }}>
              <Grid item xs={12}>
                <Autocomplete
                  sx={{ width: "100%" }}
                  value={selectedValue}
                  onChange={handleChange}
                  options={dataTypes}
                  disableClearable
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      inputProps={{
                        ...params.inputProps,
                        readOnly: true,
                        style: { fontSize: "18px", backgroundColor: "white" },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { border: "none" },
                          "&:hover fieldset": { border: "none" },
                          backgroundColor: "white",
                          width: "100%",
                        },
                      }}
                    />
                  )}
                  ListboxProps={{
                    sx: {
                      backgroundColor: "white",
                      "& .MuiAutocomplete-option": {
                        backgroundColor: "white",
                        "&.Mui-selected": {
                          backgroundColor: "white",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                        },
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <hr style={{ color: "grey" }} />
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <List sx={{ width: "100%", padding: 0, flexGrow: 1 }}>
                {datas.map((item) => (
                  <ListItemStyled
                    key={item._id || item.id}
                    button
                    selected={selectedIndex === (item._id || item.id)}
                    onClick={() => handleListItemClick(item._id || item.id)}
                    active={selectedIndex === (item._id || item.id)}
                    sx={{
                      width: "100%",
                      padding: "10px 16px",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    <Grid container spacing={0}>
                      <Grid item xs={12}>
                        <ListItemText>
                          <Typography
                            sx={{
                              fontSize:
                                selectedIndex === (item._id || item.id)
                                  ? "13px"
                                  : "12px",
                              color: "grey",
                              fontFamily: "monospace",
                            }}
                          >
                            {item.projectNum || item.id}
                          </Typography>
                        </ListItemText>
                      </Grid>
                      <Grid item xs={12}>
                        <ListItemText>
                          <Typography
                            sx={{
                              fontSize:
                                selectedIndex === (item._id || item.id)
                                  ? "18px"
                                  : "16px",
                              fontFamily: "sans-serif",
                              fontWeight: "350",
                            }}
                          >
                            {item.projectName || item.name}
                          </Typography>
                        </ListItemText>
                      </Grid>
                    </Grid>
                    {selectedIndex === (item._id || item.id) && (
                       <IconButton
                       sx={{
                         position: "absolute",
                         right: 0,
                         top: 0,
                         margin: "10px",
                       }}
                       onClick={() => handleProjectView(item._id || item.id)}
                     >
                       <RemoveRedEye sx={{ color: "#155ed4" }} />
                     </IconButton>
                    )}
                  </ListItemStyled>
                ))}
              </List>
            </Box>
          </Box>
        )}
      </GlassEffect.GlassContainer>
    </>
  );
}

export default HorizentalDatalist;
