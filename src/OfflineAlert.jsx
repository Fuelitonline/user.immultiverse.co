import React, { useState, useEffect } from 'react';

/**
 * Component that displays an alert when the user is offline.
 * 
 * @returns {React.ReactElement|null} - The OfflineAlert component or null if online.
 */
const OfflineAlert = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {


    /**
     * Handler for the online event.
     * 
     * @returns {void}
     */
    const handleOnline = () => {
      setIsOnline(true);
    };

    /**
     * Handler for the offline event.
     * 
     * @returns {void}
     */
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
 
    };
  }, []);


  if (isOnline) return null; // Don’t show alert if online

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: '#e02d36', color: 'white', padding: '10px', textAlign: 'center', zIndex:99999999 , fontFamily:'sans-serif'}}>
      <p>You are offline. Please check your internet connection.</p>
    </div>
  );
};

export default OfflineAlert;
