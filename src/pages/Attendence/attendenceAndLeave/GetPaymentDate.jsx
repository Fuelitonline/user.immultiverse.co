import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'; 
function GetPaymentDate({ paymentDate, date,status , selectedMonth, selectedYear}) {
  // State to handle whether the user is hovering over the block
  const [isHovered, setIsHovered] = useState(false);
 
  const [payment, setPayment] = useState(null)
  // Format paymentDate to YYYY-MM-DD
  
 
  // Handler to show/hide additional details on hover
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <>
      {date == paymentDate-1 && (
        <div
          style={{
            padding:'5px 8px',
            backgroundColor: status ? '#52eb66' : '#f53b4d', // Green color block
            color: status ? 'black' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '5px',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {
            status ? 'Paid' : 'Remaining'
          }
          
          {/* Show details on hover */}
          {isHovered && (
            <div
              style={{
                position: 'absolute',
                bottom: '60px', // Position the detail block above the color block
                backgroundColor: '#333',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                width: '150px',
                textAlign: 'center',
                zIndex: 1,
              }}
            >
              <p>Payment For: {`${selectedMonth} - ${selectedYear}`}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

GetPaymentDate.propTypes = {
    paymentDate: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.bool.isRequired,
    selectedMonth: PropTypes.string.isRequired,
    selectedYear: PropTypes.string.isRequired,
  };
export default GetPaymentDate;
