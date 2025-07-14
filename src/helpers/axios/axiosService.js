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