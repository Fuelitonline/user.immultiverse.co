import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Snackbar, CircularProgress, Typography, Button } from '@mui/material';
import { usePost } from '../../hooks/useApi';

const FileUpload = forwardRef(({ onUploadSuccess }, ref) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { mutate: postData, isLoading: isLoadingPost, error: postError } = usePost('/file/upload');
 
 

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file =>
      ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg','video/quicktime'].includes(file.type)
    );

    if (validFiles.length + files.length > 10) {
      alert('You can only upload a maximum of 10 files.');
      return;
    }

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await postData(formData);
      setSnackbarMessage('Files uploaded successfully!');
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbarMessage('Error uploading files.');
    } finally {
      setUploading(false);
      setFiles([]);
    }

    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <input
      accept="image/jpeg, image/png, video/mp4, audio/mpeg, video/quicktime"
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        multiple
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Typography variant="body1" component="span" style={{ cursor: 'pointer', color: 'blue' }}>
          Choose Files
        </Typography>
      </label>
      
      {files.length > 0 && (
        <div>
          {files.map((file, index) => (
            <div key={index} style={{ marginTop: '10px' }}>
              <Typography variant="body1">{file.name}</Typography>
              {file.type.startsWith('image/') && (
                <img src={URL.createObjectURL(file)} alt={file.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />
              )}
              {file.type.startsWith('video/') && (
                <video controls style={{ maxWidth: '200px', maxHeight: '200px' }}>
                  <source src={URL.createObjectURL(file)} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              )}
              {file.type.startsWith('audio/') && (
                <audio controls>
                  <source src={URL.createObjectURL(file)} type={file.type} />
                  Your browser does not support the audio tag.
                </audio>
              )}
            </div>
          ))}
        </div>
      )}
      
      {uploading || isLoadingPost ? (
        <CircularProgress size={24} />
      ) : (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      )}
      <Button onClick={handleUpload}>upload</Button>
      {postError && <Typography color="error">Error: {postError.message}</Typography>}
    </div>
  );
});

export default FileUpload;
