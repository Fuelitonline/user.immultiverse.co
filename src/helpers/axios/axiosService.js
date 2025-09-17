// import axios from 'axios';
// import axiosRetry from 'axios-retry';
// import { server_url } from '../../utils/server';
// import CryptoJS from 'crypto-js';

// const apiClient = axios.create({
//   baseURL: server_url,
//   timeout: 150000, // 10 seconds timeout
// });

// axiosRetry(apiClient, {
//   retries: 1, // Number of retries
//   retryDelay: (retryCount) => retryCount * 10000, // Delay between retries (in milliseconds)
//   retryCondition: (error) => {
//     return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
//            (error.response && error.response.status >= 500);
//   },
// });

// // Request Interceptor
// apiClient.interceptors.request.use(
//   (config) => {
//     const tokenData = localStorage.getItem('authToken');
//     if (tokenData) {
//       config.headers.Authorization = `Bearer ${tokenData}`;
//     } else {
//       console.warn('No valid token found or decryption failed');
//     }

//     return config;
//   },
//   (error) => {
//     console.error('Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response Interceptor
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     console.error('Response Error:', error);
//     return Promise.reject(error);
//   }
// );

// export default apiClient;




import axios from 'axios';
import axiosRetry from 'axios-retry';
import { server_url } from '../../utils/server';

const apiClient = axios.create({
  baseURL: server_url,
  timeout: 15000,
  withCredentials: true // 🔑 include cookies in requests
});

axiosRetry(apiClient, {
  retries: 1,
  retryDelay: (retryCount) => retryCount * 10000,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    (error.response && error.response.status >= 500)
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // No need for Authorization header if using cookie-based auth
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;

