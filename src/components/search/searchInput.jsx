import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

// Create a styled TextField with custom styles
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none', // Remove border
    },
    '&:hover fieldset': {
      border: 'none', // Remove border on hover
    },
    '&.Mui-focused fieldset': {
      border: 'none', // Remove border on focus
    },
    borderRadius: '25px', // Add border radius
  },
  '& .MuiInputBase-input': {
    backgroundColor: 'white', // White background
    borderRadius: '25px', // Add border radius
    height: '10px',
    border: 'none', // Remove border
    color: 'black',
  },
}));

/**
 * A custom search input component that provides a simple search functionality.
 * @param {function} onChange - A callback function to be called when the search input value changes.
 * @returns {React.ReactElement} - A custom search input element with a search icon.
 */
function SearchInput({ onChange }) {
  const [value, setValue] = useState('');
  const [valuesList, setValuesList] = useState([]);

  // Handle change event
  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
  };

  // Handle key press event
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault(); // Prevent default behavior
      if (value.trim()) {
        const trimmedValue = value.trim();
        setValuesList((prev) => [...prev, trimmedValue]);
        setValue(''); // Clear input
        if (onChange) {
          onChange([...valuesList, trimmedValue]); // Call onChange with updated list
        }
      }
    }
  };
  const extractKeywordsFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const keywords = urlParams.get('keyword');
    return keywords ? keywords.split(',').map((keyword) => decodeURIComponent(keyword)) : [];
  };

  // Extract the keywords on component mount
  useEffect(() => {
    const keywordsFromURL = extractKeywordsFromURL();

    setValuesList(keywordsFromURL); // Set the extracted keywords to state
  }, []);
  // Remove a value from the list
  const handleRemove = (itemToRemove) => {
    const updatedList = valuesList.filter((item) => item !== itemToRemove);
    setValuesList(updatedList);
    if (onChange) {
      onChange(updatedList); // Call onChange with updated list
    }
  };

  return (
    <div>
      <CustomTextField
        variant="outlined"
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        fullWidth
        InputProps={{
          sx: {
            bgcolor: 'white',
            color: 'black',
          },
          
          endAdornment: (
            <Box 
              mt={0} 
              sx={{ 
                display: 'flex', 
                gap: '4px', 
                padding: '0.7px',
                minWidth: '150px',
                overflowX: 'auto',
              }}
            >
              {valuesList.map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '2px 4px',
                    borderRadius: '4px', 
                    marginBottom: '4px',
                  }}
                >
                  <Typography variant="body2">
                    {item}
                  </Typography>
                  <IconButton 
                    onClick={() => handleRemove(item)} 
                    size="small" 
                    aria-label="remove"
                  >
                    <CancelIcon fontSize="small" sx={{ color: 'red' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ),
        }}
      />
    </div>
  );
}

export default SearchInput;
