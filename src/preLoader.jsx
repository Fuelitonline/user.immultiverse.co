// Preloader.js
import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import video from '../public/Loading/intro.mp4'

const Preloader = ({ onVideoEnd }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const videoElement = videoRef.current;

        const handleVideoEnd = () => {
            if (onVideoEnd) {
                onVideoEnd(); // Call the function passed as prop when the video ends
            }
        };

        if (videoElement) {
            videoElement.addEventListener('ended', handleVideoEnd);
        }

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('ended', handleVideoEnd);
            }
        };
    }, [onVideoEnd]);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                zIndex: 9999,
                overflow: 'hidden',
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                muted // Keep muted false
                loop={false} // Set loop to false to play it only once
                style={{
                    width: '12%',
                    height: '20%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: '48%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </Box>
    );
};

export default Preloader;
