import React from 'react';
import { FileDownload as FileDownloadIcon, PictureAsPdf as PdfIcon, AudioFile as AudioIcon, Videocam as VideoIcon } from '@mui/icons-material';

// Utility function to get file thumbnail or icon based on file type
const GetFileThumbnail = ({fileType, fileUrl}) => {
  // Check if it's an image (JPEG, PNG, GIF, etc.)
  if (fileType?.includes('image')) {
    return <img src={fileUrl} alt="file-thumbnail" style={{ width: '100px', height: '50px', objectFit: 'cover' }} />;
  }

  // Check if it's a PDF
  if (fileType === 'application/pdf') {
    return <PdfIcon style={{ fontSize: '50px', color: '#FF6347' }} />;
  }

  // Check if it's an audio file (MP3, WAV, etc.)
  if (fileType?.includes('audio')) {
    return <AudioIcon style={{ fontSize: '50px', color: '#FF6347' }} />;
  }

  // Check if it's a video file (MP4, AVI, MOV, etc.)
  if (fileType?.includes('video')) {
    return <VideoIcon style={{ fontSize: '50px', color: '#FF6347' }} />;
  }

  
};

export default GetFileThumbnail;
