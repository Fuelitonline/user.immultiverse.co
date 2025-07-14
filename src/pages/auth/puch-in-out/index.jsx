// import React, { useState, useRef, useEffect } from 'react';
// import { Button } from 'reactstrap';

// const ScreenRecording = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const videoRef = useRef(null);
//   const [screenshot, setScreenshot] = useState(null);  // To store the base64 screenshot
//   const [screenshotInterval, setScreenshotInterval] = useState(null);

//   // Function to start screen recording
//   const startRecording = async () => {
//     try {
//       // Check if the app has screen capture access
//       const hasAccess = await window.electronApi.main.getScreenAccess();
//       if (!hasAccess) {
//         await window.electronApi.main.openScreenSecurity();
//         return;
//       }

//       // Get screen sources (screens/windows available for capture)
//       const sources = await window.electronApi.main.getScreenSources();
//       if (sources.length === 0) {
//         alert('No screen sources available');
//         return;
//       }

//       // Select the first available source for screen capture
//       const selectedSource = sources[0];

//       // Request the screen media stream
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           mandatory: {
//             chromeMediaSource: 'desktop',
//             chromeMediaSourceId: selectedSource.id,
//           },
//         },
//       });

//       // Play the video stream in the video element
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.onloadedmetadata = () => {
//           videoRef.current.play();
//         };
//       }

//       setIsRecording(true);

//       // Set up the interval to capture a screenshot every 30 seconds
//       const intervalId = setInterval(() => {
//         captureScreenshot();
//       }, 30000); // 30000 milliseconds = 30 seconds
//       setScreenshotInterval(intervalId);
//     } catch (error) {
//       console.error('Error starting recording:', error);
//     }
//   };

//   // Function to stop the recording
//   const stopRecording = () => {
//     if (videoRef.current) {
//       const stream = videoRef.current.srcObject;
//       if (stream) {
//         const tracks = stream.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//       videoRef.current.srcObject = null;
//     }

//     setIsRecording(false);

//     // Clear the screenshot interval when stopping the recording
//     if (screenshotInterval) {
//       clearInterval(screenshotInterval);
//       setScreenshotInterval(null);
//     }
//   };

//   // Function to capture a screenshot and update the state
//   const captureScreenshot = async () => {
//     try {
//       const screenshotBase64 = await window.electronApi.main.captureScreenshot();
//       console.log('Captured screenshot:', screenshotBase64);
//       setScreenshot(screenshotBase64); // Update the state with the base64 screenshot

//       // Send the screenshot to the server using a POST request
//       await sendScreenshotToServer(screenshotBase64);
//     } catch (error) {
//       console.error('Error capturing screenshot:', error);
//     }
//   };

//   // Function to send the screenshot to the server
//   const sendScreenshotToServer = async (screenshotBase64) => {
//     try {
//       const response = await fetch('https://yourserver.com/upload', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ screenshot: screenshotBase64 }),
//       });

//       if (response.ok) {
//         console.log('Screenshot sent to server successfully!');
//       } else {
//         console.error('Failed to send screenshot to server');
//       }
//     } catch (error) {
//       console.error('Error sending screenshot to server:', error);
//     }
//   };

//   return (
//     <div>
//       <Button color="primary" onClick={startRecording} disabled={isRecording}>
//         Start Recording
//       </Button>
//       <Button color="danger" onClick={stopRecording} disabled={!isRecording}>
//         Stop Recording
//       </Button>

//       {/* Video element for screen recording */}
//       <video ref={videoRef} width="640" height="480" autoPlay muted></video>

//       {/* Overlay for screenshot */}
//       {screenshot && (
//         <div
//           style={{
//             position: 'absolute',
//             top: '20px',
//             left: '20px',
//             zIndex: 10,
//             border: '2px solid red',
//           }}
//         >
//           <img
//             src={screenshot?.base64Image}
//             alt="Screenshot"
//             width="500"
//             height="550"
//             style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ScreenRecording;
