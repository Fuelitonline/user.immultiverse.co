import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import Confetti from "react-confetti";
import ReactHowler from "react-howler";
import sound from "./assets/images/birthDay.mp3"
import { usePost } from "./hooks/useApi";
// Online Pataka Sound URL (using a free sound URL)
const patakaSoundURL = "https://www.soundjay.com/button/beep-07.wav"; // You can replace this URL with a pataka sound URL

const Birthday = ({ events }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [celebrate, setCelebrate] = useState(false);
  const [playSound, setPlaySound] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [balloons, setBalloons] = useState([]);
  const [birthdayMessage, setBirthdayMessage] = useState(""); // State for random birthday message
  const {mutate: postEvent} = usePost('/events/send-message')
  // Fetch a random quote for the birthday wish
  useEffect(() => {
    const fetchBirthdayMessage = async () => {
      try {
        const response = await fetch("https://api.quotable.io/random");
        const data = await response.json();
        setBirthdayMessage(data.content);
      } catch (error) {
        console.error("Error fetching birthday message:", error);
        setBirthdayMessage("Wishing you all the best on your special day!");
      }
    };
    fetchBirthdayMessage();
  }, []);

  // Handle mouse movement for follow effect
  const handleMouseMove = (e) => {
    const { clientX: x, clientY: y } = e;
    setMousePosition({ x, y });
  };

  // Handle Celebrate Button Click
  const handleCelebrate = () => {
   const  employeeIds = events.map((event) => event.employeeId);
    const res = postEvent({employeeIds})
    setCelebrate(true);
    setPlaySound(true);
    setShowConfetti(true);
    setBalloons(generateBalloons());
    setTimeout(() => setShowConfetti(false), 15000);
  };

  // Add event listener for mousemove
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Function to generate balloons for animation
  const generateBalloons = () => {
    const numberOfBalloons = 20;
    const balloonsArray = [];
    for (let i = 0; i < numberOfBalloons; i++) {
      const xPosition = Math.random() * 100;
      const animationDuration = Math.random() * 4 + 5;
      balloonsArray.push({ xPosition, animationDuration });
    }
    return balloonsArray;
  };

  // Calculate dynamic width and height based on content
  const cardWidth = events?.length > 2 ? '450px' : '400px';
  const cardHeight = events?.length * 70 + 250; // Adjust height based on the number of events

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh", // Ensure full height of the screen
        backgroundColor: "transparent", // Set background of outer box to transparent
      }}
    >
      <Box
        sx={{
          position: "absolute", // Make sure confetti and balloons don't affect card layout
          width: "100%",
          height: "100vh",
          zIndex: 999999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Celebration Confetti */}
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} background="transparent"/>
        )}

        {/* Balloons Animation */}
        {balloons.map((balloon, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              bottom: 0,
              left: `${balloon.xPosition}%`,
              animation: `balloonAnimation ${balloon.animationDuration}s ease-in-out infinite`,
              willChange: "transform, opacity",
              backgroundColor: "transparent",
              opacity: 1,
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "50px",
                height: "70px",
                backgroundColor: "rgb(255, 69, 0)", // Red balloons
                borderRadius: "50%",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              }}
            />
          </Box>
        ))}

        <Card sx={{ ...cardStyle, width: cardWidth, height: cardHeight }}>
          <CardContent>
            <Typography
              variant="h3"
              align="left"
              sx={{
                fontFamily: "Pacifico, sans-serif",
                color: "#000",
                fontSize:'1.5rem',
                animation: "fadeIn 1s ease-in-out",
              }}
            >
              🎉 Happy Birthday,
              {events?.length > 0 && (
                <>
                  {events.map((event, index) => {
                    // If it's the last item in the array, don't add a comma
                    const isLast = index === events.length - 1;
                    const separator = isLast ? " and " : ", ";
                    return (
                      <span key={index}>
                        {event.name}
                        {index < events.length - 1 && <span>{separator}</span>}
                      </span>
                    );
                  })}
                </>
              )}
              ! 🎉
            </Typography>

            <Typography
              variant="h5"
              align="center"
              sx={{
                color: "black",
                marginTop: 2,
                animation: "fadeIn 2s ease-in-out",
              }}
            >
              {birthdayMessage}
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{
                color: "black",
                marginTop: 1,
                fontWeight: "bold",
                fontStyle: "italic",
              }}
            >
              Fun Fact:
              {events?.length > 0 && (
                <>
                  {events.map((event, index) => {
                    const isLast = index === events.length - 1;
                    const separator = isLast ? " and " : ", ";
                    const age =
                      new Date().getFullYear() -
                      new Date(event.date).getFullYear();

                    return (
                      <span key={index}>
                        {event.name} is {age} years old{!isLast && separator}
                      </span>
                    );
                  })}
                </>
              )}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              sx={{
                marginTop: 3,
                display: "block",
                width: "100%",
                background: "linear-gradient(45deg, #f06, #4a90e2)",
                fontWeight: "bold",
                "&:hover": {
                  transform: "scale(1.1)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
              onClick={handleCelebrate}
            >
              Celebrate Now!
            </Button>
          </CardContent>
        </Card>

        {/* Follow Effect (Floating Emoji) */}
        <FollowText mousePosition={mousePosition} />

        {/* Celebration Sound (Pataka) */}
        {playSound && (
          <ReactHowler
            src={sound}
            
            playing={true}
            volume={1.0}
            onEnd={() => setPlaySound(false)} // Stop sound after it ends
          />
        )}

        {/* Inline CSS for Animations */}
        <style>
          {`
            @keyframes fadeIn {
              0% {
                opacity: 0;
                transform: translateY(10px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }

            /* Balloon Animation */
            @keyframes balloonAnimation {
              0% {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translateY(-500px) scale(1.5);
                opacity: 0;
              }
            }

          `}
        </style>
      </Box>
    </Box>
  );
};

// FollowText Component for Mouse Follow Animation
const FollowText = ({ mousePosition }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: mousePosition.y,
        left: mousePosition.x,
        pointerEvents: "none",
        color: "#fff",
        fontSize: "2rem",
        fontFamily: "Pacifico, sans-serif",
        userSelect: "none",
      }}
    >
      🎈
    </Box>
  );
};

const cardStyle = {
  borderRadius: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.9)", // Set Card's background to be non-transparent
  color: "#333",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
};

export default Birthday;
