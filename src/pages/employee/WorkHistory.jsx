import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGet } from "../../hooks/useApi";
import { useParams } from "react-router-dom";
import {
  Grid,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  LinearProgress,
  Typography,
  Zoom,
  Switch,
  Paper
} from "@mui/material";
import { Box, styled } from "@mui/system";
import { ArrowBack, ArrowForward, Close, Download } from "@mui/icons-material";
import Locations from "../Profile/locationTracking/Locations";
const AnimatedSwitch = styled(Switch)(({ theme , active}) => ({
  width: active ? 70 : 120, // Custom width for the switch
  height: 30, // Custom height for the switch
  padding: 0, // Remove padding
  borderRadius: 50, // Fully rounded corners
  position: 'relative', // For positioning the label inside the switch
  transition: 'all 0.3s ease', // Smooth transition

  '& .MuiSwitch-switchBase': {
    padding: 4,
    borderRadius: '50%',
    '&.Mui-checked': {
      transform: 'translateX(40px)', // Thumb movement when checked
      boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)', // Shadow when checked
    },
    '&.MuiSwitch-thumb': {
      width: 38, // Thumb size
      height: 30, // Thumb size
      backgroundColor: theme.palette.common.white, // Thumb color
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', // Shadow effect on the thumb
      transition: 'all 0.3s ease', // Smooth transition on thumb movement
    },
  },

  '& .MuiSwitch-track': {
    borderRadius: 50, // Rounded track
    backgroundColor: theme.palette.grey[400], // Default track color
    boxShadow: 'inset 0px 0px 6px rgba(0, 0, 0, 0.1)', // Inner shadow effect
    transition: 'background-color 0.3s ease', // Smooth background transition
    '&.Mui-checked': {
      backgroundColor: theme.palette.primary.main, // Track color when checked
      boxShadow: 'inset 0px 0px 8px rgba(0, 0, 0, 0.2)', // Stronger inner shadow when checked
    },
  },
}));
// Function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Custom Progress Bar with Gradient
const CustomLinearProgress = ({ value }) => {
  return (
    <Box sx={{ position: "relative", width: "80%", margin: "0 auto" }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 15,
          borderRadius: 8,
          backgroundColor: "#e0e0e0",
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(90deg, #4caf50, #81c784)",
          },
        }}
      />
      <Typography
        sx={{
          position: "absolute",
          top: -1,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "12px",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {`${Math.round(value)}%`}
      </Typography>
    </Box>
  );
};

function WorkHistory() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [displayedFiles, setDisplayedFiles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [nextFiles, setNextFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewLocation, setViewLocation] = useState(false);  // Track the toggle state
  const handleToggleView = () => {
    setViewLocation((prev) => !prev); // Toggle between true/false
  };
  const { data, isLoading } = useGet("employee/employee-location-get", {
    employeeId : id,
    date : selectedDate
  });

 
  const observer = useRef();
  const ITEMS_PER_PAGE = 8; // Number of images to load per "page"

  const { data: trackingData, loading: apiLoading } = useGet(
    "/employee/tracking-get",
    {
      employeeId: id,
      date: selectedDate,
    }
  );

  const { data: progressData } = useGet(
    "/emplyoee/daily-work/work-progress-get-date-wise",
    {
      employeeId: id,
      date: selectedDate,
    }
  );

  const lastImageElementRef = useCallback(
    (node) => {
      if (loading || apiLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, apiLoading, hasMore]
  );

  useEffect(() => {
    if (progressData?.data) {
      setProgress(progressData?.data?.process);
    }
  }, [progressData]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setDisplayedFiles([]);
    if (trackingData?.data?.data) {
      const newFiles = trackingData?.data?.data[0]?.files || [];
      setFiles(newFiles);
      setHasMore(newFiles.length > ITEMS_PER_PAGE);
    } else {
      setFiles([]);
      setHasMore(false);
    }
    setLoading(false);
  }, [trackingData, selectedDate]);

  useEffect(() => {
    if (files.length > 0) {
      const newDisplayedFiles = files.slice(0, page * ITEMS_PER_PAGE);
      setDisplayedFiles(newDisplayedFiles);
      setHasMore(files.length > newDisplayedFiles.length);
    }
  }, [files, page]);

  const handleImageClick = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
    setNextFiles(files.slice(index + 1, index + 7));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage("");
    setCurrentImageIndex(null);
  };

  const handleNextImage = () => {
    if (currentImageIndex < files.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(files[newIndex]);
      setNextFiles(files.slice(newIndex + 1, newIndex + 7));
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(files[newIndex]);
      setNextFiles(files.slice(newIndex + 1, newIndex + 7));
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = selectedImage;
    link.download = `screenshot-${currentImageIndex + 1}.jpg`;
    link.click();
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#f5f7fa" , height: "80vh"}}>
      <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomLinearProgress value={progress} />
        </Grid>
        <Grid
  item
  xs={12}
  md={3}
  container
  spacing={2}
  alignItems="center"
  justifyContent="center"
  
>

  <Grid item xs={12} sm={6}>
   
  <Box sx={{ position: 'relative', display: 'inline-block', backgroundColor: 'white', borderRadius: '50px', marginTop: '0px', marginLeft: '10px' }}>
      <AnimatedSwitch
        checked={viewLocation}
        onChange={handleToggleView}
        color="primary"
        active = {viewLocation}

      />
      <Typography
        variant="body1"
        sx={{
          position: 'absolute',
          top: '50%',
          left: viewLocation ? '30%' : '60%',
          transform: 'translate(-50%, -50%)', // Center the text
          fontSize: '12px',
          fontWeight: 'bold',
          color: viewLocation ? 'white' : 'black',
          pointerEvents: 'none', // Disable interaction with text
        }}
      >
        {viewLocation ? 'Map' : 'Screenshots'}
      </Typography>
    </Box>
 
  </Grid>
</Grid>
      </Grid>
     
      {loading || apiLoading ? (
           <Typography variant="h6" align="center">
           View Location:
         </Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ height: "70vh", overflow: "auto" }}>
          {viewLocation ? (
             <Locations selectedDate={selectedDate} data={data} isLoading={isLoading}/>
          ) : (
            <Grid container spacing={3} sx={{ height: "70vh", overflow: "auto" }}>
              {displayedFiles?.map((file, index) => {
                const isLastElement = displayedFiles.length === index + 1;
                return (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Zoom in={true} timeout={500}>
                      <Card
                        ref={isLastElement ? lastImageElementRef : null}
                        sx={{
                          height: "20vh",
                          borderRadius: "16px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="100%"
                          image={file}
                          alt={`Screenshot ${index + 1}`}
                          sx={{ objectFit: "cover", cursor: "pointer" }}
                          onClick={() => handleImageClick(file, index)}
                        />
                      </Card>
                    </Zoom>
                  </Grid>
                );
              })}
            </Grid>
          )}
          </Grid>


          {loading && hasMore && (
            <Typography variant="h6" align="center" color="textSecondary" sx={{ mt: 2 }}>
              Loading more...
            </Typography>
          )}

          <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="lg"
          
          >
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ position: "relative" }}>
                <img
                  src={selectedImage}
                  alt="Full screen"
                  style={{ width: "100%", height: "auto", borderRadius: "12px" }}
                />
              </Box>
              <Grid container spacing={2} sx={{ p: 2, maxHeight: "22vh", overflow: "auto" }}>
                {nextFiles?.map((file, index) => (
                  <Grid item xs={4} sm={3} md={2} key={index}>
                    <Card
                      sx={{
                        height: "15vh",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        "&:hover": { boxShadow: "0 4px 15px rgba(0,0,0,0.2)" },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="100%"
                        image={file}
                        alt={`Screenshot ${index + 1}`}
                        sx={{ objectFit: "cover", cursor: "pointer" }}
                        onClick={() => handleImageClick(file, currentImageIndex + index + 1)}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: "#fafafa" }}>
              <Button
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
                startIcon={<ArrowBack />}
                sx={{
                  background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                  color: "#fff",
                  borderRadius: "30px",
                  px: 3,
                  py: 1,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  "&:hover": { background: "linear-gradient(45deg, #1565c0, #1976d2)" },
                  "&:disabled": { background: "#bdbdbd" },
                }}
              >
                Prev
              </Button>
              <Button
                onClick={handleNextImage}
                disabled={currentImageIndex === files.length - 1}
                endIcon={<ArrowForward />}
                sx={{
                  background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                  color: "#fff",
                  borderRadius: "30px",
                  px: 3,
                  py: 1,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  "&:hover": { background: "linear-gradient(45deg, #1565c0, #1976d2)" },
                  "&:disabled": { background: "#bdbdbd" },
                }}
              >
                Next
              </Button>
              <Button
                onClick={handleDownload}
                startIcon={<Download />}
                sx={{
                  background: "linear-gradient(45deg, #4caf50, #81c784)",
                  color: "#fff",
                  borderRadius: "30px",
                  px: 3,
                  py: 1,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  "&:hover": { background: "linear-gradient(45deg, #388e3c, #4caf50)" },
                }}
              >
                Download
              </Button>
              <Button
                onClick={handleClose}
                startIcon={<Close />}
                sx={{
                  background: "linear-gradient(45deg, #d32f2f, #f44336)",
                  color: "#fff",
                  borderRadius: "30px",
                  px: 3,
                  py: 1,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  "&:hover": { background: "linear-gradient(45deg, #b71c1c, #d32f2f)" },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

export default WorkHistory;